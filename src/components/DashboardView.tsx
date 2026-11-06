import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatCard } from './common/StatCard';
import { CashflowChart } from './common/CashflowChart';
import { CategoryDonutChart } from './common/CategoryDonutChart';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Plus,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenNewTransaction: () => void;
  onOpenGoalDeposit: (goalId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewTransaction,
  onOpenGoalDeposit,
}) => {
  const {
    totalNetWorth,
    monthlyIncome,
    monthlyExpense,
    monthlySavings,
    savingsRate,
    currency,
    transactions,
    categories,
    accounts,
    goals,
    budgets,
    setActiveTab,
    language,
  } = useFinance();

  const recentTransactions = transactions.slice(0, 6);

  // Budget status summary: check if any budget exceeds 80% or 100%
  const budgetAlerts = React.useMemo(() => {
    return budgets.map(b => {
      const cat = categories.find(c => c.id === b.categoryId);
      const spent = transactions
        .filter(t => t.type === 'expense' && t.categoryId === b.categoryId && t.date.startsWith(b.period))
        .reduce((sum, t) => sum + t.amount, 0);
      const ratio = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
      return {
        categoryName: language === 'ka' ? cat?.name || 'ხარჯი' : cat?.nameEn || 'Expense',
        spent,
        limit: b.monthlyLimit,
        ratio,
        isOver: ratio >= 100,
        isNear: ratio >= 80 && ratio < 100,
      };
    }).filter(b => b.isNear || b.isOver);
  }, [budgets, categories, transactions, language]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* KPI Stat Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={language === 'ka' ? 'სუფთა აქტივები / ბალანსი' : 'Total Net Worth'}
          value={formatCurrency(totalNetWorth, currency)}
          subtext={language === 'ka' ? `${accounts.length} აქტიური ანგარიში` : `${accounts.length} active accounts`}
          icon={Wallet}
          variant="blue"
        />

        <StatCard
          title={language === 'ka' ? 'თვის შემოსავალი' : 'Monthly Income'}
          value={formatCurrency(monthlyIncome, currency)}
          trend={{
            value: `+${formatCurrency(monthlyIncome, currency)}`,
            isPositive: true,
          }}
          subtext={language === 'ka' ? 'მიმდინარე თვე' : 'This month'}
          icon={TrendingUp}
          variant="emerald"
        />

        <StatCard
          title={language === 'ka' ? 'თვის ხარჯი' : 'Monthly Expenses'}
          value={formatCurrency(monthlyExpense, currency)}
          trend={{
            value: `-${formatCurrency(monthlyExpense, currency)}`,
            isPositive: false,
          }}
          subtext={
            monthlyIncome > 0
              ? `${((monthlyExpense / monthlyIncome) * 100).toFixed(0)}% ${language === 'ka' ? 'შემოსავლიდან' : 'of income'}`
              : undefined
          }
          icon={TrendingDown}
          variant="rose"
        />

        <StatCard
          title={language === 'ka' ? 'წმინდა დანაზოგი' : 'Net Savings Rate'}
          value={formatCurrency(monthlySavings, currency)}
          trend={{
            value: `${savingsRate.toFixed(1)}%`,
            isPositive: monthlySavings >= 0,
          }}
          subtext={language === 'ka' ? 'დანაზოგის წილი' : 'Savings rate'}
          icon={PiggyBank}
          variant={monthlySavings >= 0 ? 'emerald' : 'rose'}
        />
      </div>

      {/* Warning Alert Banner (if budgets are near or exceeded) */}
      {budgetAlerts.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-800 dark:text-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {language === 'ka' ? 'ბიუჯეტის ყურადღება:' : 'Budget Alert:'}
              </span>{' '}
              {budgetAlerts.map(b => (
                <span key={b.categoryName} className="mr-3">
                  {b.categoryName}: {b.ratio.toFixed(0)}% ({formatCurrency(b.spent, currency)} / {formatCurrency(b.limit, currency)})
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => setActiveTab('budgets')}
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline shrink-0"
          >
            {language === 'ka' ? 'ბიუჯეტების ნახვა →' : 'View Budgets →'}
          </button>
        </div>
      )}

      {/* Interactive Charts Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <CashflowChart />
        </div>
        <div className="lg:col-span-5">
          <CategoryDonutChart />
        </div>
      </div>

      {/* Bottom Row: Recent Transactions + Savings Goals Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Transactions List */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {language === 'ka' ? 'ბოლო ტრანზაქციები' : 'Recent Transactions'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'ka' ? 'შემოსავლები, ხარჯები და გადარიცხვები' : 'Latest financial activity'}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('transactions')}
              className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <span>{language === 'ka' ? 'ყველას ნახვა' : 'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                {language === 'ka' ? 'ტრანზაქციები ჯერ არ არის' : 'No transactions yet'}
              </div>
            ) : (
              recentTransactions.map(tx => {
                const cat = categories.find(c => c.id === tx.categoryId);
                const acc = accounts.find(a => a.id === tx.accountId);
                const isIncome = tx.type === 'income';
                const isTransfer = tx.type === 'transfer';

                return (
                  <div
                    key={tx.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-lg px-2 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          isIncome
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : isTransfer
                            ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : isTransfer ? (
                          <ArrowRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          {tx.description}
                        </div>
                        {/* Clean unboxed metadata with separators (§1.A Zero-Pill) */}
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] truncate">
                          <span>{language === 'ka' ? cat?.name : cat?.nameEn}</span>
                          <span aria-hidden="true">·</span>
                          <span>{acc?.name}</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatDate(tx.date, language)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`font-semibold font-mono tabular-nums text-sm ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isTransfer
                            ? 'text-sky-600 dark:text-sky-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {isIncome ? '+' : isTransfer ? '↔' : '-'}
                        {formatCurrency(tx.amount, tx.currency)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Savings Goals Widget */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  {language === 'ka' ? 'მიზნები & დანაზოგები' : 'Savings Goals'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'ka' ? 'დაგროვების პროგრესი' : 'Progress towards targets'}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('goals')}
                className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>{language === 'ka' ? 'ყველა' : 'All'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {goals.slice(0, 3).map(goal => {
                const percent = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                return (
                  <div
                    key={goal.id}
                    className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 text-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900 dark:text-white truncate">
                        {goal.title}
                      </span>
                      <button
                        onClick={() => onOpenGoalDeposit(goal.id)}
                        className="px-2 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-md hover:bg-emerald-500/20 transition-colors shrink-0"
                      >
                        + {language === 'ka' ? 'შეტანა' : 'Deposit'}
                      </button>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-mono tabular-nums text-[11px]">
                      <span>{formatCurrency(goal.currentAmount, currency)}</span>
                      <span>{percent.toFixed(0)}% / {formatCurrency(goal.targetAmount, currency)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('goals')}
            className="mt-4 w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'ka' ? 'ახალი მიზნის შექმნა' : 'Create New Goal'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
