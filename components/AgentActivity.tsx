import React from 'react';
import { Bot, User } from 'lucide-react';
import { AgentMemoryItem } from '../types';

interface AgentActivityProps {
  memory: AgentMemoryItem[];
}

const AgentActivity: React.FC<AgentActivityProps> = ({ memory }) => {
  const recent = memory.slice(-6).reverse();

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Agent Memory</h3>
      </div>
      <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
        {recent.length === 0 && (
          <p className="text-xs text-gray-400">No memory yet. Start by asking the agent to add or summarize expenses.</p>
        )}
        {recent.map((item, index) => {
          const isAgent = item.role === 'agent';
          return (
            <div
              key={`${item.timestamp}-${index}`}
              className={`rounded-xl p-3 text-xs border ${
                isAgent ? 'bg-indigo-50 border-indigo-100 text-indigo-900' : 'bg-gray-50 border-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1 font-semibold uppercase tracking-wider text-[10px]">
                {isAgent ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                {item.role}
              </div>
              <p>{item.content}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentActivity;
