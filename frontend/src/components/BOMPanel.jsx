import React from 'react';
import { Package, X } from 'lucide-react';

// ===== BOM PANEL =====
export default function BOMPanel({ bom, onClose }) {
    if (!bom) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-[400px] h-full bg-black/90 backdrop-blur-3xl shadow-2xl z-[500] border-l border-neonp/20 animate-fade-in flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-neonp/5 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="bg-neonp/20 p-2 rounded-lg">
                        <Package size={20} className="text-neonp" />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-widest m-0">BILL OF MATERIALS</h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white/70 hover:text-white"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 text-white/90">
                <div className="mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="text-xs text-white/50 uppercase tracking-widest mb-1">Total Estimated Cost</div>
                    <div className="text-3xl font-bold text-neonp font-mono">
                        ${bom.cost.toFixed(2)}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <div className="text-xs text-white/50 uppercase tracking-widest mb-3 pb-2 border-b border-white/10">Parameters</div>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                            <span className="text-white/70">Material</span>
                            <span className="text-right font-semibold capitalize">{bom.material.replace('_', ' ')}</span>

                            <span className="text-white/70">Density</span>
                            <span className="text-right font-mono">{bom.density} g/cm³</span>

                            <span className="text-white/70">Volume</span>
                            <span className="text-right font-mono">{bom.volume.toFixed(2)} cm³</span>

                            <span className="text-white/70">Mass</span>
                            <span className="text-right font-mono">{bom.mass.toFixed(2)} g</span>
                        </div>
                    </div>

                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <div className="text-xs text-white/50 uppercase tracking-widest mb-3 pb-2 border-b border-white/10">Cost Breakdown</div>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                            <span className="text-white/70">Material Cost</span>
                            <span className="text-right font-mono">${(bom.mass * bom.pricePerGram).toFixed(2)}</span>

                            <div className="col-span-2 text-xs text-white/40 italic mt-1">
                                * Based on market average of ${bom.pricePerGram}/g
                            </div>
                        </div>
                    </div>

                    <div className="bg-neonp/10 p-4 rounded-xl border border-neonp/30">
                        <div className="text-xs text-neonp uppercase tracking-widest mb-2 font-bold">Manufacturability</div>
                        <p className="text-xs leading-relaxed text-white/80">
                            Design is suitable for {bom.material === 'plastic' ? 'FDM/SLA 3D Printing' : 'CNC Machining or DMLS'}.
                            Ensure wall thickness &gt; {bom.material === 'plastic' ? '1.2mm' : '0.8mm'} for structural integrity.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
