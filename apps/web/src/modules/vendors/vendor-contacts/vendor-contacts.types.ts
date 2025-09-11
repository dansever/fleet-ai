// src/modules/vendors/contacts/contacts.types.ts
/**
 * Contact types for form handling and API requests
 */

import type { NewVendorContact } from '@/drizzle/types';

/**
 * For creating contacts from forms - excludes server-managed fields
 */
export type VendorContactCreateInput = Omit<
  NewVendorContact,
  'id' | 'orgId' | 'createdAt' | 'updatedAt'
>;

/**
 * For updating contacts from forms - all fields optional
 */
export type VendorContactUpdateInput = Partial<VendorContactCreateInput>;
