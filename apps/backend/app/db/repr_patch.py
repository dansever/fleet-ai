# app/db/repr_patch.py
import uuid
from decimal import Decimal
from datetime import datetime, date, timezone
from sqlalchemy.inspection import inspect

def _fmt_value(v, max_len=None):
    """
    Format a value for readable output in __repr__.

    - UUIDs -> hex string (full, no braces).
    - datetimes -> UTC ISO format (no microseconds).
    - dates -> ISO format.
    - Decimals -> string.
    - Other types -> repr() string, optionally truncated with max_len.
    """
    if isinstance(v, uuid.UUID):
        return v.hex  # full UUID
    if isinstance(v, datetime):
        v = v.astimezone(timezone.utc).replace(microsecond=0)
        return v.isoformat().replace("+00:00", "Z")
    if isinstance(v, date):
        return v.isoformat()
    if isinstance(v, Decimal):
        return str(v)
    s = repr(v)
    if max_len is None:
        return s
    return s if len(s) <= max_len else s[: max_len - 1] + "…"


def _build_field_list(cls, mapper, class_fields=None):
    """
    Build an ordered list of fields to include in __repr__.

    - If `class_fields` defines an explicit field order for this class, use that.
    - Otherwise: primary keys first, then all other columns in declared order.
    """
    if class_fields and cls.__name__ in class_fields:
        return [k for k in class_fields[cls.__name__] if k in mapper.columns]
    pk = [c.key for c in mapper.primary_key]
    others = [c.key for c in mapper.columns if c.key not in pk]
    return pk + others  # keep all, no de-emphasis


def _generic_repr_factory(class_fields=None, max_fields=None, max_len=None):
    """
    Create a __repr__ generator function for SQLAlchemy models.

    - class_fields: dict of {ClassName: [fields]} to control field order/selection.
    - max_fields: limit how many fields to show (None = all).
    - max_len: truncate long values to this length.
    """
    def _generic_repr(self):
        mapper = inspect(self.__class__)
        keys = _build_field_list(self.__class__, mapper, class_fields)

        parts = []
        shown = 0
        limit = len(keys) if max_fields is None else max_fields

        for k in keys:
            if shown >= limit:
                break
            try:
                v = getattr(self, k, None)
            except Exception:
                v = "<unreadable>"
            if v is None:
                continue
            parts.append(f"{k}={_fmt_value(v, max_len)}")
            shown += 1

        # Add "..." only if truncated
        truncated = (max_fields is not None and shown < len(keys))
        suffix = ", ..." if truncated else ""
        return f"<{self.__class__.__name__} " + ", ".join(parts) + f"{suffix}>"

    return _generic_repr


def _to_dict(self, max_len=None):
    """
    Convert a SQLAlchemy model instance into a plain dict with JSON-friendly values.
    - UUID -> hex string
    - datetime/date -> ISO string
    - Decimal -> string
    - Other values -> repr() string (optionally truncated)
    """
    mapper = inspect(self.__class__)
    return {c.key: _fmt_value(getattr(self, c.key), max_len=max_len) for c in mapper.columns}


def attach_repr_and_to_dict(Base, class_fields=None, max_fields=None, max_len=None):
    """
    Patch all SQLAlchemy models registered under a Base with:

    - __repr__: human-readable repr for debugging/logging.
    - to_dict: convert instance to dict for API/frontend use.

    Args:
        Base: the declarative Base class with registered models.
        class_fields: optional dict of {ClassName: [fields]} for repr ordering.
        max_fields: optional max number of fields to show in repr.
        max_len: optional max string length for repr values.
    """
    generic_repr = _generic_repr_factory(class_fields, max_fields, max_len)
    for m in Base.registry.mappers:
        cls = m.class_
        if "__repr__" not in cls.__dict__:
            cls.__repr__ = generic_repr
        if "to_dict" not in cls.__dict__:
            cls.to_dict = _to_dict
