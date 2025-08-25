from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import date
from app.schemas.vendor import Vendor

class FuelBid(BaseModel):
    """Fuel bid information extracted from supplier proposals"""
        
    # supplier
    vendor: Vendor = Field(...,description="Information about the supplier submitting this bid.")
    
    # descriptive
    title: str | None = Field(None, description="Title or reference name of the bid proposal, if provided.")
    supplier_comments: str | None = Field(None,description="Additional comments or notes from the supplier about their bid.")
    bid_submitted_at: str | None = Field(None,description="Date when the bid was submitted, in YYYY-MM-DD format.")
    ai_summary: str | None = Field(None,description=(
        "Summary of this fuel bid in 4 sentences or fewer."
        "Focus on the critical commercial and technical terms. Include all the details that are relevant to the bid - terms, pricing, units of measure, notes, etc."
        "Avoid verbose phrasing. Be concise and to the point."
        )
    )
    
    # Bid Details
    price_type: str | None = Field(None,description="Pricing method: 'fixed' for set prices, 'index_formula' for market-indexed pricing.")
    uom: str | None = Field(None,description="Unit of measure: 'USG' for US gallons, 'L' for liters, 'm3' for cubic meters, 'MT' for metric tons.")
    currency: str | None = Field(None,description="Currency code in ISO 4217 format (e.g., 'USD', 'EUR').")
    payment_terms: str | None = Field(None,description="Payment terms as stated in the bid (e.g., 'Net 30 days', 'Due on delivery').")
    
    # Fixed price path
    base_unit_price: float | None = Field(None,description="Base price per unit for fixed pricing, numeric value only without currency symbol.")
    
    # Index-linked path
    index_name: str | None = Field(None,description="Name of the pricing index used (e.g., 'Platts Jet A-1 Med', 'Argus').")
    index_location: str | None = Field(None,description="Geographic region or market location for the pricing index.")
    differential: Decimal | None = Field(None,description="Plus or minus adjustment to the index price, numeric value only.")
    differential_unit: str | None = Field(None,description="Unit for the differential amount (e.g., 'USD_per_USG', 'cents_per_gallon').")    
    formula_notes: str | None = Field(None,description="Additional notes explaining the pricing formula or calculation method.")

    # Fees and surcharges
    into_plane_fee: Decimal | None = Field(None,description="Into-plane service fee per unit, numeric value only.")
    handling_fee: Decimal | None = Field(None,description="Fuel handling fee per unit or per uplift, numeric value only.")
    other_fee: Decimal | None = Field(None,description="Any other additional fees mentioned, numeric value only.")
    other_fee_description: str | None = Field(None,description="Description of what the other fee covers.")
    
    # Inclusions
    includes_taxes: bool = Field(False,description="Whether the quoted price includes taxes (true/false).")
    includes_airport_fees: bool = Field(False,description="Whether the quoted price includes airport fees (true/false).")
    
    # Technical
    density_at_15c: Decimal | None = Field(None,description="Fuel density at 15°C in kg/m³, if specified for mass-based pricing.")
    fuel_type: str | None = Field(None,description="Type of aviation fuel being quoted (e.g., 'Jet A-1', 'Sustainable Aviation Fuel').")
    
    # Validity
    validity_start_date: date | None = Field(None,description="Start date when the bid pricing becomes effective, in YYYY-MM-DD format.")
    validity_end_date: date | None = Field(None,description="End date when the bid pricing expires, in YYYY-MM-DD format.")
    minimum_order_quantity: Decimal | None = Field(None,description="Minimum fuel quantity required for this pricing, numeric value only.")
    minimum_order_unit: str | None = Field(None,description="Unit of measure for minimum order quantity.")