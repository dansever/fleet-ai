from datetime import datetime
from uuid import UUID

def format_dict(d: dict) -> str:
    """
    Convert a dict into a clean string representation:
    - Keys without quotes
    - Strings wrapped in single quotes
    - Empty strings shown as ''
    - Datetimes truncated to seconds
    - UUIDs as strings
    """
    lines = []
    for k, v in d.items():
        if isinstance(v, datetime):
            v = v.strftime("%Y-%m-%d %H:%M:%S%z")  # no microseconds
        elif isinstance(v, UUID):
            v = str(v)

        if v == "":
            v = "''"
        elif isinstance(v, str):
            v = f"'{v}'"

        lines.append(f"{k}: {v}")

    return "{\n " + ",\n ".join(lines) + "\n}"


def flatten_dict(d: dict) -> dict:
    """
    Flatten a dictionary by one level.
    If a value is another dict, merge its keys into the top level.
    Later keys override earlier ones if there's a conflict.
    Example:
        {
            "title": "Contract Title",
            "vendor": {
                "vendor_name": "John Doe",
                "vendor_address": "123 Main St, Anytown, USA"
            }
        }
        -> {
            "title": "Contract Title",
            "vendor_name": "John Doe",
            "vendor_address": "123 Main St, Anytown, USA"
        }
    """
    flat = {}
    for key, value in d.items():
        if isinstance(value, dict):
            flat.update(value)  # merge subkeys
        else:
            flat[key] = value
    return flat
