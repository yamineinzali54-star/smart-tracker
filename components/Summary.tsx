import React, { useMemo } from 'react';
import { Wallet, Receipt, Tag, Clock, RefreshCcw } from 'lucide-react';
import { Expense } from '../types';

interface SummaryProps {
  expenses: Expense[];
  onClear: () => void;
}

type Tone = 'primary' | 'accent' | 'success' | 'warning';

const toneClasses: Record<Tone, { card: string; icon: string }> = {
  primary: {
    card: 'bg-gradient-to-br from-primary-50/90 via-white to-white',
    icon: 'bg-primary-600 text-white shadow-primary-600/25',
  },
  accent: {
    card: 'bg-gradient-to-br from-accent-50/90 via-white to-white',
    icon: 'bg-accent-500 text-white shadow-accent-500/25',
  },
  success: {
    card: 'bg-gradient-to-br from-success-50/90 via-white to-white',
    icon: 'bg-success-500 text-white shadow-success-500/25',
  },
  warning: {
    card: 'bg-gradient-to-br from-warning-50/90 via-white to-white',
    icon: 'bg-warning-500 text-white shadow-warning-500/25',
  },
};

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone: Tone;
  action?: React.ReactNode;
  children: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, tone, action, children }) => (
  <div
    className={`card card-interactive flex flex-col justify-between gap-5 p-5 ${toneClasses[tone].card}`}
  >
    <div className="flex items-center justify-between">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-md ${toneClasses[tone].icon}`}>
        <Icon className="h-5 w-5" />
      </div>
      {action}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <div className="mt-1.5 min-w-0">{children}</div>
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
        tone="primary"
        action={
          expenses.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="group inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-white/80 hover:text-slate-900"
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
              <p key={currency} className="text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
                {amount.toLocaleString()}{' '}
                <span className="text-sm font-medium text-slate-500">{currency}</span>
              </p>
            ))}
          </div>
        ) : (
          <p className="text-2xl font-semibold tracking-tight text-slate-900">0</p>
        )}
      </StatCard>

      <StatCard icon={Receipt} label="Transactions" tone="accent">
        <p className="text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{expenses.length}</p>
      </StatCard>

      <StatCard icon={Tag} label="Top category" tone="success">
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

      <StatCard icon={Clock} label="Latest entry" tone="warning">
        {latest ? (
          <>
            <p className="truncate text-sm font-semibold text-slate-900">{latest.description}</p>
            <p className="text-xs tabular-nums text-slate-500">
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
