'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import type { ChatMessage } from '@/app/types';

interface ChatInterfaceProps {
    messages: ChatMessage[];
    productName: string;
    manualText: string;
    onSendMessage: (message: string) => void;
    isStreaming: boolean;
    streamingContent: string;
}

export default function ChatInterface({
    messages,
    productName,
    manualText,
    onSendMessage,
    isStreaming,
    streamingContent,
}: ChatInterfaceProps) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingContent]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed || isStreaming) return;
        onSendMessage(trimmed);
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-interface flex flex-col" role="log" aria-label="Conversation with AI assistant">
            {/* Messages */}
            <div
                className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[500px]"
                aria-live="polite"
            >
                {/* Welcome message */}
                {messages.length === 0 && !isStreaming && (
                    <div className="flex gap-3 animate-fade-in">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-blue-400" aria-hidden="true" />
                        </div>
                        <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] border border-white/5">
                            <p className="text-gray-300 text-sm">
                                Hi! I&apos;m your assistant for the <strong className="text-white">{productName}</strong>.
                                {manualText
                                    ? " I've loaded the manual and I'm ready to answer your questions."
                                    : " I couldn't find the manual, but I can still help with general product questions."}
                            </p>
                        </div>
                    </div>
                )}

                {/* Message bubbles */}
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                    >
                        {msg.role === 'model' && (
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-blue-400" aria-hidden="true" />
                            </div>
                        )}
                        <div
                            className={`rounded-2xl px-4 py-3 max-w-[80%] text-sm leading-relaxed border ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-sm border-blue-400/20 shadow-lg shadow-blue-900/20'
                                : 'bg-white/5 text-gray-300 rounded-tl-sm border-white/5'
                                }`}
                        >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}

                {/* Streaming response */}
                {isStreaming && (
                    <div className="flex gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-blue-400" aria-hidden="true" />
                        </div>
                        <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] border border-white/5">
                            {streamingContent ? (
                                <p className="text-gray-300 text-sm whitespace-pre-wrap">{streamingContent}</p>
                            ) : (
                                <div className="typing-indicator flex gap-1.5 py-1.5" aria-label="AI is typing">
                                    <span className="w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-bounce" />
                                    <span className="w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <span className="w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5 bg-black/20">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Ask about ${productName}...`}
                        disabled={isStreaming}
                        className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3.5 
                       text-white text-sm placeholder:text-gray-500 
                       focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20
                       disabled:opacity-50 transition-all font-sans"
                        aria-label="Your question"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isStreaming}
                        className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 
                       disabled:bg-white/10 disabled:text-gray-600
                       text-white flex items-center justify-center transition-all shadow-lg active:scale-95"
                        aria-label="Send message"
                    >
                        <Send className="w-4 h-4" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>
    );
}
