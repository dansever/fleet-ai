import type { Organization, Vendor, VendorContact } from '@/drizzle/types';
import { api } from '@/services/api-client';
import { VendorContactCreateInput, VendorContactUpdateInput } from './vendor-contacts.types';

/**
 * Get a vendor contact by ID
 */
export async function getVendorContactById(id: VendorContact['id']): Promise<VendorContact> {
  const res = await api.get(`/api/vendor-contacts/${id}`);
  return res.data;
}

/**
 * Get all vendor contacts for an organization
 */
export async function listVendorContactsByOrg(
  orgId?: Organization['id'],
): Promise<VendorContact[]> {
  const url = orgId ? `/api/vendor-contacts?orgId=${orgId}` : '/api/vendor-contacts';
  const res = await api.get(url);
  return res.data;
}

/**
 * Get all vendor contacts for a vendor
 */
export async function listVendorContactsByVendor(vendorId: Vendor['id']): Promise<VendorContact[]> {
  const res = await api.get(`/api/vendor-contacts?vendorId=${vendorId}`);
  return res.data;
}

/**
 * Create a new vendor contact
 */
export async function createVendorContact(data: VendorContactCreateInput): Promise<VendorContact> {
  const res = await api.post('/api/vendor-contacts', data);
  return res.data;
}

/**
 * Update an existing vendor contact
 */
export async function updateVendorContact(
  id: string,
  data: VendorContactUpdateInput,
): Promise<VendorContact> {
  const res = await api.put(`/api/vendor-contacts/${id}`, data);
  return res.data;
}

/**
 * Delete a vendor contact
 */
export async function deleteVendorContact(id: string): Promise<void> {
  await api.delete(`/api/vendor-contacts/${id}`);
}
