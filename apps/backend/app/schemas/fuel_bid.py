# backend/app/schemas/fuel_bid.py
from __future__ import annotations
from typing import List, Literal, Optional, Union
from pydantic import BaseModel, Field, ConfigDict
from datetime import date
from decimal import Decimal

from app.schemas.vendor import Vendor

# Base that forbids extra keys -> JSON Schema uses additionalProperties: false
class StrictBase(BaseModel):
    model_config = ConfigDict(extra="forbid")

# ---------- Small key/value helpers instead of dicts ----------

class TagItem(StrictBase):
    key: str
    value: str

class VariableKV(StrictBase):
    name: str
    value: float

# ---------- Typed values (kept simple) ----------

class MoneyValue(StrictBase):
    type: Literal["money"] = "money"
    amount: float
    currency: str  # ISO code

class PercentageValue(StrictBase):
    type: Literal["percentage"] = "percentage"
    value: float   # 0..100

class NumberValue(StrictBase):
    type: Literal["number"] = "number"
    value: float

class BooleanValue(StrictBase):
    type: Literal["boolean"] = "boolean"
    value: bool

class TextValue(StrictBase):
    type: Literal["text"] = "text"
    value: str

class DurationValue(StrictBase):
    type: Literal["duration"] = "duration"
    days: int

class DateValue(StrictBase):
    type: Literal["date"] = "date"
    value: date

class DateRangeValue(StrictBase):
    type: Literal["date_range"] = "date_range"
    start: Optional[date]
    end: Optional[date]

class RateValue(StrictBase):
    type: Literal["rate"] = "rate"
    amount: float
    currency: Optional[str] = None
    numerator_unit: Optional[str] = None
    denominator_unit: Optional[str] = None
    formula: Optional[str] = None  # human readable

class FormulaValue(StrictBase):
    type: Literal["formula"] = "formula"
    expression: str
    # was Dict[str, float] -> now explicit list of pairs
    variables: List[VariableKV] = Field(default_factory=list)

AttributeValue = Union[
    MoneyValue,
    PercentageValue,
    NumberValue,
    BooleanValue,
    TextValue,
    DurationValue,
    DateValue,
    DateRangeValue,
    RateValue,
    FormulaValue,
]

class SourceRef(StrictBase):
    page: Optional[int] = None
    span: Optional[List[int]] = None  # [start_char, end_char]
    snippet: Optional[str] = None

class Term(StrictBase):
    key: str
    value: AttributeValue
    section: Optional[str] = None
    source: Optional[SourceRef] = None

# ---------- Fuel Bid aggregate ----------

class FuelBid(StrictBase):
    """Fuel bid information extracted from supplier proposals"""
    
    # Core vendor information
    vendor: Vendor = Field(..., description="Information about the supplier submitting this bid.")
    
    # Basic bid information
    title: Optional[str] = Field(None, description="Title or reference name of the bid proposal, if provided.")
    round: Optional[int] = Field(None, description="Bid round number if multiple rounds exist.")
    bid_submitted_at: Optional[date] = Field(None, description="Date when the bid was submitted.")
    
    # Vendor contact details (redundant with vendor but kept for compatibility)
    vendor_name: Optional[str] = Field(None, description="Vendor company name.")
    vendor_address: Optional[str] = Field(None, description="Vendor company address.")
    vendor_contact_name: Optional[str] = Field(None, description="Primary contact person name.")
    vendor_contact_email: Optional[str] = Field(None, description="Primary contact email.")
    vendor_contact_phone: Optional[str] = Field(None, description="Primary contact phone.")
    vendor_comments: Optional[str] = Field(None, description="Additional comments or notes from the supplier about their bid.")
    
    # Pricing structure
    price_type: Optional[str] = Field(None, description="Pricing method: 'fixed' for set prices, 'index_formula' for market-indexed pricing.")
    uom: Optional[str] = Field(None, description="Unit of measure: 'USG' for US gallons, 'L' for liters, 'm3' for cubic meters, 'MT' for metric tons.")
    currency: Optional[str] = Field(None, description="Currency code in ISO 4217 format (e.g., 'USD', 'EUR').")
    payment_terms: Optional[str] = Field(None, description="Payment terms as stated in the bid (e.g., 'Net 30 days', 'Due on delivery').")
    
    # Fixed pricing
    base_unit_price: Optional[Decimal] = Field(None, description="Base price per unit for fixed pricing, numeric value only without currency symbol.")
    
    # Index-linked pricing
    index_name: Optional[str] = Field(None, description="Name of the pricing index used (e.g., 'Platts Jet A-1 Med', 'Argus').")
    index_location: Optional[str] = Field(None, description="Geographic region or market location for the pricing index.")
    differential: Optional[Decimal] = Field(None, description="Plus or minus adjustment to the index price, numeric value only.")
    differential_unit: Optional[str] = Field(None, description="Unit for the differential amount (e.g., 'USD_per_USG', 'cents_per_gallon').")
    formula_notes: Optional[str] = Field(None, description="Additional notes explaining the pricing formula or calculation method.")
    
    # Fees & charges
    into_plane_fee: Optional[Decimal] = Field(None, description="Into-plane service fee per unit, numeric value only.")
    handling_fee: Optional[Decimal] = Field(None, description="Fuel handling fee per unit or per uplift, numeric value only.")
    other_fee: Optional[Decimal] = Field(None, description="Any other additional fees mentioned, numeric value only.")
    other_fee_description: Optional[str] = Field(None, description="Description of what the other fee covers.")
    
    # Inclusions & exclusions
    includes_taxes: Optional[bool] = Field(None, description="Whether the quoted price includes taxes.")
    includes_airport_fees: Optional[bool] = Field(None, description="Whether the quoted price includes airport fees.")
    
    # Calculated fields
    density_at_15c: Optional[Decimal] = Field(None, description="Fuel density at 15°C in kg/m³, if specified for mass-based pricing.")
    normalized_unit_price_usd_per_usg: Optional[Decimal] = Field(None, description="Computed normalized unit price in USD per US gallon.")
    
    # AI Processing
    ai_summary: Optional[str] = Field(
        None,
        description=(
            "Short human readable synopsis of the fuel bid intent and material points. "
            "Keep to 1-3 sentences. Focus on critical commercial and technical terms. "
            "Avoid speculation. Prefer facts supported by extracted terms."
        ),
    )
    
    # Flexible structured data
    terms: List[Term] = Field(
        default_factory=list, 
        description=(
            "Typed, structured facts extracted from the fuel bid. Each Term contains a stable key, "
            "a strongly typed value, and optional section and source reference for provenance. "
            "Use terms for anything that requires numeric operations, validation, or precise comparison."
        )
    )
    
    # Lightweight categorization
    tags: Optional[List[TagItem]] = Field(
        default=None,
        description=(
            "Lightweight key value labels for categorization and search. "
            "Not a substitute for terms. Keep keys consistent and values short."
        )
    )
    