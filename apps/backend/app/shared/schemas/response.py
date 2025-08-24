# app/shared/schemas/response.py
from typing import Any, Generic, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")

class Pagination(BaseModel):
    total: int
    page: int
    page_size: int
    pages: int

class Meta(BaseModel):
    request_id: str | None = None
    usage: dict[str, Any] | None = None
    pagination: Pagination | None = None
    extra: dict[str, Any] | None = None

class ResponseEnvelope(BaseModel, Generic[T]):
    data: T
    meta: Meta | None = None

# RFC 7807 Problem Details
class ErrorItem(BaseModel):
    field: str | None = None
    message: str
    code: str | None = None

class Problem(BaseModel):
    type: str = Field(default="about:blank")
    title: str
    status: int
    detail: str | None = None
    instance: str | None = None
    errors: list[ErrorItem] | None = None  # field-level issues etc.

def ok(data: T, meta: Meta | None = None) -> ResponseEnvelope[T]:
    return ResponseEnvelope[T](data=data, meta=meta)

def problem(
    *,
    title: str,
    status: int,
    detail: str | None = None,
    errors: list[ErrorItem] | None = None,
    type_: str = "about:blank",
    instance: str | None = None,
) -> Problem:
    return Problem(type=type_, title=title, status=status, detail=detail, instance=instance, errors=errors)
