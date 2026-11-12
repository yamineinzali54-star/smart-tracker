import React from 'react'
import { LogOut, Menu } from 'lucide-react'

interface TopBarProps {
  onMenuClick: () => void
  userName: string
  userEmail: string
  onSignOut: () => Promise<void>
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, userName, userEmail, onSignOut }) => {
  const today = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
  const initial = (userName || userEmail || 'U').charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-slate-900">Dashboard</h1>
            <p className="truncate text-xs text-slate-500">{today}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden min-w-0 text-right sm:block">
            <p className="max-w-[180px] truncate text-sm font-medium text-slate-900">{userName}</p>
            <p className="max-w-[180px] truncate text-xs text-slate-500">{userEmail}</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
            {initial}
          </div>
          <button
            type="button"
            onClick={() => onSignOut()}
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default TopBar
