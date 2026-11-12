import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  comingSoon?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, href: '#dashboard' },
  { label: 'Expenses', icon: <Receipt className="w-5 h-5" />, href: '#expenses' },
  { label: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, href: '#analytics', comingSoon: true },
  { label: 'Settings', icon: <Settings className="w-5 h-5" />, href: '#settings', comingSoon: true },
];

const bottomNavItems: NavItem[] = [
  { label: 'Help', icon: <HelpCircle className="w-5 h-5" />, href: '#help', comingSoon: true },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeItem: string;
  onNavigate: (href: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggle,
  activeItem,
  onNavigate,
}) => {
  const handleNavClick = (href: string, comingSoon?: boolean) => {
    if (comingSoon) {
      return;
    }
    onNavigate(href);
  };

  return (
    <motion.aside
      className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}
      animate={{ width: isCollapsed ? '4rem' : '16rem' }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      initial={false}
    >
      <div className="flex h-full flex-col">
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border-primary">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 shadow-lg shadow-brand-500/25 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  key="logo-text"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="text-lg font-semibold text-text-primary whitespace-nowrap">SmartTrack</p>
                  <p className="text-2xs text-text-muted uppercase tracking-wider whitespace-nowrap">AI Agent</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <button
            onClick={onToggle}
            className="btn-icon rounded-xl text-text-muted hover:text-text-primary flex-shrink-0"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Main navigation">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                key="nav-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="px-3 py-1 text-2xs font-bold uppercase tracking-wider text-text-muted"
              >
                Main
              </motion.div>
            )}
          </AnimatePresence>
          <ul className="space-y-1" role="list">
            {navItems.map((item) => (
              <li key={item.href}>
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.button
                      key="expanded"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <button
                        onClick={() => handleNavClick(item.href, item.comingSoon)}
                        className={`nav-link w-full ${activeItem === item.href ? 'nav-link-active' : ''} ${
                          item.comingSoon ? 'opacity-60 cursor-default' : ''
                        }`}
                        disabled={item.comingSoon}
                        aria-current={activeItem === item.href ? 'page' : undefined}
                        title={item.comingSoon ? 'Coming soon' : undefined}
                      >
                        <span className="flex-shrink-0">{item.icon}</span>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.comingSoon && (
                          <span className="badge badge-primary ml-auto">Soon</span>
                        )}
                      </button>
                    </motion.button>
                  )}
                  {isCollapsed && (
                    <motion.button
                      key="collapsed"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <button
                        onClick={() => handleNavClick(item.href, item.comingSoon)}
                        className={`nav-link justify-center w-full ${
                          activeItem === item.href ? 'nav-link-active' : ''
                        } ${item.comingSoon ? 'opacity-60 cursor-default' : ''}`}
                        disabled={item.comingSoon}
                        aria-current={activeItem === item.href ? 'page' : undefined}
                        aria-label={item.label}
                        title={item.comingSoon ? `${item.label} - Coming soon` : item.label}
                      >
                        <span className="flex-shrink-0">{item.icon}</span>
                        {!isCollapsed && <span className="flex-1 text-left">{item.label}</span>}
                      </button>
                    </motion.button>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>

          {/* Bottom Navigation */}
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                key="bottom-nav-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="mt-6 pt-4 border-t border-border-primary"
              >
                <p className="px-3 py-1 text-2xs font-bold uppercase tracking-wider text-text-muted">
                  Resources
                </p>
                <ul className="space-y-1 mt-2" role="list">
                  {bottomNavItems.map((item) => (
                    <li key={item.href}>
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <button
                          onClick={() => handleNavClick(item.href, item.comingSoon)}
                          className={`nav-link w-full ${item.comingSoon ? 'opacity-60 cursor-default' : ''}`}
                          disabled={item.comingSoon}
                          aria-label={item.label}
                          title={item.comingSoon ? `${item.label} - Coming soon` : item.label}
                        >
                          <span className="flex-shrink-0">{item.icon}</span>
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.comingSoon && (
                            <span className="badge badge-primary ml-auto">Soon</span>
                          )}
                        </button>
                      </motion.button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
            {isCollapsed && (
              <motion.div
                key="bottom-nav-collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="mt-6 pt-4 border-t border-border-primary space-y-1"
              >
                {bottomNavItems.map((item) => (
                  <motion.button
                    key={item.href}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <button
                      onClick={() => handleNavClick(item.href, item.comingSoon)}
                      className={`nav-link justify-center w-full ${item.comingSoon ? 'opacity-60 cursor-default' : ''}`}
                      disabled={item.comingSoon}
                      aria-label={item.label}
                      title={item.comingSoon ? `${item.label} - Coming soon` : item.label}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                    </button>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-border-primary">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                key="user-expanded"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-surface-secondary transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400 font-semibold text-sm flex-shrink-0">
                  U
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-sm font-medium text-text-primary truncate">User</p>
                  <p className="text-2xs text-text-muted truncate">user@example.com</p>
                </div>
              </motion.div>
            )}
            {isCollapsed && (
              <motion.div
                key="user-collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="flex justify-center"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400 font-semibold text-sm"
                     title="User"
                     aria-label="User menu">
                  U
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;