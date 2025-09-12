'use server';
import 'server-only';

import { db } from '@/drizzle';
import { vendorsTable } from '@/drizzle/schema/schema.vendors';
import { NewVendor, Organization, UpdateVendor, Vendor } from '@/drizzle/types';
import { and, eq } from 'drizzle-orm';

/**
 * Get a vendor by ID
 */
export async function getVendorById(id: Vendor['id']): Promise<Vendor | null> {
  const result = await db.select().from(vendorsTable).where(eq(vendorsTable.id, id)).limit(1);
  return result[0] ?? null;
}

/**
 * Get all vendors for an organization
 */
export async function listVendorsByOrg(orgId: Organization['id']): Promise<Vendor[]> {
  const vendors = await db.select().from(vendorsTable).where(eq(vendorsTable.orgId, orgId));
  return vendors;
}

/**
 * Create a new vendor
 */
export async function createVendor(data: NewVendor): Promise<Vendor> {
  const result = await db
    .insert(vendorsTable)
    .values(data)
    .onConflictDoNothing({ target: [vendorsTable.orgId, vendorsTable.name] })
    .returning();
  return result[0];
}

/**
 * Update a vendor
 */
export async function updateVendor(id: Vendor['id'], data: UpdateVendor): Promise<Vendor> {
  const result = await db
    .update(vendorsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(vendorsTable.id, id))
    .returning();
  return result[0];
}

/**
 * Delete a vendor
 */
export async function deleteVendor(id: Vendor['id']): Promise<void> {
  await db.delete(vendorsTable).where(eq(vendorsTable.id, id));
}

/**
 * Get vendor by name within an organization
 */
export async function getVendorByName(
  orgId: Organization['id'],
  name: string,
): Promise<Vendor | null> {
  const result = await db
    .select()
    .from(vendorsTable)
    .where(and(eq(vendorsTable.orgId, orgId), eq(vendorsTable.name, name)))
    .limit(1);
  return result[0] ?? null;
}
