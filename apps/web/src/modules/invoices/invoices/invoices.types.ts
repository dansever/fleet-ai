// src/modules/contracts/invoices/invoices.types.ts
/**
 * Invoice types for form handling and API requests
 */

import type { NewInvoice } from '@/drizzle/types';

/**
 * For creating invoices from forms - excludes server-managed fields
 */
export type InvoiceCreateInput = Omit<NewInvoice, 'id' | 'orgId' | 'createdAt' | 'updatedAt'> & {
  // Allow date fields as strings (from forms) or Date objects
  invoiceDate?: string | Date | null;
  periodStart?: string | Date | null;
  periodEnd?: string | Date | null;
};

/**
 * For updating invoices from forms - all fields optional
 */
export type InvoiceUpdateInput = Partial<InvoiceCreateInput>;
