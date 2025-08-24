import type { Airport, FuelTender, NewFuelTender, UpdateFuelTender } from '@/drizzle/types';
import { api } from '../api-client';

// Client-side type for creating fuel tenders (orgId is handled server-side)
export type CreateFuelTenderData = Omit<
  NewFuelTender,
  'orgId' | 'id' | 'createdAt' | 'updatedAt'
> & {
  // ISO string for API transport (null becomes undefined for optional fields)
  biddingStarts?: string | null;
  biddingEnds?: string | null;
  deliveryStarts?: string | null;
  deliveryEnds?: string | null;
};

/**
 * Get a fuel tender by ID
 */
export async function getFuelTender(id: FuelTender['id']): Promise<FuelTender> {
  const res = await api.get(`/api/fuel-tenders?id=${id}`);
  return res.data;
}

/**
 * Get fuel tenders by airport
 */
export async function getFuelTendersByAirport(airportId: Airport['id']): Promise<FuelTender[]> {
  const res = await api.get(`/api/fuel-tenders?airportId=${airportId}`);
  return res.data;
}

/**
 * Create a new fuel tender
 */
export async function createFuelTender(data: CreateFuelTenderData): Promise<FuelTender> {
  const res = await api.post('/api/fuel-tenders', data);
  return res.data;
}

/**
 * Update an existing fuel tender
 */
export async function updateFuelTender(
  id: FuelTender['id'],
  data: UpdateFuelTender,
): Promise<FuelTender> {
  const res = await api.put(`/api/fuel-tenders?id=${id}`, data);
  return res.data;
}

/**
 * Delete a fuel tender
 */
export async function deleteFuelTender(id: FuelTender['id']): Promise<void> {
  await api.delete(`/api/fuel-tenders?id=${id}`);
}
