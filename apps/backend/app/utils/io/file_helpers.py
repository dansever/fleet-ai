import tempfile
import shutil
import os
from fastapi import HTTPException, UploadFile
from app.utils import get_logger

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

    if not (ext_valid and mime_valid):
        raise HTTPException(status_code=400, detail="Unsupported file type")
