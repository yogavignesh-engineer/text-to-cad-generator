import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sliders, X, RotateCw, Zap, ChevronDown, ChevronUp } from 'lucide-react';

const ParametricEditor = ({ parameters, onUpdate, onClose, darkMode, loading }) => {
    const [values, setValues] = useState({});
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        if (parameters?.dimensions) {
            setValues(parameters.dimensions);
        }
    }, [parameters]);

    const handleSliderChange = (key, newValue) => {
        const updatedValues = { ...values, [key]: parseFloat(newValue) };
        setValues(updatedValues);
    };

    const handleApply = () => {
        if (onUpdate) {
            onUpdate(values);
        }
    };

    const handleReset = () => {
        if (parameters?.dimensions) {
            setValues(parameters.dimensions);
        }
    };

    if (!parameters || !parameters.dimensions) {
        return null;
    }

    const editableParams = Object.entries(values).filter(
        ([key, val]) => typeof val === 'number' && key !== 'teeth' // Teeth count shouldn't be slider
    );

    if (editableParams.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`fixed left-[500px] top-[30px] w-full max-w-[350px] rounded-3xl overflow-hidden shadow-2xl z-[90] ${darkMode ? 'bg-[#0a0a0f] border-2 border-white/10' : 'bg-white border-2 border-gray-200'
                }`}
        >
            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between ${darkMode ? 'border-white/10 bg-gradient-to-r from-indigo-900/20 to-purple-900/20' : 'border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50'
                }`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Sliders className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Parametric Editor
                        </h3>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Live dimension control
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setExpanded(!expanded)}
                        className={`p-2 rounded-lg ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className={`p-2 rounded-lg ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                        <X className={`w-4 h-4 ${darkMode ? 'text-white' : 'text-gray-700'}`} />
                    </motion.button>
                </div>
            </div>

            {/* Body */}
            {expanded && (
                <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                >
                    <div className="p-6 space-y-5 max-h-[500px] overflow-y-auto">
                        {editableParams.map(([key, val]) => {
                            const min = Math.max(1, val * 0.3);
                            const max = val * 3;

                            return (
                                <div key={key} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className={`text-sm font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                            {key}
                                        </label>
                                        <div className={`px-3 py-1 rounded-lg font-mono font-bold ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
                                            }`}>
                                            {values[key]?.toFixed(1)}mm
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="range"
                                            min={min}
                                            max={max}
                                            step={0.5}
                                            value={values[key]}
                                            onChange={(e) => handleSliderChange(key, e.target.value)}
                                            className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                                            style={{
                                                background: darkMode
                                                    ? `linear-gradient(to right, #6366f1 0%, #6366f1 ${((values[key] - min) / (max - min)) * 100}%, #374151 ${((values[key] - min) / (max - min)) * 100}%, #374151 100%)`
                                                    : `linear-gradient(to right, #818cf8 0%, #818cf8 ${((values[key] - min) / (max - min)) * 100}%, #e5e7eb ${((values[key] - min) / (max - min)) * 100}%, #e5e7eb 100%)`
                                            }}
                                        />
                                        <div className="flex justify-between text-xs mt-1 text-gray-500">
                                            <span>{min.toFixed(0)}</span>
                                            <span>{max.toFixed(0)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className={`p-4 border-t flex gap-3 ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                        }`}>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleReset}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${darkMode
                                ? 'bg-white/10 hover:bg-white/20 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                }`}
                        >
                            <RotateCw className="w-4 h-4" />
                            Reset
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleApply}
                            disabled={loading}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${loading
                                ? 'bg-gray-500 cursor-not-allowed opacity-50'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30'
                                } text-white`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4" />
                                    Apply Changes
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            )}

            <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
          transition: transform 0.2s;
        }

        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
          border: none;
        }
      `}</style>
        </motion.div>
    );
};

export default ParametricEditor;
