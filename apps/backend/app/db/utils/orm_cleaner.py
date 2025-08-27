from typing import Any, Dict, List, Union
from sqlalchemy.inspection import inspect
from datetime import datetime, date, time
import uuid

def orm_to_dict(obj: Any) -> Dict[str, Any]:
    """
    Convert a SQLAlchemy ORM object into a dict of column values.
    Handles datetime, UUID, and lists.
    """
    mapper = inspect(obj.__class__)
    data = {}
    for column in mapper.columns:
        val = getattr(obj, column.key)
        if isinstance(val, (datetime, date, time)):
            val = val.isoformat()
        elif isinstance(val, uuid.UUID):
            val = str(val)
        elif isinstance(val, list):
            val = [str(x) for x in val]
        data[column.key] = val
    return data


def clean_records(
    records: Union[List[Any], Any],
    fields: List[str] | None = None
) -> List[Dict[str, Any]]:
    """
    Convert list of ORM objects (or dicts) into clean dicts.
    If fields is provided, keep only those keys, otherwise include all columns.
    """
    if not isinstance(records, list):
        records = [records]

    cleaned = []
    for rec in records:
        if hasattr(rec, "__table__"):   # SQLAlchemy ORM object
            row = orm_to_dict(rec)  # includes all columns
        elif isinstance(rec, dict):
            row = rec
        else:
            row = {"value": str(rec)}

        # filter if fields given
        if fields:
            row = {k: row.get(k) for k in fields}
        cleaned.append(row)

    return cleaned
