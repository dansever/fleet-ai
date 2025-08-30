# app/services/document_extraction.py
from fastapi import UploadFile, HTTPException
from typing import Type
from app.utils import get_logger, save_temp_file, cleanup_temp_file, validate_file_type
from app.ai.extractors import get_llama_extractor_client
from app.shared.schemas import ResponseEnvelope
from app.config import ai_config

logger = get_logger(__name__)

def process_document_extraction(
    file: UploadFile,
    agent_name: str,
    system_prompt: str,
    schema_class: Type,
    log_label: str = "Document",
    allowed_extensions: tuple[str, ...] = ai_config.allowed_extensions,
    allowed_mime_types: tuple[str, ...] = ai_config.allowed_mime_types
) -> ResponseEnvelope:
    """
    Generic document extraction handler.

    Args:
        file (UploadFile): The uploaded document.
        agent_name (str): The registered agent name to use.
        system_prompt (str): System prompt to initialize the extractor.
        schema_class (BaseModel): The pydantic schema to enforce on output.
        log_label (str): Optional label for logging context.

    Returns:
        dict: Structured extraction result.
    """
    temp_path = None

    try:
        validate_file_type(file, allowed_extensions, allowed_mime_types)

        temp_path = save_temp_file(file)
        logger.info(f"🔍 {log_label} saved file to temporary location")
        logger.info(f"🔍 Starting {log_label} extraction...")

        client = get_llama_extractor_client()
        agent = client.get_or_create_agent(
            agent_name=agent_name,
            system_prompt=system_prompt,
            data_schema=schema_class,
        )

        logger.info(f"🤖 {log_label} agent initialized")

        result = agent.extract(temp_path)
        
        logger.info(f"📄 {log_label} extraction completed")

        return ResponseEnvelope(
            data=result.data,
            message=f"Extraction completed successfully for {log_label}",
            success=True
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