import type { FuelBid, FuelTender, NewFuelBid } from '@/drizzle/types';
import { api, backendApi } from '../api-client';

// Client-side type for creating Fuel Bids (server handles system fields)
export type CreateFuelBidData = Omit<
  NewFuelBid,
  'id' | 'createdAt' | 'updatedAt' | 'decisionByUserId' | 'decisionAt'
> & {
  // ISO string for API transport (null becomes undefined for optional fields)
  bidSubmittedAt?: string | null;
};

// Client-side type for updating Fuel Bids
export type UpdateFuelBidData = Partial<CreateFuelBidData>;

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
export async function createFuelBid(
  tenderId: FuelTender['id'],
  data: CreateFuelBidData,
): Promise<FuelBid> {
  const res = await api.post(`/api/fuel-bids?tenderId=${tenderId}`, data);
  return res.data;
}

/**
 * Update an existing fuel bid
 */
export async function updateFuelBid(id: string, data: UpdateFuelBidData): Promise<FuelBid> {
  const res = await api.put(`/api/fuel-bids?id=${id}`, data);
  return res.data;
}

/**
 * Delete a fuel bid
 */
export async function deleteFuelBid(id: FuelBid['id']): Promise<void> {
  await api.delete(`/api/fuel-bids?id=${id}`);
}

// Type for the extracted fuel bid data from backend
export interface ExtractedFuelBidData {
  vendorName?: string;
  vendorContactName?: string;
  vendorContactEmail?: string;
  vendorContactPhone?: string;
  baseUnitPrice?: number;
  currency?: string;
  uom?: string;
  priceType?: string;
  indexName?: string;
  indexLocation?: string;
  differential?: string;
  differentialUnit?: string;
  formulaNotes?: string;
  intoPlaneFee?: number;
  handlingFee?: number;
  otherFee?: number;
  otherFeeDescription?: string;
  paymentTerms?: string;
  includesTaxes?: boolean;
  includesAirportFees?: boolean;
  densityAt15C?: number;
  vendorComments?: string;
  [key: string]: unknown; // Allow for additional fields
}

/**
 * Extract fuel bid from file
 */
export async function extractFuelBid(file: File): Promise<ExtractedFuelBidData> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await backendApi.post('/api/v1/fuel/bids/extract', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // The backend returns a ResponseEnvelope, so extract the data
  return res.data.data as ExtractedFuelBidData;
}
