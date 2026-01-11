/**
 * UserGuide Component
 * Interactive tutorial and documentation
 * Phase 8: Polish - Documentation
 */

import { useState } from 'react';
import { BookOpen, X, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

export function UserGuide({ isOpen, onClose }) {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            title: 'Welcome to NeuralCAD',
            content: `Transform your ideas into precise 3D CAD models using natural language. 
      
NeuralCAD combines the power of AI with professional CAD software (FreeCAD) to generate industry-standard models from simple text descriptions.`,
            image: null,
            tips: [
                'Supports STL, STEP, and IGES file formats',
                'Guaranteed dimensional accuracy (±0.01mm)',
                'Beginner-friendly with advanced features for professionals'
            ]
        },
        {
            title: 'Choose Your Mode',
            content: `NeuralCAD offers two modes tailored to your experience level:

**Beginner Mode**: Guided wizard walks you through creating models step-by-step. Perfect for learning!

**Advanced Mode**: Direct text input with access to code inspector, assemblies, batch generation, and more.

Switch anytime using the mode toggle in the header.`,
            tips: [
                'Start with Beginner Mode to learn the system',
                'Switch to Advanced Mode when you\'re comfortable',
                'Your mode preference is saved automatically'
            ]
        },
        {
            title: 'Writing Prompts',
            content: `Describe your part using natural language. NeuralCAD understands:

**Dimensions**: "50x50x10mm box" or "2 inch cube"
**Shapes**: box, cylinder, sphere, gear, cone
**Features**: "with center hole", "with 2mm fillet"
**Tolerances**: "±0.1" or "H7 fit"

**Good Examples**:
- "50mm diameter cylinder, 100mm tall"
- "Gear with 24 teeth, 80mm diameter, 15mm thick"
- "100x50x20mm box with 5mm center hole"`,
            tips: [
                'Be specific with dimensions',
                'Include units (mm, cm, inches)',
                'Mention key features (holes, fillets, etc.)'
            ]
        },
        {
            title: 'Selecting Export Formats',
            content: `Choose the right format for your use case:

**STL**: For 3D printing and visualization
**STEP**: For CAD software (SolidWorks, Fusion 360, Inventor)
**IGES**: For AutoCAD and legacy CAD systems

**Tip**: Select multiple formats to get a ZIP file with all versions!`,
            tips: [
                'Use STL for 3D printing',
                'Use STEP for editing in CAD software',
                'Select "All Formats" for maximum compatibility'
            ]
        },
        {
            title: 'Validation & Accuracy',
            content: `NeuralCAD uses a three-checkpoint validation system:

**Checkpoint #1**: Parser validates your prompt
**Checkpoint #2**: Code verified before execution
**Checkpoint #3**: Exported file dimensions measured

All dimensions are guaranteed accurate to ±0.01mm (industrial precision).

After generation, check the Validation Display to see actual vs. expected dimensions.`,
            tips: [
                'Green checkmarks mean dimensions are perfect',
                'Yellow warnings are shown if tolerance is exceeded',
                'Validation results are included in every generation'
            ]
        },
        {
            title: 'Advanced Features',
            content: `Power users can access:

**Assembly Builder**: Create multi-component assemblies with constraints
**Batch Generator**: Generate multiple variations with different parameters
**Material Database**: Select materials and estimate costs
**Code Inspector**: View and edit FreeCAD Python scripts
**Cost Estimator**: Calculate manufacturing costs
**Export Animator**: Create 360° product videos`,
            tips: [
                'Switch to Advanced Mode to unlock these features',
                'Use keyboard shortcuts (Ctrl+/) for faster workflows',
                'Save assemblies as templates for reuse'
            ]
        },
        {
            title: 'Keyboard Shortcuts',
            content: `Speed up your workflow with shortcuts:

**Ctrl+G**: Generate model
**Ctrl+E**: Export options
**Ctrl+M**: Toggle mode
**Ctrl+I**: AI chat
**Ctrl+/**: Show shortcuts
**Ctrl+H**: History

Press Ctrl+/ anytime to see all available shortcuts.`,
            tips: [
                'Learn 2-3 shortcuts at a time',
                'Shortcuts work in all modes',
                'Customize shortcuts in settings (coming soon)'
            ]
        },
        {
            title: 'Tips & Best Practices',
            content: `Get the most out of NeuralCAD:

✓ Start simple, then add complexity
✓ Use consistent units throughout your prompt
✓ Check validation results before downloading
✓ Save frequently-used assemblies as templates
✓ Use batch generation for parametric families
✓ Export in multiple formats for flexibility
✓ Review the Code Inspector to learn FreeCAD`,
            tips: [
                'Browse sample prompts for inspiration',
                'Use AI Chat for ambiguous designs',
                'Check generation history to reuse past models'
            ]
        },
        {
            title: 'You\'re Ready!',
            content: `You now know how to use NeuralCAD!

Start creating your first model, or explore the advanced features.

Need help? Press F1 anytime to reopen this guide, or click the ? icon in the header.

**Happy modeling!** 🚀`,
            tips: [
                'Practice makes perfect',
                'Experiment with different prompts',
                'Join our community to share your creations'
            ]
        }
    ];

    const currentStepData = steps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    const handleNext = () => {
        if (!isLastStep) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (!isFirstStep) {
            setCurrentStep(currentStep - 1);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-white/20 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-cyan-400" />
                        <div>
                            <h2 className="text-xl font-bold text-white">User Guide</h2>
                            <p className="text-xs text-gray-400">
                                Step {currentStep + 1} of {steps.length}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress */}
                <div className="px-6 py-2 bg-white/5">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <h3 className="text-2xl font-bold text-white mb-4">
                        {currentStepData.title}
                    </h3>

                    <div className="prose prose-invert max-w-none">
                        <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                            {currentStepData.content}
                        </div>
                    </div>

                    {/* Tips */}
                    {currentStepData.tips && currentStepData.tips.length > 0 && (
                        <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="w-4 h-4 text-cyan-400" />
                                <span className="text-sm font-medium text-cyan-300">Quick Tips</span>
                            </div>
                            <ul className="space-y-2">
                                {currentStepData.tips.map((tip, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-cyan-200">
                                        <span className="text-cyan-400 mt-0.5">•</span>
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
                    <button
                        onClick={handlePrev}
                        disabled={isFirstStep}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </button>

                    <div className="flex gap-1">
                        {steps.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentStep(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentStep
                                        ? 'bg-cyan-500 w-6'
                                        : idx < currentStep
                                            ? 'bg-cyan-500/50'
                                            : 'bg-white/20'
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg hover:shadow-cyan-500/50 text-white transition-all flex items-center gap-2"
                    >
                        {isLastStep ? (
                            <>
                                Get Started
                                <CheckCircle className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UserGuide;
