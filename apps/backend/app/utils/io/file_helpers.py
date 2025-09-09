import tempfile
import shutil
import os
from fastapi import HTTPException, UploadFile
from app.utils import get_logger
import json
from pathlib import Path

logger = get_logger(__name__)

def save_temp_file(file: UploadFile) -> str:
    """Save uploaded file to a temp path and return the path."""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as tmp:
            shutil.copyfileobj(file.file, tmp)
            logger.info(f"📁 Saved temp file")
            return tmp.name
    except Exception as e:
        logger.error(f"❌ Failed to save temp file: {str(e)}")
        raise

def cleanup_temp_file(path: str) -> None:
    """Safely delete a temp file if it exists."""
    try:
        if os.path.exists(path):
            os.remove(path)
            logger.info(f"🧹 Cleaned up temp file")
        else:
            logger.warning(f"⚠️ Temp file not found for cleanup: {path}")
    except Exception as e:
        logger.error(f"❌ Failed to cleanup temp file {path}: {str(e)}") 


def validate_file_type(file: UploadFile, allowed_extensions: tuple[str, ...], allowed_mime_types: tuple[str, ...]):
    ext_valid = file.filename.lower().endswith(allowed_extensions)
    mime_valid = file.content_type in allowed_mime_types
    
    if not (ext_valid and mime_valid):  # Requires BOTH to be valid
        raise HTTPException(status_code=400, detail="Unsupported file type")


def load_latest_extraction_result(cache_dir: str = "mock_data/contract_cache"):
    """Load the most recent JSON file from the contract_cache folder."""
    cache_path = Path(cache_dir)
    if not cache_path.exists() or not cache_path.is_dir():
        raise FileNotFoundError(f"Cache directory not found: {cache_dir}")

    files = list(cache_path.glob("*.json"))
    if not files:
        raise FileNotFoundError(f"No JSON files found in {cache_dir}")

    latest_file = max(files, key=os.path.getmtime)

    with open(latest_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    return data
