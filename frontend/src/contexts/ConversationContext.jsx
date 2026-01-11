/**
 * ConversationManager
 * Multi-turn conversation context for AI clarification
 * Phase 6: AI Enhancements - Final
 */

import { createContext, useContext, useState, useCallback } from 'react';

const ConversationContext = createContext();

export function ConversationProvider({ children }) {
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [waitingForClarification, setWaitingForClarification] = useState(false);

    // Start a new conversation
    const startConversation = useCallback((initialPrompt) => {
        const conversation = {
            id: Date.now().toString(),
            messages: [
                {
                    role: 'user',
                    content: initialPrompt,
                    timestamp: new Date().toISOString()
                }
            ],
            context: {
                lastPrompt: initialPrompt,
                parsedDimensions: null,
                ambiguities: [],
                resolvedClarifications: []
            }
        };

        setConversations(prev => [...prev, conversation]);
        setCurrentConversation(conversation);
        return conversation.id;
    }, []);

    // Add message to current conversation
    const addMessage = useCallback((role, content, metadata = {}) => {
        if (!currentConversation) return;

        const message = {
            role, // 'user', 'assistant', 'system'
            content,
            timestamp: new Date().toISOString(),
            ...metadata
        };

        setCurrentConversation(prev => ({
            ...prev,
            messages: [...prev.messages, message]
        }));

        setConversations(prev =>
            prev.map(conv =>
                conv.id === currentConversation.id
                    ? { ...conv, messages: [...conv.messages, message] }
                    : conv
            )
        );
    }, [currentConversation]);

    // Request clarification from user
    const requestClarification = useCallback((question, options) => {
        addMessage('assistant', question, {
            type: 'clarification',
            options
        });
        setWaitingForClarification(true);
    }, [addMessage]);

    // User provides clarification
    const provideClarification = useCallback((answer) => {
        addMessage('user', answer, { type: 'clarification_response' });
        setWaitingForClarification(false);

        // Update context
        if (currentConversation) {
            setCurrentConversation(prev => ({
                ...prev,
                context: {
                    ...prev.context,
                    resolvedClarifications: [
                        ...prev.context.resolvedClarifications,
                        { question: prev.messages[prev.messages.length - 1].content, answer }
                    ]
                }
            }));
        }
    }, [addMessage, currentConversation]);

    // Get conversation history for API
    const getConversationHistory = useCallback((conversationId) => {
        const conv = conversations.find(c => c.id === conversationId) || currentConversation;
        if (!conv) return [];

        return conv.messages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }));
    }, [conversations, currentConversation]);

    // Update context with parsed data
    const updateContext = useCallback((updates) => {
        if (!currentConversation) return;

        setCurrentConversation(prev => ({
            ...prev,
            context: { ...prev.context, ...updates }
        }));
    }, [currentConversation]);

    // Clear current conversation
    const clearConversation = useCallback(() => {
        setCurrentConversation(null);
        setWaitingForClarification(false);
    }, []);

    // Get conversation by ID
    const getConversation = useCallback((id) => {
        return conversations.find(c => c.id === id);
    }, [conversations]);

    return (
        <ConversationContext.Provider value={{
            conversations,
            currentConversation,
            waitingForClarification,
            startConversation,
            addMessage,
            requestClarification,
            provideClarification,
            getConversationHistory,
            updateContext,
            clearConversation,
            getConversation
        }}>
            {children}
        </ConversationContext.Provider>
    );
}

export const useConversation = () => {
    const context = useContext(ConversationContext);
    if (!context) {
        throw new Error('useConversation must be used within ConversationProvider');
    }
    return context;
};

export default ConversationContext;
