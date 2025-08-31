export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  display: string;
}

export const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', display: 'US Dollar ($)' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', display: 'Euro (€)' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', display: 'British Pound (£)' },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', display: 'Japanese Yen (¥)' },
  NIS: { code: 'NIS', name: 'Israeli Shekel', symbol: '₪', display: 'Israeli Shekel (₪)' },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', display: 'Indian Rupee (₹)' },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: '$', display: 'Australian Dollar ($)' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: '$', display: 'Canadian Dollar ($)' },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: '₣', display: 'Swiss Franc (₣)' },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', display: 'Chinese Yuan (¥)' },
};
