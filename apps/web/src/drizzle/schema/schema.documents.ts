/**
 * Includes:
 * - Documents
 * - Chunks
 */

import { relations } from 'drizzle-orm';
import {
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
import { organizationsTable } from './schema.core';

/* -------------------- Documents --------------------
 * Documents use a polymorphic relationship pattern with parentId/parentType
 * to support attachment to multiple entity types:
 *
 * Supported parent types (via DocumentTypeEnum):
 * - contract: Legal contracts and agreements
 * - invoice: Vendor invoices and billing documents
 * - rfq: Request for Quote documents
 * - fuel_tender: Fuel tender documentation
 * - fuel_bid: Fuel bid submissions
 * - other: General organizational documents
 *
 * Each parent entity has a `documents: many(documentsTable)` relation
 * for easy reverse lookup of all documents for that entity.
 * --------------------------------------------------------- */
export const documentsTable = pgTable(
  'documents',
  {
    // System
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(),

    // Generic parent relationship
    parentId: uuid('parent_id'), // Generic FK to any parent entity
    parentType: DocumentTypeEnum('parent_type'), // contract | invoice | rfq | fuel_tender | fuel_bid | other

    // File data
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
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_documents_org_id',
    }).onDelete('cascade'),

    // Indexes for efficient querying
    index('documents_parent_idx').on(table.parentId, table.parentType),
    index('documents_org_id_idx').on(table.orgId),
  ],
);

/* -------------------- Documents Relations -------------------- */
export const documentsRelations = relations(documentsTable, ({ one, many }) => ({
  // Each document is tied to one organization
  organization: one(organizationsTable, {
    fields: [documentsTable.orgId],
    references: [organizationsTable.id],
  }),
  // Each document can have many chunks
  chunks: many(chunksTable),
  // Note: Parent relationship (contract, invoice, etc.) is handled via parentId/parentType
  // and must be resolved programmatically since Drizzle relations don't support polymorphic FKs
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
