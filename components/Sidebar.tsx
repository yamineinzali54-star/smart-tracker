import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Bot, Receipt, Sparkles, X } from 'lucide-react'

const navItems = [
  { label: 'Overview', href: '#overview', icon: LayoutDashboard },
  { label: 'Agent', href: '#agent', icon: Bot },
  { label: 'Transactions', href: '#transactions', icon: Receipt },
]

const SidebarContent: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => (
  <div className="flex h-full flex-col">
    <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
        <Sparkles className="h-4.5 w-4.5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">SmartTrack</p>
        <p className="text-[11px] uppercase tracking-wider text-slate-500">AI Agent</p>
      </div>
    </div>
    <nav className="flex-1 space-y-1 px-3 py-6" aria-label="Main navigation">
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Menu</p>
      {navItems.map((item) => (
        <a
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </a>
      ))}
    </nav>
    <div className="border-t border-slate-200 px-6 py-4 text-xs text-slate-500">
      Autonomous expense tracking
    </div>
  </div>
)

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => (
  <>
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:block">
      <SidebarContent onNavigate={() => {}} />
    </aside>

    <AnimatePresence>
      {open && (
        <motion.div
          key="sidebar-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
        />
      )}
    </AnimatePresence>

    <AnimatePresence>
      {open && (
        <motion.aside
          key="sidebar-drawer"
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:hidden"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-4 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarContent onNavigate={onClose} />
        </motion.aside>
      )}
    </AnimatePresence>
  </>
)

export default Sidebar
