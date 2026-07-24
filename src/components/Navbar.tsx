import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Menu, Moon, Sun, Shield, UserCheck, Utensils, QrCode, LogOut } from 'lucide-react';
import { AuthModal } from './AuthModal';

interface NavbarProps {
  onOpenMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileSidebar }) => {
  const { currentUser, settings, isDarkMode, toggleDarkMode, setActiveTab, logout, firebaseUser } = useApp();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left section: Logo & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMobileSidebar}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors focus:outline-none"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none group-hover:scale-105 transition-transform">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-heading font-extrabold text-base leading-tight text-slate-800 dark:text-white tracking-tight flex items-center gap-1.5">
                  Flat Meal Manager
                </h1>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block truncate max-w-[160px] sm:max-w-xs">
                  {settings.flatName}
                </span>
              </div>
            </div>
          </div>

          {/* Right section: Quick Actions, Theme Toggle, Current User Profile & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab('payments')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/80 transition-all shadow-sm"
            >
              <QrCode className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Pay UPI
            </button>

            <button
              onClick={toggleDarkMode}
              className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

            {/* Current User Profile Pill */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all group"
            >
              <img
                src={
                  currentUser.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.name)}`
                }
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-600 shrink-0"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold leading-none flex items-center gap-1">
                  {currentUser.name}
                  {currentUser.role === 'admin' && (
                    <Shield className="w-3 h-3 text-amber-500 inline shrink-0" />
                  )}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 capitalize truncate max-w-[100px]">
                  {firebaseUser?.email || currentUser.role}
                </div>
              </div>
              <UserCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors ml-0.5" />
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors border border-rose-200 dark:border-rose-900/60"
              title="Log Out of Firebase Account"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
