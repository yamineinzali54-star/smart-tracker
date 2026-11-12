import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  Sparkles,
  Command,
  UserRound,
  LogOut,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../auth-context';

interface TopBarProps {
  sidebarCollapsed: boolean;
  onSidebarToggle: () => void;
  pageTitle: string;
  pageSubtitle?: string;
}

const TopBar: React.FC<TopBarProps> = ({
  sidebarCollapsed,
  onSidebarToggle,
  pageTitle,
  pageSubtitle,
}) => {
  const { user, signOut } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setUserMenuOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
  };

  return (
    <header className="topbar">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile sidebar toggle */}
          <button
            onClick={onSidebarToggle}
            className="btn-icon lg:hidden"
            aria-label={sidebarCollapsed ? 'Open menu' : 'Close menu'}
            aria-expanded={!sidebarCollapsed}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page Title */}
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.div
                key="title"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div>
                  <h1 className="text-lg font-semibold text-text-primary truncate max-w-[300px]">
                    {pageTitle}
                  </h1>
                  {pageSubtitle && (
                    <p className="text-2xs text-text-muted truncate max-w-[300px]">
                      {pageSubtitle}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-xl mx-4 lg:mx-8 hidden md:block">
          <AnimatePresence mode="wait">
            {searchOpen && (
              <motion.div
                key="search-open"
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="relative w-full"
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    placeholder="Search expenses, commands... (⌘K)"
                    className="input-base input-with-icon pl-12 pr-12 bg-surface-secondary border-border-primary/50
                               focus:border-brand-500 focus:ring-brand-500/20
                               placeholder:text-text-muted"
                    aria-label="Search"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setSearchOpen(false);
                    }}
                    onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                  />
                  <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-mono text-text-muted bg-surface-primary border border-border-primary">
                    <span>⌘</span>K
                  </kbd>
                </div>
                <div className="absolute top-full left-0 right-0 mt-2 p-2 glass-card rounded-xl shadow-lg border-border-primary/50">
                  <p className="text-xs text-text-muted text-center py-2">
                    Search functionality coming soon
                  </p>
                </div>
              </motion.div>
            )}
            {!searchOpen && (
              <motion.button
                key="search-closed"
                onClick={() => setSearchOpen(true)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="btn-ghost w-full justify-start gap-3 px-4 py-2.5 hover:bg-surface-secondary/50"
                aria-label="Open search (⌘K)"
              >
                <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
                <span className="text-sm text-text-muted truncate">Search expenses, commands...</span>
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-mono text-text-muted bg-surface-primary border border-border-primary ml-auto">
                  <span>⌘</span>K
                </kbd>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn-icon relative"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={theme === 'dark'}
          >
            {theme === 'dark' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="btn-icon relative"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
              aria-haspopup="true"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-2xs font-bold text-white">
                3
              </span>
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 glass-card rounded-xl shadow-lg border border-border-primary/50 py-2 overflow-hidden"
                  role="menu"
                >
                  <div className="px-4 py-3 border-b border-border-primary/50 flex items-center justify-between">
                    <h3 className="font-semibold text-text-primary">Notifications</h3>
                    <button className="btn-ghost p-1" aria-label="Mark all as read">
                      <span className="text-xs text-text-muted">Mark all read</span>
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {[
                      { title: 'Expense added', desc: 'Lunch for $15.00', time: '2 min ago', unread: true },
                      { title: 'Weekly summary ready', desc: 'Your spending report is available', time: '1 hour ago', unread: true },
                      { title: 'Budget alert', desc: 'Dining category at 85% of budget', time: '3 hours ago', unread: false },
                    ].map((notif, i) => (
                      <button
                        key={i}
                        className={`w-full px-4 py-3 hover:bg-surface-secondary/50 transition-colors text-left ${notif.unread ? 'bg-surface-secondary/30' : ''}`}
                        role="menuitem"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${notif.unread ? 'bg-brand-500' : 'bg-transparent border border-border-secondary'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary">{notif.title}</p>
                            <p className="text-xs text-text-muted truncate">{notif.desc}</p>
                          </div>
                          <span className="text-2xs text-text-muted whitespace-nowrap">{notif.time}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-border-primary/50">
                    <button className="btn-secondary w-full justify-center text-sm">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="btn-icon h-10 w-10 rounded-xl p-0"
              aria-label="User menu"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-brand-500/20 text-brand-400 font-semibold text-sm">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 glass-card rounded-xl shadow-lg border border-border-primary/50 py-2 overflow-hidden"
                  role="menu"
                >
                  <div className="px-4 py-3 border-b border-border-primary/50">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {user?.user_metadata?.name || 'User'}
                    </p>
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                  <nav className="py-1">
                    {[
                      { label: 'Profile', icon: UserRound, href: '#profile', comingSoon: true },
                      { label: 'Settings', icon: Settings, href: '#settings', comingSoon: true },
                      { label: 'Help', icon: HelpCircle, href: '#help', comingSoon: true },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => setUserMenuOpen(false)}
                        className={`nav-link w-full px-4 ${item.comingSoon ? 'opacity-60' : ''}`}
                        disabled={item.comingSoon}
                        role="menuitem"
                        title={item.comingSoon ? 'Coming soon' : undefined}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {item.comingSoon && <span className="badge badge-primary">Soon</span>}
                      </button>
                    ))}
                  </nav>
                  <div className="border-t border-border-primary/50 py-1">
                    <button
                      onClick={handleSignOut}
                      className="nav-link w-full px-4 text-rose-400 hover:bg-rose-500/10"
                      role="menuitem"
                    >
                      <LogOut className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1">Sign out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;