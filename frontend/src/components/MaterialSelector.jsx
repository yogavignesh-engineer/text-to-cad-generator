import React from 'react';
import { Settings } from 'lucide-react';

const MATERIALS = {
    steel: { density: 7.85, pricePerGram: 0.05, name: 'Steel' },
    aluminum: { density: 2.70, pricePerGram: 0.08, name: 'Aluminum' },
    abs_plastic: { density: 1.04, pricePerGram: 0.02, name: 'ABS Plastic' },
    titanium: { density: 4.43, pricePerGram: 0.35, name: 'Titanium' },
    brass: { density: 8.73, pricePerGram: 0.12, name: 'Brass' },
    polycarb: { density: 1.20, pricePerGram: 0.03, name: 'Polycarbonate' }
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
