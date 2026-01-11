// Enhanced validation with smart suggestions
export const validateGeometryEnhanced = (parsed) => {
    const errors = [];
    const warnings = [];
    const suggestions = [];

    if (!parsed || !parsed.shape) {
        errors.push('No valid shape detected');
        suggestions.push('Try: "50x50x10mm plate" or "cylinder 30mm diameter 80mm height"');
        return { valid: false, errors, warnings, suggestions };
    }

    const { shape, dimensions } = parsed;

    // Box validation
    if (shape === 'box') {
        if (!dimensions.length || !dimensions.width || !dimensions.height) {
            errors.push('Missing dimensions for box');
            suggestions.push('Format: [length]x[width]x[height] (e.g., "50x50x10mm")');
            return { valid: false, errors, warnings, suggestions };
        }

        // Check for zero or negative dimensions
        if (dimensions.length <= 0 || dimensions.width <= 0 || dimensions.height <= 0) {
            errors.push('Dimensions must be positive numbers');
            suggestions.push(`Try: "${Math.abs(dimensions.length || 50)}x${Math.abs(dimensions.width || 50)}x${Math.abs(dimensions.height || 10)}mm"`);
            return { valid: false, errors, warnings, suggestions };
        }

        // Check for extremely small dimensions
        if (dimensions.length < 1 || dimensions.width < 1 || dimensions.height < 0.5) {
            warnings.push('Extremely small dimensions may be difficult to manufacture');
            suggestions.push('Consider increasing to at least 5mm for practical manufacturing');
        }

        // Check for extremely large dimensions
        if (dimensions.length > 1000 || dimensions.width > 1000 || dimensions.height > 500) {
            warnings.push('Very large dimensions detected');
            suggestions.push('Large parts may be expensive and difficult to manufacture. Consider scaling down.');
        }

        //  Check aspect ratio
        const aspectRatios = [
            dimensions.length / dimensions.width,
            dimensions.length / dimensions.height,
            dimensions.width / dimensions.height
        ];

        if (Math.max(...aspectRatios) > 20) {
            warnings.push('High aspect ratio detected - may be structurally weak');
            suggestions.push('Consider thickening the thin dimension for better strength');
        }
    }

    // Cylinder validation
    if (shape === 'cylinder') {
        if (!dimensions.diameter && !dimensions.radius) {
            errors.push('Missing diameter or radius for cylinder');
            suggestions.push('Format: "cylinder [diameter]mm diameter [height]mm height"');
            return { valid: false, errors, warnings, suggestions };
        }

        if (!dimensions.height) {
            errors.push('Missing height for cylinder');
            suggestions.push('Add height: "cylinder 30mm diameter 80mm height"');
            return { valid: false, errors, warnings, suggestions };
        }

        const dia = dimensions.diameter || dimensions.radius * 2;

        if (dia <= 0 || dimensions.height <= 0) {
            errors.push('Diameter and height must be positive');
            suggestions.push(`Try: "cylinder ${Math.abs(dia || 30)}mm diameter ${Math.abs(dimensions.height || 80)}mm height"`);
            return { valid: false, errors, warnings, suggestions };
        }

        // Wall thickness check for hollow cylinders
        if (dimensions.inner_diameter) {
            const wallThickness = (dia - dimensions.inner_diameter) / 2;
            if (wallThickness < 2) {
                warnings.push('Thin wall detected - may be fragile');
                suggestions.push(`Increase wall thickness to at least 3mm. Try outer diameter: ${dimensions.inner_diameter + 6}mm`);
            }
        }

        // Check aspect ratio
        const aspectRatio = dimensions.height / dia;
        if (aspectRatio > 10) {
            warnings.push('Very tall cylinder - may be unstable');
            suggestions.push('Consider reducing height or increasing diameter');
        }
    }

    // Gear validation
    if (shape === 'gear') {
        if (!dimensions.teeth || dimensions.teeth < 8) {
            errors.push('Gears need at least 8 teeth to function properly');
            suggestions.push('Try: "gear with 16 teeth, 80mm diameter, 10mm thick"');
            return { valid: false, errors, warnings, suggestions };
        }

        if (dimensions.teeth > 100) {
            warnings.push('Very high tooth count - may be difficult to manufacture');
            suggestions.push('Consider reducing to 20-50 teeth for typical applications');
        }

        if (!dimensions.diameter) {
            warnings.push('No diameter specified - using auto-calculation');
        }

        if (!dimensions.thickness) {
            warnings.push('No thickness specified - using default 10mm');
            suggestions.push('Specify thickness: "gear with 24 teeth, 80mm diameter, 15mm thick"');
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        suggestions
    };
};

// Smart prompt suggestions based on common errors
export const getSuggestionForError = (prompt) => {
    const lower = prompt.toLowerCase();

    // No dimensions detected
    if (!/\d/.test(prompt)) {
        return {
            error: 'No dimensions found in prompt',
            suggestions: [
                '50x50x10mm steel plate',
                'cylinder 30mm diameter 80mm height',
                'gear with 24 teeth, 80mm diameter'
            ]
        };
    }

    // Gear without teeth count
    if (lower.includes('gear') && !lower.includes('teeth')) {
        return {
            error: 'Gear missing teeth count',
            suggestions: [
                'gear with 20 teeth, 60mm diameter, 10mm thick',
                'gear with 24 teeth, 80mm diameter, 15mm thick',
                'gear with 32 teeth, 100mm diameter, 20mm thick'
            ]
        };
    }

    // Cylinder without diameter or height
    if (lower.includes('cylinder') && (!lower.includes('diameter') && !lower.includes('dia'))) {
        return {
            error: 'Cylinder missing diameter',
            suggestions: [
                'cylinder 30mm diameter 80mm height',
                'cylinder 40mm diameter 100mm height aluminum'
            ]
        };
    }

    // Box with incomplete dimensions
    if ((lower.includes('box') || lower.includes('plate') || lower.includes('block')) &&
        !/\d+\s*x\s*\d+\s*x\s*\d+/.test(prompt)) {
        return {
            error: 'Incomplete box dimensions',
            suggestions: [
                '50x50x10mm plate',
                '100x60x20 steel block',
                '150x100x15mm aluminum plate'
            ]
        };
    }

    return null;
};
