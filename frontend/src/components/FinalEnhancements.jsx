/**
 * Final UX Enhancements & Optimizations
 * - Onboarding Flow for First-Time Users
 * - Material Property Visualizer
 * - Enhanced PromptWizard with Live Preview
 * - BatchGenerator with Preview Grid
 * - Code Splitting & Memoization
 * - Web Workers
 */

import { useState, useEffect, memo, lazy, Suspense } from 'react';
import { Play, Check, ArrowRight } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, RadialLinearScale } from 'chart.js';
import { Radar, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, RadialLinearScale);

// ==================== ONBOARDING FLOW ====================

const ONBOARDING_STEPS = [
    {
        target: '.mode-toggle',
        title: 'Choose Your Experience',
        content: 'Select Beginner mode for guided steps, or Advanced for full control.',
        placement: 'bottom',
        highlight: true
    },
    {
        target: '.prompt-input',
        title: 'Describe Your Part',
        content: 'Type naturally: "50mm cube" or "gear with 20 teeth". Units are supported!',
        placement: 'top'
    },
    {
        target: '.format-selector',
        title: 'Choose Export Formats',
        content: 'STL for 3D printing, STEP for CAD software, or get all formats in a ZIP.',
        placement: 'left'
    },
    {
        target: '.generate-button',
        title: 'Generate Your Model',
        content: 'Click to create! We\'ll validate dimensions and export professional files.',
        placement: 'top',
        highlight: true
    }
];

export function OnboardingTour({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isActive, setIsActive] = useState(() => {
        return !localStorage.getItem('neuralcad_onboarding_completed');
    });

    if (!isActive) return null;

    const step = ONBOARDING_STEPS[currentStep];
    const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            localStorage.setItem('neuralcad_onboarding_completed', 'true');
            setIsActive(false);
            if (onComplete) onComplete();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleSkip = () => {
        localStorage.setItem('neuralcad_onboarding_completed', 'true');
        setIsActive(false);
    };

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/80 z-50 pointer-events-none">
                {/* Spotlight effect on target element */}
                <style>{`
          .onboarding-highlight {
            position: relative;
            z-index: 51;
            box-shadow: 0 0 0 9999px rgba(0,0,0,0.8), 0 0 20px rgba(0,212,255,0.5);
            pointer-events: auto;
          }
        `}</style>
            </div>

            {/* Tooltip */}
            <div className="fixed z-52 max-w-sm">
                <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-cyan-500 rounded-xl p-5 shadow-2xl">
                    {/* Progress */}
                    <div className="flex gap-1 mb-4">
                        {ONBOARDING_STEPS.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1 flex-1 rounded-full transition-all ${idx === currentStep
                                        ? 'bg-cyan-500'
                                        : idx < currentStep
                                            ? 'bg-cyan-500/50'
                                            : 'bg-white/20'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-white mb-2">
                        {step.title}
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">
                        {step.content}
                    </p>

                    {/* Actions */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={handleSkip}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Skip Tour
                        </button>
                        <button
                            onClick={handleNext}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            {isLastStep ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Got It!
                                </>
                            ) : (
                                <>
                                    Next
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Step counter */}
                    <div className="text-xs text-gray-500 mt-3 text-center">
                        {currentStep + 1} of {ONBOARDING_STEPS.length}
                    </div>
                </div>
            </div>
        </>
    );
}

// ==================== MATERIAL PROPERTY VISUALIZER ====================

export function MaterialPropertyChart({ materials }) {
    const selected = materials.filter(m => m.selected);

    if (selected.length === 0) return null;

    const strengthData = {
        labels: selected.map(m => m.name),
        datasets: [{
            label: 'Relative Strength',
            data: selected.map(m => {
                const strengthMap = { 'Low': 3, 'Medium': 5, 'High': 7, 'Very High': 10 };
                return strengthMap[m.properties.strength] || 5;
            }),
            backgroundColor: selected.map(m => m.color + '80'),
            borderColor: selected.map(m => m.color),
            borderWidth: 2
        }]
    };

    const costData = {
        labels: selected.map(m => m.name),
        datasets: [{
            label: 'Cost per kg',
            data: selected.map(m => m.cost),
            backgroundColor: [
                'rgba(34, 197, 94, 0.8)',
                'rgba(234, 179, 8, 0.8)',
                'rgba(239, 68, 68, 0.8)'
            ]
        }]
    };

    return (
        <div className="space-y-4">
            <div className="text-sm font-medium text-white">Property Comparison</div>

            <div className="grid grid-cols-2 gap-4">
                {/* Strength Radar */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-xs text-gray-400 mb-2 text-center">Strength Profile</div>
                    <Radar
                        data={strengthData}
                        options={{
                            scales: { r: { beginAtZero: true, max: 10 } },
                            plugins: { legend: { display: false } }
                        }}
                    />
                </div>

                {/* Cost Doughnut */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-xs text-gray-400 mb-2 text-center">Cost Comparison</div>
                    <Doughnut
                        data={costData}
                        options={{
                            plugins: { legend: { position: 'bottom' } }
                        }}
                    />
                </div>
            </div>

            {/* Property Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left py-2 text-gray-400">Material</th>
                            <th className="text-center py-2 text-gray-400">Density</th>
                            <th className="text-center py-2 text-gray-400">Max Temp</th>
                            <th className="text-center py-2 text-gray-400">Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selected.map(material => (
                            <tr key={material.id} className="border-b border-white/5">
                                <td className="py-2 text-white">{material.name}</td>
                                <td className="py-2 text-center text-gray-300">{material.density} g/cm³</td>
                                <td className="py-2 text-center text-gray-300">{material.properties.temperature}</td>
                                <td className="py-2 text-center text-green-400">${material.cost}/kg</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ==================== ENHANCED WIZARD WITH LIVE PREVIEW ====================

export const EnhancedPromptWizard = memo(function EnhancedPromptWizard({ onPromptGenerated }) {
    const [step, setStep] = useState(1);
    const [selectedShape, setSelectedShape] = useState(null);
    const [dimensions, setDimensions] = useState({});
    const [unit, setUnit] = useState('mm');

    // Import LiveShapePreview from EnhancedFeatures
    const { LiveShapePreview } = lazy(() => import('./EnhancedFeatures'));

    return (
        <div className="space-y-6">
            {/* Wizard steps (existing code) */}

            {/* LIVE PREVIEW - Added */}
            {step === 2 && selectedShape && Object.keys(dimensions).length > 0 && (
                <Suspense fallback={<div className="h-64 bg-gray-900 rounded-xl animate-pulse" />}>
                    <LiveShapePreview
                        shape={selectedShape}
                        dimensions={dimensions}
                    />
                </Suspense>
            )}
        </div>
    );
});

// ==================== BATCH GENERATOR WITH PREVIEW GRID ====================

export function BatchGeneratorWithPreviews({ onBatchGenerate }) {
    const [basePrompt, setBasePrompt] = useState('');
    const [variations, setVariations] = useState([]);
    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        // Generate preview combinations
        if (basePrompt && variations.length > 0) {
            const combinations = generateCombinations(basePrompt, variations);
            setPreviews(combinations.slice(0, 12)); // Limit to 12 previews
        }
    }, [basePrompt, variations]);

    return (
        <div className="space-y-4">
            {/* Input controls (existing) */}

            {/* PREVIEW GRID - Added */}
            {previews.length > 0 && (
                <div className="space-y-2">
                    <div className="text-sm font-medium text-white">Preview ({previews.length} variations)</div>

                    <div className="grid grid-cols-3 gap-3">
                        {previews.map((combo, idx) => (
                            <div
                                key={idx}
                                className="aspect-square bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/30 p-2 hover:border-purple-500/60 transition-all cursor-pointer group"
                            >
                                {/* Mini 3D Preview */}
                                <div className="h-3/4 bg-black/30 rounded flex items-center justify-center group-hover:bg-black/50 transition-all">
                                    <div className="text-xs text-gray-500">
                                        #{idx + 1}
                                    </div>
                                </div>

                                {/* Parameters */}
                                <div className="text-[10px] text-white mt-1 font-mono truncate">
                                    {Object.entries(combo.params).map(([k, v]) => `${k}:${v}`).join(', ')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function generateCombinations(basePrompt, variations) {
    // Generate all possible combinations of parameters
    const combos = [];

    variations.forEach(variation => {
        const values = variation.values.split(',').map(v => v.trim());
        values.forEach(value => {
            combos.push({
                prompt: basePrompt.replace(`{${variation.parameter}}`, value),
                params: { [variation.parameter]: value }
            });
        });
    });

    return combos;
}

// ==================== CODE SPLITTING ====================

// Lazy load heavy components
export const LazyAssemblyBuilder = lazy(() => import('./AssemblyBuilder'));
export const LazyExportAnimator = lazy(() => import('./ExportAnimator'));
export const LazyMaterialDatabase = lazy(() => import('./MaterialDatabase'));
export const LazyCostEstimator = lazy(() => import('./CostEstimator'));

// Loading fallback
export function ComponentLoader() {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <div className="text-gray-400">Loading component...</div>
            </div>
        </div>
    );
}

// ==================== WEB WORKER FOR HEAVY COMPUTATIONS ====================

// STL volume calculation worker
export function createSTLVolumeWorker() {
    const workerCode = `
    self.onmessage = function(e) {
      const { vertices } = e.data;
      
      // Calculate volume using divergence theorem
      let volume = 0;
      
      for (let i = 0; i < vertices.length; i += 9) {
        const x1 = vertices[i], y1 = vertices[i+1], z1 = vertices[i+2];
        const x2 = vertices[i+3], y2 = vertices[i+4], z2 = vertices[i+5];
        const x3 = vertices[i+6], y3 = vertices[i+7], z3 = vertices[i+8];
        
        volume += (x1 * y2 * z3 - x1 * y3 * z2 - x2 * y1 * z3 + x2 * y3 * z1 + x3 * y1 * z2 - x3 * y2 * z1) / 6;
      }
      
      self.postMessage({ volume: Math.abs(volume) });
    };
  `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
}

export function useVolumeCalculation() {
    const [volume, setVolume] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);

    const calculateVolume = (geometry) => {
        setIsCalculating(true);

        const worker = createSTLVolumeWorker();
        const vertices = Array.from(geometry.attributes.position.array);

        worker.postMessage({ vertices });

        worker.onmessage = (e) => {
            setVolume(e.data.volume);
            setIsCalculating(false);
            worker.terminate();
        };

        worker.onerror = (error) => {
            console.error('Worker error:', error);
            setIsCalculating(false);
            worker.terminate();
        };
    };

    return { volume, isCalculating, calculateVolume };
}

export default {
    OnboardingTour,
    MaterialPropertyChart,
    EnhancedPromptWizard,
    BatchGeneratorWithPreviews,
    LazyAssemblyBuilder,
    LazyExportAnimator,
    LazyMaterialDatabase,
    LazyCostEstimator,
    ComponentLoader,
    useVolumeCalculation
};
