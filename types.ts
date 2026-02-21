
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
