// src/modules/fuel-mgmt/tenders/tenders.types.ts
/**
 * Simple Fuel Tender types for form handling and API requests
 */

import type { NewFuelTender } from '@/drizzle/types';

/**
 * For creating fuel tenders from forms - excludes server-managed fields
 * Date fields accept strings (from forms) and get converted to Date objects
 */
export type FuelTenderCreateInput = Omit<
  NewFuelTender,
  'id' | 'orgId' | 'createdAt' | 'updatedAt'
> & {
  // Allow date fields as strings (from forms) or Date objects
  biddingStarts?: string | Date | null;
  biddingEnds?: string | Date | null;
  deliveryStarts?: string | Date | null;
  deliveryEnds?: string | Date | null;
};

/**
 * For updating fuel tenders from forms - all fields optional except id is excluded
 */
export type FuelTenderUpdateInput = Partial<FuelTenderCreateInput>;
