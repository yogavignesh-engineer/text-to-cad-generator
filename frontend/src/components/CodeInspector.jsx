/**
 * CodeInspector Component
 * View and edit FreeCAD Python script before execution
 * Phase 4: Dual-Mode Interface - Advanced Mode
 */

import { useState } from 'react';
import { Code, Copy, Check, Download } from 'lucide-react';

export function CodeInspector({ script, onScriptChange, readOnly = false }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(script);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([script], { type: 'text/x-python' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'freecad_script.py';
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!script) {
        return (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                <Code className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Generate a model to view the FreeCAD script</p>
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-semibold text-white">FreeCAD Python Script</h3>
                    {readOnly && (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
                            Read Only
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-all flex items-center gap-2"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-all flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </button>
                </div>
            </div>

            {/* Code Editor */}
            <div className="relative">
                <textarea
                    value={script}
                    onChange={(e) => !readOnly && onScriptChange && onScriptChange(e.target.value)}
                    readOnly={readOnly}
                    className="w-full h-96 p-4 bg-gray-900/50 text-gray-100 font-mono text-sm resize-none focus:outline-none overflow-auto"
                    spellCheck={false}
                    style={{
                        lineHeight: '1.5',
                        tabSize: 4
                    }}
                />

                {/* Line Numbers (simplified) */}
                <div className="absolute top-0 left-0 p-4 text-gray-600 font-mono text-sm select-none pointer-events-none">
                    {script.split('\n').map((_, i) => (
                        <div key={i} style={{ lineHeight: '1.5' }}>
                            {i + 1}
                        </div>
                    ))}
                </div>
            </div>

            {/* Info */}
            <div className="px-4 py-3 border-t border-white/10 bg-white/5">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{script.split('\n').length} lines</span>
                    <span>•</span>
                    <span>{script.length} characters</span>
                    {!readOnly && (
                        <>
                            <span>•</span>
                            <span className="text-yellow-400">⚠️ Edit at your own risk</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CodeInspector;
