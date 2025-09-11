/**
 * Includes:
 * - Organizations
 * - Users
 * - Airports
 */

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
import { documentsTable } from './schema.documents';
import { fuelBidsTable, fuelTendersTable } from './schema.fuel';
import { invoicesTable } from './schema.invoices';
import { quotesTable, rfqsTable } from './schema.technical';
import { vendorContactsTable, vendorsTable } from './schema.vendors';

/* -------------------- Organizations -------------------- */
export const organizationsTable = pgTable('organizations', {
  // System Fields
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  clerkOrgId: text('clerk_org_id').notNull().unique(),
  name: text('name'),

  // Organization-level AI tokens used
  tokensUsed: integer('tokens_used').default(0),

  // Organization-level business metrics
  quotesProcessed: integer('quotes_processed').default(0),
  rfqsProcessed: integer('rfqs_processed').default(0),
  fuelTendersProcessed: integer('fuel_tenders_processed').default(0),
  fuelBidsProcessed: integer('fuel_bids_processed').default(0),
  filesUploaded: integer('files_uploaded').default(0),

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
  documents: many(documentsTable),
  fuelTenders: many(fuelTendersTable),
  fuelBids: many(fuelBidsTable),
  rfqs: many(rfqsTable),
  quotes: many(quotesTable),
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

    // User-level AI tokens used
    tokensUsed: integer('tokens_used').default(0),

    // User-level business metrics
    quotesProcessed: integer('quotes_processed').default(0),
    rfqsProcessed: integer('rfqs_processed').default(0),
    fuelTendersProcessed: integer('fuel_tenders_processed').default(0),
    fuelBidsProcessed: integer('fuel_bids_processed').default(0),
    filesUploaded: integer('files_uploaded').default(0),

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
  vendorContacts: many(vendorContactsTable),
  fuelTenders: many(fuelTendersTable),
}));
