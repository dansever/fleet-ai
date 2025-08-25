from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.part import Part

# One extracted RFQ
class RFQ(BaseModel):
    
    model_config = {
        "title": "RFQ Document",
        "json_schema_extra": {
            "description": "This is an RFQ (Request for Quote) document sent by a potential buyer. Extract relevant procurement request details.",
        }
    }

    """Request for Quote"""
    # Identifiers
    rfq_number: str | None = Field(    
        description="Unique identifier for the RFQ. This may appear in the document as 'RFQ ID', 'RFQ No.', or simply 'RFQ'. Extract the value exactly as shown, regardless of format.",
        example="RS225, AVA-123, M-1234, Jan25-AB3, etc.")
    
    # Requested part information
    part: Part = Field(description="The part information")
    
    priority: str | None = Field(
        description="Priority of the RFQ. May appear as 'Urgency', 'Priority', or similar.",
        example="routine, critical, AOG")

    # Request details
    quantity_requested: int | None = Field(
        description="The quantity of items requested by the buyer. It typically appears in a column labeled 'Qty' or 'Quantity' in tabular format. Always extract the numeric value from the Qty column only. Do not confuse this with unit of measure or other fields.",
        example="1, 2, 10",
        ge=1,
        default=1)
    
    unit_of_measure: str | None = Field(
        description="The unit of measure (UOM) used for the item, such as EA, KG, PIECE, etc. This appears under a label like 'U/M' or 'UOM'. Do not extract numeric values or use quantity values in this field. If no unit is specified in the document, leave this field blank or null.",
        example="EA, PCS, LBS, METER")

    price_type: str | None = Field(
        description="The type of price requested.",
        example="Outright, Exchange, Fixed, Unit, etc.")
    
    buyer_comments: str | None = Field(
        description="Any special instructions, notes, or additional comments from the buyer", 
        example="Please provide a quote (urgently) for the part 8061-536")
