import type { FuelBid, FuelTender } from '@/drizzle/types';
import { api } from '@/services/api-client';
import { FuelBidCreateInput, FuelBidUpdateInput } from './bids.types';

/**
 * Get a fuel bid by ID
 */
export async function getFuelBid(id: FuelBid['id']): Promise<FuelBid> {
  const res = await api.get(`/api/fuel/bids/${id}`);
  return res.data;
}

/**
 * Get fuel bids by tender ID
 */
export async function listFuelBidsByTender(tenderId: string): Promise<FuelBid[]> {
  const res = await api.get(`/api/fuel/bids?tenderId=${tenderId}`);
  return res.data;
}

/**
 * Get fuel bids by organization
 */
export async function listFuelBidsByOrg(): Promise<FuelBid[]> {
  const res = await api.get('/api/fuel/bids');
  return res.data;
}

/**
 * Create a new fuel bid
 */
export async function createFuelBid(
  tenderId: FuelTender['id'],
  data: FuelBidCreateInput,
): Promise<FuelBid> {
  const res = await api.post(`/api/fuel/bids?tenderId=${tenderId}`, data);
  return res.data;
}

/**
 * Update an existing fuel bid
 */
export async function updateFuelBid(id: string, data: FuelBidUpdateInput): Promise<FuelBid> {
  const res = await api.put(`/api/fuel/bids?id=${id}`, data);
  return res.data;
}

/**
 * Delete a fuel bid
 */
export async function deleteFuelBid(id: FuelBid['id']): Promise<void> {
  await api.delete(`/api/fuel/bids/${id}`);
}

/**
 * Process a fuel bid using the unified file processing API
 */
export async function ExtractFuelBid(tenderId: FuelTender['id'], file: File): Promise<FuelBid> {
  if (!tenderId || !file) throw new Error('Tender ID and file are required');

  // Create form data for unified API
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', 'fuel_bid');
  formData.append('parentId', tenderId);

  // Use unified file processing endpoint
  const res = await api.post('/api/files/process', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (res.status !== 200) throw new Error('Failed to process fuel bid');
  return res.data;
}
