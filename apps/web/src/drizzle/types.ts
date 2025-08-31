import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  airportsTable,
  claimsTable,
  contactsTable,
  contractRulesTable,
  contractsTable,
  fuelBidsTable,
  fuelTendersTable,
  invoiceLinesTable,
  invoicesTable,
  opsEvidenceTable,
  organizationsTable,
  quotesTable,
  rfqsTable,
  usersTable,
  vendorsTable,
} from './schema/schema';

// ==================== ORGANIZATIONS ====================
export type Organization = InferSelectModel<typeof organizationsTable>;
export type NewOrganization = InferInsertModel<typeof organizationsTable>;
export type UpdateOrganization = Partial<NewOrganization>;

// ==================== USERS ====================
export type User = InferSelectModel<typeof usersTable>;
export type NewUser = InferInsertModel<typeof usersTable>;
export type UpdateUser = Partial<NewUser>;

// ==================== AIRPORTS ====================
export type Airport = InferSelectModel<typeof airportsTable>;
export type NewAirport = InferInsertModel<typeof airportsTable>;
export type UpdateAirport = Partial<NewAirport>;

// ==================== VENDORS ====================
export type Vendor = InferSelectModel<typeof vendorsTable>;
export type NewVendor = InferInsertModel<typeof vendorsTable>;
export type UpdateVendor = Partial<NewVendor>;

// ==================== CONTACTS ====================
export type Contact = InferSelectModel<typeof contactsTable>;
export type NewContact = InferInsertModel<typeof contactsTable>;
export type UpdateContact = Partial<NewContact>;

// ==================== RFQS ====================
export type Rfq = InferSelectModel<typeof rfqsTable>;
export type NewRfq = InferInsertModel<typeof rfqsTable>;
export type UpdateRfq = Partial<NewRfq>;

// ==================== QUOTES ====================
export type Quote = InferSelectModel<typeof quotesTable>;
export type NewQuote = InferInsertModel<typeof quotesTable>;
export type UpdateQuote = Partial<NewQuote>;

// ==================== CONTRACTS ====================
export type Contract = InferSelectModel<typeof contractsTable>;
export type NewContract = InferInsertModel<typeof contractsTable>;
export type UpdateContract = Partial<NewContract>;

// ==================== CONTRACT RULES ====================
export type ContractRule = InferSelectModel<typeof contractRulesTable>;
export type NewContractRule = InferInsertModel<typeof contractRulesTable>;
export type UpdateContractRule = Partial<NewContractRule>;

// ==================== INVOICES ====================
export type Invoice = InferSelectModel<typeof invoicesTable>;
export type NewInvoice = InferInsertModel<typeof invoicesTable>;
export type UpdateInvoice = Partial<NewInvoice>;

// ==================== INVOICE LINES ====================
export type InvoiceLine = InferSelectModel<typeof invoiceLinesTable>;
export type NewInvoiceLine = InferInsertModel<typeof invoiceLinesTable>;
export type UpdateInvoiceLine = Partial<NewInvoiceLine>;

// ==================== FUEL TENDERS ====================
export type FuelTender = InferSelectModel<typeof fuelTendersTable>;
export type NewFuelTender = InferInsertModel<typeof fuelTendersTable>;
export type UpdateFuelTender = Partial<NewFuelTender>;

// ==================== FUEL BIDS ====================
export type FuelBid = InferSelectModel<typeof fuelBidsTable>;
export type NewFuelBid = InferInsertModel<typeof fuelBidsTable>;
export type UpdateFuelBid = Partial<NewFuelBid>;

// ==================== OPS EVIDENCE ====================
export type OpsEvidence = InferSelectModel<typeof opsEvidenceTable>;
export type NewOpsEvidence = InferInsertModel<typeof opsEvidenceTable>;
export type UpdateOpsEvidence = Partial<NewOpsEvidence>;

// ==================== CLAIMS ====================
export type Claim = InferSelectModel<typeof claimsTable>;
export type NewClaim = InferInsertModel<typeof claimsTable>;
export type UpdateClaim = Partial<NewClaim>;
