// Currency Conversion Tool with authenticated API
import { serverEnv } from '@/lib/env/server';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

const BASE_URL = 'https://v6.exchangerate-api.com/v6';
const API_KEY = serverEnv.EXCHANGE_RATE_API_KEY;

// Fetch exchange rate using authenticated API
async function getExchangeRate(
  base: string,
  quote: string,
): Promise<{ rate: number; timestamp: string; source: string }> {
  const baseUpper = base.toUpperCase();
  const quoteUpper = quote.toUpperCase();

  if (baseUpper === quoteUpper) {
    return { rate: 1, timestamp: new Date().toISOString(), source: 'same_currency' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    const url = `${BASE_URL}/${API_KEY}/latest/${baseUpper}`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`ExchangeRate API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const rate = data?.conversion_rates?.[quoteUpper];

    if (!rate || typeof rate !== 'number' || rate <= 0) {
      throw new Error(`Exchange rate for ${quoteUpper} not found in response`);
    }

    return {
      rate,
      timestamp: data.time_last_update_utc || new Date().toISOString(),
      source: 'exchangerate-api.com',
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after 5 seconds`);
    }
    throw new Error(
      `Unable to fetch exchange rate for ${baseUpper}/${quoteUpper}: ${error.message}`,
    );
  } finally {
    clearTimeout(timeout);
  }
}

const CurrencySchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  fromCurrency: z
    .string()
    .length(3, 'Currency code must be 3 characters')
    .regex(/^[A-Z]{3}$/i, 'Invalid currency code format'),
  toCurrency: z
    .string()
    .length(3, 'Currency code must be 3 characters')
    .regex(/^[A-Z]{3}$/i, 'Invalid currency code format'),
});

export type CurrencyInput = z.infer<typeof CurrencySchema>;

export const currencyConvert = tool(
  async (input: CurrencyInput) => {
    const { amount, fromCurrency, toCurrency } = input;
    const base = fromCurrency.toUpperCase();
    const quote = toCurrency.toUpperCase();

    try {
      const { rate, timestamp, source } = await getExchangeRate(base, quote);
      const convertedAmount = Number((amount * rate).toFixed(6));

      return JSON.stringify({
        value: convertedAmount,
        unit: quote,
        explanation: `Converted ${amount} ${base} to ${convertedAmount} ${quote} using rate ${rate} (${source})`,
        meta: {
          exchangeRate: rate,
          timestamp,
          source,
          originalAmount: amount,
          fromCurrency: base,
          toCurrency: quote,
        },
      });
    } catch (error: any) {
      return JSON.stringify({
        error: 'CURRENCY_CONVERSION_ERROR',
        message: error?.message ?? 'Currency conversion failed',
        details: {
          amount,
          fromCurrency: base,
          toCurrency: quote,
          suggestion: 'Verify currency codes are valid ISO 4217 codes (e.g., USD, EUR, GBP)',
        },
      });
    }
  },
  {
    name: 'currency_convert',
    description:
      'Convert currency amounts using real-time exchange rates. Supports ISO 4217 currency codes (USD, EUR, etc.)',
    schema: CurrencySchema,
  },
);
