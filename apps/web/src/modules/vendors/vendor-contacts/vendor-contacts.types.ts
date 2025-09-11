/**
 * Vendor contact types for form handling and API requests
 */

import type { NewVendorContact } from '@/drizzle/types';

/**
 * For creating vendor contacts from forms - excludes server-managed fields
 */
export type VendorContactCreateInput = Omit<
  NewVendorContact,
  'id' | 'orgId' | 'createdAt' | 'updatedAt'
>;

/**
 * For updating vendor contacts from forms - all fields optional
 */
export type VendorContactUpdateInput = Partial<VendorContactCreateInput>;
