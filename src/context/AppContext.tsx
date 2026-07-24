import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, MealPoll, MealResponse, MonthlyBill, FlatSettings, MealType } from '../types';
import { LocalStorageManager } from '../services/storage';

export type ActiveTab =
  | 'dashboard'
  | 'polls'
  | 'orders'
  | 'members'
  | 'bills'
  | 'payments'
  | 'reports'
  | 'settings'
  | 'profile';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  currentUser: User;
  users: User[];
  polls: MealPoll[];
  responses: MealResponse[];
  bills: MonthlyBill[];
  settings: FlatSettings;
  activeTab: ActiveTab;
  isDarkMode: boolean;
  toasts: Toast[];
  setActiveTab: (tab: ActiveTab) => void;
  setCurrentUser: (user: User) => void;
  toggleDarkMode: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  // User Operations
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  // Poll Operations
  createPoll: (poll: Omit<MealPoll, 'id'>) => void;
  updatePoll: (poll: MealPoll) => void;
  togglePollStatus: (id: string) => void;
  // Response Operations
  submitMealResponse: (pollId: string, type: MealType, quantity: number, guestCount: number) => void;
  // Bill Operations
  generateMonthlyBill: (month: string, totalAmount: number) => void;
  markPaymentStatus: (billId: string, userId: string, paid: boolean, transactionId?: string) => void;
  // Settings Operations
  updateSettings: (newSettings: FlatSettings) => void;
  // Helper
  getTodayResponses: () => MealResponse[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => LocalStorageManager.getCurrentUser());
  const [users, setUsers] = useState<User[]>(() => LocalStorageManager.getUsers());
  const [polls, setPolls] = useState<MealPoll[]>(() => LocalStorageManager.getPolls());
  const [responses, setResponses] = useState<MealResponse[]>(() => LocalStorageManager.getResponses());
  const [bills, setBills] = useState<MonthlyBill[]>(() => LocalStorageManager.getBills());
  const [settings, setSettings] = useState<FlatSettings>(() => LocalStorageManager.getSettings());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('flat_meal_theme') === 'dark';
  });
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Apply dark class to document html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('flat_meal_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('flat_meal_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Synchronize state with LocalStorage
  const handleSetCurrentUser = (user: User) => {
    setCurrentUser(user);
    LocalStorageManager.setCurrentUser(user);
    showToast(`Switched account to ${user.name}`, 'info');
  };

  const addUser = (user: Omit<User, 'id'>) => {
    const newUser: User = { ...user, id: `u-${Date.now()}` };
    const updated = [...users, newUser];
    setUsers(updated);
    LocalStorageManager.setUsers(updated);
    showToast(`Added member ${newUser.name}`, 'success');
  };

  const updateUser = (user: User) => {
    const updated = users.map((u) => (u.id === user.id ? user : u));
    setUsers(updated);
    LocalStorageManager.setUsers(updated);
    if (currentUser.id === user.id) {
      setCurrentUser(user);
      LocalStorageManager.setCurrentUser(user);
    }
    showToast(`Updated ${user.name}`, 'success');
  };

  const deleteUser = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (target?.role === 'admin' && users.filter((u) => u.role === 'admin').length === 1) {
      showToast('Cannot delete the only admin member!', 'error');
      return;
    }
    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    LocalStorageManager.setUsers(updated);
    showToast(`Removed member`, 'info');
  };

  const createPoll = (pollData: Omit<MealPoll, 'id'>) => {
    const newPoll: MealPoll = {
      ...pollData,
      id: `poll-${pollData.date}-${pollData.type}-${Date.now()}`,
    };
    const updated = [newPoll, ...polls];
    setPolls(updated);
    LocalStorageManager.setPolls(updated);
    showToast(`Created ${pollData.type.toUpperCase()} poll for ${pollData.date}`, 'success');
  };

  const updatePoll = (poll: MealPoll) => {
    const updated = polls.map((p) => (p.id === poll.id ? poll : p));
    setPolls(updated);
    LocalStorageManager.setPolls(updated);
    showToast(`Poll updated`, 'success');
  };

  const togglePollStatus = (id: string) => {
    const updated = polls.map((p) => (p.id === id ? { ...p, isOpen: !p.isOpen } : p));
    setPolls(updated);
    LocalStorageManager.setPolls(updated);
    const target = updated.find((p) => p.id === id);
    showToast(`Poll marked as ${target?.isOpen ? 'OPEN' : 'CLOSED'}`, 'info');
  };

  const submitMealResponse = (pollId: string, type: MealType, quantity: number, guestCount: number) => {
    const today = LocalStorageManager.getToday();
    const poll = polls.find((p) => p.id === pollId);
    const pollDate = poll ? poll.date : today;

    const existingIndex = responses.findIndex(
      (r) => r.pollId === pollId && r.userId === currentUser.id
    );

    const totalCount = quantity + guestCount;
    const responsePayload: MealResponse = {
      id: existingIndex >= 0 ? responses[existingIndex].id : `resp-${Date.now()}`,
      pollId,
      date: pollDate,
      type,
      userId: currentUser.id,
      userName: currentUser.name,
      quantity,
      guestCount,
      totalCount,
      updatedAt: new Date().toISOString(),
    };

    let updatedResponses: MealResponse[];
    if (existingIndex >= 0) {
      updatedResponses = [...responses];
      updatedResponses[existingIndex] = responsePayload;
    } else {
      updatedResponses = [...responses, responsePayload];
    }

    setResponses(updatedResponses);
    LocalStorageManager.setResponses(updatedResponses);

    const actionText = totalCount > 0 ? `Voted ${totalCount} tiffin(s) for ${type}` : `Opted OUT for ${type}`;
    showToast(actionText, 'success');
  };

  const generateMonthlyBill = (month: string, totalAmount: number) => {
    // Sum meals for the given YYYY-MM
    let totalMealsCount = 0;
    const memberMealsMap: Record<string, number> = {};

    users.forEach((u) => {
      memberMealsMap[u.id] = 0;
    });

    responses.forEach((r) => {
      if (r.date.startsWith(month)) {
        memberMealsMap[r.userId] = (memberMealsMap[r.userId] || 0) + r.totalCount;
        totalMealsCount += r.totalCount;
      }
    });

    if (totalMealsCount === 0) {
      showToast(`No meal votes found for ${month}. Please make sure responses exist.`, 'error');
      return;
    }

    const costPerMeal = totalAmount / totalMealsCount;

    const billItems = users
      .filter((u) => u.active)
      .map((u) => {
        const userMeals = memberMealsMap[u.id] || 0;
        const amount = Math.round(userMeals * costPerMeal);
        return {
          userId: u.id,
          userName: u.name,
          userEmail: u.email,
          userPhone: u.phone,
          totalMeals: userMeals,
          amount,
          paid: false,
        };
      });

    const existingBillIndex = bills.findIndex((b) => b.month === month);
    const newBill: MonthlyBill = {
      id: existingBillIndex >= 0 ? bills[existingBillIndex].id : `bill-${month}`,
      month,
      totalAmount,
      totalMeals: totalMealsCount,
      costPerMeal,
      isPublished: true,
      createdAt: new Date().toISOString(),
      items: billItems,
    };

    let updatedBills: MonthlyBill[];
    if (existingBillIndex >= 0) {
      updatedBills = [...bills];
      updatedBills[existingBillIndex] = newBill;
    } else {
      updatedBills = [newBill, ...bills];
    }

    setBills(updatedBills);
    LocalStorageManager.setBills(updatedBills);
    showToast(`Generated & published bill for ${month}!`, 'success');
  };

  const markPaymentStatus = (billId: string, userId: string, paid: boolean, transactionId?: string) => {
    const updated = bills.map((b) => {
      if (b.id !== billId) return b;
      const updatedItems = b.items.map((item) => {
        if (item.userId !== userId) return item;
        return {
          ...item,
          paid,
          paidAt: paid ? new Date().toISOString() : undefined,
          transactionId: paid ? transactionId || `UPI/${Date.now().toString().slice(-8)}` : undefined,
        };
      });
      return { ...b, items: updatedItems };
    });

    setBills(updated);
    LocalStorageManager.setBills(updated);
    showToast(`Payment status updated to ${paid ? 'PAID' : 'PENDING'}`, paid ? 'success' : 'info');
  };

  const updateSettings = (newSettings: FlatSettings) => {
    setSettings(newSettings);
    LocalStorageManager.setSettings(newSettings);
    showToast('Flat & payment settings saved!', 'success');
  };

  const getTodayResponses = () => {
    const today = LocalStorageManager.getToday();
    return responses.filter((r) => r.date === today);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        polls,
        responses,
        bills,
        settings,
        activeTab,
        isDarkMode,
        toasts,
        setActiveTab,
        setCurrentUser: handleSetCurrentUser,
        toggleDarkMode,
        showToast,
        addUser,
        updateUser,
        deleteUser,
        createPoll,
        updatePoll,
        togglePollStatus,
        submitMealResponse,
        generateMonthlyBill,
        markPaymentStatus,
        updateSettings,
        getTodayResponses,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
