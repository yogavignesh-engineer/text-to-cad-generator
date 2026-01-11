import { useState } from 'react';
import toast from 'react-hot-toast';

// Hook to encapsulate CAD generation logic
export const useCADGenerator = (API_URL, addToHistory, setLastModel, calculateBOM, setBom, MATERIALS) => {
    const [loading, setLoading] = useState(false);
    const [modelUrl, setModelUrl] = useState(null);
    const [stlBlob, setStlBlob] = useState(null);
    const [scriptId, setScriptId] = useState(null);
    const [progress, setProgress] = useState({ status: 'idle', progress: 0, message: 'Ready' });
    const [stats, setStats] = useState({ totalGenerated: 0, successRate: 95, avgTime: 0 });

    // NEW: State for transparency & rigor
    const [generatedCode, setGeneratedCode] = useState("");
    const [manufacturingNotes, setManufacturingNotes] = useState([]);

    // NEW: State for DFM & Cost Analysis
    const [dfmAnalysis, setDfmAnalysis] = useState(null);
    const [costEstimate, setCostEstimate] = useState(null);

    const downloadFile = (blob, filename, mimeType) => {
        const typedBlob = new Blob([blob], { type: mimeType });
        const url = URL.createObjectURL(typedBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.className = 'hidden';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    };

    const downloadCode = async () => {
        if (!scriptId) {
            toast.error("No script available to download.");
            return;
        }
        try {
            const response = await fetch(`${API_URL}/download_code/${scriptId}`);
            if (!response.ok) throw new Error("Failed to download script");
            const blob = await response.blob();
            downloadFile(blob, scriptId, 'text/x-python');
            toast.success("Script downloaded!");
        } catch (e) {
            toast.error("Download failed");
        }
    };

    const fetchCodeContent = async (id) => {
        if (!id) return;
        try {
            const response = await fetch(`${API_URL}/download_code/${id}`);
            if (response.ok) {
                const text = await response.text();
                setGeneratedCode(text);
            }
        } catch (e) {
            console.error("Failed to fetch script content");
        }
    };

    const generateCAD = async (prompt, useAI, material, parsedGeometry, setShowDemo, setShowConfetti, setShowBOM) => {
        const startTime = Date.now();
        setLoading(true);
        setShowDemo(false);
        setShowBOM(false);
        setScriptId(null);
        setGeneratedCode("");
        setManufacturingNotes([]);

        // Simulated progress updates
        setProgress({ status: 'parsing', progress: 15, message: 'Analyzing prompt...' });
        setTimeout(() => setProgress({ status: 'generating', progress: 55, message: 'Generating code...' }), 1200);

        try {
            const response = await fetch(`${API_URL}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: prompt, useai: useAI })
            });

            if (response.ok) {
                const blob = await response.blob();
                const scriptHeader = response.headers.get("X-Script-ID");
                const notesHeader = response.headers.get("X-Manufacturing-Notes");
                const dfmHeader = response.headers.get("X-DFM-Analysis");
                const costHeader = response.headers.get("X-Cost-Estimate");

                if (scriptHeader) {
                    setScriptId(scriptHeader);
                    fetchCodeContent(scriptHeader); // Transparently fetch code!
                }

                if (notesHeader) {
                    try {
                        setManufacturingNotes(JSON.parse(notesHeader));
                    } catch (e) { console.error("Bad notes header"); }
                }

                // Parse DFM Analysis
                if (dfmHeader) {
                    try {
                        setDfmAnalysis(JSON.parse(dfmHeader));
                    } catch (e) { console.error("Bad DFM header"); }
                }

                // Parse Cost Estimate
                if (costHeader) {
                    try {
                        setCostEstimate(JSON.parse(costHeader));
                    } catch (e) { console.error("Bad cost header"); }
                }

                setStlBlob(blob);
                const url = URL.createObjectURL(blob);
                setModelUrl(url);

                setShowDemo(false);
                setProgress({ status: 'complete', progress: 100, message: 'Complete!' });
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3000);

                setStats(prev => ({ ...prev, totalGenerated: prev.totalGenerated + 1, avgTime: (Date.now() - startTime) / 1000 }));

                addToHistory(prompt, material, parsedGeometry?.shape || 'box');
                setLastModel(parsedGeometry);

                // Calculate BOM
                if (calculateBOM && MATERIALS) {
                    const calculatedBOM = calculateBOM(parsedGeometry, material, MATERIALS);
                    setBom(calculatedBOM);
                    setShowBOM(true);
                }
            } else {
                throw new Error('Backend error');
            }
        } catch (error) {
            console.error('Generation Error:', error);
            toast.error('Generation failed. Please check your prompt or try again.');
            setModelUrl(null);
            setShowDemo(false);  // Don't show demo mode
            setProgress({ status: 'error', progress: 0, message: 'Generation failed' });
            // Don't show confetti or BOM on failure
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        modelUrl,
        stlBlob,
        scriptId,
        progress,
        stats,
        generatedCode,
        manufacturingNotes,
        dfmAnalysis,
        costEstimate,
        generateCAD,
        downloadFile,
        downloadCode
    };
};
