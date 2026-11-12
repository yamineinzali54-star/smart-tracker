import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Receipt, Calendar } from 'lucide-react';
import { Expense } from '../types';

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
          <div className="hidden items-center gap-4 border-b border-slate-100 bg-slate-50 px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 md:flex">
            <span className="flex-1">Description</span>
            <span className="w-32">Date</span>
            <span className="w-36 text-right">Amount</span>
            <span className="w-10" />
          </div>
          <ul className="max-h-[520px] divide-y divide-slate-100 overflow-y-auto">
            <AnimatePresence initial={false}>
              {expenses.map((expense) => (
                <motion.li
                  key={expense.id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50 sm:px-6"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-sm font-semibold text-primary-700">
                      {expense.category.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{expense.description}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                        <span className="truncate">{expense.category}</span>
                        <span className="flex items-center gap-1 md:hidden">
                          <Calendar className="h-3 w-3" />
                          {new Date(expense.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden w-32 items-center gap-1.5 text-sm text-slate-500 md:flex">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(expense.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>

                  <div className="w-auto text-right md:w-36">
                    <p className="text-sm font-semibold text-slate-900">{expense.amount.toLocaleString()}</p>
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
              ))}
            </AnimatePresence>
          </ul>
        </>
      )}
    </div>
  );
};

export default ExpenseList;
