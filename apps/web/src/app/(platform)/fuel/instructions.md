# Fuel Procurement Page Spec for Cursor AI

## Context

- This page is **per airport**. The user already selected the airport elsewhere.
- Tabs in this page: **Overview**, **Tenders**, **Agreements**, **Invoices**, **Historic Data**, **Suppliers**.
- Goal: fast, low friction workflows that convert PDFs and emails into structured data, compare bids, validate invoices, and surface AI powered insights with clear traceability.

## Global UX and Layout

- Two column layout:
  - Main content on the left.
  - Persistent **AI Panel** on the right that adapts to the active tab and current selection.
- Use clear section headers, descriptive empty states, and inline help tooltips.
- Keep latency low. Run heavy parsing and validations in background jobs. Show optimistic UI with job status toasts.

## Component Tree (high level)

```
/fuel/[airportId]
  ├─ Tabs
  │   ├─ OverviewTab
  │   ├─ TendersTab
  │   │   ├─ TendersList
  │   │   └─ TenderDetail
  │   │       ├─ TenderHeaderCard
  │   │       ├─ TenderTimeline
  │   │       ├─ TenderSpecs
  │   │       ├─ LotsSection (optional)
  │   │       └─ BidsSection
  │   │           ├─ BidInbox
  │   │           ├─ ParsedBidsTable
  │   │           └─ ComparatorMatrix
  │   ├─ AgreementsTab
  │   │   ├─ AgreementsTable
  │   │   └─ AgreementDetail
  │   ├─ InvoicesTab
  │   │   ├─ ExceptionsFilters
  │   │   ├─ InvoicesTable
  │   │   └─ InvoiceDetail
  │   ├─ HistoricDataTab
  │   └─ SuppliersTab
  └─ AIPanel (context aware) - Implement later. NOT NOW!
```

- Keep detail views in a Drawer or Sheet on desktop and as a full screen modal on mobile.

## Shared AI Panel - for later implementation

- Always visible on the right.
- Shows three blocks:
  1. **What changed**: a concise diff since last visit.
  2. **Anomalies**: top 3 risk items with links to investigate.
  3. **Suggested actions**: one click quick actions that call mutations.
- Add a small toggle to expand into a chat for deeper prompts scoped to the current context. Provide quick prompt chips.

---

Implement NOW:

## Tab 1: Overview

### Objective

- Give a daily cockpit for this airport. Prioritize exception awareness and next actions.

### Layout

- KPI cards row:
  - Open tenders
  - Bids received
  - Agreements in force
  - Invoices with exceptions
  - Month to date volume
  - Savings to date
- Today section:
  - Upcoming tender deadlines
  - Agreements that renew in next 30 days
  - Open disputes count
- Exceptions tiles:
  - Price mismatch
  - Fee mismatch
  - Quantity variance
  - Index drift
- Mini charts:
  - All in price trend for 6 months
  - Supplier share
  - Anomaly rate

### AI features

- Change summary since yesterday.
- Forecast sanity check vs last year and schedule.
- Suggested actions: start tender, nudge suppliers, review invoice exceptions.
- One click generation of an email or task for each action.

### Wow moments

- Single click “Create tender draft from insights” that pre fills period, forecast, and supplier invite list.
- “Explain this spike” button on charts that generates a plain language reason with evidence links.

---

## Tab 2: Tenders (with Bids inside)

### Objective

- One workspace to create tenders, ingest bids, normalize data, and compare offers.

### List view

- Filters: status, quarter, fuel type.
- Columns: Tender name, period, forecast volume, suppliers responded, round, status.
- Bulk actions: export list to Excel, archive, duplicate.

### Tender detail

- Header card: tender period, fuel type, volume forecast, base currency, base unit, status, responded suppliers.
- Timeline strip: RFQ sent, bids due, evaluation, award.
- Specs and attachments section.
- Optional Lots section if you split by period or sub bundles.
- **Bids section**:
  - **Bid inbox** with drag and drop upload and email routing note.
  - **Parsed bids table** with columns:
    - Supplier
    - Price type (fixed or index)
    - Base price or index fields
    - Fees: into plane, handling
    - Inclusions: taxes, airport fees
    - Normalized all in price in base currency and base unit
    - AI confidence and parsing status
  - **Comparator matrix** with toggles:
    - Normalize to base currency and unit
    - Include or exclude taxes and airport fees
    - Overlay market reference and z score anomaly flag
  - Actions:
    - Shortlist suppliers and request revision with tracked reasons
    - Approve winning bid and auto create Agreement
    - Export comparison to Excel

### AI features

- RFQ drafting from prior tenders and specs.
- PDF to XLSX parsing with structured fields and confidence.
- Unit and currency normalization with computation trace.
- Best value recommendation with what if sliders for index and FX sensitivity.
- Negotiation assistant that drafts a supplier specific counter proposal.

### Wow moments

- Upload a messy PDF and instantly see a clean normalized row in the table with a “view trace” link.
- One click award splits across suppliers suggested by the optimizer with projected savings.

---

## Tab 3: Agreements

### Objective

- Manage active and past contracts and connect them to operations.

### List view

- Columns: Agreement name, supplier, period, fixed or index, renewal date, coverage percent, open disputes.
- Filters for period and status.

### Agreement detail

- Summary: period, supplier, linked tender and winning bid, price formula snapshot, fee ledger, inclusions.
- SLA and compliance: KPIs, insurance expiry, required docs.
- Linked items: invoices under this agreement and current issues.
- Renewal helpers: reminders and a button to draft a fresh RFQ from this agreement.

### AI features

- Clause and term search across all contracts.
- Drift detection between contract terms and executed invoices.
- Renewal brief with suggested edits based on year to date issues.

### Wow moments

- “Explain this clause” creates a short plain language interpretation with risk flags.
- “Show drift” instantly highlights where invoices deviated from contract and by how much.

---

## Tab 4: Invoices

### Objective

- Exception first validation and dispute workflow at scale.

### List view

- Default view shows only invoices with exceptions.
- Facets: exception type, supplier, agreement, severity, status.
- Columns: supplier, invoice number, date, exception type, severity, amount at risk, owner.

### Invoice detail

- Header: supplier, date, agreement link, flight or uplift reference.
- Validation view with three columns:
  - Invoice line items
  - Agreement terms
  - Uplift logs and calculations
- Exception explainer with math trace and confidence.
- Actions: generate dispute pack, mark resolved, assign owner, add note.

### AI features

- Cross validation against agreement terms, uplift logs, and market markers.
- Root cause analysis suggestions.
- Auto generated dispute memo and email draft.
- Learning loop that proposes rule updates to reduce repeating error types.

### Wow moments

- Single click “Generate dispute pack” produces a zipped Excel and PDF bundle with all evidence and an email draft.
- “Fix it for me” applies a safe correction when a predictable fee mapping is wrong and opens a PR for the rule set.

---

## Tab 5: Historic Data

### Objective

- Trends, forecasting, and planning for this airport.

### Views

- Spend and volume trends per month and supplier.
- All in price trend vs benchmark.
- Savings tracker: auction savings and recovered credits.
- Exception analytics by type and supplier.
- Exportable datasets.

### AI features

- Demand forecast with confidence bands.
- Index exposure analysis and hedging hints.
- Next tender recommendations with proposed supplier list and bundles.

### Wow moments

- “Build next tender from forecast” creates a ready to review draft in Tenders with AI notes.
- “Explain trend” annotates charts with key drivers sourced from historic events and contract changes.

---

## Tab 6: Suppliers

### Objective

- Centralize vendor intelligence at this airport.

### List view

- Columns: supplier, response rate, win rate, invoice issue rate, performance score.
- Filters for compliance status and active agreements.

### Supplier profile

- Summary, contacts, compliance and insurance.
- Bids timeline, agreements, invoice exceptions and resolutions.
- Scorecard with trend and percentile vs peers.

### AI features

- Risk alerts and de risking suggestions.
- Pre qualification recommender for next tender based on performance.
- Draft vendor feedback letters.

### Wow moments

- One click “Invite to tender” builds a tailored RFQ email with data backed reasons.
- “Show me why score dropped” returns a clear narrative with linked incidents.

---

## Data and Integration Notes

- Keep computation traces on normalization and validation for audit.
- Every major grid supports Excel export.
- Background jobs for ingestion and validations. Use WebSockets or Server Sent Events for status updates.
- Maintain a semantic index of contracts and specs for clause level search in the AI panel.

## Acceptance Criteria

- All tabs render with fast navigation and clear empty states.
- AI panel is context aware and offers at least three useful quick actions per tab.
- Tender bid parsing produces a normalized row within 5 seconds for a 2 page PDF.
- Comparator matrix can export to Excel with toggles applied.
- Invoice validation explains exceptions in plain language and links to evidence.
- Historic Data can render one year of monthly charts without timeouts.
- Supplier scorecards show a numeric score and a short explanation.

## Implementation Hints

- Use shadcn/ui Cards, Tables, DataTable with column filters, Sheet for details, and Toast for job status.
- Prefer TanStack Query for data fetching with cache keys by airportId and tab.
- Add feature flags for Lots and Optimizer so you can ship incrementally.
- Wrap AI calls in a simple agent service with deterministic fallbacks and show confidence scores.
