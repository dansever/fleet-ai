// src/modules/vendors/contacts/contacts.types.ts
/**
 * Contact types for form handling and API requests
 */

import type { NewContact } from '@/drizzle/types';

/**
 * For creating contacts from forms - excludes server-managed fields
 */
export type ContactCreateInput = Omit<NewContact, 'id' | 'orgId' | 'createdAt' | 'updatedAt'>;

/**
 * For updating contacts from forms - all fields optional
 */
export type ContactUpdateInput = Partial<ContactCreateInput>;
