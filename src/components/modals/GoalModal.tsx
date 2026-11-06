import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { X } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  depositGoalId?: string | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  depositGoalId,
}) => {
  const { goals, addGoal, depositToGoal, accounts, language } = useFinance();

  // If depositGoalId is passed, this acts as "Deposit Funds to Goal" modal
  const targetGoal = goals.find(g => g.id === depositGoalId);

  // New Goal fields
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('ზოგადი დანაზოგი');
  const [notes, setNotes] = useState('');

  // Deposit fields
  const [depositAmount, setDepositAmount] = useState('');
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');

  if (!isOpen) return null;

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    if (!title.trim() || isNaN(target) || target <= 0) return;

    addGoal({
      title: title.trim(),
      targetAmount: target,
      deadline: deadline || '2027-12-31',
      category: category.trim() || 'დანაზოგი',
      color: '#10B981',
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setTargetAmount('');
    onClose();
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0 || !depositGoalId) return;

    depositToGoal(depositGoalId, amt, fromAccountId);
    setDepositAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {depositGoalId && targetGoal
              ? `${language === 'ka' ? 'თანხის შეტანა მიზანზე:' : 'Deposit to:'} ${targetGoal.title}`
              : language === 'ka' ? 'ახალი ფინანსური მიზანი' : 'New Savings Goal'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {depositGoalId && targetGoal ? (
          <form onSubmit={handleDeposit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ka' ? 'შესატანი თანხა' : 'Deposit Amount'}
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-base font-mono tabular-nums focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ka' ? 'ჩამოჭრა ანგარიშიდან' : 'Deduct from Account'}
              </label>
              <select
                value={fromAccountId}
                onChange={e => setFromAccountId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.currency})
                  </option>
                ))}
              </select>
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
                {language === 'ka' ? 'შეტანა' : 'Deposit'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateGoal} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ka' ? 'მიზნის დასახელება' : 'Goal Title'}
              </label>
              <input
                type="text"
                required
                placeholder={language === 'ka' ? 'მაგ: საგანგებო ფონდი, ავტომობილი...' : 'e.g. Vacation, New Laptop...'}
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ka' ? 'სამიზნე თანხა' : 'Target Amount'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="10000"
                  value={targetAmount}
                  onChange={e => setTargetAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm font-mono tabular-nums focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ka' ? 'მიღწევის ვადა' : 'Target Date'}
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ka' ? 'შენიშვნა / მოტივაცია' : 'Notes'}
              </label>
              <textarea
                rows={2}
                placeholder={language === 'ka' ? 'რისთვის გჭირდებათ ეს დანაზოგი...' : 'Purpose or details...'}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
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
                {language === 'ka' ? 'შექმნა' : 'Create Goal'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
