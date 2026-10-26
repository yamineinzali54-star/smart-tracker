
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, RefreshCcw } from 'lucide-react';
import { Expense } from '../types';

interface SummaryProps {
  expenses: Expense[];
  onClear: () => void;
}

const Summary: React.FC<SummaryProps> = ({ expenses, onClear }) => {
  const totals = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach(e => {
      const current = map.get(e.currency) || 0;
      map.set(e.currency, current + e.amount);
    });
    return Array.from(map.entries());
  }, [expenses]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <motion.div 
        whileHover={{ y: -2 }}
        className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-2xl shadow-indigo-200 flex flex-col justify-between relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Wallet className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Total Spending</p>
          <div className="space-y-3">
            {totals.length > 0 ? (
              totals.map(([currency, amount]) => (
                <div key={currency} className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight">{amount.toLocaleString()}</span>
                  <span className="text-indigo-200 text-sm font-bold uppercase">{currency}</span>
                </div>
              ))
            ) : (
              <span className="text-4xl font-bold tracking-tight">0.00</span>
            )}
          </div>
        </div>
        {expenses.length > 0 && (
          <button 
            onClick={onClear}
            className="mt-8 self-start flex items-center gap-2 text-[10px] bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all font-bold uppercase tracking-widest backdrop-blur-sm border border-white/10 group"
          >
            <RefreshCcw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
            Reset
          </button>
        )}
      </motion.div>

      <motion.div 
        whileHover={{ y: -2 }}
        className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <TrendingUp className="w-24 h-24 text-indigo-600" />
        </div>
        <div className="relative z-10">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Quick Insights</p>
          <p className="text-gray-600 text-sm leading-relaxed font-medium">
            {expenses.length === 0 
              ? "Your wallet is silent. Start by typing an expense like 'Lunch for $15'." 
              : `You've tracked ${expenses.length} items. Your spending is distributed across ${totals.length} ${totals.length === 1 ? 'currency' : 'currencies'}.`}
          </p>
        </div>
        <div className="mt-8 flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1,2,3].map(i => (
              <div key={i} className="inline-block h-8 w-8 rounded-xl ring-4 ring-white bg-indigo-50 flex items-center justify-center text-[10px] text-indigo-500 font-bold border border-indigo-100">
                AI
              </div>
            ))}
          </div>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Smart Analysis</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Summary;
