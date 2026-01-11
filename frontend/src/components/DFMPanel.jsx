import React from 'react';
import { AlertTriangle, CheckCircle, Info, X, Wrench, Zap } from 'lucide-react';

/**
 * DFMPanel - Design for Manufacturing Analysis Display
 * Shows manufacturability score, warnings, and suggestions
 */
export default function DFMPanel({ dfmData, onClose }) {
    if (!dfmData) return null;

    const { score, warnings, suggestions, recommended_process } = dfmData;

    const getScoreColor = (s) => {
        if (s >= 80) return 'from-emerald-500 to-green-600';
        if (s >= 60) return 'from-amber-500 to-yellow-600';
        return 'from-red-500 to-rose-600';
    };

    const getScoreLabel = (s) => {
        if (s >= 80) return 'Excellent';
        if (s >= 60) return 'Acceptable';
        return 'Needs Improvement';
    };

    const getSeverityIcon = (severity) => {
        if (severity === 'high') return <AlertTriangle size={16} className="text-red-400" />;
        if (severity === 'medium') return <Info size={16} className="text-amber-400" />;
        return <CheckCircle size={16} className="text-emerald-400" />;
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg mx-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                            <Wrench size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">DFM Analysis</h2>
                            <p className="text-sm text-white/50">Design for Manufacturing Check</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Score */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-white/70">Manufacturability Score</span>
                        <span className="text-sm font-bold text-white/90">{getScoreLabel(score)}</span>
                    </div>
                    <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getScoreColor(score)} transition-all duration-500`}
                            style={{ width: `${score}%` }}
                        />
                    </div>
                    <div className="mt-2 text-center">
                        <span className={`text-4xl font-black bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent`}>
                            {score}/100
                        </span>
                    </div>
                </div>

                {/* Warnings */}
                {warnings && warnings.length > 0 && (
                    <div className="p-6 border-b border-white/10">
                        <h3 className="text-sm font-bold text-white/70 mb-3 flex items-center gap-2">
                            <AlertTriangle size={16} /> WARNINGS ({warnings.length})
                        </h3>
                        <div className="space-y-3">
                            {warnings.map((w, i) => (
                                <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex items-start gap-2">
                                        {getSeverityIcon(w.severity)}
                                        <div className="flex-1">
                                            <p className="text-sm text-white/90">{w.message}</p>
                                            <p className="text-xs text-cyan-400 mt-1">💡 {w.suggestion}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommended Process */}
                <div className="p-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                        <div className="flex items-center gap-3">
                            <Zap size={20} className="text-cyan-400" />
                            <span className="text-sm font-medium text-white/70">Recommended Process</span>
                        </div>
                        <span className="text-lg font-bold text-white">{recommended_process}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
