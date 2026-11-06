import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtext?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  variant?: 'emerald' | 'blue' | 'rose' | 'amber' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  trend,
  icon: Icon,
  variant = 'neutral',
}) => {
  const variantStyles = {
    neutral: 'text-slate-400 bg-slate-800/60 dark:bg-slate-900/60 border-slate-700/60 dark:border-slate-800',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    blue: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  };

  const iconColors = {
    neutral: 'text-slate-400 dark:text-slate-300',
    emerald: 'text-emerald-500 dark:text-emerald-400',
    rose: 'text-rose-500 dark:text-rose-400',
    blue: 'text-sky-500 dark:text-sky-400',
    amber: 'text-amber-500 dark:text-amber-400',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
          {title}
        </span>
        <div className={`p-2 rounded-lg border ${variantStyles[variant]}`}>
          <Icon className={`w-4 h-4 ${iconColors[variant]}`} />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
          {value}
        </div>
      </div>

      {(trend || subtext) && (
        <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {trend && (
            <span
              className={`font-semibold tabular-nums ${
                trend.isPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {trend.value}
            </span>
          )}
          {trend && subtext && <span aria-hidden="true">·</span>}
          {subtext && <span className="truncate">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
