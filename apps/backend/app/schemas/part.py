from pydantic import BaseModel, Field
from typing import List

class Part(BaseModel):
    """Aircraft part information extracted from procurement documents"""
    
    # --------- Part Identity ---------
    part_number: str | None = Field(
        description="Primary manufacturer part number (Part No., PN, P/N). If multiple separated by slash, extract first part only.",
        example="8061-536-001"
    )

    alt_part_number: str | None = Field(
        description="Alternate part number if listed (Alt Part No., APN). If slash separated, extract second part only.",
        example="8061-536-001"
    )

    serial_number: str | None = Field(
        description="Part serial number (Serial No, SN, Serial)",
        example="BA6X-3AA23"
    )
    description: str | None = Field(
        description="Technical description near part number. Include concise terms like 'LAP ASSY' or 'CONTROL UNIT'. Extract exactly as shown.",
    example="Engine Control Unit"
    )
    
    # --------- Condition Information ---------
    condition_code: str | None = Field(
        description="Part condition (Cond, Condition). Common: FN (Factory New), NE (New), NS (New Surplus), OH (Overhauled), SV (Serviceable), RP (Repaired), AR (As Removed), BER (Beyond Economical Repair), US (Used), MOD (Modified). Extract exact value.",
        example="SV"
)
    certifications: List[str] = Field(
    description="Certifications explicitly listed for quoted part. Ignore disclaimers/general notes. Exclude standard release forms unless tied to specific part.",        
        example=["FAA 8130-3", "EASA Form 1", "DGCA Release"]
    )

    # --------- Tagging Information ---------
    tag_type: str | None = Field(
        description="Certification document type on physical part label (may be abbreviated)",
        example="8130-3"
    )
    tagged_by: str | None = Field(
        description="Company/vendor who applied the tag. Extract tagging entity name only.",
        example="Lufthansa Technik"
    )
    tagged_date: str | None = Field(
        description="Date tag was applied. Extract date value only.",
        example="2025-01-04"
    )
    trace_to: str | None = Field(
        description="Traceability reference (airline, fleet, removal source)",
        example="Delta Airlines"
    )
