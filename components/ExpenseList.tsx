
import React from 'react';
import { motion, AnimatePresence } from 'framer/react';
import { Trash2, Receipt, Calendar } from 'lucide-react';
import { Expense } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete }) => {
  if (expenses.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-gray-300">
        <Receipt className="w-12 h-12 mb-4 opacity-10" />
        <p className="text-xs font-bold uppercase tracking-widest">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto custom-scrollbar">
      <AnimatePresence initial={false}>
        {expenses.map((expense) => (
          <motion.div 
            key={expense.id} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="px-6 py-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold text-xs shrink-0">
                {expense.category.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  {expense.description}
                </p>
                <div className="mt-1.5 flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-gray-100 text-[9px] text-gray-500 rounded-lg uppercase font-bold tracking-wider">
                    {expense.category}
                  </span>
                  <div className="flex items-center gap-1 text-[9px] text-gray-400 font-medium">
                    <Calendar className="w-3 h-3" />
                    {new Date(expense.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-base font-bold text-gray-900 tracking-tight">
                  {expense.amount.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  {expense.currency}
                </p>
              </div>
              <button
                onClick={() => onDelete(expense.id)}
                className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ExpenseList;
