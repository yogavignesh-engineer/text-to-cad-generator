/**
 * ValidationDisplay Component
 * Shows dimensional accuracy validation results (Checkpoint #3)
 * Displays expected vs actual dimensions with error analysis
 */

import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export function ValidationDisplay({ validationData }) {
    if (!validationData) return null;

    const { valid, dimensions, message, file } = validationData;

    // Calculate overall accuracy
    const dimensionArray = dimensions ? Object.values(dimensions) : [];
    const avgError = dimensionArray.length > 0
        ? dimensionArray.reduce((sum, d) => sum + (d.error_mm || 0), 0) / dimensionArray.length
        : 0;

    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {valid ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                    )}
                    <h3 className="font-semibold text-white">
                        Dimensional Validation
                    </h3>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${valid
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                    {valid ? 'All Within Tolerance' : 'Check Dimensions'}
                </span>
            </div>

            {/* Message */}
            <div className={`flex items-start gap-2 p-3 rounded-lg ${valid
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-yellow-500/10 border border-yellow-500/20'
                }`}>
                <Info className={`w-4 h-4 flex-shrink-0 mt-0.5 ${valid ? 'text-green-400' : 'text-yellow-400'
                    }`} />
                <div className="flex-1">
                    <p className={`text-sm font-medium ${valid ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                        {message || 'Validation complete'}
                    </p>
                    {file && (
                        <p className="text-xs text-gray-400 mt-1">
                            Validated file: {file}
                        </p>
                    )}
                </div>
            </div>

            {/* Dimensions Table */}
            {dimensions && Object.keys(dimensions).length > 0 && (
                <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Dimension Analysis
                    </div>

                    <div className="space-y-2">
                        {Object.entries(dimensions).map(([dimName, dimData]) => {
                            const { expected_mm, actual_mm, error_mm, tolerance_met, error_percentage } = dimData;

                            return (
                                <div
                                    key={dimName}
                                    className="bg-white/5 rounded-lg p-3 border border-white/10"
                                >
                                    {/* Dimension Name */}
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-white capitalize">
                                            {dimName}
                                        </span>
                                        {tolerance_met ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 text-yellow-400" />
                                        )}
                                    </div>

                                    {/* Values */}
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div>
                                            <div className="text-gray-500">Expected</div>
                                            <div className="font-mono text-white">
                                                {expected_mm?.toFixed(3)} mm
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500">Actual</div>
                                            <div className="font-mono text-white">
                                                {actual_mm?.toFixed(3)} mm
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500">Error</div>
                                            <div className={`font-mono ${tolerance_met ? 'text-green-400' : 'text-yellow-400'
                                                }`}>
                                                ±{error_mm?.toFixed(4)} mm
                                            </div>
                                        </div>
                                    </div>

                                    {/* Error Bar */}
                                    <div className="mt-2">
                                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${tolerance_met ? 'bg-green-500' : 'bg-yellow-500'
                                                    }`}
                                                style={{
                                                    width: `${Math.min(100, (error_percentage || 0) * 100)}%`
                                                }}
                                            />
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-1 text-right">
                                            {error_percentage?.toFixed(4)}% deviation
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                <div className="text-center p-2 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-400">
                        {dimensionArray.filter(d => d.tolerance_met).length}/{dimensionArray.length}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                        Within Tolerance
                    </div>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-400">
                        ±{avgError.toFixed(4)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                        Avg Error (mm)
                    </div>
                </div>
            </div>

            {/* Tolerance Info */}
            <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-300">
                    <p className="font-medium">Engineering Tolerance: ±0.01mm</p>
                    <p className="text-blue-400/80 mt-1">
                        All dimensions are validated against industrial precision standards.
                        Values within ±0.01mm are considered exact for most engineering applications.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ValidationDisplay;
