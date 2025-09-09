# apps/backend/app/db/__init__.py
from .session import get_db, get_table, reflect_metadata
from . import operations as _operations
from .chromadb_client import get_chroma_client
from .operations import *

# attach_repr_and_to_dict(Base)

__all__ = [
    "get_db", 
    "get_table", 
    "reflect_metadata",
    "get_chroma_client",
    # All operation functions are imported via *
] + _operations.__all__