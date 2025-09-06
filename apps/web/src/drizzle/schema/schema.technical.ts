import { relations } from 'drizzle-orm';
import {
  foreignKey,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { OrderDirectionEnum, ProcessStatusEnum } from '../enums';
import { createdAt, updatedAt } from './common';
import { organizationsTable, usersTable } from './schema';

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
    processStatus: ProcessStatusEnum('process_status').default('pending'),
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
    processStatus: ProcessStatusEnum('process_status').default('pending'),

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
