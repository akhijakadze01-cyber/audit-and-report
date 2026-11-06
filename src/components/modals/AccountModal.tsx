import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { AccountType, Currency } from '../../types/finance';
import { X } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const { addAccount, language } = useFinance();
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [currency, setCurrency] = useState<Currency>('GEL');
  const [initialBalance, setInitialBalance] = useState('');
  const [bankName, setBankName] = useState('');
  const [color, setColor] = useState('#00A3E0');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addAccount({
      name: name.trim(),
      type,
      currency,
      balance: parseFloat(initialBalance) || 0,
      bankName: bankName.trim() || undefined,
      color,
    });

    setName('');
    setInitialBalance('');
    setBankName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {language === 'ka' ? 'ახალი ანგარიშის დამატება' : 'Add New Account'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {language === 'ka' ? 'ანგარიშის სახელი' : 'Account Name'}
            </label>
            <input
              type="text"
              required
              placeholder={language === 'ka' ? 'მაგ: თიბისი სახელფასო, ნაღდი ფული...' : 'e.g. Main TBC Card, Cash...'}
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ka' ? 'ტიპი' : 'Type'}
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as AccountType)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="bank">{language === 'ka' ? 'საბანკო ანგარიში' : 'Bank Account'}</option>
                <option value="cash">{language === 'ka' ? 'ნაღდი ფული' : 'Cash'}</option>
                <option value="savings">{language === 'ka' ? 'ანაბარი / დანაზოგი' : 'Savings Deposit'}</option>
                <option value="investment">{language === 'ka' ? 'ინვესტიცია / კრიპტო' : 'Investment / Crypto'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ka' ? 'ვალუტა' : 'Currency'}
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as Currency)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="GEL">GEL (₾)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ka' ? 'საწყისი ნაშთი' : 'Starting Balance'}
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={initialBalance}
                onChange={e => setInitialBalance(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm font-mono tabular-nums focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ka' ? 'ფერი' : 'Color Accent'}
              </label>
              <div className="flex items-center gap-2 pt-1">
                {['#00A3E0', '#F37021', '#10B981', '#6366F1', '#EC4899', '#8B5CF6'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white dark:ring-slate-900' : 'hover:opacity-80'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

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
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-xs"
            >
              {language === 'ka' ? 'დამატება' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
