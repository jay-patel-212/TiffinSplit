export type Role = 'admin' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  active: boolean;
  avatarUrl?: string;
}

export type MealType = 'lunch' | 'dinner';

export interface MealPoll {
  id: string;
  date: string; // YYYY-MM-DD
  type: MealType;
  description: string;
  deadline: string; // HH:mm format, e.g. "11:00"
  isOpen: boolean;
  createdBy: string;
}

export interface MealResponse {
  id: string;
  pollId: string;
  date: string; // YYYY-MM-DD
  type: MealType;
  userId: string;
  userName: string;
  quantity: number; // 0, 1, 2, 3, etc.
  guestCount: number;
  totalCount: number; // quantity + guestCount
  updatedAt: string;
}

export interface MonthlyBill {
  id: string;
  month: string; // YYYY-MM
  totalAmount: number;
  totalMeals: number;
  costPerMeal: number;
  isPublished: boolean;
  createdAt: string;
  items: MemberBillItem[];
}

export interface MemberBillItem {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  totalMeals: number; // self + guests
  amount: number;
  paid: boolean;
  paidAt?: string;
  transactionId?: string;
}

export interface FlatSettings {
  flatName: string;
  upiId: string;
  payeeName: string;
  currency: string; // '₹', '$', '€', '£'
  defaultLunchDeadline: string; // "11:00"
  defaultDinnerDeadline: string; // "18:00"
  tiffinProviderName: string;
  tiffinProviderPhone: string;
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  emailServiceConfig?: {
    serviceId: string;
    templateId: string;
    publicKey: string;
  };
}

export interface PaymentReminderPayload {
  userName: string;
  userPhone?: string;
  userEmail: string;
  month: string;
  totalMeals: number;
  amount: number;
  upiId: string;
}
