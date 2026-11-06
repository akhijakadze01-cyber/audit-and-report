import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Plus, RotateCw, Trash2, Calendar, CheckCircle2, PauseCircle } from 'lucide-react';
import { Currency } from '../types/finance';

export const SubscriptionsView: React.FC = () => {
  const {
    recurring,
    categories,
    accounts,
    currency,
    deleteRecurring,
    toggleRecurringStatus,
    addRecurring,
    language,
  } = useFinance();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [subCurrency, setSubCurrency] = useState<Currency>('GEL');
  const [frequency, setFrequency] = useState<'monthly' | 'yearly' | 'weekly'>('monthly');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [nextDueDate, setNextDueDate] = useState('');

  const activeSubscriptions = recurring.filter(r => r.status === 'active');
  const totalMonthlyCommitment = activeSubscriptions.reduce((sum, r) => {
    let monthlyAmount = r.amount;
    if (r.frequency === 'yearly') monthlyAmount = r.amount / 12;
    if (r.frequency === 'weekly') monthlyAmount = r.amount * 4.33;
    return sum + monthlyAmount;
  }, 0);

  const totalYearlyCommitment = totalMonthlyCommitment * 12;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!title.trim() || isNaN(num) || num <= 0) return;

    addRecurring({
      title: title.trim(),
      amount: num,
      currency: subCurrency,
      frequency,
      categoryId: categoryId || 'cat-subscriptions',
      accountId: accountId || accounts[0]?.id,
      nextDueDate: nextDueDate || '2026-12-01',
      status: 'active',
    });

    setTitle('');
    setAmount('');
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {language === 'ka' ? 'რეგულარული გადახდები & გამოწერები' : 'Subscriptions & Recurring'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ka'
              ? 'ციკლური ხარჯები, სააბონენტო მომსახურებები და ვადები'
              : 'Fixed recurring subscriptions & due dates'}
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ka' ? 'გამოწერის დამატება' : 'Add Subscription'}</span>
        </button>
      </div>

      {/* Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'ka' ? 'თვიური ფიქსირებული ვალდებულება' : 'Total Monthly Recurring'}
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-1">
            {formatCurrency(totalMonthlyCommitment, currency)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {activeSubscriptions.length} {language === 'ka' ? 'აქტიური სერვისი' : 'active services'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'ka' ? 'წლიური პროექცია' : 'Projected Annual Cost'}
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-1">
            {formatCurrency(totalYearlyCommitment, currency)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {language === 'ka' ? 'ავტომატური განახლებით' : 'Based on 12-month cycle'}
          </div>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {recurring.map(item => {
            const cat = categories.find(c => c.id === item.categoryId);
            const acc = accounts.find(a => a.id === item.accountId);
            const isActive = item.status === 'active';

            return (
              <div
                key={item.id}
                className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                  !isActive ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/40' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                    <RotateCw className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 truncate">
                      <span>{language === 'ka' ? cat?.name : cat?.nameEn}</span>
                      <span aria-hidden="true">·</span>
                      <span>{acc?.name}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {item.frequency === 'monthly'
                          ? language === 'ka' ? 'ყოველთვიური' : 'Monthly'
                          : item.frequency === 'yearly'
                          ? language === 'ka' ? 'წლიური' : 'Yearly'
                          : language === 'ka' ? 'კვირეული' : 'Weekly'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <div className="font-bold text-slate-900 dark:text-white font-mono tabular-nums text-sm">
                      {formatCurrency(item.amount, item.currency)}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 justify-end">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(item.nextDueDate, language)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleRecurringStatus(item.id)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title={isActive ? 'Pause' : 'Resume'}
                    >
                      {isActive ? (
                        <PauseCircle className="w-4 h-4" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(language === 'ka' ? 'წაიშალოს ეს გამოწერა?' : 'Delete subscription?')) {
                          deleteRecurring(item.id);
                        }
                      }}
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal to add subscription */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
              {language === 'ka' ? 'ახალი გამოწერის დამატება' : 'Add Recurring Subscription'}
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ka' ? 'სერვისის სახელი' : 'Subscription Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'ka' ? 'მაგ: Netflix, Spotify, ინტერნეტი...' : 'e.g. Netflix, Gym...'}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ka' ? 'თანხა' : 'Amount'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="25.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ka' ? 'სიხშირე' : 'Frequency'}
                  </label>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <option value="monthly">{language === 'ka' ? 'ყოველთვიური' : 'Monthly'}</option>
                    <option value="yearly">{language === 'ka' ? 'წლიური' : 'Yearly'}</option>
                    <option value="weekly">{language === 'ka' ? 'კვირეული' : 'Weekly'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ka' ? 'ანგარიში' : 'Account'}
                  </label>
                  <select
                    value={accountId}
                    onChange={e => setAccountId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ka' ? 'მომდევნო გადახდის თარიღი' : 'Next Due Date'}
                  </label>
                  <input
                    type="date"
                    value={nextDueDate}
                    onChange={e => setNextDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  {language === 'ka' ? 'გაუქმება' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs"
                >
                  {language === 'ka' ? 'დამატება' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
