import React from 'react';
import { Settings } from 'lucide-react';

// Material properties with INDIAN MARKET PRICES (₹ per gram, Dec 2025)
const MATERIALS = {
    steel: {
        density: 7.85, pricePerGram: 0.055, name: 'Steel',  // ₹55/kg
        color: '#8a9299', metalness: 0.9, roughness: 0.3
    },
    aluminum: {
        density: 2.70, pricePerGram: 0.29, name: 'Aluminum',  // ₹287/kg
        color: '#d4d4d8', metalness: 0.95, roughness: 0.2
    },
    abs_plastic: {
        density: 1.04, pricePerGram: 0.15, name: 'ABS Plastic',  // ₹150/kg
        color: '#f5f5f4', metalness: 0.0, roughness: 0.8
    },
    titanium: {
        density: 4.43, pricePerGram: 5.50, name: 'Titanium',  // ₹5500/kg
        color: '#78716c', metalness: 0.85, roughness: 0.25
    },
    brass: {
        density: 8.73, pricePerGram: 0.70, name: 'Brass',  // ₹700/kg
        color: '#d4a574', metalness: 0.9, roughness: 0.15
    },
    polycarb: {
        density: 1.20, pricePerGram: 0.20, name: 'Polycarbonate',  // ₹200/kg
        color: '#a3e635', metalness: 0.0, roughness: 0.4, transparent: true, opacity: 0.85
    }
};

export default function MaterialSelector({ currentMaterial, setMaterial, darkMode }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-3 text-[0.7rem] font-bold tracking-widest text-black/50 dark:text-white/50">
                <Settings size={14} />
                <span>MATERIAL LIBRARY</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
                {Object.keys(MATERIALS).map(m => (
                    <button
                        key={m}
                        onClick={() => setMaterial(m)}
                        className={`
              p-3.5 px-2 rounded-xl text-[0.65rem] font-bold uppercase tracking-wider transition-all duration-300
              ${currentMaterial === m
                                ? 'bg-gradient-to-br from-neonc/25 to-neonp/25 border-neonc text-black dark:text-white'
                                : 'bg-black/5 dark:bg-white/5 border-transparent text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10'}
              border
            `}
                    >
                        {MATERIALS[m].name}
                    </button>
                ))}
            </div>
        </div>
    );
}
// Export MATERIALS for use in other components if needed
export { MATERIALS };
