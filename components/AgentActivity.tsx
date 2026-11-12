import React from 'react';
import { Bot, User } from 'lucide-react';
import { AgentMemoryItem } from '../types';

interface AgentActivityProps {
  memory: AgentMemoryItem[];
}

const AgentActivity: React.FC<AgentActivityProps> = ({ memory }) => {
  const recent = memory.slice(-6).reverse();

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-slate-900">Agent activity</h2>
        <p className="text-xs text-slate-500">Latest messages from your agent</p>
      </div>
      <div className="max-h-80 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
        {recent.length === 0 && (
          <p className="text-sm text-slate-500">No activity yet. Ask the agent to add or summarize expenses.</p>
        )}
        {recent.map((item, index) => {
          const isAgent = item.role === 'agent';
          return (
            <div
              key={`${item.timestamp}-${index}`}
              className={`rounded-xl border p-3 text-sm ${
                isAgent ? 'border-primary-100 bg-primary-50 text-primary-900' : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
                {isAgent ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                {isAgent ? 'Agent' : 'You'}
              </div>
              <p className="leading-relaxed">{item.content}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentActivity;
