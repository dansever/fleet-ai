import { relations } from 'drizzle-orm';
import { date, foreignKey, index, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { ContractTypeEnum, ProcessStatusEnum } from '../enums';
import { createdAt, updatedAt } from './common';
import { airportsTable, organizationsTable } from './schema.core';
import { vendorsTable } from './schema.vendors';

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
    effectiveFrom: date('effective_from'),
    effectiveTo: date('effective_to'),
    processStatus: ProcessStatusEnum('process_status').default('pending'),

    // Summary & Details
    summary: text('summary'),
    details: jsonb('details'),

    // Timestamps
    createdAt,
    updatedAt,
  },
  (t) => [
    // If the organization is deleted, delete the contract
    foreignKey({
      columns: [t.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_contracts_org_id',
    }).onDelete('cascade'),
    // If the airport is deleted, delete the contract
    foreignKey({
      columns: [t.airportId],
      foreignColumns: [airportsTable.id],
      name: 'fk_contracts_airport_id',
    }).onDelete('cascade'),
    // If the vendor is deleted, set the vendorId to null
    foreignKey({
      columns: [t.vendorId],
      foreignColumns: [vendorsTable.id],
      name: 'fk_contracts_vendor_id',
    }).onDelete('set null'),

    index('contracts_org_id_idx').on(t.orgId),
    index('contracts_airport_id_idx').on(t.airportId),
    index('contracts_vendor_id_idx').on(t.vendorId),
    index('contracts_type_idx').on(t.contractType),
    index('contracts_effective_range_idx').on(t.effectiveFrom, t.effectiveTo),
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
  // Note: Documents relationship is polymorphic via parentId/parentType
  // and must be resolved programmatically (see schema.documents.ts)
}));
