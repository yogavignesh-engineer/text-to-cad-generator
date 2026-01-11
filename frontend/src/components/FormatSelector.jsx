/**
 * FormatSelector Component
 * Allows users to select export formats (STL, STEP, IGES)
 * with recommendations for different use cases
 */

import { useState } from 'react';
import { FileDown, Package, Printer, Wrench } from 'lucide-react';

export function FormatSelector({ selectedFormats, onFormatsChange }) {
    const formats = [
        {
            id: 'stl',
            name: 'STL',
            description: '3D Printing',
            icon: Printer,
            color: 'from-blue-500 to-cyan-500',
            recommended: ['3D printing', 'Visualization'],
            fileSize: 'Small (~50KB)'
        },
        {
            id: 'step',
            name: 'STEP',
            description: 'CAD Software',
            icon: Wrench,
            color: 'from-purple-500 to-pink-500',
            recommended: ['SolidWorks', 'Fusion 360', 'Inventor'],
            fileSize: 'Medium (~200KB)'
        },
        {
            id: 'iges',
            name: 'IGES',
            description: 'Legacy CAD',
            icon: FileDown,
            color: 'from-orange-500 to-red-500',
            recommended: ['AutoCAD', 'Older CAD systems'],
            fileSize: 'Medium (~150KB)'
        }
    ];

    const presets = [
        {
            name: '3D Printing',
            formats: ['stl'],
            icon: Printer,
            description: 'For slicing and printing'
        },
        {
            name: 'CAD Work',
            formats: ['step', 'stl'],
            icon: Wrench,
            description: 'For CAD software editing'
        },
        {
            name: 'All Formats',
            formats: ['stl', 'step', 'iges'],
            icon: Package,
            description: 'Maximum compatibility'
        }
    ];

    const toggleFormat = (formatId) => {
        if (selectedFormats.includes(formatId)) {
            // Don't allow deselecting all
            if (selectedFormats.length > 1) {
                onFormatsChange(selectedFormats.filter(f => f !== formatId));
            }
        } else {
            onFormatsChange([...selectedFormats, formatId]);
        }
    };

    const applyPreset = (presetFormats) => {
        onFormatsChange(presetFormats);
    };

    return (
        <div className="space-y-4">
            {/* Title */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                    Export Formats
                </h3>
                {selectedFormats.length > 1 && (
                    <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-full">
                        ZIP Download
                    </span>
                )}
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-3 gap-2">
                {presets.map(preset => {
                    const Icon = preset.icon;
                    const isActive = JSON.stringify(selectedFormats.sort()) === JSON.stringify(preset.formats.sort());

                    return (
                        <button
                            key={preset.name}
                            onClick={() => applyPreset(preset.formats)}
                            className={`
                group relative p-3 rounded-xl border transition-all duration-200
                ${isActive
                                    ? 'bg-cyan-500/20 border-cyan-500/50 shadow-lg shadow-cyan-500/20'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-500/30'
                                }
              `}
                        >
                            <Icon className={`w-4 h-4 mx-auto mb-1 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
                            <div className="text-xs font-medium text-white">{preset.name}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">{preset.description}</div>
                        </button>
                    );
                })}
            </div>

            {/* Format Options */}
            <div className="space-y-2">
                {formats.map(format => {
                    const Icon = format.icon;
                    const isSelected = selectedFormats.includes(format.id);

                    return (
                        <button
                            key={format.id}
                            onClick={() => toggleFormat(format.id)}
                            className={`
                group w-full text-left p-4 rounded-xl border transition-all duration-200
                ${isSelected
                                    ? 'bg-gradient-to-r ' + format.color + ' bg-opacity-10 border-white/20 shadow-lg'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                }
              `}
                        >
                            <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div className={`
                  p-2 rounded-lg transition-all duration-200
                  ${isSelected
                                        ? 'bg-white/10'
                                        : 'bg-white/5 group-hover:bg-white/10'
                                    }
                `}>
                                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                            {format.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {format.fileSize}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-0.5">
                                        {format.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {format.recommended.map(rec => (
                                            <span
                                                key={rec}
                                                className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400"
                                            >
                                                {rec}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Checkbox */}
                                <div className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                  ${isSelected
                                        ? 'bg-white border-white'
                                        : 'border-gray-600 group-hover:border-gray-500'
                                    }
                `}>
                                    {isSelected && (
                                        <svg className="w-3 h-3 text-gray-900" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                                            <path d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Info */}
            <div className="text-xs text-gray-500 bg-white/5 p-3 rounded-lg border border-white/10">
                <div className="flex items-start gap-2">
                    <Package className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-gray-400">Selected: {selectedFormats.map(f => f.toUpperCase()).join(', ')}</p>
                        <p className="mt-1">
                            {selectedFormats.length > 1
                                ? 'All formats will be packaged in a ZIP file for download.'
                                : `Single ${selectedFormats[0]?.toUpperCase()} file will be downloaded.`
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FormatSelector;
