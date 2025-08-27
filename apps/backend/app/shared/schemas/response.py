from typing import Any, Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")

class Meta(BaseModel):
    """Metadata for API responses"""
    model: str | None = None
    usage: dict[str, Any] | None = None

class ResponseEnvelope(BaseModel, Generic[T]):
    """Simple response wrapper with optional usage tracking"""
    data: T
    success: bool = True
    message: str | None = None
    meta: Meta | None = None