import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { sendFirebaseInviteEmail } from '../services/firebase';
import { X, UserCheck, Shield, UserPlus, Check, Sparkles } from 'lucide-react';
import { User, Role } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, users, setCurrentUser, addUser, showToast } = useApp();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<Role>('member');

  if (!isOpen) return null;

  const handleSelectUser = (u: User) => {
    setCurrentUser(u);
    onClose();
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const email = newEmail.trim();
    const name = newName.trim();

    addUser({
      name,
      email,
      phone: newPhone.trim() || undefined,
      role: newRole,
      active: true,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    });

    showToast(`Added ${name}! Sending Firebase invite email...`, 'info');
    const res = await sendFirebaseInviteEmail(email, name);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'warning');
    }

    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setIsAddingNew(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />

        <div className="flex items-center justify-between mb-5 pt-1">
          <div>
            <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-500" /> Switch User / Role
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select an account to simulate Admin or Member views
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAddingNew ? (
          <div>
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {users.map((u) => {
                const isCurrent = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      isCurrent
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-600 dark:text-emerald-200 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          u.avatarUrl ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`
                        }
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                      />
                      <div>
                        <div className="font-semibold text-sm flex items-center gap-2">
                          {u.name}
                          {u.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <Shield className="w-3 h-3" /> Admin
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              Member
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{u.email}</div>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsAddingNew(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-emerald-500 text-emerald-600 dark:text-emerald-400 font-medium text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Add New Flatmate
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Rohan Das"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="e.g. rohan@example.com"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewRole('member')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    newRole === 'member'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Member
                </button>
                <button
                  type="button"
                  onClick={() => setNewRole('admin')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    newRole === 'admin'
                      ? 'bg-amber-50 border-amber-500 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Back to List
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Save Member
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
