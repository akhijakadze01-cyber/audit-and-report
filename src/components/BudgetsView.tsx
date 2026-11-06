import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, getCurrentMonthPeriod } from '../utils/formatters';
import { Plus, AlertTriangle, CheckCircle2, TrendingUp, Sliders } from 'lucide-react';
import { BudgetModal } from './modals/BudgetModal';

export const BudgetsView: React.FC = () => {
  const {
    budgets,
    categories,
    transactions,
    currency,
    language,
    monthlyIncome,
    deleteBudget,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | undefined>(undefined);
  const [editingLimit, setEditingLimit] = useState<number | undefined>(undefined);

  const currentPeriod = getCurrentMonthPeriod();

  // Calculate budget statistics
  const budgetStats = React.useMemo(() => {
    let totalBudget = 0;
    let totalSpent = 0;

    const list = budgets.map(b => {
      const cat = categories.find(c => c.id === b.categoryId);
      const spent = transactions
        .filter(t => t.type === 'expense' && t.categoryId === b.categoryId && t.date.startsWith(currentPeriod))
        .reduce((sum, t) => sum + t.amount, 0);

      totalBudget += b.monthlyLimit;
      totalSpent += spent;

      const percentage = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
      const remaining = b.monthlyLimit - spent;

      return {
        ...b,
        categoryName: language === 'ka' ? cat?.name || 'კატეგორია' : cat?.nameEn || 'Category',
        categoryColor: cat?.color || '#6366F1',
        spent,
        percentage,
        remaining,
        isOver: spent > b.monthlyLimit,
        isWarning: percentage >= 80 && percentage < 100,
      };
    }).sort((a, b) => b.percentage - a.percentage);

    return { list, totalBudget, totalSpent };
  }, [budgets, categories, transactions, currentPeriod, language]);

  // 50/30/20 Rule Analysis
  const ruleAnalysis = React.useMemo(() => {
    // Categorize expenses
    const needsCategories = ['cat-housing', 'cat-utilities', 'cat-groceries', 'cat-transport', 'cat-health'];
    const wantsCategories = ['cat-entertainment', 'cat-shopping', 'cat-subscriptions', 'cat-education', 'cat-other-exp'];

    const currentExpenses = transactions.filter(
      t => t.type === 'expense' && t.date.startsWith(currentPeriod)
    );

    let needsSpent = 0;
    let wantsSpent = 0;

    currentExpenses.forEach(t => {
      if (needsCategories.includes(t.categoryId)) {
        needsSpent += t.amount;
      } else {
        wantsSpent += t.amount;
      }
    });

    const income = Math.max(1, monthlyIncome);
    const targetNeeds = income * 0.5;
    const targetWants = income * 0.3;
    const targetSavings = income * 0.2;

    const actualSavings = Math.max(0, income - (needsSpent + wantsSpent));

    return {
      needsSpent,
      targetNeeds,
      needsRatio: (needsSpent / income) * 100,
      wantsSpent,
      targetWants,
      wantsRatio: (wantsSpent / income) * 100,
      actualSavings,
      targetSavings,
      savingsRatio: (actualSavings / income) * 100,
    };
  }, [transactions, monthlyIncome, currentPeriod]);

  const handleOpenEdit = (categoryId: string, limit: number) => {
    setEditingCategory(categoryId);
    setEditingLimit(limit);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingCategory(undefined);
    setEditingLimit(500);
    setIsModalOpen(true);
  };

  const overallPercent = budgetStats.totalBudget > 0
    ? (budgetStats.totalSpent / budgetStats.totalBudget) * 100
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {language === 'ka' ? 'თვიური ბიუჯეტები და ლიმიტები' : 'Monthly Budgets & Limits'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ka'
              ? 'ხარჯვის კონტროლი და 50/30/20 ფინანსური წესი'
              : 'Spending control & 50/30/20 financial rule'}
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ka' ? 'ლიმიტის დამატება' : 'Set Category Limit'}</span>
        </button>
      </div>

      {/* Overview Aggregated Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'ka' ? 'ჯამური ბიუჯეტირებული ხარჯი' : 'Total Budgeted Spending'}
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {formatCurrency(budgetStats.totalSpent, currency)}{' '}
              <span className="text-sm font-normal text-slate-400">
                / {formatCurrency(budgetStats.totalBudget, currency)}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`text-xs font-semibold ${
                overallPercent > 100
                  ? 'text-rose-600 dark:text-rose-400'
                  : overallPercent >= 80
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {overallPercent.toFixed(1)}% {language === 'ka' ? 'ათვისებული' : 'used'}
            </span>
          </div>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallPercent > 100
                ? 'bg-rose-500'
                : overallPercent >= 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, overallPercent)}%` }}
          />
        </div>
      </div>

      {/* 50 / 30 / 20 Rule Analysis Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Sliders className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {language === 'ka' ? '50 / 30 / 20 ოქროს წესი' : '50 / 30 / 20 Financial Balance'}
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          {language === 'ka'
            ? 'შემოსავლის 50% აუცილებელ საჭიროებებზე, 30% პირად სურვილებზე და 20% დანაზოგებსა თუ ინვესტიციებზე.'
            : '50% on essential needs, 30% on personal wants, and 20% on savings & investments.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Needs 50% */}
          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {language === 'ka' ? 'აუცილებელი (50%)' : 'Needs (50%)'}
              </span>
              <span className="font-mono tabular-nums text-slate-500">
                {ruleAnalysis.needsRatio.toFixed(0)}%
              </span>
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white font-mono tabular-nums mb-2">
              {formatCurrency(ruleAnalysis.needsSpent, currency)}
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full ${
                  ruleAnalysis.needsRatio > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (ruleAnalysis.needsRatio / 50) * 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400">
              {language === 'ka' ? 'სამიზნე ლიმიტი:' : 'Target ceiling:'}{' '}
              <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                {formatCurrency(ruleAnalysis.targetNeeds, currency)}
              </span>
            </div>
          </div>

          {/* Wants 30% */}
          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {language === 'ka' ? 'სურვილები (30%)' : 'Wants (30%)'}
              </span>
              <span className="font-mono tabular-nums text-slate-500">
                {ruleAnalysis.wantsRatio.toFixed(0)}%
              </span>
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white font-mono tabular-nums mb-2">
              {formatCurrency(ruleAnalysis.wantsSpent, currency)}
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full ${
                  ruleAnalysis.wantsRatio > 30 ? 'bg-rose-500' : 'bg-sky-500'
                }`}
                style={{ width: `${Math.min(100, (ruleAnalysis.wantsRatio / 30) * 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400">
              {language === 'ka' ? 'სამიზნე ლიმიტი:' : 'Target ceiling:'}{' '}
              <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                {formatCurrency(ruleAnalysis.targetWants, currency)}
              </span>
            </div>
          </div>

          {/* Savings 20% */}
          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {language === 'ka' ? 'დანაზოგი (20%)' : 'Savings (20%)'}
              </span>
              <span className="font-mono tabular-nums text-slate-500">
                {ruleAnalysis.savingsRatio.toFixed(0)}%
              </span>
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white font-mono tabular-nums mb-2">
              {formatCurrency(ruleAnalysis.actualSavings, currency)}
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${Math.min(100, (ruleAnalysis.savingsRatio / 20) * 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400">
              {language === 'ka' ? 'სასურველი მიზანი:' : 'Target goal:'}{' '}
              <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                {formatCurrency(ruleAnalysis.targetSavings, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgetStats.list.map(b => (
          <div
            key={b.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: b.categoryColor }}
                  />
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                    {b.categoryName}
                  </h4>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(b.categoryId, b.monthlyLimit)}
                    className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {language === 'ka' ? 'შეცვლა' : 'Edit'}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(language === 'ka' ? 'წაიშალოს ეს ბიუჯეტი?' : 'Delete budget?')) {
                        deleteBudget(b.id);
                      }
                    }}
                    className="text-xs text-rose-500 hover:text-rose-700 px-1 py-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Amount stats */}
              <div className="flex items-baseline justify-between text-xs mb-2">
                <span className="text-slate-500 dark:text-slate-400">
                  {language === 'ka' ? 'დახარჯულია:' : 'Spent:'}{' '}
                  <span className="font-semibold font-mono tabular-nums text-slate-900 dark:text-white">
                    {formatCurrency(b.spent, currency)}
                  </span>
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {language === 'ka' ? 'ლიმიტი:' : 'Limit:'}{' '}
                  <span className="font-semibold font-mono tabular-nums text-slate-900 dark:text-white">
                    {formatCurrency(b.monthlyLimit, currency)}
                  </span>
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    b.isOver
                      ? 'bg-rose-500'
                      : b.isWarning
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, b.percentage)}%` }}
                />
              </div>
            </div>

            {/* Bottom status text */}
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800/60 font-mono tabular-nums">
              <span
                className={`font-medium ${
                  b.isOver
                    ? 'text-rose-600 dark:text-rose-400'
                    : b.isWarning
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {b.isOver
                  ? `${language === 'ka' ? 'გადაჭარბებულია' : 'Over by'} ${formatCurrency(Math.abs(b.remaining), currency)}`
                  : `${language === 'ka' ? 'დარჩენილია' : 'Remaining'} ${formatCurrency(b.remaining, currency)}`}
              </span>
              <span className="text-slate-400">{b.percentage.toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryId={editingCategory}
        currentLimit={editingLimit}
      />
    </div>
  );
};
