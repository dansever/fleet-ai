'use server';
import 'server-only';

import { db } from '@/drizzle';
import { contactsTable } from '@/drizzle/schema/schema.core';
import { Contact, NewContact, Organization, UpdateContact, Vendor } from '@/drizzle/types';
import { eq } from 'drizzle-orm';

/**
 * Get a contact by ID
 */
export async function getContactById(id: Contact['id']): Promise<Contact | null> {
  const result = await db.select().from(contactsTable).where(eq(contactsTable.id, id)).limit(1);
  return result[0] ?? null;
}
// Backward compatible alias
export const getContact = getContactById;

/**
 * Get all contacts for an organization
 */
export async function listContactsByOrg(orgId: Organization['id']): Promise<Contact[]> {
  const contacts = await db.select().from(contactsTable).where(eq(contactsTable.orgId, orgId));
  return contacts;
}

/**
 * Get all contacts for a vendor
 */
export async function listContactsByVendor(vendorId: Vendor['id']): Promise<Contact[]> {
  const contacts = await db
    .select()
    .from(contactsTable)
    .where(eq(contactsTable.vendorId, vendorId));
  return contacts;
}

/**
 * Create a new contact
 */
export async function createContact(data: NewContact): Promise<Contact> {
  const result = await db.insert(contactsTable).values(data).returning();
  return result[0];
}

/**
 * Update a contact
 */
export async function updateContact(id: Contact['id'], data: UpdateContact): Promise<Contact> {
  const result = await db
    .update(contactsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(contactsTable.id, id))
    .returning();
  return result[0];
}

/**
 * Delete a contact
 */
export async function deleteContact(id: Contact['id']): Promise<void> {
  await db.delete(contactsTable).where(eq(contactsTable.id, id));
}
