/**
 * AIChatInterface Component
 * Conversational AI mode with clarification system
 * Phase 6: AI Enhancements - Final
 */

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { useConversation } from '../contexts/ConversationContext';

export function AIChatInterface({ onPromptConfirmed }) {
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const messagesEndRef = useRef(null);

    const {
        currentConversation,
        waitingForClarification,
        startConversation,
        addMessage,
        provideClarification
    } = useConversation();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [currentConversation?.messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        if (waitingForClarification) {
            // User is responding to clarification
            provideClarification(input);
            setInput('');
            // Re-process with clarification
            await processWithAI();
        } else {
            // New conversation
            const convId = startConversation(input);
            setInput('');
            await processWithAI(input);
        }
    };

    const handleOptionSelect = async (option) => {
        provideClarification(option);
        await processWithAI();
    };

    const processWithAI = async (initialPrompt = null) => {
        setIsGenerating(true);

        try {
            // Simulate AI processing (replace with actual API call)
            const prompt = initialPrompt || currentConversation?.messages[currentConversation.messages.length - 1]?.content;

            // Check for ambiguities
            const ambiguities = detectAmbiguities(prompt);

            if (ambiguities.length > 0 && !currentConversation?.context.resolvedClarifications.length) {
                // Request clarification
                const clarification = ambiguities[0];
                addMessage('assistant', clarification.question, {
                    type: 'clarification',
                    options: clarification.options
                });
            } else {
                // No ambiguities or already clarified - confirm prompt
                addMessage('assistant', '✓ I understand. Generating your CAD model...', {
                    type: 'confirmation'
                });

                // Build final prompt with clarifications
                const finalPrompt = buildFinalPrompt(prompt, currentConversation?.context.resolvedClarifications || []);

                // Trigger generation
                if (onPromptConfirmed) {
                    setTimeout(() => onPromptConfirmed(finalPrompt), 500);
                }
            }
        } catch (error) {
            addMessage('system', `Error: ${error.message}`, { type: 'error' });
        } finally {
            setIsGenerating(false);
        }
    };

    const detectAmbiguities = (prompt) => {
        const ambiguities = [];
        const lower = prompt.toLowerCase();

        // Check for assembly without clear orientation
        if ((lower.includes('shaft') && lower.includes('gear')) &&
            !lower.includes('vertical') && !lower.includes('horizontal')) {
            ambiguities.push({
                question: 'I\'m creating a gear and shaft assembly. How should the shaft be oriented?',
                options: [
                    'Vertical (shaft stands upright through gear)',
                    'Horizontal (shaft lies flat through gear)',
                    'At an angle'
                ]
            });
        }

        // Check for missing key dimensions
        if (lower.includes('box') &&
            !(lower.includes('x') || (lower.includes('length') && lower.includes('width')))) {
            ambiguities.push({
                question: 'What dimensions would you like for the box?',
                options: [
                    'Standard cube (50x50x50mm)',
                    'Thin plate (100x100x10mm)',
                    'Let me specify custom dimensions'
                ]
            });
        }

        // Check for hole placement ambiguity
        if (lower.includes('hole') &&
            !lower.includes('center') && !lower.includes('corner')) {
            ambiguities.push({
                question: 'Where should the hole be placed?',
                options: [
                    'Center of the part',
                    'Corners (4 holes)',
                    'Custom position - I\'ll specify'
                ]
            });
        }

        return ambiguities;
    };

    const buildFinalPrompt = (original, clarifications) => {
        let prompt = original;

        clarifications.forEach(({ question, answer }) => {
            // Append clarifications to prompt
            if (answer.includes('Vertical')) {
                prompt += ', shaft oriented vertically';
            } else if (answer.includes('Horizontal')) {
                prompt += ', shaft oriented horizontally';
            } else if (answer.includes('Center')) {
                prompt += ' with center hole';
            } else if (answer.includes('Corners')) {
                prompt += ' with 4 corner holes';
            }
            // Add more mappings as needed
        });

        return prompt;
    };

    const messages = currentConversation?.messages || [];

    return (
        <div className="flex flex-col h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold text-white">AI Conversation Mode</h3>
                    <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                    Describe your part naturally - I'll ask for clarification if needed
                </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">Start a conversation to begin</p>
                        <p className="text-xs text-gray-500 mt-2">
                            Try: "I need a gear and shaft assembly"
                        </p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`
                max-w-[80%] rounded-xl p-3
                ${msg.role === 'user'
                                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30'
                                    : msg.type === 'error'
                                        ? 'bg-red-500/10 border border-red-500/30'
                                        : 'bg-white/10 border border-white/20'
                                }
              `}>
                                {/* Message content */}
                                <div className="text-sm text-white whitespace-pre-wrap">
                                    {msg.content}
                                </div>

                                {/* Options for clarification */}
                                {msg.type === 'clarification' && msg.options && (
                                    <div className="mt-3 space-y-2">
                                        {msg.options.map((option, optIdx) => (
                                            <button
                                                key={optIdx}
                                                onClick={() => handleOptionSelect(option)}
                                                className="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-cyan-500/50 rounded-lg text-sm text-white transition-all"
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Timestamp */}
                                <div className="text-[10px] text-gray-500 mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {isGenerating && (
                    <div className="flex justify-start">
                        <div className="bg-white/10 border border-white/20 rounded-xl p-3">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-75" />
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150" />
                                <span className="ml-2">AI is thinking...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-white/5">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={waitingForClarification ? 'Answer the question or choose an option...' : 'Describe your part...'}
                        disabled={isGenerating}
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isGenerating}
                        className="px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AIChatInterface;
