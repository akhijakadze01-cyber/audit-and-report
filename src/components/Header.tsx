import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { ActiveTab, Currency, Language } from '../types/finance';
import { Plus, Sun, Moon, Download, Upload, RotateCcw } from 'lucide-react';

interface HeaderProps {
  onOpenNewTransaction: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewTransaction }) => {
  const {
    activeTab,
    setActiveTab,
    currency,
    setCurrency,
    language,
    setLanguage,
    theme,
    toggleTheme,
    exportCSV,
    exportJSON,
    importJSON,
    resetToDemo,
  } = useFinance();

  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  const navItems: { id: ActiveTab; labelKa: string; labelEn: string }[] = [
    { id: 'overview', labelKa: 'მიმოხილვა', labelEn: 'Overview' },
    { id: 'transactions', labelKa: 'ტრანზაქციები', labelEn: 'Transactions' },
    { id: 'budgets', labelKa: 'ბიუჯეტები', labelEn: 'Budgets' },
    { id: 'accounts', labelKa: 'ანგარიშები', labelEn: 'Accounts' },
    { id: 'goals', labelKa: 'მიზნები', labelEn: 'Goals' },
    { id: 'subscriptions', labelKa: 'გამოწერები', labelEn: 'Subscriptions' },
    { id: 'calculators', labelKa: 'კალკულატორი', labelEn: 'Calculators' },
  ];

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const success = importJSON(content);
        if (success) {
          alert(language === 'ka' ? 'მონაცემები წარმატებით იმპორტირდა!' : 'Data imported successfully!');
        } else {
          alert(language === 'ka' ? 'შეცდომა: არასწორი ფაილის ფორმატი' : 'Error: Invalid file format');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
    setShowSettingsDropdown(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      {/* Top Bar Contract: 3 zones, gap-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shadow-xs">
            ₾
          </div>
          <button
            onClick={() => setActiveTab('overview')}
            className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap text-left hover:opacity-90"
          >
            ფინანსი
          </button>
        </div>

        {/* Zone 2: 4–5 concise single-line text links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {language === 'ka' ? item.labelKa : item.labelEn}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Currency Select */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs font-semibold">
            {(['GEL', 'USD', 'EUR'] as Currency[]).map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-2 py-1 rounded-md transition-colors ${
                  currency === c
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {c === 'GEL' ? '₾ GEL' : c === 'USD' ? '$ USD' : '€ EUR'}
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'ka' ? 'en' : 'ka')}
            className="px-2 py-1 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
          >
            {language === 'ka' ? 'GEO' : 'ENG'}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 rounded-lg transition-colors shadow-xs whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ka' ? 'ახალი ოპერაცია' : 'Add Transaction'}</span>
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Sub-Navigation Scrollbar */}
      <div className="lg:hidden flex items-center gap-4 px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto text-xs font-medium">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap px-2.5 py-1 rounded-md transition-colors ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'ka' ? item.labelKa : item.labelEn}
            </button>
          );
        })}
      </div>
    </header>
  );
};
