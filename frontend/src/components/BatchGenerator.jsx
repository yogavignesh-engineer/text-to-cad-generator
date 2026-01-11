/**
 * BatchGenerator Component
 * Generate multiple variations of a model at once
 * Phase 7: Advanced Features
 */

import { useState } from 'react';
import { Layers, Plus, X, Zap } from 'lucide-react';

export function BatchGenerator({ onBatchGenerate }) {
    const [basePrompt, setBasePrompt] = useState('');
    const [variations, setVariations] = useState([
        { id: 1, parameter: 'diameter', values: '20, 30, 40' }
    ]);

    const addVariation = () => {
        setVariations([
            ...variations,
            { id: Date.now(), parameter: '', values: '' }
        ]);
    };

    const removeVariation = (id) => {
        setVariations(variations.filter(v => v.id !== id));
    };

    const updateVariation = (id, field, value) => {
        setVariations(variations.map(v =>
            v.id === id ? { ...v, [field]: value } : v
        ));
    };

    const calculateCombinations = () => {
        return variations.reduce((total, v) => {
            const values = v.values.split(',').map(val => val.trim()).filter(val => val);
            return total * (values.length || 1);
        }, 1);
    };

    const handleGenerate = () => {
        const batchConfig = {
            basePrompt,
            variations: variations.map(v => ({
                parameter: v.parameter,
                values: v.values.split(',').map(val => val.trim()).filter(val => val)
            }))
        };

        onBatchGenerate(batchConfig);
    };

    const combinations = calculateCombinations();

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Batch Generator</h3>
            </div>

            {/* Base Prompt */}
            <div>
                <label className="text-sm text-gray-400 mb-2 block">Base Prompt</label>
                <input
                    type="text"
                    value={basePrompt}
                    onChange={(e) => setBasePrompt(e.target.value)}
                    placeholder="e.g., cylinder {diameter}mm diameter, 100mm height"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Use {'{parameter}'} as placeholder for variables
                </p>
            </div>

            {/* Variations */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white">Parameter Variations</label>
                    <button
                        onClick={addVariation}
                        className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Parameter
                    </button>
                </div>

                {variations.map((variation) => (
                    <div
                        key={variation.id}
                        className="bg-white/5 border border-white/10 rounded-lg p-3 flex gap-3"
                    >
                        <div className="flex-1 grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Parameter Name</label>
                                <input
                                    type="text"
                                    value={variation.parameter}
                                    onChange={(e) => updateVariation(variation.id, 'parameter', e.target.value)}
                                    placeholder="diameter"
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Values (comma-separated)</label>
                                <input
                                    type="text"
                                    value={variation.values}
                                    onChange={(e) => updateVariation(variation.id, 'values', e.target.value)}
                                    placeholder="20, 30, 40"
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>
                        </div>
                        {variations.length > 1 && (
                            <button
                                onClick={() => removeVariation(variation.id)}
                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all self-center"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <div className="text-xs text-purple-300">Total Combinations</div>
                    <div className="text-2xl font-bold text-purple-400 mt-1">{combinations}</div>
                </div>
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <div className="text-xs text-cyan-300">Parameters</div>
                    <div className="text-2xl font-bold text-cyan-400 mt-1">{variations.length}</div>
                </div>
            </div>

            {/* Example Output */}
            {basePrompt && variations[0].parameter && variations[0].values && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="text-xs text-blue-300 mb-2">Example Outputs:</div>
                    <div className="space-y-1">
                        {variations[0].values.split(',').slice(0, 3).map((val, i) => {
                            const example = basePrompt.replace(`{${variations[0].parameter}}`, val.trim());
                            return (
                                <div key={i} className="text-xs text-blue-400 font-mono">
                                    {i + 1}. {example}
                                </div>
                            );
                        })}
                        {variations[0].values.split(',').length > 3 && (
                            <div className="text-xs text-blue-400/60">
                                ... and {variations[0].values.split(',').length - 3} more
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={!basePrompt || combinations === 0}
                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
                <Zap className="w-5 h-5" />
                Generate {combinations} Models
            </button>

            {/* Warning */}
            {combinations > 10 && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-2">
                    <span className="text-yellow-400 text-xs">⚠️</span>
                    <div className="text-xs text-yellow-300">
                        <p className="font-medium">Large Batch Warning</p>
                        <p className="text-yellow-400/80 mt-1">
                            Generating {combinations} models may take several minutes. Consider reducing variations or run in smaller batches.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BatchGenerator;
