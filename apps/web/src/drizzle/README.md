# Database Schema Documentation

This document provides an overview of the PostgreSQL database schema for the Fleet AI platform, focusing on contract management, invoice reconciliation, and procurement workflows.

## Schema Overview

The database is organized into five main domains:

1. **Core** - Organizations, users, airports, and foundational entities
2. **Suppliers & Contacts** - Vendor management and contact information
3. **Technical Procurement** - RFQ/Quote workflows for parts and services
4. **Fuel Tender & Bidding** - Competitive fuel procurement through tenders and bids
5. **Procurement Contract Management** - Contract management and invoice reconciliation

---

## Core Tables

### `organizations`

**Purpose**: Multi-tenant organization management  
**Key Fields**: `clerkOrgId`, `name`, usage tracking fields  
**Cardinality & Relations**: One organization has many `users`, `airports`, `vendors`, `contracts`, `invoices`, `fuel_tenders`.  
**Unique**: `clerkOrgId`  
**On delete**: Cascades to all child records

### `users`

**Purpose**: User accounts within organizations  
**Key Fields**: `clerkUserId`, `orgId`, `firstName`, `lastName`, `email`  
**Cardinality & Relations**: Many users belong to one `organization`; one user has many `rfqs`.  
**Unique**: `clerkUserId`  
**On delete**: Organization → users (cascade); user → `rfqs` (cascade); `fuel_bids.decisionByUserId` set null on user delete

### `airports`

**Purpose**: Airport/location master data  
**Key Fields**: `iata`, `icao`, `name`, `country`, `isHub`  
**Cardinality & Relations**: Many airports belong to one `organization`; one airport has many `contracts`, `invoices`, `contacts`, `ops_evidence`, `fuel_tenders`.  
**Unique**: none  
**On delete**: Organization → airports (cascade); airport → linked records (cascade)

---

## Suppliers & Contacts

### `vendors`

**Purpose**: Supplier/vendor master data  
**Key Fields**: `name`  
**Cardinality & Relations**: Many vendors belong to one `organization`; one vendor has many `contracts`, `invoices`, `contacts`, `fuel_bids`.  
**Unique**: none  
**On delete**: Organization → vendors (cascade); vendor → linked records (cascade)

### `contacts`

**Purpose**: Individual contact persons at vendors or airports  
**Key Fields**: `name`, `email`, `phone`, `department`, `role`  
**Cardinality & Relations**: Many contacts belong to one `organization`; each may link to one `airport` and/or one `vendor`.  
**Unique**: none  
**On delete**: Organization/airport/vendor → contacts (cascade)

---

## Technical Procurement

### `rfqs` (Request for Quotes)

**Purpose**: Outbound procurement requests for technical parts/services  
**Key Fields**: `rfqNumber`, `partNumber`, `quantity`, `status`, `selectedQuoteId`  
**Cardinality & Relations**: Many RFQs belong to one `user` and one `organization`; one RFQ has many `quotes`; optional selected `quote`.  
**Unique**: (`orgId`, `rfqNumber`)  
**On delete**: User/org → RFQs (cascade); RFQ → quotes (cascade)

### `quotes`

**Purpose**: Vendor responses to RFQs  
**Key Fields**: `price`, `leadTime`, `partCondition`, `warranty`, `status`  
**Cardinality & Relations**: Many quotes belong to one `rfq` and one `organization`.  
**Unique**: none  
**On delete**: RFQ/org → quotes (cascade)

---

## Fuel Tender & Bidding

### `fuel_tenders`

**Purpose**: Competitive fuel procurement tenders issued by airlines  
**Key Fields**: `title`, `fuelType`, `biddingStarts`, `biddingEnds`, `deliveryStarts`, `deliveryEnds`, `winningBidId`  
**Cardinality & Relations**: Many fuel tenders belong to one `organization` and one `airport`; one tender has many `fuel_bids`; optional winning `fuel_bid`.  
**Unique**: none  
**On delete**: Org/airport → fuel tenders (cascade); tender → bids (cascade)

### `fuel_bids`

**Purpose**: Vendor responses to fuel tenders with detailed pricing  
**Key Fields**: `priceType`, `baseUnitPrice`, `indexName`, `differential`, `intoPlaneFee`, `decision`  
**Pricing Types**: `fixed` (set price) or `index_formula` (Platts/Argus-linked)  
**Cardinality & Relations**: Many fuel bids belong to one `fuel_tender`; optional link to one `vendor`; decision by one `user`.  
**Unique**: none  
**On delete**: Tender → bids (cascade); vendor → bids (cascade); user → `decisionByUserId` set null

---

## Procurement Contract Management

### `contracts`

**Purpose**: Master agreements with vendors for all service types  
**Key Fields**: `title`, `contractType`, `effectiveFrom`, `effectiveTo`  
**Contract Types**: `fuel`, `ground_handling`, `catering`, `technical_mro_parts`, `airport_and_nav_charges`, etc.  
**Cardinality & Relations**: Many contracts belong to one `organization`; optional link to one `airport` and/or one `vendor`; one contract has many `contract_rules`; one contract may be referenced by many `invoices`.  
**Unique**: none  
**On delete**: Org/airport/vendor → contracts (cascade); contract → rules and linked invoices (cascade)

### `contract_rules`

**Purpose**: Detailed pricing rules within contracts  
**Key Fields**: `chargeCode`, `priceModel`, `rate`, `uom`, `currency`, `formula`, `applicability`  
**Price Models**: `fixed`, `per_unit`, `tiered`, `index_formula` (for fuel), `bundled`, `waived`  
**Cardinality & Relations**: Many rules belong to one `contract` and one `organization`; one rule may be referenced by many `invoice_lines`.  
**Unique**: none  
**On delete**: Contract/org → rules (cascade); rule → matched invoice lines (cascade)

### `invoices`

**Purpose**: Supplier bills received for reconciliation  
**Key Fields**: `invoiceNumber`, `invoiceDate`, `totalAmount`, `periodStart`, `periodEnd`  
**Cardinality & Relations**: Many invoices belong to one `organization`; each invoice may link to one `airport`, one `vendor`, and an optional `contract`; one invoice has many `invoice_lines`.  
**Unique**: none (consider per-org invoice number uniqueness).  
**On delete**: Org/airport/vendor/contract → invoices (cascade); invoice → lines (cascade)

### `invoice_lines`

**Purpose**: Individual line items on invoices with reconciliation data  
**Key Fields**: `chargeType`, `quantity`, `unitPrice`, `amount`, `expectedAmount`, `deltaAmount`  
**Reconciliation Fields**: `matchedContractRuleId`, `expectedCalc`, `deltaAmount`  
**Cardinality & Relations**: Many lines belong to one `invoice` and one `organization`; each line may link to one `contract_rule`; one line can have many `claims`.  
**Unique**: none  
**On delete**: Invoice/org/rule → lines (cascade); line → claims (cascade)

---

## Operations & Claims

### `ops_evidence`

**Purpose**: Operational data to validate billed services  
**Key Fields**: `flightId`, `serviceCode`, `evidenceType`, `timestamp`, `details`  
**Cardinality & Relations**: Many records belong to one `organization` and one `airport`; linked to invoice lines contextually (no FK).  
**Unique**: none  
**On delete**: Org/airport → ops evidence (cascade)

### `claims`

**Purpose**: Dispute management for billing discrepancies  
**Key Fields**: `reason`, `status`, `claimPackUrl`, `recoveredAmount`  
**Cardinality & Relations**: Many claims belong to one `organization` and one `invoice_line`.  
**Unique**: none  
**On delete**: Org/line → claims (cascade)

---

## Key Reconciliation Flow

1. **Contract Setup**: Create `contracts` with detailed `contract_rules`
2. **Invoice Processing**: Receive `invoices` with `invoice_lines`
3. **Rule Matching**: Match invoice lines to contract rules via `chargeCode`
4. **Calculation**: Compute `expectedAmount` using rule rates and formulas
5. **Variance Detection**: Calculate `deltaAmount` (actual vs expected)
6. **Evidence Validation**: Cross-check with `ops_evidence` for service delivery
7. **Claim Generation**: Create `claims` for material discrepancies

---

## Important Design Patterns

### Multi-tenancy

All tables include `orgId` with foreign key to `organizations` and cascade delete.

### Nullable Relationships

- `invoices.contractId` is nullable (handles off-contract billing)
- `invoice_lines.matchedContractRuleId` is nullable (unmatched lines)

### JSON Flexibility

- `contract_rules.formula` stores complex pricing formulas (especially fuel index pricing)
- `contract_rules.applicability` stores conditional logic (season, aircraft type, etc.)
- `invoice_lines.aiExtract` preserves original AI extraction data
- `invoice_lines.expectedCalc` shows calculation audit trail

### Audit Trail

- All tables have `createdAt` and `updatedAt` timestamps
- Status history tracking in relevant workflow tables

---

## Fuel Contract Example

Fuel contracts use the unified contract system:

```sql
-- Contract
INSERT INTO contracts (contractType, title, ...)
VALUES ('fuel', 'Shell Jet A-1 Supply - LAX', ...);

-- Contract Rule with index pricing
INSERT INTO contract_rules (
  chargeCode, priceModel, formula, ...
) VALUES (
  'fuel_uplift',
  'index_formula',
  '{
    "index_name": "Platts Jet A-1 Med",
    "index_location": "LA Basin",
    "differential": "+0.05",
    "into_plane_fee": "0.12"
  }',
  ...
);
```

This unified approach handles all contract types while preserving fuel-specific pricing complexity.

---

## Fuel Tender Example

The fuel tender/bidding workflow enables competitive fuel procurement:

```sql
-- Fuel Tender
INSERT INTO fuel_tenders (
  title, fuelType, biddingStarts, biddingEnds, ...
) VALUES (
  'LAX Jet A-1 Supply Q1 2024', 'Jet A-1',
  '2024-01-01', '2024-01-15', ...
);

-- Fuel Bid with Index Pricing
INSERT INTO fuel_bids (
  tenderId, priceType, indexName, differential, intoPlaneFee, ...
) VALUES (
  tender_id,
  'index_formula',
  'Platts Jet A-1 Med',
  '+0.05', -- 5 cents above index
  '0.12',  -- $0.12 per gallon into-plane fee
  ...
);
```

This enables airlines to run competitive fuel auctions and convert winning bids into fuel contracts.
