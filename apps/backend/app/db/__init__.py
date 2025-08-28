# apps/backend/app/db/__init__.py
from app.db import models_auto  # ensures all models are imported and mapped
from app.db.models_auto import Base
from app.db.repr_patch import attach_repr_and_to_dict
from .session import get_db_connection, close_db_connection, get_db
from .operations import *

attach_repr_and_to_dict(Base)

__all__ = ["Base", "get_db", "get_db_connection", "close_db_connection", "operations"]