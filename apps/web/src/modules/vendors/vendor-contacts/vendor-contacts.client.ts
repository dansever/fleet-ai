import type { Organization, Vendor, VendorContact } from '@/drizzle/types';
import { api } from '@/services/api-client';
import { VendorContactCreateInput, VendorContactUpdateInput } from './vendor-contacts.types';

/**
 * Get a contact by ID
 */
export async function getContact(id: VendorContact['id']): Promise<VendorContact> {
  const res = await api.get(`/api/contacts/${id}`);
  return res.data;
}

/**
 * Get all contacts for an organization
 */
export async function listContactsByOrg(orgId?: Organization['id']): Promise<VendorContact[]> {
  const url = orgId ? `/api/contacts?orgId=${orgId}` : '/api/contacts';
  const res = await api.get(url);
  return res.data;
}

/**
 * Get all contacts for a vendor
 */
export async function listContactsByVendor(vendorId: Vendor['id']): Promise<VendorContact[]> {
  const res = await api.get(`/api/contacts?vendorId=${vendorId}`);
  return res.data;
}

/**
 * Create a new contact
 */
export async function createContact(data: VendorContactCreateInput): Promise<VendorContact> {
  const res = await api.post('/api/contacts', data);
  return res.data;
}

/**
 * Update an existing contact
 */
export async function updateContact(
  id: string,
  data: VendorContactUpdateInput,
): Promise<VendorContact> {
  const res = await api.put(`/api/contacts/${id}`, data);
  return res.data;
}

/**
 * Delete a contact
 */
export async function deleteContact(id: string): Promise<void> {
  await api.delete(`/api/contacts/${id}`);
}
