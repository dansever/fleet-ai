// src/modules/vendors/vendors/vendors.types.ts
/**
 * Vendor types for form handling and API requests
 */

import type { NewVendor } from '@/drizzle/types';

/**
 * For creating vendors from forms - excludes server-managed fields
 */
export type VendorCreateInput = Omit<NewVendor, 'id' | 'orgId' | 'createdAt' | 'updatedAt'>;

/**
 * For updating vendors from forms - all fields optional
 */
export type VendorUpdateInput = Partial<VendorCreateInput>;
