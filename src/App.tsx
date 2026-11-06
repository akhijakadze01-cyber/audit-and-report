import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { BudgetsView } from './components/BudgetsView';
import { AccountsView } from './components/AccountsView';
import { GoalsView } from './components/GoalsView';
import { SubscriptionsView } from './components/SubscriptionsView';
import { CalculatorsView } from './components/CalculatorsView';
import { TransactionModal } from './components/modals/TransactionModal';
import { GoalModal } from './components/modals/GoalModal';
import { Transaction } from './types/finance';
import { RotateCcw, ShieldCheck } from 'lucide-react';

function FinanceApp() {
  const { activeTab, language, resetToDemo } = useFinance();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);

  const handleOpenNewTransaction = () => {
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTransactionModalOpen(true);
  };

  const handleOpenGoalDeposit = (goalId: string) => {
    setDepositGoalId(goalId);
    setIsGoalModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Header onOpenNewTransaction={handleOpenNewTransaction} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <DashboardView
            onOpenNewTransaction={handleOpenNewTransaction}
            onOpenGoalDeposit={handleOpenGoalDeposit}
          />
        )}
        {activeTab === 'transactions' && (
          <TransactionsView
            onOpenNewTransaction={handleOpenNewTransaction}
            onEditTransaction={handleEditTransaction}
          />
        )}
        {activeTab === 'budgets' && <BudgetsView />}
        {activeTab === 'accounts' && <AccountsView />}
        {activeTab === 'goals' && <GoalsView />}
        {activeTab === 'subscriptions' && <SubscriptionsView />}
        {activeTab === 'calculators' && <CalculatorsView />}
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        editTransaction={editingTransaction}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setDepositGoalId(null);
        }}
        depositGoalId={depositGoalId}
      />

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              {language === 'ka'
                ? 'ფინანსი · პერსონალური ფინანსების მართვის სისტემა'
                : 'Finansi · Personal Wealth & Financial Management'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (
                  confirm(
                    language === 'ka'
                      ? 'გსურთ საწყის სატესტო მონაცემებზე დაბრუნება?'
                      : 'Reset to initial sample data?'
                  )
                ) {
                  resetToDemo();
                }
              }}
              className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'ka' ? 'საწყის მონაცემებზე დაბრუნება' : 'Reset Demo Data'}</span>
            </button>
            <span aria-hidden="true">·</span>
            <span>2026 ფინანსი</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <FinanceApp />
    </FinanceProvider>
  );
}
