/**
 * Enhanced Components with All Improvements
 * - Real-time 3D Preview
 * - Error Recovery with Retry
 * - Live Preview in Wizard
 * - Smart Suggestions
 * - Improved Error Messages
 */

import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Cylinder, Sphere } from '@react-three/drei';
import { AlertCircle, RefreshCw, Lightbulb } from 'lucide-react';

// ==================== REAL-TIME 3D PREVIEW ====================

export function LiveShapePreview({ shape, dimensions, features = {} }) {
    if (!shape || !dimensions) return null;

    const { length = 50, width = 50, height = 50, diameter, radius, teeth } = dimensions;
    const effectiveRadius = radius || (diameter / 2) || 25;

    return (
        <div className="relative w-full h-64 bg-gradient-to-br from-gray-900 to-black rounded-xl border border-cyan-500/30 overflow-hidden">
            <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                    <div className="text-cyan-400 animate-pulse">Loading preview...</div>
                </div>
            }>
                <Canvas camera={{ position: [100, 100, 100], fov: 50 }}>
                    {/* Lighting */}
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={0.8} />
                    <pointLight position={[-10, -10, -5]} intensity={0.3} />

                    {/* Shape based on type */}
                    <mesh>
                        {shape === 'box' && (
                            <boxGeometry args={[length, width, height]} />
                        )}
                        {shape === 'cylinder' && (
                            <cylinderGeometry args={[effectiveRadius, effectiveRadius, height, 32]} />
                        )}
                        {shape === 'sphere' && (
                            <sphereGeometry args={[effectiveRadius, 32, 32]} />
                        )}
                        {shape === 'gear' && (
                            // Simplified gear visualization
                            <cylinderGeometry args={[diameter / 2, diameter / 2, height || 15, teeth || 20]} />
                        )}

                        <meshStandardMaterial
                            color="#00d4ff"
                            metalness={0.6}
                            roughness={0.3}
                            emissive="#0066ff"
                            emissiveIntensity={0.1}
                        />
                    </mesh>

                    {/* Grid helper */}
                    <gridHelper args={[200, 20, '#444444', '#222222']} />

                    {/* Controls */}
                    <OrbitControls
                        enableDamping
                        dampingFactor={0.05}
                        minDistance={50}
                        maxDistance={500}
                    />
                </Canvas>
            </Suspense>

            {/* Overlay labels */}
            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-cyan-500/30">
                <div className="text-xs text-cyan-400 font-mono">
                    Live Preview • {shape}
                </div>
            </div>

            {/* Dimension labels */}
            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg border border-cyan-500/30 text-xs text-white space-y-0.5">
                {length && <div>L: {length}mm</div>}
                {width && <div>W: {width}mm</div>}
                {height && <div>H: {height}mm</div>}
                {diameter && <div>⌀: {diameter}mm</div>}
                {teeth && <div>Teeth: {teeth}</div>}
            </div>
        </div>
    );
}

// ==================== ERROR RECOVERY WITH RETRY ====================

export function useApiWithRetry() {
    const maxRetries = 3;
    const retryDelay = 1000; // milliseconds

    const fetchWithRetry = async (url, options = {}, attempt = 1) => {
        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return response;
        } catch (error) {
            if (attempt >= maxRetries) {
                throw new Error(
                    `Failed after ${maxRetries} attempts: ${error.message}\n\nPlease check your connection and try again.`
                );
            }

            console.warn(`Attempt ${attempt} failed, retrying in ${retryDelay * attempt}ms...`);

            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));

            return fetchWithRetry(url, options, attempt + 1);
        }
    };

    return { fetchWithRetry };
}

// ==================== IMPROVED ERROR MESSAGES ====================

const ERROR_CATALOG = {
    'NO_FREECAD': {
        title: '🔧 FreeCAD Not Found',
        message: 'FreeCAD is required to generate professional CAD models.',
        solutions: [
            'Download FreeCAD 1.0 from freecad.org',
            'Install to default location or set FREECAD_PATH',
            'Restart the application after installation'
        ],
        severity: 'critical',
        link: 'https://www.freecad.org/downloads.php',
        icon: '🔧'
    },
    'INVALID_DIMENSIONS': {
        title: '📏 Invalid Dimensions',
        message: 'Some dimensions are missing or incorrectly formatted.',
        solutions: [
            'Use format: "50x50x10" or "50mm length, 50mm width"',
            'Include units: mm, cm, or inches',
            'All values must be positive numbers'
        ],
        severity: 'high',
        icon: '📏'
    },
    'NETWORK_ERROR': {
        title: '🌐 Connection Failed',
        message: 'Unable to connect to the backend server.',
        solutions: [
            'Check that the backend is running (port 8001)',
            'Verify your network connection',
            'Try refreshing the page'
        ],
        severity: 'high',
        icon: '🌐'
    },
    'GENERATION_TIMEOUT': {
        title: '⏱️ Generation Timeout',
        message: 'Model generation took too long and was cancelled.',
        solutions: [
            'Try a simpler shape first',
            'Reduce complexity (fewer features)',
            'Check FreeCAD process is not hanging'
        ],
        severity: 'medium',
        icon: '⏱️'
    }
};

export function EnhancedErrorDisplay({ error, onRetry, onDismiss }) {
    const errorInfo = ERROR_CATALOG[error?.code] || {
        title: '❌ Error',
        message: error?.message || 'An unknown error occurred',
        solutions: ['Please try again or contact support'],
        severity: 'medium',
        icon: '❌'
    };

    const severityColors = {
        critical: 'from-red-500/20 to-orange-500/20 border-red-500/50',
        high: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/50',
        medium: 'from-blue-500/20 to-cyan-500/20 border-blue-500/50'
    };

    return (
        <div className={`p-4 rounded-xl border bg-gradient-to-br ${severityColors[errorInfo.severity]} backdrop-blur-sm`}>
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
                <div className="text-2xl">{errorInfo.icon}</div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{errorInfo.title}</h3>
                    <p className="text-sm text-gray-300 mt-1">{errorInfo.message}</p>
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Solutions */}
            <div className="bg-black/30 rounded-lg p-3 mb-3">
                <div className="text-sm font-medium text-gray-300 mb-2">💡 Solutions:</div>
                <ul className="space-y-1">
                    {errorInfo.solutions.map((solution, idx) => (
                        <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                            <span className="text-cyan-400 mt-0.5">▸</span>
                            <span>{solution}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="flex-1 px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 font-medium transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                )}
                {errorInfo.link && (
                    <a
                        href={errorInfo.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                    >
                        Learn More →
                    </a>
                )}
            </div>

            {/* Error code (for debugging) */}
            {error?.code && (
                <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="text-xs text-gray-500 font-mono">
                        Error Code: {error.code}
                    </div>
                </div>
            )}
        </div>
    );
}

// ==================== SMART PROMPT SUGGESTIONS ====================

export function SmartSuggestions({ currentPrompt, onSuggestionClick }) {
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        // Generate context-aware suggestions
        const prompt = currentPrompt.toLowerCase();
        const newSuggestions = [];

        // Based on detected shape
        if (prompt.includes('box') || prompt.includes('cube')) {
            newSuggestions.push(
                { text: 'with rounded corners', icon: '⬛', type: 'feature' },
                { text: 'with center hole', icon: '⭕', type: 'feature' },
                { text: 'add 2mm fillet', icon: '📐', type: 'feature' }
            );
        } else if (prompt.includes('gear')) {
            newSuggestions.push(
                { text: 'add teeth count: 20 teeth', icon: '⚙️', type: 'parameter' },
                { text: 'add thickness: 15mm thick', icon: '📏', type: 'parameter' },
                { text: 'with 30mm shaft bore', icon: '⭕', type: 'feature' }
            );
        } else if (prompt.includes('cylinder')) {
            newSuggestions.push(
                { text: 'add diameter: 30mm diameter', icon: '⌀', type: 'parameter' },
                { text: 'add length: 100mm long', icon: '📏', type: 'parameter' },
                { text: 'with center hole', icon: '⭕', type: 'feature' }
            );
        }

        // Based on missing details
        if (!prompt.match(/\d+\s*(mm|cm|in)/)) {
            newSuggestions.push(
                { text: 'specify dimensions: 50x50x10mm', icon: '📐', type: 'dimension' }
            );
        }

        // Popular additions
        if (newSuggestions.length < 3) {
            newSuggestions.push(
                { text: 'for 3D printing', icon: '🖨️', type: 'context' },
                { text: 'export as STEP file', icon: '💾', type: 'export' }
            );
        }

        setSuggestions(newSuggestions.slice(0, 5));
    }, [currentPrompt]);

    if (!suggestions.length || !currentPrompt) return null;

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <span>Suggestions:</span>
            </div>

            <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSuggestionClick(suggestion.text)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 text-sm text-white transition-all flex items-center gap-2 group"
                    >
                        <span>{suggestion.icon}</span>
                        <span className="group-hover:text-cyan-400 transition-colors">
                            {suggestion.text}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default {
    LiveShapePreview,
    useApiWithRetry,
    EnhancedErrorDisplay,
    SmartSuggestions
};
