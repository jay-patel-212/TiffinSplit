import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DashboardView } from './components/DashboardView';
import { MealPollView } from './components/MealPollView';
import { TodaysOrdersView } from './components/TodaysOrdersView';
import { MembersView } from './components/MembersView';
import { BillsView } from './components/BillsView';
import { PaymentsView } from './components/PaymentsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { ProfileView } from './components/ProfileView';
import { LoginView } from './components/LoginView';
import { ToastContainer } from './components/Toast';
import { ShieldCheck, RefreshCw } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, firebaseUser, authLoading } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg animate-bounce">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            Authenticating TiffinSplit account...
          </p>
        </div>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'polls':
        return <MealPollView />;
      case 'orders':
        return <TodaysOrdersView />;
      case 'members':
        return <MembersView />;
      case 'bills':
        return <BillsView />;
      case 'payments':
        return <PaymentsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation Bar */}
      <Navbar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />

      {/* Main Layout Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Sidebar Navigation */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Dynamic Content Main View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 pb-24 lg:pb-8">
          {renderActiveView()}
        </main>
      </div>

      {/* Touch-Friendly Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
