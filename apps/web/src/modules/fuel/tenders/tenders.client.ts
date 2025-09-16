import type { FuelTender } from '@/drizzle/types';
import { api, backendApi } from '@/services/api-client';
import { FuelTenderCreateInput, FuelTenderUpdateInput } from './tenders.types';

/**
 * Get a fuel tender by ID
 */
export async function getFuelTender(id: FuelTender['id']): Promise<FuelTender> {
  const res = await api.get(`/api/fuel-tenders/${id}`);
  return res.data;
}

/**
 * Get fuel tenders by tender ID
 */
export async function listFuelTendersByTender(tenderId: string): Promise<FuelTender[]> {
  const res = await api.get(`/api/fuel-tenders?tenderId=${tenderId}`);
  return res.data;
}

/**
 * Get fuel tenders by organization
 */
export async function listFuelTendersByOrg(): Promise<FuelTender[]> {
  const res = await api.get('/api/fuel-tenders');
  return res.data;
}

/**
 * Create a new fuel bid
 */
export async function createFuelTender(
  tenderId: FuelTender['id'],
  data: FuelTenderCreateInput,
): Promise<FuelTender> {
  const res = await api.post(`/api/fuel-tenders?tenderId=${tenderId}`, data);
  return res.data;
}

/**
 * Update an existing fuel tender
 */
export async function updateFuelTender(
  id: string,
  data: FuelTenderUpdateInput,
): Promise<FuelTender> {
  const res = await api.put(`/api/fuel-tenders?id=${id}`, data);
  return res.data;
}

/**
 * Delete a fuel tender
 */
export async function deleteFuelTender(id: FuelTender['id']): Promise<void> {
  await api.delete(`/api/fuel-tenders/${id}`);
}

// Type for the extracted fuel bid data from backend
export interface ExtractedFuelTenderData {
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
 * Extract fuel tender from file
 */
export async function extractFuelTender(file: File): Promise<ExtractedFuelTenderData> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await backendApi.post('/api/v1/fuel/tenders/extract', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // The backend returns a ResponseEnvelope, so extract the data
  return res.data.data as ExtractedFuelTenderData;
}
