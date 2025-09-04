// src/modules/rfqs/rfqs.types.ts
/**
 * Simple RFQ types for form handling and API requests
 */

import type { NewRfq } from '@/drizzle/types';

/**
 * For creating RFQs from forms - excludes server-managed fields
 * Date fields accept strings (from forms) and get converted to Date objects
 */
export type RfqCreateInput = Omit<NewRfq, 'id' | 'orgId' | 'createdAt' | 'updatedAt' | 'sentAt'> & {
  // Allow date fields as strings (from forms) or Date objects
  sentAt?: string | Date | null;
};

/**
 * For updating RFQs from forms - all fields optional except id is excluded
 */
export type RfqUpdateInput = Partial<RfqCreateInput>;
