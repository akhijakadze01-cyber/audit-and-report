import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { convertCurrency, formatCurrency } from '../../utils/formatters';

export const CashflowChart: React.FC = () => {
  const { transactions, currency, language } = useFinance();
  const [viewMode, setViewMode] = useState<'days' | 'months'>('days');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Group transactions for "days" (last 14 days) or "months" (last 6 months)
  const chartData = React.useMemo(() => {
    if (viewMode === 'days') {
      const days = [];
      const today = new Date();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dayStr = String(d.getDate()).padStart(2, '0');
        const dateKey = `${y}-${m}-${dayStr}`;

        const label = language === 'ka' 
          ? `${d.getDate()} რიცხვ.` 
          : `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

        const dayTxs = transactions.filter(t => t.date === dateKey);
        const income = dayTxs
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, currency), 0);
        const expense = dayTxs
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, currency), 0);

        days.push({ label, dateKey, income, expense, net: income - expense });
      }
      return days;
    } else {
      const months = [];
      const today = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const monthKey = `${y}-${m}`;

        const monthNamesKa = ['იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ', 'ივლ', 'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ'];
        const label = language === 'ka'
          ? `${monthNamesKa[d.getMonth()]} ${y}`
          : `${d.toLocaleDateString('en-US', { month: 'short' })} ${y}`;

        const monthTxs = transactions.filter(t => t.date.startsWith(monthKey));
        const income = monthTxs
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, currency), 0);
        const expense = monthTxs
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, currency), 0);

        months.push({ label, dateKey: monthKey, income, expense, net: income - expense });
      }
      return months;
    }
  }, [transactions, viewMode, currency, language]);

  const maxVal = Math.max(
    ...chartData.map(d => Math.max(d.income, d.expense)),
    100
  );

  const svgHeight = 220;
  const svgWidth = 600;
  const paddingX = 40;
  const paddingY = 30;
  const innerWidth = svgWidth - paddingX * 2;
  const innerHeight = svgHeight - paddingY * 2;

  const barWidth = Math.max(8, (innerWidth / chartData.length) * 0.35);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {language === 'ka' ? 'ფულადი ნაკადების დინამიკა' : 'Cash Flow Dynamics'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ka'
              ? 'შემოსავლებისა და ხარჯების შედარებითი ანალიტიკა'
              : 'Comparative income vs expense balance'}
          </p>
        </div>

        {/* Filter Tab controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
          <button
            onClick={() => setViewMode('days')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'days'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {language === 'ka' ? 'ბოლო 14 დღე' : 'Last 14 Days'}
          </button>
          <button
            onClick={() => setViewMode('months')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'months'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {language === 'ka' ? 'ბოლო 6 თვე' : 'Last 6 Months'}
          </button>
        </div>
      </div>

      {/* Legend & Summary */}
      <div className="flex items-center gap-6 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            {language === 'ka' ? 'შემოსავალი' : 'Income'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" />
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            {language === 'ka' ? 'ხარჯი' : 'Expense'}
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-56 select-none"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingY + innerHeight * (1 - ratio);
            const val = maxVal * ratio;
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="3 3"
                  className="text-slate-200 dark:text-slate-800"
                />
                <text
                  x={paddingX - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 dark:fill-slate-500 font-mono tabular-nums"
                >
                  {formatCurrency(val, currency, true)}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {chartData.map((d, index) => {
            const step = innerWidth / chartData.length;
            const groupCenterX = paddingX + index * step + step / 2;
            const incHeight = (d.income / maxVal) * innerHeight;
            const expHeight = (d.expense / maxVal) * innerHeight;
            const incY = paddingY + innerHeight - incHeight;
            const expY = paddingY + innerHeight - expHeight;

            const isHovered = hoveredIndex === index;

            return (
              <g
                key={index}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Hover background column */}
                <rect
                  x={groupCenterX - step / 2}
                  y={paddingY}
                  width={step}
                  height={innerHeight}
                  fill="currentColor"
                  className={`transition-opacity ${
                    isHovered
                      ? 'text-slate-100/60 dark:text-slate-800/50 opacity-100'
                      : 'opacity-0'
                  }`}
                  rx="4"
                />

                {/* Income Bar */}
                <rect
                  x={groupCenterX - barWidth - 1}
                  y={incY}
                  width={barWidth}
                  height={Math.max(2, incHeight)}
                  rx="2"
                  className="fill-emerald-500 transition-all duration-200 hover:brightness-110"
                />

                {/* Expense Bar */}
                <rect
                  x={groupCenterX + 1}
                  y={expY}
                  width={barWidth}
                  height={Math.max(2, expHeight)}
                  rx="2"
                  className="fill-rose-500 transition-all duration-200 hover:brightness-110"
                />

                {/* X axis label */}
                <text
                  x={groupCenterX}
                  y={svgHeight - 8}
                  textAnchor="middle"
                  className={`text-[10px] font-medium transition-colors ${
                    isHovered
                      ? 'fill-slate-900 dark:fill-white font-semibold'
                      : 'fill-slate-400 dark:fill-slate-500'
                  }`}
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip Overlay */}
        {hoveredIndex !== null && chartData[hoveredIndex] && (
          <div className="absolute top-2 right-4 bg-slate-900 text-white dark:bg-slate-800 border border-slate-700/80 rounded-lg p-2.5 shadow-xl text-xs z-10 pointer-events-none transition-all">
            <div className="font-semibold border-b border-slate-700/60 pb-1 mb-1.5 text-slate-200">
              {chartData[hoveredIndex].label}
            </div>
            <div className="flex justify-between gap-4 py-0.5 text-emerald-400 font-mono tabular-nums">
              <span>{language === 'ka' ? 'შემოსავალი:' : 'Income:'}</span>
              <span>{formatCurrency(chartData[hoveredIndex].income, currency)}</span>
            </div>
            <div className="flex justify-between gap-4 py-0.5 text-rose-400 font-mono tabular-nums">
              <span>{language === 'ka' ? 'ხარჯი:' : 'Expense:'}</span>
              <span>{formatCurrency(chartData[hoveredIndex].expense, currency)}</span>
            </div>
            <div className="flex justify-between gap-4 pt-1 mt-1 border-t border-slate-700/60 font-semibold text-slate-100 font-mono tabular-nums">
              <span>{language === 'ka' ? 'წმინდა ბალანსი:' : 'Net:'}</span>
              <span className={chartData[hoveredIndex].net >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {formatCurrency(chartData[hoveredIndex].net, currency)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
