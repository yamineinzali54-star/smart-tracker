import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Expense } from './types'
import { getAgentAction } from './geminiService'
import { useAuth, supabase } from './auth-context' // AuthProvider ကို ဒီကနေ ဖြုတ်ထားပါတယ်
import ExpenseList from './components/ExpenseList'
import Summary from './components/Summary'
import InputArea from './components/InputArea'
import AgentActivity from './components/AgentActivity'

const App: React.FC = () => {
  const { user, loading, signIn, signUp, signOut } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [memory, setMemory] = useState<Array<{ role: 'user' | 'agent'; content: string; timestamp: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Login Form အတွက် အသစ်ထည့်ထားတဲ့ State များ
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchSupData()
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
            date: new Date().toISOString(),
          }
          setExpenses((prev) => [newExpense, ...prev])
          saveExpToSupabase(newExpense)
        })
      }

      if (action.action === 'delete_last_expense') {
        const lastExpense = expenses[expenses.length - 1]
        if (lastExpense && supabase) {
          await supabase.from('expenses').delete().eq('id', lastExpense.id)
        }
        setExpenses((prev) => prev.slice(0, -1))
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
    await supabase.from('expenses').insert({
      id: expense.id,
      user_id: user?.id || '',
      amount: expense.amount,
      currency: expense.currency,
      category: expense.category,
      description: expense.description,
      date: expense.date,
    })
  }

  const handleDeleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    if (supabase) {
      supabase.from('expenses').delete().eq('id', id)
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

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    try {
      if (isSignUp) {
        await signUp(email, password, 'User')
      } else {
        await signIn(email, password)
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please check your credentials.')
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

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

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          {/* ဒီနေရာမှာ AuthProvider ကို ဖြုတ်လိုက်ပါပြီ */}
          {user ? (
            <div>
              <div className="flex justify-end mb-4">
                 <button onClick={signOut} className="text-sm font-medium text-red-500 hover:text-red-700">Sign Out</button>
              </div>
              <Summary expenses={expenses} onClear={handleClearAll} />
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <InputArea onAdd={handleAgentTask} isLoading={isLoading} />
                <AgentActivity memory={memory} />
                <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="text-center space-y-4">
                <h2 className="text-xl font-bold text-gray-900">{isSignUp ? 'Create an Account' : 'Welcome Back'}</h2>
                <p className="text-gray-500">Sign in to track your expenses.</p>

                {authError && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{authError}</div>}

                {/* တကယ့် Login Form လေး ဖြစ်သွားပါပြီ */}
                <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3 max-w-sm mx-auto mt-4">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                    {isSignUp ? 'Sign Up' : 'Sign In'}
                  </button>
                </form>

                <div className="text-sm text-gray-500 mt-4">
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-indigo-600 font-medium hover:underline">
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="mt-16 text-center text-gray-400 text-[10px] uppercase tracking-[0.2em] font-medium">
          &copy; {new Date().getFullYear()} SmartTrack AI • Agent Mode Enabled
        </footer>
      </motion.div>
    </div>
  )
}

export default App

function appendToMemory(role: 'user' | 'agent', content: string) {
  console.log(`[Memory] ${role}: ${content}`)
}