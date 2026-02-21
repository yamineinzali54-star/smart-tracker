import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, List } from 'lucide-react';
import { AgentMemoryItem, Expense } from './types';
import { getAgentAction } from './geminiService';
import ExpenseList from './components/ExpenseList';
import Summary from './components/Summary';
import InputArea from './components/InputArea';
import AgentActivity from './components/AgentActivity';

const MEMORY_KEY = 'smarttrack_agent_memory';
const EXPENSES_KEY = 'smarttrack_expenses';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [memory, setMemory] = useState<AgentMemoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedExpenses = localStorage.getItem(EXPENSES_KEY);
    const savedMemory = localStorage.getItem(MEMORY_KEY);

    if (savedExpenses) {
      try {
        setExpenses(JSON.parse(savedExpenses));
      } catch (e) {
        console.error('Failed to load expenses', e);
      }
    }

    if (savedMemory) {
      try {
        setMemory(JSON.parse(savedMemory));
      } catch (e) {
        console.error('Failed to load memory', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  }, [memory]);

  const appendMemory = useCallback((role: AgentMemoryItem['role'], content: string) => {
    setMemory((prev) => [
      ...prev,
      {
        role,
        content,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const handleAgentTask = async (inputText: string) => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    appendMemory('user', inputText);

    try {
      const action = await getAgentAction(inputText, expenses, memory);

      if (action.action === 'add_expense' && action.expense) {
        const newExpense: Expense = {
          ...action.expense,
          id: Date.now().toString(),
          date: new Date().toISOString(),
        };
        setExpenses((prev) => [newExpense, ...prev]);
      }

      if (action.action === 'delete_last_expense') {
        setExpenses((prev) => prev.slice(1));
      }

      if (action.action === 'clear_all_expenses') {
        setExpenses([]);
      }

      if (action.action === 'summarize') {
        const total = expenses.reduce((sum, item) => sum + item.amount, 0);
        const summary = `${action.response} Current total: ${total.toLocaleString()} across ${expenses.length} items.`;
        appendMemory('agent', summary);
        return;
      }

      appendMemory('agent', action.response);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while running the task.');
      appendMemory('agent', 'I hit an error while processing your request. Please retry with a simpler instruction.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all expenses?')) {
      setExpenses([]);
      appendMemory('agent', 'All expenses were cleared by user confirmation.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-2 bg-indigo-50 rounded-2xl mb-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl">
            SmartTrack <span className="text-indigo-600">AI Agent</span>
          </h1>
          <p className="text-gray-500 font-medium">Autonomous task execution for expense tracking.</p>
        </div>

        <Summary expenses={expenses} onClear={handleClearAll} />

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <InputArea onAdd={handleAgentTask} isLoading={isLoading} />
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

        <AgentActivity memory={memory} />

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
        &copy; {new Date().getFullYear()} SmartTrack AI • Agent Mode Enabled
      </footer>
    </div>
  );
};

export default App;
