/**
 * CostEstimator Component
 * Estimate manufacturing cost based on volume and material
 * Phase 7: Advanced Features
 */

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Package, Clock } from 'lucide-react';

export function CostEstimator({ volume, material, dimensions }) {
    const [manufacturingMethod, setManufacturingMethod] = useState('3d_print');
    const [quantity, setQuantity] = useState(1);

    const methods = {
        '3d_print': { name: '3D Printing', setup: 5, hourly: 15, multiplier: 1.5 },
        'cnc': { name: 'CNC Machining', setup: 50, hourly: 80, multiplier: 2.5 },
        'injection': { name: 'Injection Molding', setup: 5000, hourly: 5, multiplier: 0.5 }
    };

    const calculateCost = () => {
        if (!volume || !material) return null;

        // Volume in cm³ (convert from mm³)
        const volumeCm3 = volume / 1000;

        // Material cost
        const mass = volumeCm3 * material.density; // grams
        const materialCost = (mass / 1000) * material.cost;

        // Manufacturing cost
        const method = methods[manufacturingMethod];
        const estimatedTime = volumeCm3 * 0.1; // Simplified: 0.1 hours per cm³
        const manufacturingCost = method.setup + (estimatedTime * method.hourly);

        // Per-unit cost
        const perUnitCost = (materialCost * method.multiplier) + (manufacturingCost / quantity);

        // Total cost
        const totalCost = perUnitCost * quantity;

        return {
            material: materialCost,
            manufacturing: manufacturingCost,
            perUnit: perUnitCost,
            total: totalCost,
            time: estimatedTime,
            mass: mass
        };
    };

    const cost = calculateCost();

    if (!cost) {
        return (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Generate a model and select a material to see cost estimation</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Cost Estimation</h3>
            </div>

            {/* Manufacturing Method */}
            <div>
                <label className="text-sm text-gray-400 mb-2 block">Manufacturing Method</label>
                <div className="grid grid-cols-1 gap-2">
                    {Object.entries(methods).map(([id, method]) => (
                        <button
                            key={id}
                            onClick={() => setManufacturingMethod(id)}
                            className={`
                text-left p-3 rounded-lg border transition-all
                ${manufacturingMethod === id
                                    ? 'bg-green-500/20 border-green-500/50 shadow-lg'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }
              `}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className={`font-medium ${manufacturingMethod === id ? 'text-white' : 'text-gray-300'}`}>
                                        {method.name}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Setup: ${method.setup} | Hourly: ${method.hourly}/hr
                                    </div>
                                </div>
                                {manufacturingMethod === id && (
                                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                                            <path d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Quantity */}
            <div>
                <label className="text-sm text-gray-400 mb-2 block">Quantity</label>
                <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                />
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2">
                <div className="text-sm font-medium text-gray-400">Cost Breakdown</div>

                {/* Material Cost */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-300">Material ({cost.mass.toFixed(2)}g)</span>
                    </div>
                    <span className="font-mono text-white">${cost.material.toFixed(2)}</span>
                </div>

                {/* Manufacturing Cost */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-300">Manufacturing ({cost.time.toFixed(1)}hrs)</span>
                    </div>
                    <span className="font-mono text-white">${cost.manufacturing.toFixed(2)}</span>
                </div>

                {/* Estimated Time */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm text-gray-300">Production Time</span>
                    </div>
                    <span className="font-mono text-white">{(cost.time * quantity).toFixed(1)} hours</span>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl">
                    <div className="text-xs text-green-300 mb-1">Per Unit</div>
                    <div className="text-2xl font-bold text-white">${cost.perUnit.toFixed(2)}</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl">
                    <div className="text-xs text-purple-300 mb-1">Total ({quantity} units)</div>
                    <div className="text-2xl font-bold text-white">${cost.total.toFixed(2)}</div>
                </div>
            </div>

            {/* Notes */}
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs">
                <div className="flex items-start gap-2">
                    <span className="text-yellow-400">ℹ️</span>
                    <div className="text-yellow-300">
                        <p className="font-medium">Estimation Only</p>
                        <p className="text-yellow-400/80 mt-1">
                            Costs are estimates based on standard rates. Actual costs may vary based on complexity,
                            tolerances, finishing requirements, and supplier rates. Contact manufacturers for quotes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Volume Discount */}
            {quantity >= 100 && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-300">
                    <p className="font-medium">💰 Volume Discount Opportunity</p>
                    <p className="text-green-400/80 mt-1">
                        Orders over 100 units typically qualify for 15-30% bulk discounts. Consider reaching out for quotes.
                    </p>
                </div>
            )}
        </div>
    );
}

export default CostEstimator;
