import { relations } from 'drizzle-orm';
import {
  boolean,
  foreignKey,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { createdAt, updatedAt } from './common';
import { contractsTable } from './schema.contracts';
import { fuelBidsTable, fuelTendersTable } from './schema.fuel';
import { invoicesTable } from './schema.invoices';
import { rfqsTable } from './schema.technical';

/* -------------------- Organizations -------------------- */
export const organizationsTable = pgTable('organizations', {
  // System Fields
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  clerkOrgId: text('clerk_org_id').notNull().unique(),
  name: text('name'),

  // Organization-level usage tracking
  aiTokensUsed: integer('ai_tokens_used').default(0),
  totalQuotesProcessed: integer('total_quotes_processed').default(0),
  totalRfqsProcessed: integer('total_rfqs_processed').default(0),

  // Timestamps
  createdAt,
  updatedAt,
});
/* -------------------- Organizations Relations -------------------- */
export const organizationsRelations = relations(organizationsTable, ({ many }) => ({
  users: many(usersTable),
  airports: many(airportsTable),
  vendors: many(vendorsTable),
  contracts: many(contractsTable),
  invoices: many(invoicesTable),
  fuelTenders: many(fuelTendersTable),
  fuelBids: many(fuelBidsTable),
}));

/* -------------------- Users -------------------- */
export const usersTable = pgTable(
  'users',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    clerkUserId: text('clerk_user_id').notNull().unique(),
    orgId: uuid('org_id').notNull(), //fk to orgs table

    // User Information
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email').notNull(),
    position: text('position'),

    // User-level usage tracking
    aiTokensUsed: integer('ai_tokens_used').default(0),
    totalQuotesProcessed: integer('total_quotes_processed').default(0),
    totalRfqsProcessed: integer('total_rfqs_processed').default(0),

    // Timestamps
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_users_org_id',
    }).onDelete('cascade'),
    // Unique index on orgId and email
    uniqueIndex('users_org_email_uniq').on(table.orgId, table.email),
  ],
);
/* -------------------- Users Relations -------------------- */
export const usersRelations = relations(usersTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [usersTable.orgId],
    references: [organizationsTable.id],
  }),
  rfqs: many(rfqsTable),
}));

/* -------------------- Airports -------------------- */
export const airportsTable = pgTable(
  'airports',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(), //fk to orgs table

    // Airport Identification
    name: text('name').notNull(),
    iata: text('iata'), // 3-letter geo-code (many can have same code)
    icao: text('icao'), // 4-letter aerodrome identifier
    isHub: boolean('is_hub').default(false),

    // Location Information
    city: text('city'),
    state: text('state'),
    country: text('country').notNull(),

    // Timestamps
    createdAt,
    updatedAt,
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_airports_org_id',
    }).onDelete('cascade'),
  ],
);
/* -------------------- Airports Relations -------------------- */
export const airportsRelations = relations(airportsTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [airportsTable.orgId],
    references: [organizationsTable.id],
  }),
  contracts: many(contractsTable),
  invoices: many(invoicesTable),
  contacts: many(contactsTable),
  fuelTenders: many(fuelTendersTable),
}));

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
  contacts: many(contactsTable),
  // Each vendor can have many fuel bids
  fuelBids: many(fuelBidsTable),
}));

/* -------------------- Contacts -------------------- */
export const contactsTable = pgTable(
  'contacts',
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
      name: 'fk_contacts_org_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.vendorId],
      foreignColumns: [vendorsTable.id],
      name: 'fk_contacts_vendor_id',
    }).onDelete('cascade'),
  ],
);
/* -------------------- Contacts Relations -------------------- */
export const contactsRelations = relations(contactsTable, ({ one }) => ({
  // Each contact can have one organization
  organization: one(organizationsTable, {
    fields: [contactsTable.orgId],
    references: [organizationsTable.id],
  }),
  // Each contact can have one vendor
  vendor: one(vendorsTable, {
    fields: [contactsTable.vendorId],
    references: [vendorsTable.id],
  }),
}));
