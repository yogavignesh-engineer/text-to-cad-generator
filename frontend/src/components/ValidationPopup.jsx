import React from 'react';
import { AlertTriangle, AlertCircle, Lightbulb } from 'lucide-react';

// ===== VALIDATION POPUP =====
export default function ValidationPopup({ validation, onClose, onProceed }) {
    if (!validation || validation.valid) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[10000] animate-fade-in" onClick={onClose}>
            <div
                className="bg-gradient-to-br from-red-600/95 to-red-800/95 border-2 border-white/20 rounded-3xl p-10 max-w-[500px] max-h-[80vh] overflow-y-auto shadow-2xl shadow-red-600/50 animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-4 mb-6">
                    <AlertTriangle size={32} color="#fff" />
                    <h2 className="text-2xl text-white font-bold m-0">
                        {validation.errors ? 'Validation Errors' : 'Warnings & Suggestions'}
                    </h2>
                </div>

                <div className="mb-6">
                    {validation.errors?.map((error, i) => (
                        <div key={i} className="bg-white/15 p-3 rounded-xl mb-2 text-white text-sm flex items-center gap-2.5">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    ))}

                    {validation.warnings?.map((warning, i) => (
                        <div key={`w${i}`} className="bg-amber-400/20 p-3 rounded-xl mb-2 text-white text-sm flex items-center gap-2.5">
                            <AlertTriangle size={18} />
                            {warning}
                        </div>
                    ))}

                    {validation.suggestions?.map((suggestion, i) => (
                        <div key={`s${i}`} className="bg-neonc/20 p-3 rounded-xl mb-2 text-white text-sm flex items-start gap-2.5">
                            <Lightbulb size={18} className="mt-0.5 shrink-0" />
                            <span>{suggestion}</span>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 p-3.5 bg-white/20 border border-white/30 rounded-xl text-white text-sm font-semibold cursor-pointer transition-all duration-300 hover:bg-white/30"
                    >
                        Edit Prompt
                    </button>

                    {!validation.errors && (
                        <button
                            onClick={onProceed}
                            className="flex-1 p-3.5 bg-white/90 border-none rounded-xl text-red-600 text-sm font-bold cursor-pointer transition-all duration-300 hover:bg-white hover:scale-105"
                        >
                            Proceed Anyway
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
