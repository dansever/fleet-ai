# backend/app/schemas/contract.py
from __future__ import annotations
from typing import List, Literal, Optional, Union
from pydantic import BaseModel, Field, ConfigDict
from datetime import date

from app.schemas.enums import ContractTypes
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

# ---------- Contract aggregate ----------

class Contract(StrictBase):
    vendor: Vendor
    buyer_name: Optional[str] = None
    title: Optional[str] = None

    contract_type: Optional[ContractTypes] = Field(
        default=None,
        description="Normalized agreement class used for downstream routing and analytics."
    )

    effective_from: Optional[date] = Field(
        default=None,
        description="Date the agreement becomes effective. If unknown, leave null."
    )
    effective_to: Optional[date] = Field(
        default=None,
        description="Date the agreement ends. Omit if open-ended or auto-renewed without fixed end."
    )

    summary: Optional[str] = Field(
        default=None,
        description=(
            "Short human readable synopsis of the agreement intent and material points. "
            "Keep to 1-3 sentences. Avoid speculation. Prefer facts supported by extracted terms "
            "and, where feasible, align with source references."
        )
    )

    # flexible facts
    terms: List[Term] = Field(
        default_factory=list, 
        description=(
            "Typed, structured facts extracted from the contract. Each Term contains a stable key, "
            "a strongly typed value, and optional section and source reference for provenance. "
            "Use terms for anything that requires numeric operations, validation, or precise comparison."
        )
    )

    # was Dict[str, str] -> now explicit list
    tags: Optional[List[TagItem]] = Field(
        default=None,
        description=(
            "Lightweight key value labels for categorization and search. "
            "Not a substitute for terms. Keep keys consistent and values short."
        )
    )
