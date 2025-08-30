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

// ==============================================================
// ============================ CORE ============================
// ==============================================================

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
/* -------------------- Airports Relations -------------------- */
export const airportsRelations = relations(airportsTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [airportsTable.orgId],
    references: [organizationsTable.id],
  }),
  contracts: many(contractsTable),
  invoices: many(invoicesTable),
  contacts: many(contactsTable),
  opsEvidence: many(opsEvidenceTable),
  fuelTenders: many(fuelTendersTable),
}));

// ==============================================================
// ==================== SUPPLIERS & CONTACTS ====================
// ==============================================================

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
/* -------------------- Vendors Relations -------------------- */
export const vendorsRelations = relations(vendorsTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [vendorsTable.orgId],
    references: [organizationsTable.id],
  }),
  contracts: many(contractsTable),
  invoices: many(invoicesTable),
  contacts: many(contactsTable),
  fuelBids: many(fuelBidsTable),
}));

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
/* -------------------- Contacts Relations -------------------- */
export const contactsRelations = relations(contactsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [contactsTable.orgId],
    references: [organizationsTable.id],
  }),
  airport: one(airportsTable, {
    fields: [contactsTable.airportId],
    references: [airportsTable.id],
  }),
  vendor: one(vendorsTable, {
    fields: [contactsTable.vendorId],
    references: [vendorsTable.id],
  }),
}));

// ===============================================================
// ==================== TECHNICAL PROCUREMENT ====================
// ===============================================================

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

// ================================================================
// ==================== FUEL TENDER & BIDDING ====================
// ================================================================

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
}));

/* -------------------- Fuel Bids Relations -------------------- */
export const fuelBidsRelations = relations(fuelBidsTable, ({ one }) => ({
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
}));

// ================================================================
// ================== PROCUREMENT CONTRACT MANAGEMENT ==============
// ================================================================

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

/* -------------------- Contracts Relations -------------------- */
export const contractsRelations = relations(contractsTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [contractsTable.orgId],
    references: [organizationsTable.id],
  }),
  airport: one(airportsTable, {
    fields: [contractsTable.airportId],
    references: [airportsTable.id],
  }),
  vendor: one(vendorsTable, {
    fields: [contractsTable.vendorId],
    references: [vendorsTable.id],
  }),
  rules: many(contractRulesTable),
  invoices: many(invoicesTable),
}));

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

/* -------------------- Contract Rules Relations -------------------- */
export const contractRulesRelations = relations(contractRulesTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [contractRulesTable.orgId],
    references: [organizationsTable.id],
  }),
  contract: one(contractsTable, {
    fields: [contractRulesTable.contractId],
    references: [contractsTable.id],
  }),
  matchedInvoiceLines: many(invoiceLinesTable),
}));

// -------------------- Invoices --------------------
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

/* -------------------- Invoices Relations -------------------- */
export const invoicesRelations = relations(invoicesTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [invoicesTable.orgId],
    references: [organizationsTable.id],
  }),
  airport: one(airportsTable, {
    fields: [invoicesTable.airportId],
    references: [airportsTable.id],
  }),
  vendor: one(vendorsTable, {
    fields: [invoicesTable.vendorId],
    references: [vendorsTable.id],
  }),
  contract: one(contractsTable, {
    fields: [invoicesTable.contractId],
    references: [contractsTable.id],
  }),

  lines: many(invoiceLinesTable),
}));

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

/* -------------------- Invoice Lines Relations -------------------- */
export const invoiceLinesRelations = relations(invoiceLinesTable, ({ one, many }) => ({
  invoice: one(invoicesTable, {
    fields: [invoiceLinesTable.invoiceId],
    references: [invoicesTable.id],
  }),
  matchedRule: one(contractRulesTable, {
    fields: [invoiceLinesTable.matchedContractRuleId],
    references: [contractRulesTable.id],
  }),
  claims: many(claimsTable),
}));

// ============================================================
// ======================= OPS & CLAIMS =======================
// ============================================================

/* -------------------- Ops Evidence -------------------- */
export const opsEvidenceTable = pgTable(
  'ops_evidence',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(), // fk to orgs
    airportId: uuid('airport_id'), // fk to airports

    // Ops Evidence Information
    flightId: text('flight_id'), // optional, flight number or UUID
    serviceCode: text('service_code'), // matches invoice line chargeType
    evidenceType: text('evidence_type'), // sensor, pilot_note, uplift_report, etc.
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    details: jsonb('details').default({}), // raw evidence payload

    // Timestamps
    createdAt,
    updatedAt,
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_ops_evidence_org_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.airportId],
      foreignColumns: [airportsTable.id],
      name: 'fk_ops_evidence_airport_id',
    }).onDelete('cascade'),
  ],
);

export const opsEvidenceRelations = relations(opsEvidenceTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [opsEvidenceTable.orgId],
    references: [organizationsTable.id],
  }),
  airport: one(airportsTable, {
    fields: [opsEvidenceTable.airportId],
    references: [airportsTable.id],
  }),
}));

/* -------------------- Claims -------------------- */
export const claimsTable = pgTable(
  'claims',
  {
    // System Fields
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(), // fk to orgs
    invoiceLineId: uuid('invoice_line_id').notNull(), // fk to invoice lines

    // Claim Details
    reason: text('reason'), // e.g. rate_mismatch, unused_service, etc.
    status: statusEnum('status').default('pending'), // draft, sent, resolved
    claimPackUrl: text('claim_pack_url'), // PDF reference
    recoveredAmount: numeric('recovered_amount').default('0'),

    // Timestamps
    createdAt,
    updatedAt,
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizationsTable.id],
      name: 'fk_claims_org_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.invoiceLineId],
      foreignColumns: [invoiceLinesTable.id],
      name: 'fk_claims_invoice_line_id',
    }).onDelete('cascade'),
  ],
);

/* -------------------- Claims Relations -------------------- */
export const claimsRelations = relations(claimsTable, ({ one }) => ({
  line: one(invoiceLinesTable, {
    fields: [claimsTable.invoiceLineId],
    references: [invoiceLinesTable.id],
  }),
}));
