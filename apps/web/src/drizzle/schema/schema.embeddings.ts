import { relations } from 'drizzle-orm';
import { foreignKey, integer, jsonb, pgTable, text, uuid, vector } from 'drizzle-orm/pg-core';
import { createdAt, updatedAt } from './common';
import { organizationsTable } from './schema.core';
import { documentsTable } from './schema.documents';

/* -------------------- Embeddings (vector-enabled) -------------------- */
export const embeddingsTable = pgTable(
  'embeddings',
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

/* -------------------- Embeddings Relations -------------------- */
export const embeddingsRelations = relations(embeddingsTable, ({ one }) => ({
  // Each document is tied to one organization
  organization: one(organizationsTable, {
    fields: [embeddingsTable.orgId],
    references: [organizationsTable.id],
  }),
  // Each chunk is tied to one document
  document: one(documentsTable, {
    fields: [embeddingsTable.documentId],
    references: [documentsTable.id],
  }),
}));
