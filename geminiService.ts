
import { AgentAction, AgentMemoryItem, Expense } from "./types";

type AgentExpense = {
    amount: number;
    currency: string;
    category: string;
    description: string;
};

type AgentApiResponse = {
    action?: string;
    response?: string;
    expense?: AgentExpense;
    expenses?: AgentExpense[];
};

function isValidExpense(value: unknown): value is AgentExpense {
    if (!value || typeof value !== "object") {
        return false;
    }

    const expense = value as Partial<AgentExpense>;

    return (
        typeof expense.amount === "number" &&
        Number.isFinite(expense.amount) &&
        expense.amount > 0 &&
        typeof expense.currency === "string" &&
        expense.currency.trim().length > 0 &&
        typeof expense.category === "string" &&
        expense.category.trim().length > 0 &&
        typeof expense.description === "string" &&
        expense.description.trim().length > 0
    );
}

export async function getAgentAction(
    inputText: string,
    expenses: Expense[],
    memory: AgentMemoryItem[]
): Promise<AgentAction> {
    try {
        const response = await fetch("/api/agent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputText,
                expenses,
                memory,
            }),
        });

        if (!response.ok) {
            console.error(
                "Agent API request failed:",
                response.status,
                response.statusText
            );

            return fallbackAction(inputText);
        }

        const data: AgentApiResponse = await response.json();

        // Check the response from the backend during testing.
        console.log("Agent API response:", data);

        if (
            !data ||
            typeof data.action !== "string" ||
            typeof data.response !== "string"
        ) {
            console.error("Invalid Agent API response:", data);
            return fallbackAction(inputText);
        }

        let expensesArray: AgentExpense[] = [];

        // Prefer the array when the backend returns multiple expenses.
        if (Array.isArray(data.expenses)) {
            expensesArray = data.expenses.filter(isValidExpense);
        }

        // Backward compatibility: accept a single expense.
        if (expensesArray.length === 0 && isValidExpense(data.expense)) {
            expensesArray = [data.expense];
        }

        const primaryExpense = isValidExpense(data.expense)
            ? data.expense
            : expensesArray[0];

        return {
            action: data.action,
            response: data.response,
            ...(primaryExpense ? { expense: primaryExpense } : {}),
            expenses: expensesArray,
        };
    } catch (error) {
        console.error("getAgentAction fetch error:", error);
        return fallbackAction(inputText);
    }
}

function extractJson<T>(raw: string): T {
    const cleaned = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    return JSON.parse(cleaned) as T;
}

function createContext(
    expenses: Expense[],
    memory: AgentMemoryItem[]
) {
    const recentExpenses = expenses.slice(0, 10).map((expense) => ({
        amount: expense.amount,
        currency: expense.currency,
        category: expense.category,
        description: expense.description,
        date: expense.date,
    }));

    const recentMemory = memory.slice(-8);

    return JSON.stringify({
        recentExpenses,
        recentMemory,
    });
}

function fallbackAction(inputText: string): AgentAction {
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
            response:
                "I can clear all saved expenses. Please confirm by sending again if needed.",
        };
    }

    if (lower.includes("summary") || lower.includes("report")) {
        return {
            action: "summarize",
            response: "I will summarize your tracked expenses.",
        };
    }

    const amountMatch = inputText.match(/(\d[\d,.]*)/);

    if (amountMatch) {
        const amount = Number(amountMatch[1].replace(/,/g, ""));

        if (Number.isFinite(amount) && amount > 0) {
            const expense: AgentExpense = {
                amount,
                currency: "MMK",
                category: "general",
                description: inputText,
            };

            return {
                action: "add_expense",
                response: "I extracted this as an expense.",
                expense,
                expenses: [expense],
            };
        }
    }

    return {
        action: "noop",
        response:
            "I could not identify a task. Please provide a spending entry or a command.",
    };
}
