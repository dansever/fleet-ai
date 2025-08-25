import type { NewQuote, Quote, Rfq } from '@/drizzle/types';
import { api } from '../api-client';

// Client-side type for creating Quotes
export type CreateQuoteData = Omit<NewQuote, 'id' | 'createdAt' | 'updatedAt'> & {
  receivedAt?: string | null;
};

/**
 * Get a quote by ID
 */
export async function getQuote(id: Quote['id']): Promise<Quote> {
  const res = await api.get(`/api/quotes?id=${id}`);
  return res.data;
}

/**
 * Get quotes by RFQ ID
 */
export async function getQuotesByRfq(rfqId: Rfq['id']): Promise<Quote[]> {
  const res = await api.get(`/api/quotes?rfqId=${rfqId}`);
  return res.data;
}

/**
 * Get all quotes for the current organization
 */
export async function getQuotes(): Promise<Quote[]> {
  const res = await api.get('/api/quotes');
  return res.data;
}

/**
 * Create a new quote
 */
export async function createQuote(data: CreateQuoteData): Promise<Quote> {
  const res = await api.post('/api/quotes', data);
  return res.data;
}

/**
 * Update an existing quote
 */
export async function updateQuote(id: Quote['id'], data: Partial<CreateQuoteData>): Promise<Quote> {
  const res = await api.put(`/api/quotes?id=${id}`, data);
  return res.data;
}

/**
 * Delete a quote
 */
export async function deleteQuote(id: Quote['id']): Promise<void> {
  await api.delete(`/api/quotes?id=${id}`);
}
