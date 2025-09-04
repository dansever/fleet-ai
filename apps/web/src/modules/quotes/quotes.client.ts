// src/modules/quotes/quotes.client.ts

import type { Quote, Rfq } from '@/drizzle/types';
import { api, backendApi } from '@/services/api-client';
import { QuoteCreateInput, QuoteUpdateInput } from './quotes.types';

/** Get a Quote by ID */
export async function getQuote(id: Quote['id'], signal?: AbortSignal): Promise<Quote> {
  const response = await api.get<Quote>(`/api/quotes/${id}`, { signal: signal as any });
  return response.data;
}

/** List all Quotes for of a specific RFQ */
export async function listQuotesByRfqId(rfqId: Rfq['id'], signal?: AbortSignal): Promise<Quote[]> {
  const response = await api.get<Quote[]>(`/api/quotes?rfqId=${rfqId}`, {
    signal: signal as any,
  });
  return response.data;
}

/** Create a new Quote */
export async function createQuote(input: QuoteCreateInput, rfqId: string): Promise<Quote> {
  const payload = {
    ...input,
    rfqId,
    // Convert string dates to Date objects
    sentAt: input.sentAt ? new Date(input.sentAt) : undefined,
    // These stay as strings since the DB schema expects text
    quoteExpirationDate: input.quoteExpirationDate ?? undefined,
    taggedDate: input.taggedDate ?? undefined,
  };
  const response = await api.post<Quote>('/api/quotes', payload);
  return response.data;
}

/** Update an existing Quote */
export async function updateQuote(id: Quote['id'], input: QuoteUpdateInput): Promise<Quote> {
  const payload = {
    ...input,
    // Convert string dates to Date objects if provided
    sentAt: input.sentAt ? new Date(input.sentAt) : undefined,
  };
  const response = await api.put<Quote>(`/api/quotes/${id}`, payload);
  return response.data;
}

/** Delete a Quote */
export async function deleteQuote(id: Quote['id']): Promise<void> {
  await api.delete(`/api/quotes/${id}`);
}

/** Extract Quote data from a file (backend service) */
export async function extractQuoteFromFile(file: File): Promise<unknown> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await backendApi.post<{ data: unknown }>('/api/v1/extract/quote', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data.data;
}

/** Analyze quotes */
export async function compareQuotesByRfqId(rfqId: Quote['rfqId']): Promise<unknown> {
  const response = await backendApi.post<{ data: unknown }>('/api/v1/quotes/compare', null, {
    params: { rfqId },
  });
  return response.data.data;
}
