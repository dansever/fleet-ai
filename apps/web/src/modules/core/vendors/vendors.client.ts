import type { Organization, Vendor } from '@/drizzle/types';
import { api } from '@/services/api-client';
import { VendorCreateInput, VendorUpdateInput } from './vendors.types';

/**
 * Get a vendor by ID
 */
export async function getVendorById(id: Vendor['id']): Promise<Vendor> {
  const res = await api.get(`/api/vendors?id=${id}`);
  return res.data;
}

/**
 * Get all vendors for an organization
 */
export async function listVendorsByOrgId(orgId?: Organization['id']): Promise<Vendor[]> {
  const url = orgId ? `/api/vendors?orgId=${orgId}` : '/api/vendors';
  const res = await api.get(url);
  return res.data;
}

/**
 * Create a new vendor
 */
export async function createVendor(data: VendorCreateInput): Promise<Vendor> {
  const res = await api.post('/api/vendors', data);
  return res.data;
}

/**
 * Update an existing vendor
 */
export async function updateVendor(id: string, data: VendorUpdateInput): Promise<Vendor> {
  const res = await api.put(`/api/vendors?id=${id}`, data);
  return res.data;
}

/**
 * Delete a vendor
 */
export async function deleteVendor(id: string): Promise<void> {
  await api.delete(`/api/vendors?id=${id}`);
}
