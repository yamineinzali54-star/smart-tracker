import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Bot, Clock, Eye, EyeOff, Loader as Loader2, Lock, Mail, Shield, Sparkles, UserRound } from 'lucide-react'
import { useAuth } from '../auth-context'

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

  const switchMode = (signUpMode: boolean) => {
    setIsSignUp(signUpMode)
    setAuthError(null)
    setSuccessMessage(null)
  }

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
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/5" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-base font-semibold tracking-tight">SmartTrack AI</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-4xl font-semibold leading-[1.15] tracking-tight">
            Track every expense by simply telling your agent.
          </h2>
          <ul className="mt-10 space-y-5">
            <li className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                <Bot className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">Log in plain language</p>
                <p className="mt-0.5 text-sm text-primary-100">Type what you spent and the agent records it.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">Understands English and Burmese dates</p>
                <p className="mt-0.5 text-sm text-primary-100">Relative days are parsed in both languages.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                <Shield className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">Private to your account</p>
                <p className="mt-0.5 text-sm text-primary-100">Your expenses and agent history stay yours.</p>
              </div>
            </li>
          </ul>
        </div>

        <p className="relative text-xs text-primary-200">Autonomous expense tracking</p>
      </aside>

      <div className="flex items-center justify-center px-4 py-12 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center text-center lg:hidden">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-600/25">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">SmartTrack AI</h1>
          <p className="mt-1 text-sm text-slate-500">Your autonomous expense tracking agent</p>
        </div>

        <div className="card p-6 shadow-[0_12px_40px_-12px_rgb(15_23_42/0.12)] sm:p-8">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => switchMode(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                !isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => switchMode(true)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign up
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isSignUp
                ? 'Start letting the agent capture your spending.'
                : 'Sign in to continue tracking your expenses.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <FormField id="name" label="Full name" icon={<UserRound className="h-4 w-4" />}>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="input-field pl-11"
                />
              </FormField>
            )}

            <FormField id="email" label="Email" icon={<Mail className="h-4 w-4" />}>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field pl-11"
              />
            </FormField>

            <FormField id="password" label="Password" icon={<Lock className="h-4 w-4" />}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pl-11 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </FormField>

            {isSignUp && password.length > 0 && password.length < 8 && (
              <p className="text-xs text-slate-500">Use at least 8 characters for a stronger password.</p>
            )}

            {authError && (
              <div role="alert" className="rounded-xl border border-error-100 bg-error-50 px-4 py-3 text-sm text-error-700">
                {authError}
              </div>
            )}
            {successMessage && (
              <div role="status" className="rounded-xl border border-success-500/20 bg-success-50 px-4 py-3 text-sm text-success-700">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create account' : 'Sign in'}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Your expenses and agent history stay private to your account.
        </p>
      </motion.div>
      </div>
    </div>
  )
}

const FormField: React.FC<{
  id: string
  label: string
  icon: React.ReactNode
  children: React.ReactNode
}> = ({ id, label, icon, children }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-medium text-slate-700">
      {label}
    </label>
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
      {children}
    </div>
  </div>
)

export default AuthPage
