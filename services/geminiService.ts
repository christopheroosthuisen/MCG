import { GoogleGenAI, Type } from "@google/genai";
import { FeedbackMessage } from "../types";

const apiKey = process.env.API_KEY || ''; // In a real app, ensure this is handled securely

// Simulated AI delay since we might not have a key
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeSwingFrame = async (imageData: string): Promise<FeedbackMessage[]> => {
    // In a production environment, this would call the Gemini 2.5 Flash Image model
    // to analyze the specific frame for posture, grip, etc.
    
    // START SIMULATION
    await delay(1500);
    return [
        {
            id: crypto.randomUUID(),
            timestamp: 0,
            text: "Your head position is drifting slightly forward during the backswing.",
            severity: "WARNING",
            category: "POSTURE"
        },
        {
            id: crypto.randomUUID(),
            timestamp: 0,
            text: "Grip looks neutral and strong. Good job.",
            severity: "INFO",
            category: "GRIP"
        }
    ];
    // END SIMULATION
    
    /* 
    // REAL IMPLEMENTATION PATTERN
    if (!apiKey) throw new Error("API Key missing");
    
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/jpeg', data: imageData } },
                { text: 'Analyze this golf swing frame. Identify any posture or grip issues.' }
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
                        severity: { type: Type.STRING },
                        category: { type: Type.STRING }
                    }
                }
            }
        }
    });
    
    // Parse response.text...
    */
};

export const getCoachAdvice = async (issue: string): Promise<string> => {
    // START SIMULATION
    await delay(1000);
    return `To fix ${issue}, try the "Wall Drill". Stand with your back to a wall...`;
    // END SIMULATION
};
