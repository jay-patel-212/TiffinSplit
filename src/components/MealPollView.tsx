import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sun,
  Moon,
  Clock,
  Plus,
  Lock,
  Unlock,
  Users,
  CheckCircle2,
  Calendar as CalendarIcon,
  PlusCircle,
  X,
  Edit2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { MealType, MealPoll } from '../types';

export const MealPollView: React.FC = () => {
  const {
    currentUser,
    polls,
    responses,
    settings,
    createPoll,
    updatePoll,
    togglePollStatus,
    submitMealResponse,
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Poll Create / Edit Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPoll, setEditingPoll] = useState<MealPoll | null>(null);
  const [modalType, setModalType] = useState<MealType>('lunch');
  const [modalDesc, setModalDesc] = useState('');
  const [modalDeadline, setModalDeadline] = useState(
    modalType === 'lunch' ? settings.defaultLunchDeadline : settings.defaultDinnerDeadline
  );

  // Date Shift Helper
  const changeDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // Polls for selected date
  const lunchPoll = polls.find((p) => p.date === selectedDate && p.type === 'lunch');
  const dinnerPoll = polls.find((p) => p.date === selectedDate && p.type === 'dinner');

  // Responses for selected date
  const lunchResponses = responses.filter((r) => r.date === selectedDate && r.type === 'lunch');
  const dinnerResponses = responses.filter((r) => r.date === selectedDate && r.type === 'dinner');

  const myLunchVote = lunchResponses.find((r) => r.userId === currentUser.id);
  const myDinnerVote = dinnerResponses.find((r) => r.userId === currentUser.id);

  const handleVote = (
    poll: MealPoll,
    type: MealType,
    quantity: number,
    guestCount: number
  ) => {
    if (!poll.isOpen) return;
    submitMealResponse(poll.id, type, quantity, guestCount);
  };

  const openCreateModal = (type: MealType) => {
    setModalType(type);
    setEditingPoll(null);
    setModalDesc(type === 'lunch' ? 'Paneer + Dal + Rice' : 'Roti + Sabji + Dal');
    setModalDeadline(
      type === 'lunch'
        ? settings.defaultLunchDeadline
        : settings.defaultDinnerDeadline
    );
    setIsCreateModalOpen(true);
  };

  const openEditModal = (poll: MealPoll) => {
    setModalType(poll.type);
    setEditingPoll(poll);
    setModalDesc(poll.description);
    setModalDeadline(poll.deadline);
    setIsCreateModalOpen(true);
  };

  const handleSavePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalDesc.trim()) return;

    if (editingPoll) {
      updatePoll({
        ...editingPoll,
        description: modalDesc.trim(),
        deadline: modalDeadline,
      });
    } else {
      createPoll({
        date: selectedDate,
        type: modalType,
        description: modalDesc.trim(),
        deadline: modalDeadline,
        isOpen: true,
        createdBy: currentUser.id,
      });
    }

    setIsCreateModalOpen(false);
  };

  const renderPollCard = (
    type: MealType,
    poll: MealPoll | undefined,
    vote: typeof myLunchVote,
    responsesList: typeof lunchResponses
  ) => {
    const isLunch = type === 'lunch';
    const totalCount = responsesList.reduce((acc, curr) => acc + curr.totalCount, 0);
    const isVoted = vote !== undefined && vote !== null;
    const isLockedForMember = currentUser.role !== 'admin' && isVoted;

    return (
      <div
        className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all ${
          isLunch
            ? 'border-amber-200 dark:border-amber-900/60 hover:border-amber-400'
            : 'border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-400'
        }`}
      >
        <div>
          {/* Card Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className={`p-2.5 rounded-2xl ${
                  isLunch
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300'
                }`}
              >
                {isLunch ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-extrabold font-heading text-lg capitalize text-slate-900 dark:text-white">
                  {type} Poll
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Deadline:{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {poll ? poll.deadline : isLunch ? settings.defaultLunchDeadline : settings.defaultDinnerDeadline}
                  </span>
                </p>
              </div>
            </div>

            {/* Poll Open/Closed Badge & Admin Controls */}
            <div className="flex items-center gap-2">
              {poll ? (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    poll.isOpen
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                  }`}
                >
                  {poll.isOpen ? (
                    <>
                      <Unlock className="w-3 h-3" /> OPEN
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" /> CLOSED
                    </>
                  )}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  Not Created
                </span>
              )}

              {currentUser.role === 'admin' && poll && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(poll)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1 text-xs font-bold px-2.5"
                    title="Edit Poll Details"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-indigo-500" /> Edit
                  </button>
                  <button
                    onClick={() => togglePollStatus(poll.id)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    title={poll.isOpen ? 'Lock Poll' : 'Unlock Poll'}
                  >
                    {poll.isOpen ? <Lock className="w-4 h-4 text-rose-500" /> : <Unlock className="w-4 h-4 text-emerald-500" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Poll Description */}
          {poll ? (
            <div className="mb-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Today's Menu Item
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                {poll.description}
              </p>
            </div>
          ) : (
            <div className="mb-5 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                No menu poll has been posted for today's {type} yet.
              </p>
              <button
                onClick={() => openCreateModal(type)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 dark:shadow-none transition-all inline-flex items-center gap-1.5 uppercase tracking-wider"
              >
                <PlusCircle className="w-4 h-4" /> Create {type} Poll
              </button>
            </div>
          )}

          {/* Voting Controls (If Poll Exists) */}
          {poll && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Tiffin Quantity for Yourself:
                </span>
                {vote && vote.totalCount > 0 && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Voted: {vote.totalCount} tiffins
                  </span>
                )}
              </div>

              {/* Quantity Selectors */}
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((qty) => {
                  const isSelected = (vote?.quantity ?? null) === qty;
                  return (
                    <button
                      key={`poll-vote-${type}-${qty}`}
                      disabled={!poll.isOpen || isLockedForMember}
                      onClick={() => handleVote(poll, type, qty, vote?.guestCount || 0)}
                      className={`py-2.5 px-2 rounded-2xl border text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-0.5 ${
                        isSelected
                          ? isLunch
                            ? 'bg-amber-500 border-amber-600 text-white shadow-md'
                            : 'bg-indigo-600 border-indigo-700 text-white shadow-md'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-50'
                      }`}
                    >
                      <span>{qty === 0 ? 'Not Ordering' : `${qty} Tiffin${qty > 1 ? 's' : ''}`}</span>
                    </button>
                  );
                })}
              </div>

              {/* Guests Count Selector */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Guest Meals
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Extra tiffins for visitors
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={!poll.isOpen || isLockedForMember || (vote?.guestCount || 0) <= 0}
                    onClick={() =>
                      handleVote(
                        poll,
                        type,
                        vote?.quantity || 0,
                        Math.max(0, (vote?.guestCount || 0) - 1)
                      )
                    }
                    className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-sm font-extrabold w-6 text-center text-slate-900 dark:text-white">
                    {vote?.guestCount || 0}
                  </span>
                  <button
                    disabled={!poll.isOpen || isLockedForMember}
                    onClick={() =>
                      handleVote(poll, type, vote?.quantity || 0, (vote?.guestCount || 0) + 1)
                    }
                    className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Locked response notice for member */}
              {isVoted && currentUser.role !== 'admin' && (
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 p-2.5 rounded-xl flex items-center justify-center gap-1.5 mt-2">
                  <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  Your vote is recorded and locked. Only Flat Admin can edit responses.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Summary */}
        {poll && (
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-500" /> Total Orders:
            </span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              {totalCount} Tiffins ({responsesList.length} flatmates voted)
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold font-heading text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Daily Tiffin Polls
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Vote for today's lunch and dinner orders
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={() => changeDate(1)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Main Poll Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderPollCard('lunch', lunchPoll, myLunchVote, lunchResponses)}
        {renderPollCard('dinner', dinnerPoll, myDinnerVote, dinnerResponses)}
      </div>

      {/* Create / Edit Poll Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2 capitalize">
                {modalType === 'lunch' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                {editingPoll ? 'Edit' : 'Create'} {modalType} Poll for {selectedDate}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePoll} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Menu Items Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={modalDesc}
                  onChange={(e) => setModalDesc(e.target.value)}
                  placeholder="e.g. Paneer Butter Masala + Dal Tadka + 4 Butter Rotis + Steamed Rice"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Voting Cutoff Deadline *
                </label>
                <input
                  type="time"
                  required
                  value={modalDeadline}
                  onChange={(e) => setModalDeadline(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-colors"
                >
                  {editingPoll ? 'Save Changes' : 'Publish Poll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
