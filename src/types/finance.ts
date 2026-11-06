export type Currency = 'GEL' | 'USD' | 'EUR' | 'GBP';

export type Language = 'ka' | 'en';

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

export type AccountType = 'bank' | 'cash' | 'savings' | 'investment';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: Currency;
  color: string;
  bankName?: string;
  accountNumber?: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  amount: number;
  currency: Currency;
  categoryId: string;
  accountId: string;
  toAccountId?: string; // used when type === 'transfer'
  description: string;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
}

export interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: number;
  period: string; // YYYY-MM
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  color: string;
  icon?: string;
  notes?: string;
}

export interface RecurringPayment {
  id: string;
  title: string;
  amount: number;
  currency: Currency;
  frequency: 'monthly' | 'yearly' | 'weekly';
  categoryId: string;
  accountId: string;
  nextDueDate: string;
  status: 'active' | 'paused';
}

export type ActiveTab = 
  | 'overview' 
  | 'transactions' 
  | 'budgets' 
  | 'accounts' 
  | 'goals' 
  | 'subscriptions' 
  | 'calculators';
