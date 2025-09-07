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
