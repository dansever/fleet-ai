import type { FuelBid, NewFuelBid, UpdateFuelBid } from '@/drizzle/types';
import { api } from '../api-client';

/**
 * Get a fuel bid by ID
 */
export async function getFuelBid(id: FuelBid['id']): Promise<FuelBid> {
  const res = await api.get(`/api/fuel-bids?id=${id}`);
  return res.data;
}

/**
 * Get fuel bids by tender ID
 */
export async function getFuelBidsByTender(tenderId: string): Promise<FuelBid[]> {
  const res = await api.get(`/api/fuel-bids?tenderId=${tenderId}`);
  return res.data;
}

/**
 * Get fuel bids by organization
 */
export async function getFuelBidsByOrg(): Promise<FuelBid[]> {
  const res = await api.get('/api/fuel-bids');
  return res.data;
}

/**
 * Create a new fuel bid
 */
export async function createFuelBid(data: NewFuelBid): Promise<FuelBid> {
  const res = await api.post('/api/fuel-bids', data);
  return res.data;
}

/**
 * Update an existing fuel bid
 */
export async function updateFuelBid(id: string, data: UpdateFuelBid): Promise<FuelBid> {
  const res = await api.put(`/api/fuel-bids?id=${id}`, data);
  return res.data;
}

/**
 * Delete a fuel bid
 */
export async function deleteFuelBid(id: string): Promise<void> {
  await api.delete(`/api/fuel-bids?id=${id}`);
}
