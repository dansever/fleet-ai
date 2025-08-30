# backend/app/schemas/contract.py
from pydantic import BaseModel, Field
from app.schemas.enums import CONTRACT_TYPES


class Contract(BaseModel):
    """Contract information extracted from procurement documents"""
    
    # Identifiers
    contract_number: str | None = Field(
        description="Contract number (Contract ID, Contract No., Contract). Extract exactly as shown.",
        example="123456, Contract-123, Contract-123456")
    
    contract_type: CONTRACT_TYPES | None = Field(
        description="Contract type (Service Contract, Fuel Contract, Ground Handling Contract). Extract exactly as shown.",
        example="Service Contract, Fuel Contract, Ground Handling Contract")
    pass