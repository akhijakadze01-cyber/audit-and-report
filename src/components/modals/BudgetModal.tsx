import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { X } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId?: string;
  currentLimit?: number;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  categoryId: initialCatId,
  currentLimit = 500,
}) => {
  const { categories, setBudget, language } = useFinance();
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const [selectedCatId, setSelectedCatId] = useState(initialCatId || expenseCategories[0]?.id || '');
  const [limit, setLimit] = useState(String(currentLimit));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numLimit = parseFloat(limit);
    if (isNaN(numLimit) || numLimit <= 0 || !selectedCatId) return;

    setBudget(selectedCatId, numLimit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {language === 'ka' ? 'ბიუჯეტის ლიმიტის დაყენება' : 'Set Budget Limit'}
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
              {language === 'ka' ? 'კატეგორია' : 'Category'}
            </label>
            <select
              value={selectedCatId}
              onChange={e => setSelectedCatId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              {expenseCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {language === 'ka' ? cat.name : cat.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {language === 'ka' ? 'თვიური ლიმიტი (₾)' : 'Monthly Limit'}
            </label>
            <input
              type="number"
              step="10"
              required
              placeholder="500"
              value={limit}
              onChange={e => setLimit(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-base font-mono tabular-nums focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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
              {language === 'ka' ? 'შენახვა' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
