import { Currency, Language } from '../types/finance';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  GEL: '₾',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

// Base rate against GEL (approximate standard reference)
export const EXCHANGE_RATES_TO_GEL: Record<Currency, number> = {
  GEL: 1,
  USD: 2.75,
  EUR: 2.95,
  GBP: 3.52,
};

export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency
): number {
  if (from === to) return amount;
  // Convert from origin to GEL, then GEL to target
  const inGel = amount * EXCHANGE_RATES_TO_GEL[from];
  return inGel / EXCHANGE_RATES_TO_GEL[to];
}

export function formatCurrency(
  amount: number,
  currency: Currency = 'GEL',
  compact: boolean = false
): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '₾';
  
  if (compact && Math.abs(amount) >= 1000000) {
    return `${symbol} ${(amount / 1000000).toFixed(1)}M`;
  }
  if (compact && Math.abs(amount) >= 10000) {
    return `${symbol} ${(amount / 1000).toFixed(1)}k`;
  }

  const formattedNum = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${symbol} ${formattedNum}`;
}

export function formatDate(dateString: string, language: Language = 'ka'): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    if (language === 'ka') {
      const monthsKa = [
        'იანვ', 'თებ', 'მარტ', 'აპრ', 'მაის', 'ივნ',
        'ივლის', 'აგვ', 'სექტ', 'ოქტ', 'ნოემ', 'დეკ'
      ];
      return `${date.getDate()} ${monthsKa[date.getMonth()]}, ${date.getFullYear()}`;
    }

    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthPeriod(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
