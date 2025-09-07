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
import { ContractTypeEnum, ProcessStatusEnum } from '../enums';
import { createdAt, updatedAt } from './common';
import { airportsTable, organizationsTable, vendorsTable } from './schema';

/* -------------------- Contracts -------------------- */
export const contractsTable = pgTable(
  'contracts',
  {
    // System
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(), //fk to orgs table
    airportId: uuid('airport_id'), //fk to airports table
    vendorId: uuid('vendor_id'), //fk to vendors table

    // Identity
    title: text('title').notNull(),
    contractType: ContractTypeEnum('contract_type').notNull(),

    // Vendor Information
    vendorName: text('vendor_name'),
    vendorAddress: text('vendor_address'),
    vendorContactName: text('vendor_contact_name'),
    vendorContactEmail: text('vendor_contact_email'),
    vendorContactPhone: text('vendor_contact_phone'),
    vendorComments: text('vendor_comments'),

    // Period
    effectiveFrom: date('effective_from').notNull(),
    effectiveTo: date('effective_to').notNull(),
    processStatus: ProcessStatusEnum('process_status').default('pending'),

    // Source
    docUrl: text('doc_url'),

    // LLM narratives
    summary: text('summary'),
    commercialTerms: text('commercial_terms'),
    slas: text('slas'),
    edgeCases: text('edge_cases'),
    riskLiability: text('risk_liability'),
    terminationLaw: text('termination_law'),
    operationalBaselines: text('operational_baselines'),

    // Lightweight tags
    tags: jsonb('tags').default({}),

    // Timestamps
    createdAt,
    updatedAt,
  },
  (t) => [
    foreignKey({
      columns: [t.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_contracts_org_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [t.airportId],
      foreignColumns: [airportsTable.id],
      name: 'fk_contracts_airport_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [t.vendorId],
      foreignColumns: [vendorsTable.id],
      name: 'fk_contracts_vendor_id',
    }).onDelete('cascade'),

    index('contracts_org_id_idx').on(t.orgId),
    index('contracts_airport_id_idx').on(t.airportId),
    index('contracts_vendor_id_idx').on(t.vendorId),
    index('contracts_type_idx').on(t.contractType),
    index('contracts_effective_range_idx').on(t.effectiveFrom, t.effectiveTo),
  ],
);

/* -------------------- Contract Documents -------------------- */
export const contractDocumentsTable = pgTable(
  'contract_documents',
  {
    // System
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(),
    contractId: uuid('contract_id').notNull(),

    // Identity
    title: text('title').notNull(),
    version: integer('version').default(1),
    sourceType: text('source_type'), // 'pdf' | 'docx' | 'scan'
    storageUrl: text('storage_url'), // S3, GCS, etc.
    rawText: text('raw_text'), // full extracted text

    // Timestamps
    createdAt,
    updatedAt,
  },
  (t) => [
    foreignKey({
      columns: [t.contractId],
      foreignColumns: [contractsTable.id],
      name: 'fk_contract_documents_contract_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [t.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_contract_documents_org_id',
    }).onDelete('cascade'),

    uniqueIndex('contract_documents_contract_version_uniq').on(t.contractId, t.version),
    index('contract_documents_org_id_idx').on(t.orgId),
  ],
);

/* -------------------- Contract Chunks (vector-enabled) -------------------- */
export const contractChunksTable = pgTable(
  'contract_chunks',
  {
    // System
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    contractId: uuid('contract_id').notNull(),
    docId: uuid('doc_id').notNull(),

    // Identity
    order: integer('order').notNull(), // sequence within doc
    label: text('label'), // "Pricing", "SLA", "Edge Cases"
    content: text('content').notNull(),

    // Embedding managed by Drizzle pgvector
    embedding: vector('embedding', { dimensions: 1536 }),

    // Metadata
    meta: jsonb('meta').default({}), // {page:3, span:[100,450], tokens:450}

    // Timestamps
    createdAt,
    updatedAt,
  },
  (t) => [
    foreignKey({
      columns: [t.contractId],
      foreignColumns: [contractsTable.id],
      name: 'fk_contract_chunks_contract_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [t.docId],
      foreignColumns: [contractDocumentsTable.id],
      name: 'fk_contract_chunks_doc_id',
    }).onDelete('cascade'),

    // Unique index on docId and order
    uniqueIndex('contract_chunks_doc_order_unique').on(t.docId, t.order),

    // Vector index
    index('contract_chunks_embedding_hnsw').using('hnsw', t.embedding.op('vector_cosine_ops')),

    // Handy filters
    index('contract_chunks_contract_id_idx').on(t.contractId),
    index('contract_chunks_doc_id_idx').on(t.docId),
    index('contract_chunks_doc_order_idx').on(t.docId, t.order),
  ],
);

/* -------------------- Relations -------------------- */
export const contractsRelations = relations(contractsTable, ({ one, many }) => ({
  // Each contract is tied to one organization
  organization: one(organizationsTable, {
    fields: [contractsTable.orgId],
    references: [organizationsTable.id],
  }),
  // Each contract is tied to one airport
  airport: one(airportsTable, {
    fields: [contractsTable.airportId],
    references: [airportsTable.id],
  }),
  // Each contract is tied to one vendor
  vendor: one(vendorsTable, {
    fields: [contractsTable.vendorId],
    references: [vendorsTable.id],
  }),
  // Each contract can have many documents
  documents: many(contractDocumentsTable),
  // Each contract can have many chunks
  chunks: many(contractChunksTable),
}));

export const contractDocumentsRelations = relations(contractDocumentsTable, ({ one, many }) => ({
  // Each document is tied to one contract
  contract: one(contractsTable, {
    fields: [contractDocumentsTable.contractId],
    references: [contractsTable.id],
  }),
  // Each document is tied to one organization
  organization: one(organizationsTable, {
    fields: [contractDocumentsTable.orgId],
    references: [organizationsTable.id],
  }),
  // Each document can have many chunks
  chunks: many(contractChunksTable),
}));

export const contractChunksRelations = relations(contractChunksTable, ({ one }) => ({
  // Each chunk is tied to one contract
  contract: one(contractsTable, {
    fields: [contractChunksTable.contractId],
    references: [contractsTable.id],
  }),
  // Each chunk is tied to one document
  document: one(contractDocumentsTable, {
    fields: [contractChunksTable.docId],
    references: [contractDocumentsTable.id],
  }),
}));
