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
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', display: 'Chinese Yuan (¥)' },
  ILS: { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', display: 'Israeli Shekel (₪)' },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', display: 'Indian Rupee (₹)' },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: '$', display: 'Australian Dollar ($)' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: '$', display: 'Canadian Dollar ($)' },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: '₣', display: 'Swiss Franc (₣)' },
  RUB: { code: 'RUB', name: 'Russian Ruble', symbol: '₽', display: 'Russian Ruble (₽)' },
  KRW: { code: 'KRW', name: 'South Korean Won', symbol: '₩', display: 'South Korean Won (₩)' },
};

// Symbol to currency code mapping (defaults: $ → USD, ¥ → JPY)
export const SYMBOL_TO_CODE_MAP: Record<string, string> = {
  '€': 'EUR',
  $: 'USD',
  '£': 'GBP',
  '₪': 'ILS',
  '₹': 'INR',
  '¥': 'JPY',
  '₽': 'RUB',
  '₩': 'KRW',
  '₣': 'CHF',
  C$: 'CAD',
  A$: 'AUD',
  CAD$: 'CAD',
  AUD$: 'AUD',
  US$: 'USD',
  USD$: 'USD',
};

// Alternative currency codes
export const CURRENCY_ALIASES: Record<string, string> = {
  NIS: 'ILS',
  RMB: 'CNY',
};
