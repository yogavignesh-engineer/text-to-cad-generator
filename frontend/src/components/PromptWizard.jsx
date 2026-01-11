/**
 * PromptWizard Component
 * Guided 3-step prompt builder for beginner mode
 * Phase 4: Dual-Mode Interface - Beginner Mode
 */

import { useState } from 'react';
import { Box, Circle, Cog, ChevronRight, Wand2 } from 'lucide-react';

export function PromptWizard({ onPromptGenerated }) {
    const [step, setStep] = useState(1);
    const [selectedShape, setSelectedShape] = useState(null);
    const [dimensions, setDimensions] = useState({});
    const [unit, setUnit] = useState('mm');
    const [features, setFeatures] = useState({
        holes: false,
        fillets: false
    });

    const shapes = [
        {
            id: 'box',
            name: 'Box/Plate',
            icon: Box,
            dims: ['length', 'width', 'height'],
            example: '50x50x10mm box'
        },
        {
            id: 'cylinder',
            name: 'Cylinder/Rod',
            icon: Circle,
            dims: ['diameter', 'height'],
            example: '30mm diameter, 100mm tall cylinder'
        },
        {
            id: 'gear',
            name: 'Gear',
            icon: Cog,
            dims: ['diameter', 'teeth', 'thickness'],
            example: '80mm gear with 24 teeth, 15mm thick'
        }
    ];

    const units = [
        { id: 'mm', name: 'Millimeters (mm)', common: true },
        { id: 'cm', name: 'Centimeters (cm)', common: false },
        { id: 'in', name: 'Inches (in)', common: false }
    ];

    const generatePrompt = () => {
        const shape = shapes.find(s => s.id === selectedShape);
        if (!shape) return '';

        let prompt = '';
        const dimValues = [];

        // Build dimension string
        shape.dims.forEach(dim => {
            if (dimensions[dim]) {
                dimValues.push(`${dimensions[dim]}${unit}`);
            }
        });

        // Construct prompt based on shape
        if (selectedShape === 'box') {
            prompt = `${dimValues[0] || 50}x${dimValues[1] || 50}x${dimValues[2] || 10} ${selectedShape}`;
        } else if (selectedShape === 'cylinder') {
            prompt = `cylinder ${dimValues[0] || '30mm'} diameter, ${dimValues[1] || '100mm'} height`;
        } else if (selectedShape === 'gear') {
            prompt = `gear ${dimValues[0] || '80mm'} diameter, ${dimensions.teeth || 20} teeth, ${dimValues[2] || '15mm'} thick`;
        }

        // Add features
        if (features.holes) {
            prompt += ' with center hole';
        }
        if (features.fillets) {
            prompt += ' with 2mm fillet';
        }

        return prompt;
    };

    const handleFinish = () => {
        const prompt = generatePrompt();
        onPromptGenerated(prompt);
    };

    const currentShape = shapes.find(s => s.id === selectedShape);

    return (
        <div className="space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2">
                {[1, 2, 3].map(num => (
                    <div key={num} className="flex items-center">
                        <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all
              ${step >= num
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
                                : 'bg-white/10 text-gray-400'
                            }
            `}>
                            {num}
                        </div>
                        {num < 3 && (
                            <ChevronRight className={`w-4 h-4 mx-1 ${step > num ? 'text-cyan-400' : 'text-gray-600'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 min-h-[300px]">
                {/* Step 1: Select Shape */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Select Shape</h3>
                            <p className="text-gray-400 text-sm">Choose the type of part you want to create</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 mt-6">
                            {shapes.map(shape => {
                                const Icon = shape.icon;
                                const isSelected = selectedShape === shape.id;

                                return (
                                    <button
                                        key={shape.id}
                                        onClick={() => setSelectedShape(shape.id)}
                                        className={`
                      group text-left p-4 rounded-xl border-2 transition-all duration-200
                      ${isSelected
                                                ? 'bg-cyan-500/20 border-cyan-500 shadow-lg shadow-cyan-500/20'
                                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-500/50'
                                            }
                    `}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`
                        p-3 rounded-lg transition-all
                        ${isSelected ? 'bg-cyan-500/30' : 'bg-white/10 group-hover:bg-white/20'}
                      `}>
                                                <Icon className={`w-6 h-6 ${isSelected ? 'text-cyan-400' : 'text-gray-400'}`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                                    {shape.name}
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    Example: {shape.example}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Step 2: Enter Dimensions */}
                {step === 2 && currentShape && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Enter Dimensions</h3>
                            <p className="text-gray-400 text-sm">Specify the size of your {currentShape.name.toLowerCase()}</p>
                        </div>

                        {/* Unit Selector */}
                        <div className="flex gap-2">
                            {units.map(u => (
                                <button
                                    key={u.id}
                                    onClick={() => setUnit(u.id)}
                                    className={`
                    px-3 py-1.5 rounded-lg text-sm transition-all
                    ${unit === u.id
                                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                                            : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                                        }
                  `}
                                >
                                    {u.id.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        {/* Dimension Inputs */}
                        <div className="grid grid-cols-1 gap-3 mt-6">
                            {currentShape.dims.map(dim => (
                                <div key={dim}>
                                    <label className="text-sm text-gray-400 capitalize mb-2 block">
                                        {dim}
                                        {dim === 'teeth' ? ' (count)' : ` (${unit})`}
                                    </label>
                                    <input
                                        type="number"
                                        value={dimensions[dim] || ''}
                                        onChange={(e) => setDimensions({ ...dimensions, [dim]: e.target.value })}
                                        placeholder={dim === 'teeth' ? '20' : '50'}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Features (Optional) */}
                {step === 3 && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Add Features (Optional)</h3>
                            <p className="text-gray-400 text-sm">Customize your part with additional features</p>
                        </div>

                        <div className="space-y-3 mt-6">
                            <label className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                                <input
                                    type="checkbox"
                                    checked={features.holes}
                                    onChange={(e) => setFeatures({ ...features, holes: e.target.checked })}
                                    className="w-5 h-5 rounded bg-white/10 border-2 border-white/30 checked:bg-cyan-500 checked:border-cyan-500"
                                />
                                <div>
                                    <div className="font-medium text-white">Center Hole</div>
                                    <div className="text-sm text-gray-400">Add a hole through the center</div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                                <input
                                    type="checkbox"
                                    checked={features.fillets}
                                    onChange={(e) => setFeatures({ ...features, fillets: e.target.checked })}
                                    className="w-5 h-5 rounded bg-white/10 border-2 border-white/30 checked:bg-cyan-500 checked:border-cyan-500"
                                />
                                <div>
                                    <div className="font-medium text-white">Rounded Edges (Fillet)</div>
                                    <div className="text-sm text-gray-400">Smooth corners with 2mm radius</div>
                                </div>
                            </label>
                        </div>

                        {/* Preview */}
                        <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                            <div className="text-sm text-cyan-300 mb-2">Generated Prompt:</div>
                            <div className="text-white font-mono text-sm break-words">
                                {generatePrompt()}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between gap-3">
                <button
                    onClick={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1}
                    className="px-6 py-3 rounded-lg bg-white/10 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
                >
                    Back
                </button>

                {step < 3 ? (
                    <button
                        onClick={() => setStep(step + 1)}
                        disabled={step === 1 && !selectedShape}
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        onClick={handleFinish}
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
                    >
                        <Wand2 className="w-4 h-4" />
                        Generate Model
                    </button>
                )}
            </div>
        </div>
    );
}

export default PromptWizard;
