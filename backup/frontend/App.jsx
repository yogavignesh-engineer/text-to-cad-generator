import React, { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { Canvas, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Center, Grid, ContactShadows, Environment, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { Cpu, Send, Download, Zap, Activity, CheckCircle, AlertCircle, Loader2, Sparkles, Settings, Eye, AlertTriangle, X, FileDown, History, Undo2, Redo2, Moon, Sun, Lightbulb, DollarSign, Ruler, Package } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000';

// Enhanced Materials with Real Properties
const MATERIALS = {
  steel: { 
    color: "#94a3b8", 
    metalness: 0.95, 
    roughness: 0.25, 
    envMapIntensity: 1.5,
    density: 7.85, // g/cm³
    cost: 0.80, // $/kg
    name: "Steel (AISI 1020)"
  },
  aluminum: {
    color: "#d4d4d8",
    metalness: 0.92,
    roughness: 0.18,
    envMapIntensity: 2.2,
    density: 2.70,
    cost: 2.50,
    name: "Aluminum 6061-T6"
  },
  titanium: {
    color: "#c0c0d0",
    metalness: 0.98,
    roughness: 0.18,
    envMapIntensity: 2.0,
    density: 4.51,
    cost: 35.00,
    name: "Titanium Ti-6Al-4V"
  },
  copper: {
    color: "#b87333",
    metalness: 0.95,
    roughness: 0.15,
    envMapIntensity: 2.2,
    density: 8.96,
    cost: 6.50,
    name: "Copper C110"
  },
  plastic_abs: {
    color: "#fef3c7",
    metalness: 0.1,
    roughness: 0.6,
    envMapIntensity: 0.8,
    density: 1.05,
    cost: 2.20,
    name: "ABS Plastic"
  },

};

// Test Prompts Database
const TEST_PROMPTS = [
  "50x50x10 plate",
  "gear 20 teeth 60mm diameter 10mm height",
  "50x50x10 plate with 5mm fillet",
  "50x50x10 plate with 3mm chamfer",
  "cylinder 20mm diameter 100mm height",
  "sphere 50mm diameter",
  "piston 60mm diameter 80mm height",
  "flange coupling 60mm diameter 40mm long",
  "crankshaft 120mm long",
  "camshaft 100mm long with 4 lobes",
  "50x50x10 plate with 5mm hole at center",
  "100x100x10 plate with 4 corner holes 5mm",
  "M8 threaded hole at center",
  "tube 20mm outer diameter 2mm wall thickness 100mm long",
  "gear 25 teeth 70mm diameter with M6 center hole",
  "80x80x15 block with 2mm chamfer",
  "100x100x20 block with 3mm fillet on all edges",
  "cylinder 30mm diameter 80mm height with M10 thread",
  "60mm diameter piston with 3 compression rings",
  "L-bracket 50mm tall 50mm wide 10mm thick"
];

// Tolerance Standards
const TOLERANCES = {
  'H7': { deviation: 0.025, type: 'hole' },
  'g6': { deviation: -0.009, type: 'shaft' },
  'H8': { deviation: 0.033, type: 'hole' },
  'f7': { deviation: -0.025, type: 'shaft' },
  'H6': { deviation: 0.016, type: 'hole' },
  'h6': { deviation: 0, type: 'shaft' }
};

// Estimated Manual CAD Times (in minutes)
const MANUAL_CAD_TIMES = {
  base: {
    box: 2,
    cylinder: 2,
    sphere: 1,
    gear: 5,
    piston: 8,
    flange: 7,
    crankshaft: 15,
    camshaft: 12,
    tube: 3,
  },
  features: {
    hole: 0.5,
    threaded: 1,
    fillet: 1,
    chamfer: 0.5,
    teeth: 0.2, // per 5 teeth
    lobes: 2,
  },
  complexityMultiplier: 1.2 // for multiple complex features
};

// ===== 3D COMPONENTS (Same as before) =====
function PrecisionGear({ radius = 30, height = 10, teeth = 20, material }) {
  const gearGeometry = useMemo(() => {
    const toothDepth = radius * 0.15;
    const baseRadius = radius - toothDepth;
    const innerRadius = radius * 0.3;
    const shape = new THREE.Shape();
    const toothAngle = (2 * Math.PI) / teeth;
    
    for (let i = 0; i <= teeth; i++) {
      const angle = i * toothAngle;
      const rootAngle1 = angle - toothAngle / 4;
      const rootX1 = Math.cos(rootAngle1) * baseRadius;
      const rootY1 = Math.sin(rootAngle1) * baseRadius;
      const tipX = Math.cos(angle) * radius;
      const tipY = Math.sin(angle) * radius;
      const rootAngle2 = angle + toothAngle / 4;
      const rootX2 = Math.cos(rootAngle2) * baseRadius;
      const rootY2 = Math.sin(rootAngle2) * baseRadius;
      
      if (i === 0) shape.moveTo(rootX1, rootY1);
      else shape.lineTo(rootX1, rootY1);
      shape.lineTo(tipX, tipY);
      shape.lineTo(rootX2, rootY2);
    }
    shape.closePath();
    
    const holePath = new THREE.Path();
    holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    shape.holes.push(holePath);
    
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: true,
      bevelThickness: 0.4,
      bevelSize: 0.3,
      bevelSegments: 3
    });
    geometry.center();
    geometry.computeVertexNormals();
    return geometry;
  }, [radius, height, teeth]);

  return <mesh geometry={gearGeometry} castShadow receiveShadow><meshStandardMaterial {...material} /></mesh>;
}

function FilletedBox({ length, width, height, filletRadius, material }) {
  const geometry = useMemo(() => {
    const r = Math.min(filletRadius, Math.min(length, width) / 4);
    const l = length / 2;
    const w = width / 2;
    const shape = new THREE.Shape();
    shape.moveTo(l - r, w);
    shape.lineTo(-l + r, w);
    shape.quadraticCurveTo(-l, w, -l, w - r);
    shape.lineTo(-l, -w + r);
    shape.quadraticCurveTo(-l, -w, -l + r, -w);
    shape.lineTo(l - r, -w);
    shape.quadraticCurveTo(l, -w, l, -w + r);
    shape.lineTo(l, w - r);
    shape.quadraticCurveTo(l, w, l - r, w);
    
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: true,
      bevelThickness: r * 0.3,
      bevelSize: r * 0.3,
      bevelSegments: 8,
      curveSegments: 16
    });
    geom.center();
    geom.computeVertexNormals();
    return geom;
  }, [length, width, height, filletRadius]);
  return <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial {...material} /></mesh>;
}

function ChamferedBox({ length, width, height, chamferSize, material }) {
  const geometry = useMemo(() => {
    const c = Math.min(chamferSize, Math.min(length, width, height) / 4);
    const l = length / 2;
    const w = width / 2;
    const shape = new THREE.Shape();
    shape.moveTo(l - c, w);
    shape.lineTo(-l + c, w);
    shape.lineTo(-l, w - c);
    shape.lineTo(-l, -w + c);
    shape.lineTo(-l + c, -w);
    shape.lineTo(l - c, -w);
    shape.lineTo(l, -w + c);
    shape.lineTo(l, w - c);
    shape.lineTo(l - c, w);
    
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: true,
      bevelThickness: c * 0.4,
      bevelSize: c * 0.4,
      bevelSegments: 4
    });
    geom.center();
    geom.computeVertexNormals();
    return geom;
  }, [length, width, height, chamferSize]);
  return <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial {...material} /></mesh>;
}

function ThreadedHole({ radius, height, material }) {
  const pitch = radius * 0.3;
  const turns = Math.max(Math.floor(height / pitch), 1);
  
  return (
    <group>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, height, 32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.8} />
      </mesh>
      {Array.from({ length: Math.min(turns, 12) }).map((_, i) => {
        const progress = i / Math.max(turns - 1, 1);
        const yPos = -height/2 + progress * height;
        return (
          <mesh key={i} position={[0, yPos, 0]} rotation={[0, progress * Math.PI * 4, 0]} castShadow>
            <torusGeometry args={[radius * 0.88, radius * 0.12, 8, 32]} />
            <meshStandardMaterial color="#333" metalness={0.9} roughness={0.2} emissive="#1a1a1a" emissiveIntensity={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}

function Piston({ diameter = 60, height = 80, material }) {
  const r = diameter / 2;
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r * 0.92, r * 0.88, height * 0.5, 32]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh position={[0, 0, height * 0.3]} castShadow receiveShadow>
        <cylinderGeometry args={[r * 0.98, r * 0.92, height * 0.12, 32]} />
        <meshStandardMaterial {...material} />
      </mesh>
      {[0.22, 0.18, 0.14].map((offset, i) => (
        <mesh key={i} position={[0, 0, height * offset]} castShadow>
          <torusGeometry args={[r * 0.94, height * 0.008, 16, 32]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.95} roughness={0.15} />
        </mesh>
      ))}
      <mesh position={[0, 0, -height * 0.18]} castShadow receiveShadow>
        <cylinderGeometry args={[r * 0.9, r * 0.84, height * 0.32, 32]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh position={[r * 0.5, 0, -height * 0.05]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[r * 0.22, r * 0.22, r * 0.3, 24]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh position={[-r * 0.5, 0, -height * 0.05]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[r * 0.22, r * 0.22, r * 0.3, 24]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh position={[0, 0, -height * 0.05]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r * 0.15, r * 0.15, r * 1.5, 24]} />
        <meshStandardMaterial color="#555" metalness={0.98} roughness={0.08} />
      </mesh>
    </group>
  );
}

function FlangeCoupling({ diameter = 60, length = 40, material }) {
  const flange_r = diameter / 2;
  const shaft_r = flange_r / 2;
  const bolt_r = flange_r / 3.5;
  
  return (
    <group>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[shaft_r, shaft_r, length, 32]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh position={[0, 0, length / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[flange_r, flange_r, length / 5, 32]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh position={[0, 0, -length / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[flange_r, flange_r, length / 5, 32]} />
        <meshStandardMaterial {...material} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * bolt_r;
        const y = Math.sin(angle) * bolt_r;
        return (
          <group key={i}>
            <mesh position={[x, y, length / 2]} castShadow>
              <cylinderGeometry args={[diameter / 20, diameter / 20, length / 3.5, 16]} />
              <meshStandardMaterial color="#333" metalness={0.3} roughness={0.8} />
            </mesh>
            <mesh position={[x, y, -length / 2]} castShadow>
              <cylinderGeometry args={[diameter / 20, diameter / 20, length / 3.5, 16]} />
              <meshStandardMaterial color="#333" metalness={0.3} roughness={0.8} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Crankshaft({ length = 120, material }) {
  const main_r = length / 20;
  const crank_r = length / 15;
  const crankThrow = length / 8;
  
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh position={[-length * 0.3, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[main_r, main_r, length * 0.2, 24]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh position={[length * 0.3, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[main_r, main_r, length * 0.2, 24]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh position={[0, crankThrow, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[crank_r, crank_r, length * 0.15, 24]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh position={[-length * 0.15, crankThrow / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length * 0.15, crankThrow, main_r * 2.8]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh position={[length * 0.15, crankThrow / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length * 0.15, crankThrow, main_r * 2.8]} />
        <meshStandardMaterial {...material} />
      </mesh>
    </group>
  );
}

function Camshaft({ length = 100, lobes = 4, material }) {
  const shaft_r = length / 25;
  const lobe_h = shaft_r * 2.2;
  
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[shaft_r, shaft_r, length, 24]} />
        <meshStandardMaterial {...material} />
      </mesh>
      {Array.from({ length: lobes }).map((_, i) => {
        const pos = -length / 2 + (length / (lobes + 1)) * (i + 1);
        const rotation = (i * Math.PI) / 4;
        return (
          <group key={i} position={[pos, 0, 0]} rotation={[0, rotation, 0]}>
            <mesh position={[0, lobe_h * 0.65, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[shaft_r * 1.4, lobe_h, length / (lobes * 2.5), 16]} />
              <meshStandardMaterial {...material} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ===== PARSER & VALIDATION =====
function parsePrompt(prompt) {
  if (!prompt) return null;
  const lower = prompt.toLowerCase();

  const detectShape = (p) => {
    const shapes = {
      piston: ["piston"],
      flange: ["flange", "coupling"],
      crankshaft: ["crankshaft", "crank"],
      camshaft: ["camshaft", "cam"],
      gear: ["gear", "tooth", "teeth", "cog"],
      tube: ["tube", "hollow cylinder", "pipe"],
      cylinder: ["cylinder", "rod", "shaft", "pin"],
      box: ["box", "cube", "block", "plate", "rectangular", "square", "bracket"],
      sphere: ["sphere", "ball"],
      cone: ["cone", "taper"],
    };

    for (const shape in shapes) {
      if (shapes[shape].some(kw => p.includes(kw))) {
        return shape;
      }
    }

    const dims = extractDimensions(p);
    if (dims.diameter || dims.radius) {
      return "cylinder";
    }

    return "box";
  };

  const extractDimensions = (p) => {
    const dims = {};
    let unit = "mm";
    if (p.includes("inch") || p.includes('"')) {
      unit = "inch";
    }

    const convertToMm = (value, detectedUnit) => {
      if (detectedUnit === "inch") {
        return value * 25.4;
      }
      return value;
    };

    let xyzMatch = p.match(/(\d+\.?\d*)x(\d+\.?\d*)x?(\d+\.?\d*)?/);
    if (xyzMatch) {
      dims.length = convertToMm(parseFloat(xyzMatch[1]), unit);
      dims.width = convertToMm(parseFloat(xyzMatch[2]), unit);
      if (xyzMatch[3]) {
        dims.height = convertToMm(parseFloat(xyzMatch[3]), unit);
      } else {
        dims.height = dims.length;
      }
    }

    const patterns = {
      diameter: /(\d+\.?\d*)\s*m?m?\s*(diameter|dia)/i,
      radius: /(\d+\.?\d*)\s*m?m?\s*(radius|r)/i,
      height: /(\d+\.?\d*)\s*m?m?\s*(height|h|long)/i,
      length: /(\d+\.?\d*)\s*m?m?\s*(length|l|tall)/i,
      width: /(\d+\.?\d*)\s*m?m?\s*(width|w|wide)/i,
      thickness: /(\d+\.?\d*)\s*m?m?\s*(thickness|thick|t)/i,
      outer_diameter: /(\d+\.?\d*)\s*m?m?\s*outer.?(diameter|od)/i,
      inner_diameter: /(\d+\.?\d*)\s*m?m?\s*inner.?(diameter|id)/i,
      wall_thickness: /(\d+\.?\d*)\s*m?m?\s*wall.?(thickness|wt)/i,
      teeth: /(\d+)\s*(teeth|tooth)/i,
      lobes: /(\d+)\s*(?:lobe|cam)/i,
    };

    for (const key in patterns) {
      const match = p.match(patterns[key]);
      if (match) {
        dims[key] = convertToMm(parseFloat(match[1]), unit);
      }
    }

    if (dims.thickness && !dims.height) {
      dims.height = dims.thickness;
    }

    if (dims.radius && !dims.diameter) {
      dims.diameter = dims.radius * 2;
    } else if (dims.diameter && !dims.radius) {
      dims.radius = dims.diameter / 2;
    }

    if (dims.outer_diameter && !dims.outer_radius) {
      dims.outer_radius = dims.outer_diameter / 2;
    }
    if (dims.inner_diameter && !dims.inner_radius) {
      dims.inner_radius = dims.inner_diameter / 2;
    }
    if (dims.outer_radius && dims.wall_thickness && !dims.inner_radius) {
      dims.inner_radius = dims.outer_radius - dims.wall_thickness;
    }
    dims.unit = "mm";
    return dims;
  };

  const detectHoles = (p) => {
    const holes = [];
    if (!/hole|drill|bore|cut|through|thread|m6|m8|m10/.test(p)) {
      return holes;
    }

    const holeDiaMatch = p.match(/(\d+\.?\d*)\s*m?m?\s*(hole|drill|bore)/i);
    let diameter = 5.0;
    let threaded = false;
    let threadSize = null;

    const threadMatch = p.match(/m(\d+)/i);
    if (threadMatch || p.includes("thread")) {
      threaded = true;
      threadSize = threadMatch ? parseInt(threadMatch[1]) : 6;
      diameter = threadSize;
    } else if (holeDiaMatch) {
      diameter = parseFloat(holeDiaMatch[1]);
    }

    const countMatch = p.match(/(\d+)\s*x?\s*hole/i);
    const count = countMatch ? parseInt(countMatch[1]) : 1;

    let location = "center";
    let coordinates = null;

    const coordMatch = p.match(/at\s*(\d+\.?\d*),\s*(\d+\.?\d*),?\s*(\d+\.?\d*)?/i);
    if (coordMatch) {
      const x = parseFloat(coordMatch[1]);
      const y = parseFloat(coordMatch[2]);
      const z = coordMatch[3] ? parseFloat(coordMatch[3]) : 0;
      coordinates = [x, y, z];
      location = "coordinates";
    } else if (p.includes("corner")) {
      location = "corners";
    } else if (p.includes("edge")) {
      location = "edges";
    }

    holes.push({
      count,
      diameter,
      location,
      coordinates,
      threaded,
      threadsize: threadSize,
    });

    return holes;
  };

  const detectFillets = (p) => {
    const fillets = [];
    if (!p.includes("fillet") && !p.includes("round")) {
      return fillets;
    }
    const radiusMatch = p.match(/fillet\s*(?:radius)?\s*(\d+\.?\d*)/i) || p.match(/(\d+\.?\d*)\s*m?m?\s*fillet/i);
    const radius = radiusMatch ? parseFloat(radiusMatch[1]) : 5.0;
    fillets.push({
      radius,
      edges: "all",
    });
    return fillets;
  };

  const detectChamfers = (p) => {
    const chamfers = [];
    if (!p.includes("chamfer") && !p.includes("bevel")) {
      return chamfers;
    }
    const sizeMatch = p.match(/chamfer\s*(\d+\.?\d*)/i) || p.match(/(\d+\.?\d*)\s*m?m?\s*chamfer/i);
    const size = sizeMatch ? parseFloat(sizeMatch[1]) : 3.0;
    chamfers.push({
      size,
      angle: 45.0,
      edges: "all",
    });
    return chamfers;
  };

  const shape = detectShape(lower);
  const dimensions = extractDimensions(lower);
  const holes = detectHoles(lower);
  const fillets = detectFillets(lower);
  const chamfers = detectChamfers(lower);

  const features = {};
  if (holes.length > 0) {
      features.holes = holes;
  }
  if (fillets.length > 0) {
      features.fillet = true;
      features.filletRadius = fillets[0].radius;
  }
  if (chamfers.length > 0) {
      features.chamfer = true;
      features.chamferSize = chamfers[0].size;
  }
   if (holes.some(h => h.threaded)) {
    features.threaded = true;
    const threadedHole = holes.find(h => h.threaded);
    features.threadSize = threadedHole.threadsize;
    features.holeRadius = threadedHole.diameter / 2;
  }


  if (shape === 'gear') {
    if (!dimensions.diameter) { dimensions.diameter = 60; dimensions.radius = 30; }
    if (!dimensions.height) dimensions.height = 10;
    if (!dimensions.teeth) dimensions.teeth = 20;
  }

  return { shape, dimensions, features: Object.keys(features).length > 0 ? features : null };
}

function validateGeometry(parsed) {
  const errors = [];
  const warnings = [];
  const suggestions = [];
  
  if (!parsed) {
    errors.push("Could not parse prompt. Please describe a geometric shape.");
    return { valid: false, errors, warnings, suggestions };
  }
  
  const { shape, dimensions, features } = parsed;
  
  // Check for negative or zero dimensions
  Object.entries(dimensions).forEach(([key, value]) => {
    if (value !== undefined && value !== null) { // Only validate if the dimension exists
      if (value <= 0) {
        errors.push(`"${key}" cannot be zero or negative (${value}mm).`);
      }
      if (value < 0.1) warnings.push(`"${key}" is very small (${value}mm) - ensure this is intentional.`);
      if (value > 10000) errors.push(`"${key}" is too large (max 10000mm).`);
      if (value > 5000) warnings.push(`Large "${key}" (${value}mm) may slow rendering.`);
    }
  });

  // Specific thickness/height check
  if (dimensions.height !== undefined && dimensions.height <= 0) {
    errors.push("Thickness/Height cannot be zero or negative.");
  }
  if (dimensions.thickness !== undefined && dimensions.thickness <= 0) {
    errors.push("Thickness cannot be zero or negative.");
  }

  if (shape === 'box') {
    const length = dimensions.length || 0;
    const width = dimensions.width || 0;
    const height = dimensions.height || 0;

    if (length <= 0 || width <= 0 || height <= 0) {
      errors.push(`Box dimensions (length, width, height) must all be positive.`);
    }

    if (features?.holes && features.holes.length > 0) {
      features.holes.forEach(hole => {
        if (hole.diameter && (hole.diameter > length || hole.diameter > width)) {
          errors.push(`Hole diameter (${hole.diameter}mm) cannot be greater than plate length (${length}mm) or width (${width}mm).`);
        }
      });
    }

    if (features?.fillet) {
      const maxFillet = Math.min(length, width, height) / 2;
      if (features.filletRadius > maxFillet) {
        errors.push(`Fillet radius (${features.filletRadius}mm) too large. Max: ${maxFillet.toFixed(1)}mm.`);
      }
      if (features.filletRadius < 2) suggestions.push("💡 Larger fillet (3-5mm) recommended for stress relief.");
    } else {
      suggestions.push("💡 Add fillet for smooth edges? Try: 'with 3mm fillet'.");
    }
    
    if (!features?.chamfer && height < 15) {
      suggestions.push("💡 Thin part - consider chamfer for easy assembly.");
    }
  }
  
  if (shape === 'gear') {
    if (dimensions.teeth && dimensions.teeth < 6) errors.push("Gear needs at least 6 teeth.");
    if (dimensions.teeth && dimensions.teeth > 200) warnings.push("Large tooth count may slow rendering.");
    if (!features?.threaded) suggestions.push("💡 Add center hole? Try: 'with M8 center hole'.");
  }

  if (shape === 'cylinder') {
    const radius = dimensions.radius || 0;
    const height = dimensions.height || 0;
    if (radius <= 0 || height <= 0) {
      errors.push(`Cylinder dimensions (radius, height) must both be positive.`);
    }
  }

  if (shape === 'sphere') {
    const radius = dimensions.radius || 0;
    if (radius <= 0) {
      errors.push(`Sphere radius must be positive.`);
    }
  }

  if (features?.threaded && dimensions.height && dimensions.height < features.threadSize * 2) {
    warnings.push("Part height is small for threaded hole - min 2x thread diameter recommended.");
  }
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : null,
    warnings: warnings.length > 0 ? warnings : null,
    suggestions: suggestions.length > 0 ? suggestions : null
  };
}

function calculateBOM(parsed, material) {
  if (!parsed) return null;
  
  const { dimensions } = parsed;
  const mat = MATERIALS[material];
  
  let volume = 0;
  if (parsed.shape === 'box') {
    volume = (dimensions.length * dimensions.width * dimensions.height) / 1000; // mm^3 to cm^3
  } else if (parsed.shape === 'cylinder') {
    volume = (Math.PI * dimensions.radius * dimensions.radius * dimensions.height) / 1000;
  } else if (parsed.shape === 'sphere') {
    volume = (4/3 * Math.PI * dimensions.radius * dimensions.radius * dimensions.radius) / 1000;
  }
  // Add more shape volume calculations as needed

  const mass = (volume * mat.density) / 1000; // g to kg
  const cost = mass * mat.cost;

  // Feature Count
  let featureCount = 0;
  if (parsed.features) {
    if (parsed.features.holes) featureCount += parsed.features.holes.length;
    if (parsed.features.fillet) featureCount += 1;
    if (parsed.features.chamfer) featureCount += 1;
    if (parsed.shape === 'gear' && parsed.dimensions.teeth) featureCount += 1; // Count gear teeth as a feature
    if (parsed.shape === 'camshaft' && parsed.dimensions.lobes) featureCount += parsed.dimensions.lobes;
    // Add other complex features
  }

  // Time Saved Calculation
  let manualCadTime = MANUAL_CAD_TIMES.base[parsed.shape] || MANUAL_CAD_TIMES.base.box; // Default to box if unknown shape
  if (parsed.features) {
    if (parsed.features.holes) manualCadTime += parsed.features.holes.length * MANUAL_CAD_TIMES.features.hole;
    if (parsed.features.threaded) manualCadTime += parsed.features.holes.filter(h => h.threaded).length * MANUAL_CAD_TIMES.features.threaded;
    if (parsed.features.fillet) manualCadTime += MANUAL_CAD_TIMES.features.fillet;
    if (parsed.features.chamfer) manualCadTime += MANUAL_CAD_TIMES.features.chamfer;
    if (parsed.shape === 'gear' && parsed.dimensions.teeth) manualCadTime += (parsed.dimensions.teeth / 5) * MANUAL_CAD_TIMES.features.teeth;
    if (parsed.shape === 'camshaft' && parsed.dimensions.lobes) manualCadTime += parsed.dimensions.lobes * MANUAL_CAD_TIMES.features.lobes;

    // Apply complexity multiplier if multiple distinct features exist (e.g., holes AND fillet)
    const distinctFeatures = Object.keys(parsed.features).filter(key => parsed.features[key]);
    if (distinctFeatures.length > 1) {
      manualCadTime *= MANUAL_CAD_TIMES.complexityMultiplier;
    }
  }

  const textToCadTime = 5 / 60; // Assuming 5 seconds = 5/60 minutes
  const timeSaved = manualCadTime - textToCadTime;
  const efficiencyGain = manualCadTime / textToCadTime;
  
  return {
    volume: volume.toFixed(2),
    mass: mass.toFixed(3),
    material: mat.name,
    unitCost: mat.cost.toFixed(2),
    totalCost: cost.toFixed(2),
    featureCount: featureCount,
    manualCadTime: manualCadTime.toFixed(1),
    textToCadTime: textToCadTime.toFixed(1),
    timeSaved: timeSaved.toFixed(1),
    efficiencyGain: efficiencyGain.toFixed(1)
  };
}

function calculateTolerance(nominal, tolerance) {
  const tol = TOLERANCES[tolerance];
  if (!tol) return null;
  
  return {
    nominal: nominal,
    upper: (nominal + Math.abs(tol.deviation)).toFixed(3),
    lower: (nominal + tol.deviation).toFixed(3),
    type: tol.type
  };
}

function StlModel({ url, material }) {
  const geom = useLoader(STLLoader, url);
  return (
    <Center>
      <mesh geometry={geom} castShadow receiveShadow>
        <meshStandardMaterial {...material} />
      </mesh>
    </Center>
  );
}

// ===== DYNAMIC MODEL =====
function DynamicModel({ prompt, type }) {
  const mat = MATERIALS[type] || MATERIALS.steel;
  const geometry = useMemo(() => parsePrompt(prompt), [prompt]);
  
  if (!geometry) return null;

  const material = {
    color: mat.color,
    metalness: mat.metalness,
    roughness: mat.roughness,
    emissive: mat.emissive || '#000000',
    emissiveIntensity: mat.emissiveIntensity || 0,
    envMapIntensity: mat.envMapIntensity || 1.5
  };

  return (
    <Center>
      <group>
        {geometry.shape === 'gear' && <PrecisionGear radius={geometry.dimensions.radius || 30} height={geometry.dimensions.height || 10} teeth={geometry.dimensions.teeth || 20} material={material} />}
        {geometry.shape === 'piston' && <Piston diameter={geometry.dimensions.diameter || 60} height={geometry.dimensions.height || 80} material={material} />}
        {geometry.shape === 'flange' && <FlangeCoupling diameter={geometry.dimensions.diameter || 60} length={geometry.dimensions.height || 40} material={material} />}
        {geometry.shape === 'crankshaft' && <Crankshaft length={geometry.dimensions.length || 120} material={material} />}
        {geometry.shape === 'camshaft' && <Camshaft length={geometry.dimensions.length || 100} lobes={geometry.dimensions.lobes || 4} material={material} />}
        {geometry.shape === 'box' && geometry.features?.fillet && <FilletedBox length={geometry.dimensions.length || 50} width={geometry.dimensions.width || 50} height={geometry.dimensions.height || 10} filletRadius={geometry.features.filletRadius || 5} material={material} />}
        {geometry.shape === 'box' && geometry.features?.chamfer && !geometry.features?.fillet && <ChamferedBox length={geometry.dimensions.length || 50} width={geometry.dimensions.width || 50} height={geometry.dimensions.height || 10} chamferSize={geometry.features.chamferSize || 3} material={material} />}
        {geometry.shape === 'box' && !geometry.features?.chamfer && !geometry.features?.fillet && (
          <mesh castShadow receiveShadow>
            <boxGeometry args={[geometry.dimensions.length || 50, geometry.dimensions.width || 50, geometry.dimensions.height || 10]} />
            <meshStandardMaterial {...material} />
          </mesh>
        )}
        {geometry.shape === 'cylinder' && (
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[geometry.dimensions.radius || 15, geometry.dimensions.radius || 15, geometry.dimensions.height || 80, 32]} />
            <meshStandardMaterial {...material} />
          </mesh>
        )}
        {geometry.shape === 'sphere' && (
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[geometry.dimensions.radius || 25, 64, 64]} />
            <meshStandardMaterial {...material} />
          </mesh>
        )}
        {geometry.features?.threaded && <ThreadedHole radius={geometry.features.holeRadius || 3} height={(geometry.dimensions.height || 10) + 10} material={material} />}
      </group>
    </Center>
  );
}

function CameraController({ hasModel }) {
  const { camera } = useThree();
  useEffect(() => {
    if (hasModel) {
      camera.position.set(100, 80, 100);
      camera.lookAt(0, 0, 0);
    }
  }, [hasModel, camera]);
  return null;
}

// ===== CONFETTI EFFECT =====
function SuccessConfetti() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: '-20px',
            width: '10px',
            height: '10px',
            background: `hsl(${Math.random() * 360}, 100%, 60%)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
            animation: `confettiFall ${2 + Math.random() * 2}s linear forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}
    </div>
  );
}

// ===== VALIDATION POPUP =====
function ValidationPopup({ validation, onClose, onProceed }) {
  if (!validation || validation.valid) return null;
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      animation: 'fadeIn 0.3s ease'
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.95), rgba(200, 35, 51, 0.95))',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(220, 53, 69, 0.5)',
        animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <AlertTriangle size={32} color="#fff" />
          <h2 style={{ fontSize: '1.5rem', color: 'white', fontWeight: 700, margin: 0 }}>
            {validation.errors ? 'Validation Errors' : 'Warnings & Suggestions'}
          </h2>
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          {validation.errors?.map((error, i) => (
            <div key={i} style={{
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '8px',
              color: 'white',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={18} />
              {error}
            </div>
          ))}
          
          {validation.warnings?.map((warning, i) => (
            <div key={`w${i}`} style={{
              background: 'rgba(255, 193, 7, 0.2)',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '8px',
              color: 'white',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertTriangle size={18} />
              {warning}
            </div>
          ))}
          
          {validation.suggestions?.map((suggestion, i) => (
            <div key={`s${i}`} style={{
              background: 'rgba(0, 240, 255, 0.2)',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '8px',
              color: 'white',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <Lightbulb size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Edit Prompt
          </button>
          
          {!validation.errors && (
            <button
              onClick={onProceed}
              style={{
                flex: 1,
                padding: '14px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '12px',
                color: '#dc3545',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Proceed Anyway
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== HISTORY PANEL =====
function HistoryPanel({ history, onSelect, onClose }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      animation: 'fadeIn 0.3s ease',
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(10, 15, 35, 0.98), rgba(20, 25, 50, 0.98))',
        border: '2px solid rgba(0, 240, 255, 0.3)',
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 240, 255, 0.3)',
        animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <History size={28} color="#00f0ff" />
            <h2 style={{ fontSize: '1.8rem', color: 'white', fontWeight: 700, margin: 0 }}>
              Generation History
            </h2>
          </div>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '8px'
          }}>
            <X size={24} />
          </button>
        </div>
        
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.5)' }}>
            <History size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p>No generation history yet</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {history.map((item, i) => (
              <div
                key={i}
                onClick={() => { onSelect(item); onClose(); }}
                style={{
                  background: 'rgba(0, 240, 255, 0.08)',
                  border: '1px solid rgba(0, 240, 255, 0.2)',
                  borderRadius: '16px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 240, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 240, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 240, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '12px',
                  minHeight: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.75rem'
                }}>
                  {item.shape.toUpperCase()}
                </div>
                <div style={{ color: 'white', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>
                  {item.prompt.length > 40 ? item.prompt.substring(0, 40) + '...' : item.prompt}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                    {item.timestamp}
                  </span>
                  <span style={{
                    background: 'rgba(0, 240, 255, 0.2)',
                    color: '#00f0ff',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }}>
                    {item.material}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== BOM PANEL =====
function BOMPanel({ bom, onClose }) {
  if (!bom) return null;
  
  return (
    <div style={{
      background: 'rgba(10, 15, 35, 0.95)',
      border: '2px solid rgba(0, 240, 255, 0.3)',
      borderRadius: '16px',
      padding: '24px',
      animation: 'slideUp 0.3s ease',
      marginTop: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <DollarSign size={24} color="#00f0ff" />
        <h3 style={{ fontSize: '1.2rem', color: 'white', fontWeight: 700, margin: 0 }}>
          Bill of Materials & Metrics
        </h3>
      </div>
      
      <div style={{ display: 'grid', gap: '12px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px'
        }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Material:</span>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{bom.material}</span>
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px'
        }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Volume:</span>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{bom.volume} cm³</span>
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px'
        }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Mass:</span>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{bom.mass} kg</span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px'
        }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Feature Count:</span>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{bom.featureCount}</span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px'
        }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Manual CAD Time:</span>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{bom.manualCadTime} min</span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px'
        }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Text-to-CAD Time:</span>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{bom.textToCadTime} min</span>
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px',
          background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(176, 38, 255, 0.15))',
          borderRadius: '8px',
          border: '1px solid rgba(0, 240, 255, 0.3)'
        }}>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>Estimated Cost:</span>
          <span style={{ color: '#00f0ff', fontWeight: 700, fontSize: '1.1rem' }}>₹{bom.totalCost}</span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px',
          background: 'linear-gradient(135deg, rgba(76, 209, 55, 0.15), rgba(50, 150, 30, 0.15))',
          borderRadius: '8px',
          border: '1px solid rgba(76, 209, 55, 0.3)'
        }}>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>Time Saved:</span>
          <span style={{ color: '#4cd137', fontWeight: 700, fontSize: '1.1rem' }}>{bom.timeSaved} min</span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px',
          background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.15), rgba(200, 120, 0, 0.15))',
          borderRadius: '8px',
          border: '1px solid rgba(255, 193, 7, 0.3)'
        }}>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>Efficiency Gain:</span>
          <span style={{ color: '#ffc107', fontWeight: 700, fontSize: '1.1rem' }}>{bom.efficiencyGain}x</span>
        </div>
        
        <div style={{
          padding: '8px',
          background: 'rgba(176, 38, 255, 0.1)',
          borderRadius: '6px',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.6)',
          textAlign: 'center'
        }}>
          Based on ₹{bom.unitCost}/kg material cost
        </div>
      </div>
    </div>
  );
}

// ===== TOLERANCE CALCULATOR PANEL =====
function TolerancePanel({ dimensions, onClose }) {
  const [nominal, setNominal] = useState(20);
  const [holeTol, setHoleTol] = useState('H7');
  const [shaftTol, setShaftTol] = useState('g6');
  const [result, setResult] = useState(null);
  
  useEffect(() => {
    const holeCalc = calculateTolerance(nominal, holeTol);
    const shaftCalc = calculateTolerance(nominal, shaftTol);
    
    if (holeCalc && shaftCalc) {
      const clearanceMax = parseFloat(holeCalc.upper) - parseFloat(shaftCalc.lower);
      const clearanceMin = parseFloat(holeCalc.lower) - parseFloat(shaftCalc.upper);
      setResult({
        hole: holeCalc,
        shaft: shaftCalc,
        clearanceMax: clearanceMax.toFixed(3),
        clearanceMin: clearanceMin.toFixed(3),
        fitType: clearanceMin > 0 ? 'Clearance Fit' : clearanceMax < 0 ? 'Interference Fit' : 'Transition Fit'
      });
    }
  }, [nominal, holeTol, shaftTol]);
  
  return (
    <div style={{
      background: 'rgba(10, 15, 35, 0.95)',
      border: '2px solid rgba(176, 38, 255, 0.3)',
      borderRadius: '16px',
      padding: '24px',
      animation: 'slideUp 0.3s ease',
      marginTop: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Ruler size={24} color="#b026ff" />
          <h3 style={{ fontSize: '1.2rem', color: 'white', fontWeight: 700, margin: 0 }}>
            Tolerance Calculator
          </h3>
        </div>
        <button onClick={onClose} style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '4px'
        }}>
          <X size={20} />
        </button>
      </div>
      
      <div style={{ display: 'grid', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>
            Nominal Dimension (mm)
          </label>
          <input
            type="number"
            value={nominal}
            onChange={(e) => setNominal(parseFloat(e.target.value) || 20)}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(176, 38, 255, 0.3)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.9rem'
            }}
          />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>
              Hole Tolerance
            </label>
            <select
              value={holeTol}
              onChange={(e) => setHoleTol(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(176, 38, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.9rem'
              }}
            >
              <option value="H6">H6</option>
              <option value="H7">H7</option>
              <option value="H8">H8</option>
            </select>
          </div>
          
          <div>
            <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>
              Shaft Tolerance
            </label>
            <select
              value={shaftTol}
              onChange={(e) => setShaftTol(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(176, 38, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.9rem'
              }}
            >
              <option value="f7">f7</option>
              <option value="g6">g6</option>
              <option value="h6">h6</option>
            </select>
          </div>
        </div>
      </div>
      
      {result && (
        <div style={{
          background: 'rgba(176, 38, 255, 0.1)',
          border: '1px solid rgba(176, 38, 255, 0.3)',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: '#b026ff', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>
              {result.fitType}
            </div>
          </div>
          
          <div style={{ display: 'grid', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Hole: {holeTol}</span>
              <span style={{ color: 'white', fontWeight: 600 }}>{result.hole.lower} - {result.hole.upper} mm</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Shaft: {shaftTol}</span>
              <span style={{ color: 'white', fontWeight: 600 }}>{result.shaft.lower} - {result.shaft.upper} mm</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '8px',
              borderTop: '1px solid rgba(176, 38, 255, 0.3)',
              marginTop: '4px'
            }}>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Clearance:</span>
              <span style={{ color: '#b026ff', fontWeight: 700 }}>{result.clearanceMin} to {result.clearanceMax} mm</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== MAIN APP =====
export default function App() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [modelUrl, setModelUrl] = useState(null);
  const [stepUrl, setStepUrl] = useState(null);
  const [material, setMaterial] = useState("steel");
  const [ready, setReady] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [showTestPrompts, setShowTestPrompts] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [showValidationPopup, setShowValidationPopup] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [darkMode, setDarkMode] = useState(true);
  const [showBOM, setShowBOM] = useState(false);
  const [bom, setBom] = useState(null);
  const [showTolerance, setShowTolerance] = useState(false);
  const [shakeButton, setShakeButton] = useState(false);
  const [parsedParameters, setParsedParameters] = useState(null);
  
  const [progress, setProgress] = useState({ 
    status: 'idle', 
    progress: 0, 
    message: 'Ready' 
  });
  const [validation, setValidation] = useState(null);
  const [stats, setStats] = useState({
    totalGenerated: 0,
    successRate: 95,
    avgTime: 0
  });

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        if (prompt.trim()) generateCAD(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [prompt, historyIndex, history]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevItem = history[historyIndex - 1];
      setPrompt(prevItem.prompt);
      setMaterial(prevItem.material);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextItem = history[historyIndex + 1];
      setPrompt(nextItem.prompt);
      setMaterial(nextItem.material);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const addToHistory = (promptText, materialType, shape) => {
    const newItem = {
      prompt: promptText,
      material: materialType,
      shape: shape,
      timestamp: new Date().toLocaleTimeString()
    };
    
    const newHistory = [...history.slice(0, historyIndex + 1), newItem].slice(-10);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const generateCAD = async (skipValidation = false) => {
    console.log('generateCAD called', { prompt, loading });
    if (!prompt.trim() || loading) {
      setShakeButton(true);
      setTimeout(() => setShakeButton(false), 500);
      return;
    }
    
    const parsed = parsePrompt(prompt);
    const validationCheck = validateGeometry(parsed);
    
    if (!skipValidation && (!validationCheck.valid || validationCheck.warnings)) {
      console.log('Validation failed or has warnings', validationCheck);
      setValidationResult(validationCheck);
      setShowValidationPopup(true);
      return;
    }
    console.log('Passed validation, sending fetch...');
    
    const startTime = Date.now();
    setLoading(true);
    setShowDemo(false);
    setModelUrl(null);
    setStepUrl(null);
    setShowValidationPopup(false);
    setShowBOM(false);
    
    setProgress({ status: 'parsing', progress: 15, message: 'Analyzing prompt...' });
    
    try {
      setTimeout(() => setProgress({ status: 'validating', progress: 35, message: 'Validating geometry...' }), 500);
      setTimeout(() => setProgress({ status: 'generating', progress: 55, message: 'Generating code...' }), 1200);
      setTimeout(() => setProgress({ status: 'executing', progress: 75, message: 'Running FreeCAD...' }), 2000);
      setTimeout(() => setProgress({ status: 'exporting', progress: 92, message: 'Exporting files...' }), 2800);
      
      const response = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: prompt, use_ai: useAI })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setModelUrl(url);
        
        // STEP export simulation
        setStepUrl(url); // In production, this would be a separate STEP file
        
        setShowDemo(false);
        setProgress({ status: 'complete', progress: 100, message: 'Complete!' });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        
        const timeElapsed = (Date.now() - startTime) / 1000;
        setStats(prev => ({
          ...prev,
          totalGenerated: prev.totalGenerated + 1,
          avgTime: timeElapsed
        }));
        
        addToHistory(prompt, material, parsed?.shape || 'box');
        
        // Calculate BOM
        const calculatedBOM = calculateBOM(parsed, material);
        setBom(calculatedBOM);
        setShowBOM(true);
        
      } else {
        throw new Error('Backend error');
      }
    } catch (error) {
      console.log('Using demo mode as fallback due to error:', error);
      setModelUrl(null);
      setShowDemo(true);
      setProgress({ status: 'complete', progress: 100, message: 'Demo mode' });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      const timeElapsed = (Date.now() - startTime) / 1000;
      setStats(prev => ({
        ...prev,
        totalGenerated: prev.totalGenerated + 1,
        avgTime: timeElapsed
      }));
      
      const parsed = parsePrompt(prompt);
      addToHistory(prompt, material, parsed?.shape || 'box');
      
      const calculatedBOM = calculateBOM(parsed, material);
      setBom(calculatedBOM);
      setShowBOM(true);
    } finally {
      setLoading(false);
    }
  };

  const validatePrompt = () => {
    if (!prompt.trim()) {
      setValidation(null);
      setParsedParameters(null);
      return;
    }
    
    const geometry = parsePrompt(prompt);
    setParsedParameters(geometry); // Set the parsed parameters state
    const validationCheck = validateGeometry(geometry);
    
    if (geometry) {
      const dimStr = geometry.dimensions.length 
        ? `${geometry.dimensions.length}×${geometry.dimensions.width}×${geometry.dimensions.height}mm`
        : geometry.dimensions.diameter
        ? `Ø${geometry.dimensions.diameter}mm`
        : 'Custom';
      
      setValidation({
        shape: geometry.shape,
        dimensions: dimStr,
        valid: validationCheck.valid,
        hasWarnings: !!validationCheck.warnings,
        hasSuggestions: !!validationCheck.suggestions
      });
    }
  };

  const bgColor = darkMode ? '#000' : '#f0f0f0';
  const panelBg = darkMode ? 'rgba(10, 15, 35, 0.85)' : 'rgba(255, 255, 255, 0.95)';
  const textColor = darkMode ? 'white' : '#1a1a1a';
  const subtleTextColor = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      background: darkMode 
        ? 'radial-gradient(ellipse at top, #1a1a2e 0%, #0a0118 60%, #000 100%)'
        : 'radial-gradient(ellipse at top, #e0e7ff 0%, #f0f0f0 60%, #fff 100%)',
      overflow: 'hidden'
    }}>
      {/* Loading Screen */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: ready ? 0 : 1,
        pointerEvents: ready ? 'none' : 'auto',
        transition: 'opacity 0.8s ease'
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          border: '4px solid rgba(0, 240, 255, 0.1)',
          borderTop: '4px solid #00f0ff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          boxShadow: '0 0 50px rgba(0, 240, 255, 0.5)'
        }} />
        <div style={{
          marginTop: '30px',
          color: '#00f0ff',
          fontSize: '1.2rem',
          letterSpacing: '8px',
          fontWeight: 700
        }}>
          NEURALCAD v6.0
        </div>
      </div>

      {/* Confetti */}
      {showConfetti && <SuccessConfetti />}

      {/* Validation Popup */}
      {showValidationPopup && (
        <ValidationPopup 
          validation={validationResult}
          onClose={() => setShowValidationPopup(false)}
          onProceed={() => generateCAD(true)}
        />
      )}

      {/* History Panel */}
      {showHistory && (
        <HistoryPanel
          history={history}
          onSelect={(item) => {
            setPrompt(item.prompt);
            setMaterial(item.material);
            validatePrompt();
          }}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Stats Panel */}
      <div style={{
        position: 'fixed',
        top: '30px',
        right: '30px',
        display: 'flex',
        gap: '16px',
        zIndex: 100
      }}>
        {[
          { icon: <Activity size={20} />, label: 'Generated', value: stats.totalGenerated },
          { icon: <Zap size={20} />, label: 'Accuracy', value: `${stats.successRate}%` },
          { icon: <Cpu size={20} />, label: 'Status', value: loading ? 'BUSY' : 'READY' }
        ].map((stat, i) => (
          <div key={i} style={{
            background: panelBg,
            backdropFilter: 'blur(30px)',
            border: `1px solid ${darkMode ? 'rgba(0, 240, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '16px',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: darkMode ? '0 10px 40px rgba(0, 0, 0, 0.5)' : '0 10px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{
                fontSize: '0.7rem',
                color: subtleTextColor,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                marginBottom: '2px'
              }}>
                {stat.label}
              </div>
              <div style={{
                fontSize: '1.3rem',
                fontWeight: 700,
                color: textColor
              }}>
                {stat.value}
              </div>
            </div>
          </div>
        ))}
        
        {/* Dark/Light Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            background: panelBg,
            backdropFilter: 'blur(30px)',
            border: `1px solid ${darkMode ? 'rgba(0, 240, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: darkMode ? '0 10px 40px rgba(0, 0, 0, 0.5)' : '0 10px 40px rgba(0, 0, 0, 0.1)'
          }}
        >
          {darkMode ? <Sun size={24} color="#fbbf24" /> : <Moon size={24} color="#4f46e5" />}
        </button>
      </div>

      {/* Control Panel */}
      <aside style={{
        position: 'fixed',
        left: '30px',
        top: '30px',
        bottom: '30px',
        width: '440px',
        background: panelBg,
        backdropFilter: 'blur(40px) saturate(180%)',
        borderRadius: '32px',
        border: `2px solid ${darkMode ? 'rgba(0, 240, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}`,
        boxShadow: darkMode 
          ? '0 0 100px rgba(102, 126, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 0 100px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        padding: '40px',
        gap: '24px',
        zIndex: 100,
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, paddingBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '14px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
            }}>
              <Sparkles size={28} color="white" />
            </div>
            <div>
              <h1 style={{
                fontSize: '2.2rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '5px',
                marginBottom: '4px'
              }}>
                NEURAL CAD
              </h1>
              <p style={{
                fontSize: '0.75rem',
                color: subtleTextColor,
                letterSpacing: '3px'
              }}>
                v6.0 AWARD-WINNING
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowHistory(true)}
            style={{
              flex: 1,
              padding: '12px',
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '12px',
              color: '#00f0ff',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.3s ease'
            }}
          >
            <History size={16} />
            History
          </button>
          
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            style={{
              padding: '12px',
              background: historyIndex <= 0 ? 'rgba(255,255,255,0.05)' : 'rgba(176, 38, 255, 0.1)',
              border: '1px solid rgba(176, 38, 255, 0.3)',
              borderRadius: '12px',
              color: historyIndex <= 0 ? subtleTextColor : '#b026ff',
              cursor: historyIndex <= 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
          >
            <Undo2 size={16} />
          </button>
          
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            style={{
              padding: '12px',
              background: historyIndex >= history.length - 1 ? 'rgba(255,255,255,0.05)' : 'rgba(176, 38, 255, 0.1)',
              border: '1px solid rgba(176, 38, 255, 0.3)',
              borderRadius: '12px',
              color: historyIndex >= history.length - 1 ? subtleTextColor : '#b026ff',
              cursor: historyIndex >= history.length - 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
          >
            <Redo2 size={16} />
          </button>
          
          <button
            onClick={() => setShowTolerance(!showTolerance)}
            style={{
              padding: '12px',
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '12px',
              color: '#ffc107',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
          >
            <Ruler size={16} />
          </button>
        </div>

        {/* Material Selector */}
        <div>
          <div style={{
            fontSize: '0.7rem',
            color: subtleTextColor,
            letterSpacing: '2px',
            fontWeight: 700,
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Settings size={14} />
            <span>MATERIAL LIBRARY</span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px'
          }}>
            {Object.keys(MATERIALS).map(m => (
              <button 
                key={m}
                onClick={() => setMaterial(m)}
                style={{
                  padding: '14px 8px',
                  background: material === m 
                    ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(176, 38, 255, 0.25))'
                    : darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  border: `1px solid ${material === m ? '#00f0ff' : darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: '12px',
                  color: textColor,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {m.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Test Prompts Button */}
        <button
          onClick={() => setShowTestPrompts(!showTestPrompts)}
          style={{
            padding: '12px',
            background: 'rgba(0, 240, 255, 0.1)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            borderRadius: '12px',
            color: '#00f0ff',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Eye size={16} />
          {showTestPrompts ? 'Hide' : 'Show'} 20 Test Prompts
        </button>

        {/* Test Prompts Dropdown */}
        {showTestPrompts && (
          <div style={{
            background: darkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.05)',
            border: `1px solid ${darkMode ? 'rgba(0, 240, 255, 0.2)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '12px',
            padding: '12px',
            maxHeight: '200px',
            overflowY: 'auto',
            animation: 'slideUp 0.3s ease'
          }}>
            {TEST_PROMPTS.map((testPrompt, i) => (
              <div
                key={i}
                onClick={() => {
                  setPrompt(testPrompt);
                  setShowTestPrompts(false);
                  setTimeout(validatePrompt, 100);
                }}
                style={{
                  padding: '8px 12px',
                  marginBottom: '6px',
                  background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '8px',
                  color: textColor,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 240, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)';
                }}
              >
                {i + 1}. {testPrompt}
              </div>
            ))}
          </div>
        )}

        {/* Validation Card */}
        {validation && (
          <div style={{
            background: validation.valid && !validation.hasWarnings 
              ? 'rgba(0, 240, 255, 0.08)' 
              : 'rgba(255, 193, 7, 0.08)',
            border: `1px solid ${validation.valid && !validation.hasWarnings ? 'rgba(0, 240, 255, 0.3)' : 'rgba(255, 193, 7, 0.3)'}`,
            borderRadius: '16px',
            padding: '18px',
            animation: 'slideUp 0.4s ease'
          }}>
            <div style={{
              fontSize: '0.7rem',
              color: validation.valid && !validation.hasWarnings ? '#00f0ff' : '#ffc107',
              letterSpacing: '2px',
              fontWeight: 700,
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {validation.valid && !validation.hasWarnings ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              <span>GEOMETRY ANALYSIS</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: textColor, lineHeight: 1.8 }}>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: subtleTextColor }}>Shape: </span>
                <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{validation.shape}</span>
              </div>
              <div>
                <span style={{ color: subtleTextColor }}>Dims: </span>
                <span style={{ fontWeight: 700 }}>{validation.dimensions}</span>
              </div>
              {validation.hasSuggestions && (
                <div style={{
                  marginTop: '12px',
                  padding: '8px',
                  background: 'rgba(0, 240, 255, 0.1)',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  color: '#00f0ff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Lightbulb size={14} />
                  Click Generate to see AI suggestions
                </div>
              )}
            </div>
          </div>
        )}

        {/* Parsed Parameters Display */}
        {parsedParameters && (
          <div style={{
            background: darkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.8)',
            border: `1px solid ${darkMode ? 'rgba(0, 240, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '16px',
            padding: '18px',
            animation: 'slideUp 0.4s ease',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            <div style={{
              fontSize: '0.7rem',
              color: subtleTextColor,
              letterSpacing: '2px',
              fontWeight: 700,
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Package size={16} />
              <span>PARSED PARAMETERS (JSON)</span>
            </div>
            <pre style={{
              fontSize: '0.75rem',
              color: textColor,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              margin: 0
            }}>
              {JSON.stringify(parsedParameters, null, 2)}
            </pre>
          </div>
        )}

        {/* Prompt Input */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{
            fontSize: '0.7rem',
            color: subtleTextColor,
            letterSpacing: '2px',
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>COMMAND INTERFACE</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 400 }}>Ctrl+G to Generate</span>
          </div>
          <textarea 
            placeholder="Try: '50x50x10 plate with 5mm fillet', 'gear 20 teeth 60mm diameter', 'piston 60mm diameter'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onBlur={validatePrompt}
            style={{
              width: '100%',
              minHeight: '140px',
              background: darkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.8)',
              border: `2px solid ${darkMode ? 'rgba(0, 240, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
              borderRadius: '16px',
              padding: '20px',
              color: textColor,
              fontSize: '0.95rem',
              lineHeight: 1.7,
              resize: 'none',
              outline: 'none',
              transition: 'all 0.3s ease',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Progress Bar */}
        {loading && (
          <div style={{
            background: 'rgba(176, 38, 255, 0.12)',
            border: '1px solid rgba(176, 38, 255, 0.3)',
            borderRadius: '16px',
            padding: '18px',
            animation: 'slideUp 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.8rem', color: textColor, fontWeight: 600 }}>
                {progress.message}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#b026ff', fontWeight: 700 }}>
                {progress.progress}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(0,0,0,0.5)',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress.progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                borderRadius: '10px',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        )}

        {/* AI Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          background: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
          borderRadius: '12px',
          border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.05)'}`
        }}>
          <input
            type="checkbox"
            checked={useAI}
            onChange={(e) => setUseAI(e.target.checked)}
            style={{
              width: '18px',
              height: '18px',
              accentColor: '#00f0ff',
              cursor: 'pointer'
            }}
            id="ai-toggle"
          />
          <label 
            htmlFor="ai-toggle"
            style={{ 
              fontSize: '0.75rem', 
              color: subtleTextColor,
              cursor: 'pointer',
              flex: 1
            }}
          >
            Use AI (Gemini) for complex prompts
          </label>
        </div>

        {/* Generate Button */}
        <button 
          onClick={() => generateCAD(false)}
          disabled={!prompt.trim() || loading}
          style={{
            width: '100%',
            padding: '22px',
            background: loading 
              ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '16px',
            color: 'white',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: (!prompt.trim() || loading) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            opacity: !prompt.trim() ? 0.5 : 1,
            transition: 'all 0.3s ease',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
            animation: shakeButton ? 'shake 0.5s' : 'none'
          }}
        >
          {loading ? (
            <>
              <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
              GENERATING
            </>
          ) : (
            <>
              <Send size={22} />
              GENERATE CAD MODEL
            </>
          )}
        </button>

        {/* Download Buttons */}
        {modelUrl && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <a 
              href={modelUrl} 
              download={`generated_part_${Date.now()}.stl`}
              style={{
                padding: '16px 12px',
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(0, 240, 255, 0.1))',
                border: '2px solid rgba(0, 240, 255, 0.5)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                animation: 'slideUp 0.4s ease'
              }}
            >
              <Download size={18} />
              STL
            </a>
            
            {stepUrl && (
              <>
                <a 
                  href={stepUrl} 
                  download={`generated_part_${Date.now()}.step`}
                  style={{
                    padding: '16px 12px',
                    background: 'linear-gradient(135deg, rgba(176, 38, 255, 0.2), rgba(176, 38, 255, 0.1))',
                    border: '2px solid rgba(176, 38, 255, 0.5)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    animation: 'slideUp 0.4s ease'
                  }}
                >
                  <FileDown size={18} />
                  STEP
                </a>
                
                <a 
                  href={stepUrl} 
                  download={`generated_part_${Date.now()}.iges`}
                  style={{
                    padding: '16px 12px',
                    background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 193, 7, 0.1))',
                    border: '2px solid rgba(255, 193, 7, 0.5)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    animation: 'slideUp 0.4s ease'
                  }}
                >
                  <Package size={18} />
                  IGES
                </a>
              </>
            )}
          </div>
        )}

        {/* BOM Panel */}
        {showBOM && bom && <BOMPanel bom={bom} onClose={() => setShowBOM(false)} />}

        {/* Tolerance Calculator */}
        {showTolerance && <TolerancePanel onClose={() => setShowTolerance(false)} />}
      </aside>

      {/* 3D Canvas */}
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
          <color attach="background" args={[bgColor]} />
          <PerspectiveCamera makeDefault position={[100, 80, 100]} fov={28} />
          
          <Environment preset="city" />
          <ambientLight intensity={darkMode ? 0.4 : 0.6} />
          <directionalLight position={[15, 15, 8]} intensity={darkMode ? 1.8 : 2.2} castShadow shadow-mapSize={[2048, 2048]} />
          <spotLight position={[60, 60, 60]} angle={0.25} intensity={darkMode ? 2.5 : 3} castShadow penumbra={0.5} />
          <pointLight position={[-60, 30, -60]} color="#b026ff" intensity={darkMode ? 4 : 2} />
          <pointLight position={[60, -30, 60]} color="#00f0ff" intensity={darkMode ? 3 : 1.5} />

          {darkMode && <Stars radius={350} depth={50} count={7000} factor={5} saturation={0} speed={0.5} />}

          <Suspense fallback={null}>
            {modelUrl && (
              <StlModel url={modelUrl} material={MATERIALS[material] || MATERIALS.steel} />
            )}
            {showDemo && !modelUrl && <DynamicModel prompt={prompt} type={material} />}
            
            <ContactShadows position={[0, -30, 0]} opacity={darkMode ? 0.6 : 0.3} scale={100} blur={2.5} />
            <Grid 
              infiniteGrid 
              fadeDistance={450} 
              sectionColor={darkMode ? "#b026ff" : "#667eea"} 
              sectionSize={60} 
              cellSize={12} 
              cellThickness={0.8}
              fadeStrength={2}
            />
          </Suspense>

          <CameraController hasModel={!!modelUrl || showDemo} />
          <OrbitControls 
            makeDefault 
            enableDamping 
            dampingFactor={0.05}
            minDistance={30}
            maxDistance={300}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>

      {/* Animations & Styles */}
      <style>{`
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box; 
        }
        
        ::-webkit-scrollbar { 
          width: 8px; 
        }
        
        ::-webkit-scrollbar-track { 
          background: rgba(0, 0, 0, 0.3); 
          border-radius: 10px; 
        }
        
        ::-webkit-scrollbar-thumb { 
          background: linear-gradient(135deg, #667eea, #764ba2); 
          border-radius: 10px; 
        }
        
        ::-webkit-scrollbar-thumb:hover { 
          background: linear-gradient(135deg, #764ba2, #f093fb); 
        }
      `}</style>
    </div>
  );
}