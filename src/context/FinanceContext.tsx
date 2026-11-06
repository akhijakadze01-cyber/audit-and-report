import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Account,
  ActiveTab,
  Budget,
  Category,
  Currency,
  Language,
  RecurringPayment,
  SavingsGoal,
  Transaction,
} from '../types/finance';
import {
  INITIAL_ACCOUNTS,
  INITIAL_CATEGORIES,
  INITIAL_RECURRING,
  INITIAL_SAVINGS_GOALS,
  getInitialBudgets,
  getInitialTransactions,
} from '../data/initialData';
import { convertCurrency, getCurrentMonthPeriod, getTodayDateString } from '../utils/formatters';

interface FinanceContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  recurring: RecurringPayment[];

  // Calculation Helpers
  totalNetWorth: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlySavings: number;
  savingsRate: number;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;

  addAccount: (acc: Omit<Account, 'id'>) => void;
  updateAccount: (acc: Account) => void;
  deleteAccount: (id: string) => void;
  transferFunds: (fromAccountId: string, toAccountId: string, amount: number, note?: string) => void;

  setBudget: (categoryId: string, monthlyLimit: number) => void;
  deleteBudget: (id: string) => void;

  addGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  updateGoal: (goal: SavingsGoal) => void;
  depositToGoal: (goalId: string, amount: number, fromAccountId?: string) => void;
  deleteGoal: (id: string) => void;

  addRecurring: (rec: Omit<RecurringPayment, 'id'>) => void;
  toggleRecurringStatus: (id: string) => void;
  deleteRecurring: (id: string) => void;

  resetToDemo: () => void;
  exportJSON: () => void;
  exportCSV: () => void;
  importJSON: (jsonString: string) => boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEY = 'finansi_app_v1_store';

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [currency, setCurrency] = useState<Currency>('GEL');
  const [language, setLanguage] = useState<Language>('ka');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_accounts`);
      return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_categories`);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
      return saved ? JSON.parse(saved) : getInitialTransactions();
    } catch {
      return getInitialTransactions();
    }
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_budgets`);
      return saved ? JSON.parse(saved) : getInitialBudgets();
    } catch {
      return getInitialBudgets();
    }
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_goals`);
      return saved ? JSON.parse(saved) : INITIAL_SAVINGS_GOALS;
    } catch {
      return INITIAL_SAVINGS_GOALS;
    }
  });

  const [recurring, setRecurring] = useState<RecurringPayment[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_recurring`);
      return saved ? JSON.parse(saved) : INITIAL_RECURRING;
    } catch {
      return INITIAL_RECURRING;
    }
  });

  // Keep state synced with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_accounts`, JSON.stringify(accounts));
    } catch (e) {
      console.error(e);
    }
  }, [accounts]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_budgets`, JSON.stringify(budgets));
    } catch (e) {
      console.error(e);
    }
  }, [budgets]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_goals`, JSON.stringify(goals));
    } catch (e) {
      console.error(e);
    }
  }, [goals]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_recurring`, JSON.stringify(recurring));
    } catch (e) {
      console.error(e);
    }
  }, [recurring]);

  // Sync theme with HTML class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Aggregated calculations normalized to currently selected currency
  const totalNetWorth = useMemo(() => {
    return accounts.reduce((sum, acc) => {
      const converted = convertCurrency(acc.balance, acc.currency, currency);
      return sum + converted;
    }, 0);
  }, [accounts, currency]);

  const currentPeriod = getCurrentMonthPeriod();

  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(currentPeriod));
  }, [transactions, currentPeriod]);

  const monthlyIncome = useMemo(() => {
    return monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, currency), 0);
  }, [monthlyTransactions, currency]);

  const monthlyExpense = useMemo(() => {
    return monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, currency), 0);
  }, [monthlyTransactions, currency]);

  const monthlySavings = monthlyIncome - monthlyExpense;
  const savingsRate = monthlyIncome > 0 ? Math.max(0, (monthlySavings / monthlyIncome) * 100) : 0;

  // Actions
  const addTransaction = (txData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    setTransactions(prev => [newTx, ...prev]);

    // Update account balances
    setAccounts(prevAccounts => {
      return prevAccounts.map(acc => {
        if (newTx.type === 'income' && acc.id === newTx.accountId) {
          const addedAmount = convertCurrency(newTx.amount, newTx.currency, acc.currency);
          return { ...acc, balance: acc.balance + addedAmount };
        }
        if (newTx.type === 'expense' && acc.id === newTx.accountId) {
          const subtractedAmount = convertCurrency(newTx.amount, newTx.currency, acc.currency);
          return { ...acc, balance: acc.balance - subtractedAmount };
        }
        if (newTx.type === 'transfer') {
          if (acc.id === newTx.accountId) {
            const outAmount = convertCurrency(newTx.amount, newTx.currency, acc.currency);
            return { ...acc, balance: acc.balance - outAmount };
          }
          if (acc.id === newTx.toAccountId) {
            const inAmount = convertCurrency(newTx.amount, newTx.currency, acc.currency);
            return { ...acc, balance: acc.balance + inAmount };
          }
        }
        return acc;
      });
    });
  };

  const updateTransaction = (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(t => (t.id === updatedTx.id ? updatedTx : t)));
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    // Reverse balance effect
    setAccounts(prevAccounts => {
      return prevAccounts.map(acc => {
        if (tx.type === 'income' && acc.id === tx.accountId) {
          const reverted = convertCurrency(tx.amount, tx.currency, acc.currency);
          return { ...acc, balance: acc.balance - reverted };
        }
        if (tx.type === 'expense' && acc.id === tx.accountId) {
          const reverted = convertCurrency(tx.amount, tx.currency, acc.currency);
          return { ...acc, balance: acc.balance + reverted };
        }
        if (tx.type === 'transfer') {
          if (acc.id === tx.accountId) {
            const reverted = convertCurrency(tx.amount, tx.currency, acc.currency);
            return { ...acc, balance: acc.balance + reverted };
          }
          if (acc.id === tx.toAccountId) {
            const reverted = convertCurrency(tx.amount, tx.currency, acc.currency);
            return { ...acc, balance: acc.balance - reverted };
          }
        }
        return acc;
      });
    });

    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addAccount = (accData: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...accData,
      id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setAccounts(prev => [...prev, newAcc]);
  };

  const updateAccount = (updatedAcc: Account) => {
    setAccounts(prev => prev.map(a => (a.id === updatedAcc.id ? updatedAcc : a)));
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const transferFunds = (fromAccountId: string, toAccountId: string, amount: number, note?: string) => {
    const sourceAcc = accounts.find(a => a.id === fromAccountId);
    const destAcc = accounts.find(a => a.id === toAccountId);
    if (!sourceAcc || !destAcc || amount <= 0) return;

    const tx: Omit<Transaction, 'id'> = {
      date: getTodayDateString(),
      type: 'transfer',
      amount,
      currency: sourceAcc.currency,
      categoryId: 'cat-other-exp',
      accountId: fromAccountId,
      toAccountId: toAccountId,
      description: note || `გადარიცხვა: ${sourceAcc.name} → ${destAcc.name}`,
    };

    addTransaction(tx);
  };

  const setBudget = (categoryId: string, monthlyLimit: number) => {
    const period = getCurrentMonthPeriod();
    setBudgets(prev => {
      const existing = prev.find(b => b.categoryId === categoryId && b.period === period);
      if (existing) {
        return prev.map(b => (b.id === existing.id ? { ...b, monthlyLimit } : b));
      }
      return [
        ...prev,
        {
          id: `b-${Date.now()}`,
          categoryId,
          monthlyLimit,
          period,
        },
      ];
    });
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const addGoal = (goalData: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      currentAmount: 0,
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const updateGoal = (updatedGoal: SavingsGoal) => {
    setGoals(prev => prev.map(g => (g.id === updatedGoal.id ? updatedGoal : g)));
  };

  const depositToGoal = (goalId: string, amount: number, fromAccountId?: string) => {
    if (amount <= 0) return;
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          return { ...g, currentAmount: g.currentAmount + amount };
        }
        return g;
      })
    );

    if (fromAccountId) {
      const acc = accounts.find(a => a.id === fromAccountId);
      const goal = goals.find(g => g.id === goalId);
      if (acc && goal) {
        addTransaction({
          date: getTodayDateString(),
          type: 'expense',
          amount,
          currency: acc.currency,
          categoryId: 'cat-investments',
          accountId: fromAccountId,
          description: `დანაზოგი მიზნისთვის: ${goal.title}`,
          tags: ['დანაზოგი', goal.title],
        });
      }
    }
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const addRecurring = (recData: Omit<RecurringPayment, 'id'>) => {
    const newRec: RecurringPayment = {
      ...recData,
      id: `rec-${Date.now()}`,
    };
    setRecurring(prev => [...prev, newRec]);
  };

  const toggleRecurringStatus = (id: string) => {
    setRecurring(prev =>
      prev.map(r => (r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r))
    );
  };

  const deleteRecurring = (id: string) => {
    setRecurring(prev => prev.filter(r => r.id !== id));
  };

  const resetToDemo = () => {
    setAccounts(INITIAL_ACCOUNTS);
    setCategories(INITIAL_CATEGORIES);
    setTransactions(getInitialTransactions());
    setBudgets(getInitialBudgets());
    setGoals(INITIAL_SAVINGS_GOALS);
    setRecurring(INITIAL_RECURRING);
    setCurrency('GEL');
  };

  const exportJSON = () => {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      accounts,
      transactions,
      budgets,
      goals,
      recurring,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finansi-backup-${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Amount', 'Currency', 'Category', 'Account', 'Description'];
    const rows = transactions.map(t => {
      const cat = categories.find(c => c.id === t.categoryId)?.name || t.categoryId;
      const acc = accounts.find(a => a.id === t.accountId)?.name || t.accountId;
      return [
        t.id,
        t.date,
        t.type,
        t.amount,
        t.currency,
        `"${cat.replace(/"/g, '""')}"`,
        `"${acc.replace(/"/g, '""')}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n'); // with UTF-8 BOM for Excel Georgian support
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finansi-transactions-${getTodayDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.accounts && Array.isArray(parsed.accounts)) setAccounts(parsed.accounts);
      if (parsed.transactions && Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
      if (parsed.budgets && Array.isArray(parsed.budgets)) setBudgets(parsed.budgets);
      if (parsed.goals && Array.isArray(parsed.goals)) setGoals(parsed.goals);
      if (parsed.recurring && Array.isArray(parsed.recurring)) setRecurring(parsed.recurring);
      return true;
    } catch (err) {
      console.error('Import failed', err);
      return false;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currency,
        setCurrency,
        language,
        setLanguage,
        theme,
        toggleTheme,
        accounts,
        categories,
        transactions,
        budgets,
        goals,
        recurring,
        totalNetWorth,
        monthlyIncome,
        monthlyExpense,
        monthlySavings,
        savingsRate,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        transferFunds,
        setBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        depositToGoal,
        deleteGoal,
        addRecurring,
        toggleRecurringStatus,
        deleteRecurring,
        resetToDemo,
        exportJSON,
        exportCSV,
        importJSON,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
