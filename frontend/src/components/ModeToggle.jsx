/**
 * ModeToggle Component
 * Switches between Beginner and Advanced modes
 * Phase 4: Dual-Mode Interface
 */

import { useUserMode } from '../contexts/UserModeContext';
import { Zap, Sparkles } from 'lucide-react';

export function ModeToggle() {
    const { mode, toggleMode, isBeginner } = useUserMode();

    return (
        <div className="relative inline-flex items-center p-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            {/* Background Slider */}
            <div
                className={`
          absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r rounded-full transition-all duration-300
          ${isBeginner
                        ? 'left-1 from-cyan-500 to-blue-500'
                        : 'left-[calc(50%+2px)] from-purple-500 to-pink-500'
                    }
        `}
            />

            {/* Beginner Button */}
            <button
                onClick={() => mode !== 'beginner' && toggleMode()}
                className={`
          relative z-10 px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-2
          ${isBeginner ? 'text-white' : 'text-gray-400 hover:text-gray-300'}
        `}
            >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Beginner</span>
            </button>

            {/* Advanced Button */}
            <button
                onClick={() => mode !== 'advanced' && toggleMode()}
                className={`
          relative z-10 px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-2
          ${!isBeginner ? 'text-white' : 'text-gray-400 hover:text-gray-300'}
        `}
            >
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Advanced</span>
            </button>
        </div>
    );
}

export default ModeToggle;
