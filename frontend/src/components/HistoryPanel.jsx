import React, { useRef, useEffect } from 'react';
import { History, X, ChevronRight, Clock, Box } from 'lucide-react';

// ===== HISTORY PANEL =====
export default function HistoryPanel({ history, onSelect, onClose }) {
    const panelRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div className="fixed inset-y-0 left-0 w-[400px] h-full bg-black/90 backdrop-blur-3xl shadow-2xl z-[500] border-r border-neonc/20 animate-fade-in" ref={panelRef}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-neonc/5 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="bg-neonc/20 p-2 rounded-lg">
                        <History size={20} className="text-neonc" />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-widest m-0">HISTORY</h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white/70 hover:text-white"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="overflow-y-auto h-[calc(100%-80px)] p-6 flex flex-col gap-4">
                {history.length === 0 ? (
                    <div className="text-center text-white/40 mt-12 flex flex-col items-center gap-4">
                        <Clock size={48} className="opacity-50" />
                        <p className="text-sm">No history yet. Generate something!</p>
                    </div>
                ) : (
                    history.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => { onSelect(item); onClose(); }}
                            className="group bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-neonc/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-neonc/10 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-neonc/10 to-transparent rounded-bl-3xl -mr-4 -mt-4 transition-all group-hover:from-neonc/20" />

                            <div className="flex items-start justify-between mb-2">
                                <span className="text-[0.65rem] text-white/50 font-mono">
                                    {new Date(item.timestamp).toLocaleTimeString()}
                                </span>
                                <div className="bg-white/10 px-2 py-0.5 rounded text-[0.6rem] text-white/70 uppercase tracking-wider font-bold">
                                    {item.material}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-neonc/10 p-1.5 rounded text-neonc">
                                    <Box size={14} />
                                </div>
                                <h3 className="text-white font-semibold text-sm truncate">{item.shape}</h3>
                            </div>

                            <p className="text-white/70 text-xs line-clamp-2 leading-relaxed pl-1 border-l-2 border-white/10 group-hover:border-neonc/50 transition-colors">
                                {item.prompt}
                            </p>

                            <div className="absolute bottom-3 right-3 opacity-0 transform translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                                <ChevronRight size={16} className="text-neonc" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
