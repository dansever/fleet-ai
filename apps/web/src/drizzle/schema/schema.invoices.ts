import { relations } from 'drizzle-orm';
import {
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  vector,
} from 'drizzle-orm/pg-core';
import { InvoiceStatusEnum } from '../enums';
import { createdAt, updatedAt } from './common';
import { airportsTable, organizationsTable, vendorsTable } from './schema';
import { contractsTable } from './schema.contracts';

// -------------------- Invoices --------------------
export const invoicesTable = pgTable(
  'invoices',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(), //fk to orgs table
    airportId: uuid('airport_id'), //fk to airports table
    contractId: uuid('contract_id'), //fk to contracts table
    vendorId: uuid('vendor_id'), //fk to vendors table

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
      columns: [table.airportId],
      foreignColumns: [airportsTable.id],
      name: 'fk_invoices_airport_id',
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
  // Each invoice can have one airport
  airport: one(airportsTable, {
    fields: [invoicesTable.airportId],
    references: [airportsTable.id],
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
  documents: many(invoiceDocumentsTable),
  chunks: many(invoiceChunksTable),
}));

/* -------------------- Invoice Documents -------------------- */
export const invoiceDocumentsTable = pgTable(
  'invoice_documents',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(), //fk to orgs table
    invoiceId: uuid('invoice_id').notNull(), //fk to invoices table

    // Identity
    title: text('title').notNull(),
    version: integer('version').default(1),
    sourceType: text('source_type'), // pdf | docx | scan
    storageUrl: text('storage_url'),
    rawText: text('raw_text'),

    // Timestamps
    createdAt,
    updatedAt,
  },
  (table) => [
    foreignKey({
      columns: [table.invoiceId],
      foreignColumns: [invoicesTable.id],
      name: 'fk_invoice_documents_invoice_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_invoice_documents_org_id',
    }).onDelete('cascade'),
    uniqueIndex('invoice_documents_invoice_version_uniq').on(table.invoiceId, table.version),
    index('invoice_documents_invoice_created_idx').on(table.invoiceId, table.createdAt),
  ],
);

/* -------------------- Invoice Documents Relations -------------------- */
export const invoiceDocumentsRelations = relations(invoiceDocumentsTable, ({ one, many }) => ({
  // Each invoice document can have one invoice
  invoice: one(invoicesTable, {
    fields: [invoiceDocumentsTable.invoiceId],
    references: [invoicesTable.id],
  }),
  // Each invoice document can have one organization
  organization: one(organizationsTable, {
    fields: [invoiceDocumentsTable.orgId],
    references: [organizationsTable.id],
  }),
  // Each invoice document can have many chunks
  chunks: many(invoiceChunksTable),
}));

/* -------------------- Invoice Chunks -------------------- */
export const invoiceChunksTable = pgTable(
  'invoice_chunks',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    invoiceId: uuid('invoice_id').notNull(), //fk to invoices table
    docId: uuid('doc_id').notNull(), //fk to invoice documents table

    // Identity
    order: integer('order').notNull(),
    label: text('label'), // "Header", "Totals", "Taxes", "Fuel Lines", etc.
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 1536 }).notNull(),
    meta: jsonb('meta').default({}), // {page:2, span:[120,420], tokens:480}

    // Timestamps
    createdAt,
    updatedAt,
  },
  (table) => [
    foreignKey({
      columns: [table.invoiceId],
      foreignColumns: [invoicesTable.id],
      name: 'fk_invoice_chunks_invoice_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.docId],
      foreignColumns: [invoiceDocumentsTable.id],
      name: 'fk_invoice_chunks_doc_id',
    }).onDelete('cascade'),
    // Index on embedding
    index('invoice_chunks_embedding_hnsw').using('hnsw', table.embedding.op('vector_cosine_ops')),
    // Index on invoiceId and docId
    index('invoice_chunks_invoice_id_idx').on(table.invoiceId),
    index('invoice_chunks_doc_id_idx').on(table.docId),
    // Unique index on docId and order
    uniqueIndex('invoice_chunks_doc_order_unique').on(table.docId, table.order),
  ],
);

/* -------------------- Invoice Chunks Relations -------------------- */
export const invoiceChunksRelations = relations(invoiceChunksTable, ({ one }) => ({
  // Each chunk can have one invoice
  invoice: one(invoicesTable, {
    fields: [invoiceChunksTable.invoiceId],
    references: [invoicesTable.id],
  }),
  // Each chunk can have one document
  document: one(invoiceDocumentsTable, {
    fields: [invoiceChunksTable.docId],
    references: [invoiceDocumentsTable.id],
  }),
}));
