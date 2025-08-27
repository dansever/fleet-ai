import type { NewQuote, Quote } from '@/drizzle/types';
import { api, backendApi } from '@/services/api-client';

// Client-side type for creating Quotes (orgId and userId are handled server-side)
export type CreateQuoteData = Omit<
  NewQuote,
  'orgId' | 'id' | 'createdAt' | 'updatedAt' | 'sentAt'
> & {
  // ISO string for API transport (null becomes undefined for optional fields)
  sentAt?: string | null;
};

// Client-side type for updating Quotes
export type UpdateQuoteData = Partial<CreateQuoteData>;

/**
 * Get a quote by ID
 */
export async function getQuote(id: Quote['id']): Promise<Quote> {
  const res = await api.get(`/api/quotes?id=${id}`);
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
export async function createQuote(data: CreateQuoteData): Promise<Quote> {
  const res = await api.post('/api/quotes', data);
  return res.data;
}

/**
 * Update an existing quote
 */
export async function updateQuote(id: Quote['id'], data: UpdateQuoteData): Promise<Quote> {
  const res = await api.put(`/api/quotes?id=${id}`, data);
  return res.data;
}

/**
 * Delete a quote
 */
export async function deleteQuote(id: Quote['id']): Promise<void> {
  await api.delete(`/api/quotes?id=${id}`);
}

/**
 * Extract quote from file
 */
export async function extractQuote(file: File): Promise<unknown> {
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

type ResponseEnvelope<T> = { success: boolean; message?: string; data?: T };
type LLMData = { analysis: unknown };

/**
 * Analyze quotes
 * @param rfqId
 * @returns
 */
export async function analyzeQuotes(rfqId: Quote['rfqId']): Promise<unknown> {
  const res = await backendApi.post<ResponseEnvelope<LLMData>>(
    '/api/v1/quotes/analyze',
    null, // no body
    { params: { rfqId } }, // query parameter
  );
  return res.data.data?.analysis;
}
