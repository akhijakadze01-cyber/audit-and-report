import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, EXCHANGE_RATES_TO_GEL } from '../utils/formatters';
import { Calculator, TrendingUp, Coins, Calendar, ArrowRight } from 'lucide-react';
import { Currency } from '../types/finance';

export const CalculatorsView: React.FC = () => {
  const { currency, language } = useFinance();
  const [activeCalc, setActiveCalc] = useState<'loan' | 'compound' | 'currency'>('loan');

  // 1. Loan Calculator State
  const [loanAmount, setLoanAmount] = useState('25000');
  const [interestRate, setInterestRate] = useState('14.5'); // standard Georgian GEL consumer/mortgage rate
  const [loanMonths, setLoanMonths] = useState('48');

  // 2. Compound Interest State
  const [initialCapital, setInitialCapital] = useState('5000');
  const [monthlyContribution, setMonthlyContribution] = useState('500');
  const [annualReturn, setAnnualReturn] = useState('11'); // e.g. 11% Georgian GEL deposit or S&P 500
  const [investmentYears, setInvestmentYears] = useState('10');

  // 3. Currency Converter State
  const [convertAmount, setConvertAmount] = useState('1000');
  const [fromCurr, setFromCurr] = useState<Currency>('USD');
  const [toCurr, setToCurr] = useState<Currency>('GEL');

  // Loan Math
  const loanResults = useMemo(() => {
    const P = parseFloat(loanAmount) || 0;
    const r = (parseFloat(interestRate) || 0) / 100 / 12;
    const n = parseInt(loanMonths) || 1;

    if (P <= 0 || n <= 0) return { monthly: 0, totalInterest: 0, totalPayment: 0 };

    if (r === 0) {
      return { monthly: P / n, totalInterest: 0, totalPayment: P };
    }

    const monthly = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = monthly * n;
    const totalInterest = totalPayment - P;

    return {
      monthly,
      totalInterest,
      totalPayment,
    };
  }, [loanAmount, interestRate, loanMonths]);

  // Compound Math
  const compoundResults = useMemo(() => {
    const P = parseFloat(initialCapital) || 0;
    const PMT = parseFloat(monthlyContribution) || 0;
    const r = (parseFloat(annualReturn) || 0) / 100 / 12;
    const years = parseInt(investmentYears) || 1;
    const n = years * 12;

    let futureValue = P;
    let totalContributed = P;

    const yearlyData = [];

    for (let m = 1; m <= n; m++) {
      futureValue = futureValue * (1 + r) + PMT;
      totalContributed += PMT;

      if (m % 12 === 0) {
        yearlyData.push({
          year: m / 12,
          balance: futureValue,
          contributions: totalContributed,
          interest: futureValue - totalContributed,
        });
      }
    }

    const totalInterest = futureValue - totalContributed;

    return {
      futureValue,
      totalContributed,
      totalInterest,
      yearlyData,
    };
  }, [initialCapital, monthlyContribution, annualReturn, investmentYears]);

  // Currency Converter Math
  const convertedResult = useMemo(() => {
    const amt = parseFloat(convertAmount) || 0;
    const inGel = amt * EXCHANGE_RATES_TO_GEL[fromCurr];
    return inGel / EXCHANGE_RATES_TO_GEL[toCurr];
  }, [convertAmount, fromCurr, toCurr]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {language === 'ka' ? 'ფინანსური კალკულატორები და პროგნოზები' : 'Financial Calculators & Forecasting'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {language === 'ka'
            ? 'სესხის გრაფიკი, რთული პროცენტის კაპიტალიზაცია და ვალუტის კურსები'
            : 'Loan amortization, compound growth simulation & currency exchange'}
        </p>
      </div>

      {/* Tabs / Switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl max-w-md text-xs font-semibold">
        <button
          onClick={() => setActiveCalc('loan')}
          className={`flex-1 py-2 rounded-lg transition-colors text-center ${
            activeCalc === 'loan'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {language === 'ka' ? 'სესხი & იპოთეკა' : 'Loan & Mortgage'}
        </button>
        <button
          onClick={() => setActiveCalc('compound')}
          className={`flex-1 py-2 rounded-lg transition-colors text-center ${
            activeCalc === 'compound'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {language === 'ka' ? 'რთული პროცენტი' : 'Compound Interest'}
        </button>
        <button
          onClick={() => setActiveCalc('currency')}
          className={`flex-1 py-2 rounded-lg transition-colors text-center ${
            activeCalc === 'currency'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {language === 'ka' ? 'ვალუტის კურსები' : 'Currency Converter'}
        </button>
      </div>

      {/* 1. Loan Calculator */}
      {activeCalc === 'loan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
              {language === 'ka' ? 'სესხის პარამეტრები' : 'Loan Parameters'}
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ka' ? 'სესხის თანხა (₾)' : 'Loan Amount'}
              </label>
              <input
                type="number"
                step="500"
                value={loanAmount}
                onChange={e => setLoanAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ka' ? 'წლიური საპროცენტო განაკვეთი (%)' : 'Annual Interest Rate (%)'}
              </label>
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={e => setInterestRate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ka' ? 'ვადა (თვეებში)' : 'Period (Months)'}
              </label>
              <input
                type="number"
                step="6"
                value={loanMonths}
                onChange={e => setLoanMonths(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-4">
                {language === 'ka' ? 'გადახდის შემაჯამებელი' : 'Payment Summary'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] text-slate-400">
                    {language === 'ka' ? 'თვიური შენატანი' : 'Monthly Payment'}
                  </div>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums mt-1">
                    {formatCurrency(loanResults.monthly, currency)}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] text-slate-400">
                    {language === 'ka' ? 'ჯამური პროცენტი' : 'Total Interest'}
                  </div>
                  <div className="text-xl font-bold text-rose-500 font-mono tabular-nums mt-1">
                    {formatCurrency(loanResults.totalInterest, currency)}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] text-slate-400">
                    {language === 'ka' ? 'ჯამური გადასახდელი' : 'Total Payout'}
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-1">
                    {formatCurrency(loanResults.totalPayment, currency)}
                  </div>
                </div>
              </div>

              {/* Proportion Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>
                    {language === 'ka' ? 'ძირითადი თანხა:' : 'Principal:'}{' '}
                    <span className="font-semibold text-slate-900 dark:text-white font-mono">
                      {((parseFloat(loanAmount) / (loanResults.totalPayment || 1)) * 100).toFixed(1)}%
                    </span>
                  </span>
                  <span>
                    {language === 'ka' ? 'ბანკის პროცენტი:' : 'Interest:'}{' '}
                    <span className="font-semibold text-rose-500 font-mono">
                      {((loanResults.totalInterest / (loanResults.totalPayment || 1)) * 100).toFixed(1)}%
                    </span>
                  </span>
                </div>
                <div className="w-full bg-rose-500 h-3 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500"
                    style={{
                      width: `${(parseFloat(loanAmount) / (loanResults.totalPayment || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Compound Interest Growth Simulator */}
      {activeCalc === 'compound' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
              {language === 'ka' ? 'ინვესტიციის პარამეტრები' : 'Investment Parameters'}
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ka' ? 'საწყისი კაპიტალი (₾)' : 'Starting Capital'}
              </label>
              <input
                type="number"
                step="500"
                value={initialCapital}
                onChange={e => setInitialCapital(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ka' ? 'თვიური შენატანი (₾)' : 'Monthly Addition'}
              </label>
              <input
                type="number"
                step="50"
                value={monthlyContribution}
                onChange={e => setMonthlyContribution(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ka' ? 'საშუალო წლიური შემოსავლიანობა (%)' : 'Annual Return Rate (%)'}
              </label>
              <input
                type="number"
                step="0.5"
                value={annualReturn}
                onChange={e => setAnnualReturn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ka' ? 'პერიოდი (წლები)' : 'Time Horizon (Years)'}
              </label>
              <input
                type="number"
                step="1"
                value={investmentYears}
                onChange={e => setInvestmentYears(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-4">
                {language === 'ka' ? 'კაპიტალის ზრდის პროგნოზი' : 'Wealth Accumulation Outcome'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] text-slate-400">
                    {language === 'ka' ? 'საბოლოო კაპიტალი' : 'Future Portfolio Value'}
                  </div>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums mt-1">
                    {formatCurrency(compoundResults.futureValue, currency)}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] text-slate-400">
                    {language === 'ka' ? 'საკუთარი შენატანი' : 'Total Invested'}
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-1">
                    {formatCurrency(compoundResults.totalContributed, currency)}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] text-slate-400">
                    {language === 'ka' ? 'დარიცხული მოგება' : 'Compound Interest'}
                  </div>
                  <div className="text-xl font-bold text-sky-500 font-mono tabular-nums mt-1">
                    +{formatCurrency(compoundResults.totalInterest, currency)}
                  </div>
                </div>
              </div>

              {/* Progress Milestones List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <h4 className="text-xs font-semibold text-slate-500">
                  {language === 'ka' ? 'პროგრესი წლების მიხედვით' : 'Year-by-Year Milestones'}
                </h4>
                {compoundResults.yearlyData.slice(-5).map(m => (
                  <div
                    key={m.year}
                    className="flex justify-between items-center text-xs py-1.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 font-mono tabular-nums"
                  >
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      {m.year} {language === 'ka' ? 'წელი' : 'Year'}
                    </span>
                    <span className="text-slate-400">
                      {language === 'ka' ? 'შენატანი:' : 'Invested:'} {formatCurrency(m.contributions, currency, true)}
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(m.balance, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Currency Converter */}
      {activeCalc === 'currency' && (
        <div className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 shadow-xs space-y-6">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
            {language === 'ka' ? 'სავალუტო კალკულატორი და ოფიციალური კურსი' : 'Currency Converter & Exchange Rates'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ka' ? 'თანხა' : 'Amount'}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="10"
                  value={convertAmount}
                  onChange={e => setConvertAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono tabular-nums"
                />
                <select
                  value={fromCurr}
                  onChange={e => setFromCurr(e.target.value as Currency)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                >
                  <option value="GEL">GEL (₾)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-1 flex justify-center pt-5">
              <button
                onClick={() => {
                  setFromCurr(toCurr);
                  setToCurr(fromCurr);
                }}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ka' ? 'შედეგი' : 'Converted'}
              </label>
              <div className="flex gap-2">
                <div className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 flex items-center">
                  {formatCurrency(convertedResult, toCurr)}
                </div>
                <select
                  value={toCurr}
                  onChange={e => setToCurr(e.target.value as Currency)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                >
                  <option value="GEL">GEL (₾)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reference Table */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <div className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {language === 'ka' ? 'საბაზისო გაცვლითი კურსები ლართან (GEL):' : 'Reference Rates to GEL:'}
            </div>
            <div className="grid grid-cols-3 gap-4 font-mono tabular-nums">
              <div>1 USD = 2.75 ₾</div>
              <div>1 EUR = 2.95 ₾</div>
              <div>1 GBP = 3.52 ₾</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
