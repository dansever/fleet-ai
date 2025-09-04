// src/modules/contracts/contract.types.ts
/**
 * Contract types for form handling and API requests
 */

import type { NewContractRule } from '@/drizzle/types';

/**
 * For creating contract rules from forms - excludes server-managed fields
 */
export type ContractRuleCreateInput = Omit<
  NewContractRule,
  'id' | 'orgId' | 'createdAt' | 'updatedAt'
> & {
  // Allow date fields as strings (from forms) or Date objects
  activeFrom?: string | Date | null;
  activeTo?: string | Date | null;
};

/**
 * For updating contract rules from forms - all fields optional
 */
export type ContractRuleUpdateInput = Partial<ContractRuleCreateInput>;
