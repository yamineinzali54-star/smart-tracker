import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserRound,
  Wallet,
} from 'lucide-react'
import { useAuth } from '../auth-context'

const weekBars = [
  { label: 'Mon', height: 38 },
  { label: 'Tue', height: 62 },
  { label: 'Wed', height: 44 },
  { label: 'Thu', height: 78 },
  { label: 'Fri', height: 56 },
  { label: 'Sat', height: 92 },
  { label: 'Sun', height: 68 },
]

const recentActivity = [
  { name: 'Blue Bottle Coffee', category: 'Dining', amount: '-$4.80', tone: 'down' as const },
  { name: 'Payroll deposit', category: 'Income', amount: '+$2,400', tone: 'up' as const },
  { name: 'Whole Foods', category: 'Groceries', amount: '-$86.12', tone: 'down' as const },
]

const AuthPage: React.FC = () => {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const headline = isSignUp ? 'Create your workspace' : 'Welcome back'
  const subhead = isSignUp
    ? 'Set up SmartTrack in a minute and start letting the agent capture spending for you.'
    : 'Sign in to continue tracking expenses with your private AI agent.'
  const cta = isSignUp ? 'Create account' : 'Sign in'

  const passwordHint = useMemo(() => {
    if (!isSignUp || password.length === 0) return null
    if (password.length < 8) return 'Use at least 8 characters for a stronger password.'
    return 'Looks good.'
  }, [isSignUp, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setSuccessMessage(null)
    setSubmitting(true)
    try {
      if (isSignUp) {
        await signUp(email, password, name.trim() || 'User')
        setSuccessMessage('Account created. Check your email if confirmation is required, then sign in.')
        setIsSignUp(false)
        setPassword('')
      } else {
        await signIn(email, password)
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB] text-slate-900 lg:grid lg:h-screen lg:grid-cols-2 lg:overflow-hidden">
      <aside className="relative hidden overflow-hidden bg-[#07111F] px-8 py-8 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-[-80px] h-80 w-80 rounded-full bg-indigo-600/30 blur-3xl" />
          <div className="absolute bottom-[-40px] right-[-60px] h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-px w-[140%] -translate-x-1/2 rotate-12 bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent" />
          <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px]" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">SmartTrack</p>
            <p className="text-[11px] uppercase tracking-[0.22em] text-indigo-200/80">Private finance agent</p>
          </div>
        </div>

        <div className="relative z-10 mt-8 max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-300">Clarity over chaos</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
            Your spending, summarized like a portfolio.
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
            The agent reads natural language, books transactions, and keeps a live picture of cash flow without a spreadsheet.
          </p>
        </div>

        <div className="relative z-10 mt-6 min-h-0 flex-1">
          <div className="relative mx-auto h-full max-w-[520px]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="rounded-[28px] border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-indigo-200/70">Workspace</p>
                  <p className="mt-1 text-lg font-semibold">November cashflow</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Live
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <MetricCard label="Available" value="$12,480" icon={<Wallet className="h-3.5 w-3.5" />} />
                <MetricCard label="This month" value="-$1,246" icon={<TrendingDown className="h-3.5 w-3.5" />} muted />
                <MetricCard label="Recovered" value="+$320" icon={<TrendingUp className="h-3.5 w-3.5" />} accent />
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-[#0B1728]/80 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <BarChart3 className="h-3.5 w-3.5 text-indigo-300" />
                    Weekly outflow
                  </div>
                  <p className="text-[11px] text-indigo-200">-8.4% vs last week</p>
                </div>
                <div className="flex h-20 items-end gap-2">
                  {weekBars.map((bar, index) => (
                    <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
                      <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.15 + index * 0.06, duration: 0.45, ease: 'easeOut' }}
                        style={{ height: `${bar.height}%`, transformOrigin: 'bottom' }}
                        className={`w-full rounded-t-md ${
                          index === 5
                            ? 'bg-gradient-to-t from-indigo-600 to-violet-400'
                            : 'bg-indigo-400/40 hover:bg-indigo-300/70'
                        }`}
                      />
                      <span className="text-[10px] text-slate-400">{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {recentActivity.slice(0, 2).map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-200">
                        <CreditCard className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-[11px] text-slate-400">{item.category}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-semibold ${item.tone === 'up' ? 'text-emerald-300' : 'text-slate-200'}`}>
                      {item.amount}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24, y: 12 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="absolute -right-4 top-12 hidden w-48 rounded-2xl border border-white/10 bg-[#101B2E]/95 p-3 shadow-xl shadow-black/40 xl:block"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-300">AI insight</p>
              <p className="mt-2 text-sm font-medium leading-5">Dining is 14% above your usual Friday pattern.</p>
              <p className="mt-3 text-[11px] text-slate-400">Suggested cap: $60 this weekend.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -18, y: 18 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="absolute -left-3 bottom-8 hidden w-44 rounded-2xl border border-white/10 bg-indigo-500 p-3 shadow-xl shadow-indigo-900/40 xl:block"
            >
              <p className="text-[10px] uppercase tracking-[0.18em] text-indigo-100">Saved this month</p>
              <p className="mt-2 text-2xl font-semibold">$320.00</p>
              <p className="mt-1 text-[11px] text-indigo-100/80">From duplicate-charge alerts</p>
            </motion.div>
          </div>
        </div>

        <div className="relative z-10 mt-auto flex items-center gap-6 pt-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-300" /> Encrypted session
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-300" /> Agent memory stays private
          </span>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col justify-center px-5 py-10 sm:px-10 lg:h-screen lg:overflow-y-auto">
        <div className="mb-10 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#07111F] text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">SmartTrack</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">AI expense tracker</p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[420px]">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500">
              {isSignUp ? 'New account' : 'Secure access'}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{headline}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{subhead}</p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false)
                setAuthError(null)
                setSuccessMessage(null)
              }}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                !isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true)
                setAuthError(null)
                setSuccessMessage(null)
              }}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <Field
                id="name"
                label="Full name"
                icon={<UserRound className="h-4 w-4" />}
              >
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-300 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
                />
              </Field>
            )}

            <Field id="email" label="Email" icon={<Mail className="h-4 w-4" />}>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-300 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
              />
            </Field>

            <Field id="password" label="Password" icon={<Lock className="h-4 w-4" />}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-300 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </Field>

            {passwordHint && (
              <p className={`text-xs ${password.length < 8 ? 'text-slate-400' : 'text-emerald-600'}`}>{passwordHint}</p>
            )}

            {authError && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                {authError}
              </div>
            )}
            {successMessage && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1D4ED8] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : cta}
              {!submitting && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />}
            </button>
          </form>

          <p className="mt-8 text-center text-xs leading-5 text-slate-400">
            By continuing you access your own SmartTrack workspace. Sessions are handled by Supabase Auth.
          </p>
        </div>
      </main>
    </div>
  )
}

const Field: React.FC<{
  id: string
  label: string
  icon: React.ReactNode
  children: React.ReactNode
}> = ({ id, label, icon, children }) => (
  <label htmlFor={id} className="block">
    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
      {children}
    </div>
  </label>
)

const MetricCard: React.FC<{
  label: string
  value: string
  icon: React.ReactNode
  muted?: boolean
  accent?: boolean
}> = ({ label, value, icon, muted, accent }) => (
  <div
    className={`rounded-2xl border p-3 ${
      accent
        ? 'border-violet-400/20 bg-violet-500/15'
        : muted
          ? 'border-white/8 bg-white/[0.04]'
          : 'border-white/10 bg-white/[0.07]'
    }`}
  >
    <div className="mb-3 flex items-center justify-between text-indigo-200">{icon}</div>
    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-semibold">{value}</p>
  </div>
)

export default AuthPage
