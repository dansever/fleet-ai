# backend/app/schemas/contract.py
from typing import Dict
from pydantic import BaseModel, Field
from app.schemas.enums import ContractTypes
from app.schemas.vendor import Vendor
from datetime import date

class Contract(BaseModel):
    """Contract information extracted from procurement documents"""
    
    vendor: Vendor = Field(..., description="Information about the supplier submitting this contract.")
    vendorComments: str | None = Field(
        None,
        description=(
            "Free-text remarks provided by the vendor that accompany the contract, cover letter, or bid. "
            "Capture the text verbatim when possible. If not present, leave null."
        ),
    )
    title: str | None = Field(
        None,
        description=(
            "Official contract title or caption as shown in the document. "
            "If no explicit title exists, synthesize a concise identifier such as "
            "\"Fuel Supply Agreement - Ben Gurion Airport - 2025\". Avoid file name artifacts."
        ),
    )

    contractType: ContractTypes | None = Field(
        None,
        description=(
            "Enum describing the agreement type. Choose the most specific type present in the text."
        ),
    )

    effectiveFrom: date | None = Field(
        None,
        description=(
            "Date the agreement becomes effective. Prefer the effective date over the signature date. "
            "If only a signature date appears and it is clearly used as the start, use that date. "
            "If pending or unspecified, leave null."
        ),
    )

    effectiveTo: date | None = Field(
        None,
        description=(
            "End date or renewal boundary. If the contract is evergreen or auto-renewing, leave null and "
            "note the renewal mechanics in summary or tags. If the term is defined by a number of months, "
            "convert to a date when possible, otherwise capture the term length in summary."
        ),
    )

    summary: str | None = Field(
        None,
        description=(
            "Executive synopsis for humans and LLMs. Write 3 to 6 short lines covering: parties, "
            "purpose and services, scope boundaries, term and renewal, total commercial value if stated, "
            "pricing model, payment terms, notable SLAs, and key termination or risk items. "
            "Include concrete numbers with currency and units."
        ),
    )

    commercialTerms: str | None = Field(
        None,
        description=(
            "Commercial details in a compact, structured narrative. Include: pricing model "
            "(fixed, per-unit, tiered, indexed), unit definitions, unit rates, quantities or minimum commitments, "
            "discounts, price adjustment or indexation formula, currency, taxes, deposits, performance bonds if any, "
            "payment terms expressed as Net X days, invoicing frequency, late fees or interest, "
            "and any spend caps or not-to-exceed amounts. Example lines:\n"
            "- Pricing model: per liter, index = Platts Med Jet; formula: index + 0.02 USD/l\n"
            "- Unit rate: 1.32 USD/liter; Min commit: 2,000,000 liters/year\n"
            "- Payment terms: Net 30; Invoicing: monthly; Late fee: 1.5% per month"
        ),
    )

    slas: str | None = Field(
        None,
        description=(
            "Service levels and remedies. Name each metric with its threshold and measurement period. "
            "Examples: uptime target, response and resolution times, delivery windows, quality specs, "
            "service credit schedule including calculation method and caps, and any exclusions or planned maintenance windows."
        ),
    )

    edgeCases: str | None = Field(
        None,
        description=(
            "Unusual conditions, exceptions, or site-specific constraints that affect scope or price. "
            "Examples: force majeure refinements, airport or security restrictions, hazardous handling rules, "
            "minimum call-out quantities, black-out periods, or acceptance test edge cases."
        ),
    )

    riskLiability: str | None = Field(
        None,
        description=(
            "Risk allocation and liability terms. Include limitation of liability amounts "
            "(absolute caps and multiples such as 12x monthly fees), carve-outs, indemnities, "
            "IP ownership and license scope, warranty period and scope, confidentiality, "
            "insurance requirements with limits and endorsements. Provide numeric caps where present."
        ),
    )

    terminationLaw: str | None = Field(
        None,
        description=(
            "Termination mechanics and governing law. Include termination for convenience and cause, "
            "notice and cure periods, auto-renewal and non-renewal notice, survival clauses, "
            "governing law, jurisdiction or venue, and dispute resolution method such as court or arbitration."
        ),
    )

    operationalBaselines: str | None = Field(
        None,
        description=(
            "Operational setup and runbook. Include service locations, delivery or service schedules, "
            "hours of operation, staffing or response coverage, onboarding or training, acceptance criteria, "
            "change management, incident severity matrix and escalation contacts, and any required tooling or data feeds."
        ),
    )

    tags: Dict | None = Field(
        None,
        description=(
            "Machine-readable key:value pairs for filtering and analytics. Use snake_case keys and normalized values. "
            "Recommended keys include: currency, pricing_model, unit, unit_rate, quantity, min_commit, "
            "total_contract_value, payment_terms_days, invoicing_frequency, index, price_formula, "
            "service_category, governing_law, auto_renew, notice_days, liability_cap_multiple, "
            "sla_uptime_target, service_credits_cap. Example: "
            "{'currency':'USD','pricing_model':'per_unit','unit':'liter','unit_rate':'1.32',"
            "'index':'Platts Med Jet','price_formula':'index+0.02 USD/l','payment_terms_days':'30',"
            "'governing_law':'IL','auto_renew':'true'}"
        ),
    )

class ContractDocument(BaseModel):
    """Contract document information extracted from procurement documents"""
    title: str | None = Field(None, description="The title of the document.")
    version: int | None = Field(None, description="The version of the document.")
    sourceType: str | None = Field(None, description="The source type of the document.")
    storageUrl: str | None = Field(None, description="The storage URL of the document.")
    rawText: str | None = Field(None, description="The raw text of the document.")

class ContractChunk(BaseModel):
    """Contract chunk information extracted from procurement documents"""
    order: int | None = Field(None, description="The order of the chunk within the document.")
    label: str | None = Field(None, description="The label of the chunk.")
    content: str | None = Field(None, description="The content of the chunk.")
    embedding: list[float] | None = Field(None, description="The embedding of the chunk.")
    meta: dict | None = Field(None, description="Metadata about the chunk - page, span, tokens.")