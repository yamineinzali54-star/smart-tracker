import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Bot, Receipt, Sparkles, X } from 'lucide-react'

const navItems = [
  { label: 'Overview', href: '#overview', icon: LayoutDashboard },
  { label: 'Agent', href: '#agent', icon: Bot },
  { label: 'Transactions', href: '#transactions', icon: Receipt },
]

const SidebarContent: React.FC<{ activeHref: string; onNavigate: (href: string) => void }> = ({
  activeHref,
  onNavigate,
}) => (
  <div className="flex h-full flex-col">
    <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md shadow-primary-600/25">
        <Sparkles className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold tracking-tight text-slate-900">SmartTrack</p>
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">AI Agent</p>
      </div>
    </div>

    <nav className="flex-1 px-3 py-6" aria-label="Main navigation">
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Menu</p>
      <ul className="space-y-1">
        {navItems.map((item) => {
          const isActive = activeHref === item.href
          return (
            <li key={item.href}>
              <a
                href={item.href}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => onNavigate(item.href)}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                  isActive ? 'text-primary-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-xl bg-primary-50 ring-1 ring-primary-100"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-bar"
                    className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary-600"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <item.icon
                  className={`relative h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span className="relative">{item.label}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>

    <div className="flex items-center gap-2 border-t border-slate-100 px-6 py-4 text-xs text-slate-500">
      <span className="h-2 w-2 rounded-full bg-success-500 shadow-[0_0_0_3px_rgb(16_185_129/0.15)]" />
      Autonomous expense tracking
    </div>
  </div>
)

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const [activeHref, setActiveHref] = useState(navItems[0].href)

  useEffect(() => {
    const sections = navItems
      .map((item) => document.querySelector(item.href))
      .filter((el): el is Element => el !== null)
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveHref(`#${entry.target.id}`)
        })
      },
      { rootMargin: '-35% 0px -55% 0px' },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200/80 bg-white lg:block">
        <SidebarContent activeHref={activeHref} onNavigate={setActiveHref} />
      </aside>

      <AnimatePresence>
        {open && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] lg:hidden"
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
            <SidebarContent
              activeHref={activeHref}
              onNavigate={(href) => {
                setActiveHref(href)
                onClose()
              }}
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar
