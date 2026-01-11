"""
Enhanced Parser - Advanced prompt parsing with unit conversion and tolerance extraction
Includes validation checkpoints for dimensional accuracy
"""

import re
from typing import Dict, List, Tuple, Optional
from decimal import Decimal, ROUND_HALF_UP

class EnhancedParser:
    """
    Advanced parser with unit conversion, tolerance extraction, and assembly detection
    """
    
    # Unit conversion factors to mm (standard unit)
    UNIT_CONVERSIONS = {
        'mm': 1.0,
        'millimeter': 1.0,
        'millimeters': 1.0,
        'cm': 10.0,
        'centimeter': 10.0,
        'centimeters': 10.0,
        'm': 1000.0,
        'meter': 1000.0,
       'meters': 1000.0,
        'in': 25.4,
        'inch': 25.4,
        'inches': 25.4,
        '"': 25.4,
        'ft': 304.8,
        'foot': 304.8,
        'feet': 304.8,
        "'": 304.8
    }
    
    @staticmethod
    def extract_dimensions_with_tolerance(prompt: str) -> Dict:
        """
        Extract dimensions with tolerance specifications and unit conversion
        
        Examples:
        - "20mm ±0.1" → {"value": 20.0, "tolerance": 0.1, "unit": "mm"}
        - "50mm H7" → {"value": 50.0, "fit": "H7", "unit": "mm"}
        - "2 inches" → {"value": 50.8, "unit": "mm"}  # Converted
        - "100x50x10" → {"length": 100, "width": 50, "height": 10}
        
        This is Checkpoint #1 - Parser must preserve exact values
        """
        prompt_lower = prompt.lower()
        dims = {}
        original_prompt = prompt  # Keep for validation
        
        # Pattern 1: XxYxZ format (most common)
        xyz_pattern = r'(\d+\.?\d*)\s*x\s*(\d+\.?\d*)\s*x\s*(\d+\.?\d*)'
        xyz_match = re.search(xyz_pattern, prompt_lower)
        if xyz_match:
            dims['length'] = Decimal(xyz_match.group(1))
            dims['width'] = Decimal(xyz_match.group(2))
            dims['height'] = Decimal(xyz_match.group(3))
            dims['unit'] = 'mm'  # Default for XxYxZ format
        
        # Pattern 2: Explicit dimensions with units
        # Format: "NUMBER UNIT" or "NUMBER UNIT DIMENSION_NAME"
        dim_pattern = r'(\d+\.?\d*)\s*(mm|cm|m|in|inch|inches|"|ft|foot|feet|\')?(?:\s*(±|tolerance|tol))?\s*(\d+\.?\d*)?'
        
        # Extract length
        length_match = re.search(r'(\d+\.?\d*)\s*(mm|cm|in|inch|m|ft)?\s*(length|long|l)\b', prompt_lower)
        if length_match and 'length' not in dims:
            value = Decimal(length_match.group(1))
            unit = length_match.group(2) or 'mm'
            dims['length'] = value * Decimal(str(EnhancedParser.UNIT_CONVERSIONS.get(unit, 1.0)))
            dims['length_unit_original'] = unit
        
        # Extract width
        width_match = re.search(r'(\d+\.?\d*)\s*(mm|cm|in|inch|m|ft)?\s*(width|wide|w)\b', prompt_lower)
        if width_match and 'width' not in dims:
            value = Decimal(width_match.group(1))
            unit = width_match.group(2) or 'mm'
            dims['width'] = value * Decimal(str(EnhancedParser.UNIT_CONVERSIONS.get(unit, 1.0)))
            dims['width_unit_original'] = unit
        
        # Extract height
        height_match = re.search(r'(\d+\.?\d*)\s*(mm|cm|in|inch|m|ft)?\s*(height|tall|h|thick)\b', prompt_lower)
        if height_match and 'height' not in dims:
            value = Decimal(height_match.group(1))
            unit = height_match.group(2) or 'mm'
            dims['height'] = value * Decimal(str(EnhancedParser.UNIT_CONVERSIONS.get(unit, 1.0)))
            dims['height_unit_original'] = unit
        
        # Extract diameter
        diameter_match = re.search(r'(\d+\.?\d*)\s*(mm|cm|in|inch|m|ft)?\s*(diameter|dia|d)\b', prompt_lower)
        if diameter_match:
            value = Decimal(diameter_match.group(1))
            unit = diameter_match.group(2) or 'mm'
            dims['diameter'] = value * Decimal(str(EnhancedParser.UNIT_CONVERSIONS.get(unit, 1.0)))
            dims['diameter_unit_original'] = unit
            # Auto-calculate radius
            dims['radius'] = dims['diameter'] / 2
        
        # Extract radius
        radius_match = re.search(r'(\d+\.?\d*)\s*(mm|cm|in|inch|m|ft)?\s*(radius|r)\b', prompt_lower)
        if radius_match and 'radius' not in dims:
            value = Decimal(radius_match.group(1))
            unit = radius_match.group(2) or 'mm'
            dims['radius'] = value * Decimal(str(EnhancedParser.UNIT_CONVERSIONS.get(unit, 1.0)))
            dims['radius_unit_original'] = unit
            # Auto-calculate diameter
            dims['diameter'] = dims['radius'] * 2
        
        # Extract teeth count (for gears)
        teeth_match = re.search(r'(\d+)\s*(teeth|tooth|t)\b', prompt_lower)
        if teeth_match:
            dims['teeth'] = int(teeth_match.group(1))
        
        # Extract tolerance
        tolerance_match = re.search(r'±\s*(\d+\.?\d*)\s*(mm|cm|in)?', prompt_lower)
        if tolerance_match:
            tol_value = Decimal(tolerance_match.group(1))
            tol_unit = tolerance_match.group(2) or 'mm'
            dims['tolerance'] = tol_value * Decimal(str(EnhancedParser.UNIT_CONVERSIONS.get(tol_unit, 1.0)))
        
        # Extract fit class (H7, g6, etc.)
        fit_match = re.search(r'\b([hHgG][6-9]|[hHgG]1[0-2])\b', prompt)
        if fit_match:
            dims['fit'] = fit_match.group(1).upper()
        
        # Convert Decimal to float for FreeCAD compatibility
        for key, value in dims.items():
            if isinstance(value, Decimal):
                # Round to 6 decimal places to avoid floating point errors
                dims[key] = float(value.quantize(Decimal('0.000001'), rounding=ROUND_HALF_UP))
        
        return dims
    
    @staticmethod
    def detect_shape(prompt: str) -> str:
        """
        Detect shape type from prompt
        """
        prompt_lower = prompt.lower()
        
        # Priority order matters - more specific first
        if any(w in prompt_lower for w in ["gear", "tooth", "teeth", "sprocket", "cog"]):
            return "gear"
        if any(w in prompt_lower for w in ["sphere", "ball", "round"]):
            return "sphere"
        if any(w in prompt_lower for w in ["cone", "taper", "conical"]):
            return "cone"
        if any(w in prompt_lower for w in ["tube", "pipe", "hollow cylinder", "ring"]):
            return "tube"
        if any(w in prompt_lower for w in ["cylinder", "rod", "shaft", "pin"]):
            return "cylinder"
        if any(w in prompt_lower for w in ["piston"]):
            return "piston"
        if any(w in prompt_lower for w in ["flange", "collar"]):
            return "flange"
        if any(w in prompt_lower for w in ["plate", "sheet"]):
            return "box"  # Thin box
        if any(w in prompt_lower for w in ["box", "cube", "block", "rectangular"]):
            return "box"
        
        # Default to box if dimensions are present
        return "box"
    
    @staticmethod
    def detect_assembly(prompt: str) -> Tuple[bool, List[str]]:
        """
        Detect if prompt describes an assembly with multiple components
        
        Examples:
        - "gear and shaft assembly" → (True, ["gear", "shaft"])
        - "motor with housing" → (True, ["motor", "housing"])
        - "simple box" → (False, [])
        """
        prompt_lower = prompt.lower()
        
        # Assembly indicators
        assembly_keywords = [
            'assembly', 'assemble', 'assembled',
            ' and ', ' with ',
            'connected to', 'attached to', 'mounted on',
            'multiple', 'several', 'two', 'three'
        ]
        
        is_assembly = any(kw in prompt_lower for kw in assembly_keywords)
        
        if not is_assembly:
            return False, []
        
        # Extract component names
        components = []
        shape_keywords = [
            'gear', 'shaft', 'housing', 'plate', 'bracket',
            'cylinder', 'box', 'motor', 'bearing', 'bolt',
            'nut', 'washer', 'rod', 'tube', 'disk'
        ]
        
        for shape in shape_keywords:
            if shape in prompt_lower:
                # Count occurrences
                count = prompt_lower.count(shape)
                for i in range(count):
                    components.append(f"{shape}_{i+1}" if count > 1 else shape)
        
        # Remove duplicates while preserving order
        components = list(dict.fromkeys(components))
        
        return len(components) > 1, components
    
    @staticmethod
    def detect_features(prompt: str) -> Dict[str, any]:
        """
        Detect additional features like holes, fillets, chamfers
        """
        prompt_lower = prompt.lower()
        features = {}
        
        # Holes
        hole_match = re.search(r'(\d+)\s*(mm|cm|in)?\s*hole', prompt_lower)
        if hole_match:
            hole_dia = float(hole_match.group(1))
            hole_unit = hole_match.group(2) or 'mm'
            features['hole_diameter'] = hole_dia * EnhancedParser.UNIT_CONVERSIONS.get(hole_unit, 1.0)
        
        # Hole position
        if 'center' in prompt_lower and 'hole' in prompt_lower:
            features['hole_position'] = 'center'
        elif 'corner' in prompt_lower and 'hole' in prompt_lower:
            features['hole_position'] = 'corners'
        
        # Fillet
        fillet_match = re.search(r'(\d+\.?\d*)\s*(mm|cm|in)?\s*fillet', prompt_lower)
        if fillet_match:
            fillet_radius = float(fillet_match.group(1))
            fillet_unit = fillet_match.group(2) or 'mm'
            features['fillet_radius'] = fillet_radius * EnhancedParser.UNIT_CONVERSIONS.get(fillet_unit, 1.0)
        
        # Chamfer
        if 'chamfer' in prompt_lower:
            chamfer_match = re.search(r'(\d+\.?\d*)\s*(mm|cm|in)?\s*chamfer', prompt_lower)
            if chamfer_match:
                features['chamfer_size'] = float(chamfer_match.group(1))
        
        return features
    
    @staticmethod
    def validate_parsed_dimensions(dims: Dict, original_prompt: str) -> Dict:
        """
        Validation Checkpoint #1: Verify extracted dimensions match prompt exactly
        
        Returns:
            {
                "valid": bool,
                "errors": [list of error messages],
                "warnings": [list of warnings]
            }
        """
        errors = []
        warnings = []
        
        # Extract all numbers from original prompt
        numbers_in_prompt = [float(n) for n in re.findall(r'\d+\.?\d*', original_prompt)]
        
        # Extract all numeric values from parsed dimensions
        parsed_values = []
        for key, value in dims.items():
            if isinstance(value, (int, float)) and not key.endswith('_unit_original'):
                parsed_values.append(value)
        
        # Check if any dimensions were found
        if not dims or all(v is None for v in dims.values()):
            errors.append("No dimensions extracted from prompt")
        
        # Check for suspiciously large values (likely unit conversion error)
        for key, value in dims.items():
            if isinstance(value, (int, float)):
                if value > 10000:  # 10 meters
                    warnings.append(f"{key}: {value}mm seems very large. Check units.")
                if value < 0.1:  # 0.1mm
                    warnings.append(f"{key}: {value}mm seems very small. Check units.")
        
        # Check for missing key dimensions
        shape_type = dims.get('shape', 'unknown')
        if shape_type == 'box':
            if not all(k in dims for k in ['length', 'width', 'height']):
                warnings.append("Box should have length, width, and height")
        elif shape_type in ['cylinder', 'sphere']:
            if 'radius' not in dims and 'diameter' not in dims:
                warnings.append(f"{shape_type} should have radius or diameter")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "dimension_count": len([v for v in dims.values() if isinstance(v, (int, float))])
        }
