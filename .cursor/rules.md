---
alwaysApply: true
---

## Purpose

This project is building **FleetAI** – an AI-driven procurement contract management platform, starting with aviation and expanding to adjacent industries (maritime, logistics, etc.).

Our focus areas:

- **Technical Procurement Co-Pilot**: RFQ automation, quote parsing, contract leakage detection, and logistics risk monitoring.
- **Ground Services & Fuel Procurement Co-Pilot**: contract sourcing, auction management, compliance monitoring, and detection of contract leakage in ground services and fuel procurement.

Other Fleet modules (capital, marketplace, etc.) exist but are not the current priority.

---

## Product Context

Airlines and operators face **hidden procurement losses** from fragmented workflows across email, spreadsheets, and legacy systems. Procurement inefficiencies lead to:

- **Direct financial impact**: Contract leakage, billing errors, and double-charging.
- **Operational risk**: Missed logistics delays and certification gaps.
- **Time costs**: Manual decision cycles slow down procurement and approvals.

For airlines, procurement delays can cost **up to \$250K per day per AOG** (Aircraft on Ground).

FleetAI’s wedge is **an AI overlay on existing workflows** – not a rip-and-replace platform. It is designed to:

- Automate RFQs and parse supplier quotes from email and other channels.
- Detect leakage, billing discrepancies, and unused services.
- Flag certification gaps and logistics risks before they create disruptions.
- Provide explainable AI insights with human-in-the-loop validation.

---

## Strategic Principles

- **Overlay, not replacement** – integrate seamlessly with current procurement workflows.
- **Human-in-the-loop** – AI augments, humans decide. Outputs remain transparent and explainable.
- **Compliance-first** – certifications, traceability, and auditability built in from day one.
- **Wedge to win** – start with AOG, ground services, and fuel procurement where ROI and urgency are highest.

---

## AI Co-Pilot Responsibilities

### Technical Procurement AI Co-Pilot

- **RFQ automation**:
  - Parse incoming RFQs and supplier quotes.
  - Normalize pricing, lead times, certifications, and terms.

- **Discrepancy detection**:
  - Contract leakage (invoice vs. agreed terms).
  - Missing certifications or traceability gaps.

- **Decision acceleration**:
  - Ranked vendor comparisons with risk/ROI scoring.
  - Proactive alerts for delays or supply chain risks.

### Contract AI Co-Pilot (Ground Services & Fuel)

- **Tender/auction support**:
  - Manage ground services and fuel tenders to secure optimal terms per destination.

- **Contract monitoring**:
  - Validate billing against agreed terms.
  - Detect unused or double-billed services.
  - Identify rate discrepancies in ground handling and fuel procurement.

- **Compliance & finance enablement**:
  - Explainable alerts for human validation.
  - Structured, auditable records for finance and compliance teams.

---

## Out of Scope (for now)

- Capital/financing modules.
- Marketplace/live vendor scoring and availability.
- Advanced logistics orchestration.

---

## Implementation Notes

- **Frontend guidance** is in `frontend.md`.
- **Backend guidance** is in `backend.md`.
- This file (`rules.md`) defines **product and domain context** so the codebase consistently aligns with procurement AI use cases.

---
