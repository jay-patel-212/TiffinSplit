import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, MealPoll, MealResponse, MonthlyBill, FlatSettings, MealType } from '../types';
import { LocalStorageManager } from '../services/storage';
import {
  auth,
  db,
  rtdb,
  ref,
  set as setRtdb,
  onValue,
  remove as removeRtdb,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  onAuthStateChanged,
  firebaseSignOut,
  FirebaseUser,
} from '../services/firebase';

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
  firebaseUser: FirebaseUser | null;
  authLoading: boolean;
  logout: () => Promise<void>;
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
  clearDemoData: () => void;
  loginDirectly: (user: User) => void;
  // Helper
  getTodayResponses: () => MealResponse[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Utility to remove undefined fields recursively so Firestore setDoc does not throw errors
function sanitizeForFirebase<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirebase(item)) as unknown as T;
  }

  const cleanObj: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      cleanObj[key] = sanitizeForFirebase(val);
    }
  }
  return cleanObj as T;
}

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
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Subscribe to Firebase Auth state
  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);

      if (user && user.email) {
        const normalizedEmail = user.email.toLowerCase();
        const isAdminEmail = normalizedEmail === 'jay.patel.mantratec@gmail.com';

        // Sync logged-in Firebase user with local flatmate user profile if found
        const existingUsers = LocalStorageManager.getUsers();
        const matchedIndex = existingUsers.findIndex(
          (u) => u.email.toLowerCase() === normalizedEmail
        );

        if (matchedIndex !== -1) {
          const matched = { ...existingUsers[matchedIndex] };
          if (isAdminEmail) {
            matched.role = 'admin';
          }
          if (user.displayName && matched.name !== user.displayName) {
            matched.name = user.displayName;
          }
          existingUsers[matchedIndex] = matched;
          setUsers(existingUsers);
          LocalStorageManager.setUsers(existingUsers);

          setCurrentUser(matched);
          LocalStorageManager.setCurrentUser(matched);
        } else {
          // Create or set a dynamic user for this Firebase email
          const newUser: User = {
            id: user.uid,
            name: user.displayName || user.email.split('@')[0] || 'Flatmate',
            email: user.email,
            role: isAdminEmail ? 'admin' : 'member',
            active: true,
            avatarUrl: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`,
          };
          setCurrentUser(newUser);
          LocalStorageManager.setCurrentUser(newUser);

          // Add to flatmate list if not present
          if (!existingUsers.some((u) => u.id === newUser.id)) {
            const updated = [newUser, ...existingUsers];
            setUsers(updated);
            LocalStorageManager.setUsers(updated);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loginDirectly = (user: User) => {
    const dummyFirebaseUser = {
      uid: user.id,
      email: user.email,
      displayName: user.name,
      photoURL: user.avatarUrl,
    } as FirebaseUser;
    setFirebaseUser(dummyFirebaseUser);
    setCurrentUser(user);
    LocalStorageManager.setCurrentUser(user);
    showToast(`Signed in directly as ${user.name} (${user.role.toUpperCase()})`, 'success');
  };

  const logout = async () => {
    try {
      if (auth) {
        await firebaseSignOut(auth);
      }
      setFirebaseUser(null);
      showToast('Successfully logged out of TiffinSplit', 'info');
    } catch (err) {
      console.error('Error logging out:', err);
      showToast('Failed to log out', 'error');
    }
  };

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

  // Subscribe to Realtime Database (or Firestore as fallback) for live multi-user sync
  useEffect(() => {
    let unsubUsers = () => {};
    let unsubPolls = () => {};
    let unsubResponses = () => {};
    let unsubBills = () => {};
    let unsubSettings = () => {};

    if (rtdb) {
      // Primary: Realtime Database subscriptions
      unsubUsers = onValue(
        ref(rtdb, 'users'),
        (snapshot) => {
          const val = snapshot.val();
          const list = val ? (Object.values(val) as User[]) : [];
          setUsers(list);
          LocalStorageManager.setUsers(list);
        },
        (err) => console.log('RTDB users sync error:', err)
      );

      unsubPolls = onValue(
        ref(rtdb, 'polls'),
        (snapshot) => {
          const val = snapshot.val();
          const list = val ? (Object.values(val) as MealPoll[]) : [];
          setPolls(list);
          LocalStorageManager.setPolls(list);
        },
        (err) => console.log('RTDB polls sync error:', err)
      );

      unsubResponses = onValue(
        ref(rtdb, 'responses'),
        (snapshot) => {
          const val = snapshot.val();
          const list = val ? (Object.values(val) as MealResponse[]) : [];
          setResponses(list);
          LocalStorageManager.setResponses(list);
        },
        (err) => console.log('RTDB responses sync error:', err)
      );

      unsubBills = onValue(
        ref(rtdb, 'bills'),
        (snapshot) => {
          const val = snapshot.val();
          const list = val ? (Object.values(val) as MonthlyBill[]) : [];
          setBills(list);
          LocalStorageManager.setBills(list);
        },
        (err) => console.log('RTDB bills sync error:', err)
      );

      unsubSettings = onValue(
        ref(rtdb, 'settings/config'),
        (snapshot) => {
          const val = snapshot.val();
          if (val) {
            setSettings(val as FlatSettings);
            LocalStorageManager.setSettings(val as FlatSettings);
          }
        },
        (err) => console.log('RTDB settings sync error:', err)
      );
    } else if (db) {
      // Fallback: Firestore subscriptions
      unsubUsers = onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          const firestoreUsers = snapshot.docs.map((doc) => doc.data() as User);
          setUsers(firestoreUsers);
          LocalStorageManager.setUsers(firestoreUsers);
        },
        (err) => console.log('Firestore users sync error:', err)
      );

      unsubPolls = onSnapshot(
        collection(db, 'polls'),
        (snapshot) => {
          const firestorePolls = snapshot.docs.map((doc) => doc.data() as MealPoll);
          setPolls(firestorePolls);
          LocalStorageManager.setPolls(firestorePolls);
        },
        (err) => console.log('Firestore polls sync error:', err)
      );

      unsubResponses = onSnapshot(
        collection(db, 'responses'),
        (snapshot) => {
          const firestoreResponses = snapshot.docs.map((doc) => doc.data() as MealResponse);
          setResponses(firestoreResponses);
          LocalStorageManager.setResponses(firestoreResponses);
        },
        (err) => console.log('Firestore responses sync error:', err)
      );

      unsubBills = onSnapshot(
        collection(db, 'bills'),
        (snapshot) => {
          const firestoreBills = snapshot.docs.map((doc) => doc.data() as MonthlyBill);
          setBills(firestoreBills);
          LocalStorageManager.setBills(firestoreBills);
        },
        (err) => console.log('Firestore bills sync error:', err)
      );

      unsubSettings = onSnapshot(
        collection(db, 'settings'),
        (snapshot) => {
          if (!snapshot.empty) {
            const docData = snapshot.docs[0].data() as FlatSettings;
            setSettings(docData);
            LocalStorageManager.setSettings(docData);
          }
        },
        (err) => console.log('Firestore settings sync error:', err)
      );
    }

    return () => {
      unsubUsers();
      unsubPolls();
      unsubResponses();
      unsubBills();
      unsubSettings();
    };
  }, []);

  const addUser = (user: Omit<User, 'id'>) => {
    const newUser: User = { ...user, id: `u-${Date.now()}` };
    const updated = [...users, newUser];
    setUsers(updated);
    LocalStorageManager.setUsers(updated);
    const sanitized = sanitizeForFirebase(newUser);
    if (db) {
      setDoc(doc(db, 'users', newUser.id), sanitized).catch((err) =>
        console.error('Firestore addUser error:', err)
      );
    }
    if (rtdb) {
      setRtdb(ref(rtdb, `users/${newUser.id}`), sanitized).catch((err) =>
        console.error('RTDB addUser error:', err)
      );
    }
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
    const sanitized = sanitizeForFirebase(user);
    if (db) {
      setDoc(doc(db, 'users', user.id), sanitized).catch((err) =>
        console.error('Firestore updateUser error:', err)
      );
    }
    if (rtdb) {
      setRtdb(ref(rtdb, `users/${user.id}`), sanitized).catch((err) =>
        console.error('RTDB updateUser error:', err)
      );
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

    if (currentUser?.id === id && updated.length > 0) {
      setCurrentUser(updated[0]);
      LocalStorageManager.setCurrentUser(updated[0]);
    }

    if (db) {
      deleteDoc(doc(db, 'users', id)).catch((err) =>
        console.error('Firestore deleteUser error:', err)
      );
    }
    if (rtdb) {
      removeRtdb(ref(rtdb, `users/${id}`)).catch((err) =>
        console.error('RTDB deleteUser error:', err)
      );
    }
    showToast(`Removed member ${target?.name || ''}`, 'info');
  };

  const createPoll = (pollData: Omit<MealPoll, 'id'>) => {
    const newPoll: MealPoll = {
      ...pollData,
      id: `poll-${pollData.date}-${pollData.type}-${Date.now()}`,
    };
    const updated = [newPoll, ...polls];
    setPolls(updated);
    LocalStorageManager.setPolls(updated);
    const sanitized = sanitizeForFirebase(newPoll);
    if (db) {
      setDoc(doc(db, 'polls', newPoll.id), sanitized).catch((err) =>
        console.error('Firestore createPoll error:', err)
      );
    }
    if (rtdb) {
      setRtdb(ref(rtdb, `polls/${newPoll.id}`), sanitized).catch((err) =>
        console.error('RTDB createPoll error:', err)
      );
    }
    showToast(`Created ${pollData.type.toUpperCase()} poll for ${pollData.date}`, 'success');
  };

  const updatePoll = (poll: MealPoll) => {
    const updated = polls.map((p) => (p.id === poll.id ? poll : p));
    setPolls(updated);
    LocalStorageManager.setPolls(updated);
    const sanitized = sanitizeForFirebase(poll);
    if (db) {
      setDoc(doc(db, 'polls', poll.id), sanitized).catch((err) =>
        console.error('Firestore updatePoll error:', err)
      );
    }
    if (rtdb) {
      setRtdb(ref(rtdb, `polls/${poll.id}`), sanitized).catch((err) =>
        console.error('RTDB updatePoll error:', err)
      );
    }
    showToast(`Poll updated`, 'success');
  };

  const togglePollStatus = (id: string) => {
    const updated = polls.map((p) => (p.id === id ? { ...p, isOpen: !p.isOpen } : p));
    setPolls(updated);
    LocalStorageManager.setPolls(updated);
    const target = updated.find((p) => p.id === id);
    if (target) {
      const sanitized = sanitizeForFirebase(target);
      if (db) {
        setDoc(doc(db, 'polls', target.id), sanitized).catch((err) =>
          console.error('Firestore togglePollStatus error:', err)
        );
      }
      if (rtdb) {
        setRtdb(ref(rtdb, `polls/${target.id}`), sanitized).catch((err) =>
          console.error('RTDB togglePollStatus error:', err)
        );
      }
    }
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
    const sanitized = sanitizeForFirebase(responsePayload);
    if (db) {
      setDoc(doc(db, 'responses', responsePayload.id), sanitized).catch((err) =>
        console.error('Firestore submitMealResponse error:', err)
      );
    }
    if (rtdb) {
      setRtdb(ref(rtdb, `responses/${responsePayload.id}`), sanitized).catch((err) =>
        console.error('RTDB submitMealResponse error:', err)
      );
    }

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
    const sanitized = sanitizeForFirebase(newBill);
    if (db) {
      setDoc(doc(db, 'bills', newBill.id), sanitized).catch((err) =>
        console.error('Firestore generateMonthlyBill error:', err)
      );
    }
    if (rtdb) {
      setRtdb(ref(rtdb, `bills/${newBill.id}`), sanitized).catch((err) =>
        console.error('RTDB generateMonthlyBill error:', err)
      );
    }
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
    const updatedBill = updated.find((b) => b.id === billId);
    if (updatedBill) {
      const sanitized = sanitizeForFirebase(updatedBill);
      if (db) {
        setDoc(doc(db, 'bills', updatedBill.id), sanitized).catch((err) =>
          console.error('Firestore markPaymentStatus error:', err)
        );
      }
      if (rtdb) {
        setRtdb(ref(rtdb, `bills/${updatedBill.id}`), sanitized).catch((err) =>
          console.error('RTDB markPaymentStatus error:', err)
        );
      }
    }
    showToast(`Payment status updated to ${paid ? 'PAID' : 'PENDING'}`, paid ? 'success' : 'info');
  };

  const updateSettings = (newSettings: FlatSettings) => {
    setSettings(newSettings);
    LocalStorageManager.setSettings(newSettings);
    const sanitized = sanitizeForFirebase(newSettings);
    if (db) {
      setDoc(doc(db, 'settings', 'config'), sanitized).catch((err) =>
        console.error('Firestore updateSettings error:', err)
      );
    }
    if (rtdb) {
      setRtdb(ref(rtdb, 'settings/config'), sanitized).catch((err) =>
        console.error('RTDB updateSettings error:', err)
      );
    }
    showToast('Flat & payment settings saved!', 'success');
  };

  const clearDemoData = () => {
    LocalStorageManager.clearDemoData();
    const oldPolls = [...polls];
    const oldResponses = [...responses];
    const oldBills = [...bills];

    setPolls([]);
    setResponses([]);
    setBills([]);

    if (db) {
      oldPolls.forEach((p) => deleteDoc(doc(db, 'polls', p.id)).catch(() => {}));
      oldResponses.forEach((r) => deleteDoc(doc(db, 'responses', r.id)).catch(() => {}));
      oldBills.forEach((b) => deleteDoc(doc(db, 'bills', b.id)).catch(() => {}));
    }

    if (rtdb) {
      removeRtdb(ref(rtdb, 'polls')).catch(() => {});
      removeRtdb(ref(rtdb, 'responses')).catch(() => {});
      removeRtdb(ref(rtdb, 'bills')).catch(() => {});
    }

    showToast('All previous demo data cleared! Saved live in Firebase Cloud.', 'success');
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
        firebaseUser,
        authLoading,
        logout,
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
        clearDemoData,
        loginDirectly,
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
