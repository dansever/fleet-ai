import { relations } from 'drizzle-orm';
import { foreignKey, index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { DocumentParentTypeEnum } from '../enums';
import { createdAt, updatedAt } from './common';
import { organizationsTable } from './schema.core';
import { embeddingsTable } from './schema.embeddings';

/* -------------------- Documents --------------------
 * Documents use a polymorphic relationship pattern with parentId/parentType
 * to support attachment to multiple entity types:
 *
 * Supported parent types (via DocumentParentTypeEnum):
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
    parentType: DocumentParentTypeEnum('parent_type'), // contract | invoice | rfq | fuel_tender | fuel_bid | other

    // Identity
    fileType: text('file_type'), // 'pdf' | 'docx' | 'scan'
    storageUrl: text('storage_url'), // S3, GCS, etc.
    storagePath: text('storage_path'), // path in the storage
    content: text('content'), // full extracted text

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
  chunks: many(embeddingsTable),
  // Note: Parent relationship (contract, invoice, etc.) is handled via parentId/parentType
  // and must be resolved programmatically since Drizzle relations don't support polymorphic FKs
}));
