# Database Schema Documentation

This document provides an overview of the PostgreSQL database schema for the Fleet AI platform, focusing on contract management, invoice reconciliation, and procurement workflows.

## Schema Overview

The database is organized into four main domains:

1. **Core** - Organizations, users, airports, and foundational entities
2. **Suppliers & Contacts** - Vendor management and contact information
3. **Technical Procurement** - RFQ/Quote workflows for parts and services
4. **Procurement Contract Management** - Contract management and invoice reconciliation

---

## Core Tables

### `organizations`

**Purpose**: Multi-tenant organization management  
**Key Fields**: `clerkOrgId`, `name`, usage tracking fields  
**Relationships**: Parent to all other entities via `orgId`

### `users`

**Purpose**: User accounts within organizations  
**Key Fields**: `clerkUserId`, `orgId`, `firstName`, `lastName`, `email`  
**Relationships**:

- Belongs to `organizations`
- Creates `rfqs`

### `airports`

**Purpose**: Airport/location master data  
**Key Fields**: `iata`, `icao`, `name`, `country`, `isHub`  
**Relationships**:

- Belongs to `organizations`
- Referenced by `contracts`, `invoices`, `ops_evidence`

---

## Suppliers & Contacts

### `vendors`

**Purpose**: Supplier/vendor master data  
**Key Fields**: `name`  
**Relationships**:

- Belongs to `organizations`
- Referenced by `contracts`, `invoices`, `contacts`

### `contacts`

**Purpose**: Individual contact persons at vendors or airports  
**Key Fields**: `name`, `email`, `phone`, `department`, `role`  
**Relationships**:

- Belongs to `organizations`
- Optional links to `airports` and `vendors`

---

## Technical Procurement

### `rfqs` (Request for Quotes)

**Purpose**: Outbound procurement requests for technical parts/services  
**Key Fields**: `rfqNumber`, `partNumber`, `quantity`, `status`, `selectedQuoteId`  
**Relationships**:

- Created by `users`
- Belongs to `organizations`
- Receives multiple `quotes`
- Can select one winning `quote`

### `quotes`

**Purpose**: Vendor responses to RFQs  
**Key Fields**: `price`, `leadTime`, `partCondition`, `warranty`, `status`  
**Relationships**:

- Responds to `rfqs`
- Belongs to `organizations`

---

## Procurement Contract Management

### `contracts`

**Purpose**: Master agreements with vendors for all service types  
**Key Fields**: `title`, `contractType`, `effectiveFrom`, `effectiveTo`  
**Contract Types**: `fuel`, `ground_handling`, `catering`, `technical_mro_parts`, `airport_and_nav_charges`, etc.  
**Relationships**:

- Belongs to `organizations`
- Links to `airports` and `vendors`
- Contains multiple `contract_rules`
- Referenced by `invoices`

### `contract_rules`

**Purpose**: Detailed pricing rules within contracts  
**Key Fields**: `chargeCode`, `priceModel`, `rate`, `uom`, `currency`, `formula`, `applicability`  
**Price Models**: `fixed`, `per_unit`, `tiered`, `index_formula` (for fuel), `bundled`, `waived`  
**Relationships**:

- Belongs to `contracts` and `organizations`
- Referenced by `invoice_lines` for rate matching

### `invoices`

**Purpose**: Supplier bills received for reconciliation  
**Key Fields**: `invoiceNumber`, `invoiceDate`, `totalAmount`, `periodStart`, `periodEnd`  
**Relationships**:

- Belongs to `organizations`
- Links to `airports`, `vendors`, and optionally `contracts`
- Contains multiple `invoice_lines`

### `invoice_lines`

**Purpose**: Individual line items on invoices with reconciliation data  
**Key Fields**: `chargeType`, `quantity`, `unitPrice`, `amount`, `expectedAmount`, `deltaAmount`  
**Reconciliation Fields**:

- `matchedContractRuleId` - links to applicable contract rule
- `expectedCalc` - JSON showing calculation methodology
- `deltaAmount` - difference between billed and expected amounts
  **Relationships**:
- Belongs to `invoices` and `organizations`
- Optionally matches to `contract_rules`
- Can generate `claims`

---

## Operations & Claims

### `ops_evidence`

**Purpose**: Operational data to validate billed services  
**Key Fields**: `flightId`, `serviceCode`, `evidenceType`, `timestamp`, `details`  
**Relationships**:

- Belongs to `organizations` and `airports`
- Linked contextually to invoice lines by airport + service + time

### `claims`

**Purpose**: Dispute management for billing discrepancies  
**Key Fields**: `reason`, `status`, `claimPackUrl`, `recoveredAmount`  
**Relationships**:

- Belongs to `organizations`
- Links to specific `invoice_lines`

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
