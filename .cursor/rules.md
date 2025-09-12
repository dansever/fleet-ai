---
alwaysApply: true
---

# FleetAI — Coding Rules

## Scope

FleetAI is an **AI-driven procurement assistant** for complex industries, starting with aviation.  
Focus on **technical procurement**, **ground services**, and **fuel procurement**.

Out of scope (for now):

- Capital/financing modules
- Marketplaces or live vendor scoring
- Advanced logistics orchestration

---

## Core Responsibilities

### Technical Procurement Co-Pilot

- Parse RFQs and supplier quotes (emails, PDFs, attachments).
- Normalize price, lead times, certifications, and terms.
- Detect contract leakage (invoice vs. agreed terms).
- Flag missing certifications and compliance gaps.
- Provide vendor comparisons and risk/ROI scoring.

### Ground Services & Fuel Co-Pilot

- Support tenders and auction management.
- Detect unused or double-billed services.
- Identify rate drift or billing discrepancies.
- Validate certifications and maintain audit records.

---

## Strategic Guardrails

- **Overlay-first**: integrate into existing workflows; don’t design rip-and-replace.
- **Human-in-loop**: AI makes suggestions, humans approve.
- **Compliance-first**: always design for auditability and traceability.
- **Focus wedge**: prioritize AOG, ground services, and fuel modules before expansion.

---

## AI Implementation Notes

- **Document extraction**: build around robust parsing of PDFs, emails, attachments.
- **RAG**: enable contract + invoice history querying for context.
- **Agents**: automate repetitive procurement tasks (quote normalization, discrepancy checks).
- **Explainability**: all outputs must provide reasoning + structured logs.

---

## Cursor Alignment

This file defines **implementation scope and constraints** so AI-generated code consistently aligns with FleetAI’s procurement mission.  
For product vision, strategy, and storytelling, refer to `vision.md`.
