/**
 * Includes:
 * - Documents
 * - Chunks
 */

import { relations, sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  vector,
} from 'drizzle-orm/pg-core';
import { DocumentTypeEnum } from '../enums';
import { createdAt, updatedAt } from './common';
import { contractsTable } from './schema.contracts';
import { organizationsTable } from './schema.core';
import { fuelBidsTable } from './schema.fuel';
import { invoicesTable } from './schema.invoices';

// -------------------- Documents --------------------
export const documentsTable = pgTable(
  'documents',
  {
    // System
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(),
    contractId: uuid('contract_id'), // FK to contracts table
    invoiceId: uuid('invoice_id'), // FK to invoices table
    fuelBidId: uuid('fuel_bid_id'), // FK to fuel bids table

    // File data
    documentType: DocumentTypeEnum('document_type'),
    storageId: text('storage_id'), // file storage id
    fileName: text('file_name'), // file name
    fileType: text('file_type'), // 'pdf' | 'docx' | 'scan'
    fileSize: integer('file_size'), // size in bytes
    storagePath: text('storage_path'), // path in the storage
    content: text('content'), // full extracted text

    // Knowledge extraction fields
    extractedData: jsonb('extracted_data').default({}), // Document-specific extracted knowledge
    summary: text('summary'), // Document-specific summary
    confidence: numeric('confidence'), // AI extraction confidence score
    extractedAt: timestamp('extracted_at', { withTimezone: true }),

    // Timestamps
    createdAt,
    updatedAt,
  },
  (table) => [
    // If the organization is deleted, delete the document
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_documents_org_id',
    }).onDelete('cascade'),
    // If the contract is deleted, delete the document
    foreignKey({
      columns: [table.contractId],
      foreignColumns: [contractsTable.id],
      name: 'fk_documents_contract_id',
    }).onDelete('cascade'),
    // If the invoice is deleted, delete the document
    foreignKey({
      columns: [table.invoiceId],
      foreignColumns: [invoicesTable.id],
      name: 'fk_documents_invoice_id',
    }).onDelete('cascade'),
    // If the fuel bid is deleted, delete the document
    foreignKey({
      columns: [table.fuelBidId],
      foreignColumns: [fuelBidsTable.id],
      name: 'fk_documents_fuel_bid_id',
    }).onDelete('cascade'),
    // Indexes for efficient querying
    index('documents_org_id_idx').on(table.orgId),
    // Check that only one parent is set at a time (contract, invoice, or fuel bid)
    check(
      'documents_single_parent_check',
      sql`(
        (contract_id IS NOT NULL)::int + 
        (invoice_id IS NOT NULL)::int + 
        (fuel_bid_id IS NOT NULL)::int
      ) <= 1`,
    ),
  ],
);

/* -------------------- Documents Relations -------------------- */
export const documentsRelations = relations(documentsTable, ({ one, many }) => ({
  // Each document is tied to one organization
  organization: one(organizationsTable, {
    fields: [documentsTable.orgId],
    references: [organizationsTable.id],
  }),
  // Each document is tied to one contract
  contract: one(contractsTable, {
    fields: [documentsTable.contractId],
    references: [contractsTable.id],
  }),
  // Each document is tied to one invoice
  invoice: one(invoicesTable, {
    fields: [documentsTable.invoiceId],
    references: [invoicesTable.id],
  }),
  // Each document is tied to one fuel bid
  fuelBid: one(fuelBidsTable, {
    fields: [documentsTable.fuelBidId],
    references: [fuelBidsTable.id],
  }),
  // Each document can have many chunks
  chunks: many(chunksTable),
}));

/* -------------------- Embeddings (vector-enabled) -------------------- */
export const chunksTable = pgTable(
  'chunks',
  {
    // System
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(),
    documentId: uuid('document_id').notNull(),

    // Identity
    order: integer('order').notNull(), // sequence within doc
    label: text('label'), // "Pricing", "SLA", "Edge Cases"
    content: text('content').notNull(),

    // Embedding managed by Drizzle pgvector
    embedding: vector('embedding', { dimensions: 1536 }).notNull(),

    // Metadata
    meta: jsonb('meta').default({}), // {page:3, span:[100,450], tokens:450}

    // Timestamps
    createdAt,
    updatedAt,
  },
  (t) => [
    foreignKey({
      columns: [t.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_embeddings_org_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [t.documentId],
      foreignColumns: [documentsTable.id],
      name: 'fk_embeddings_document_id',
    }).onDelete('cascade'),
  ],
);

/* -------------------- Chunks Relations -------------------- */
export const chunksRelations = relations(chunksTable, ({ one }) => ({
  // Each document is tied to one organization
  organization: one(organizationsTable, {
    fields: [chunksTable.orgId],
    references: [organizationsTable.id],
  }),
  // Each chunk is tied to one document
  document: one(documentsTable, {
    fields: [chunksTable.documentId],
    references: [documentsTable.id],
  }),
}));
