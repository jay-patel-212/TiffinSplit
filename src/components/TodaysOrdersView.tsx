import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ClipboardList,
  Calendar as CalendarIcon,
  Download,
  Sun,
  Moon,
  Users,
  Search,
  Filter,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { exportResponsesToCSV } from '../services/pdfExport';

export const TodaysOrdersView: React.FC = () => {
  const { users, responses, polls } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Responses for date
  const dateResponses = responses.filter((r) => r.date === selectedDate);
  const lunchPoll = polls.find((p) => p.date === selectedDate && p.type === 'lunch');
  const dinnerPoll = polls.find((p) => p.date === selectedDate && p.type === 'dinner');

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalLunchTiffins = dateResponses
    .filter((r) => r.type === 'lunch')
    .reduce((acc, curr) => acc + curr.totalCount, 0);

  const totalDinnerTiffins = dateResponses
    .filter((r) => r.type === 'dinner')
    .reduce((acc, curr) => acc + curr.totalCount, 0);

  const totalGuestTiffins = dateResponses.reduce((acc, curr) => acc + curr.guestCount, 0);
  const grandTotalTiffins = totalLunchTiffins + totalDinnerTiffins;

  const handleExportCSV = () => {
    exportResponsesToCSV(selectedDate, dateResponses, users);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-heading text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> One-Screen Today's Orders
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Full order breakdown and headcount for kitchen staff
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Quick Headcount Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <Sun className="w-4 h-4" /> Lunch Tiffins
          </div>
          <div className="text-2xl font-black font-heading mt-1">{totalLunchTiffins}</div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-900 dark:text-indigo-200">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
            <Moon className="w-4 h-4" /> Dinner Tiffins
          </div>
          <div className="text-2xl font-black font-heading mt-1">{totalDinnerTiffins}</div>
        </div>

        <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-900 dark:text-teal-200">
          <div className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Guest Meals
          </div>
          <div className="text-2xl font-black font-heading mt-1">{totalGuestTiffins}</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> Grand Total
          </div>
          <div className="text-2xl font-black font-heading mt-1">{grandTotalTiffins}</div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search member by name..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Orders Matrix Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Flatmate</th>
                <th className="py-3 px-4">Lunch Order</th>
                <th className="py-3 px-4">Dinner Order</th>
                <th className="py-3 px-4">Guest Count</th>
                <th className="py-3 px-4 text-right">Total Tiffins</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredUsers.map((member) => {
                const lResp = dateResponses.find((r) => r.type === 'lunch' && r.userId === member.id);
                const dResp = dateResponses.find((r) => r.type === 'dinner' && r.userId === member.id);

                const lQty = lResp ? lResp.quantity : 0;
                const dQty = dResp ? dResp.quantity : 0;
                const guest = (lResp ? lResp.guestCount : 0) + (dResp ? dResp.guestCount : 0);
                const total = (lResp ? lResp.totalCount : 0) + (dResp ? dResp.totalCount : 0);

                return (
                  <tr key={member.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <img
                        src={
                          member.avatarUrl ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.name)}`
                        }
                        alt={member.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                      />
                      <div>
                        <div>{member.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{member.email}</div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {lQty > 0 ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                          {lQty} Tiffin{lQty > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Opted Out (0)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {dQty > 0 ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
                          {dQty} Tiffin{dQty > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Opted Out (0)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {guest > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-bold">
                          +{guest} Guest
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-sm text-slate-900 dark:text-white">
                      {total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 dark:bg-slate-800 font-black text-slate-900 dark:text-white text-sm">
                <td className="py-3.5 px-4 uppercase text-xs tracking-wider text-slate-500">
                  Total Order Headcount
                </td>
                <td className="py-3.5 px-4 text-amber-700 dark:text-amber-300">{totalLunchTiffins}</td>
                <td className="py-3.5 px-4 text-indigo-700 dark:text-indigo-300">{totalDinnerTiffins}</td>
                <td className="py-3.5 px-4 text-teal-700 dark:text-teal-300">{totalGuestTiffins}</td>
                <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400 text-base">
                  {grandTotalTiffins} Tiffins
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
