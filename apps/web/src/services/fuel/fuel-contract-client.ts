import type { FuelContract, NewFuelContract } from '@/drizzle/types';
import { api } from '../api-client';

// Client-side type for creating fuel contracts (orgId is handled server-side)
export type CreateFuelContractData = Omit<
  NewFuelContract,
  'orgId' | 'id' | 'createdAt' | 'updatedAt'
> & {
  // ISO string for API transport (null becomes undefined for optional fields)
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
};

/**
 * Get a fuel contract by ID
 */
export async function getFuelContract(id: FuelContract['id']): Promise<FuelContract> {
  const res = await api.get(`/api/fuel-contracts?id=${id}`);
  return res.data;
}

/**
 * Get fuel contracts by airport
 */
export async function getFuelContractsByAirport(airportId: string): Promise<FuelContract[]> {
  const res = await api.get(`/api/fuel-contracts?airportId=${airportId}`);
  return res.data;
}

/**
 * Create a new fuel contract
 */
export async function createFuelContract(data: CreateFuelContractData): Promise<FuelContract> {
  const res = await api.post('/api/fuel-contracts', data);
  return res.data;
}

/**
 * Update an existing fuel contract
 */
export async function updateFuelContract(
  id: FuelContract['id'],
  data: Partial<CreateFuelContractData>,
): Promise<FuelContract> {
  const res = await api.put(`/api/fuel-contracts?id=${id}`, data);
  return res.data;
}

/**
 * Delete a fuel contract
 */
export async function deleteFuelContract(id: FuelContract['id']): Promise<void> {
  await api.delete(`/api/fuel-contracts?id=${id}`);
}

/**
 * Extract fuel contract data from uploaded file
 */
export interface ExtractedFuelContractData {
  contractNumber?: string;
  title?: string;
  fuelType?: string;
  vendorName?: string;
  vendorAddress?: string;
  vendorContactName?: string;
  vendorContactEmail?: string;
  vendorContactPhone?: string;
  currency?: string;
  priceType?: string;
  priceFormula?: string;
  baseUnitPrice?: number;
  volumeCommitted?: number;
  volumeUnit?: string;
  intoPlaneFee?: number;
  includesTaxes?: boolean;
  includesAirportFees?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
  aiSummary?: string;
  [key: string]: unknown; // Allow for additional fields
}

export async function extractFuelContract(file: File): Promise<ExtractedFuelContractData> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post('/api/fuel-contracts/extract', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data.data as ExtractedFuelContractData;
}

/**
 * Generate random fuel contract data for testing
 */
export async function generateRandomFuelContract(airportId: string): Promise<FuelContract> {
  const res = await api.post('/api/fuel-contracts/generate-random', { airportId });
  return res.data;
}
