import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Utensils,
  Sun,
  Moon,
  Clock,
  QrCode,
  Users,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  CreditCard,
  DollarSign,
  Share2,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    users,
    polls,
    responses,
    bills,
    settings,
    setActiveTab,
    submitMealResponse,
    showToast,
  } = useApp();

  const today = new Date().toISOString().split('T')[0];

  // Today's polls
  const lunchPoll = polls.find((p) => p.date === today && p.type === 'lunch') || polls[0];
  const dinnerPoll = polls.find((p) => p.date === today && p.type === 'dinner') || polls[1];

  // Responses
  const todayResponses = responses.filter((r) => r.date === today);

  const lunchResponses = todayResponses.filter((r) => r.type === 'lunch');
  const dinnerResponses = todayResponses.filter((r) => r.type === 'dinner');

  const totalLunchCount = lunchResponses.reduce((acc, curr) => acc + curr.totalCount, 0);
  const totalDinnerCount = dinnerResponses.reduce((acc, curr) => acc + curr.totalCount, 0);
  const todayTotalOrders = totalLunchCount + totalDinnerCount;

  // Current user's votes
  const myLunchVote = lunchResponses.find((r) => r.userId === currentUser.id);
  const myDinnerVote = dinnerResponses.find((r) => r.userId === currentUser.id);

  // Latest bill calculations
  const latestBill = bills[0];
  const pendingItems = latestBill ? latestBill.items.filter((i) => !i.paid) : [];
  const totalPendingAmount = pendingItems.reduce((acc, curr) => acc + curr.amount, 0);
  const myPendingBillItem = latestBill?.items.find((i) => i.userId === currentUser.id);

  // Quick voting helper
  const handleQuickVote = (type: 'lunch' | 'dinner', qty: number) => {
    const targetPoll = type === 'lunch' ? lunchPoll : dinnerPoll;
    if (!targetPoll) {
      showToast(`No poll created for today's ${type}`, 'error');
      return;
    }
    const currentGuest = type === 'lunch' ? (myLunchVote?.guestCount || 0) : (myDinnerVote?.guestCount || 0);
    submitMealResponse(targetPoll.id, type, qty, currentGuest);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Welcome & Account Summary Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-100/60 dark:shadow-none relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white/95 text-xs font-bold tracking-wider uppercase backdrop-blur-md mb-2">
              <Clock className="w-3.5 h-3.5 text-indigo-200" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading tracking-tight">
              Hello, {currentUser.name}! 👋
            </h2>
            <p className="text-indigo-100 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed font-medium">
              Welcome to <span className="font-bold text-white">{settings.flatName}</span> meal dashboard. Check today's orders and vote for your tiffins below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('polls')}
              className="px-5 py-3 rounded-2xl bg-white text-indigo-600 hover:bg-indigo-50 text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-2 shrink-0"
            >
              <Utensils className="w-4 h-4 text-indigo-600" /> Vote Today's Meals
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className="px-5 py-3 rounded-2xl bg-indigo-500/40 hover:bg-indigo-500/60 border border-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0"
            >
              <QrCode className="w-4 h-4 text-indigo-200" /> Pay UPI
            </button>
          </div>
        </div>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Today's Lunch Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Today's Lunch</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-heading text-slate-900 dark:text-white">
            {totalLunchCount} <span className="text-xs font-semibold text-slate-400">tiffins</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {lunchResponses.length} members voted
          </p>
        </div>

        {/* Today's Dinner Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Today's Dinner</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Moon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-heading text-slate-900 dark:text-white">
            {totalDinnerCount} <span className="text-xs font-semibold text-slate-400">tiffins</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {dinnerResponses.length} members voted
          </p>
        </div>

        {/* Total Orders Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Orders</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-heading text-slate-900 dark:text-white">
            {todayTotalOrders} <span className="text-xs font-semibold text-slate-400">meals</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold truncate">
            Self + Guests
          </p>
        </div>

        {/* Pending Payments Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Pending Payments</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-heading text-slate-900 dark:text-white">
            {settings.currency}{totalPendingAmount.toLocaleString()}
          </div>
          <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 font-semibold truncate">
            {pendingItems.length} members pending
          </p>
        </div>

        {/* Current Month Expense Card */}
        <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Month Expense</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-heading text-slate-900 dark:text-white">
            {settings.currency}{latestBill?.totalAmount ? latestBill.totalAmount.toLocaleString() : '14,500'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            ~{settings.currency}{latestBill?.costPerMeal ? latestBill.costPerMeal.toFixed(0) : '116'} / meal
          </p>
        </div>
      </div>

      {/* Quick Vote Panel for Logged In User */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold font-heading text-slate-900 dark:text-white flex items-center gap-2">
              <Utensils className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> My Quick Vote ({currentUser.name})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tap quantity to set your tiffin order for today
            </p>
          </div>
          <button
            onClick={() => setActiveTab('polls')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Detailed View <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Lunch Quick Box */}
          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-500" /> Lunch (Deadline: {lunchPoll?.deadline || '11:00 AM'})
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
                Current: {myLunchVote ? `${myLunchVote.quantity} self + ${myLunchVote.guestCount} guest` : 'Not Voted'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-1 italic">
              "{lunchPoll?.description || 'Paneer + Dal + Rice'}"
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Self Tiffins:</span>
              {[0, 1, 2, 3].map((qty) => (
                <button
                  key={`lunch-qty-${qty}`}
                  onClick={() => handleQuickVote('lunch', qty)}
                  className={`flex-1 py-1.5 text-xs font-extrabold rounded-xl border transition-all ${
                    (myLunchVote?.quantity ?? null) === qty
                      ? 'bg-amber-500 border-amber-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-900/60 text-slate-700 dark:text-slate-300 hover:bg-amber-100/50'
                  }`}
                >
                  {qty === 0 ? 'None' : `${qty}`}
                </button>
              ))}
            </div>
          </div>

          {/* Dinner Quick Box */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-indigo-500" /> Dinner (Deadline: {dinnerPoll?.deadline || '06:00 PM'})
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300">
                Current: {myDinnerVote ? `${myDinnerVote.quantity} self + ${myDinnerVote.guestCount} guest` : 'Not Voted'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-1 italic">
              "{dinnerPoll?.description || 'Roti + Sabji + Dal'}"
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Self Tiffins:</span>
              {[0, 1, 2, 3].map((qty) => (
                <button
                  key={`dinner-qty-${qty}`}
                  onClick={() => handleQuickVote('dinner', qty)}
                  className={`flex-1 py-1.5 text-xs font-extrabold rounded-xl border transition-all ${
                    (myDinnerVote?.quantity ?? null) === qty
                      ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-900/60 text-slate-700 dark:text-slate-300 hover:bg-indigo-100/50'
                  }`}
                >
                  {qty === 0 ? 'None' : `${qty}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* One Screen Today's Orders Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold font-heading text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Today's Member Summary Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live headcount for kitchen & flatmates
            </p>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
          >
            View Full Matrix
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Member</th>
                <th className="py-2.5 px-3">Lunch</th>
                <th className="py-2.5 px-3">Dinner</th>
                <th className="py-2.5 px-3">Guests</th>
                <th className="py-2.5 px-3 text-right">Total Tiffins</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {users.map((member) => {
                const lResp = lunchResponses.find((r) => r.userId === member.id);
                const dResp = dinnerResponses.find((r) => r.userId === member.id);

                const lQty = lResp ? lResp.quantity : 0;
                const dQty = dResp ? dResp.quantity : 0;
                const guest = (lResp ? lResp.guestCount : 0) + (dResp ? dResp.guestCount : 0);
                const memberTotal = (lResp ? lResp.totalCount : 0) + (dResp ? dResp.totalCount : 0);

                return (
                  <tr key={member.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <img
                        src={
                          member.avatarUrl ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.name)}`
                        }
                        alt={member.name}
                        className="w-6 h-6 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                      />
                      {member.name}
                      {member.id === currentUser.id && (
                        <span className="text-[10px] text-emerald-600 font-bold">(You)</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold ${
                          lQty > 0
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'text-slate-400'
                        }`}
                      >
                        {lQty}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold ${
                          dQty > 0
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'text-slate-400'
                        }`}
                      >
                        {dQty}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-medium">
                      {guest > 0 ? `+${guest} guest` : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-slate-900 dark:text-white text-sm">
                      {memberTotal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700">
                <td className="py-3 px-3 uppercase text-[11px] tracking-wider text-slate-500">
                  Grand Total
                </td>
                <td className="py-3 px-3 text-amber-700 dark:text-amber-300">{totalLunchCount}</td>
                <td className="py-3 px-3 text-indigo-700 dark:text-indigo-300">{totalDinnerCount}</td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                  {todayResponses.reduce((acc, curr) => acc + curr.guestCount, 0)}
                </td>
                <td className="py-3 px-3 text-right text-emerald-600 dark:text-emerald-400 text-base font-extrabold">
                  {todayTotalOrders} Tiffins
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Payment Reminder / Status Banner */}
      {myPendingBillItem && !myPendingBillItem.paid && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Pending Tiffin Bill for {latestBill.month}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                You have an unpaid bill of <span className="font-extrabold text-amber-600 dark:text-amber-400">{settings.currency}{myPendingBillItem.amount.toLocaleString()}</span> ({myPendingBillItem.totalMeals} meals).
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('payments')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-colors shrink-0 flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4" /> Pay Now via UPI
          </button>
        </div>
      )}
    </div>
  );
};
