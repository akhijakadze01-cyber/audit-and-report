import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { convertCurrency, formatCurrency } from '../utils/formatters';
import { AccountModal } from './modals/AccountModal';
import {
  CreditCard,
  Plus,
  ArrowLeftRight,
  Trash2,
  Building2,
  Banknote,
  PiggyBank,
  TrendingUp,
} from 'lucide-react';

export const AccountsView: React.FC = () => {
  const {
    accounts,
    currency,
    deleteAccount,
    transferFunds,
    language,
    totalNetWorth,
  } = useFinance();

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Transfer form state
  const [fromId, setFromId] = useState(accounts[0]?.id || '');
  const [toId, setToId] = useState(accounts[1]?.id || accounts[0]?.id || '');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0 || fromId === toId) return;

    transferFunds(fromId, toId, amt, transferNote);
    setTransferAmount('');
    setTransferNote('');
    setIsTransferModalOpen(false);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'cash':
        return Banknote;
      case 'savings':
        return PiggyBank;
      case 'investment':
        return TrendingUp;
      default:
        return Building2;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {language === 'ka' ? 'ანგარიშები და საფულეები' : 'Accounts & Wallets'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ka'
              ? 'საბანკო ბარათები, ნაღდი ფული და დეპოზიტები'
              : 'Bank accounts, cash wallets & savings deposits'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>{language === 'ka' ? 'გადარიცხვა' : 'Transfer'}</span>
          </button>

          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ka' ? 'ანგარიშის დამატება' : 'Add Account'}</span>
          </button>
        </div>
      </div>

      {/* Summary Total Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'ka' ? 'სრული ბალანსი (ყველა ანგარიში)' : 'Consolidated Total Balance'}
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
            {formatCurrency(totalNetWorth, currency)}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{accounts.length} {language === 'ka' ? 'ანგარიში' : 'accounts'}</span>
          <span aria-hidden="true">·</span>
          <span>
            {accounts.filter(a => a.type === 'bank').length} {language === 'ka' ? 'ბანკი' : 'bank'}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {accounts.filter(a => a.type === 'savings').length} {language === 'ka' ? 'ანაბარი' : 'savings'}
          </span>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(acc => {
          const Icon = getAccountIcon(acc.type);
          const convertedVal = convertCurrency(acc.balance, acc.currency, currency);

          return (
            <div
              key={acc.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2.5 rounded-lg text-white shadow-xs"
                      style={{ backgroundColor: acc.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                        {acc.name}
                      </h3>
                      <div className="text-[11px] text-slate-400">
                        {acc.bankName || (language === 'ka' ? 'პირადი საფულე' : 'Personal Wallet')}
                      </div>
                    </div>
                  </div>

                  {accounts.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(language === 'ka' ? 'წაიშალოს ეს ანგარიში?' : 'Delete this account?')) {
                          deleteAccount(acc.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                      title="Delete account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Account details */}
                {acc.accountNumber && (
                  <div className="text-[11px] font-mono text-slate-400 mb-3 tracking-wide">
                    •••• •••• {acc.accountNumber.slice(-4)}
                  </div>
                )}
              </div>

              {/* Balance footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-baseline justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">
                    {language === 'ka' ? 'ნაშთი' : 'Balance'}
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                    {formatCurrency(acc.balance, acc.currency)}
                  </div>
                </div>

                {acc.currency !== currency && (
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">
                      ≈ {currency}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      {formatCurrency(convertedVal, currency)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Internal Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
              {language === 'ka' ? 'შიდა გადარიცხვა ანგარიშებს შორის' : 'Transfer Between Accounts'}
            </h3>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ka' ? 'გამგზავნი ანგარიში' : 'From Account'}
                </label>
                <select
                  value={fromId}
                  onChange={e => setFromId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatCurrency(a.balance, a.currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ka' ? 'მიმღები ანგარიში' : 'To Account'}
                </label>
                <select
                  value={toId}
                  onChange={e => setToId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  {accounts
                    .filter(a => a.id !== fromId)
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({formatCurrency(a.balance, a.currency)})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ka' ? 'გადასარიცხი თანხა' : 'Amount'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ka' ? 'შენიშვნა (სურვილისამებრ)' : 'Note (optional)'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'ka' ? 'მაგ: ანაბარზე გადატანა' : 'e.g. Deposit top-up'}
                  value={transferNote}
                  onChange={e => setTransferNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  {language === 'ka' ? 'გაუქმება' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs"
                >
                  {language === 'ka' ? 'გადარიცხვა' : 'Transfer Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </div>
  );
};
