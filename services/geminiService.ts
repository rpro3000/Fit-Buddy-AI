
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const mealAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        mealName: {
            type: Type.STRING,
            description: "A short, descriptive name for the meal in the image.",
        },
        calories: {
            type: Type.NUMBER,
            description: "Estimated number of calories in the meal.",
        },
        protein: {
            type: Type.NUMBER,
            description: "Estimated grams of protein in the meal.",
        },
        carbs: {
            type: Type.NUMBER,
            description: "Estimated grams of carbohydrates in the meal.",
        },
        fat: {
            type: Type.NUMBER,
            description: "Estimated grams of fat in the meal.",
        },
    },
    required: ["mealName", "calories", "protein", "carbs", "fat"],
};


export const analyzeMealImage = async (base64Image: string, mimeType: string) => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType,
                            data: base64Image,
                        },
                    },
                    { text: "Analyze the meal in this image. Provide the meal name and estimate the nutritional content (calories, protein, carbs, fat)." },
                ],
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: mealAnalysisSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error analyzing meal image:", error);
        throw new Error("Failed to analyze image. Please try again.");
    }
};

export const getMealAdvice = async (context: string): Promise<GenerateContentResponse> => {
     try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: context,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        return response;
    } catch (error) {
        console.error("Error getting meal advice:", error);
        throw new Error("Failed to get advice from AI. Please try again.");
    }
}
