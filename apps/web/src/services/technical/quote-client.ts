import type { NewQuote, Quote } from '@/drizzle/types';
import { api, backendApi } from '@/services/api-client';

/**
 * Get a quote by ID
 */
export async function getQuote(id: Quote['id']): Promise<Quote> {
  const res = await api.get(`/api/quotes?id=${id}`);
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
 * Get all quotes for a specific RFQ
 */
export async function getQuotesByRfq(rfqId: Quote['rfqId']): Promise<Quote[]> {
  const res = await api.get(`/api/quotes?rfqId=${rfqId}`);
  return res.data;
}

/**
 * Create a new quote
 */
export async function createQuote(data: Partial<NewQuote>): Promise<Quote> {
  const res = await api.post('/api/quotes', data);
  return res.data;
}

/**
 * Update an existing quote
 */
export async function updateQuote(id: Quote['id'], data: Partial<NewQuote>): Promise<Quote> {
  const res = await api.put(`/api/quotes?id=${id}`, data);
  return res.data;
}

/**
 * Extract quote from file
 */
export async function extractQuote(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await backendApi.post('/api/v1/technical/quotes/extract', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // The backend returns a ResponseEnvelope, so extract the data
  return res.data.data;
}

/**
 * Delete a quote
 */
export async function deleteQuote(id: Quote['id']): Promise<void> {
  await api.delete(`/api/quotes?id=${id}`);
}
