import React from 'react';
import { IndianRupee, Clock, Package, Scale, X, TrendingDown } from 'lucide-react';

/**
 * CostPanel - Manufacturing Cost Estimation Display
 * Shows material, machining, and total costs in Indian Rupees (₹)
 */
export default function CostPanel({ costData, onClose }) {
    if (!costData) return null;

    const {
        material_cost,
        machining_time_min,
        machining_cost,
        setup_cost,
        total_cost,
        weight_grams,
        volume_cm3,
        qty_pricing,
        currency = "₹"
    } = costData;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg mx-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                            <IndianRupee size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Cost Estimate</h2>
                            <p className="text-sm text-white/50">Manufacturing cost in INR (₹)</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Total Cost Hero */}
                <div className="p-6 border-b border-white/10 text-center">
                    <p className="text-sm text-white/50 mb-2">Estimated Unit Cost</p>
                    <span className="text-5xl font-black bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                        ₹{total_cost}
                    </span>
                    <p className="text-xs text-white/40 mt-2">INR per unit (single quantity)</p>
                </div>

                {/* Cost Breakdown */}
                <div className="p-6 border-b border-white/10">
                    <h3 className="text-sm font-bold text-white/70 mb-4">COST BREAKDOWN</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                            <div className="flex items-center gap-2">
                                <Package size={16} className="text-blue-400" />
                                <span className="text-sm text-white/70">Material Cost</span>
                            </div>
                            <span className="font-bold text-white">₹{material_cost}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-amber-400" />
                                <span className="text-sm text-white/70">Machining ({machining_time_min} min)</span>
                            </div>
                            <span className="font-bold text-white">₹{machining_cost}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                            <div className="flex items-center gap-2">
                                <Scale size={16} className="text-purple-400" />
                                <span className="text-sm text-white/70">Setup Cost</span>
                            </div>
                            <span className="font-bold text-white">₹{setup_cost}</span>
                        </div>
                    </div>
                </div>

                {/* Part Info */}
                <div className="p-6 border-b border-white/10">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-xl bg-white/5 text-center">
                            <p className="text-xs text-white/50 mb-1">Weight</p>
                            <p className="text-lg font-bold text-white">{weight_grams}g</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 text-center">
                            <p className="text-xs text-white/50 mb-1">Volume</p>
                            <p className="text-lg font-bold text-white">{volume_cm3} cm³</p>
                        </div>
                    </div>
                </div>

                {/* Quantity Pricing */}
                <div className="p-6">
                    <h3 className="text-sm font-bold text-white/70 mb-4 flex items-center gap-2">
                        <TrendingDown size={16} /> QUANTITY DISCOUNTS
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                        {Object.entries(qty_pricing).map(([qty, price]) => (
                            <div key={qty} className="p-3 rounded-xl bg-white/5 text-center border border-white/10 hover:border-emerald-500/50 transition-colors">
                                <p className="text-lg font-bold text-emerald-400">₹{price}</p>
                                <p className="text-xs text-white/50">{qty} unit{qty > 1 ? 's' : ''}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

