import React from 'react';
import { Bot, User, Sparkles } from 'lucide-react';
import { AgentMemoryItem } from '../types';

interface AgentActivityProps {
  memory: AgentMemoryItem[];
}

const AgentActivity: React.FC<AgentActivityProps> = ({ memory }) => {
  const recent = memory.slice(-6).reverse();

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md shadow-primary-600/25">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-slate-900">Agent activity</h2>
          <p className="text-xs text-slate-500">Latest messages from your assistant</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-1 text-[11px] font-medium text-success-700">
          <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
          Ready
        </span>
      </div>

      <div className="max-h-96 flex-1 space-y-4 overflow-y-auto bg-slate-50/60 p-4 sm:p-5">
        {recent.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Bot className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-slate-700">No activity yet</p>
            <p className="text-xs text-slate-500">Ask the agent to add or summarize expenses.</p>
          </div>
        )}
        {recent.map((item, index) => {
          const isAgent = item.role === 'agent';
          return (
            <div
              key={`${item.timestamp}-${index}`}
              className={`flex gap-3 animate-fade-in-up ${isAgent ? '' : 'flex-row-reverse'}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  isAgent ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {isAgent ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div className={`flex max-w-[85%] flex-col ${isAgent ? 'items-start' : 'items-end'}`}>
                <span className="mb-1 text-[11px] font-medium text-slate-500">{isAgent ? 'Agent' : 'You'}</span>
                <p
                  className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                    isAgent
                      ? 'rounded-tl-md border border-slate-200/80 bg-white text-slate-800'
                      : 'rounded-tr-md bg-primary-600 text-white'
                  }`}
                >
                  {item.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentActivity;
