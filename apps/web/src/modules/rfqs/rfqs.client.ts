// src/modules/rfqs/rfqs.client.ts

import type { NewRfq, Rfq, User } from '@/drizzle/types';
import { api, backendApi } from '@/services/api-client';

/** Client-side DTO for creating RFQs
 * orgId and userId are injected on the server
 */
export type RfqCreateInput = Omit<
  NewRfq,
  'orgId' | 'userId' | 'id' | 'createdAt' | 'updatedAt' | 'statusHistory' | 'sentAt'
> & {
  // ISO string for transport. If you have a Date in UI, convert to ISO before calling.
  sentAt?: string | null;
};

export type RfqUpdateInput = Partial<RfqCreateInput>;

/** Get an RFQ by ID */
export async function getRfqById(id: Rfq['id'], opts?: { signal?: AbortSignal }): Promise<Rfq> {
  const response = await api.get<Rfq>(`/api/rfqs/${id}`, { signal: opts?.signal as any });
  return response.data;
}

/** List all RFQs for the current org (server resolves org) */
export async function listRfqs(opts?: {
  direction?: 'sent' | 'received';
  userId?: User['id'];
  signal?: AbortSignal;
}): Promise<Rfq[]> {
  const response = await api.get<Rfq[]>('/api/rfqs', {
    params: { direction: opts?.direction, userId: opts?.userId },
    signal: opts?.signal as any,
  });
  return response.data;
}

/** Convenience wrapper if you like explicit functions */
export async function listRfqsByDirection(
  direction: 'sent' | 'received',
  opts?: { signal?: AbortSignal },
): Promise<Rfq[]> {
  return listRfqs({ direction, signal: opts?.signal });
}

/** Convenience wrapper if you like explicit functions */
export async function listRfqsByUser(
  userId: User['id'],
  opts?: { signal?: AbortSignal },
): Promise<Rfq[]> {
  return listRfqs({ userId, signal: opts?.signal });
}

/** Create a new RFQ */
export async function createRfq(input: RfqCreateInput): Promise<Rfq> {
  // Normalize null to undefined to avoid sending explicit nulls unless your API expects them
  const payload: RfqCreateInput = { ...input, sentAt: input.sentAt ?? undefined };
  const response = await api.post<Rfq>('/api/rfqs', payload);
  return response.data;
}

/** Update an existing RFQ */
export async function updateRfq(id: Rfq['id'], input: RfqUpdateInput): Promise<Rfq> {
  const payload: RfqUpdateInput = { ...input, sentAt: input.sentAt ?? undefined };
  const response = await api.put<Rfq>(`/api/rfqs/${id}`, payload);
  return response.data;
}

/** Delete an RFQ */
export async function deleteRfq(id: Rfq['id']): Promise<void> {
  await api.delete(`/api/rfqs/${id}`);
}

/** Extract RFQ data from a file (backend service) */
export async function extractRfqFromFile(file: File): Promise<unknown> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await backendApi.post<{ data: unknown }>('/api/v1/extract/rfq', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data.data;
}
