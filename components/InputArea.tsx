
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';

interface InputAreaProps {
  onAdd: (text: string) => Promise<void>;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onAdd, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    
    await onAdd(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex flex-col gap-3">
        <label htmlFor="expense-input" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
          Quick Entry
        </label>
        <div className="relative group">
          <input
            id="expense-input"
            type="text"
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-5 pr-16 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-300 text-sm font-medium"
            placeholder="e.g., I spent 5000 kyats on lunch today..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className={`absolute right-2 top-2 bottom-2 px-4 rounded-xl font-bold transition-all flex items-center justify-center ${
              isLoading || !text.trim()
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-200'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <div className="h-[1px] flex-1 bg-gray-50"></div>
        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
          AI Powered Extraction
        </p>
        <div className="h-[1px] flex-1 bg-gray-50"></div>
      </div>
    </form>
  );
};

export default InputArea;
