/**
 * AssemblyBuilder Component
 * Create multi-component assemblies with constraints
 * Phase 5: Assembly Support
 */

import { useState } from 'react';
import { Plus, Trash2, Link, Move } from 'lucide-react';

export function AssemblyBuilder({ onAssemblyGenerate }) {
    const [components, setComponents] = useState([
        { id: 1, name: 'Part 1', shape: 'box', dimensions: {}, position: [0, 0, 0] }
    ]);
    const [constraints, setConstraints] = useState([]);

    const addComponent = () => {
        const newId = Math.max(...components.map(c => c.id), 0) + 1;
        setComponents([
            ...components,
            { id: newId, name: `Part ${newId}`, shape: 'box', dimensions: {}, position: [0, 0, 0] }
        ]);
    };

    const removeComponent = (id) => {
        setComponents(components.filter(c => c.id !== id));
        setConstraints(constraints.filter(c => c.componentA !== id && c.componentB !== id));
    };

    const updateComponent = (id, field, value) => {
        setComponents(components.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        ));
    };

    const addConstraint = () => {
        if (components.length >= 2) {
            setConstraints([
                ...constraints,
                {
                    id: Date.now(),
                    type: 'mate',
                    componentA: components[0].id,
                    componentB: components[1].id
                }
            ]);
        }
    };

    const generateAssembly = () => {
        const assemblyPrompt = {
            type: 'assembly',
            components: components.map(c => ({
                name: c.name,
                shape: c.shape,
                dimensions: c.dimensions,
                position: c.position
            })),
            constraints: constraints
        };

        onAssemblyGenerate(assemblyPrompt);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Assembly Builder</h3>
                <button
                    onClick={addComponent}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm hover:shadow-lg transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Component
                </button>
            </div>

            {/* Components List */}
            <div className="space-y-3">
                {components.map((component, index) => (
                    <div
                        key={component.id}
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-semibold">
                                    {index + 1}
                                </div>
                                <input
                                    type="text"
                                    value={component.name}
                                    onChange={(e) => updateComponent(component.id, 'name', e.target.value)}
                                    className="bg-transparent border-none text-white font-medium focus:outline-none"
                                />
                            </div>
                            <button
                                onClick={() => removeComponent(component.id)}
                                disabled={components.length === 1}
                                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Shape</label>
                                <select
                                    value={component.shape}
                                    onChange={(e) => updateComponent(component.id, 'shape', e.target.value)}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                >
                                    <option value="box">Box</option>
                                    <option value="cylinder">Cylinder</option>
                                    <option value="gear">Gear</option>
                                    <option value="sphere">Sphere</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Position (X, Y, Z)</label>
                                <input
                                    type="text"
                                    value={component.position.join(', ')}
                                    onChange={(e) => {
                                        const pos = e.target.value.split(',').map(p => parseFloat(p.trim()) || 0);
                                        updateComponent(component.id, 'position', pos.slice(0, 3));
                                    }}
                                    placeholder="0, 0, 0"
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Constraints */}
            {components.length >= 2 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white">Constraints</h4>
                        <button
                            onClick={addConstraint}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-all flex items-center gap-2"
                        >
                            <Link className="w-4 h-4" />
                            Add Constraint
                        </button>
                    </div>

                    {constraints.map((constraint, index) => (
                        <div
                            key={constraint.id}
                            className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                    <Link className="w-4 h-4 text-purple-400" />
                                    <span className="text-white">
                                        {components.find(c => c.id === constraint.componentA)?.name}
                                    </span>
                                    <span className="text-gray-400">→</span>
                                    <span className="text-white">
                                        {components.find(c => c.id === constraint.componentB)?.name}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setConstraints(constraints.filter(c => c.id !== constraint.id))}
                                    className="text-red-400 hover:text-red-300"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Generate Button */}
            <button
                onClick={generateAssembly}
                disabled={components.length === 0}
                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
                <Move className="w-5 h-5" />
                Generate Assembly ({components.length} components)
            </button>

            {/* Info */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300">
                <p className="font-medium">Assembly Mode</p>
                <p className="text-blue-400/80 mt-1">
                    Multiple components will be exported as a single STEP file with assembly structure preserved.
                </p>
            </div>
        </div>
    );
}

export default AssemblyBuilder;
