type ExpenseInput = {
  id?: string;
  amount?: number;
  currency?: string;
  category?: string;
  description?: string;
  date?: string;
};

type MemoryItem = { role?: string; content?: string; timestamp?: string };

type ParsedExpense = {
  amount: number;
  currency: string;
  category: string;
  description: string;
};

function fallbackAction(inputText: string) {
  const lower = inputText.toLowerCase();

  if (lower.includes("delete last") || lower.includes("undo") || lower.includes("remove last")) {
    return { action: "delete_last_expense", response: "I will remove the most recent expense." };
  }
  if (lower.includes("clear all") || lower.includes("reset all")) {
    return { action: "clear_all_expenses", response: "I will clear all saved expenses." };
  }
  if (lower.includes("summary") || lower.includes("report")) {
    return { action: "summarize", response: "Here is a summary of your tracked expenses." };
  }

  // Recognize entries such as "lunch for 5000 MMK and coffee for 2500 MMK".
  const matches = [...inputText.matchAll(/([\p{L}][\p{L}\p{N}\s'’-]{0,45}?)\s+(?:for|:|=)\s*([\d,]+(?:\.\d{1,2})?)\s*(MMK|USD|EUR|THB)?/giu)];
  const expenses: ParsedExpense[] = matches
    .map((match) => ({
      amount: Number(match[2].replace(/,/g, "")),
      currency: (match[3] || "MMK").toUpperCase(),
      category: "general",
      description: match[1].trim().replace(/\b(?:and|add|both expenses separately)\b/gi, "").trim(),
    }))
    .filter((expense) => Number.isFinite(expense.amount) && expense.amount > 0 && expense.description.length > 0);

  if (expenses.length > 0) {
    return {
      action: "add_expense",
      response: `I identified ${expenses.length} expense(s). Please check the details.`,
      expense: expenses[0],
      expenses,
      source: "fallback",
    };
  }

  const amountMatch = inputText.match(/([\d,]+(?:\.\d{1,2})?)\s*(MMK|USD|EUR|THB)?/i);
  if (amountMatch) {
    const expense = {
      amount: Number(amountMatch[1].replace(/,/g, "")),
      currency: (amountMatch[2] || "MMK").toUpperCase(),
      category: "general",
      description: inputText.trim(),
    };
    if (expense.amount > 0) {
      return { action: "add_expense", response: "I extracted this expense. Please check the details.", expense, expenses: [expense], source: "fallback" };
    }
  }

  return { action: "noop", response: "I could not identify a task. Please provide an expense or a command.", source: "fallback" };
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const inputText = typeof req.body?.inputText === "string" ? req.body.inputText.trim() : "";
  if (!inputText) return res.status(400).json({ error: "inputText is required" });

  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) return res.status(200).json(fallbackAction(inputText));

  const baseURL = (process.env.LLM_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/$/, "");
  const model = process.env.LLM_MODEL || "nvidia/nemotron-3.5-lightning:free";

  try {
    const context = {
      recentExpenses: Array.isArray(req.body?.expenses) ? (req.body.expenses as ExpenseInput[]).slice(0, 10) : [],
      recentMemory: Array.isArray(req.body?.memory) ? (req.body.memory as MemoryItem[]).slice(-8) : [],
    };
    const prompt = `You are a personal expense tracker assistant. Return ONLY valid JSON.
Choose one action: add_expense, delete_last_expense, clear_all_expenses, summarize, noop.
For add_expense, return "expenses" as an array, allowing multiple expenses from one message. Each expense must have amount (positive number), currency (default MMK), category, description. Also return action and a concise response. Do not invent expenses. If the user requests deleting or clearing, do not add expenses.
Context: ${JSON.stringify(context)}
User message: ${JSON.stringify(inputText)}
JSON shape: {"action":"add_expense|delete_last_expense|clear_all_expenses|summarize|noop","response":"string","expenses":[{"amount":5000,"currency":"MMK","category":"Food","description":"Lunch"}]}`;

    const upstream = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
      }),
    });

    if (!upstream.ok) {
      console.error("LLM provider returned status", upstream.status);
      return res.status(502).json({ error: "AI provider request failed" });
    }

    const payload = await upstream.json();
    const raw = payload?.choices?.[0]?.message?.content;
    if (typeof raw !== "string") return res.status(502).json({ error: "AI provider returned an invalid response" });

    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start < 0 || end <= start) return res.status(502).json({ error: "AI response was not valid JSON" });

    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    const allowedActions = new Set(["add_expense", "delete_last_expense", "clear_all_expenses", "summarize", "noop"]);
    if (!allowedActions.has(parsed.action) || typeof parsed.response !== "string") {
      return res.status(502).json({ error: "AI response did not match the expected schema" });
    }

    const rawExpenses = Array.isArray(parsed.expenses) ? parsed.expenses : (parsed.expense ? [parsed.expense] : []);
    const expenses = rawExpenses.filter((e: any) =>
      e && Number.isFinite(e.amount) && e.amount > 0 &&
      typeof e.description === "string" && e.description.trim() &&
      typeof (e.currency || "MMK") === "string" &&
      typeof (e.category || "general") === "string"
    ).map((e: any) => ({
      amount: e.amount,
      currency: (e.currency || "MMK").toUpperCase(),
      category: e.category || "general",
      description: e.description.trim(),
    }));

    return res.status(200).json({
      action: parsed.action,
      response: parsed.response,
      ...(expenses.length ? { expense: expenses[0], expenses } : {}),
      source: "llm",
    });
  } catch (error) {
    console.error("Agent API error:", error instanceof Error ? error.message : "Unknown error");
    return res.status(500).json({ error: "Agent API failed" });
  }
}
