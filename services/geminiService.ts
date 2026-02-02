import { GoogleGenAI, Type, Modality } from "@google/genai";
import { FeedbackMessage } from "../types";

// Initialize the client
// Note: In a production app, the API key should be handled via a secure backend proxy or environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Helper for audio context (singleton to avoid browser limits)
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    return audioContext;
};

/**
 * Analyzes a golf swing frame using Gemini 3 Pro Vision.
 */
export const analyzeSwingFrame = async (imageData: string): Promise<FeedbackMessage[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: imageData } },
                    { text: 'Analyze this golf swing frame. Identify any posture, grip, or alignment issues. Return a JSON array of feedback items with text, severity (INFO, WARNING, CRITICAL), and category (POSTURE, GRIP, TEMPO, PLANE, ROTATION).' }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING },
                            severity: { type: Type.STRING, enum: ['INFO', 'WARNING', 'CRITICAL'] },
                            category: { type: Type.STRING, enum: ['POSTURE', 'GRIP', 'TEMPO', 'PLANE', 'ROTATION'] }
                        }
                    }
                }
            }
        });

        if (response.text) {
            const raw = JSON.parse(response.text);
            return raw.map((item: any) => ({
                id: crypto.randomUUID(),
                timestamp: 0, // Default to start for single frame
                ...item
            }));
        }
        return [];
    } catch (error) {
        console.error("Analysis failed:", error);
        throw error;
    }
};

/**
 * Generates speech from text using Gemini 2.5 Flash TTS.
 */
export const generateSpeech = async (text: string): Promise<void> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Deep, coach-like voice
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            const ctx = getAudioContext();
            const binaryString = atob(base64Audio);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            // PCM decoding
            const dataInt16 = new Int16Array(bytes.buffer);
            const frameCount = dataInt16.length;
            const audioBuffer = ctx.createBuffer(1, frameCount, 24000);
            const channelData = audioBuffer.getChannelData(0);
            for (let i = 0; i < frameCount; i++) {
                channelData[i] = dataInt16[i] / 32768.0;
            }

            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.start();
        }
    } catch (error) {
        console.error("TTS failed:", error);
    }
};

/**
 * Generates a custom drill video using Veo 3.1.
 */
export const generateDrillVideo = async (prompt: string): Promise<string | null> => {
    try {
        // Check for API Key selection (required for Veo)
        if ((window as any).aistudio?.hasSelectedApiKey) {
             const hasKey = await (window as any).aistudio.hasSelectedApiKey();
             if (!hasKey) {
                 await (window as any).aistudio.openSelectKey();
                 // Re-instantiate AI with new key if possible, or assume env key is updated in context
             }
        }

        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: `A professional golf training video demonstrating: ${prompt}. Realistic, clear instructional angle.`,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });

        // Polling for completion
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (videoUri) {
            // Append API key if needed for access (depending on env setup, usually embedded or header)
            return `${videoUri}&key=${process.env.API_KEY}`;
        }
        return null;

    } catch (error) {
        console.error("Veo generation failed:", error);
        return null;
    }
};

/**
 * Chat with the AI Caddie using Search and Maps Grounding.
 */
export const askAICaddie = async (query: string, history: any[]): Promise<string> => {
    try {
        // Determine if we need deep thinking based on query complexity
        const isComplex = query.toLowerCase().includes("strategy") || query.toLowerCase().includes("analyze") || query.toLowerCase().includes("why");
        
        const config: any = {
            tools: [{ googleSearch: {} }, { googleMaps: {} }],
        };

        if (isComplex) {
            config.thinkingConfig = { thinkingBudget: 16000 }; // Use thinking for complex strategy
        }

        const chat = ai.chats.create({
            model: 'gemini-3-pro-preview',
            config,
            history: [
                {
                    role: 'user',
                    parts: [{ text: "You are an expert AI Golf Caddie. Use Google Search to find rule changes or tour news. Use Google Maps to find course details. Give concise, actionable advice." }]
                },
                ...history
            ]
        });

        const response = await chat.sendMessage({ message: query });
        
        // Return text + grounding metadata if useful (simplified for string return)
        let result = response.text || "I couldn't find an answer.";
        
        // Check for grounding (simplified extraction)
        if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            const chunks = response.candidates[0].groundingMetadata.groundingChunks;
            const webLinks = chunks.filter((c: any) => c.web).map((c: any) => `[${c.web.title}](${c.web.uri})`).join(', ');
            if (webLinks) result += `\n\nSources: ${webLinks}`;
        }

        return result;

    } catch (error) {
        console.error("Caddie chat failed:", error);
        return "I'm having trouble connecting to the clubhouse. Please try again.";
    }
};