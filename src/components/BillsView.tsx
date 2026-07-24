import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Receipt,
  PlusCircle,
  Download,
  Send,
  CheckCircle,
  Clock,
  MessageSquare,
  Sparkles,
  ChevronRight,
  X,
  CreditCard,
  DollarSign,
} from 'lucide-react';
import { exportBillToPDF } from '../services/pdfExport';

export const BillsView: React.FC = () => {
  const {
    bills,
    currentUser,
    settings,
    generateMonthlyBill,
    markPaymentStatus,
    showToast,
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );
  const [totalExpenseInput, setTotalExpenseInput] = useState<string>('14500');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  const activeBill = bills.find((b) => b.month === selectedMonth) || bills[0];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(totalExpenseInput);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid total expense amount', 'error');
      return;
    }

    generateMonthlyBill(selectedMonth, amount);
    setIsGeneratorOpen(false);
  };

  const handleWhatsAppReminder = (item: typeof activeBill.items[0]) => {
    const text = `Hi ${item.userName}! 👋\n\nYour tiffin bill for *${activeBill.month}* has been generated:\n- *Total Meals:* ${item.totalMeals}\n- *Total Amount:* ${settings.currency}${item.amount.toLocaleString()}\n\nPlease pay using UPI ID: *${settings.upiId}*\n\nThank you!`;
    const encoded = encodeURIComponent(text);
    const phone = item.userPhone ? item.userPhone.replace(/[^0-9]/g, '') : '';
    const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Controls Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-heading text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Monthly Bill & Split Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Auto-calculate cost per meal and individual flatmate splits
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={activeBill?.month || selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
          >
            {bills.map((b) => (
              <option key={b.id} value={b.month}>
                Bill Month: {b.month}
              </option>
            ))}
          </select>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => setIsGeneratorOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-200 dark:shadow-none transition-all inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Generate New Split
            </button>
          )}
        </div>
      </div>

      {activeBill ? (
        <div className="space-y-6">
          {/* Bill Summary Overview Card */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2">
                  Bill Statement: {activeBill.month}
                </span>
                <h3 className="text-3xl font-black font-heading text-white">
                  {settings.currency}{activeBill.totalAmount.toLocaleString()}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Total Vendor Expense Paid for {activeBill.totalMeals} Meals
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Cost / Meal
                  </span>
                  <span className="text-lg font-bold text-emerald-400">
                    {settings.currency}{activeBill.costPerMeal.toFixed(2)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Paid Members
                  </span>
                  <span className="text-lg font-bold text-teal-300">
                    {activeBill.items.filter((i) => i.paid).length} / {activeBill.items.length}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <button
                    onClick={() => exportBillToPDF(activeBill, settings)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" /> Export PDF
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Member Breakdown Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-extrabold font-heading text-base text-slate-900 dark:text-white">
                Individual Split Breakdown
              </h3>
              <span className="text-xs text-slate-500">
                Formula: Meal Count × {settings.currency}{activeBill.costPerMeal.toFixed(2)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">Meals Taken</th>
                    <th className="py-3 px-4">Calculated Bill</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {activeBill.items.map((item) => (
                    <tr key={item.userId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <div>{item.userName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{item.userEmail}</div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {item.totalMeals} meals
                      </td>

                      <td className="py-3.5 px-4 font-extrabold text-sm text-slate-900 dark:text-white">
                        {settings.currency}{item.amount.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        {item.paid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle className="w-3.5 h-3.5" /> PAID
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                            <Clock className="w-3.5 h-3.5" /> PENDING
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!item.paid && (
                            <button
                              onClick={() => handleWhatsAppReminder(item)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition-colors inline-flex items-center gap-1"
                              title="Send WhatsApp Reminder"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                            </button>
                          )}

                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() =>
                                markPaymentStatus(activeBill.id, item.userId, !item.paid)
                              }
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                                item.paid
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                              }`}
                            >
                              {item.paid ? 'Mark Unpaid' : 'Mark Paid'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
          <p className="text-slate-500">No bill generated for this month yet.</p>
        </div>
      )}

      {/* Generate Split Modal */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" /> Generate Monthly Bill Split
              </h3>
              <button
                onClick={() => setIsGeneratorOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Billing Month *
                </label>
                <input
                  type="month"
                  required
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Amount Paid to Tiffin Vendor ({settings.currency}) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={totalExpenseInput}
                  onChange={(e) => setTotalExpenseInput(e.target.value)}
                  placeholder="e.g. 14500"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-xs text-emerald-800 dark:text-emerald-300">
                The app will automatically calculate total tiffins ordered by each member for {selectedMonth} and divide the bill proportionally!
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGeneratorOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-colors"
                >
                  Calculate & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
