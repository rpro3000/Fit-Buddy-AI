
import React, { useState, useRef, useEffect } from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import { getMealAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';
import { PaperAirplaneIcon, LinkIcon, MicrophoneIcon } from './Icons';

interface ChatProps {
    onStartLive: () => void;
}

const Chat: React.FC<ChatProps> = ({ onStartLive }) => {
    const { totals, dailyLog } = useDailyLog();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { id: crypto.randomUUID(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const remainingCalories = Math.max(0, dailyLog.targets.calories - totals.calories);
        const context = `
            My current daily nutrition summary is:
            - Calories eaten: ${totals.calories} / ${dailyLog.targets.calories}
            - Protein eaten: ${totals.protein}g / ${dailyLog.targets.protein}g
            - Carbs eaten: ${totals.carbs}g / ${dailyLog.targets.carbs}g
            - Fat eaten: ${totals.fat}g / ${dailyLog.targets.fat}g
            - Calories remaining: ${remainingCalories}

            Based on this, here is my question: ${input}
        `;

        try {
            const response = await getMealAdvice(context);
            const aiMessage: ChatMessage = {
                id: crypto.randomUUID(),
                text: response.text,
                sender: 'ai',
                groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = {
                id: crypto.randomUUID(),
                text: 'Sorry, I had trouble getting a response. Please try again.',
                sender: 'ai'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] max-w-md mx-auto bg-white">
            <header className="p-4 border-b flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-900">AI Nutritionist</h1>
                <button onClick={onStartLive} className="text-violet-600 hover:text-violet-800" aria-label="Start Live AI session">
                    <MicrophoneIcon />
                </button>
            </header>
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 p-8">
                        <p>Ask for meal ideas, nutrition advice, or a plan for your day!</p>
                        <p className="text-sm mt-2">e.g., "What's a good high-protein snack I can have?"</p>
                    </div>
                )}
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-sm p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-violet-600 text-white rounded-br-lg' : 'bg-gray-100 text-gray-800 rounded-bl-lg'}`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            {msg.sender === 'ai' && msg.groundingChunks && msg.groundingChunks.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                    <h4 className="text-xs font-semibold text-gray-500 mb-1">Sources:</h4>
                                    <div className="flex flex-col space-y-1">
                                    {msg.groundingChunks.map((chunk: any, index: number) => (
                                        chunk.web && (
                                            <a 
                                                key={index}
                                                href={chunk.web.uri}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                                            >
                                                <LinkIcon />
                                                <span>{chunk.web.title || new URL(chunk.web.uri).hostname}</span>
                                            </a>
                                        )
                                    ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-xs p-3 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-lg">
                           <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t bg-white">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="Ask a question..."
                        className="flex-grow border-gray-300 rounded-full shadow-sm focus:ring-violet-500 focus:border-violet-500 py-2 px-4"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-violet-600 text-white rounded-full p-2 disabled:bg-gray-400">
                        <PaperAirplaneIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;