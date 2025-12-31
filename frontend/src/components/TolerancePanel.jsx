import React, { useState } from 'react';
import { Ruler, X, ArrowRight } from 'lucide-react';

// ===== TOLERANCE PANEL =====
export default function TolerancePanel({ onClose }) {
    const [holeSize, setHoleSize] = useState(10);
    const [tolClass, setTolClass] = useState('H7/g6');
    const [result, setResult] = useState(null);

    const calculateTolerance = () => {
        // Simplified ISO 286 simulation
        let holeTol = [0, 0.015]; // Default H7 like
        let shaftTol = [-0.014, -0.005]; // Default g6 like

        if (tolClass === 'H7/h6') { shaftTol = [0, -0.009]; }
        if (tolClass === 'H7/p6') { shaftTol = [0.024, 0.015]; holeTol = [0, 0.015]; } // Interference

        const clearanceMax = (holeSize + holeTol[1]) - (holeSize + shaftTol[1]);
        const clearanceMin = (holeSize + holeTol[0]) - (holeSize + shaftTol[0]);

        setResult({
            hole: { upper: (holeSize + holeTol[1]).toFixed(3), lower: (holeSize + holeTol[0]).toFixed(3) },
            shaft: { upper: (holeSize + shaftTol[0]).toFixed(3), lower: (holeSize + shaftTol[1]).toFixed(3) },
            clearanceMax: clearanceMax.toFixed(3),
            clearanceMin: clearanceMin.toFixed(3)
        });
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mt-4 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 cursor-pointer text-white/50 hover:text-white transition-colors" onClick={onClose}>
                <X size={16} />
            </div>

            <div className="flex items-center gap-2 mb-4 text-neona">
                <Ruler size={18} />
                <h3 className="font-bold text-sm tracking-wider">ISO TOLERANCE CALC</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                    <label className="block text-xs text-white/50 mb-1">Nominal (mm)</label>
                    <input
                        type="number"
                        value={holeSize}
                        onChange={e => setHoleSize(Number(e.target.value))}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-neona focus:outline-none transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-xs text-white/50 mb-1">Fit Class</label>
                    <select
                        value={tolClass}
                        onChange={e => setTolClass(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-neona focus:outline-none transition-colors appearance-none"
                    >
                        <option value="H7/g6">H7/g6 (Slide)</option>
                        <option value="H7/h6">H7/h6 (Locational)</option>
                        <option value="H7/p6">H7/p6 (Press)</option>
                    </select>
                </div>
            </div>

            <button
                onClick={calculateTolerance}
                className="w-full bg-neona/20 border border-neona/50 rounded-lg p-2 text-neona text-xs font-bold uppercase tracking-wider mb-4 hover:bg-neona/30 transition-all flex items-center justify-center gap-2"
            >
                Calculate <ArrowRight size={14} />
            </button>

            {result && (
                <div className="grid gap-2 text-sm bg-black/20 p-3 rounded-lg border border-white/5">
                    <div className="flex justify-between">
                        <span className="text-white/70">Hole: H7</span>
                        <span className="text-white font-mono font-semibold">{result.hole.lower} - {result.hole.upper}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/70">Shaft: {tolClass.split('/')[1]}</span>
                        <span className="text-white font-mono font-semibold">{result.shaft.lower} - {result.shaft.upper}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-neona/30 mt-1">
                        <span className="text-white/90 font-semibold">Fit:</span>
                        <span className="text-neona font-bold font-mono">{result.clearanceMin} to {result.clearanceMax}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
