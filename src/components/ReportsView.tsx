import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Award,
  Download,
  Utensils,
  Calendar,
  Users,
  PieChart,
} from 'lucide-react';
import { exportBillToPDF, exportResponsesToCSV } from '../services/pdfExport';

export const ReportsView: React.FC = () => {
  const { users, responses, bills, settings } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );

  const monthResponses = responses.filter((r) => r.date.startsWith(selectedMonth));

  // Compute metrics
  const totalMealsMonth = monthResponses.reduce((acc, curr) => acc + curr.totalCount, 0);
  const totalGuestsMonth = monthResponses.reduce((acc, curr) => acc + curr.guestCount, 0);

  // Meal breakdown per member
  const memberStats = users.map((u) => {
    const uResponses = monthResponses.filter((r) => r.userId === u.id);
    const count = uResponses.reduce((acc, curr) => acc + curr.totalCount, 0);
    return {
      user: u,
      meals: count,
    };
  });

  // Sort by highest meal consumer
  memberStats.sort((a, b) => b.meals - a.meals);
  const topConsumer = memberStats[0];

  const activeBill = bills.find((b) => b.month === selectedMonth) || bills[0];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-heading text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Monthly Tiffin Reports & Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Meal order trends, top consumers, and billing summaries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
          />

          {activeBill && (
            <button
              onClick={() => exportBillToPDF(activeBill, settings)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
          )}
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500">Total Tiffins Voted</span>
              <div className="text-2xl font-black font-heading text-slate-900 dark:text-white">
                {totalMealsMonth} <span className="text-xs text-slate-400 font-semibold">meals</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500">Top Meal Consumer</span>
              <div className="text-lg font-black font-heading text-slate-900 dark:text-white truncate">
                {topConsumer ? topConsumer.user.name : 'N/A'} ({topConsumer ? topConsumer.meals : 0} meals)
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500">Monthly Expense</span>
              <div className="text-2xl font-black font-heading text-slate-900 dark:text-white">
                {settings.currency}{activeBill ? activeBill.totalAmount.toLocaleString() : '0'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Member Meal Distribution Bars */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold font-heading text-base text-slate-900 dark:text-white flex items-center gap-2">
          <PieChart className="w-5 h-5 text-emerald-500" /> Member Meal Volume Distribution
        </h3>

        <div className="space-y-4 pt-2">
          {memberStats.map(({ user, meals }) => {
            const percentage = totalMealsMonth > 0 ? Math.round((meals / totalMealsMonth) * 100) : 0;
            return (
              <div key={user.id} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-2">
                    <img
                      src={
                        user.avatarUrl ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`
                      }
                      alt={user.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    {user.name}
                  </span>
                  <span>
                    {meals} meals ({percentage}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(4, percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
