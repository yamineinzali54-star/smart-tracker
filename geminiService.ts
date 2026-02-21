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
  const cleaned = raw.replace(/```json|```/g, '').trim();
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

  if (lower.includes('delete last') || lower.includes('undo')) {
    return {
      action: 'delete_last_expense',
      response: 'I can remove the most recent expense for you.',
    };
  }

  if (lower.includes('clear all') || lower.includes('reset all')) {
    return {
      action: 'clear_all_expenses',
      response: 'I can clear all saved expenses. Please confirm by sending again if needed.',
    };
  }

  if (lower.includes('summary') || lower.includes('report')) {
    return {
      action: 'summarize',
      response: 'I will summarize your tracked expenses.',
    };
  }

  const amountMatch = inputText.match(/(\d+[\d,.]*)/);
  if (amountMatch) {
    return {
      action: 'add_expense',
      response: 'I extracted this as an expense and added it.',
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
    response: 'I could not identify a task. Please provide a spending entry or a command.',
  };
}

export async function getAgentAction(inputText: string, expenses: Expense[], memory: AgentMemoryItem[]): Promise<AgentAction> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are an autonomous finance assistant.
Given the user message and context, choose exactly one action.

Allowed actions:
- add_expense (when user logs spending)
- delete_last_expense (remove most recent)
- clear_all_expenses
- summarize (provide quick summary)
- noop

Rules:
- Return valid JSON only.
- Keep response concise and friendly.
- If action is add_expense, include expense object with:
  {"amount": number, "description": string, "category": string, "currency": string}
- Default currency MMK when missing.

Context: ${createContext(expenses, memory)}
User: "${inputText}"

Output schema:
{
  "action": "add_expense" | "delete_last_expense" | "clear_all_expenses" | "summarize" | "noop",
  "response": string,
  "expense"?: {"amount": number, "description": string, "category": string, "currency": string}
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = extractJson<AgentAction>(text);

    if (!parsed.action || !parsed.response) {
      throw new Error('Invalid agent payload');
    }

    return parsed;
  } catch (error) {
    console.error(error);
    return fallbackAction(inputText);
  }
}
