import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob as GenAIBlob } from '@google/genai';
import { MicrophoneIcon, StopIcon, XMarkIcon } from './Icons';

// Audio Encoding & Decoding functions
function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    // FIX: Corrected typo from Int116Array to Int16Array.
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}


type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error' | 'closed';

interface LiveAssistantProps {
    closeAssistant: () => void;
}


const LiveAssistant: React.FC<LiveAssistantProps> = ({ closeAssistant }) => {
    const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
    const [userSaid, setUserSaid] = useState<string>('');
    const [aiSaid, setAiSaid] = useState<string>('');
    
    const sessionRef = useRef<LiveSession | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

    const startConversation = async () => {
        if (connectionState !== 'idle' && connectionState !== 'closed' && connectionState !== 'error') return;

        setConnectionState('connecting');
        setUserSaid('');
        setAiSaid('Connecting to AI...');
        
        try {
            if (!process.env.API_KEY) throw new Error("API Key not found.");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            inputAudioContextRef.current = inputAudioContext;
            
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            outputAudioContextRef.current = outputAudioContext;
            nextStartTimeRef.current = 0;

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: 'You are a friendly and encouraging fitness and nutrition assistant. Keep your answers concise and positive.',
                },
                callbacks: {
                    onopen: () => {
                        setConnectionState('connected');
                        setAiSaid("I'm listening...");
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
                            const pcmBlob: GenAIBlob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromise.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            setUserSaid(prev => prev + message.serverContent.inputTranscription.text);
                        }
                         if (message.serverContent?.outputTranscription) {
                            setAiSaid(prev => prev + message.serverContent.outputTranscription.text);
                        }
                        if(message.serverContent?.turnComplete) {
                            setUserSaid('');
                            setAiSaid('');
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            const outputAudioContext = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                            const source = outputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputAudioContext.destination);
                            source.addEventListener('ended', () => sourcesRef.current.delete(source));
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }

                        if (message.serverContent?.interrupted) {
                            sourcesRef.current.forEach(source => source.stop());
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onclose: () => {
                        setConnectionState('closed');
                         setAiSaid("Connection closed.");
                        cleanUp();
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error("Live API Error:", e);
                        setConnectionState('error');
                        setAiSaid("Sorry, a connection error occurred.");
                        cleanUp();
                    },
                }
            });
            sessionPromise.then(session => {
                sessionRef.current = session;
            });
        } catch (error) {
            console.error("Failed to start conversation:", error);
            setConnectionState('error');
            setAiSaid("Could not start session. Check permissions?");
            cleanUp();
        }
    };

    const stopConversation = () => {
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
        cleanUp();
    };
    
    const cleanUp = () => {
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
        
        scriptProcessorRef.current?.disconnect();
        scriptProcessorRef.current = null;
        
        inputAudioContextRef.current?.close();
        inputAudioContextRef.current = null;
        
        outputAudioContextRef.current?.close();
        outputAudioContextRef.current = null;
        
        sourcesRef.current.forEach(source => source.stop());
        sourcesRef.current.clear();

        setConnectionState('closed');
    };

    useEffect(() => {
        return () => { // Cleanup on component unmount
            stopConversation();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isSessionActive = connectionState === 'connecting' || connectionState === 'connected';

    return (
        <div className="fixed inset-0 bg-violet-600 text-white flex flex-col items-center justify-between z-50 p-8">
            <button onClick={closeAssistant} className="absolute top-4 right-4 text-white/70 hover:text-white">
                <XMarkIcon />
            </button>
            <div className="text-center mt-20">
                 <p className="text-lg text-white/80 mb-2">You</p>
                 <p className="text-2xl font-medium h-16">{userSaid || '...'}</p>
            </div>
            <div className="text-center">
                 <p className="text-lg text-white/80 mb-2">Fit Buddy AI</p>
                 <p className="text-3xl font-bold h-20">{aiSaid || '...'}</p>
            </div>
            
            <div className="w-full flex flex-col items-center">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${isSessionActive ? 'bg-white/20 animate-pulse' : 'bg-white/10'}`}>
                    {isSessionActive ? (
                        <button onClick={stopConversation} className="bg-red-500 text-white rounded-full w-24 h-24 flex items-center justify-center shadow-lg">
                            <StopIcon className="w-12 h-12"/>
                        </button>
                    ) : (
                        <button onClick={startConversation} className="bg-white text-violet-600 rounded-full w-24 h-24 flex items-center justify-center shadow-lg">
                            <MicrophoneIcon className="w-12 h-12"/>
                        </button>
                    )}
                </div>
                 <p className="mt-6 text-white/80">
                    {connectionState === 'idle' && 'Tap to start'}
                    {connectionState === 'connecting' && 'Connecting...'}
                    {connectionState === 'connected' && 'Session active. Tap red button to end.'}
                    {connectionState === 'closed' && 'Session ended. Tap to restart.'}
                    {connectionState === 'error' && 'Error occurred. Tap to retry.'}
                </p>
            </div>
        </div>
    );
};

export default LiveAssistant;