import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  foreignKey,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { decisionEnum, ProcessStatusEnum } from '../enums';
import { createdAt, updatedAt } from './common';
import { airportsTable, organizationsTable, usersTable, vendorsTable } from './schema';
import { documentsTable } from './schema.documents';

// -------------------- Fuel Tenders --------------------
export const fuelTendersTable = pgTable(
  'fuel_tenders',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(), //fk to orgs table
    airportId: uuid('airport_id').notNull(), //fk to airports table

    // Tender Information
    title: text('title').notNull(),
    description: text('description'),
    fuelType: text('fuel_type'),
    projectedAnnualVolume: integer('projected_annual_volume'),

    // Base Configuration
    baseCurrency: text('base_currency'),
    baseUom: text('base_uom'),

    // Timeline
    biddingStarts: date('bidding_starts'),
    biddingEnds: date('bidding_ends'),
    deliveryStarts: date('delivery_starts'),
    deliveryEnds: date('delivery_ends'),

    // Workflow Management
    processStatus: ProcessStatusEnum('process_status').default('pending'),
    winningBidId: uuid('winning_bid_id'),

    // Timestamps
    createdAt,
    updatedAt,
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_fuel_tenders_org_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.airportId],
      foreignColumns: [airportsTable.id],
      name: 'fk_fuel_tenders_airport_id',
    }).onDelete('cascade'),
  ],
);

// -------------------- Fuel Bids --------------------
export const fuelBidsTable = pgTable(
  'fuel_bids',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(), //fk to orgs table
    tenderId: uuid('tender_id').notNull(), //fk to fuel tenders table
    vendorId: uuid('vendor_id'), //fk to vendors table

    // Bid Information
    title: text('title'),
    round: integer('round'),
    bidSubmittedAt: date('bid_submitted_at'),

    // Vendor Information
    vendorName: text('vendor_name'),
    vendorAddress: text('vendor_address'),
    vendorContactName: text('vendor_contact_name'),
    vendorContactEmail: text('vendor_contact_email'),
    vendorContactPhone: text('vendor_contact_phone'),
    vendorComments: text('vendor_comments'),

    // Pricing Structure
    priceType: text('price_type'), // fixed, index_formula
    uom: text('uom').default('USG'), // USG, L, m3, MT
    currency: text('currency').default('USD'),
    paymentTerms: text('payment_terms'),

    // Fixed Pricing
    baseUnitPrice: numeric('base_unit_price'), // numeric only, no currency symbol

    // Index-Linked Pricing
    indexName: text('index_name'), // Platts Jet A-1 Med, Argus, etc.
    indexLocation: text('index_location'), // region or marker
    differential: numeric('differential'), // +/− per unit in currency or in cents
    differentialUnit: text('differential_unit'),
    formulaNotes: text('formula_notes'),

    // Fees & Charges
    intoPlaneFee: numeric('into_plane_fee'), // per unit
    handlingFee: numeric('handling_fee'), // per unit or per uplift
    otherFee: numeric('other_fee'),
    otherFeeDescription: text('other_fee_description'),

    // Inclusions & Exclusions
    includesTaxes: boolean('includes_taxes'),
    includesAirportFees: boolean('includes_airport_fees'),

    // Calculated Fields
    densityAt15C: numeric('density_at_15c'), // kg/m3 if mass quote present
    normalizedUnitPriceUsdPerUsg: numeric('norm_usd_per_usg'), // computed and stored

    // AI Processing
    aiSummary: text('ai_summary'),

    // Decision Tracking
    decision: decisionEnum('decision'),
    decisionByUserId: uuid('decision_by_user_id'), // fk to users table
    decisionAt: timestamp('decision_at', { withTimezone: true }),
    decisionNotes: text('decision_notes'),

    // Timestamps
    createdAt,
    updatedAt,
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_fuel_bids_org_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.tenderId],
      foreignColumns: [fuelTendersTable.id],
      name: 'fk_fuel_bids_tender_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.decisionByUserId],
      foreignColumns: [usersTable.id],
      name: 'fk_fuel_bids_decision_by_user_id',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.vendorId],
      foreignColumns: [vendorsTable.id],
      name: 'fk_fuel_bids_vendor_id',
    }).onDelete('cascade'),
  ],
);

/* -------------------- Fuel Tenders Relations -------------------- */
export const fuelTendersRelations = relations(fuelTendersTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [fuelTendersTable.orgId],
    references: [organizationsTable.id],
  }),
  airport: one(airportsTable, {
    fields: [fuelTendersTable.airportId],
    references: [airportsTable.id],
  }),
  bids: many(fuelBidsTable),
  winningBid: one(fuelBidsTable, {
    fields: [fuelTendersTable.winningBidId],
    references: [fuelBidsTable.id],
  }),
  // Each fuel tender can have many documents
  documents: many(documentsTable),
}));

/* -------------------- Fuel Bids Relations -------------------- */
export const fuelBidsRelations = relations(fuelBidsTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [fuelBidsTable.orgId],
    references: [organizationsTable.id],
  }),
  tender: one(fuelTendersTable, {
    fields: [fuelBidsTable.tenderId],
    references: [fuelTendersTable.id],
  }),
  vendor: one(vendorsTable, {
    fields: [fuelBidsTable.vendorId],
    references: [vendorsTable.id],
  }),
  decisionBy: one(usersTable, {
    fields: [fuelBidsTable.decisionByUserId],
    references: [usersTable.id],
  }),
  // Each fuel bid can have many documents
  documents: many(documentsTable),
}));
