/**
 * Cache Manager
 * localStorage-based caching for prompts, history, and preferences
 * Phase 8: Polish - Performance Optimization
 */

const CACHE_KEYS = {
    PROMPTS: 'neuralcad_prompts',
    HISTORY: 'neuralcad_history',
    PREFERENCES: 'neuralcad_preferences',
    MATERIALS: 'neuralcad_materials',
    ASSEMBLIES: 'neuralcad_assemblies'
};

const MAX_HISTORY_ITEMS = 50;
const MAX_PROMPTS = 100;

class CacheManager {
    /**
     * Save prompt to cache
     */
    static savePrompt(prompt, metadata = {}) {
        try {
            const prompts = this.getPrompts();
            const newPrompt = {
                id: Date.now().toString(),
                text: prompt,
                timestamp: new Date().toISOString(),
                ...metadata
            };

            prompts.unshift(newPrompt);

            // Keep only last MAX_PROMPTS
            const trimmed = prompts.slice(0, MAX_PROMPTS);

            localStorage.setItem(CACHE_KEYS.PROMPTS, JSON.stringify(trimmed));
            return newPrompt.id;
        } catch (error) {
            console.error('Failed to save prompt:', error);
            return null;
        }
    }

    /**
     * Get all cached prompts
     */
    static getPrompts() {
        try {
            const data = localStorage.getItem(CACHE_KEYS.PROMPTS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load prompts:', error);
            return [];
        }
    }

    /**
     * Search prompts
     */
    static searchPrompts(query) {
        const prompts = this.getPrompts();
        const lowerQuery = query.toLowerCase();

        return prompts.filter(p =>
            p.text.toLowerCase().includes(lowerQuery) ||
            (p.shape && p.shape.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Save generation to history
     */
    static saveToHistory(generation) {
        try {
            const history = this.getHistory();
            const newEntry = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                ...generation
            };

            history.unshift(newEntry);

            // Keep only last MAX_HISTORY_ITEMS
            const trimmed = history.slice(0, MAX_HISTORY_ITEMS);

            localStorage.setItem(CACHE_KEYS.HISTORY, JSON.stringify(trimmed));
            return newEntry.id;
        } catch (error) {
            console.error('Failed to save history:', error);
            return null;
        }
    }

    /**
     * Get generation history
     */
    static getHistory() {
        try {
            const data = localStorage.getItem(CACHE_KEYS.HISTORY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load history:', error);
            return [];
        }
    }

    /**
     * Clear history
     */
    static clearHistory() {
        try {
            localStorage.removeItem(CACHE_KEYS.HISTORY);
            return true;
        } catch (error) {
            console.error('Failed to clear history:', error);
            return false;
        }
    }

    /**
     * Save user preferences
     */
    static savePreferences(preferences) {
        try {
            const current = this.getPreferences();
            const updated = { ...current, ...preferences };
            localStorage.setItem(CACHE_KEYS.PREFERENCES, JSON.stringify(updated));
            return true;
        } catch (error) {
            console.error('Failed to save preferences:', error);
            return false;
        }
    }

    /**
     * Get user preferences
     */
    static getPreferences() {
        try {
            const data = localStorage.getItem(CACHE_KEYS.PREFERENCES);
            return data ? JSON.parse(data) : {
                mode: 'beginner',
                defaultUnit: 'mm',
                defaultFormats: ['stl'],
                theme: 'dark',
                showTips: true
            };
        } catch (error) {
            console.error('Failed to load preferences:', error);
            return {};
        }
    }

    /**
     * Save assembly templates
     */
    static saveAssembly(assembly) {
        try {
            const assemblies = this.getAssemblies();
            const newAssembly = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                ...assembly
            };

            assemblies.unshift(newAssembly);
            localStorage.setItem(CACHE_KEYS.ASSEMBLIES, JSON.stringify(assemblies));
            return newAssembly.id;
        } catch (error) {
            console.error('Failed to save assembly:', error);
            return null;
        }
    }

    /**
     * Get saved assemblies
     */
    static getAssemblies() {
        try {
            const data = localStorage.getItem(CACHE_KEYS.ASSEMBLIES);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load assemblies:', error);
            return [];
        }
    }

    /**
     * Get cache statistics
     */
    static getStats() {
        return {
            prompts: this.getPrompts().length,
            history: this.getHistory().length,
            assemblies: this.getAssemblies().length,
            storageUsed: this.getStorageUsage()
        };
    }

    /**
     * Get storage usage in KB
     */
    static getStorageUsage() {
        try {
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key) && key.startsWith('neuralcad_')) {
                    total += localStorage[key].length + key.length;
                }
            }
            return (total / 1024).toFixed(2); // KB
        } catch (error) {
            return 0;
        }
    }

    /**
     * Clear all cache
     */
    static clearAll() {
        try {
            Object.values(CACHE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Failed to clear cache:', error);
            return false;
        }
    }

    /**
     * Export cache as JSON (for backup)
     */
    static exportCache() {
        try {
            const data = {};
            Object.entries(CACHE_KEYS).forEach(([name, key]) => {
                const value = localStorage.getItem(key);
                if (value) {
                    data[name] = JSON.parse(value);
                }
            });
            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('Failed to export cache:', error);
            return null;
        }
    }

    /**
     * Import cache from JSON
     */
    static importCache(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            Object.entries(data).forEach(([name, value]) => {
                const key = CACHE_KEYS[name];
                if (key) {
                    localStorage.setItem(key, JSON.stringify(value));
                }
            });
            return true;
        } catch (error) {
            console.error('Failed to import cache:', error);
            return false;
        }
    }
}

export default CacheManager;
