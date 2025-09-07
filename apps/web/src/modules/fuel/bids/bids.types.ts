// src/modules/fuel-mgmt/bids/bids.types.ts
/**
 * Simple Fuel Bid types for form handling and API requests
 */

import type { NewFuelBid } from '@/drizzle/types';

/**
 * For creating fuel bids from forms - excludes server-managed fields
 * Date fields accept strings (from forms) and get converted to Date objects
 */
export type FuelBidCreateInput = Omit<
  NewFuelBid,
  'id' | 'createdAt' | 'updatedAt' | 'decisionAt'
> & {
  // Allow date fields as strings (from forms) or Date objects
  bidSubmittedAt?: string | Date | null;
};

/**
 * For updating fuel bids from forms - all fields optional except id is excluded
 */
export type FuelBidUpdateInput = Partial<FuelBidCreateInput>;
