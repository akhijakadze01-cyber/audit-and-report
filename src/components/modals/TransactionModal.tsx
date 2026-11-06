import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Currency, Transaction, TransactionType } from '../../types/finance';
import { getTodayDateString } from '../../utils/formatters';
import { X, ArrowDownRight, ArrowUpRight, ArrowLeftRight } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  editTransaction,
}) => {
  const {
    categories,
    accounts,
    currency: defaultCurrency,
    addTransaction,
    updateTransaction,
    language,
  } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [categoryId, setCategoryId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(String(editTransaction.amount));
      setCurrency(editTransaction.currency);
      setCategoryId(editTransaction.categoryId);
      setAccountId(editTransaction.accountId);
      setToAccountId(editTransaction.toAccountId || '');
      setDescription(editTransaction.description);
      setDate(editTransaction.date);
      setNotes(editTransaction.notes || '');
    } else {
      setType('expense');
      setAmount('');
      setCurrency(defaultCurrency);
      setDate(getTodayDateString());
      setDescription('');
      setNotes('');
      setError('');
      if (accounts.length > 0) {
        setAccountId(accounts[0].id);
        if (accounts.length > 1) setToAccountId(accounts[1].id);
      }
    }
  }, [editTransaction, isOpen, defaultCurrency, accounts]);

  useEffect(() => {
    // Pick first matching category when type changes
    const matching = categories.filter(c => c.type === (type === 'transfer' ? 'expense' : type));
    if (matching.length > 0 && !editTransaction) {
      setCategoryId(matching[0].id);
    }
  }, [type, categories, editTransaction]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError(language === 'ka' ? 'გთხოვთ მიუთითოთ სწორი თანხა' : 'Please specify a valid amount');
      return;
    }
    if (!accountId) {
      setError(language === 'ka' ? 'აირჩიეთ ანგარიში' : 'Please select an account');
      return;
    }
    if (type === 'transfer' && (!toAccountId || toAccountId === accountId)) {
      setError(language === 'ka' ? 'აირჩიეთ განსხვავებული მიმღები ანგარიში' : 'Select a different destination account');
      return;
    }

    if (editTransaction) {
      updateTransaction({
        ...editTransaction,
        type,
        amount: numAmount,
        currency,
        categoryId: type === 'transfer' ? 'cat-other-exp' : categoryId,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        description: description.trim() || (type === 'income' ? 'შემოსავალი' : 'ხარჯი'),
        date,
        notes: notes.trim() || undefined,
      });
    } else {
      addTransaction({
        type,
        amount: numAmount,
        currency,
        categoryId: type === 'transfer' ? 'cat-other-exp' : categoryId,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        description: description.trim() || (type === 'income' ? 'შემოსავალი' : 'ხარჯი'),
        date,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  const filteredCategories = categories.filter(c => 
    type === 'transfer' ? true : c.type === type
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {editTransaction
              ? language === 'ka' ? 'ტრანზაქციის რედაქტირება' : 'Edit Transaction'
              : language === 'ka' ? 'ახალი ტრანზაქციის დამატება' : 'Add New Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Type Segmented Buttons */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>{language === 'ka' ? 'ხარჯი' : 'Expense'}</span>
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{language === 'ka' ? 'შემოსავალი' : 'Income'}</span>
            </button>
            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'transfer'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>{language === 'ka' ? 'გადარიცხვა' : 'Transfer'}</span>
            </button>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ka' ? 'თანხა' : 'Amount'}
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-base font-semibold font-mono tabular-nums focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ka' ? 'ვალუტა' : 'Currency'}
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as Currency)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="GEL">GEL (₾)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          {/* Category (if not transfer) */}
          {type !== 'transfer' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ka' ? 'კატეგორია' : 'Category'}
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {language === 'ka' ? cat.name : cat.nameEn}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Accounts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {type === 'transfer'
                  ? language === 'ka' ? 'გადამრიცხველი ანგარიში' : 'From Account'
                  : language === 'ka' ? 'ანგარიში / საფულე' : 'Account'}
              </label>
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.currency})
                  </option>
                ))}
              </select>
            </div>

            {type === 'transfer' ? (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ka' ? 'მიმღები ანგარიში' : 'To Account'}
                </label>
                <select
                  value={toAccountId}
                  onChange={e => setToAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {accounts
                    .filter(a => a.id !== accountId)
                    .map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.currency})
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ka' ? 'თარიღი' : 'Date'}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {language === 'ka' ? 'აღწერა / ობიექტი' : 'Description / Merchant'}
            </label>
            <input
              type="text"
              placeholder={
                language === 'ka'
                  ? 'მაგ: აგროჰაბი, თელასი, ხელფასი...'
                  : 'e.g. Supermarket, Salary, Rent...'
              }
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Submit & Cancel */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {language === 'ka' ? 'გაუქმება' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 rounded-lg transition-colors shadow-xs"
            >
              {editTransaction
                ? language === 'ka' ? 'შენახვა' : 'Save Changes'
                : language === 'ka' ? 'დამატება' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
