import { User, MealPoll, MealResponse, MonthlyBill, FlatSettings } from '../types';

const STORAGE_KEYS = {
  USERS: 'flat_meal_users',
  POLLS: 'flat_meal_polls',
  RESPONSES: 'flat_meal_responses',
  BILLS: 'flat_meal_bills',
  SETTINGS: 'flat_meal_settings',
  CURRENT_USER: 'flat_meal_current_user',
  THEME: 'flat_meal_theme',
};

const getTodayString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getPreviousMonthString = (): string => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const INITIAL_USERS: User[] = [
  {
    id: 'u-jay',
    name: 'Jay Patel',
    email: 'jay.patel.mantratec@gmail.com',
    phone: '+91 98765 43210',
    role: 'admin',
    active: true,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-1',
    name: 'Rahul Sharma',
    email: 'rahul.admin@flat302.com',
    phone: '+91 98765 43210',
    role: 'member',
    active: true,
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-2',
    name: 'Amit Patel',
    email: 'amit.p@gmail.com',
    phone: '+91 98123 45678',
    role: 'member',
    active: true,
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-3',
    name: 'Neha Verma',
    email: 'neha.v@gmail.com',
    phone: '+91 98987 65432',
    role: 'member',
    active: true,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-4',
    name: 'Vikram Singh',
    email: 'vikram.s@outlook.com',
    phone: '+91 97654 32109',
    role: 'member',
    active: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-5',
    name: 'Priya Nair',
    email: 'priya.n@gmail.com',
    phone: '+91 96543 21098',
    role: 'member',
    active: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
];

const INITIAL_SETTINGS: FlatSettings = {
  flatName: 'Flat 302 Sunshine Heights',
  upiId: 'flatowner@upi',
  payeeName: 'Rahul Sharma',
  currency: '₹',
  defaultLunchDeadline: '11:00',
  defaultDinnerDeadline: '18:00',
  tiffinProviderName: 'Annapurna Gourmet Tiffin Service',
  tiffinProviderPhone: '+91 98000 11223',
  firebaseConfig: {
    apiKey: "AIzaSyAJnNzgbQ6Ja8PfHKDLVnkTX0TlELTb0aw",
    authDomain: "tiffin-split.firebaseapp.com",
    projectId: "tiffin-split",
    storageBucket: "tiffin-split.firebasestorage.app",
    messagingSenderId: "Y233181210866",
    appId: "1:233181210866:web:802ba0a33768e39783c86b",
  },
};

const today = getTodayString();
const prevMonth = getPreviousMonthString();

const INITIAL_POLLS: MealPoll[] = [
  {
    id: `poll-${today}-lunch`,
    date: today,
    type: 'lunch',
    description: 'Paneer Butter Masala + Dal Tadka + 4 Butter Rotis + Steamed Basmati Rice + Salad',
    deadline: '11:00',
    isOpen: true,
    createdBy: 'u-1',
  },
  {
    id: `poll-${today}-dinner`,
    date: today,
    type: 'dinner',
    description: 'Sev Tamatar Sabji + Yellow Dal + 4 Chapatis + Jeera Rice + Pickle',
    deadline: '18:00',
    isOpen: true,
    createdBy: 'u-1',
  },
];

const INITIAL_RESPONSES: MealResponse[] = [
  {
    id: `resp-1`,
    pollId: `poll-${today}-lunch`,
    date: today,
    type: 'lunch',
    userId: 'u-1',
    userName: 'Rahul Sharma',
    quantity: 1,
    guestCount: 1,
    totalCount: 2,
    updatedAt: new Date().toISOString(),
  },
  {
    id: `resp-2`,
    pollId: `poll-${today}-lunch`,
    date: today,
    type: 'lunch',
    userId: 'u-2',
    userName: 'Amit Patel',
    quantity: 1,
    guestCount: 0,
    totalCount: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: `resp-3`,
    pollId: `poll-${today}-lunch`,
    date: today,
    type: 'lunch',
    userId: 'u-3',
    userName: 'Neha Verma',
    quantity: 2,
    guestCount: 0,
    totalCount: 2,
    updatedAt: new Date().toISOString(),
  },
  {
    id: `resp-4`,
    pollId: `poll-${today}-dinner`,
    date: today,
    type: 'dinner',
    userId: 'u-2',
    userName: 'Amit Patel',
    quantity: 1,
    guestCount: 1,
    totalCount: 2,
    updatedAt: new Date().toISOString(),
  },
  {
    id: `resp-5`,
    pollId: `poll-${today}-dinner`,
    date: today,
    type: 'dinner',
    userId: 'u-4',
    userName: 'Vikram Singh',
    quantity: 1,
    guestCount: 0,
    totalCount: 1,
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_BILLS: MonthlyBill[] = [
  {
    id: `bill-${prevMonth}`,
    month: prevMonth,
    totalAmount: 14500,
    totalMeals: 125,
    costPerMeal: 116,
    isPublished: true,
    createdAt: new Date().toISOString(),
    items: [
      {
        userId: 'u-1',
        userName: 'Rahul Sharma',
        userEmail: 'rahul.admin@flat302.com',
        userPhone: '+91 98765 43210',
        totalMeals: 35,
        amount: 4060,
        paid: true,
        paidAt: new Date().toISOString(),
        transactionId: 'UPI/4029102931/GPay',
      },
      {
        userId: 'u-2',
        userName: 'Amit Patel',
        userEmail: 'amit.p@gmail.com',
        userPhone: '+91 98123 45678',
        totalMeals: 28,
        amount: 3248,
        paid: false,
      },
      {
        userId: 'u-3',
        userName: 'Neha Verma',
        userEmail: 'neha.v@gmail.com',
        userPhone: '+91 98987 65432',
        totalMeals: 32,
        amount: 3712,
        paid: true,
        paidAt: new Date().toISOString(),
        transactionId: 'UPI/3910291082/PhonePe',
      },
      {
        userId: 'u-4',
        userName: 'Vikram Singh',
        userEmail: 'vikram.s@outlook.com',
        userPhone: '+91 97654 32109',
        totalMeals: 18,
        amount: 2088,
        paid: false,
      },
      {
        userId: 'u-5',
        userName: 'Priya Nair',
        userEmail: 'priya.n@gmail.com',
        userPhone: '+91 96543 21098',
        totalMeals: 12,
        amount: 1392,
        paid: false,
      },
    ],
  },
];

export class LocalStorageManager {
  static getUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      this.setUsers(INITIAL_USERS);
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_USERS;
    }
  }

  static setUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  static getPolls(): MealPoll[] {
    const data = localStorage.getItem(STORAGE_KEYS.POLLS);
    if (data === null) {
      if (localStorage.getItem('flat_meal_cleared') === 'true') {
        return [];
      }
      this.setPolls(INITIAL_POLLS);
      return INITIAL_POLLS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static setPolls(polls: MealPoll[]): void {
    localStorage.setItem(STORAGE_KEYS.POLLS, JSON.stringify(polls));
  }

  static getResponses(): MealResponse[] {
    const data = localStorage.getItem(STORAGE_KEYS.RESPONSES);
    if (data === null) {
      if (localStorage.getItem('flat_meal_cleared') === 'true') {
        return [];
      }
      this.setResponses(INITIAL_RESPONSES);
      return INITIAL_RESPONSES;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static setResponses(responses: MealResponse[]): void {
    localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses));
  }

  static getBills(): MonthlyBill[] {
    const data = localStorage.getItem(STORAGE_KEYS.BILLS);
    if (data === null) {
      if (localStorage.getItem('flat_meal_cleared') === 'true') {
        return [];
      }
      this.setBills(INITIAL_BILLS);
      return INITIAL_BILLS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static setBills(bills: MonthlyBill[]): void {
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
  }

  static clearDemoData(): void {
    localStorage.setItem(STORAGE_KEYS.POLLS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify([]));
    localStorage.setItem('flat_meal_cleared', 'true');
  }

  static getSettings(): FlatSettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) {
      this.setSettings(INITIAL_SETTINGS);
      return INITIAL_SETTINGS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  static setSettings(settings: FlatSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  static getCurrentUser(): User {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    const users = this.getUsers();
    if (!data) {
      const admin = users.find((u) => u.role === 'admin') || users[0];
      this.setCurrentUser(admin);
      return admin;
    }
    try {
      const parsed = JSON.parse(data);
      const matched = users.find((u) => u.id === parsed.id);
      return matched || users[0];
    } catch {
      return users[0];
    }
  }

  static setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  static getToday(): string {
    return getTodayString();
  }
}
