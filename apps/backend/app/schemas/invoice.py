from pydantic import BaseModel
from app.schemas.vendor import Vendor
from pydantic import Field
from datetime import date

class Invoice(BaseModel):
  """Invoice information extracted from supplier proposals"""
  vendor: Vendor = Field(..., description="Information about the supplier submitting this invoice.")
  vendorComments: str | None = Field(None, description="Any free-text notes or comments provided by the vendor alongside the invoice.")

  # Identity
  invoiceNumber: str | None = Field(None,
  description="Unique invoice identifier. Prefer the official invoice number shown on the document header."
  )
  invoiceDate: date | None = Field(None,
  description="Exact date the invoice was issued. Look for headings like 'Invoice Date' or 'Issued On'."
  )
  status: str | None = Field(None,
  description="Current state of the invoice: e.g. 'received', 'approved', 'paid', or 'disputed'."
  )

  # LLM narratives
  summary: str | None = Field(None,
  description="Concise 3-6 sentence summary of the invoice: vendor, period covered, major charges, and total."
  )
  chargesNarrative: str | None = Field(None,
  description="Detailed explanation of how totals were computed. Mention quantities, unit rates, surcharges, credits, taxes, and any unusual adjustments."
  )
  disputesNotes: str | None = Field(None,
  description="Notes about discrepancies, exceptions, or potential disputes. Highlight mismatched amounts, missing evidence, or contract deviations."
  )
  tags: dict | None = Field(None,
  description="Key-value metadata extracted for filtering and search, e.g. {vatRate:'17%', costCenter:'Ops', paymentTerms:'30 days'}.",
  )

  # Coverage period
  periodStart: date | None = Field(None,
  description="Start date of the billing or service period that the invoice covers."
  )
  periodEnd: date | None = Field(None,
  description="End date of the billing or service period that the invoice covers."
  )

  
class InvoiceDocument(BaseModel):
  """Invoice document information extracted from supplier proposals"""
  title: str | None = Field(None, description="The title of the document.")
  version: int | None = Field(None, description="The version of the document.")
  sourceType: str | None = Field(None, description="The source type of the document.")
  storageUrl: str | None = Field(None, description="The storage URL of the document.")
  rawText: str | None = Field(None, description="The raw text of the document.")


class InvoiceChunk(BaseModel):
  """Invoice chunk information extracted from supplier proposals"""
  order: int | None = Field(None, description="The order of the chunk within the document.")
  label: str | None = Field(None, description="The label of the chunk.")
  content: str | None = Field(None, description="The content of the chunk.")
  embedding: list[float] | None = Field(None, description="The embedding of the chunk.")
  meta: dict | None = Field(None, description="Metadata about the chunk - page, span, tokens.")
  
  class Config:
    json_schema_extra = {
      "examples": [
        {
          "meta": {"page": 2, "span": [120, 420], "tokens": 480},
        }
      ]
    }