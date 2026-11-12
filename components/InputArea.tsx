import React, { useState } from 'react';
import { Send, Loader as Loader2, Sparkles } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <label htmlFor="expense-input" className="block text-sm font-semibold text-slate-900">
            Agent command
          </label>
          <p className="text-xs text-slate-500">Describe what you spent, or ask for a summary, an undo, or a reset.</p>
        </div>
      </div>
      <div className="flex flex-col gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/60 p-2 transition focus-within:border-primary-300 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgb(37_99_235/0.10)] sm:flex-row sm:items-center">
        <input
          id="expense-input"
          type="text"
          className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:text-slate-400"
          placeholder="e.g., Add 5000 MMK for lunch, show summary, or delete last expense"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {isLoading ? 'Working...' : 'Run'}
        </button>
      </div>
    </form>
  );
};

export default InputArea;
