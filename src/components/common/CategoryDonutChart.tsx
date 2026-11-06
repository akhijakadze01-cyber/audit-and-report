import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { convertCurrency, formatCurrency, getCurrentMonthPeriod } from '../../utils/formatters';

export const CategoryDonutChart: React.FC = () => {
  const { transactions, categories, currency, language } = useFinance();
  const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);

  const currentPeriod = getCurrentMonthPeriod();

  const categoryBreakdown = React.useMemo(() => {
    const currentMonthExpenses = transactions.filter(
      t => t.type === 'expense' && t.date.startsWith(currentPeriod)
    );

    const totals: Record<string, number> = {};
    let totalExpense = 0;

    currentMonthExpenses.forEach(t => {
      const converted = convertCurrency(t.amount, t.currency, currency);
      totals[t.categoryId] = (totals[t.categoryId] || 0) + converted;
      totalExpense += converted;
    });

    const items = Object.entries(totals)
      .map(([catId, amount]) => {
        const cat = categories.find(c => c.id === catId);
        const name = language === 'ka' ? cat?.name || 'სხვა' : cat?.nameEn || 'Other';
        const color = cat?.color || '#94A3B8';
        const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
        return {
          id: catId,
          name,
          amount,
          percentage,
          color,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return { items, totalExpense };
  }, [transactions, categories, currency, language, currentPeriod]);

  // Donut geometry
  const radius = 64;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {language === 'ka' ? 'ხარჯების სტრუქტურა' : 'Expense Breakdown'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ka' ? 'მიმდინარე თვის კატეგორიები' : 'Current month categories'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'ka' ? 'სულ ხარჯი' : 'Total Spent'}
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {formatCurrency(categoryBreakdown.totalExpense, currency)}
          </div>
        </div>
      </div>

      {categoryBreakdown.items.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
          {language === 'ka' ? 'მიმდინარე თვეში ხარჯები არ ფიქსირდება' : 'No expenses recorded this month'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Donut SVG */}
          <div className="md:col-span-5 flex justify-center relative">
            <svg viewBox="0 0 180 180" className="w-44 h-44 -rotate-90">
              {/* Background ring */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-slate-100 dark:text-slate-800"
              />

              {categoryBreakdown.items.map(item => {
                const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((cumulativePercent / 100) * circumference);
                cumulativePercent += item.percentage;

                const isHovered = hoveredCatId === item.id;

                return (
                  <circle
                    key={item.id}
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredCatId(item.id)}
                    onMouseLeave={() => setHoveredCatId(null)}
                  />
                );
              })}
            </svg>

            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              {hoveredCatId ? (
                <>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white max-w-[100px] truncate">
                    {categoryBreakdown.items.find(i => i.id === hoveredCatId)?.name}
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono tabular-nums">
                    {categoryBreakdown.items.find(i => i.id === hoveredCatId)?.percentage.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'ka' ? 'კატეგორიები' : 'Categories'}
                  </span>
                  <span className="text-base font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                    {categoryBreakdown.items.length}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Breakdown List */}
          <div className="md:col-span-7 flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
            {categoryBreakdown.items.map(item => {
              const isHovered = hoveredCatId === item.id;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredCatId(item.id)}
                  onMouseLeave={() => setHoveredCatId(null)}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer text-xs ${
                    isHovered
                      ? 'bg-slate-100 dark:bg-slate-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      {item.percentage.toFixed(1)}%
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white font-mono tabular-nums">
                      {formatCurrency(item.amount, currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
