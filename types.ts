export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: string;
}

export interface AIResponse {
  amount: number;
  currency: string;
  category: string;
  description: string;
}

export interface AgentMemoryItem {
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
}

export type AgentActionType =
  | 'add_expense'
  | 'delete_last_expense'
  | 'clear_all_expenses'
  | 'summarize'
  | 'noop';

export interface AgentAction {
  action: AgentActionType;
  response: string;
  expense?: AIResponse;
}
