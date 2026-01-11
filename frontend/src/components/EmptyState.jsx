import React from 'react';

/**
 * EmptyState - Shown when no model is generated yet
 * A sleek, animated placeholder to guide users
 */
export default function EmptyState() {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            {/* Animated CAD Icon */}
            <div className="relative mb-8">
                {/* Pulsing rings */}
                <div className="absolute inset-0 w-32 h-32 rounded-full border-2 border-cyan-500/30 animate-ping-slow" />
                <div className="absolute inset-0 w-32 h-32 rounded-full border border-purple-500/20 animate-ping-slower" />

                {/* Central icon */}
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-2xl shadow-cyan-500/20">
                    <svg
                        className="w-16 h-16 text-cyan-400/80"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {/* 3D Cube Icon */}
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
                            className="animate-draw"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"
                            className="animate-draw-delayed"
                        />
                    </svg>
                </div>
            </div>

            {/* Text */}
            <h3 className="text-2xl font-bold text-white/80 tracking-wider mb-2">
                No Model Yet
            </h3>
            <p className="text-sm text-white/40 tracking-wide max-w-xs text-center mb-6">
                Describe your part in the sidebar and click <span className="text-cyan-400 font-semibold">GENERATE</span>
            </p>

            {/* Keyboard shortcut hint */}
            <div className="flex items-center gap-2 text-xs text-white/30">
                <kbd className="px-2 py-1 rounded bg-white/10 border border-white/10 font-mono">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-2 py-1 rounded bg-white/10 border border-white/10 font-mono">Enter</kbd>
                <span className="ml-2">to generate</span>
            </div>

            <style>{`
                @keyframes ping-slow {
                    0% { transform: scale(1); opacity: 0.5; }
                    100% { transform: scale(1.8); opacity: 0; }
                }
                @keyframes ping-slower {
                    0% { transform: scale(1); opacity: 0.3; }
                    100% { transform: scale(2.2); opacity: 0; }
                }
                @keyframes draw {
                    0% { stroke-dashoffset: 100; }
                    100% { stroke-dashoffset: 0; }
                }
                .animate-ping-slow { animation: ping-slow 3s ease-out infinite; }
                .animate-ping-slower { animation: ping-slower 4s ease-out infinite 0.5s; }
                .animate-draw { 
                    stroke-dasharray: 100; 
                    animation: draw 2s ease-out forwards;
                }
                .animate-draw-delayed { 
                    stroke-dasharray: 100; 
                    animation: draw 2s ease-out forwards 0.5s;
                }
            `}</style>
        </div>
    );
}
