/**
 * Advanced Features Implementation
 * - Version Control / History Timeline
 * - Undo/Redo System
 * - STL File Import & Editor
 * - Export Templates / Presets
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Clock, Undo2, Redo2, Upload, Save, FolderOpen } from 'lucide-react';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import * as THREE from 'three';

// ==================== VERSION CONTROL SYSTEM ====================

export class VersionControl {
    static STORAGE_KEY = 'neuralcad_versions';

    static saveVersion(modelId, state, description = 'Untitled Version') {
        const versions = this.getVersionHistory(modelId);

        const newVersion = {
            id: Date.now().toString(),
            modelId,
            timestamp: new Date().toISOString(),
            description,
            state: JSON.parse(JSON.stringify(state)), // Deep clone
            parentId: versions[0]?.id || null
        };

        versions.unshift(newVersion);

        // Keep last 50 versions
        const trimmed = versions.slice(0, 50);

        localStorage.setItem(
            `${this.STORAGE_KEY}_${modelId}`,
            JSON.stringify(trimmed)
        );

        return newVersion.id;
    }

    static getVersionHistory(modelId) {
        try {
            const data = localStorage.getItem(`${this.STORAGE_KEY}_${modelId}`);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    static restoreVersion(modelId, versionId) {
        const versions = this.getVersionHistory(modelId);
        const version = versions.find(v => v.id === versionId);
        return version ? version.state : null;
    }

    static deleteVersion(modelId, versionId) {
        const versions = this.getVersionHistory(modelId);
        const filtered = versions.filter(v => v.id !== versionId);
        localStorage.setItem(
            `${this.STORAGE_KEY}_${modelId}`,
            JSON.stringify(filtered)
        );
    }
}

export function VersionTimeline({ modelId, currentState, onRestore }) {
    const [versions, setVersions] = useState([]);
    const [showTimeline, setShowTimeline] = useState(false);

    useEffect(() => {
        const history = VersionControl.getVersionHistory(modelId);
        setVersions(history);
    }, [modelId]);

    const handleSaveVersion = () => {
        const description = prompt('Version description:') || 'Checkpoint';
        VersionControl.saveVersion(modelId, currentState, description);
        setVersions(VersionControl.getVersionHistory(modelId));
    };

    const handleRestore = (versionId) => {
        if (confirm('Restore this version? Current changes will be saved first.')) {
            // Save current state before restoring
            VersionControl.saveVersion(modelId, currentState, 'Auto-save before restore');

            const state = VersionControl.restoreVersion(modelId, versionId);
            if (state) onRestore(state);
        }
    };

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setShowTimeline(!showTimeline)}
                    className="flex items-center gap-2 text-white hover:text-cyan-400 transition-colors"
                >
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">Version History ({versions.length})</span>
                </button>
                <button
                    onClick={handleSaveVersion}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 text-sm transition-all flex items-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    Save Version
                </button>
            </div>

            {/* Timeline */}
            {showTimeline && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {versions.map((version, idx) => (
                        <div
                            key={version.id}
                            className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-white">
                                        {version.description}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {new Date(version.timestamp).toLocaleString()}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRestore(version.id)}
                                    className="px-3 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs transition-all"
                                >
                                    Restore
                                </button>
                            </div>

                            {/* Timeline connector */}
                            {idx < versions.length - 1 && (
                                <div className="ml-2 mt-2 h-4 w-0.5 bg-gradient-to-b from-cyan-500/50 to-transparent" />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ==================== UNDO/REDO SYSTEM ====================

export function useUndoRedo(initialState) {
    const [history, setHistory] = useState([initialState]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentState = history[currentIndex];
    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;

    const pushState = useCallback((newState) => {
        setHistory(prev => {
            // Remove any "future" states if we're not at the end
            const truncated = prev.slice(0, currentIndex + 1);
            // Add new state
            const updated = [...truncated, newState];
            // Limit history to 100 states
            return updated.slice(-100);
        });
        setCurrentIndex(prev => Math.min(prev + 1, 99));
    }, [currentIndex]);

    const undo = useCallback(() => {
        if (canUndo) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [canUndo]);

    const redo = useCallback(() => {
        if (canRedo) {
            setCurrentIndex(prev => prev + 1);
        }
    }, [canRedo]);

    const reset = useCallback(() => {
        setHistory([initialState]);
        setCurrentIndex(0);
    }, [initialState]);

    return {
        state: currentState,
        pushState,
        undo,
        redo,
        canUndo,
        canRedo,
        reset,
        historyLength: history.length
    };
}

export function UndoRedoControls({ undoRedo }) {
    const { undo, redo, canUndo, canRedo, historyLength } = undoRedo;

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={undo}
                disabled={!canUndo}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all"
                title="Undo (Ctrl+Z)"
            >
                <Undo2 className="w-5 h-5" />
            </button>

            <button
                onClick={redo}
                disabled={!canRedo}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all"
                title="Redo (Ctrl+Y)"
            >
                <Redo2 className="w-5 h-5" />
            </button>

            <div className="text-xs text-gray-500">
                {historyLength} states
            </div>
        </div>
    );
}

// ==================== STL IMPORT & EDITOR ====================

export function STLImporter({ onImport }) {
    const [isLoading, setIsLoading] = useState(false);
    const [importedData, setImportedData] = useState(null);
    const fileInputRef = useRef();

    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);

        try {
            const url = URL.createObjectURL(file);
            const loader = new STLLoader();

            const geometry = await new Promise((resolve, reject) => {
                loader.load(url, resolve, undefined, reject);
            });

            // Calculate dimensions
            geometry.computeBoundingBox();
            const bbox = geometry.boundingBox;

            const dimensions = {
                length: (bbox.max.x - bbox.min.x).toFixed(2),
                width: (bbox.max.y - bbox.min.y).toFixed(2),
                height: (bbox.max.z - bbox.min.z).toFixed(2)
            };

            // Calculate volume (approximate)
            const volume = (bbox.max.x - bbox.min.x) *
                (bbox.max.y - bbox.min.y) *
                (bbox.max.z - bbox.min.z);

            const data = {
                geometry,
                file,
                dimensions,
                volume: volume.toFixed(2),
                vertices: geometry.attributes.position.count,
                url
            };

            setImportedData(data);
            URL.revokeObjectURL(url);

            if (onImport) onImport(data);

        } catch (error) {
            console.error('STL import failed:', error);
            alert('Failed to import STL file: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Import Button */}
            <div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".stl"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg disabled:opacity-50 text-white font-medium transition-all flex items-center justify-center gap-2"
                >
                    <Upload className="w-5 h-5" />
                    {isLoading ? 'Importing...' : 'Import STL File'}
                </button>
            </div>

            {/* Imported File Info */}
            {importedData && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-white">
                            📄 {importedData.file.name}
                        </div>
                        <div className="text-xs text-gray-400">
                            {(importedData.file.size / 1024).toFixed(1)} KB
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-white/5 rounded">
                            <div className="text-gray-400 text-xs">Dimensions (mm)</div>
                            <div className="text-white font-mono">
                                {importedData.dimensions.length} × {importedData.dimensions.width} × {importedData.dimensions.height}
                            </div>
                        </div>
                        <div className="p-2 bg-white/5 rounded">
                            <div className="text-gray-400 text-xs">Volume</div>
                            <div className="text-white font-mono">
                                {importedData.volume} mm³
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-gray-500">
                        Vertices: {importedData.vertices.toLocaleString()}
                    </div>
                </div>
            )}
        </div>
    );
}

// ==================== EXPORT TEMPLATES ====================

const EXPORT_TEMPLATES = {
    '3d_printing_standard': {
        name: '3D Printing (Standard)',
        formats: ['stl'],
        quality: 'high',
        units: 'mm',
        icon: '🖨️'
    },
    'cad_software_package': {
        name: 'CAD Software Package',
        formats: ['step', 'stl'],
        quality: 'high',
        units: 'mm',
        icon: '🔧'
    },
    'complete_export': {
        name: 'Complete (All Formats)',
        formats: ['stl', 'step', 'iges'],
        quality: 'high',
        units: 'mm',
        icon: '📦'
    },
    'rapid_prototype': {
        name: 'Rapid Prototype',
        formats: ['stl'],
        quality: 'medium',
        units: 'mm',
        icon: '⚡'
    },
    'engineering_review': {
        name: 'Engineering Review',
        formats: ['step', 'pdf'], // PDF would need implementation
        quality: 'high',
        units: 'mm',
        includeDrawings: true,
        icon: '📋'
    }
};

export function ExportTemplateSelector({ onTemplateSelect }) {
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const handleSelect = (templateId) => {
        const template = EXPORT_TEMPLATES[templateId];
        setSelectedTemplate(templateId);
        if (onTemplateSelect) onTemplateSelect(template);
    };

    return (
        <div className="space-y-3">
            <div className="text-sm font-medium text-gray-400">Export Presets</div>

            <div className="grid grid-cols-1 gap-2">
                {Object.entries(EXPORT_TEMPLATES).map(([id, template]) => {
                    const isSelected = selectedTemplate === id;

                    return (
                        <button
                            key={id}
                            onClick={() => handleSelect(id)}
                            className={`
                text-left p-3 rounded-lg border transition-all
                ${isSelected
                                    ? 'bg-cyan-500/20 border-cyan-500/50 shadow-lg'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }
              `}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{template.icon}</span>
                                    <div>
                                        <div className="font-medium text-white text-sm">
                                            {template.name}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-0.5">
                                            {template.formats.join(', ').toUpperCase()} • {template.quality} quality
                                        </div>
                                    </div>
                                </div>
                                {isSelected && (
                                    <div className="text-cyan-400">✓</div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default {
    VersionControl,
    VersionTimeline,
    useUndoRedo,
    UndoRedoControls,
    STLImporter,
    ExportTemplateSelector,
    EXPORT_TEMPLATES
};
