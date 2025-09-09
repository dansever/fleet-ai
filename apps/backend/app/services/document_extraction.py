# app/services/document_extraction.py
from fastapi import UploadFile, HTTPException, File
from typing import Type
from app.utils import get_logger, save_temp_file, cleanup_temp_file, validate_file_type
from app.ai.extractors import get_llama_extractor_client
from app.config import ai_config
from pydantic import BaseModel

logger = get_logger(__name__)

async def extract_document(
    file: UploadFile,
    agent_name: str,
    system_prompt: str,
    schema_class: Type[BaseModel],
    log_label: str = "Document",
    allowed_extensions: tuple[str, ...] | None = None,
    allowed_mime_types: tuple[str, ...] | None = None
) -> dict:
    """
    Generic document extraction handler.
    Returns a dict with Python-native types (e.g., datetime.date for DATE fields).
    """
    temp_path = None

    try:
        # ============== Validate file type ==============
        exts = allowed_extensions or ai_config.allowed_extensions
        mimes = allowed_mime_types or ai_config.allowed_mime_types
        validate_file_type(file, exts, mimes)
        logger.info(f"📁 File type validated.")

        # ============== Save file to a temporary location ==============
        temp_path = save_temp_file(file)
        logger.info(f"📁 File saved to temp location.")

        # ============== Initialize extractor ==============
        client = get_llama_extractor_client(update_extractor_schema=True)
        agent = client.get_or_create_agent(
            agent_name=agent_name,
            system_prompt=system_prompt,
            data_schema=schema_class,
        )
        logger.info(f"🤖 Extraction agent initialized.")

        # ============== Run extraction ==============
        result = agent.extract(temp_path)
        logger.info(f"✅ Extraction completed.")

        # ============== Normalize with Pydantic (v2) ==============
        parsed = schema_class.model_validate(result.data)
        return parsed.model_dump(mode="python")
        

    # ============== Handle errors ==============
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"❌ Error in extraction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to extract {log_label} data from document")
    
    # ============== Cleanup temporary file if it exists ==============
    finally:
        if temp_path:
            cleanup_temp_file(temp_path)
            logger.info(f"🧹 Temporary file cleaned up.")