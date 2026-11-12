import React, { useMemo } from 'react';
import { Wallet, Receipt, Tag, Clock, RefreshCcw, Video as LucideIcon } from 'lucide-react';
import { Expense } from '../types';

interface SummaryProps {
  expenses: Expense[];
  onClear: () => void;
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, action, children }) => (
  <div className="card flex flex-col justify-between gap-5 p-5 transition-shadow hover:shadow-md">
    <div className="flex items-center justify-between">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
        <Icon className="h-5 w-5" />
      </div>
      {action}
    </div>
    <div className="min-w-0">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-1 min-w-0">{children}</div>
    </div>
  </div>
);

const Summary: React.FC<SummaryProps> = ({ expenses, onClear }) => {
  const totals = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach(e => {
      const current = map.get(e.currency) || 0;
      map.set(e.currency, current + e.amount);
    });
    return Array.from(map.entries());
  }, [expenses]);

  const topCategory = useMemo(() => {
    const counts = new Map<string, number>();
    expenses.forEach(e => counts.set(e.category, (counts.get(e.category) || 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0] ?? null;
  }, [expenses]);

  const latest = expenses[0];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={Wallet}
        label="Total spending"
        action={
          expenses.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="group inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <RefreshCcw className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-180" />
              Reset
            </button>
          )
        }
      >
        {totals.length > 0 ? (
          <div className="space-y-1">
            {totals.map(([currency, amount]) => (
              <p key={currency} className="text-2xl font-semibold tracking-tight text-slate-900">
                {amount.toLocaleString()}{' '}
                <span className="text-sm font-medium text-slate-500">{currency}</span>
              </p>
            ))}
          </div>
        ) : (
          <p className="text-2xl font-semibold tracking-tight text-slate-900">0</p>
        )}
      </StatCard>

      <StatCard icon={Receipt} label="Transactions">
        <p className="text-2xl font-semibold tracking-tight text-slate-900">{expenses.length}</p>
      </StatCard>

      <StatCard icon={Tag} label="Top category">
        {topCategory ? (
          <>
            <p className="truncate text-2xl font-semibold tracking-tight text-slate-900">{topCategory[0]}</p>
            <p className="text-xs text-slate-500">
              {topCategory[1]} {topCategory[1] === 1 ? 'entry' : 'entries'}
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-500">No entries yet</p>
        )}
      </StatCard>

      <StatCard icon={Clock} label="Latest entry">
        {latest ? (
          <>
            <p className="truncate text-sm font-semibold text-slate-900">{latest.description}</p>
            <p className="text-xs text-slate-500">
              {latest.amount.toLocaleString()} {latest.currency}
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-500">Nothing logged yet</p>
        )}
      </StatCard>
    </div>
  );
};

export default Summary;
