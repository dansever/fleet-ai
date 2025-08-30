export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

export const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£' },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  NIS: { code: 'NIS', name: 'Israeli Shekel', symbol: '₪' },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: '$' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: '₣' },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
};
