// src/lib/constants/currencies.ts
export const currencies = [
  { code: 'USD', label: 'US Dollar' },
  { code: 'EUR', label: 'Euro' },
  { code: 'GBP', label: 'British Pound' },
  { code: 'JPY', label: 'Japanese Yen' },
  { code: 'NIS', label: 'Israeli Shekel' },
  { code: 'INR', label: 'Indian Rupee' },
  { code: 'AUD', label: 'Australian Dollar' },
  { code: 'CAD', label: 'Canadian Dollar' },
  { code: 'CHF', label: 'Swiss Franc' },
  { code: 'CNY', label: 'Chinese Yuan' },
];

// If you want a Record for quick lookup:
export const currencyMap: Record<string, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  NIS: 'Israeli Shekel',
  INR: 'Indian Rupee',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
};
