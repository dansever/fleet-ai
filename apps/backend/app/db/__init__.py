# apps/backend/app/db/__init__.py
from app.db.repr_patch import attach_repr_and_to_dict
from .session import get_db, get_table, reflect_metadata
from .operations import *

# attach_repr_and_to_dict(Base)

__all__ = ["get_db", "get_table", "reflect_metadata", "operations"]