import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Sparkles, Zap, ChevronRight } from 'lucide-react';

const SamplePrompts = ({ onSelect, onClose, darkMode }) => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredPrompt, setHoveredPrompt] = useState(null);

    useEffect(() => {
        // Load prompts from JSON
        fetch('/data/prompts.json')
            .then(res => res.json())
            .then(data => {
                setCategories(data.categories);
                setSelectedCategory(data.categories[0]?.id);
            })
            .catch(err => console.error('Failed to load prompts:', err));
    }, []);

    const currentCategory = categories.find(c => c.id === selectedCategory);

    const filteredPrompts = currentCategory?.prompts.filter(p =>
        p.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleSelectPrompt = (prompt) => {
        onSelect(prompt.text);
        onClose();
    };

    const complexityColors = {
        beginner: 'from-green-500 to-emerald-600',
        intermediate: 'from-blue-500 to-indigo-600',
        advanced: 'from-purple-500 to-pink-600',
        expert: 'from-red-500 to-orange-600'
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl ${darkMode ? 'bg-[#0a0a0f] border-2 border-white/10' : 'bg-white border-2 border-gray-200'
                    }`}
            >
                {/* Header */}
                <div className={`p-6 border-b ${darkMode ? 'border-white/10 bg-gradient-to-r from-blue-900/20 to-purple-900/20' : 'border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
                            >
                                <Sparkles className="w-6 h-6 text-white" />
                            </motion.div>
                            <div>
                                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Sample Prompts Library
                                </h2>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Click any prompt to generate instantly
                                </p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className={`p-2 rounded-xl ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            <X className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-700'}`} />
                        </motion.button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search prompts..."
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border ${darkMode
                                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                    </div>
                </div>

                <div className="flex h-[calc(90vh-200px)]">
                    {/* Categories Sidebar */}
                    <div className={`w-64 p-4 border-r ${darkMode ? 'border-white/10 bg-gradient-to-b from-white/5 to-transparent' : 'border-gray-200 bg-gray-50'} overflow-y-auto`}>
                        <h3 className={`text-xs uppercase tracking-wider font-bold mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Categories
                        </h3>
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <motion.button
                                    key={category.id}
                                    whileHover={{ x: 5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${selectedCategory === category.id
                                            ? darkMode
                                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                            : darkMode
                                                ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <span className="text-2xl">{category.icon}</span>
                                    <div className="flex-1 text-left">
                                        <div className="font-semibold text-sm">{category.name}</div>
                                        <div className={`text-xs ${selectedCategory === category.id ? 'text-white/80' : 'text-gray-500'}`}>
                                            {category.prompts.length} prompts
                                        </div>
                                    </div>
                                    {selectedCategory === category.id && (
                                        <ChevronRight className="w-4 h-4" />
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Prompts Grid */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {filteredPrompts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <div className={`text-6xl mb-4 ${darkMode ? 'opacity-20' : 'opacity-40'}`}>🔍</div>
                                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    No prompts found
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <AnimatePresence mode="popLayout">
                                    {filteredPrompts.map((prompt, index) => (
                                        <motion.div
                                            key={prompt.text}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ scale: 1.03, y: -5 }}
                                            onHoverStart={() => setHoveredPrompt(prompt.text)}
                                            onHoverEnd={() => setHoveredPrompt(null)}
                                            onClick={() => handleSelectPrompt(prompt)}
                                            className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all overflow-hidden ${darkMode
                                                    ? 'bg-gradient-to-br from-white/5 to-white/10 border-white/10 hover:border-blue-500/50'
                                                    : 'bg-white border-gray-200 hover:border-blue-400 shadow-sm hover:shadow-lg'
                                                }`}
                                        >
                                            {/* Complexity Badge */}
                                            <div className="absolute top-3 right-3">
                                                <div className={`px-2 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${complexityColors[prompt.complexity]} text-white shadow-lg`}>
                                                    {prompt.complexity}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="pr-20">
                                                <div className={`text-sm font-mono mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                                    {prompt.text}
                                                </div>
                                                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {prompt.description}
                                                </div>
                                            </div>

                                            {/* Hover Effect */}
                                            <AnimatePresence>
                                                {hoveredPrompt === prompt.text && (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: 10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 10 }}
                                                        className="absolute bottom-4 right-4"
                                                    >
                                                        <div className="flex items-center gap-2 text-xs font-bold text-blue-500">
                                                            <Zap className="w-4 h-4" />
                                                            Click to use
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className={`p-4 border-t ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                    <div className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        💡 Tip: All prompts are production-tested and optimized for best results
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SamplePrompts;
