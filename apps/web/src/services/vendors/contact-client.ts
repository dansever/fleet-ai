import { Contact, NewContact, UpdateContact } from '@/drizzle/types';
import { api } from '../api-client';

/**
 * Get all contacts for the current organization
 * @returns Array of contacts
 */
export async function getContacts(): Promise<Contact[]> {
  const res = await api.get('/api/contacts');
  return res.data;
}

/**
 * Get contacts by airport ID
 * @param airportId - The airport ID to filter contacts by
 * @returns Array of contacts for the specified airport
 */
export async function getContactsByAirport(
  airportId: string,
): Promise<Contact[]> {
  const res = await api.get(`/api/contacts/by-airport/${airportId}`);
  return res.data;
}

/**
 * Get all contacts related to an airport (both direct airport contacts and vendor contacts)
 * @param airportId - The airport ID to filter contacts by
 * @returns Array of all contacts related to the airport
 */
export async function getAllContactsByAirport(
  airportId: string,
): Promise<Contact[]> {
  const res = await api.get(`/api/contacts/all-by-airport/${airportId}`);
  return res.data;
}

/**
 * Get a contact by its ID
 * @param id - The contact ID to retrieve
 * @returns The contact
 */
export async function getContactById(id: string): Promise<Contact> {
  const res = await api.get(`/api/contacts/${id}`);
  return res.data;
}

/**
 * Create a new contact
 * @param contact - The contact data to create
 * @returns The created contact
 */
export async function createContact(contact: NewContact): Promise<Contact> {
  const res = await api.post('/api/contacts', contact);
  return res.data;
}

/**
 * Update a contact by its ID
 * @param id - The contact ID to update
 * @param contact - The contact data to update
 * @returns The updated contact
 */
export async function updateContact(
  id: string,
  contact: UpdateContact,
): Promise<Contact> {
  const res = await api.put(`/api/contacts/${id}`, contact);
  return res.data;
}

/**
 * Delete a contact by its ID
 * @param id - The contact ID to delete
 */
export async function deleteContact(id: string): Promise<void> {
  await api.delete(`/api/contacts/${id}`);
}
