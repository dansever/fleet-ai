from pydantic import BaseModel, Field
from app.schemas.part import Part
from typing import Any, Dict, List, Optional
from app.schemas.vendor import Vendor

# One extracted quote
class Quote(BaseModel):

    model_config = {
        "title": "Quote Document",
        "json_schema_extra": {
            "description": "This is a quote document sent by a vendor to a potential buyer. Extract relevant quote details.",
        }
    }

    # Identifiers
    quote_number: Optional[str] = Field(
        description="Quote number (Quote ID, Quote No., Quote). Extract exactly as shown.",
        example="123456, Quote-123, Quote-123456")
    
    rfq_number: Optional[str] = Field(
        description="RFQ reference number (RFQ ID, RFQ, Quote Ref, Reference Number, Your Ref). Do not confuse with Quote ID.",
        example="RS225, AVA-123, M-1234, Jan25-AB3")
    
    # Part information
    part: Part = Field(description="The physical part being offered")
    
    minimum_order_quantity: Optional[int] = Field(
        description="Minimum order quantity (numeric value only)", 
        example="1, 2, 5", 
        ge=1, 
        default=1)
    
    quantity: Optional[int] = Field(
        description="Quantity (Qty: 1, Quantity: 2, QTY 5 EA). Extract numeric value only.", 
        example="1, 2, 5", 
        ge=1,
        default=1)

    unit_of_measure: Optional[str] = Field(
        description="Units (EA, Each, Set, Pair, Unit, Box). Extract as written.", 
        example="EA, KG, PIECE", 
        default="EA")
    
    # Payment terms
    unit_price: Optional[float] = Field(
        description="Quoted price (Total Price, Price, Unit Price, Amount, Price per Unit)",
        ge=0)
    
    additional_charges: Optional[float] = Field(
        description="Additional charges", 
        ge=0,
        default=0)
    
    total_price: Optional[float] = Field(
        description="Total price", 
        ge=0,
        default=0)
    
    currency: Optional[str] = Field(
        description="Currency (USD, Dollars, GBP, EUR, $, £, €)", 
        example="USD, EUR, $, ₪, £")
    
    price_type: Optional[str] = Field(
        description="Price type (outright, exchange, flat exchange, loan, Exchange only, Loan basis, Flat-Ex). Extract full phrase.", 
        example="outright, exchange, fixed, flat exchange, loan", 
        default="outright")
    
    core_charge: Optional[float] = Field(
        description="Core charge if exchange core not returned (Core Charge, Core Value, Non-Return Fee). Numeric value only.", 
        ge=0, 
        default=0)
    
    cost_method: Optional[str] = Field(
        description="Pricing method (Cost Method, Pricing Basis, Quote Type). Common: Flat Rate, Cost + OHC, T&M, Time and Materials, Fixed Exchange. Extract full phrase.",
        example="Flat Rate, Cost + OHC, T&M, Time and Materials, Fixed Exchange",
        default=None)
    
    core_due: Optional[str] = Field(
        description="Date core must be returned", 
        example="2025-08-14",
        default=None)
    
    payment_terms: Optional[str] = Field(
        description="Payment terms. Extract full phrase as written.",
        example="In advance, Upon delivery, 30 days, 60 days")

    # Delivery and Warranty
    delivery_terms: Optional[str] = Field(
        description="Delivery terms (EXW, FOB, DDP, DAP, FCA, CPT, CIF, Delivered Duty Paid, Delivery: FCA VNO). Include location/airport codes if present.",
        example="EXW, FOB, DDP, DAP, FCA, CPT, CIF, Delivered Duty Paid")
    
    lead_time: Optional[str] = Field(
        description="Lead time (Stock, In Stock, Available, Ready, Immediate, Backorder, Lead time required, Out of stock, 2 days, 72 hours, 1 week). Extract exactly as found.",
        example="Stock, In Stock, Available, Ready, Immediate, Backorder, 2 days, 72 hours, 1 week")
    
    warranty: Optional[str] = Field(
        description="Warranty terms. Extract full phrase as written.",
        example="1 year, 2 years")
    
    # Supplier Comments
    supplier_comments: Optional[str] = Field(
        description="Supplier comments exactly as written. Include non-numeric price notes like 'Make Offer', 'TBD' if in price field.",
        example="We are a leading supplier of aircraft parts. We have a wide range of parts in stock.",
        default=None)
    
    quote_expiration_date: Optional[str] = Field(
        description="Quote expiration date. Extract full phrase as written.",
        example="2025-08-14")
    
# Full document extract: multiple quotes + vendor info
class QuoteSchema(BaseModel):
        quotes: List[Quote] = Field(..., json_schema_extra={"description": "Document from vendor responding to RFQ. May contain multiple quotes for same RFQ/part with different prices/terms. Detect quote boundaries and group separately. Ignore buyer RFQ sections - only extract vendor responses."})
        vendor: Vendor = Field(..., json_schema_extra={"description": "Overall vendor information for entire document if consistent across all quotes."})
