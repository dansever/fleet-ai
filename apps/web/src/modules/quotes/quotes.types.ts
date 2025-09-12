// src/modules/quotes/quotes.types.ts
/**
 * Simple Quote types for form handling and API requests
 */

import { NewQuote } from '@/drizzle/types';

/**
 * For creating quotes from forms - excludes server-managed fields
 * Date fields accept strings (from forms) and get converted to Date objects
 */
export type QuoteCreateInput = Omit<NewQuote, 'id' | 'orgId' | 'createdAt' | 'updatedAt'> & {
  // Allow date fields as strings (from forms) or Date objects
  sentAt?: string | null;
};

/**
 * For updating quotes from forms - all fields optional except id is excluded
 */
export type QuoteUpdateInput = Partial<QuoteCreateInput>;
