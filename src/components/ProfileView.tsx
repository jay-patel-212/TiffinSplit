import React from 'react';
import { useApp } from '../context/AppContext';
import { User as UserIcon, Shield, Mail, Phone, Utensils, CheckCircle, Clock, LogOut } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, responses, bills, settings, logout, firebaseUser } = useApp();

  const myResponses = responses.filter((r) => r.userId === currentUser.id);
  const totalMealsVoted = myResponses.reduce((acc, curr) => acc + curr.totalCount, 0);

  const latestBill = bills[0];
  const myBillItem = latestBill?.items.find((i) => i.userId === currentUser.id);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Profile Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6 justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <img
            src={
              currentUser.avatarUrl ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.name)}`
            }
            alt={currentUser.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-indigo-500/30 shadow-md shrink-0"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
                {currentUser.name}
              </h2>
              {currentUser.role === 'admin' ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Admin
                </span>
              ) : (
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Flatmate Member
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> {firebaseUser?.email || currentUser.email}
              </span>
              {currentUser.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {currentUser.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-rose-200 dark:shadow-none transition-all flex items-center gap-2 shrink-0 mt-2 sm:mt-0"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>

      {/* Personal Stats & Unpaid Bill Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Lifetime Tiffins Ordered
            </span>
            <div className="text-3xl font-black font-heading text-slate-900 dark:text-white mt-1">
              {totalMealsVoted} <span className="text-sm font-semibold text-slate-400">meals</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Utensils className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Current Month Bill ({latestBill?.month})
            </span>
            <div className="text-3xl font-black font-heading text-slate-900 dark:text-white mt-1">
              {settings.currency}{myBillItem ? myBillItem.amount : 0}
            </div>
            <span className="text-xs font-semibold mt-1 inline-block">
              {myBillItem?.paid ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Paid & Confirmed
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Payment Pending
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Meal Response Logs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold font-heading text-base text-slate-900 dark:text-white">
          My Recent Tiffin Vote History
        </h3>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {myResponses.length > 0 ? (
            myResponses.map((r) => (
              <div
                key={r.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white capitalize">
                    {r.type} Poll ({r.date})
                  </span>
                  <div className="text-slate-500 mt-0.5">
                    {r.quantity} self tiffin(s) + {r.guestCount} guest(s)
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {r.totalCount} Tiffin(s)
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">No votes logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
