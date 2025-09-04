// src/modules/invoices/invoice-lines.types.ts
/**
 * Invoice line types for form handling and API requests
 */

import type { NewInvoiceLine } from '@/drizzle/types';

/**
 * For creating invoice lines from forms - excludes server-managed fields
 */
export type InvoiceLineCreateInput = Omit<
  NewInvoiceLine,
  'id' | 'orgId' | 'createdAt' | 'updatedAt'
>;

/**
 * For updating invoice lines from forms - all fields optional
 */
export type InvoiceLineUpdateInput = Partial<InvoiceLineCreateInput>;
