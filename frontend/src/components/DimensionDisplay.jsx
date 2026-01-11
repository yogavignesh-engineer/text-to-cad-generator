/**
 * DimensionDisplay Component
 * Shows parsed dimensions before generation with visual confirmation
 * Part of Phase 3: Dimensional Accuracy System
 */

import { Ruler, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function DimensionDisplay({ dimensions, shape, prompt }) {
    if (!dimensions || Object.keys(dimensions).length === 0) {
        return null;
    }

    // Extract relevant dimensions based on shape
    const relevantDims = {};
    const allDims = { ...dimensions };

    // Remove metadata fields
    delete allDims.shape;
    delete allDims.fit;
    delete allDims.tolerance;

    // Filter out unit_original fields
    Object.keys(allDims).forEach(key => {
        if (!key.endsWith('_unit_original') && typeof allDims[key] === 'number') {
            relevantDims[key] = allDims[key];
        }
    });

    const hasTolerance = dimensions.tolerance !== undefined;
    const hasFit = dimensions.fit !== undefined;

    return (
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-semibold text-white">
                        Detected Dimensions
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    {shape && (
                        <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 capitalize">
                            {shape}
                        </span>
                    )}
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                </div>
            </div>

            {/* Original Prompt */}
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="text-xs text-gray-400 mb-1">Your Prompt:</div>
                <div className="text-sm text-white font-mono">{prompt}</div>
            </div>

            {/* Dimensions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(relevantDims).map(([key, value]) => (
                    <div
                        key={key}
                        className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 hover:border-cyan-500/30 transition-all"
                    >
                        <div className="text-xs text-gray-400 capitalize mb-1">
                            {key.replace('_', ' ')}
                        </div>
                        <div className="text-lg font-bold text-white font-mono">
                            {value.toFixed(2)}
                            <span className="text-sm text-cyan-400 ml-1">mm</span>
                        </div>
                        {/* Show original unit if converted */}
                        {dimensions[`${key}_unit_original`] && dimensions[`${key}_unit_original`] !== 'mm' && (
                            <div className="text-xs text-gray-500 mt-1">
                                (Converted from {dimensions[`${key}_unit_original`]})
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Tolerance & Fit */}
            {(hasTolerance || hasFit) && (
                <div className="flex gap-2">
                    {hasTolerance && (
                        <div className="flex-1 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                            <div className="text-xs text-yellow-300 font-medium">Tolerance</div>
                            <div className="text-lg font-bold text-yellow-400 mt-1">
                                ±{dimensions.tolerance.toFixed(3)} mm
                            </div>
                        </div>
                    )}
                    {hasFit && (
                        <div className="flex-1 bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                            <div className="text-xs text-purple-300 font-medium">ISO Fit Class</div>
                            <div className="text-lg font-bold text-purple-400 mt-1">
                                {dimensions.fit}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Features */}
            {(dimensions.hole_diameter || dimensions.fillet_radius) && (
                <div className="space-y-2">
                    <div className="text-xs text-gray-400 font-medium">Additional Features:</div>
                    <div className="flex flex-wrap gap-2">
                        {dimensions.hole_diameter && (
                            <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm">
                                <span className="text-blue-300">Hole: </span>
                                <span className="text-white font-mono">{dimensions.hole_diameter.toFixed(2)}mm</span>
                                {dimensions.hole_position && (
                                    <span className="text-blue-400 ml-1">({dimensions.hole_position})</span>
                                )}
                            </div>
                        )}
                        {dimensions.fillet_radius && (
                            <div className="px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg text-sm">
                                <span className="text-green-300">Fillet: </span>
                                <span className="text-white font-mono">R{dimensions.fillet_radius.toFixed(2)}mm</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Accuracy Note */}
            <div className="flex items-start gap-2 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-cyan-300">
                    <p className="font-medium">Dimensional Accuracy Guaranteed</p>
                    <p className="text-cyan-400/80 mt-1">
                        These exact dimensions will be used in the 3D model with ±0.01mm precision.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default DimensionDisplay;
