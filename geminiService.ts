import { GoogleGenerativeAI } from "@google/genai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function extractExpenseData(inputText: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Extract expense: "${inputText}". Return JSON only: {"amount": number, "description": string, "category": string, "currency": string}. Default currency MMK.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error(error);
    throw new Error("VPN သို့မဟုတ် API Key ကိုပြန်စစ်ပေးပါ။");
  }
}
