'use server';
import 'server-only';

import { db } from '@/drizzle';
import { vendorContactsTable } from '@/drizzle/schema/schema.vendors';
import {
  NewVendorContact,
  Organization,
  UpdateVendorContact,
  Vendor,
  VendorContact,
} from '@/drizzle/types';
import { eq } from 'drizzle-orm';

/**
 * Get a vendor contact by ID
 */
export async function getVendorContactById(id: VendorContact['id']): Promise<VendorContact | null> {
  const result = await db
    .select()
    .from(vendorContactsTable)
    .where(eq(vendorContactsTable.id, id))
    .limit(1);
  return result[0] ?? null;
}

/**
 * Get all vendor contacts for an organization
 */
export async function listVendorContactsByOrg(orgId: Organization['id']): Promise<VendorContact[]> {
  const contacts = await db
    .select()
    .from(vendorContactsTable)
    .where(eq(vendorContactsTable.orgId, orgId));
  return contacts;
}

/**
 * Get all vendor contacts for a vendor
 */
export async function listVendorContactsByVendor(vendorId: Vendor['id']): Promise<VendorContact[]> {
  const contacts = await db
    .select()
    .from(vendorContactsTable)
    .where(eq(vendorContactsTable.vendorId, vendorId));
  return contacts;
}

/**
 * Create a new vendor contact
 */
export async function createVendorContact(data: NewVendorContact): Promise<VendorContact> {
  const result = await db.insert(vendorContactsTable).values(data).returning();
  return result[0];
}

/**
 * Update a vendor contact
 */
export async function updateVendorContact(
  id: VendorContact['id'],
  data: UpdateVendorContact,
): Promise<VendorContact> {
  const result = await db
    .update(vendorContactsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(vendorContactsTable.id, id))
    .returning();
  return result[0];
}

/**
 * Delete a vendor contact
 */
export async function deleteVendorContact(id: VendorContact['id']): Promise<void> {
  await db.delete(vendorContactsTable).where(eq(vendorContactsTable.id, id));
}
