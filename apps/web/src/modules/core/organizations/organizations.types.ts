// src/modules/core/organizations/organizations.types.ts
/**
 * Organization types for form handling and API requests
 */

import type { NewOrganization } from '@/drizzle/types';

/**
 * For creating organizations from forms - excludes server-managed fields
 */
export type OrganizationCreateInput = Omit<NewOrganization, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * For updating organizations from forms - all fields optional
 */
export type OrganizationUpdateInput = Partial<OrganizationCreateInput>;

/**
 * Organization usage update data
 */
export type OrganizationUsageUpdate = {
  aiTokenUsage?: number;
  totalQuotesProcessed?: number;
  totalRfqsProcessed?: number;
};
