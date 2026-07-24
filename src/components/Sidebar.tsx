import React from 'react';
import { useApp, ActiveTab } from '../context/AppContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Clock,
  ClipboardList,
  Users,
  Receipt,
  QrCode,
  BarChart3,
  Settings as SettingsIcon,
  User as UserIcon,
  X,
  Shield,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, currentUser, settings } = useApp();

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'polls', label: 'Meal Polls', icon: UtensilsCrossed },
    { id: 'orders', label: "Today's Orders", icon: ClipboardList },
    { id: 'bills', label: 'Monthly Bills', icon: Receipt },
    { id: 'payments', label: 'Payments & QR', icon: QrCode },
    { id: 'members', label: 'Flatmates', icon: Users, adminOnly: true },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'profile', label: 'My Profile', icon: UserIcon },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full py-4 px-3">
      {/* User Status Banner */}
      <div className="mb-4 p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div className="flex items-center gap-2.5">
          <img
            src={
              currentUser.avatarUrl ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.name)}`
            }
            alt={currentUser.name}
            className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500/30"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {currentUser.name}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {currentUser.role === 'admin' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              ) : (
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Flatmate Member
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
          Menu Navigation
        </div>
        {navItems.map((item) => {
          if (item.adminOnly && currentUser.role !== 'admin') {
            return null;
          }
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.adminOnly && !isActive && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 uppercase">
                  Admin
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* GitHub Pages & Firebase Sync Card */}
      <div className="mt-4 p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-xs">
        <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> GitHub Pages Ready
        </div>
        <p className="text-[11px] text-indigo-700/90 dark:text-indigo-300/90 leading-relaxed">
          Full client-side mode enabled. Add Firebase keys in Settings to sync with Firestore live!
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-[calc(100vh-4rem)] sticky top-16">
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          />
          <div className="relative w-72 max-w-[80%] bg-white dark:bg-slate-900 h-full shadow-2xl z-10 flex flex-col border-r border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                {settings.flatName}
              </span>
              <button
                onClick={onCloseMobile}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
