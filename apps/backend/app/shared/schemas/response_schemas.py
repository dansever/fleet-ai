from typing import Any, Generic, TypeVar
from pydantic import BaseModel
from app.shared.schemas.llm_schemas import Usage

T = TypeVar("T")

class ResponseEnvelope(BaseModel, Generic[T]):
    """Simple response wrapper with optional usage tracking"""
    data: T
    success: bool = True
    message: str | None = None