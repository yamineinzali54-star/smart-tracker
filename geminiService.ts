import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIResponse } from "./types";

// Vite မှာ Environment Variable ခေါ်ယူပုံ (အရေးကြီးသည်)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const extractExpenseData = async (text: string): Promise<AIResponse> => {
  try {
    // Model အမည်ကို gemini-1.5-flash သို့မဟုတ် gemini-1.5-pro သုံးပါ
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Extract expense details from: "${text}". 
    Return ONLY a JSON object with: 
    { "amount": number, "currency": string, "category": string, "description": string }.
    If no currency is mentioned, use "Local".`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text().replace(/```json|```/g, "").trim();
    
    return JSON.parse(jsonStr) as AIResponse;
  } catch (error) {
    console.error("AI Extraction failed:", error);
    throw new Error("Could not parse your expense. Please check your VPN and API Key.");
  }
};
