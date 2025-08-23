---
alwaysApply: true
---

## Purpose

This project is building **FleetAI** - An AI-based Platform for airline procurement, focused on:

- **Technical Procurement Co-Pilot**: RFQ automation, quote parsing, leakage detection, and logistics risk flagging.
- **Ground Services & Fuel Procurement Co-Pilot**: contract monitoring, compliance validation, contract sourcing and managemenet of auctions, and detection of contract leakage in ground services and fuel procurement.

Other Fleet modules (capital, marketplace, etc.) exist but are not the current development focus.

---

## Product Context

- Airlines face **hidden procurement losses** due to fragmented workflows across email, spreadsheets, and siloed systems.
- Procurement is a critical bottleneck: delays can cost airlines **up to $250K per day per AOG**.
- **Key problems**:
  - Contract leakage (paying above agreed rates, unused services).
  - Missed logistics delays (no proactive visibility).
  - Slow decision cycles (manual comparisons, certifications, and approvals).

Fleet’s wedge is **an AI overlay on existing workflows** (not a rip-and-replace system), designed to:

- Automate RFQs and parse supplier quotes over email.
- Detect contract leakage and invoice discrepancies.
- Flag certification gaps and logistics risks before they cause service delays:contentReference[oaicite:1]{index=1}.
- Provide explainable AI with human-in-the-loop validation.

---

## Strategic Principles

- **Workflow overlay, not replacement** – integrate directly into current procurement processes.
- **Human-in-the-loop AI** – augment decisions with explainable outputs.
- **Compliance-first** – certifications, traceability, and auditability from launch.
- **Wedge to win** – start with AOG, ground services, and fuel procurement where ROI is highest.

---

## AI Co-Pilot Responsibilities

### Technical Procurement AI Co-Pilot

- Automates RFQ handling:
  - Parse incoming RFQs and supplier quotes.
  - Normalize pricing, lead times, certifications, and terms.
- Detects discrepancies:
  - Contract leakage (invoice vs agreed terms).
  - Missing certifications or traceability gaps.
- Speeds up quote-to-decision cycle:
  - Provides ranked vendor comparisons with risk/ROI insights.
  - Surfaces urgent delays or risks proactively.

### Contract AI Co-Pilot (Ground Services & Fuel)

- Help manage fuel and other ground services tenders/auctions - to get the best agreement for each service at each desitnation.
- Monitors live contracts for compliance and leakage:
  - Ensures billing matches agreed terms.
  - Detects unused or double-billed services.
  - Flags rate discrepancies in ground handling or fuel procurement.
- Provides explainable alerts for human validation.
- Generates structured, auditable records for finance and compliance teams.

---

## Out of Scope (for now)

- Capital/financing modules.
- Marketplace/live vendor scoring and availability.
- Advanced embedded logistics orchestration.

---

## Implementation Notes

- **Frontend guidance** is captured separately in `frontend.md`.
- **Backend guidance** is captured separately in `backend.md`.
- This file (`rules.md`) is about **product and domain context** so the codebase always aligns with the procurement AI use cases.

---
