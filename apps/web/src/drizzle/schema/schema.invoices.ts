import { relations } from 'drizzle-orm';
import {
  date,
  foreignKey,
  index,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { InvoiceStatusEnum } from '../enums';
import { createdAt, updatedAt } from './common';
import { contractsTable } from './schema.contracts';
import { organizationsTable } from './schema.core';
import { documentsTable } from './schema.documents';
import { vendorsTable } from './schema.vendors';

// -------------------- Invoices --------------------
export const invoicesTable = pgTable(
  'invoices',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(), //fk to orgs table
    vendorId: uuid('vendor_id'), //fk to vendors table
    contractId: uuid('contract_id'), //fk to contracts table

    // Identity
    invoiceNumber: text('invoice_number').notNull(), // number of the invoice
    invoiceDate: date('invoice_date'), // date when the invoice was issued

    // Vendor Information
    vendorName: text('vendor_name'),
    vendorAddress: text('vendor_address'),
    vendorContactName: text('vendor_contact_name'),
    vendorContactEmail: text('vendor_contact_email'),
    vendorContactPhone: text('vendor_contact_phone'),
    vendorComments: text('vendor_comments'),

    // LLM Information
    summary: text('summary'),
    chargesNarrative: text('charges_narrative'), // how totals were computed, surcharges, credits
    disputesNotes: text('disputes_notes'), // if any discrepancies/exceptions
    tags: jsonb('tags').default({}), // {vatRate:"17%", costCenter:"Ops", notes:"…"}

    // Period
    periodStart: date('period_start'), // start date of the invoice period
    periodEnd: date('period_end'), // end date of the invoice period

    // Invoice Status
    invoiceStatus: InvoiceStatusEnum('invoice_status').default('received'),

    // Timestamps
    createdAt,
    updatedAt,
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_invoices_org_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.contractId],
      foreignColumns: [contractsTable.id],
      name: 'fk_invoices_contract_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.vendorId],
      foreignColumns: [vendorsTable.id],
      name: 'fk_invoices_vendor_id',
    }).onDelete('cascade'),

    // Unique index on orgId, vendorId, invoiceNumber
    uniqueIndex('invoices_vendor_number_uniq').on(table.orgId, table.vendorId, table.invoiceNumber),
    // Index on invoiceStatus
    index('invoices_status_idx').on(table.invoiceStatus),
    // Index on periodStart and periodEnd
    index('invoices_period_idx').on(table.periodStart, table.periodEnd),
    // Index on tags
    index('invoices_tags_gin').using('gin', table.tags),
  ],
);

/* -------------------- Invoices Relations -------------------- */
export const invoicesRelations = relations(invoicesTable, ({ one, many }) => ({
  // Each invoice can have one organization
  organization: one(organizationsTable, {
    fields: [invoicesTable.orgId],
    references: [organizationsTable.id],
  }),
  // Each invoice can have one vendor
  vendor: one(vendorsTable, {
    fields: [invoicesTable.vendorId],
    references: [vendorsTable.id],
  }),
  // Each invoice can have one contract
  contract: one(contractsTable, {
    fields: [invoicesTable.contractId],
    references: [contractsTable.id],
  }),
  // if you want reverse navigation
  documents: many(documentsTable),
}));
