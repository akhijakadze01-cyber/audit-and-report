import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Plus, Target, CheckCircle2, Trash2, Calendar, PiggyBank } from 'lucide-react';
import { GoalModal } from './modals/GoalModal';

export const GoalsView: React.FC = () => {
  const {
    goals,
    currency,
    deleteGoal,
    language,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallPercentage = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const handleOpenDeposit = (id: string) => {
    setDepositGoalId(id);
    setIsModalOpen(true);
  };

  const handleOpenNewGoal = () => {
    setDepositGoalId(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {language === 'ka' ? 'მიზნები და დანაზოგები' : 'Savings Goals & Targets'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ka'
              ? 'მოტივაცია, დაგროვების პროგრესი და სამიზნე ვადები'
              : 'Target completion, timeline tracking & funding'}
          </p>
        </div>

        <button
          onClick={handleOpenNewGoal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ka' ? 'ახალი მიზანი' : 'New Goal'}</span>
        </button>
      </div>

      {/* Aggregate Goal Progress Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ka' ? 'ჯამური დაგროვება მიზნებისთვის' : 'Total Accumulated Towards Goals'}
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                {formatCurrency(totalSaved, currency)}{' '}
                <span className="text-sm font-normal text-slate-400">
                  / {formatCurrency(totalTarget, currency)}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {overallPercentage.toFixed(1)}% {language === 'ka' ? 'შესრულებული' : 'completed'}
            </span>
          </div>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, overallPercentage)}%` }}
          />
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => {
          const percent = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const isCompleted = goal.currentAmount >= goal.targetAmount;

          return (
            <div
              key={goal.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-xs flex flex-col justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: goal.color }}
                    />
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                      {goal.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(language === 'ka' ? 'წაიშალოს ეს მიზანი?' : 'Delete goal?')) {
                        deleteGoal(goal.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded-md transition-all shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {goal.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                    {goal.notes}
                  </p>
                )}

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-sky-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono tabular-nums mb-4">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(goal.currentAmount, currency)}
                  </span>
                  <span className="text-slate-400">
                    {percent.toFixed(0)}% / {formatCurrency(goal.targetAmount, currency)}
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(goal.deadline, language)}</span>
                </div>

                <button
                  onClick={() => handleOpenDeposit(goal.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors"
                >
                  + {language === 'ka' ? 'შეტანა' : 'Deposit'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        depositGoalId={depositGoalId}
      />
    </div>
  );
};
