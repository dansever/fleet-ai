/**
 * Includes:
 * - Vendors
 * - Vendor Contacts
 */

import { relations } from 'drizzle-orm';
import { foreignKey, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { createdAt, updatedAt } from './common';
import { contractsTable } from './schema.contracts';
import { organizationsTable } from './schema.core';
import { fuelBidsTable } from './schema.fuel';
import { invoicesTable } from './schema.invoices';

/* -------------------- Vendors -------------------- */
export const vendorsTable = pgTable(
  'vendors',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(), //fk to orgs table

    // Vendor Information
    name: text('name').notNull(),

    // Timestamps
    createdAt,
    updatedAt,
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_vendors_org_id',
    }).onDelete('cascade'),
    // Unique index on orgId and name
    uniqueIndex('vendors_org_name_uniq').on(table.orgId, table.name),
  ],
);
/* -------------------- Vendors Relations -------------------- */
export const vendorsRelations = relations(vendorsTable, ({ one, many }) => ({
  // Each vendor can have one organization
  organization: one(organizationsTable, {
    fields: [vendorsTable.orgId],
    references: [organizationsTable.id],
  }),
  // Each vendor can have many contracts
  contracts: many(contractsTable),
  // Each vendor can have many invoices
  invoices: many(invoicesTable),
  // Each vendor can have many contacts
  vendorContacts: many(vendorContactsTable),
  // Each vendor can have many fuel bids
  fuelBids: many(fuelBidsTable),
}));

/* -------------------- Vendor Contacts -------------------- */
export const vendorContactsTable = pgTable(
  'vendor_contacts',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(), //fk to orgs table
    vendorId: uuid('vendor_id'), //fk to vendors table

    // Contact Information
    name: text('name'),
    email: text('email'),
    phone: text('phone'),
    department: text('department'),
    role: text('role'),

    // Timestamps
    createdAt,
    updatedAt,
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_vendor_contacts_org_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.vendorId],
      foreignColumns: [vendorsTable.id],
      name: 'fk_vendor_contacts_vendor_id',
    }).onDelete('cascade'),
  ],
);
/* -------------------- Vendor Contacts Relations -------------------- */
export const vendorContactsRelations = relations(vendorContactsTable, ({ one }) => ({
  // Each contact can have one organization
  organization: one(organizationsTable, {
    fields: [vendorContactsTable.orgId],
    references: [organizationsTable.id],
  }),
  // Each contact can have one vendor
  vendor: one(vendorsTable, {
    fields: [vendorContactsTable.vendorId],
    references: [vendorsTable.id],
  }),
}));
