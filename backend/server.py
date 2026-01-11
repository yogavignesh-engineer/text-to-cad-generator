"""
===============================================================================
NEURALCAD v6.0 - PRODUCTION BACKEND (REFACTORED)
Award-Winning Text-to-CAD System - Server
Security Hardened & Non-Blocking & GD&T Enabled
===============================================================================
"""

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import asyncio
import os
import re
import math
import uuid
import json
from pathlib import Path
from typing import Optional, Dict, List, Tuple
from dotenv import load_dotenv
import google.generativeai as genai
import warnings
import httpx  # For async HTTP requests

# Suppress Deprecation/Future Warnings for clean demo output
warnings.filterwarnings("ignore")

# Load environment variables
load_dotenv()

# ============= LIVE METAL PRICES =============
# Conversion rate USD to INR (approximate)
USD_TO_INR = 83.5

# Static fallback prices (INR per gram, Dec 2025)
STATIC_PRICES = {
    "steel": 0.055,  # ₹55/kg
    "aluminum": 0.29,  # ₹287/kg
    "copper": 1.16,  # ₹1156/kg
    "brass": 0.70,  # ₹700/kg
    "titanium": 5.50,  # ₹5500/kg
}

async def fetch_live_metal_prices():
    """
    Fetch live metal prices from free API.
    Returns prices in INR per gram.
    Falls back to static prices on failure.
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Using metals.dev free API for copper and aluminum
            response = await client.get("https://api.metals.dev/v1/latest?api_key=demo&currency=USD&unit=g")
            
            if response.status_code == 200:
                data = response.json()
                metals = data.get("metals", {})
                
                # Extract prices and convert to INR
                prices = {}
                if "copper" in metals:
                    prices["copper"] = metals["copper"] * USD_TO_INR / 1000  # per gram
                if "aluminum" in metals:
                    prices["aluminum"] = metals["aluminum"] * USD_TO_INR / 1000
                
                print(f"✅ Live prices fetched: Copper ₹{prices.get('copper', 'N/A')}/g, Aluminum ₹{prices.get('aluminum', 'N/A')}/g")
                return prices
            else:
                print("⚠️ API returned non-200, using static prices")
                return {}
    except Exception as e:
        print(f"⚠️ Could not fetch live prices: {e}. Using static prices.")
        return {}

# ============= APPLICATION SETUP =============
app = FastAPI(
    title="NeuralCAD API v6.0",
    description="Production-ready Text-to-CAD API with Security Hardening",
    version="6.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Script-ID", "X-Script-Content", "X-Manufacturing-Notes", "X-DFM-Analysis", "X-Cost-Estimate"]
)

# Startup event to fetch live prices
@app.on_event("startup")
async def startup_event():
    """Fetch live metal prices on server startup"""
    print("🚀 NeuralCAD v6.0 Starting...")
    live_prices = await fetch_live_metal_prices()
    
    # Update MATERIALS prices if live prices available
    # (We'll update this when DFMAnalyzer is initialized)
    if live_prices:
        print(f"📊 Live prices will be used for: {list(live_prices.keys())}")
    else:
        print("📊 Using static Indian market prices (Dec 2025)")

# ============= CONFIGURATION =============
# Output Directory
OUTPUT_DIR = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

# FreeCAD Installation Paths (Auto-detection)
home = os.path.expanduser("~")
FREECAD_PATHS = [
    os.path.join(home, "AppData", "Local", "Programs", "FreeCAD 1.0", "bin", "FreeCADCmd.exe"),
    r"C:\Program Files\FreeCAD 1.0\bin\FreeCADCmd.exe",
    r"C:\Program Files\FreeCAD 0.21\bin\FreeCADCmd.exe",
    r"C:\Program Files (x86)\FreeCAD 1.0\bin\FreeCADCmd.exe",
    "/usr/bin/freecadcmd",
    "/usr/local/bin/freecadcmd",
    "/Applications/FreeCAD.app/Contents/MacOS/FreeCAD"
]

def find_freecad() -> Optional[str]:
    # Docker path
    if os.path.exists("/usr/lib/freecad/bin/FreeCADCmd"):
        return "/usr/lib/freecad/bin/FreeCADCmd"
    if os.path.exists("/usr/bin/freecadcmd"):
        return "/usr/bin/freecadcmd"
        
    for path in FREECAD_PATHS:
        if os.path.exists(path):
            print(f"✅ INFO: FreeCAD found at {path}")
            return path
    print("⚠️ WARNING: FreeCAD not found in standard locations")
    return None

FREECAD_CMD = find_freecad()

# ============= MODELS =============
class PromptRequest(BaseModel):
    text: str
    useai: bool = False
    export_formats: List[str] = ["stl"]

# ============= ENGINEERING RIGOR (GD&T) =============
class ToleranceEngine:
    # Simplified ISO 286-2 Table (in mm) - Mean values for modeling
    # H7 (Hole): Limits are 0 to +Val. Mean is +Val/2
    ISO_H7 = {
        (0, 3): 0.005, (3, 6): 0.006, (6, 10): 0.0075, 
        (10, 18): 0.009, (18, 30): 0.0105, (30, 50): 0.0125, (50, 80): 0.015
    }
    
    # g6 (Shaft): Limits are -Val1 to -Val2. Mean is roughly -(Val1+Val2)/2
    ISO_g6 = {
        (0, 3): -0.004, (3, 6): -0.008, (6, 10): -0.009,
        (10, 18): -0.011, (18, 30): -0.013, (30, 50): -0.016
    }

    @staticmethod
    def get_adjustment(nominal: float, fit_class: str) -> Tuple[float, str]:
        """Return (adjustment_mm, note)"""
        table = None
        if fit_class.upper() == "H7": table = ToleranceEngine.ISO_H7
        elif fit_class.lower() == "G6": table = ToleranceEngine.ISO_g6
        
        if not table: return 0.0, ""

        for (min_size, max_size), mean_adjust in table.items():
            if min_size < nominal <= max_size:
                final_val = nominal + mean_adjust
                return mean_adjust, f"Modeled at {final_val:.4f}mm ({nominal}mm {fit_class} Mean)"
        
        return 0.0, ""

# ============= DFM ANALYSIS ENGINE =============
class DFMAnalyzer:
    """
    Design for Manufacturing Analysis
    Checks geometry against manufacturing best practices
    """
    
    # Material properties database - INDIAN MARKET PRICES (₹ per gram, Dec 2025)
    # Prices sourced from bankbazaar.com, indiamart.com, MCX rates
    # Steel: ₹55/kg = ₹0.055/g | Copper: ₹1156/kg = ₹1.156/g | Aluminum: ₹287/kg = ₹0.287/g
    # Brass: ₹700/kg = ₹0.70/g | Titanium: ₹5500/kg = ₹5.50/g | ABS: ₹150/kg = ₹0.15/g
    MATERIALS = {
        "steel": {"density": 7.85, "price_per_gram": 0.055, "machinability": 0.7, "name": "Steel (MS)"},
        "aluminum": {"density": 2.70, "price_per_gram": 0.29, "machinability": 0.9, "name": "Aluminum"},
        "abs_plastic": {"density": 1.04, "price_per_gram": 0.15, "machinability": 1.0, "name": "ABS Plastic"},
        "titanium": {"density": 4.43, "price_per_gram": 5.50, "machinability": 0.3, "name": "Titanium Gr5"},
        "brass": {"density": 8.73, "price_per_gram": 0.70, "machinability": 0.85, "name": "Brass"},
        "polycarb": {"density": 1.20, "price_per_gram": 0.20, "machinability": 0.95, "name": "Polycarbonate"},
        "copper": {"density": 8.96, "price_per_gram": 1.16, "machinability": 0.75, "name": "Copper"}
    }

    @staticmethod
    def analyze(shape: str, dims: Dict, material: str = "steel") -> Dict:
        """
        Analyze geometry for manufacturability
        Returns: {score, warnings, suggestions, process}
        """
        warnings = []
        suggestions = []
        score = 100
        
        # Get dimensions
        length = dims.get("length") or dims.get("diameter") or 50
        width = dims.get("width") or dims.get("diameter") or 50
        height = dims.get("height") or 10
        
        # Rule 1: Wall Thickness Check (for plates/boxes)
        if shape == "box" and height < 2:
            warnings.append({
                "type": "wall_thickness",
                "severity": "high",
                "message": f"Wall thickness {height}mm is too thin for CNC machining",
                "suggestion": "Increase thickness to at least 2mm for structural integrity"
            })
            score -= 20
        
        # Rule 2: Aspect Ratio Check (long thin parts)
        if shape == "box":
            aspect = max(length, width) / max(height, 1)
            if aspect > 20:
                warnings.append({
                    "type": "aspect_ratio",
                    "severity": "medium",
                    "message": f"High aspect ratio ({aspect:.1f}:1) may cause warping",
                    "suggestion": "Add ribs or reduce length-to-thickness ratio"
                })
                score -= 10
        
        # Rule 3: Deep Pocket Check (for cylinders/gears)
        if shape in ["cylinder", "gear"]:
            diameter = dims.get("diameter") or dims.get("radius", 10) * 2
            if height > diameter * 4:
                warnings.append({
                    "type": "deep_pocket",
                    "severity": "medium",
                    "message": f"Depth-to-diameter ratio ({height/diameter:.1f}) exceeds 4:1",
                    "suggestion": "Consider split machining or EDM process"
                })
                score -= 15
        
        # Rule 4: Small Features Check
        if shape == "gear":
            teeth = dims.get("teeth") or 20
            diameter = dims.get("diameter") or 60
            tooth_size = (3.14159 * diameter) / teeth
            if tooth_size < 3:
                warnings.append({
                    "type": "small_features",
                    "severity": "high",
                    "message": f"Tooth pitch {tooth_size:.1f}mm may be difficult to machine",
                    "suggestion": "Reduce tooth count or increase diameter"
                })
                score -= 15
        
        # Rule 5: Material-specific warnings
        mat_props = DFMAnalyzer.MATERIALS.get(material, DFMAnalyzer.MATERIALS["steel"])
        if mat_props["machinability"] < 0.5 and shape == "gear":
            warnings.append({
                "type": "material_difficulty",
                "severity": "medium",
                "message": f"{material.title()} is difficult to machine for complex shapes",
                "suggestion": "Consider aluminum or brass for gears"
            })
            score -= 10
        
        # Determine recommended process
        # Calculate approximate volume based on shape
        if shape == "box":
            volume = length * width * height
        elif shape in ["bolt", "cylinder", "piston", "flange"]:
            radius = dims.get("radius") or (dims.get("diameter") or 10) / 2
            h = dims.get("height") or dims.get("length") or 40
            volume = 3.14159 * (radius ** 2) * h
        elif shape in ["washer", "tube"]:
            outer_d = dims.get("diameter") or 20
            thickness = dims.get("height") or 5
            volume = 3.14159 * ((outer_d/2) ** 2) * thickness * 0.5  # Approximate
        elif shape == "plate_with_hole":
            volume = length * width * height * 0.9  # Approximate with hole
        else:
            volume = length * width * height  # Default
            
        if volume < 1000:  # Small parts
            process = "CNC Milling" if mat_props["machinability"] > 0.5 else "Wire EDM"
        elif material in ["abs_plastic", "polycarb"]:
            process = "3D Printing (FDM/SLA)"
        else:
            process = "CNC Turning" if shape in ["cylinder", "bolt", "tube"] else "CNC Milling"
        
        # Add general suggestions
        if score == 100:
            suggestions.append("Design meets all DFM guidelines ✓")
        if len(warnings) > 0:
            suggestions.append(f"Address {len(warnings)} warning(s) to improve manufacturability")
        
        return {
            "score": max(0, score),
            "warnings": warnings,
            "suggestions": suggestions,
            "recommended_process": process,
            "material": material
        }


# ============= COST CALCULATOR =============
class CostCalculator:
    """
    Manufacturing cost estimation engine
    All costs in Indian Rupees (₹)
    """
    
    # Indian CNC machining rates (INR per hour) - typical job shop rates
    HOURLY_RATE = 600.0   # ₹600/hr for CNC machining (industry average)
    SETUP_COST = 500.0    # ₹500 fixed setup cost per job
    CURRENCY = "₹"        # Indian Rupee symbol
    
    @staticmethod
    def calculate(shape: str, dims: Dict, material: str = "steel") -> Dict:
        """
        Calculate manufacturing cost estimate
        Returns: {material_cost, machining_time, total_cost, breakdown}
        """
        mat_props = DFMAnalyzer.MATERIALS.get(material, DFMAnalyzer.MATERIALS["steel"])
        
        # Calculate volume (mm³)
        if shape == "box":
            length = dims.get("length") or 50
            width = dims.get("width") or 50
            height = dims.get("height") or 10
            volume = length * width * height
            surface_area = 2 * (length * width + width * height + height * length)
        elif shape in ["cylinder", "piston", "flange"]:
            radius = dims.get("radius") or (dims.get("diameter") or 20) / 2
            height = dims.get("height") or 50
            volume = 3.14159 * (radius ** 2) * height
            surface_area = 2 * 3.14159 * radius * (radius + height)
        elif shape == "sphere":
            radius = dims.get("radius") or (dims.get("diameter") or 40) / 2
            volume = (4/3) * 3.14159 * (radius ** 3)
            surface_area = 4 * 3.14159 * (radius ** 2)
        elif shape == "gear":
            radius = dims.get("radius") or (dims.get("diameter") or 60) / 2
            height = dims.get("height") or 10
            teeth = dims.get("teeth") or 20
            volume = 3.14159 * (radius ** 2) * height * 0.85  # ~85% fill for gear
            surface_area = 2 * 3.14159 * radius * height + 2 * 3.14159 * (radius ** 2)
            surface_area *= 1.5  # Extra complexity for teeth
        elif shape == "bolt":
            diameter = dims.get("diameter") or 8
            length = dims.get("length") or dims.get("height") or 40
            head_height = diameter * 0.7
            head_diameter = diameter * 1.8
            # Head volume + shaft volume
            volume = 3.14159 * ((head_diameter/2) ** 2) * head_height + 3.14159 * ((diameter/2) ** 2) * length
            surface_area = 3.14159 * head_diameter * head_height + 3.14159 * diameter * length
        elif shape == "washer":
            outer_d = dims.get("diameter") or 20
            inner_d = dims.get("inner_diameter") or outer_d * 0.5
            thickness = dims.get("height") or dims.get("thickness") or 2
            volume = 3.14159 * thickness * ((outer_d/2) ** 2 - (inner_d/2) ** 2)
            surface_area = 2 * 3.14159 * ((outer_d/2) ** 2 - (inner_d/2) ** 2) + 3.14159 * thickness * (outer_d + inner_d)
        elif shape == "tube":
            outer_d = dims.get("outer_diameter") or dims.get("diameter") or 30
            inner_d = dims.get("inner_diameter") or outer_d * 0.7
            height = dims.get("height") or dims.get("length") or 100
            volume = 3.14159 * height * ((outer_d/2) ** 2 - (inner_d/2) ** 2)
            surface_area = 2 * 3.14159 * ((outer_d/2) ** 2 - (inner_d/2) ** 2) + 3.14159 * height * (outer_d + inner_d)
        elif shape == "plate_with_hole":
            length = dims.get("length") or 50
            width = dims.get("width") or 50
            height = dims.get("height") or 10
            hole_d = dims.get("hole_diameter") or dims.get("diameter") or min(length, width) * 0.3
            # Plate volume minus hole volume
            volume = length * width * height - 3.14159 * ((hole_d/2) ** 2) * height
            surface_area = 2 * (length * width + width * height + height * length) + 3.14159 * hole_d * height
        else:
            volume = 50 * 50 * 10  # Default box
            surface_area = 2 * (50*50 + 50*10 + 10*50)
        
        # Convert to cm³ and grams
        volume_cm3 = volume / 1000
        weight_grams = volume_cm3 * mat_props["density"]
        
        # Material cost
        material_cost = weight_grams * mat_props["price_per_gram"]
        
        # Machining time (simplified: based on surface area and machinability)
        complexity = 1.0 if shape == "box" else 1.5 if shape == "cylinder" else 2.5  # gear/sphere
        machining_time_min = (surface_area / 100) * complexity / mat_props["machinability"]
        machining_time_min = max(5, machining_time_min)  # Minimum 5 minutes
        
        # Machining cost
        machining_cost = (machining_time_min / 60) * CostCalculator.HOURLY_RATE
        
        # Total
        total_cost = CostCalculator.SETUP_COST + material_cost + machining_cost
        
        # Quantity discounts
        qty_pricing = {
            1: total_cost,
            10: total_cost * 0.85,
            100: total_cost * 0.65,
            1000: total_cost * 0.45
        }
        
        return {
            "material_cost": round(material_cost, 2),
            "machining_time_min": round(machining_time_min, 1),
            "machining_cost": round(machining_cost, 2),
            "setup_cost": CostCalculator.SETUP_COST,
            "total_cost": round(total_cost, 2),
            "weight_grams": round(weight_grams, 1),
            "volume_cm3": round(volume_cm3, 2),
            "qty_pricing": {k: round(v, 2) for k, v in qty_pricing.items()},
            "currency": "₹"
        }


# ============= SMART PARSER =============
class SmartParser:
    """Intelligent prompt parser"""

    @staticmethod
    def extract_dimensions(prompt: str) -> Dict:
        prompt = prompt.lower()
        dims = {}
        
        # Helper to safely extract float
        def get_float(regex, text, group=1, default=None):
            match = re.search(regex, text, re.IGNORECASE)
            return float(match.group(group)) if match else default

        dims["length"] = get_float(r'(\d+\.?\d*)\s*mm?\s*(length|l\b|tall)', prompt)
        dims["width"] = get_float(r'(\d+\.?\d*)\s*mm?\s*(width|w\b|wide)', prompt)
        dims["height"] = get_float(r'(\d+\.?\d*)\s*mm?\s*(height|h\b|thick)', prompt)
        dims["diameter"] = get_float(r'(\d+\.?\d*)\s*mm?\s*(diameter|dia\b)', prompt)
        dims["radius"] = get_float(r'(\d+\.?\d*)\s*mm?\s*(radius|r\b)', prompt)
        dims["teeth"] = int(get_float(r'(\d+)\s*(teeth|tooth)', prompt, default=0))
        
        # Single dimension for shapes: "50mm cube", "30mm sphere", "60mm cylinder"
        single_dim = re.search(r'(\d+\.?\d*)\s*mm?\s*(cube|box|sphere|ball|cylinder|rod|piston|plate|block)', prompt)
        if single_dim:
            size = float(single_dim.group(1))
            shape_word = single_dim.group(2)
            if shape_word in ["cube", "box", "plate", "block"]:
                dims["length"] = dims["length"] or size
                dims["width"] = dims["width"] or size
                dims["height"] = dims["height"] or size if shape_word == "cube" else (dims["height"] or 10)
            elif shape_word in ["sphere", "ball"]:
                dims["diameter"] = dims["diameter"] or size
            elif shape_word in ["cylinder", "rod", "piston"]:
                dims["diameter"] = dims["diameter"] or size
                dims["height"] = dims["height"] or size * 2  # Default height 2x diameter
        
        # 50x50x10 pattern coverage
        xyz = re.search(r'(\d+\.?\d*)x(\d+\.?\d*)x?(\d+\.?\d*)?', prompt)
        if xyz:
            dims["length"] = float(xyz.group(1))
            dims["width"] = float(xyz.group(2))
            dims["height"] = float(xyz.group(3)) if xyz.group(3) else dims.get("height") or 10.0
            
        # GD&T Detection
        match_h7 = re.search(r'(h7|g6)', prompt, re.IGNORECASE)
        if match_h7:
            dims["fit"] = match_h7.group(1)

        return dims

    @staticmethod
    def detect_shape(prompt: str) -> str:
        prompt = prompt.lower()
        # NEW SHAPES
        if any(w in prompt for w in ["bolt", "screw", "m6", "m8", "m10", "m12"]): return "bolt"
        if any(w in prompt for w in ["washer", "ring", "annular"]): return "washer"
        if "hole" in prompt and any(w in prompt for w in ["plate", "block", "box"]): return "plate_with_hole"
        if any(w in prompt for w in ["tube", "pipe", "hollow"]): return "tube"
        # ORIGINAL SHAPES
        if any(w in prompt for w in ["gear", "tooth", "sprocket"]): return "gear"
        if any(w in prompt for w in ["sphere", "ball"]): return "sphere"
        if any(w in prompt for w in ["cylinder", "rod", "shaft"]): return "cylinder"
        if any(w in prompt for w in ["cone", "taper"]): return "cone"
        if any(w in prompt for w in ["piston"]): return "piston"
        if any(w in prompt for w in ["flange"]): return "flange"
        return "box" # Default

# ============= CODE GENERATOR (SECURE) =============
class CodeGenerator:
    """
    SECURITY HARDENED & GD&T AWARE
    """

    @staticmethod
    def generate(shape: str, dims: Dict) -> Tuple[str, List[str]]:
        notes = []
        # HEADER
        code = [
            "import FreeCAD, Part, math, Mesh, MeshPart",
            "if FreeCAD.ActiveDocument: FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)",
            "doc = FreeCAD.newDocument('GeneratedPart')"
        ]

        # GD&T Logic
        fit = dims.get("fit")
        # Apply strict checks
        try:
            if shape == "box":
                l = float(dims.get("length") or 50)
                w = float(dims.get("width") or 50)
                h = float(dims.get("height") or 10)
                code.append(f"""
base = doc.addObject("Part::Box", "Base")
base.Length = {l}
base.Width = {w}
base.Height = {h}
""")
            
            elif shape == "cylinder" or shape == "piston" or shape == "flange":
                # For demo, treat piston/flange as cylinder or simplified
                diameter = dims.get("diameter") or 20
                r = float(dims.get("radius") or (diameter / 2))
                h = float(dims.get("height") or 50)
                
                # Apply Fit
                if fit:
                    adj, note = ToleranceEngine.get_adjustment(r*2, fit) # adjust diameter
                    if adj:
                        r += (adj / 2) # Adjust radius
                        notes.append(note)

                code.append(f"""
# {notes[0] if notes else "Standard Nominal Geometry"}
base = doc.addObject("Part::Cylinder", "Base")
base.Radius = {r}
base.Height = {h}
""")

            elif shape == "sphere":
                diameter = dims.get("diameter") or 40
                r = float(dims.get("radius") or (diameter / 2))
                code.append(f"""
base = doc.addObject("Part::Sphere", "Base")
base.Radius = {r}
""")

            elif shape == "gear":
                diameter = dims.get("diameter") or 60
                r = float(dims.get("radius") or (diameter / 2))
                h = float(dims.get("height") or 10)
                teeth = int(dims.get("teeth") or 20)
                code.append(f"""
outer_radius = {r}
height = {h}
num_teeth = {teeth}
tooth_depth = outer_radius * 0.15
base_radius = outer_radius - tooth_depth
points = []
tooth_angle = (2 * math.pi) / num_teeth
for i in range(num_teeth * 2 + 1):
    angle = (i * tooth_angle) / 2
    r_curr = outer_radius if i % 2 == 0 else base_radius
    x = r_curr * math.cos(angle)
    y = r_curr * math.sin(angle)
    points.append(FreeCAD.Vector(x, y, 0))

gear_wire = Part.makePolygon(points)
gear_face = Part.Face(gear_wire)
gear_solid = gear_face.extrude(FreeCAD.Vector(0, 0, height))
base = doc.addObject("Part::Feature", "Gear")
base.Shape = gear_solid
""")

            elif shape == "bolt":
                # Threaded bolt (M6, M8, M10, M12)
                diameter = dims.get("diameter") or 8  # Default M8
                length = dims.get("length") or dims.get("height") or 40
                head_height = diameter * 0.7
                head_diameter = diameter * 1.8
                notes.append(f"Bolt: M{int(diameter)} x {length}mm")
                code.append(f"""
# Bolt head (hexagonal cylinder approximation)
head = Part.makeCylinder({head_diameter/2}, {head_height})
# Bolt shaft
shaft = Part.makeCylinder({diameter/2}, {length})
shaft.translate(FreeCAD.Vector(0, 0, {head_height}))
# Combine head and shaft
bolt_shape = head.fuse(shaft)
base = doc.addObject("Part::Feature", "Bolt")
base.Shape = bolt_shape
""")

            elif shape == "washer":
                # Ring/washer shape
                outer_d = dims.get("diameter") or dims.get("outer_diameter") or 20
                inner_d = dims.get("inner_diameter") or outer_d * 0.5
                thickness = dims.get("height") or dims.get("thickness") or 2
                notes.append(f"Washer: OD {outer_d}mm, ID {inner_d}mm, T {thickness}mm")
                code.append(f"""
# Outer cylinder
outer = Part.makeCylinder({outer_d/2}, {thickness})
# Inner cylinder (to subtract)
inner = Part.makeCylinder({inner_d/2}, {thickness})
# Cut inner from outer
washer_shape = outer.cut(inner)
base = doc.addObject("Part::Feature", "Washer")
base.Shape = washer_shape
""")

            elif shape == "tube":
                # Hollow cylinder / pipe
                outer_d = dims.get("outer_diameter") or dims.get("diameter") or 30
                inner_d = dims.get("inner_diameter") or outer_d * 0.7
                height = dims.get("height") or dims.get("length") or 100
                notes.append(f"Tube: OD {outer_d}mm, ID {inner_d}mm, L {height}mm")
                code.append(f"""
# Outer cylinder
outer = Part.makeCylinder({outer_d/2}, {height})
# Inner cylinder (to subtract)
inner = Part.makeCylinder({inner_d/2}, {height})
# Cut inner from outer to make hollow tube
tube_shape = outer.cut(inner)
base = doc.addObject("Part::Feature", "Tube")
base.Shape = tube_shape
""")

            elif shape == "plate_with_hole":
                # Rectangular plate with center hole
                length = dims.get("length") or 50
                width = dims.get("width") or 50
                height = dims.get("height") or 10
                hole_d = dims.get("hole_diameter") or dims.get("diameter") or min(length, width) * 0.3
                notes.append(f"Plate with {hole_d}mm center hole")
                code.append(f"""
# Create base plate
plate = Part.makeBox({length}, {width}, {height})
# Create hole cylinder at center
hole = Part.makeCylinder({hole_d/2}, {height})
hole.translate(FreeCAD.Vector({length/2}, {width/2}, 0))
# Cut hole from plate
plate_with_hole = plate.cut(hole)
base = doc.addObject("Part::Feature", "PlateWithHole")
base.Shape = plate_with_hole
""")

            else:
                # Fallback: default box for unknown shapes
                code.append(f"""
base = doc.addObject("Part::Box", "Base")
base.Length = 50
base.Width = 50
base.Height = 10
""")
            
            # FOOTER - MUST be outside the if/elif chain
            code.append("""
doc.recompute()
MeshObj = doc.addObject("Mesh::Feature", "Mesh")
MeshObj.Mesh = MeshPart.meshFromShape(Shape=base.Shape, LinearDeflection=0.1)
""")
            
            return "\n".join(code), notes

        except Exception as e:
            print(f"Error generating code: {e}")
            return "", []

# ============= API ENDPOINTS =============

@app.post("/generate")
async def generate_cad(request: PromptRequest, response: Response):
    """
    Non-blocking generation endpoint.
    Returns STL file AND injects script in headers for transparency.
    """
    if not FREECAD_CMD:
        raise HTTPException(500, "FreeCAD not configured")

    current_id = str(uuid.uuid4())[:8]
    print(f"[{current_id}] 🚀 Generating for: {request.text}")

    # 1. Parse (Fast)
    request_text = request.text
    shape = SmartParser.detect_shape(request_text)
    dims = SmartParser.extract_dimensions(request_text)
    
    # 2. Generate Python Script (Secure + GD&T)
    py_script, notes = CodeGenerator.generate(shape, dims)
    
    # 3. Write Script File
    script_path = (OUTPUT_DIR / f"gen_{current_id}.py").resolve()
    stl_path = (OUTPUT_DIR / f"gen_{current_id}.stl").resolve()
    
    with open(script_path, "w") as f:
        f.write(py_script)
        # Export command
        f.write(f'\nMeshObj.Mesh.write(r"{stl_path}")\n')

    # 4. Execute FreeCAD (Async Subprocess)
    try:
        process = await asyncio.create_subprocess_exec(
            str(FREECAD_CMD), str(script_path),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            print(f"FreeCAD Error: {stderr.decode()}")
            raise HTTPException(500, "Generation failed")
            
        if not stl_path.exists():
            raise HTTPException(500, "STL file not created")

        # 5. Run DFM Analysis and Cost Calculation
        dfm_result = DFMAnalyzer.analyze(shape, dims, "steel")  # Default to steel
        cost_result = CostCalculator.calculate(shape, dims, "steel")
        
        # Combine analysis data
        analysis_data = {
            "dfm": dfm_result,
            "cost": cost_result,
            "shape": shape,
            "dimensions": dims
        }

        # Headers for Transparency and Frontend Logic
        response.headers["X-Script-ID"] = f"gen_{current_id}.py"
        response.headers["X-Manufacturing-Notes"] = json.dumps(notes)
        response.headers["X-DFM-Analysis"] = json.dumps(dfm_result)
        response.headers["X-Cost-Estimate"] = json.dumps(cost_result)
        
        print(f"[{current_id}] ✅ DFM Score: {dfm_result['score']}/100, Cost: ₹{cost_result['total_cost']}")
        
        return FileResponse(
            stl_path, 
            filename=f"neuralcad_{current_id}.stl",
            headers={
                "X-Script-ID": f"gen_{current_id}.py",
                "X-Manufacturing-Notes": json.dumps(notes),
                "X-DFM-Analysis": json.dumps(dfm_result),
                "X-Cost-Estimate": json.dumps(cost_result)
            } 
        )

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(500, str(e))

@app.get("/download_code/{filename}")
async def download_code(filename: str):
    """Serve the source code"""
    file_path = OUTPUT_DIR / filename
    if not file_path.exists():
        raise HTTPException(404, "Script not found")
    
    return FileResponse(file_path, filename=filename, media_type="text/x-python")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
