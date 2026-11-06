import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Transaction, TransactionType } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Search,
  Download,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Filter,
  Plus,
} from 'lucide-react';

interface TransactionsViewProps {
  onOpenNewTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenNewTransaction,
  onEditTransaction,
}) => {
  const {
    transactions,
    categories,
    accounts,
    deleteTransaction,
    exportCSV,
    exportJSON,
    currency,
    language,
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Search text
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const descMatch = t.description.toLowerCase().includes(query);
        const noteMatch = t.notes?.toLowerCase().includes(query);
        if (!descMatch && !noteMatch) return false;
      }

      // Type filter
      if (selectedType !== 'all' && t.type !== selectedType) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) {
        return false;
      }

      // Account filter
      if (selectedAccount !== 'all' && t.accountId !== selectedAccount && t.toAccountId !== selectedAccount) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, searchTerm, selectedType, selectedCategory, selectedAccount, sortBy]);

  const totalFilteredSum = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => {
      if (t.type === 'income') return sum + t.amount;
      if (t.type === 'expense') return sum - t.amount;
      return sum;
    }, 0);
  }, [filteredTransactions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {language === 'ka' ? 'ტრანზაქციების ჟურნალი' : 'Transaction Ledger'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ka'
              ? 'სრული ფინანსური ისტორია, ძიება და ექსპორტი'
              : 'Full transaction history, live filter & exports'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV ექსპორტი</span>
          </button>

          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ka' ? 'დამატება' : 'New Transaction'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'ka' ? 'ძიება აღწერით ან შენიშვნით...' : 'Search transactions...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Type tabs (Segmented Button control) */}
          <div className="md:col-span-4 flex items-center p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs">
            {(['all', 'expense', 'income', 'transfer'] as const).map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`flex-1 py-1.5 font-medium rounded-md transition-colors text-center ${
                  selectedType === t
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t === 'all'
                  ? language === 'ka' ? 'ყველა' : 'All'
                  : t === 'expense'
                  ? language === 'ka' ? 'ხარჯი' : 'Expense'
                  : t === 'income'
                  ? language === 'ka' ? 'შემოსავალი' : 'Income'
                  : language === 'ka' ? 'გადარიცხვა' : 'Transfer'}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">{language === 'ka' ? 'ყველა კატეგორია' : 'All Categories'}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {language === 'ka' ? cat.name : cat.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Account Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedAccount}
              onChange={e => setSelectedAccount(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">{language === 'ka' ? 'ყველა ანგარიში' : 'All Accounts'}</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub-bar: stats of active filter */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              {language === 'ka'
                ? `ნაჩვენებია ${filteredTransactions.length} ჩანაწერი`
                : `Showing ${filteredTransactions.length} records`}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span>{language === 'ka' ? 'სორტირება:' : 'Sort by:'}</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden cursor-pointer"
              >
                <option value="date-desc">{language === 'ka' ? 'თარიღი (უახლესი)' : 'Date (Newest)'}</option>
                <option value="date-asc">{language === 'ka' ? 'თარიღი (უძველესი)' : 'Date (Oldest)'}</option>
                <option value="amount-desc">{language === 'ka' ? 'თანხა (კლებადი)' : 'Amount (High to Low)'}</option>
                <option value="amount-asc">{language === 'ka' ? 'თანხა (ზრდადი)' : 'Amount (Low to High)'}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">{language === 'ka' ? 'ოპერაცია / აღწერა' : 'Description'}</th>
                <th className="py-3 px-4 font-semibold">{language === 'ka' ? 'კატეგორია' : 'Category'}</th>
                <th className="py-3 px-4 font-semibold">{language === 'ka' ? 'ანგარიში' : 'Account'}</th>
                <th className="py-3 px-4 font-semibold">{language === 'ka' ? 'თარიღი' : 'Date'}</th>
                <th className="py-3 px-4 font-semibold text-right">{language === 'ka' ? 'თანხა' : 'Amount'}</th>
                <th className="py-3 px-4 font-semibold text-right">{language === 'ka' ? 'მოქმედება' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    {language === 'ka'
                      ? 'მოცემული ფილტრით ტრანზაქციები ვერ მოიძებნა'
                      : 'No transactions found with current criteria'}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => {
                  const cat = categories.find(c => c.id === tx.categoryId);
                  const acc = accounts.find(a => a.id === tx.accountId);
                  const toAcc = tx.toAccountId ? accounts.find(a => a.id === tx.toAccountId) : null;
                  const isIncome = tx.type === 'income';
                  const isTransfer = tx.type === 'transfer';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Description */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`p-1.5 rounded-md shrink-0 ${
                              isIncome
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : isTransfer
                                ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : isTransfer ? (
                              <ArrowRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {tx.description}
                            </span>
                            {tx.notes && (
                              <div className="text-[11px] text-slate-400 truncate max-w-xs">
                                {tx.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category - unboxed plain text */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {isTransfer
                          ? language === 'ka' ? 'შიდა გადარიცხვა' : 'Internal Transfer'
                          : language === 'ka' ? cat?.name || 'სხვა' : cat?.nameEn || 'Other'}
                      </td>

                      {/* Account */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {isTransfer ? (
                          <span className="font-mono tabular-nums">
                            {acc?.name} → {toAcc?.name}
                          </span>
                        ) : (
                          acc?.name
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        {formatDate(tx.date, language)}
                      </td>

                      {/* Amount */}
                      <td
                        className={`py-3 px-4 text-right font-semibold font-mono tabular-nums text-sm ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isTransfer
                            ? 'text-sky-600 dark:text-sky-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {isIncome ? '+' : isTransfer ? '↔' : '-'}
                        {formatCurrency(tx.amount, tx.currency)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(language === 'ka' ? 'დარწმუნებული ხართ, რომ გსურთ წაშლა?' : 'Delete this transaction?')) {
                                deleteTransaction(tx.id);
                              }
                            }}
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
