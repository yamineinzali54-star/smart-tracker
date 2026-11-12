import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Receipt, Calendar, Utensils, Car, ShoppingBag, Zap, HeartPulse, Film, Plane, Tag, Video as LucideIcon } from 'lucide-react';
import { Expense } from '../types';

const formatExpenseDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString([], { month: 'short', day: 'numeric' });
};

type Tone = 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';

const toneClasses: Record<Tone, string> = {
  primary: 'bg-primary-50 text-primary-600 ring-primary-100',
  accent: 'bg-accent-50 text-accent-700 ring-accent-500/20',
  success: 'bg-success-50 text-success-700 ring-success-500/20',
  warning: 'bg-warning-50 text-warning-700 ring-warning-500/20',
  error: 'bg-error-50 text-error-700 ring-error-100',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
};

const categoryRules: { keywords: string[]; icon: LucideIcon; tone: Tone }[] = [
  { keywords: ['food', 'lunch', 'dinner', 'breakfast', 'coffee', 'meal', 'restaurant', 'drink'], icon: Utensils, tone: 'warning' },
  { keywords: ['transport', 'taxi', 'bus', 'fuel', 'car', 'grab', 'travel'], icon: Car, tone: 'primary' },
  { keywords: ['shop', 'cloth', 'grocer', 'market'], icon: ShoppingBag, tone: 'accent' },
  { keywords: ['bill', 'rent', 'electric', 'water', 'internet', 'phone', 'utility'], icon: Zap, tone: 'success' },
  { keywords: ['health', 'medic', 'doctor', 'pharm'], icon: HeartPulse, tone: 'error' },
  { keywords: ['movie', 'entertain', 'game', 'fun'], icon: Film, tone: 'accent' },
  { keywords: ['flight', 'hotel', 'trip'], icon: Plane, tone: 'primary' },
];

const getCategoryStyle = (category: string): { icon: LucideIcon; tone: Tone } => {
  const normalized = category.toLowerCase();
  const match = categoryRules.find((rule) => rule.keywords.some((keyword) => normalized.includes(keyword)));
  return match ?? { icon: Tag, tone: 'neutral' };
};

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete }) => {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Transactions</h2>
          <p className="text-xs text-slate-500">
            {expenses.length} {expenses.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Receipt className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-slate-900">No transactions yet</p>
          <p className="mt-1 text-sm text-slate-500">Use the agent command above to log your first expense.</p>
        </div>
      ) : (
        <>
          <div className="hidden items-center gap-4 border-b border-slate-100 bg-slate-50/70 px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 md:flex">
            <span className="flex-1">Description</span>
            <span className="w-32">Date</span>
            <span className="w-36 text-right">Amount</span>
            <span className="w-10" />
          </div>
          <ul className="max-h-[520px] divide-y divide-slate-100 overflow-y-auto">
            <AnimatePresence initial={false}>
              {expenses.map((expense) => {
                const { icon: CategoryIcon, tone } = getCategoryStyle(expense.category);
                return (
                  <motion.li
                    key={expense.id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    className="group flex items-center gap-4 px-5 py-3.5 transition-colors duration-150 hover:bg-slate-50/80 sm:px-6"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-transform duration-200 group-hover:scale-105 ${toneClasses[tone]}`}
                      >
                        <CategoryIcon className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{expense.description}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <span className="truncate rounded-md bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
                            {expense.category}
                          </span>
                          <span className="flex items-center gap-1 md:hidden">
                            <Calendar className="h-3 w-3" />
                            {formatExpenseDate(expense.date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden w-32 items-center gap-1.5 text-sm text-slate-500 md:flex">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatExpenseDate(expense.date)}
                    </div>

                    <div className="w-auto text-right md:w-36">
                      <p className="text-sm font-semibold tabular-nums text-slate-900">{expense.amount.toLocaleString()}</p>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{expense.currency}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDelete(expense.id)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-error-50 hover:text-error-600 focus:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                      title="Delete"
                      aria-label={`Delete ${expense.description}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </>
      )}
    </div>
  );
};

export default ExpenseList;
