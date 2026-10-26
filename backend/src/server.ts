import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

dotenv.config({
    path: path.resolve(currentDir, "../.env"),
});
import express, { Request, Response } from "express";
import OpenAI from "openai";

// Type definitions inline (same as frontend types.ts)
interface Expense {
    id: string;
    amount: number;
    currency: string;
    category: string;
    description: string;
    date: string;
}

interface AgentMemoryItem {
    role: "user" | "agent";
    content: string;
    timestamp: string;
}

interface AgentAction {
    action: "add_expense" | "delete_last_expense" | "clear_all_expenses" | "summarize" | "noop";
    response: string;
    expense?: {
        amount: number;
        currency: string;
        category: string;
        description: string;
    };
}

// Type for the request body
interface AgentRequestBody {
    inputText: string;
    expenses: Expense[];
    memory: AgentMemoryItem[];
}

// Type for the response
interface AgentResponse {
    action: AgentAction["action"];
    response: string;
    expense?: AgentAction["expense"];
}

// LLM setup (OpenRouter / OpenAI-compatible)
const apiKey = process.env.LLM_API_KEY;
const baseURL = process.env.LLM_BASE_URL || "https://openrouter.ai/api/v1";
const llmModel = process.env.LLM_MODEL || "nvidia/nemotron-3.5-lightning:free";

// Validate that the key is present
if (!apiKey) {
    console.error("FATAL: LLM_API_KEY not set in environment variables");
    process.exit(1);
}

// Initialize the OpenAI-compatible client for OpenRouter
const openai = new OpenAI({ apiKey, baseURL });

// Express app
const app = express();
app.use(express.json());

// Helper: create the same context as the frontend
function createContext(expenses: Expense[], memory: AgentMemoryItem[]) {
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

// Helper: same fallback logic as the frontend
function fallbackAction(inputText: string) {
    const lower = inputText.toLowerCase();

    if (lower.includes("delete last") || lower.includes("undo")) {
        return {
            action: "delete_last_expense",
            response: "I can remove the most recent expense for you.",
        };
    }

    if (lower.includes("clear all") || lower.includes("reset all")) {
        return {
            action: "clear_all_expenses",
            response: "I can clear all saved expenses. Please confirm by sending again if needed.",
        };
    }

    if (lower.includes("summary") || lower.includes("report")) {
        return {
            action: "summarize",
            response: "I will summarize your tracked expenses.",
        };
    }

    const amountMatch = inputText.match(/(\d+[\d,.]*)/);
    if (amountMatch) {
        return {
            action: "add_expense",
            response: "I extracted this as an expense and added it.",
            expense: {
                amount: Number(amountMatch[1].replace(/,/g, "")),
                currency: "MMK",
                category: "general",
                description: inputText,
            },
        };
    }

    return {
        action: "noop",
        response: "I could not identify a task. Please provide a spending entry or a command.",
    };
}

// POST /api/agent endpoint
app.post("/api/agent", async (req: Request, res: Response) => {
    try {
        const { inputText, expenses, memory } = req.body as {
            inputText: string;
            expenses: Expense[];
            memory: AgentMemoryItem[];
        };

        if (!inputText) {
            res.status(400).json({ error: "inputText is required" });
            return;
        }

        // Use deterministic fallback if no API key configured
        if (!apiKey) {
            const fallback = fallbackAction(inputText);
            res.json({ success: true, action: fallback.action, response: fallback.response, expense: fallback.expense, source: "fallback" });
            return;
        }

        // Build the same prompt the frontend used with Gemini
        const context = createContext(expenses, memory);

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

Context: ${context}
User: "${inputText}"

Output schema:
{
"action": "add_expense" | "delete_last_expense" | "clear_all_expenses" | "summarize" | "noop",
"response": string,
"expense"?: {"amount": number, "description": string, "category": string, "currency": string},
"expenses"?: {"amount": number, "description": string, "category": string, "currency": string}[}
`;

        // Call OpenAI-compatible API via OpenRouter
        let parsed: { action: string; response: string; expense?: { amount: number; currency: string; category: string; description: string } } | null = null;
        let llmSource = "fallback";

        try {
            const completion = await openai.chat.completions.create({
                model: llmModel,
                messages: [{ role: "user", content: prompt }],
                temperature: 0,
            });

            const text = completion.choices[0]?.message?.content || "";

            // Extract JSON from the response (strip potential markdown code blocks)
            let cleaned = text.replace(/```json|```/g, "").trim();
            // Robust extraction: find JSON object from first { to last
            try {
                const start = cleaned.indexOf("{");
                const end = cleaned.lastIndexOf("}");
                if (start >= 0 && end > start) {
                    const jsonStr = cleaned.substring(start, end + 1);
                    parsed = JSON.parse(jsonStr);
                }
            } catch (e) {
                console.error("LLM reply unusable:", text.substring(0, 300));
            }

            // Support multiple expenses: check for expenses array first, then fall back to single expense
            let expenseList: { amount: number; currency: string; category: string; description: string }[] = [];
            if (Array.isArray(parsed!.expenses)) {
                // New format: expenses is an array
                expenseList = parsed!.expenses.filter(
                    (e): e is { amount: number; currency: string; category: string; description: string } =>
                        typeof e.amount === 'number' && e.currency && e.category && e.description
                );
            } else if (parsed!.expense) {
                // Backward-compatible format: single expense object
                expenseList = [parsed!.expense];
            }

            // Send one response with both expense (first) and expenses (array)
            res.json({ success: true, action: parsed!.action, response: parsed!.response, expense: expenseList.length > 0 ? expenseList[0] : undefined, expenses: expenseList.length > 0 ? expenseList : undefined, source: llmSource });
        } catch (error) {
            console.error("/api/agent error:", error instanceof Error ? error.message : String(error));
            // Fallback on API error
            const fallback = fallbackAction(req.body?.inputText || "unknown");
            res.status(500).json({ success: false, error: "Internal server error", action: fallback.action, response: fallback.response, expense: fallback.expense, source: "fallback" });
            return;
        }
    } catch (error) {
        console.error("/api/agent error:", error instanceof Error ? error.message : String(error));
        // Don't expose the API key in error messages
        const fallback = fallbackAction(req.body?.inputText || "unknown");
        res.status(500).json({ success: false, error: "Internal server error", action: fallback.action, response: fallback.response, expense: fallback.expense, source: "fallback" });
    }
});

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", hasApiKey: !!apiKey });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`API key configured: ${!!apiKey}`);
    console.log(`LLM model: ${llmModel}`);
});