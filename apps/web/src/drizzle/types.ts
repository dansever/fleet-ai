import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { contractsTable } from './schema/schema.contracts';
import { airportsTable, organizationsTable, usersTable } from './schema/schema.core';
import { chunksTable, documentsTable } from './schema/schema.documents';
import { fuelBidsTable, fuelTendersTable } from './schema/schema.fuel';
import { invoicesTable } from './schema/schema.invoices';
import { quotesTable, rfqsTable } from './schema/schema.technical';
import { vendorContactsTable, vendorsTable } from './schema/schema.vendors';

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
export type VendorContact = InferSelectModel<typeof vendorContactsTable>;
export type NewVendorContact = InferInsertModel<typeof vendorContactsTable>;
export type UpdateVendorContact = Partial<NewVendorContact>;

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

// ==================== INVOICES ====================
export type Invoice = InferSelectModel<typeof invoicesTable>;
export type NewInvoice = InferInsertModel<typeof invoicesTable>;
export type UpdateInvoice = Partial<NewInvoice>;

// ==================== FUEL TENDERS ====================
export type FuelTender = InferSelectModel<typeof fuelTendersTable>;
export type NewFuelTender = InferInsertModel<typeof fuelTendersTable>;
export type UpdateFuelTender = Partial<NewFuelTender>;

// ==================== FUEL BIDS ====================
export type FuelBid = InferSelectModel<typeof fuelBidsTable>;
export type NewFuelBid = InferInsertModel<typeof fuelBidsTable>;
export type UpdateFuelBid = Partial<NewFuelBid>;

// ==================== DOCUMENTS ====================
export type Document = InferSelectModel<typeof documentsTable>;
export type NewDocument = InferInsertModel<typeof documentsTable>;
export type UpdateDocument = Partial<NewDocument>;

// ==================== CHUNKS ====================
export type Chunk = InferSelectModel<typeof chunksTable>;
export type NewChunk = InferInsertModel<typeof chunksTable>;
export type UpdateChunk = Partial<NewChunk>;
