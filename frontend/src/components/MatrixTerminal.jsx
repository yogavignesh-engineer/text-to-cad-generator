/**
 * Matrix Terminal Component
 * Streams backend logs in real-time with "Hacker" aesthetic
 * ELITE UX UPGRADE
 */

import { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, CheckCircle, Activity, Box } from 'lucide-react';

export function MatrixTerminal({ isVisible }) {
    const [logs, setLogs] = useState([]);
    const bottomRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // Connect to stream when visible
    useEffect(() => {
        if (!isVisible) {
            setLogs([]);
            return;
        }

        // Clear previous logs
        setLogs(['> Establishing secure connection to NeuralCAD kernel...']);

        // Connect to EventSource
        const eventSource = new EventSource('http://localhost:8001/api/stream-logs');

        eventSource.onmessage = (event) => {
            // Add log with timestamp
            const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setLogs(prev => [...prev, `[${timestamp}] ${event.data}`]);

            // Close on "Done"
            if (event.data.includes('Done')) {
                eventSource.close();
            }
        };

        eventSource.onerror = () => {
            setLogs(prev => [...prev, '> Connection closed.']);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div className="w-full bg-black/90 backdrop-blur-md rounded-xl border border-green-500/30 overflow-hidden font-mono text-sm shadow-[0_0_20px_rgba(34,197,94,0.1)]">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-green-900/10 border-b border-green-500/20">
                <div className="flex items-center gap-2 text-green-400">
                    <Terminal className="w-4 h-4" />
                    <span className="font-bold">SYSTEM TERMINAL</span>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
            </div>

            {/* Logs Area */}
            <div className="p-4 h-48 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-transparent">
                {logs.map((log, idx) => (
                    <div key={idx} className="text-green-500 flex items-start gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="text-green-700 font-bold opacity-50">{'>'}</span>
                        <span className={log.includes('Done') ? 'text-green-400 font-bold' : ''}>
                            {log}
                        </span>
                    </div>
                ))}
                {/* Blinking Cursor */}
                <div className="flex items-center gap-2 text-green-500 animate-pulse">
                    <span className="text-green-700 font-bold opacity-50">{'>'}</span>
                    <span className="w-2 h-4 bg-green-500 block" />
                </div>
                <div ref={bottomRef} />
            </div>

            {/* Status Footer */}
            <div className="px-4 py-1.5 bg-green-900/5 border-t border-green-500/10 flex justify-between items-center text-[10px] text-green-600/70">
                <div className="flex gap-3">
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> SECURE ENV</span>
                    <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> MEMORY: 64MB</span>
                    <span className="flex items-center gap-1"><Box className="w-3 h-3" /> FREECAD KERNEL</span>
                </div>
                <div>Connected: localhost:8001</div>
            </div>
        </div>
    );
}

export default MatrixTerminal;
