// src/modules/quotes/quotes.client.ts

import type { Quote, Rfq, User } from '@/drizzle/types';
import { api, backendApi } from '@/services/api-client';
import { QuoteCreateInput, QuoteUpdateInput } from './quotes.types';

/** Get a Quote by ID */
export async function getQuoteById(
  id: Quote['id'],
  opts?: { signal?: AbortSignal },
): Promise<Quote> {
  const response = await api.get<Quote>(`/api/quotes/${id}`, { signal: opts?.signal as any });
  return response.data;
}

/** List all Quotes for the current org (server resolves org) */
export async function listQuotes(opts?: {
  direction?: 'sent' | 'received';
  rfqId?: Rfq['id'];
  userId?: User['id'];
  signal?: AbortSignal;
}): Promise<Quote[]> {
  const response = await api.get<Quote[]>('/api/quotes', {
    params: { direction: opts?.direction, rfqId: opts?.rfqId, userId: opts?.userId },
    signal: opts?.signal as any,
  });
  return response.data;
}

/** Convenience wrapper for quotes by direction */
export async function listQuotesByDirection(
  direction: 'sent' | 'received',
  opts?: { signal?: AbortSignal },
): Promise<Quote[]> {
  return listQuotes({ direction, signal: opts?.signal });
}

/** Convenience wrapper for quotes by RFQ */
export async function listQuotesByRfq(
  rfqId: Rfq['id'],
  opts?: { signal?: AbortSignal },
): Promise<Quote[]> {
  return listQuotes({ rfqId, signal: opts?.signal });
}

/** Convenience wrapper for quotes by user */
export async function listQuotesByUser(
  userId: User['id'],
  opts?: { signal?: AbortSignal },
): Promise<Quote[]> {
  return listQuotes({ userId, signal: opts?.signal });
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
