// src/modules/contracts/contracts/contracts.types.ts
/**
 * Contract types for form handling and API requests
 */

import type { NewContract } from '@/drizzle/types';

/**
 * For creating contracts from forms - excludes server-managed fields
 */
export type ContractCreateInput = Omit<NewContract, 'id' | 'orgId' | 'createdAt' | 'updatedAt'> & {
  // Allow date fields as strings (from forms) or Date objects
  effectiveFrom?: string | Date | null;
  effectiveTo?: string | Date | null;
};

/**
 * For updating contracts from forms - all fields optional
 */
export type ContractUpdateInput = Partial<ContractCreateInput>;
