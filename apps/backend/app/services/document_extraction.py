# app/services/document_extraction.py
from fastapi import UploadFile, HTTPException
from typing import Type
from app.utils import get_logger, save_temp_file, cleanup_temp_file, validate_file_type
from app.ai.extractors import get_llama_extractor_client
from app.config import ai_config
from app.shared.schemas import ResponseEnvelope
from pydantic import BaseModel

logger = get_logger(__name__)

def process_document_extraction(
    file: UploadFile,
    agent_name: str,
    system_prompt: str,
    schema_class: Type[BaseModel],
    log_label: str = "Document",
    allowed_extensions: tuple[str, ...] | None = None,
    allowed_mime_types: tuple[str, ...] | None = None
) -> ResponseEnvelope:
    """
    Generic document extraction handler.
    """
    temp_path = None

    try:
        exts = allowed_extensions or ai_config.allowed_extensions
        mimes = allowed_mime_types or ai_config.allowed_mime_types
        validate_file_type(file, exts, mimes)

        temp_path = save_temp_file(file)
        logger.info(f"🔍 {log_label} file saved to temp location.")

        client = get_llama_extractor_client()
        agent = client.get_or_create_agent(
            agent_name=agent_name,
            system_prompt=system_prompt,
            data_schema=schema_class,
        )

        logger.info(f"🤖 {log_label} agent initialized. Starting extraction...")
        result = agent.extract(temp_path)
        logger.info(f"📄 {log_label} extraction completed.")

        return ResponseEnvelope(
            data=result.data, 
            success=True, 
            message=f"Extraction completed successfully for {log_label}"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"❌ Error in {log_label} extraction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to extract {log_label} data from document")
    finally:
        if temp_path:
            cleanup_temp_file(temp_path)
            logger.info(f"🧹 Temporary file cleaned up")