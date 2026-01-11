/**
 * MaterialDatabase Component
 * Material selection with properties and cost estimation
 * Phase 7: Advanced Features
 */

import { useState } from 'react';
import { Palette, DollarSign, Wrench } from 'lucide-react';

export function MaterialDatabase({ onMaterialSelect, selectedMaterial }) {
    const materials = [
        {
            id: 'pla',
            name: 'PLA',
            category: '3D Printing',
            color: '#FF6B6B',
            density: 1.24, // g/cm³
            cost: 20, // $/kg
            properties: {
                strength: 'Medium',
                temperature: '50-60°C',
                finish: 'Smooth'
            },
            applications: ['Prototyping', 'Models', 'Low-stress parts']
        },
        {
            id: 'abs',
            name: 'ABS',
            category: '3D Printing',
            color: '#4ECDC4',
            density: 1.04,
            cost: 25,
            properties: {
                strength: 'High',
                temperature: '80-100°C',
                finish: 'Smooth'
            },
            applications: ['Functional parts', 'Enclosures', 'Tools']
        },
        {
            id: 'aluminum',
            name: 'Aluminum 6061',
            category: 'Metal',
            color: '#95A5A6',
            density: 2.70,
            cost: 5, // $/kg
            properties: {
                strength: 'High',
                temperature: '500°C',
                finish: 'Machined'
            },
            applications: ['Structural', 'Aerospace', 'CNC parts']
        },
        {
            id: 'steel',
            name: 'Steel 1045',
            category: 'Metal',
            color: '#34495E',
            density: 7.85,
            cost: 2,
            properties: {
                strength: 'Very High',
                temperature: '1000°C',
                finish: 'Machined'
            },
            applications: ['Heavy duty', 'Gears', 'Shafts']
        },
        {
            id: 'nylon',
            name: 'Nylon PA12',
            category: 'Engineering Plastic',
            color: '#F39C12',
            density: 1.01,
            cost: 50,
            properties: {
                strength: 'High',
                temperature: '120-150°C',
                finish: 'Smooth'
            },
            applications: ['Gears', 'Bearings', 'Wear parts']
        }
    ];

    const [filter, setFilter] = useState('all');

    const categories = ['all', ...new Set(materials.map(m => m.category))];

    const filteredMaterials = filter === 'all'
        ? materials
        : materials.filter(m => m.category === filter);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-semibold text-white">Material Database</h3>
                </div>
            </div>

            {/* Filter */}
            <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`
              px-3 py-1.5 rounded-lg text-sm transition-all capitalize
              ${filter === cat
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                            }
            `}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Materials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredMaterials.map(material => {
                    const isSelected = selectedMaterial?.id === material.id;

                    return (
                        <button
                            key={material.id}
                            onClick={() => onMaterialSelect(material)}
                            className={`
                text-left p-4 rounded-xl border-2 transition-all duration-200
                ${isSelected
                                    ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500 shadow-lg shadow-cyan-500/20'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-500/30'
                                }
              `}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: material.color + '20' }}
                                    >
                                        <div
                                            className="w-6 h-6 rounded"
                                            style={{ backgroundColor: material.color }}
                                        />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-white">{material.name}</div>
                                        <div className="text-xs text-gray-400">{material.category}</div>
                                    </div>
                                </div>
                                {isSelected && (
                                    <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                            <path d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Properties */}
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="bg-white/5 rounded p-2">
                                    <div className="text-[10px] text-gray-500">Density</div>
                                    <div className="text-xs font-semibold text-white">{material.density} g/cm³</div>
                                </div>
                                <div className="bg-white/5 rounded p-2">
                                    <div className="text-[10px] text-gray-500">Strength</div>
                                    <div className="text-xs font-semibold text-white">{material.properties.strength}</div>
                                </div>
                                <div className="bg-white/5 rounded p-2">
                                    <div className="text-[10px] text-gray-500">Max Temp</div>
                                    <div className="text-xs font-semibold text-white">{material.properties.temperature}</div>
                                </div>
                            </div>

                            {/* Cost */}
                            <div className="flex items-center gap-2 mb-3 p-2 bg-green-500/10 rounded-lg">
                                <DollarSign className="w-4 h-4 text-green-400" />
                                <div className="text-sm text-green-400">
                                    ${material.cost}/kg
                                </div>
                            </div>

                            {/* Applications */}
                            <div className="flex flex-wrap gap-1">
                                {material.applications.slice(0, 2).map(app => (
                                    <span
                                        key={app}
                                        className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-gray-400"
                                    >
                                        {app}
                                    </span>
                                ))}
                                {material.applications.length > 2 && (
                                    <span className="text-[10px] px-2 py-1 text-gray-500">
                                        +{material.applications.length - 2}
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Selected Material Details */}
            {selectedMaterial && (
                <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                        <Wrench className="w-4 h-4 text-cyan-400" />
                        <div className="text-sm font-medium text-white">Selected: {selectedMaterial.name}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <div className="text-gray-400 mb-1">All Applications:</div>
                            <div className="space-y-1">
                                {selectedMaterial.applications.map(app => (
                                    <div key={app} className="text-cyan-300">• {app}</div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-400 mb-1">Properties:</div>
                            <div className="space-y-1 text-cyan-300">
                                <div>• Finish: {selectedMaterial.properties.finish}</div>
                                <div>• Strength: {selectedMaterial.properties.strength}</div>
                                <div>• Max Temp: {selectedMaterial.properties.temperature}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MaterialDatabase;
