import React, { useState } from 'react';
import { Send, Loader as Loader2 } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="expense-input" className="block text-base font-semibold text-slate-900">
          Agent command
        </label>
        <p className="mt-1 text-sm text-slate-500">
          Describe what you spent, or ask for a summary, an undo, or a reset.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="expense-input"
          type="text"
          className="input-field flex-1"
          placeholder="e.g., Add 5000 MMK for lunch, show summary, or delete last expense"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {isLoading ? 'Working...' : 'Run'}
        </button>
      </div>
    </form>
  );
};

export default InputArea;
