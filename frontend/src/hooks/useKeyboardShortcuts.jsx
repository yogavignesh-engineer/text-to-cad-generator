/**
 * Keyboard Shortcuts Hook
 * Global keyboard shortcuts for power users
 * Phase 7: Advanced Features - Final
 */

import { useEffect, useCallback } from 'react';

export function useKeyboardShortcuts(handlers) {
    const handleKeyPress = useCallback((event) => {
        const { key, ctrlKey, shiftKey, altKey, metaKey } = event;
        const modifier = ctrlKey || metaKey; // Cmd on Mac, Ctrl on Windows

        // Prevent default for registered shortcuts
        const shortcutKey = `${modifier ? 'Ctrl+' : ''}${shiftKey ? 'Shift+' : ''}${altKey ? 'Alt+' : ''}${key.toUpperCase()}`;

        if (handlers[shortcutKey]) {
            event.preventDefault();
            handlers[shortcutKey]();
        }
    }, [handlers]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);
}

/**
 * KeyboardShortcutsHelp Component
 * Show available keyboard shortcuts
 */

import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';

export function KeyboardShortcutsHelp() {
    const [isOpen, setIsOpen] = useState(false);

    const shortcuts = [
        { key: 'Ctrl+G', description: 'Generate CAD model', category: 'Generation' },
        { key: 'Ctrl+E', description: 'Open export options', category: 'Export' },
        { key: 'Ctrl+S', description: 'Save/download current model', category: 'File' },
        { key: 'Ctrl+Z', description: 'Undo last change', category: 'Edit' },
        { key: 'Ctrl+Y', description: 'Redo', category: 'Edit' },
        { key: 'Ctrl+/', description: 'Toggle this help', category: 'Help' },
        { key: 'Ctrl+K', description: 'Open command palette', category: 'Navigation' },
        { key: 'Ctrl+B', description: 'Toggle sidebar', category: 'UI' },
        { key: 'Ctrl+M', description: 'Toggle beginner/advanced mode', category: 'Mode' },
        { key: 'Ctrl+I', description: 'Open AI chat', category: 'AI' },
        { key: 'Ctrl+D', description: 'Duplicate current model', category: 'Edit' },
        { key: 'Ctrl+H', description: 'Show generation history', category: 'Navigation' },
        { key: 'Escape', description: 'Close dialogs/cancel', category: 'General' },
        { key: 'F1', description: 'Open user guide', category: 'Help' },
        { key: 'F5', description: 'Refresh 3D viewer', category: 'Viewer' },
    ];

    const categories = [...new Set(shortcuts.map(s => s.category))];

    useKeyboardShortcuts({
        'Ctrl+/': () => setIsOpen(!isOpen),
        'ESCAPE': () => setIsOpen(false)
    });

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white transition-all shadow-lg z-50"
                title="Keyboard shortcuts (Ctrl+/)"
            >
                <Keyboard className="w-5 h-5" />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-white/20 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                        <Keyboard className="w-6 h-6 text-cyan-400" />
                        <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                    {categories.map(category => (
                        <div key={category} className="mb-6 last:mb-0">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                {category}
                            </h3>
                            <div className="space-y-2">
                                {shortcuts
                                    .filter(s => s.category === category)
                                    .map((shortcut, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                                        >
                                            <span className="text-white">{shortcut.description}</span>
                                            <kbd className="px-3 py-1 bg-gray-800 border border-white/30 rounded-lg text-cyan-400 font-mono text-sm shadow-lg">
                                                {shortcut.key}
                                            </kbd>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 bg-white/5">
                    <p className="text-xs text-gray-400 text-center">
                        Press <kbd className="px-2 py-0.5 bg-gray-800 border border-white/30 rounded text-cyan-400">Ctrl+/</kbd> or <kbd className="px-2 py-0.5 bg-gray-800 border border-white/30 rounded text-cyan-400">Esc</kbd> to close
                    </p>
                </div>
            </div>
        </div>
    );
}

export default KeyboardShortcutsHelp;
