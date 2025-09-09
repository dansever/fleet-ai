# backend/app/schemas/contract.py
from typing import Dict
from pydantic import BaseModel, Field
from app.schemas.enums import ContractTypes
from app.schemas.vendor import Vendor
from datetime import date

class Contract(BaseModel):
    """Structured contract information extracted from procurement documents."""

    vendor: Vendor = Field(
        ...,
        description="Supplier information (name, address, and contacts if available)."
    )

    vendor_comments: str | None = Field(
        None,
        description="Any free-text remarks from the vendor. Verbatim if present, otherwise null."
    )

    title: str | None = Field(
        None,
        description="Official contract title. If absent, synthesize a clear identifier (e.g., 'Fuel Supply Agreement - TLV - 2025')."
    )

    contract_type: ContractTypes | None = Field(
        None,
        description="Most specific contract type from the enum."
    )

    effective_from: date | None = Field(
        None,
        description="Start date of contract (prefer effective over signature date)."
    )

    effective_to: date | None = Field(
        None,
        description="End or renewal boundary. Leave null if evergreen/auto-renewing."
    )

    summary: str | None = Field(
        None,
        description="2-3 sentence executive synopsis covering parties, purpose, scope, term, renewal, value if given, pricing model, payment terms, and major SLAs/liabilities."
    )

    commercial_terms: str | None = Field(
        None,
        description="Key commercial and pricing terms in 1–2 sentences: pricing model, rates/formulas, unit, minimums, surcharges, discounts, payment terms, invoicing, caps."
    )

    slas: str | None = Field(
        None,
        description="1-3 sentence summary of major SLAs: uptime/availability, dispatch times, throughput, penalties/credits, and quality standards."
    )

    edge_cases: str | None = Field(
        None,
        description="1-3 sentences on unusual conditions affecting scope, pricing, or service (e.g., outages, surcharges, restrictions, exceptions)."
    )

    risk_liability: str | None = Field(
        None,
        description="1-3 sentences on liability and risk allocation: caps, insurance, indemnities, warranties, IP, confidentiality, compliance standards."
    )

    termination_law: str | None = Field(
        None,
        description="1-3 sentences on termination and legal terms: notice/cure, auto-renewal, governing law, jurisdiction, and dispute resolution."
    )

    operational_baselines: str | None = Field(
        None,
        description="1-3 sentences on operational setup: locations, coverage, schedules, reporting, onboarding, acceptance, and incident protocols."
    )

    tags: dict | None = Field(
        None,
        description="Machine-readable key:value pairs for analytics (e.g., currency, pricing_model, unit, unit_rate, min_commit, payment_terms_days, governing_law, auto_renew). Use snake_case and normalized values."
    )


class ContractDocument(BaseModel):
    """Contract document information extracted from procurement documents"""
    title: str | None = Field(None, description="The title of the document.")
    version: int | None = Field(None, description="The version of the document.")
    source_type: str | None = Field(None, description="The source type of the document.")
    storage_url: str | None = Field(None, description="The storage URL of the document.")
    raw_text: str | None = Field(None, description="The raw text of the document.")

class ContractChunk(BaseModel):
    """Contract chunk information extracted from procurement documents"""
    order: int | None = Field(None, description="The order of the chunk within the document.")
    label: str | None = Field(None, description="The label of the chunk.")
    content: str | None = Field(None, description="The content of the chunk.")
    embedding: list[float] | None = Field(None, description="The embedding of the chunk.")
    meta: dict | None = Field(None, description="Metadata about the chunk - page, span, tokens.")