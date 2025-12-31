// Utility for validatng geometry and simulating BOM
// In a real app, logic like parsePrompt should be shared or live backend side to avoid duplication.

export const parsePrompt = (text) => {
    const lower = text.toLowerCase();
    let shape = 'box';
    if (lower.includes('plate') || lower.includes('box') || lower.includes('cube') || lower.includes('flat')) shape = 'box';
    else if (lower.includes('cyl') || lower.includes('rod') || lower.includes('shaft') || lower.includes('pipe') || lower.includes('tube')) shape = 'cylinder';
    else if (lower.includes('sphere') || lower.includes('ball')) shape = 'sphere';
    else if (lower.includes('gear') || lower.includes('sprocket') || lower.includes('cog')) shape = 'gear';
    else if (lower.includes('cone')) shape = 'cone';
    else if (lower.includes('torus') || lower.includes('ring') || lower.includes('gasket') || lower.includes('washer')) shape = 'torus';

    // Dimensions
    const dimensions = {};
    const numbers = text.match(/\d+(\.\d+)?/g)?.map(Number) || [];

    if (shape === 'box') {
        dimensions.length = numbers[0] || 50;
        dimensions.width = numbers[1] || numbers[0] || 50;
        dimensions.height = numbers[2] || 10;
    } else if (shape === 'cylinder' || shape === 'cone') {
        dimensions.diameter = numbers[0] || 40;
        dimensions.height = numbers[1] || 60;
    } else if (shape === 'sphere') {
        dimensions.radius = numbers[0] || 25;
    } else if (shape === 'torus') {
        dimensions.radius = numbers[0] || 30; // Outer
        dimensions.tube = numbers[1] || 5;    // Thickness
    } else if (shape === 'gear') {
        dimensions.teeth = numbers.find(n => n % 1 === 0 && n > 5 && n < 100) || 20;
        dimensions.diameter = numbers.find(n => n > 20) || 60;
        dimensions.height = 10;
    }

    // Features
    const features = {
        holes: lower.includes('hole') ? [{ diameter: 5, x: 0, y: 0 }] : [],
        fillet: lower.includes('fillet') || lower.includes('rounded'),
        filletRadius: 3,
        chamfer: lower.includes('chamfer'),
        chamferSize: 2
    };

    return { shape, dimensions, features };
};

export const validateGeometry = (geo) => {
    const errors = [];
    const warnings = [];
    const suggestions = [];

    if (geo.dimensions.length > 500 || geo.dimensions.width > 500 || geo.dimensions.height > 500) {
        warnings.push("Large dimensions detected. Model may take longer to generate.");
    }
    if (geo.dimensions.wallThickness && geo.dimensions.wallThickness < 1) {
        errors.push("Wall thickness too thin (< 1mm). 3D printing may fail.");
    }
    if (geo.features.holes.length > 0 && geo.shape === 'sphere') {
        suggestions.push("Holes in spheres can be complex. Consider a cylinder for drilling operations.");
    }

    return {
        valid: errors.length === 0,
        errors: errors.length ? errors : null,
        warnings: warnings.length ? warnings : null,
        suggestions: suggestions.length ? suggestions : null,
        shape: geo.shape,
        dimensions: JSON.stringify(geo.dimensions)
    };
};

export const calculateBOM = (geo, materialKey, MATERIALS) => {
    const mat = MATERIALS[materialKey];
    if (!mat) return null;

    let vol = 0;
    const d = geo.dimensions;

    if (geo.shape === 'box') vol = (d.length * d.width * d.height) / 1000;
    else if (geo.shape === 'cylinder') vol = (Math.PI * Math.pow(d.diameter / 2, 2) * d.height) / 1000;
    else if (geo.shape === 'sphere') vol = ((4 / 3) * Math.PI * Math.pow(d.radius, 3)) / 1000;
    else vol = 50; // Fallback

    const mass = vol * mat.density;
    const cost = mass * mat.pricePerGram;

    return { material: materialKey, density: mat.density, volume: vol, mass, cost, pricePerGram: mat.pricePerGram };
};

export const detectModifications = (prompt) => {
    const p = prompt.toLowerCase();
    const result = { isModification: false, operation: null, value: null, dimension: null };
    const patterns = [
        { regex: /make it (\d+)% larger/, op: 'scale', val: (m) => 1 + (parseInt(m[1]) / 100) },
        { regex: /scale (?:by|to) (\d+(?:\.\d+)?)/, op: 'scale', val: (m) => parseFloat(m[1]) },
        { regex: /double/, op: 'scale', val: () => 2 },
        { regex: /half/, op: 'scale', val: () => 0.5 },
        { regex: /set (height|width|length|radius|diameter) to (\d+)/, op: 'set_dimension', val: (m) => parseFloat(m[2]), dim: (m) => m[1] },
        { regex: /add (\d+)mm to (height|width|length|radius|diameter)/, op: 'add_dimension', val: (m) => parseFloat(m[1]), dim: (m) => m[2] },
    ];

    for (const pat of patterns) {
        const match = p.match(pat.regex);
        if (match) {
            result.isModification = true;
            result.operation = pat.op;
            result.value = typeof pat.val === 'function' ? pat.val(match) : pat.val;
            result.dimension = pat.dim ? (typeof pat.dim === 'function' ? pat.dim(match) : pat.dim) : 'all';
            break;
        }
    }
    return result;
};
