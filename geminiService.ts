
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const extractExpenseData = async (text: string): Promise<AIResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Extract expense details from the following text: "${text}". If no currency is mentioned, assume local or general.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: {
              type: Type.NUMBER,
              description: "The numerical amount spent.",
            },
            currency: {
              type: Type.STRING,
              description: "The currency name or symbol (e.g., USD, EUR).",
            },
            category: {
              type: Type.STRING,
              description: "A short category (e.g., Food, Transport, Rent, Shopping).",
            },
            description: {
              type: Type.STRING,
              description: "A brief description of the expense.",
            },
          },
          required: ["amount", "category", "description"],
        },
      },
    });

    const jsonStr = response.text?.trim() || "{}";
    return JSON.parse(jsonStr) as AIResponse;
  } catch (error) {
    console.error("AI Extraction failed:", error);
    throw new Error("Could not parse your expense. Try being more specific (e.g., 'I spent 5000 Kyats on lunch').");
  }
};
