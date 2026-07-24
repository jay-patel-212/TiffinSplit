import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  QrCode,
  Flame,
  DollarSign,
  Save,
  CheckCircle2,
  Database,
  Moon,
  Sun,
  Clock,
  Utensils,
  Smartphone,
  Trash2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { FlatSettings } from '../types';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, clearDemoData, isDarkMode, toggleDarkMode, currentUser } = useApp();
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const [flatName, setFlatName] = useState(settings.flatName);
  const [upiId, setUpiId] = useState(settings.upiId);
  const [payeeName, setPayeeName] = useState(settings.payeeName);
  const [currency, setCurrency] = useState(settings.currency);
  const [defaultLunchDeadline, setDefaultLunchDeadline] = useState(settings.defaultLunchDeadline);
  const [defaultDinnerDeadline, setDefaultDinnerDeadline] = useState(settings.defaultDinnerDeadline);
  const [tiffinProviderName, setTiffinProviderName] = useState(settings.tiffinProviderName);
  const [tiffinProviderPhone, setTiffinProviderPhone] = useState(settings.tiffinProviderPhone);

  // Firebase Config fields
  const [apiKey, setApiKey] = useState(settings.firebaseConfig?.apiKey || '');
  const [authDomain, setAuthDomain] = useState(settings.firebaseConfig?.authDomain || '');
  const [projectId, setProjectId] = useState(settings.firebaseConfig?.projectId || '');
  const [storageBucket, setStorageBucket] = useState(settings.firebaseConfig?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(settings.firebaseConfig?.messagingSenderId || '');
  const [appId, setAppId] = useState(settings.firebaseConfig?.appId || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const newSettings: FlatSettings = {
      flatName: flatName.trim(),
      upiId: upiId.trim(),
      payeeName: payeeName.trim(),
      currency,
      defaultLunchDeadline,
      defaultDinnerDeadline,
      tiffinProviderName: tiffinProviderName.trim(),
      tiffinProviderPhone: tiffinProviderPhone.trim(),
      firebaseConfig: apiKey.trim()
        ? {
            apiKey: apiKey.trim(),
            authDomain: authDomain.trim(),
            projectId: projectId.trim(),
            storageBucket: storageBucket.trim(),
            messagingSenderId: messagingSenderId.trim(),
            appId: appId.trim(),
          }
        : undefined,
    };

    updateSettings(newSettings);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-heading text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Flat & Payment Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure UPI payment ID, default deadlines, and Firebase database credentials
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-200 dark:shadow-none transition-all inline-flex items-center gap-2 shrink-0"
        >
          <Save className="w-4 h-4" /> Save All Settings
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Flat Details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold font-heading text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-500" /> General Flat Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Flat / Group Name
              </label>
              <input
                type="text"
                required
                value={flatName}
                onChange={(e) => setFlatName(e.target.value)}
                placeholder="e.g. Flat 302 Sunshine Heights"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Currency Symbol
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
              >
                <option value="₹">₹ (Indian Rupee)</option>
                <option value="$">$ (US Dollar)</option>
                <option value="€">€ (Euro)</option>
                <option value="£">£ (British Pound)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tiffin Provider Vendor Name
              </label>
              <input
                type="text"
                value={tiffinProviderName}
                onChange={(e) => setTiffinProviderName(e.target.value)}
                placeholder="e.g. Annapurna Gourmet Tiffin Service"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tiffin Provider Phone Number
              </label>
              <input
                type="text"
                value={tiffinProviderPhone}
                onChange={(e) => setTiffinProviderPhone(e.target.value)}
                placeholder="+91 98000 11223"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* UPI Payment Config */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold font-heading text-base text-slate-900 dark:text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-500" /> Payee UPI ID Configuration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payee VPA / UPI ID *
              </label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. flatowner@upi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                This UPI ID is used to auto-generate the upi://pay QR code
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payee / Account Holder Name
              </label>
              <input
                type="text"
                required
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Default Voting Deadlines */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold font-heading text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-500" /> Default Poll Cutoff Deadlines
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Lunch Voting Deadline
              </label>
              <input
                type="time"
                value={defaultLunchDeadline}
                onChange={(e) => setDefaultLunchDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Dinner Voting Deadline
              </label>
              <input
                type="time"
                value={defaultDinnerDeadline}
                onChange={(e) => setDefaultDinnerDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Firebase Client Integration */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold font-heading text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" /> Firebase Backend Synchronization (GitHub Pages Ready)
            </h3>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Optional Cloud Sync
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Paste your Firebase web app config parameters below to enable live cloud multi-device sync across all flatmates on GitHub Pages!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                API Key
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Auth Domain
              </label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="myflat.firebaseapp.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project ID
              </label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="myflat-1234"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Data Reset & Dynamic Mode Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold font-heading text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-500" /> Data Management & Clear Previous Demo Data
            </h3>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              Admin Control
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Want a fresh, 100% dynamic dashboard? Click below to clear all sample demo meal polls, votes, and historical bills. Your flat settings and user profile will remain intact so you can start logging real daily tiffins.
          </p>

          {!confirmClearOpen ? (
            <button
              type="button"
              onClick={() => setConfirmClearOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/80 text-xs font-bold transition-all inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Clear All Previous Demo Polls & Bills
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2.5 text-rose-800 dark:text-rose-200 text-xs font-semibold">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  Are you sure you want to clear all previous polls, responses, and monthly bills? This will reset the dashboard to a completely clean, dynamic state.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    clearDemoData();
                    setConfirmClearOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
                >
                  Yes, Clear All Data
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
