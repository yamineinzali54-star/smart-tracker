import React, { useState, useEffect, useCallback } from 'react';
// ဒီလိုင်းလေးကို framer-motion လို့ ပြောင်းထားပါတယ်
import { motion, AnimatePresence } from 'framer-motion'; 
import { Sparkles, Trash2, List } from 'lucide-react';
import { Expense } from './types';
import { extractExpenseData } from './geminiService';
import ExpenseList from './components/ExpenseList';
import Summary from './components/Summary';
import InputArea from './components/InputArea';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('smarttrack_expenses');
    if (saved) {
      try {
        setExpenses(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load local storage", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('smarttrack_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleAddExpense = async (inputText: string) => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const extracted = await extractExpenseData(inputText);
      
      const newExpense: Expense = {
        ...extracted,
        id: Date.now().toString(),
        date: new Date().toISOString(),
      };

      setExpenses(prev => [newExpense, ...prev]);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all expenses?")) {
      setExpenses([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-2 bg-indigo-50 rounded-2xl mb-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl">
            SmartTrack <span className="text-indigo-600">AI</span>
          </h1>
          <p className="text-gray-500 font-medium">
            Natural language expense tracking.
          </p>
        </div>

        <Summary expenses={expenses} onClear={handleClearAll} />

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <InputArea onAdd={handleAddExpense} isLoading={isLoading} />
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100 overflow-hidden"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <List className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Transactions</h2>
            </div>
            <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-full text-gray-500 font-bold uppercase tracking-widest">
              {expenses.length} Total
            </span>
          </div>
          <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
        </div>
      </motion.div>

      <footer className="mt-16 text-center text-gray-400 text-[10px] uppercase tracking-[0.2em] font-medium">
        &copy; {new Date().getFullYear()} SmartTrack AI • Crafted for Clarity
      </footer>
    </div>
  );
};

export default App;
