/**
 * UserModeContext - Global state for Beginner/Advanced mode
 * Phase 4: Dual-Mode Interface
 */

import { createContext, useContext, useState, useEffect } from 'react';

const UserModeContext = createContext();

export function UserModeProvider({ children }) {
    // Load mode from localStorage or default to beginner
    const [mode, setMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('neuralcad_mode') || 'beginner';
        }
        return 'beginner';
    });

    // Persist mode changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('neuralcad_mode', mode);
        }
    }, [mode]);

    const toggleMode = () => {
        setMode(prev => prev === 'beginner' ? 'advanced' : 'beginner');
    };

    const isBeginner = mode === 'beginner';
    const isAdvanced = mode === 'advanced';

    return (
        <UserModeContext.Provider value={{
            mode,
            setMode,
            toggleMode,
            isBeginner,
            isAdvanced
        }}>
            {children}
        </UserModeContext.Provider>
    );
}

export const useUserMode = () => {
    const context = useContext(UserModeContext);
    if (!context) {
        throw new Error('useUserMode must be used within UserModeProvider');
    }
    return context;
};

export default UserModeContext;
