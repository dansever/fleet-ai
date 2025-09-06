# backend/app/schemas/contract.py
from pydantic import BaseModel, Field
from app.schemas.enums import CONTRACT_TYPES
from app.schemas.vendor import Vendor
from datetime import date

class Contract(BaseModel):
    """Contract information extracted from procurement documents"""
    vendor: Vendor = Field(..., description="Information about the supplier submitting this contract.")
    vendorComments: str | None = Field(None, description="Any free-text notes or comments provided by the vendor alongside the contract.")
    title: str | None = Field(None, description="The title of the contract.")
    contractType: CONTRACT_TYPES | None = Field(None, description="The type of contract.")
    effectiveFrom: date | None = Field(None, description="The effective from date of the contract.")
    effectiveTo: date | None = Field(None, description="The effective to date of the contract.")
    summary: str | None = Field(None, description="The summary of the contract.")
    commercialTerms: str | None = Field(None, description="The commercial terms of the contract.")
    slas: str | None = Field(None, description="The SLAs of the contract.")
    edgeCases: str | None = Field(None, description="The edge cases of the contract.")
    riskLiability: str | None = Field(None, description="The risk liability of the contract.")
    terminationLaw: str | None = Field(None, description="The termination law of the contract.")
    operationalBaselines: str | None = Field(None, description="The operational baselines of the contract.")
    tags: dict | None = Field(None, description="Tags for the contract - {key: value}.")

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