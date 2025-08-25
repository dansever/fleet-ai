import type { NewRfq, Rfq } from '@/drizzle/types';
import { api, backendApi } from '../api-client';

// Client-side type for creating RFQs (orgId and userId are handled server-side)
export type CreateRfqData = Omit<
  NewRfq,
  'orgId' | 'userId' | 'id' | 'createdAt' | 'updatedAt' | 'statusHistory' | 'sentAt'
> & {
  // ISO string for API transport (null becomes undefined for optional fields)
  sentAt?: string | null;
};

/**
 * Get an RFQ by ID
 */
export async function getRfq(id: Rfq['id']): Promise<Rfq> {
  const res = await api.get(`/api/rfqs?id=${id}`);
  return res.data;
}

/**
 * Get all RFQs for the current organization
 */
export async function getRfqs(): Promise<Rfq[]> {
  const res = await api.get('/api/rfqs');
  return res.data;
}

/**
 * Create a new RFQ
 */
export async function createRfq(data: NewRfq): Promise<Rfq> {
  const res = await api.post('/api/rfqs', data);
  return res.data;
}

/**
 * Update an existing RFQ
 */
export async function updateRfq(id: Rfq['id'], data: Partial<NewRfq>): Promise<Rfq> {
  const res = await api.put(`/api/rfqs?id=${id}`, data);
  return res.data;
}

/**
 * Delete an RFQ
 */
export async function deleteRfq(id: Rfq['id']): Promise<void> {
  await api.delete(`/api/rfqs?id=${id}`);
}

/**
 * Extract RFQ from file
 */
export async function extractRfq(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await backendApi.post('/api/v1/technical/rfqs/extract', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // The backend returns a ResponseEnvelope, so extract the data
  return res.data.data;
}
