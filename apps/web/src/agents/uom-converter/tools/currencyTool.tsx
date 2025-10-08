// Improved Currency Tool - More robust with better error handling
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

// Better currency API with fallback
async function getExchangeRate(
  base: string,
  quote: string,
): Promise<{ rate: number; timestamp: string; source: string }> {
  const baseUpper = base.toUpperCase();
  const quoteUpper = quote.toUpperCase();

  if (baseUpper === quoteUpper) {
    return { rate: 1, timestamp: new Date().toISOString(), source: 'same_currency' };
  }

  // Try multiple APIs for better reliability
  const apis = [
    {
      name: 'exchangerate-api',
      url: `https://api.exchangerate-api.com/v4/latest/${baseUpper}`,
      parser: (data: any) => ({ rate: data.rates[quoteUpper], timestamp: data.date }),
    },
    {
      name: 'exchangerate-host',
      url: `https://api.exchangerate.host/latest?base=${baseUpper}&symbols=${quoteUpper}`,
      parser: (data: any) => ({ rate: data.rates[quoteUpper], timestamp: data.date }),
    },
  ];

  for (const api of apis) {
    try {
      const response = await fetch(api.url, {
        headers: { Accept: 'application/json' },
        // Add timeout
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) continue;

      const data = await response.json();
      const { rate, timestamp } = api.parser(data);

      if (rate && typeof rate === 'number' && rate > 0) {
        return { rate, timestamp, source: api.name };
      }
    } catch (error) {
      console.warn(`API ${api.name} failed:`, error);
      continue;
    }
  }

  throw new Error(`Unable to fetch exchange rate for ${baseUpper}/${quoteUpper} from any provider`);
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
