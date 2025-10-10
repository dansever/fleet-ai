/**
 * Includes:
 * - Fuel Tenders
 * - Fuel Bids
 */

import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  foreignKey,
  index,
  integer,
  json,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { decisionEnum, ProcessStatusEnum } from '../enums';
import { createdAt, updatedAt } from './common';
import { airportsTable, organizationsTable, usersTable } from './schema.core';
import { documentsTable } from './schema.documents';
import { vendorsTable } from './schema.vendors';

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
    tenderType: text('tender_type'), // "spot", "contract", "framework", "emergency"
    description: text('description'),
    fuelType: text('fuel_type'),
    forecastVolume: integer('forecast_volume'),
    qualitySpecification: text('quality_specification'), // ASTM D1655, DEF STAN 91-91, etc.

    // Base Configuration
    baseCurrency: text('base_currency'),
    baseUom: text('base_uom'),

    // Benchmarking
    benchmarkIndex: text('benchmark_index'), // e.g. Platts Jet A-1
    benchmarkLocation: text('benchmark_location'), // e.g. Med, NWE

    // Timeline
    submissionStarts: date('submission_starts'),
    submissionEnds: date('submission_ends'),
    deliveryStarts: date('delivery_starts'),
    deliveryEnds: date('delivery_ends'),

    // Flexible Additional Data (LLM-categorized)
    tenderSpecifications: json('tender_specifications').$type<Record<string, any>>(),

    // AI Processing
    aiSummary: text('ai_summary'),
    terms: json('terms').$type<Record<string, any>>(),

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

    // Commercial terms
    currency: text('currency').default('USD'),
    paymentTerms: text('payment_terms'),
    creditDays: integer('credit_days'),

    // Product and measurement
    productGrade: text('product_grade'), // Jet A-1, Jet A, Jet B, Jet C, etc.
    uom: text('uom').default('USG'), // USG, L, m3, MT
    temperatureBasisC: numeric('temperature_basis_c'), // 15C, 20C, 25C, etc.
    densityAt15C: numeric('density_at_15c'), // kg/m3 if mass quote present

    // Pricing Structure
    priceType: text('price_type'), // fixed, index_formula
    // --- Fixed Pricing ---
    baseUnitPrice: numeric('base_unit_price'), // numeric only, currency is in currency field
    // Index-Linked Pricing
    indexName: text('index_name'), // Platts Jet A-1 Med, Argus, etc.
    indexLocation: text('index_location'), // region or marker
    indexCurrency: text('index_currency'), // currency of the index
    quoteAveragingMethod: numeric('quote_averaging_method'), // daily, weekly, M-1 averaging
    quoteLagDays: integer('quote_lag_days'), // days to lag behind the index
    formulaNotes: text('formula_notes'),
    differentialValue: numeric('differential_value'), // +/− per unit in currency or in cents
    differentialUnit: text('differential_unit'), // currency_per_uom, cents_per_uom, percent
    differentialCurrency: text('differential_currency'), // index, index_plus_fees

    // Fees & Charges
    intoPlaneFee: numeric('into_plane_fee'), // per unit
    intoPlaneFeeUnit: text('into_plane_fee_unit'), // per_uom, per_uplift, per_delivery
    handlingFee: numeric('handling_fee'), // per unit or per uplift
    handlingFeeBasis: text('handling_fee_basis'), // per_uom, per_uplift, per_delivery
    otherFee: numeric('other_fee'),
    otherFeeBasis: text('other_fee_basis'), // per_uom, per_uplift, per_delivery
    otherFeeDescription: text('other_fee_description'),

    // Inclusions & Exclusions
    includesTaxes: boolean('includes_taxes'),
    includesAirportFees: boolean('includes_airport_fees'),
    qualitySpecification: text('quality_specification'),
    taxDetails: json('tax_details').$type<Record<string, any>>(), // VAT, excise, carbon, rate, included flag

    // AI Processing
    aiSummary: text('ai_summary'),
    terms: json('terms').$type<Record<string, any>>(),
    tags: json('tags').$type<Record<string, any>>(),

    // Decision Tracking
    decision: decisionEnum('decision').default('open'),
    decisionByUserId: uuid('decision_by_user_id'), // fk to users table
    decisionAt: timestamp('decision_at', { withTimezone: true }),

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

// -------------------- Fuel Contracts --------------------
export const fuelContractsTable = pgTable(
  'fuel_contracts',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(), //fk to orgs table
    airportId: uuid('airport_id').notNull(), //fk to airports table

    // Contract Information
    title: text('title').notNull(),
    effectiveFrom: date('effective_from'),
    effectiveTo: date('effective_to'),

    // Fuel specific information
    fuelType: text('fuel_type'),
    fuelVolume: integer('fuel_volume'),
    fuelPrice: numeric('fuel_price'),
    fuelPriceUnit: text('fuel_price_unit'),
    fuelPriceCurrency: text('fuel_price_currency'),
    fuelPriceType: text('fuel_price_type'),

    // AI Processing
    terms: json('terms').$type<Record<string, any>>(),

    // Vendor Information
    vendorName: text('vendor_name'),
    vendorAddress: text('vendor_address'),
    vendorContactName: text('vendor_contact_name'),
    vendorContactEmail: text('vendor_contact_email'),
    vendorContactPhone: text('vendor_contact_phone'),
    vendorComments: text('vendor_comments'),

    // Timestamps
    createdAt,
    updatedAt,
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_fuel_contracts_org_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.airportId],
      foreignColumns: [airportsTable.id],
      name: 'fk_fuel_contracts_airport_id',
    }).onDelete('cascade'),
    index('fuel_contracts_org_id_idx').on(table.orgId),
    index('fuel_contracts_airport_id_idx').on(table.airportId),
    index('fuel_contracts_effective_range_idx').on(table.effectiveFrom, table.effectiveTo),
  ],
);

/* -------------------- Fuel Contracts Relations -------------------- */
export const fuelContractsRelations = relations(fuelContractsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [fuelContractsTable.orgId],
    references: [organizationsTable.id],
  }),
  airport: one(airportsTable, {
    fields: [fuelContractsTable.airportId],
    references: [airportsTable.id],
  }),
}));
