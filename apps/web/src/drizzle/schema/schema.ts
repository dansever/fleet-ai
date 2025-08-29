import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  foreignKey,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { ContractTypeEnum, decisionEnum, OrderDirectionEnum, statusEnum } from './enums';
export * from './enums';

// Shared timestamps
const createdAt = timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
const updatedAt = timestamp('updated_at', { withTimezone: true }).notNull().defaultNow();

/* -------------------- Organizations -------------------- */
export const organizationsTable = pgTable('organizations', {
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

// -------------------- Org Settings --------------------
export const orgSettingsTable = pgTable(
  'org_settings',
  {
    orgId: uuid('org_id').primaryKey().notNull(), // also acts as fk to orgs table
    // AI Settings
    autoApprovalLimit: integer('auto_approval_limit').default(10000),
    aiInsightsEnabled: boolean('ai_insights_enabled').default(true),
    agentsEnabled: boolean('agents_enabled').default(true),

    // Timestamps
    createdAt,
    updatedAt,
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_org_settings_org_id',
    }).onDelete('cascade'),
  ],
);

/* -------------------- Users -------------------- */
export const usersTable = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    clerkUserId: text('clerk_user_id').notNull().unique(),
    orgId: uuid('org_id').notNull(), //fk to orgs table
    displayName: text('display_name').notNull(),
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
  ],
);

// -------------------- Airports --------------------
export const airportsTable = pgTable(
  'airports',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(), //fk to orgs table

    // Airport Identification
    iata: text('iata'), // 3-letter geo-code (many can have same code)
    icao: text('icao'), // 4-letter aerodrome identifier
    name: text('name').notNull(),

    // Location Information
    city: text('city'),
    state: text('state'),
    country: text('country').notNull(),

    // Operational Information
    isHub: boolean('is_hub').default(false),
    internalNotes: text('internal_notes'),

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

// -------------------- Vendors --------------------
export const vendorsTable = pgTable(
  'vendors',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(), //fk to orgs table
    name: text('name').notNull(),
    internalRating: integer('internal_rating'),
    notes: text('notes'),

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
  ],
);

// -------------------- Contacts --------------------
export const contactsTable = pgTable(
  'contacts',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(), //fk to orgs table
    airportId: uuid('airport_id'), //fk to airports table

    // Contact Information
    name: text('name'),
    email: text('email'),
    phone: text('phone'),

    // Professional Information
    company: text('company'),
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
      columns: [table.airportId],
      foreignColumns: [airportsTable.id],
      name: 'fk_contacts_airport_id',
    }).onDelete('cascade'),
  ],
);

/* -------------------- RFQs -------------------- */
export const rfqsTable = pgTable(
  'rfqs',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    userId: uuid('user_id').notNull(), //fk to users table
    orgId: uuid('org_id').notNull(), //fk to orgs table

    // RFQ Identification
    direction: OrderDirectionEnum('direction'), // sent, received
    rfqNumber: text('rfq_number'),

    // Vendor Information
    vendorName: text('vendor_name'),
    vendorAddress: text('vendor_address'),
    vendorContactName: text('vendor_contact_name'),
    vendorContactEmail: text('vendor_contact_email'),
    vendorContactPhone: text('vendor_contact_phone'),

    // Part Specifications
    partNumber: text('part_number'),
    altPartNumber: text('alt_part_number'),
    partDescription: text('part_description'),
    conditionCode: text('condition_code'),
    unitOfMeasure: text('unit_of_measure'),
    quantity: integer('quantity'),

    // Commercial Terms
    pricingType: text('pricing_type'),
    urgencyLevel: text('urgency_level'),
    deliverTo: text('deliver_to'),
    buyerComments: text('buyer_comments'),

    // Workflow Management
    status: statusEnum('status').default('pending'),
    statusHistory: jsonb('status_history').default([]),
    selectedQuoteId: uuid('selected_quote_id'),

    // Timestamps
    sentAt: timestamp('sent_at', { withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex('uq_org_rfq_number').on(table.rfqNumber, table.orgId),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersTable.id],
      name: 'fk_rfqs_user_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_rfqs_org_id',
    }).onDelete('cascade'),
  ],
);

/* -------------------- Quotes -------------------- */
export const quotesTable = pgTable(
  'quotes',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(), //fk to orgs table
    rfqId: uuid('rfq_id').notNull(), //fk to rfqs table

    // Quote Identification
    rfqNumber: text('rfq_number'),
    direction: OrderDirectionEnum('direction'), // sent, received

    // Vendor Information
    vendorName: text('vendor_name'),
    vendorAddress: text('vendor_address'),
    vendorContactName: text('vendor_contact_name'),
    vendorContactEmail: text('vendor_contact_email'),
    vendorContactPhone: text('vendor_contact_phone'),

    // Part Details
    partNumber: text('part_number'),
    serialNumber: text('serial_number'),
    partDescription: text('part_description'),
    partCondition: text('condition_code'),
    unitOfMeasure: text('unit_of_measure'),
    quantity: integer('quantity'),

    // Pricing Information
    price: numeric('price'),
    currency: text('currency'),
    pricingType: text('pricing_type'),
    pricingMethod: text('pricing_method'),
    coreDue: text('core_due'),
    coreChange: text('core_change'),
    paymentTerms: text('payment_terms'),
    minimumOrderQuantity: integer('minimum_order_quantity'),

    // Delivery & Terms
    leadTime: text('lead_time'),
    deliveryTerms: text('delivery_terms'),
    warranty: text('warranty'),
    quoteExpirationDate: text('quote_expiration_date'),

    // Compliance & Traceability
    certifications: text('certifications').array().default([]),
    traceTo: text('trace_to'),
    tagType: text('tag_type'),
    taggedBy: text('tagged_by'),
    taggedDate: text('tagged_date'),

    // Additional Information
    vendorComments: text('vendor_comments'),

    // Workflow Management
    status: statusEnum('status').default('pending'),

    // Timestamps
    sentAt: timestamp('sent_at', { withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_quotes_org_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.rfqId],
      foreignColumns: [rfqsTable.id],
      name: 'fk_quotes_rfq_id',
    }).onDelete('cascade'),
  ],
);

// Define relations after both tables are created
export const rfqsRelations = relations(rfqsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [rfqsTable.userId],
    references: [usersTable.id],
  }),
  organization: one(organizationsTable, {
    fields: [rfqsTable.orgId],
    references: [organizationsTable.id],
  }),
  quotes: many(quotesTable),
  selectedQuote: one(quotesTable, {
    fields: [rfqsTable.selectedQuoteId],
    references: [quotesTable.id],
  }),
}));

export const quotesRelations = relations(quotesTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [quotesTable.orgId],
    references: [organizationsTable.id],
  }),
  rfq: one(rfqsTable, {
    fields: [quotesTable.rfqId],
    references: [rfqsTable.id],
  }),
}));

/* -------------------- Service Contracts -------------------- */
export const serviceContractsTable = pgTable(
  'service_contracts',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(), //fk to orgs table
    airportId: uuid('airport_id'), //fk to airports table

    // Service Contract Information
    title: text('title').notNull(),
    contractType: ContractTypeEnum('contract_type'),
    notes: text('notes'),

    // Vendor Information
    vendorName: text('vendor_name'),
    vendorAddress: text('vendor_address'),
    vendorContactName: text('vendor_contact_name'),
    vendorContactEmail: text('vendor_contact_email'),
    vendorContactPhone: text('vendor_contact_phone'),

    // Contract Period
    effectiveFrom: date('effective_from'),
    effectiveTo: date('effective_to'),

    // Document Management
    pdfUrl: text('pdf_url'),
    rawText: text('raw_text'), // full OCR text for AI

    // Contract Terms
    aiSummary: text('ai_summary'),
    terms: jsonb('terms').default({}), // contract terms and conditions as JSON

    // Timestamps
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex('uq_org_airport_vendor_contract').on(table.title, table.orgId, table.airportId),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_service_contracts_org_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.airportId],
      foreignColumns: [airportsTable.id],
      name: 'fk_service_contracts_airport_id',
    }).onDelete('cascade'),
  ],
);

// -------------------- Service Contract Invoices --------------------
export const serviceContractInvoicesTable = pgTable(
  'service_contract_invoices',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(), //fk to orgs table
    serviceContractId: uuid('service_contract_id'), //fk to service contracts table

    // Invoice Information
    invoiceNumber: text('invoice_number').notNull(),
    invoiceDate: date('invoice_date'),

    // Vendor Information
    vendorName: text('vendor_name'),
    vendorAddress: text('vendor_address'),
    vendorContactName: text('vendor_contact_name'),
    vendorContactEmail: text('vendor_contact_email'),
    vendorContactPhone: text('vendor_contact_phone'),

    // Financial Details
    totalAmount: numeric('total_amount'),
    currency: text('currency'),
    lines: jsonb('lines').default([]),

    // Timestamps
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex('uq_org_invoice_number').on(table.invoiceNumber, table.orgId),
    foreignKey({
      columns: [table.serviceContractId],
      foreignColumns: [serviceContractsTable.id],
      name: 'fk_service_contract_invoices_service_contract_id',
    }).onDelete('cascade'),
  ],
);

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

    // Base Configuration
    baseCurrency: text('base_currency'),
    baseUom: text('base_uom'),

    // Timeline
    biddingStarts: date('bidding_starts'),
    biddingEnds: date('bidding_ends'),
    deliveryStarts: date('delivery_starts'),
    deliveryEnds: date('delivery_ends'),

    // Workflow Management
    status: statusEnum('status').default('pending'),
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
    tenderId: uuid('tender_id').notNull(), //fk to fuel tenders table

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
      columns: [table.tenderId],
      foreignColumns: [fuelTendersTable.id],
      name: 'fk_fuel_bids_tender_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.decisionByUserId],
      foreignColumns: [usersTable.id],
      name: 'fk_fuel_bids_decision_by_user_id',
    }).onDelete('set null'),
  ],
);

// -------------------- Fuel Contracts --------------------
export const fuelContractsTable = pgTable(
  'fuel_contracts',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(), //fk to orgs table
    airportId: uuid('airport_id').notNull(), //fk to airports table

    // Contract Identification
    contractNumber: text('contract_number'),
    title: text('title'),
    fuelType: text('fuel_type'),

    // Vendor Information
    vendorName: text('vendor_name'),
    vendorAddress: text('vendor_address'),
    vendorContactName: text('vendor_contact_name'),
    vendorContactEmail: text('vendor_contact_email'),
    vendorContactPhone: text('vendor_contact_phone'),

    // Pricing Structure
    currency: text('currency'),
    priceType: text('price_type'),
    priceFormula: text('price_formula'),
    baseUnitPrice: numeric('base_unit_price'),
    normalizedUsdPerUsg: numeric('normalized_usd_per_usg'),

    // Volume & Fees
    volumeCommitted: numeric('volume_committed'),
    volumeUnit: text('volume_unit'),
    intoPlaneFee: numeric('into_plane_fee'),

    // Inclusions & Exclusions
    includesTaxes: boolean('includes_taxes'),
    includesAirportFees: boolean('includes_airport_fees'),

    // Contract Period
    effectiveFrom: date('effective_from'),
    effectiveTo: date('effective_to'),

    // Document Management
    pdfUrl: text('pdf_url'),
    rawText: text('raw_text'),

    // Contract Terms
    aiSummary: text('ai_summary'),
    terms: jsonb('terms').default({}), // contract terms and conditions as JSON

    // Workflow Management
    status: statusEnum('status').default('pending'),

    // Timestamps
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex('uq_org_airport_type_fuel_contract').on(
      table.orgId,
      table.airportId,
      table.fuelType,
    ),
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
  ],
);

// -------------------- Fuel Contract Invoices --------------------
export const fuelContractInvoicesTable = pgTable(
  'fuel_contract_invoices',
  {
    // System Fields
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id').notNull(), //fk to orgs table
    fuelContractId: uuid('fuel_contract_id'), //fk to fuel contracts table

    // Invoice Information
    invoiceNumber: text('invoice_number').notNull(),
    invoiceDate: date('invoice_date'),

    // Vendor Information
    vendorName: text('vendor_name'),
    vendorAddress: text('vendor_address'),
    vendorContactName: text('vendor_contact_name'),
    vendorContactEmail: text('vendor_contact_email'),
    vendorContactPhone: text('vendor_contact_phone'),

    // Financial Details
    totalAmount: numeric('total_amount'),
    currency: text('currency'),
    lines: jsonb('lines').default([]),

    // Timestamps
    createdAt,
    updatedAt,
  },
  (table) => [
    foreignKey({
      columns: [table.fuelContractId],
      foreignColumns: [fuelContractsTable.id],
      name: 'fk_fuel_contract_invoices_fuel_contract_id',
    }).onDelete('cascade'),
  ],
);
