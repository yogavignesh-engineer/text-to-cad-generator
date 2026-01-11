import React, { useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars, ContactShadows, Grid } from '@react-three/drei';
import { Toaster, toast } from 'react-hot-toast';
import { Activity, Zap, Cpu, Sun, Moon, Menu } from 'lucide-react';

// Components
import HistoryPanel from './components/HistoryPanel';
import BOMPanel from './components/BOMPanel';
import TolerancePanel from './components/TolerancePanel';
import ValidationPopup from './components/ValidationPopup';
import SuccessConfetti from './components/SuccessConfetti';
import DimensionAnnotations from './components/DimensionAnnotations';
import ControlPanel from './components/ControlPanel';
import EmptyState from './components/EmptyState';
import DFMPanel from './components/DFMPanel';
import CostPanel from './components/CostPanel';
import { MATERIALS } from './components/MaterialSelector';
import LandingPage from './components/LandingPage';
import SamplePrompts from './components/SamplePrompts';
import ParametricEditor from './components/ParametricEditor';
import CommandPalette from './components/CommandPalette';

// 3D Components
import StlModel from './components/3d/StlModel';
import DynamicModel from './components/3d/DynamicModel';
import MatrixTerminal from './components/MatrixTerminal';

// Utils
import { parsePrompt, validateGeometry, calculateBOM, detectModifications } from './utils/geometryEngine';
import { useCADGenerator } from './hooks/useCADGenerator';

const API_URL = ""; // Use relative paths for Proxy support

export default function App() {
  // LANDING PAGE STATE
  const [showLanding, setShowLanding] = useState(false); // Changed to false - skip landing, go straight to dashboard

  const [prompt, setPrompt] = useState("");
  const [currentMaterial, setCurrentMaterial] = useState("steel");
  const [ready, setReady] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [showTestPrompts, setShowTestPrompts] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [showValidationPopup, setShowValidationPopup] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [darkMode, setDarkMode] = useState(true);
  const [showBOM, setShowBOM] = useState(false);
  const [bom, setBom] = useState(null);
  const [showTolerance, setShowTolerance] = useState(false);
  const [shakeButton, setShakeButton] = useState(false);
  const [showDFM, setShowDFM] = useState(false);
  const [showCost, setShowCost] = useState(false);
  const [parsedParameters, setParsedParameters] = useState(null);
  const [showDimensions, setShowDimensions] = useState(false);
  const [lastModel, setLastModel] = useState(null);
  const [validation, setValidation] = useState(null);
  const [showSamplePrompts, setShowSamplePrompts] = useState(false);
  const [showParametricEditor, setShowParametricEditor] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Mobile Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // INIT HOOK
  const {
    loading, modelUrl, stlBlob, scriptId, progress, stats,
    generatedCode, manufacturingNotes, dfmAnalysis, costEstimate,
    generateCAD: generateCADFromHook, downloadFile, downloadCode
  } = useCADGenerator(API_URL,
    (p, m, s) => addToHistory(p, m, s),
    setLastModel,
    calculateBOM,
    setBom,
    MATERIALS
  );

  useEffect(() => {
    setTimeout(() => setReady(true), 1200);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Command Palette - Ctrl+K (check both 'k' and 'K')
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setShowCommandPalette(true);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (prompt.trim() && !loading) generateCAD(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (stlBlob) {
          downloadFile(stlBlob, `NeuralCAD_Model_${Date.now()}.stl`, 'model/stl');
          toast.success('STL Downloaded!');
        } else {
          toast('No model to download yet', { icon: '⚠️' });
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); handleUndo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); handleRedo(); }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [prompt, historyIndex, history, loading, stlBlob]);

  const addToHistory = (promptText, mat, shape) => {
    const newItem = { prompt: promptText, material: mat, shape, timestamp: Date.now() };
    const newHistory = [...history.slice(0, historyIndex + 1), newItem].slice(-10);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setPrompt(prev.prompt);
      setCurrentMaterial(prev.material);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setPrompt(next.prompt);
      setCurrentMaterial(next.material);
    }
  };

  const generateCAD = async (skipValidation = false) => {
    let currentPrompt = prompt;
    let parsed = parsePrompt(currentPrompt);

    const modification = detectModifications(currentPrompt);
    if (modification.isModification && lastModel) {
      toast('Applying modification...', { icon: '🔄' });
      const { shape, dimensions } = lastModel;
      let newDims = { ...dimensions };

      if (modification.operation === 'scale') {
        Object.keys(newDims).forEach(key => { if (typeof newDims[key] === 'number') newDims[key] *= modification.value; });
      } else if (modification.operation === 'set_dimension') {
        if (newDims[modification.dimension] !== undefined) newDims[modification.dimension] = modification.value;
      } else if (modification.operation === 'add_dimension') {
        if (newDims[modification.dimension] !== undefined) newDims[modification.dimension] += modification.value;
      }

      if (shape === 'box') {
        currentPrompt = `${newDims.length.toFixed(1)}x${newDims.width.toFixed(1)}x${newDims.height.toFixed(1)} box`;
      } else if (shape === 'cylinder') {
        currentPrompt = `cylinder ${newDims.diameter.toFixed(1)}mm diameter ${newDims.height.toFixed(1)}mm height`;
      }
      setPrompt(currentPrompt);
      parsed = parsePrompt(currentPrompt);
    }

    const validationCheck = validateGeometry(parsed);
    if (!skipValidation && (!validationCheck.valid || validationCheck.warnings)) {
      setValidationResult(validationCheck);
      setShowValidationPopup(true);
      return;
    }

    await generateCADFromHook(currentPrompt, useAI, currentMaterial, parsed, setShowDemo, setShowConfetti, setShowBOM);
  };

  const validatePrompt = () => {
    if (!prompt.trim()) { setValidation(null); setParsedParameters(null); return; }
    const geometry = parsePrompt(prompt);
    setParsedParameters(geometry);
    const validationCheck = validateGeometry(geometry);

    if (geometry) {
      const dimStr = geometry.dimensions.length
        ? `${geometry.dimensions.length}×${geometry.dimensions.width}×${geometry.dimensions.height}mm`
        : geometry.dimensions.diameter ? `Ø${geometry.dimensions.diameter}mm` : 'Custom';

      setValidation({
        shape: geometry.shape,
        dimensions: dimStr,
        valid: validationCheck.valid,
        hasWarnings: !!validationCheck.warnings,
        hasSuggestions: !!validationCheck.suggestions
      });
    }
  };

  const bgColor = darkMode ? '#000' : '#f0f0f0';

  // RENDER LANDING PAGE IF ACTIVE
  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />;
  }

  return (
    <div className={`w-screen h-screen relative overflow-hidden ${darkMode ? 'dark bg-radial-dark' : 'bg-radial-light'}`}>
      <style>{`
        .bg-radial-dark { background: radial-gradient(ellipse at top, #1a1a2e 0%, #0a0118 60%, #000 100%); }
        .bg-radial-light { background: radial-gradient(ellipse at top, #e0e7ff 0%, #f0f0f0 60%, #fff 100%); }
      `}</style>

      <Toaster position="top-right" />

      {/* Mobile Menu Button */}
      {!isMenuOpen && (
        <button
          onClick={() => setIsMenuOpen(true)}
          className="fixed top-6 left-6 z-[90] p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white lg:hidden"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Loading Overlay */}
      <div className={`fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center transition-opacity duration-700 pointer-events-none ${ready ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-[100px] h-[100px] border-4 border-white/10 border-t-cyan-400 rounded-full animate-spin shadow-lg shadow-cyan-500/50" />
        <div className="mt-8 text-cyan-400 text-xl tracking-[8px] font-bold">NEURALCAD v6.0</div>
      </div>

      {/* Popups */}
      {showConfetti && (
        <SuccessConfetti
          dfmScore={dfmAnalysis?.score}
          cost={costEstimate?.total_cost}
          onComplete={() => setShowConfetti(false)}
        />
      )}
      {showValidationPopup && (
        <ValidationPopup validation={validationResult} onClose={() => setShowValidationPopup(false)} onProceed={() => generateCAD(true)} />
      )}

      {/* Panels */}
      {showHistory && <HistoryPanel history={history} onSelect={(item) => { setPrompt(item.prompt); setCurrentMaterial(item.material); validatePrompt(); }} onClose={() => setShowHistory(false)} />}

      {/* BOM Panel with Notes Injection */}
      {showBOM && bom && (
        <BOMPanel
          bom={manufacturingNotes && manufacturingNotes.length > 0 ? { ...bom, notes: manufacturingNotes } : bom}
          onClose={() => setShowBOM(false)}
        />
      )}

      {showTolerance && <TolerancePanel onClose={() => setShowTolerance(false)} />}

      {/* DFM Analysis Panel */}
      {showDFM && dfmAnalysis && <DFMPanel dfmData={dfmAnalysis} onClose={() => setShowDFM(false)} />}

      {/* Cost Estimate Panel */}
      {showCost && costEstimate && <CostPanel costData={costEstimate} onClose={() => setShowCost(false)} />}

      {/* Sample Prompts Library */}
      {showSamplePrompts && <SamplePrompts onSelect={(text) => { setPrompt(text); validatePrompt(); }} onClose={() => setShowSamplePrompts(false)} darkMode={darkMode} />}

      {/* Parametric Editor */}
      {showParametricEditor && parsedParameters && (
        <ParametricEditor
          parameters={parsedParameters}
          onUpdate={(newDims) => {
            // Reconstruct prompt from new dimensions
            const shape = parsedParameters.shape;
            let newPrompt = '';
            if (shape === 'box') {
              newPrompt = `${newDims.length}x${newDims.width}x${newDims.height} ${currentMaterial} plate`;
            } else if (shape === 'cylinder') {
              newPrompt = `cylinder ${newDims.diameter}mm diameter ${newDims.height}mm height ${currentMaterial}`;
            } else {
              newPrompt = prompt; // Fallback
            }
            setPrompt(newPrompt);
            validatePrompt();
            generateCAD(false);
          }}
          onClose={() => setShowParametricEditor(false)}
          darkMode={darkMode}
          loading={loading}
        />
      )}

      {/* Top Right Stats */}
      <div className="fixed top-[30px] right-[30px] flex gap-4 z-[100]">
        {[
          { icon: <Activity size={20} />, label: 'Generated', value: stats.totalGenerated },
          { icon: <Zap size={20} />, label: 'Accuracy', value: `${stats.successRate}%` },
          { icon: <Cpu size={20} />, label: 'Status', value: loading ? 'BUSY' : 'READY' }
        ].map((stat, i) => (
          <div key={i} className={`hidden md:flex p-4 px-6 rounded-xl items-center gap-3.5 border backdrop-blur-md shadow-lg ${darkMode ? 'bg-[rgba(10,15,35,0.85)] border-neonc/20 shadow-black/50' : 'bg-white/95 border-black/10 shadow-black/10'}`}>
            <div className="w-11 h-11 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center text-white shadow-md shadow-[#667eea]/40">
              {stat.icon}
            </div>
            <div>
              <div className="text-[0.7rem] text-black/50 dark:text-white/50 tracking-[1.5px] uppercase mb-0.5">{stat.label}</div>
              <div className="text-[1.3rem] font-bold text-black dark:text-white">{stat.value}</div>
            </div>
          </div>
        ))}
        <button onClick={() => setDarkMode(!darkMode)} className={`p-4 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 border backdrop-blur-md shadow-lg ${darkMode ? 'bg-[rgba(10,15,35,0.85)] border-neonc/20 shadow-black/50' : 'bg-white/95 border-black/10 shadow-black/10'}`}>
          {darkMode ? <Sun size={24} className="text-amber-400" /> : <Moon size={24} className="text-indigo-600" />}
        </button>
      </div>

      {/* Main Sidebar */}
      <ControlPanel
        downloadCode={downloadCode}
        generatedCode={generatedCode}
        darkMode={darkMode} prompt={prompt} setPrompt={setPrompt}
        loading={loading} generateCAD={generateCAD}
        handleUndo={handleUndo} handleRedo={handleRedo}
        historyIndex={historyIndex} historyLength={history.length}
        showDimensions={showDimensions} setShowDimensions={setShowDimensions}
        showHistory={showHistory} setShowHistory={setShowHistory}
        showTolerance={showTolerance} setShowTolerance={setShowTolerance}
        showTestPrompts={showTestPrompts} setShowTestPrompts={setShowTestPrompts}
        validatePrompt={validatePrompt} validation={validation}
        parsedParameters={parsedParameters} useAI={useAI} setUseAI={setUseAI}
        stlBlob={stlBlob} stepUrl={null} downloadFile={downloadFile}
        material={currentMaterial} setMaterial={setCurrentMaterial} shakeButton={shakeButton}
        scriptId={scriptId}
        dfmAnalysis={dfmAnalysis} costEstimate={costEstimate}
        showDFM={showDFM} setShowDFM={setShowDFM}
        showCost={showCost} setShowCost={setShowCost}
        setShowBOM={setShowBOM}
        showSamplePrompts={showSamplePrompts} setShowSamplePrompts={setShowSamplePrompts}
        showParametricEditor={showParametricEditor} setShowParametricEditor={setShowParametricEditor}
      />

      {/* 3D View */}
      <div className="absolute inset-0 z-[1] w-full h-full">
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
          <color attach="background" args={[bgColor]} />
          <PerspectiveCamera makeDefault position={[100, 80, 100]} fov={28} />

          <Environment preset="city" />
          <ambientLight intensity={darkMode ? 0.4 : 0.6} />
          <directionalLight position={[15, 15, 8]} intensity={darkMode ? 1.8 : 2.2} castShadow shadow-mapSize={[2048, 2048]} />
          <spotLight position={[60, 60, 60]} angle={0.25} intensity={darkMode ? 2.5 : 3} castShadow penumbra={0.5} />
          <pointLight position={[-60, 30, -60]} color="#b026ff" intensity={darkMode ? 4 : 2} />
          <pointLight position={[60, -30, 60]} color="#00f0ff" intensity={darkMode ? 3 : 1.5} />
          {darkMode && <Stars radius={350} depth={50} count={7000} factor={5} saturation={0} speed={0.5} />}

          <Suspense fallback={null}>
            {modelUrl && <DynamicModel fileUrl={modelUrl} color={MATERIALS[currentMaterial]?.color || "#29b6f6"} />}
            {showDemo && !modelUrl && <DynamicModel fileUrl={null} />}
            <ContactShadows position={[0, -30, 0]} opacity={darkMode ? 0.6 : 0.3} scale={100} blur={2.5} />
            <Grid infiniteGrid fadeDistance={450} sectionColor={darkMode ? "#b026ff" : "#667eea"} sectionSize={60} cellSize={12} cellThickness={0.8} fadeStrength={2} />
          </Suspense>

          <DimensionAnnotations dimensions={parsedParameters?.dimensions} visible={showDimensions} />
          <OrbitControls makeDefault enableDamping dampingFactor={0.05} minDistance={20} maxDistance={500} />
        </Canvas>

        {/* Empty State Overlay */}
        {!modelUrl && !showDemo && <EmptyState />}

        {/* Elite Matrix Terminal Overlay */}
        <div className="absolute bottom-6 left-6 z-[50] w-[450px] pointer-events-none">
          <div className="pointer-events-auto">
            <MatrixTerminal isVisible={loading} />
          </div>
        </div>

        {/* Engineering Spec Sheet Overlay (Elite Feature) */}
        {modelUrl && lastModel && (
          <div className="absolute top-24 right-5 z-[50] w-64 bg-black/80 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl text-cyan-400 font-mono text-sm shadow-[0_0_20px_rgba(6,182,212,0.15)] animate-in slide-in-from-right duration-700">
            <div className="flex justify-between items-center border-b border-cyan-500/30 pb-2 mb-3">
              <h3 className="font-bold tracking-widest text-xs">spec_sheet.json</h3>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="opacity-70">VOLUME</span>
                <span className="font-bold">{lastModel.volume_mm3 ? (lastModel.volume_mm3 / 1000).toFixed(2) + ' cm³' : 'CALCULATING...'}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">MASS (Est.)</span>
                <span className="font-bold text-white">{lastModel.mass_g ? lastModel.mass_g.toFixed(1) + ' g' : 'CALCULATING...'}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">MATERIAL</span>
                <span className="font-bold text-white uppercase">{currentMaterial}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">BOUNDS</span>
                <span className="font-bold">{lastModel.dimensions && Array.isArray(lastModel.dimensions) ?
                  `${lastModel.dimensions[0].toFixed(0)}x${lastModel.dimensions[1].toFixed(0)}x${lastModel.dimensions[2].toFixed(0)}` : 'N/A'} mm</span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-cyan-500/10 text-[10px] opacity-50 text-center">
              VALIDATED: ELITECAD KERNEL v7.0
            </div>
          </div>
        )}

      </div>
    </div>
  );
}