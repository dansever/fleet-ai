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

// ==================== CORE TABLES ====================

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
  ],
);

/* -------------------- Airports -------------------- */
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

// ==================== SUPPLIERS & CONTACTS TABLES ====================

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
  ],
);

/* -------------------- Contacts -------------------- */
export const contactsTable = pgTable(
  'contacts',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(), //fk to orgs table
    airportId: uuid('airport_id'), //fk to airports table
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
      columns: [table.airportId],
      foreignColumns: [airportsTable.id],
      name: 'fk_contacts_airport_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.vendorId],
      foreignColumns: [vendorsTable.id],
      name: 'fk_contacts_vendor_id',
    }).onDelete('cascade'),
  ],
);

// ==================== TECHNICAL PROCUREMENT TABLES ====================

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

// ==================== RELATIONS ====================

/* -------------------- RFQs Relations -------------------- */
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

/* -------------------- Quotes Relations -------------------- */
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

// ==================== GROUND & GENERAL PROCUREMENT TABLES ====================
/* -------------------- Contracts -------------------- */
export const contractsTable = pgTable(
  'contracts',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(), //fk to orgs table
    airportId: uuid('airport_id'), //fk to airports table
    vendorId: uuid('vendor_id'), //fk to vendors table

    // Contract Information
    title: text('title').notNull(), // title of the contract
    contractType: ContractTypeEnum('contract_type').notNull(), // service, fuel, ground_handling
    internalNotes: text('internal_notes'), // internal notes about the contract

    // Vendor Information
    vendorName: text('vendor_name'),
    vendorAddress: text('vendor_address'),
    vendorContactName: text('vendor_contact_name'),
    vendorContactEmail: text('vendor_contact_email'),
    vendorContactPhone: text('vendor_contact_phone'),
    vendorComments: text('vendor_comments'),

    // Contract Terms & Conditions
    terms: text('terms'), // terms and conditions of the contract
    summary: text('summary'), // summary of the contract
    docUrl: text('doc_url'), // url of the contract document

    // Contract Period
    effectiveFrom: date('effective_from'),
    effectiveTo: date('effective_to'),

    // Timestamps
    createdAt,
    updatedAt,
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_contracts_org_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.airportId],
      foreignColumns: [airportsTable.id],
      name: 'fk_contracts_airport_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.vendorId],
      foreignColumns: [vendorsTable.id],
      name: 'fk_contracts_vendor_id',
    }).onDelete('cascade'),
  ],
);

/* -------------------- Contract Rules -------------------- */
export const contractRulesTable = pgTable(
  'contract_rules',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(), //fk to orgs table
    contractId: uuid('contract_id').notNull(), //fk to contracts table

    // Contract Rule Information
    chargeCode: text('charge_code'), // gpu_hour, bus, deicing, parking, airport_fee, fuel_uplift, other
    description: text('description'), // description of the rule
    priceModel: text('price_model'), // fixed, per_unit, tiered, index_formula, bundled, waived
    rate: numeric('rate'), // rate of the rule
    uom: text('uom'), // unit of measure of the rule
    currency: text('currency'), // currency of the rule
    formula: jsonb('formula').default({}), // e.g., {index_name, index_location, differential, into_plane_fee, notes}
    applicability: jsonb('applicability').default({}), // e.g., {season:"winter", aircraft:"narrowbody"}

    // Contract Rule Period
    activeFrom: date('active_from'), // effective from date of the rule
    activeTo: date('active_to'), // effective to date of the rule

    // Timestamps
    createdAt,
    updatedAt,
  },
  (table) => [
    foreignKey({
      columns: [table.contractId],
      foreignColumns: [contractsTable.id],
      name: 'fk_contract_rules_contract_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_contract_rules_org_id',
    }).onDelete('cascade'),
  ],
);

// -------------------- Contract Invoices --------------------
export const invoicesTable = pgTable(
  'invoices',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(), //fk to orgs table
    airportId: uuid('airport_id'), //fk to airports table
    contractId: uuid('contract_id'), //fk to contracts table
    vendorId: uuid('vendor_id'), //fk to vendors table

    // Invoice Information
    invoiceNumber: text('invoice_number').notNull(), // number of the invoice
    invoiceDate: date('invoice_date'), // date when the invoice was issued
    totalAmount: numeric('total_amount'), // total amount of the invoice
    currency: text('currency'), // currency of the invoice

    // Document Management
    summary: text('summary'), // summary of the invoice
    docUrl: text('doc_url'), // url of the invoice document

    // Vendor Information
    vendorName: text('vendor_name'),
    vendorAddress: text('vendor_address'),
    vendorContactName: text('vendor_contact_name'),
    vendorContactEmail: text('vendor_contact_email'),
    vendorContactPhone: text('vendor_contact_phone'),
    vendorComments: text('vendor_comments'),

    // Timeline
    periodStart: date('period_start'), // start date of the invoice period
    periodEnd: date('period_end'), // end date of the invoice period

    // Timestamps
    createdAt,
    updatedAt,
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_invoices_org_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.airportId],
      foreignColumns: [airportsTable.id],
      name: 'fk_invoices_airport_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.contractId],
      foreignColumns: [contractsTable.id],
      name: 'fk_invoices_contract_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.vendorId],
      foreignColumns: [vendorsTable.id],
      name: 'fk_invoices_vendor_id',
    }).onDelete('cascade'),
  ],
);

/* -------------------- Invoice Lines -------------------- */
export const invoiceLinesTable = pgTable(
  'invoice_lines',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(), //fk to orgs table
    invoiceId: uuid('invoice_id').notNull(), //fk to invoices table

    // Invoice Line Information
    lineNo: integer('line_no'), // line number of the invoice line
    description: text('description'), // description of the invoice line
    serviceDate: date('service_date'), // date when the service was provided
    chargeType: text('charge_type'), // e.g., gpu_hour, bus, deicing, parking, airport_fee, fuel_uplift, other
    quantity: numeric('quantity'), // quantity of the service
    uom: text('uom'), // unit of measure of the service
    unitPrice: numeric('unit_price'), // unit price of the service
    amount: numeric('amount'), // amount of the service
    taxAmount: numeric('tax_amount'), // tax amount of the service
    currency: text('currency'), // currency of the service
    aiExtract: jsonb('ai_extract').default({}), // raw tokens, positions, vendor column mapping

    // Contract Rule Management
    matchedContractRuleId: uuid('matched_contract_rule_id'), //fk to contract rules table
    expectedCalc: jsonb('expected_calc').default({}), // expected calculation
    expectedAmount: numeric('expected_amount'), // expected amount of the service
    deltaAmount: numeric('delta_amount'), // difference between expected and actual amount
    deltaReason: text('delta_reason'), // rate_mismatch, uncontracted_charge, unused_service, tax_error, other
    decision: decisionEnum('decision'), // open, accepted, rejected, disputed

    // Timestamps
    createdAt,
    updatedAt,
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_invoice_lines_org_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.invoiceId],
      foreignColumns: [invoicesTable.id],
      name: 'fk_invoice_lines_invoice_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.matchedContractRuleId],
      foreignColumns: [contractRulesTable.id],
      name: 'fk_invoice_lines_matched_contract_rule_id',
    }).onDelete('cascade'),
  ],
);

// ==================== FUEL PROCUREMENT TABLES ====================

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

    // Base Unit of Measure & Currency
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
    vendorId: uuid('vendor_id'), //fk to vendors table

    // Vendor Information
    vendorName: text('vendor_name'),
    vendorAddress: text('vendor_address'),
    vendorContactName: text('vendor_contact_name'),
    vendorContactEmail: text('vendor_contact_email'),
    vendorContactPhone: text('vendor_contact_phone'),
    vendorComments: text('vendor_comments'),

    // Bid Information
    title: text('title'), // title of the bid
    round: integer('round'), // round number of the bid
    bidSubmittedAt: date('bid_submitted_at'), // date when the bid was submitted

    // Document Management
    summary: text('summary'), // summary of the bid
    docUrl: text('doc_url'), // url of the bid document

    // Pricing Structure
    priceType: text('price_type'), // fixed, index_formula
    uom: text('uom'), // USG, L, m3, MT
    currency: text('currency'), // currency of the bid
    paymentTerms: text('payment_terms'), // payment terms of the bid
    baseUnitPrice: numeric('base_unit_price'), // base unit price of the bid

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

    // Technical
    densityAt15C: numeric('density_at_15c'), // kg/m3 if mass quote present

    // Decision Tracking
    decision: decisionEnum('decision'), // accepted, rejected, pending
    decisionByUserId: uuid('decision_by_user_id'), // fk to users table
    decisionAt: timestamp('decision_at', { withTimezone: true }), // date when the decision was made
    decisionNotes: text('decision_notes'), // notes about the decision

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
    foreignKey({
      columns: [table.vendorId],
      foreignColumns: [vendorsTable.id],
      name: 'fk_fuel_bids_vendor_id',
    }).onDelete('cascade'),
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
