import type { FuelTender, NewFuelTender, UpdateFuelTender } from '@/drizzle/types';
import { api } from '../api-client';

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
export async function getFuelTendersByAirport(airportId: string): Promise<FuelTender[]> {
  const res = await api.get(`/api/fuel-tenders?airportId=${airportId}`);
  return res.data;
}

/**
 * Create a new fuel tender
 */
export async function createFuelTender(data: NewFuelTender): Promise<FuelTender> {
  const res = await api.post('/api/fuel-tenders', data);
  return res.data;
}

/**
 * Update an existing fuel tender
 */
export async function updateFuelTender(id: string, data: UpdateFuelTender): Promise<FuelTender> {
  const res = await api.put(`/api/fuel-tenders?id=${id}`, data);
  return res.data;
}

/**
 * Delete a fuel tender
 */
export async function deleteFuelTender(id: string): Promise<void> {
  await api.delete(`/api/fuel-tenders?id=${id}`);
}
