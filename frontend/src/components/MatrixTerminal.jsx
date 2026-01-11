import React, { useEffect, useRef, useState } from 'react';

export function MatrixTerminal({ isVisible }) { // Adapted prop name to match App.jsx usage
    const isGenerating = isVisible; // Alias for compatibility with user snippet
    const [logs, setLogs] = useState([]);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (!isGenerating) return;

        // Connect to the streaming endpoint
        // FIXED: Port 8001 to match main.py configuration
        const eventSource = new EventSource('http://localhost:8001/api/stream-logs');

        eventSource.onmessage = (event) => {
            const log = event.data;
            setLogs((prev) => [...prev, log]);
        };

        eventSource.onerror = () => {
            eventSource.close();
        };

        return () => eventSource.close();
    }, [isGenerating]);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    if (!isVisible) return null;

    return (
        <div className="absolute bottom-4 left-4 w-96 h-48 bg-black/90 backdrop-blur-md border border-green-500/30 rounded-lg p-4 font-mono text-xs overflow-hidden shadow-[0_0_20px_rgba(0,255,0,0.2)] z-50">
            <div className="text-green-400 font-bold mb-2 border-b border-green-500/20 pb-1">
                {'>'} NEURAL_CORE.PY EXECUTION STREAM
            </div>
            <div className="flex flex-col space-y-1 h-32 overflow-y-auto custom-scrollbar">
                {logs.map((log, i) => (
                    <div key={i} className="text-green-300/80">
                        <span className="text-green-500 mr-2">$</span>
                        {log}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}

export default MatrixTerminal;
