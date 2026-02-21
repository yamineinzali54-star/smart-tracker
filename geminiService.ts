import { GoogleGenerativeAI } from '@google/generative-ai';
import { AgentAction, AgentMemoryItem, Expense } from './types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

function getGenAI() {
if (!apiKey) {
throw new Error('Missing VITE_GEMINI_API_KEY in environment variables.');
}
return new GoogleGenerativeAI(apiKey);
}

function extractJson<T>(raw: string): T {
const cleaned = raw.replace(/json|/g, '').trim();
return JSON.parse(cleaned) as T;
}

function createContext(expenses: Expense[], memory: AgentMemoryItem[]): string {
const recentExpenses = expenses.slice(0, 10).map((expense) => ({
amount: expense.amount,
currency: expense.currency,
category: expense.category,
description: expense.description,
date: expense.date,
}));
const recentMemory = memory.slice(-8);
return JSON.stringify({ recentExpenses, recentMemory });
}

function fallbackAction(inputText: string): AgentAction {
const lower = inputText.toLowerCase();
if (lower.includes('ဖျက်') || lower.includes('delete') || lower.includes('undo')) {
return {
action: 'delete_last_expense',
response: 'နောက်ဆုံးမှတ်ထားတဲ့ အသုံးစရိတ်ကို ဖျက်ပေးလိုက်ပါမယ်။',
};
}
const amountMatch = inputText.match(/(\d+[\d,.]*)/);
if (amountMatch) {
return {
action: 'add_expense',
response: 'အသုံးစရိတ်အသစ်အဖြစ် မှတ်သားလိုက်ပါပြီ။',
expense: {
amount: Number(amountMatch[1].replace(/,/g, '')),
currency: 'MMK',
category: 'general',
description: inputText,
},
};
}
return {
action: 'noop',
response: 'နားမလည်ပါဘူး။ "မုန့်ဖိုး ၃၀၀၀" လိုမျိုး ရိုက်ထည့်ပေးပါ။',
};
}

export async function getAgentAction(inputText: string, expenses: Expense[], memory: AgentMemoryItem[]): Promise<AgentAction> {
const genAI = getGenAI();
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const prompt = You are an autonomous finance assistant. Understand English and Burmese. Respond in Burmese.  Extract expense data like amount and description. User: "${inputText}" Context: ${createContext(expenses, memory)};

try {
const result = await model.generateContent(prompt);
const text = result.response.text();
return extractJson<AgentAction>(text);
} catch (error) {
return fallbackAction(inputText);
}
}
