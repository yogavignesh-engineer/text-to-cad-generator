import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Search, X } from 'lucide-react';

const CommandPalette = ({ onClose, onCommand, darkMode }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const commands = [
        {
            category: 'Actions',
            items: [
                { id: 'generate', name: 'Generate Model', shortcut: 'Ctrl+Enter', action: 'generate' },
                { id: 'validate', name: 'Validate Prompt', shortcut: '', action: 'validate' },
                { id: 'download_stl', name: 'Download STL', shortcut: 'Ctrl+D', action: 'download_stl' },
                { id: 'download_step', name: 'Download STEP', shortcut: '', action: 'download_step' },
                { id: 'download_code', name: 'Download Python Code', shortcut: '', action: 'download_code' },
            ]
        },
        {
            category: 'Views',
            items: [
                { id: 'toggle_dims', name: 'Toggle Dimensions', shortcut: '', action: 'toggle_dimensions' },
                { id: 'show_history', name: 'Show History', shortcut: '', action: 'show_history' },
                { id: 'show_bom', name: 'Show BOM', shortcut: '', action: 'show_bom' },
                { id: 'show_dfm', name: 'Show DFM Analysis', shortcut: '', action: 'show_dfm' },
                { id: 'show_cost', name: 'Show Cost Estimate', shortcut: '', action: 'show_cost' },
                { id: 'show_tolerance', name: 'Show Tolerances', shortcut: '', action: 'show_tolerance' },
                { id: 'show_prompts', name: 'Sample Prompts Library', shortcut: '', action: 'show_prompts' },
                { id: 'show_parametric', name: 'Parametric Editor', shortcut: '', action: 'show_parametric' },
            ]
        },
        {
            category: 'Materials',
            items: [
                { id: 'mat_steel', name: 'Material: Steel', shortcut: '', action: 'material_steel' },
                { id: 'mat_aluminum', name: 'Material: Aluminum', shortcut: '', action: 'material_aluminum' },
                { id: 'mat_copper', name: 'Material: Copper', shortcut: '', action: 'material_copper' },
                { id: 'mat_brass', name: 'Material: Brass', shortcut: '', action: 'material_brass' },
                { id: 'mat_titanium', name: 'Material: Titanium', shortcut: '', action: 'material_titanium' },
            ]
        },
        {
            category: 'AI',
            items: [
                { id: 'ai_on', name: 'Enable AI Mode', shortcut: '', action: 'ai_on' },
                { id: 'ai_off', name: 'Disable AI Mode', shortcut: '', action: 'ai_off' },
            ]
        }
    ];

    // Flatten and filter commands
    const allItems = commands.flatMap(cat =>
        cat.items.map(item => ({ ...item, category: cat.category }))
    );

    const filteredItems = allItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredItems.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredItems[selectedIndex]) {
                    handleCommand(filteredItems[selectedIndex].action);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, filteredItems, onClose]);

    const handleCommand = (action) => {
        onCommand(action);
        onClose();
    };

    // Group filtered items by category
    const groupedItems = commands.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: -20 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${darkMode ? 'bg-[#0a0a0f] border-2 border-white/10' : 'bg-white border-2 border-gray-200'
                    }`}
            >
                {/* Search Header */}
                <div className={`p-4 border-b flex items-center gap-3 ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                    }`}>
                    <Command className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Type a command or search..."
                        autoFocus
                        className={`flex-1 bg-transparent outline-none text-lg ${darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                            }`}
                    />
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
                    >
                        <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                </div>

                {/* Commands List */}
                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {groupedItems.length === 0 ? (
                        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No commands found</p>
                        </div>
                    ) : (
                        groupedItems.map((category, catIndex) => (
                            <div key={category.category} className={catIndex > 0 ? 'mt-4' : ''}>
                                <div className={`px-3 py-2 text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-600'
                                    }`}>
                                    {category.category}
                                </div>
                                {category.items.map((item, itemIndex) => {
                                    const globalIndex = filteredItems.findIndex(fi => fi.id === item.id);
                                    const isSelected = globalIndex === selectedIndex;

                                    return (
                                        <motion.button
                                            key={item.id}
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => handleCommand(item.action)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all mb-1 ${isSelected
                                                    ? darkMode
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-blue-500 text-white'
                                                    : darkMode
                                                        ? 'hover:bg-white/5 text-gray-300'
                                                        : 'hover:bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            <span className="font-medium">{item.name}</span>
                                            {item.shortcut && (
                                                <span className={`text-xs px-2 py-1 rounded ${isSelected
                                                        ? 'bg-white/20'
                                                        : darkMode
                                                            ? 'bg-white/10'
                                                            : 'bg-gray-200'
                                                    }`}>
                                                    {item.shortcut}
                                                </span>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className={`p-3 border-t flex items-center justify-between text-xs ${darkMode ? 'border-white/10 bg-white/5 text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}>
                    <div className="flex items-center gap-4">
                        <span>↑↓ Navigate</span>
                        <span>↵ Select</span>
                        <span>Esc Close</span>
                    </div>
                    <div>Ctrl+K to toggle</div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CommandPalette;
