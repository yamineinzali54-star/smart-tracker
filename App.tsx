import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Expense } from './types'
import { getAgentAction } from './geminiService'
import { useAuth, supabase } from './auth-context'
import ExpenseList from './components/ExpenseList'
import Summary from './components/Summary'
import InputArea from './components/InputArea'
import AgentActivity from './components/AgentActivity'
import AuthPage from './components/AuthPage'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'

const App: React.FC = () => {
  const { user, loading, signOut } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [memory, setMemory] = useState<Array<{ role: 'user' | 'agent'; content: string; timestamp: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchSupData()
    } else {
      setExpenses([])
      setMemory([])
    }
  }, [user])

  const fetchSupData = async () => {
    if (!supabase) return
    const { data: supExpenses, error: supExpError } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })

    if (supExpError) console.error('Error fetching expenses:', supExpError)
    else setExpenses(supExpenses || [])

    const { data: supMemory, error: supMemError } = await supabase
      .from('agent_memory')
      .select('*')
      .order('created_at', { ascending: false })

    if (supMemError) console.error('Error fetching memory:', supMemError)
    else setMemory(supMemory || [])
  }

  const handleAgentTask = async (inputText: string) => {
    if (!inputText.trim()) return
    setIsLoading(true)
    setError(null)

    try {
      const action = await getAgentAction(inputText, expenses, memory.map(m => ({ role: m.role, content: m.content, timestamp: m.timestamp })))

      if (action.action === 'add_expense') {
        const expensesToAdd = Array.isArray(action.expenses) && action.expenses.length > 0
          ? action.expenses
          : (action.expense ? [action.expense] : [])

        expensesToAdd.forEach((exp) => {
          const newExpense: Expense = {
            id: Date.now().toString() + Math.random().toString(36).substr(2),
            user_id: user?.id || '',
            amount: exp.amount,
            currency: exp.currency,
            category: exp.category,
            description: exp.description,
            date: resolveExpenseDate(exp.date) || getLocalDateString(),
          }
          setExpenses((prev) => [newExpense, ...prev])
          saveExpToSupabase(newExpense)
        })
      }

      if (action.action === 'delete_last_expense') {
        const lastExpense = expenses[0]
        if (lastExpense) await handleDeleteExpense(lastExpense.id)
      }

      if (action.action === 'clear_all_expenses') {
        if (supabase) await supabase.from('expenses').delete().gt('id', 0)
        setExpenses([])
      }

      if (action.action === 'summarize') {
        const total = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
        const summary = `${action.response} Current total: ${total.toLocaleString()} across ${expenses.length} items.`
        appendToMemory('agent', summary)
        return
      }

      appendToMemory('agent', action.response)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while running the task.')
      appendToMemory('agent', 'I hit an error while processing your request.')
    } finally {
      setIsLoading(false)
    }
  }

  const saveExpToSupabase = async (expense: Expense) => {
    if (!supabase) return
    const { error: saveError } = await supabase.from('expenses').insert({
      id: expense.id,
      user_id: user?.id || '',
      amount: expense.amount,
      currency: expense.currency,
      category: expense.category,
      description: expense.description,
      date: expense.date,
    })
    if (saveError) {
      console.error('Error saving expense:', saveError)
      setExpenses((prev) => prev.filter((e) => e.id !== expense.id))
      setError('Could not save that expense. Please try again.')
    }
  }

  const handleDeleteExpense = useCallback(async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    if (!supabase) return
    const { error: deleteError } = await supabase.from('expenses').delete().eq('id', id)
    if (deleteError) {
      console.error('Error deleting expense:', deleteError)
      setError('Could not delete that expense. Please try again.')
      fetchSupData()
    }
  }, [user?.id])

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all expenses?')) {
      if (supabase) {
        supabase.from('expenses').delete().gt('id', 0)
      }
      setExpenses([])
      appendToMemory('agent', 'All expenses were cleared by user confirmation.')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm font-medium text-slate-500">
        Loading...
      </div>
    )
  }

  if (!user) return <AuthPage />

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          userName={user.user_metadata?.name || 'User'}
          userEmail={user.email ?? ''}
          onSignOut={signOut}
        />

        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          <section id="overview" className="scroll-mt-24">
            <Summary expenses={expenses} onClear={handleClearAll} />
          </section>

          <div className="grid gap-6 xl:grid-cols-3">
            <section id="agent" className="card scroll-mt-24 p-5 sm:p-6 xl:col-span-2">
              <InputArea onAdd={handleAgentTask} isLoading={isLoading} />
              {error && (
                <div role="alert" className="mt-4 rounded-xl border border-error-100 bg-error-50 px-4 py-3 text-sm text-error-700">
                  {error}
                </div>
              )}
            </section>
            <AgentActivity memory={memory} />
          </div>

          <section id="transactions" className="scroll-mt-24">
            <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
          </section>

          <footer className="pb-4 pt-2 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
            &copy; {new Date().getFullYear()} SmartTrack AI
          </footer>
        </motion.main>
      </div>
    </div>
  )
}

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getLocalDateString(): string {
  return toLocalDateString(new Date());
}

function resolveExpenseDate(dateParam: string | undefined): string {
  // If already an ISO date string (YYYY-MM-DD), use as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return dateParam;
  }
  
  // Relative dates in English
  const lower = (dateParam || '').toLowerCase();
  if (lower === "yesterday" || lower === "last day") {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return toLocalDateString(d);
  }
  if (lower === "today" || lower === "this day") {
    return getLocalDateString();
  }
  if (lower === "tomorrow" || lower === "next day") {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return toLocalDateString(tomorrow);
  }
  
  // Burmese relative dates (literal phrases)
  if (dateParam === "မန doorway" || dateParam === "မနက်ဖည်") {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return toLocalDateString(d);
  }
  if (dateParam === "ဒီနေ့" || dateParam === "today") {
    return getLocalDateString();
  }
  if (dateParam === "မနက်ဖြန်" || dateParam === "လက်နေ့") {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return toLocalDateString(tomorrow);
  }
  
  // Myanmar relative date tokens (as allowed by the AI prompt)
  if (dateParam === "myanmar_yesterday") {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return toLocalDateString(d);
  }
  if (dateParam === "myanmar_today") {
    return getLocalDateString();
  }
  if (dateParam === "myanmar_tomorrow") {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return toLocalDateString(tomorrow);
  }
  
  // Default to today if no recognized date
  return getLocalDateString();
}

export default App

function appendToMemory(role: 'user' | 'agent', content: string) {
  console.log(`[Memory] ${role}: ${content}`)
}
