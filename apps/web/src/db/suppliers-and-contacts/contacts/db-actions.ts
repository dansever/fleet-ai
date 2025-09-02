import { db } from '@/drizzle';
import { contactsTable } from '@/drizzle/schema';
import { Airport, Contact, NewContact, Organization, UpdateContact } from '@/drizzle/types';
import { and, eq } from 'drizzle-orm';

/**
 * Get a contact by id
 * @param id - The id of the contact to get
 * @returns The contact with the given id
 */
export const getContactById = async (
  id: Contact['id'],
  orgId: Organization['id'],
): Promise<Contact | null> => {
  const contact = await db
    .select()
    .from(contactsTable)
    .where(and(eq(contactsTable.id, id), eq(contactsTable.orgId, orgId)))
    .limit(1);
  return contact[0] || null;
};

/**
 * Get all contacts by airport id
 * @param airportId - The id of the airport to get contacts for
 * @returns All contacts for the given airport
 */
export const getContactsByAirport = async (
  airportId: Airport['id'],
  orgId: Organization['id'],
): Promise<Contact[]> => {
  const contacts = await db
    .select()
    .from(contactsTable)
    .where(and(eq(contactsTable.airportId, airportId), eq(contactsTable.orgId, orgId)));
  return contacts;
};

/**
 * Get all contacts by organization id
 * @param orgId - The id of the organization to get contacts for
 * @returns All contacts for the given organization
 */
export const getContactsByOrg = async (orgId: Organization['id']): Promise<Contact[]> => {
  const contacts = await db.select().from(contactsTable).where(eq(contactsTable.orgId, orgId));
  return contacts;
};

/**
 * Create a new contact
 * @param contact - The contact to create
 * @returns The created contact
 */
export const createContact = async (contact: NewContact): Promise<Contact> => {
  const [newContact] = await db.insert(contactsTable).values(contact).returning();
  return newContact;
};

/**
 * Update an existing contact
 * @param id - The id of the contact to update
 * @param contact - The contact to update
 * @returns The updated contact
 */
export const updateContact = async (
  id: Contact['id'],
  contact: UpdateContact,
): Promise<Contact> => {
  const [updatedContact] = await db
    .update(contactsTable)
    .set(contact)
    .where(eq(contactsTable.id, id))
    .returning();
  return updatedContact;
};

/**
 * Delete a contact
 * @param id - The id of the contact to delete
 */
export const deleteContact = async (id: Contact['id']): Promise<void> => {
  await db.delete(contactsTable).where(eq(contactsTable.id, id));
};
