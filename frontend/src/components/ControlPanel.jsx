import React, { useState } from 'react';
import { Sparkles, History, Settings, RotateCcw, Box, Layers, Play, Download, X, FileDown, Package, Code } from 'lucide-react';
import MaterialSelector from './MaterialSelector';

export default function ControlPanel({
    darkMode, prompt, setPrompt, loading, generateCAD, handleUndo, handleRedo,
    historyIndex, historyLength, showDimensions, setShowDimensions, showHistory, setShowHistory,
    showTolerance, setShowTolerance, showTestPrompts, setShowTestPrompts, validatePrompt,
    validation, parsedParameters, useAI, setUseAI, stlBlob, stepUrl, downloadFile,
    material, setMaterial, shakeButton,
    downloadCode, isOpen, setIsOpen,
    generatedCode, scriptId // NEW PROP: scriptId
}) {
    const [activeTab, setActiveTab] = useState('input'); // input | code

    const quickPrompts = [
        "50x50x10mm steel plate",
        "M6 bolt 40mm length",
        "gear with 24 teeth",
        "piston 60mm diameter"
    ];

    return (
        <aside className={`
      fixed left-[30px] top-[30px] bottom-[30px] w-full max-w-[440px] 
      bg-white/95 dark:bg-[#0a0f23]/85 backdrop-blur-2xl saturate-[1.8]
      rounded-[32px] border-2 border-black/10 dark:border-neonc/15
      shadow-[0_0_100px_rgba(0,0,0,0.1)] dark:shadow-[0_0_100px_rgba(102,126,234,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]
      flex flex-col z-[100] overflow-hidden
      transition-all duration-300 transform
      ${isOpen ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0'} 
    `}>
            {/* Header & Tabs */}
            <div className="p-8 pb-4 border-b border-black/10 dark:border-white/10 shrink-0">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-[52px] h-[52px] bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center shadow-lg shadow-[#667eea]/40">
                            <Sparkles size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-[2.2rem] font-black bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb] bg-clip-text text-transparent tracking-[5px] mb-1">
                                NEURAL CAD
                            </h1>
                            <p className="text-xs text-black/50 dark:text-white/50 tracking-[3px]">
                                v6.0 AWARD-WINNING
                            </p>
                        </div>
                    </div>
                    <button className="lg:hidden p-2 text-black/50 dark:text-white/50" onClick={() => setIsOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                {/* Modern Tabs */}
                <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-xl">
                    <button
                        onClick={() => setActiveTab('input')}
                        className={`flex-1 py-3 rounded-lg text-sm font-bold tracking-wider transition-all
                ${activeTab === 'input' ? 'bg-white dark:bg-[#764ba2] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
                    >
                        GENERATOR
                    </button>
                    <button
                        onClick={() => setActiveTab('code')}
                        className={`flex-1 py-3 rounded-lg text-sm font-bold tracking-wider transition-all flex items-center justify-center gap-2
                ${activeTab === 'code' ? 'bg-white dark:bg-[#764ba2] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
                    >
                        <Code size={16} /> SCRIPT
                        {generatedCode && <span className="w-2 h-2 rounded-full bg-neonc animate-pulse" />}
                    </button>
                </div>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-10 pt-6 scrollbar-hide">

                {activeTab === 'input' ? (
                    <div className="flex flex-col gap-6">

                        {/* Prompt Section */}
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-black/50 dark:text-white/50 tracking-[2px] uppercase">
                                    Prompt Input
                                </label>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setUseAI(!useAI)} className={`px-2 py-1 rounded-full text-[0.6rem] font-bold tracking-wider transition-all border ${useAI ? 'bg-neong/20 border-neong text-neong' : 'bg-black/5 dark:bg-white/5 border-transparent text-gray-500'}`}>
                                        AI {useAI ? 'ON' : 'OFF'}
                                    </button>
                                    <div className="flex gap-1">
                                        <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-black dark:text-white transition-all"><RotateCcw size={14} /></button>
                                        <button onClick={handleRedo} disabled={historyIndex >= historyLength - 1} className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-black dark:text-white transition-all transform scale-x-[-1]"><RotateCcw size={14} /></button>
                                    </div>
                                </div>
                            </div>

                            <div className="relative group">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => { setPrompt(e.target.value); validatePrompt(); }}
                                    placeholder="Describe your 3D part..."
                                    className="w-full h-32 bg-white/50 dark:bg-black/20 border-2 border-black/10 dark:border-white/10 rounded-2xl p-4 text-black dark:text-white placeholder-black/30 dark:placeholder-white/30 resize-none focus:outline-none focus:border-neonc/50 focus:bg-white/80 dark:focus:bg-black/40 transition-all font-medium backdrop-blur-sm"
                                />
                                {/* Validation Indicator */}
                                {validation && (
                                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                        {validation.valid ? (
                                            <span className="text-[0.65rem] font-bold text-neong bg-neong/10 px-2 py-1 rounded-full border border-neong/20 animate-fade-in">
                                                VALID {validation.shape.toUpperCase()}
                                            </span>
                                        ) : (
                                            <span className="text-[0.65rem] font-bold text-neonr bg-neonr/10 px-2 py-1 rounded-full border border-neonr/20 animate-pulse">
                                                INVALID
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Test Prompts Toggle */}
                            <button
                                onClick={() => setShowTestPrompts(!showTestPrompts)}
                                className="flex justify-between items-center w-full text-[0.7rem] font-medium text-black/40 dark:text-white/40 hover:text-neonc transition-colors px-1"
                            >
                                <span>Need inspiration? Try example prompts</span>
                                <span>{showTestPrompts ? '−' : '+'}</span>
                            </button>

                            {/* Test Prompts Dropdown */}
                            {showTestPrompts && (
                                <div className="grid grid-cols-1 gap-2 animate-slide-up">
                                    {quickPrompts.map((p, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setPrompt(p); validatePrompt(); }}
                                            className="text-left text-xs p-3 bg-black/5 dark:bg-white/5 rounded-xl text-black/70 dark:text-white/70 hover:bg-neonc/10 hover:text-neonc border border-transparent hover:border-neonc/30 transition-all"
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Parsed Parameters Display */}
                        {parsedParameters && (parsedParameters.dimensions.length || parsedParameters.dimensions.diameter) && (
                            <div className="grid grid-cols-2 gap-2 animate-fade-in">
                                {Object.entries(parsedParameters.dimensions).slice(0, 4).map(([key, val]) => (
                                    <div key={key} className="bg-black/5 dark:bg-white/5 p-2 rounded-lg border border-black/5 dark:border-white/5">
                                        <div className="text-[0.6rem] text-black/40 dark:text-white/40 uppercase tracking-wider mb-0.5">{key}</div>
                                        <div className="text-sm font-mono font-bold text-neonc">{typeof val === 'number' ? val.toFixed(1) : val}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Material Selector */}
                        <MaterialSelector currentMaterial={material} setMaterial={setMaterial} />

                        {/* Action Buttons */}
                        <div className="grid grid-cols-4 gap-3">
                            <button
                                onClick={() => setShowHistory(true)}
                                className="col-span-1 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border-2 border-transparent hover:border-black/10 dark:hover:border-white/10 text-black dark:text-white flex flex-col items-center justify-center gap-1 transition-all"
                            >
                                <History size={18} />
                            </button>

                            <button
                                onClick={() => generateCAD(false)}
                                disabled={loading || !prompt.trim()}
                                className={`
                        col-span-3 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm tracking-widest text-white shadow-lg transition-all
                        ${loading ? 'bg-gray-500 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-[#b026ff] to-[#667eea] hover:shadow-neonc/50 hover:scale-[1.02] active:scale-[0.98]'}
                        ${shakeButton ? 'animate-shake' : ''}
                    `}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        PROCESSING
                                    </>
                                ) : (
                                    <>
                                        <Play size={18} fill="currentColor" /> GENERATE
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Tools Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setShowDimensions(!showDimensions)}
                                className={`p-3 rounded-xl border border-black/10 dark:border-white/10 flex flex-col items-center justify-center gap-1.5 transition-all
                        ${showDimensions ? 'bg-neonc/20 border-neonc/50 text-white' : 'bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10'}`}
                            >
                                <Layers size={18} />
                                <span className="text-[0.6rem] font-bold tracking-wider">DIMS</span>
                            </button>

                            <button
                                onClick={() => setShowTolerance(true)}
                                className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10 flex flex-col items-center justify-center gap-1.5 transition-all"
                            >
                                <Settings size={18} />
                                <span className="text-[0.6rem] font-bold tracking-wider">TOL</span>
                            </button>

                            <button className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10 flex flex-col items-center justify-center gap-1.5 transition-all">
                                <Box size={18} />
                                <span className="text-[0.6rem] font-bold tracking-wider">VIEW</span>
                            </button>
                        </div>

                        {/* Download Buttons - Always visible for discovery */}
                        <div className="grid grid-cols-2 gap-3 animate-slide-up mt-auto">
                            <button
                                onClick={() => downloadFile(stlBlob, `NeuralCAD_Model_${Date.now()}.stl`, 'model/stl')}
                                disabled={!stlBlob}
                                className={`p-4 px-3 flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 text-xs font-semibold transition-all
            ${stlBlob ? 'bg-neonc/20 border-neonc/50 text-white hover:bg-neonc/30 cursor-pointer' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-black/20 dark:text-white/20 cursor-not-allowed'}`}
                            >
                                <Download size={18} /> STL
                            </button>

                            <button
                                onClick={downloadCode}
                                disabled={!scriptId}
                                className={`p-4 px-3 flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 text-xs font-semibold transition-all
            ${scriptId ? 'bg-gray-100 dark:bg-white/10 border-gray-200 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 cursor-pointer' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-black/20 dark:text-white/20 cursor-not-allowed'}`}
                            >
                                <Code size={18} /> CODE
                            </button>

                            {/* Advanced Formats (Optional/Paid Feature in real app, here we show them disabled if not ready) */}
                            <button
                                onClick={() => downloadFile(stlBlob, `NeuralCAD_Model_${Date.now()}.step`, 'application/step')}
                                disabled={!stepUrl && !stlBlob} // Fallback to STL blob for demo if stepUrl missing, or just disabled
                                className={`hidden md:flex p-4 px-3 flex-col items-center justify-center gap-1.5 rounded-xl border-2 text-xs font-semibold transition-all
            ${stlBlob ? 'bg-neonp/20 border-neonp/50 text-white hover:bg-neonp/30 cursor-pointer' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-black/20 dark:text-white/20 cursor-not-allowed'}`}
                            >
                                <FileDown size={18} /> STEP
                            </button>

                            <button
                                onClick={() => downloadFile(stlBlob, `NeuralCAD_Model_${Date.now()}.iges`, 'model/iges')}
                                disabled={!stepUrl && !stlBlob}
                                className={`hidden md:flex p-4 px-3 flex-col items-center justify-center gap-1.5 rounded-xl border-2 text-xs font-semibold transition-all
            ${stlBlob ? 'bg-neona/20 border-neona/50 text-white hover:bg-neona/30 cursor-pointer' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-black/20 dark:text-white/20 cursor-not-allowed'}`}
                            >
                                <Package size={18} /> IGES
                            </button>
                        </div>
                    </div>
                ) : (
                    // CODE VIEW TAB
                    <div className="h-full flex flex-col gap-4 animate-fade-in text-left">
                        <div className="flex justify-between items-center">
                            <h3 className="text-white font-bold text-sm tracking-widest uppercase">Generated Script</h3>
                            <button onClick={downloadCode} className="text-xs text-neonc hover:underline decoration-neonc/50 underline-offset-4 font-mono">Download .py</button>
                        </div>
                        <div className="flex-1 bg-[#151515] rounded-xl p-4 border border-white/10 overflow-auto shadow-inner relative group">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] text-white/30 font-mono">Python 3.10</span>
                            </div>
                            <pre className="font-mono text-[10px] leading-relaxed text-gray-300 whitespace-pre-wrap break-all">
                                {generatedCode || "# No code generated yet.\n# Create a model to see the magic!\n# Uses FreeCAD >= 0.21"}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
