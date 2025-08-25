from fastapi import UploadFile, HTTPException
from typing import Type
from app.utils import get_logger, save_temp_file, cleanup_temp_file, validate_file_type
from app.core.agents.extractor import get_llama_extractor
from app.shared.schemas import ResponseEnvelope, Meta
from app.config import EXTRACTOR_ALLOWED_EXTENSIONS, EXTRACTOR_ALLOWED_MIME_TYPES

logger = get_logger(__name__)

def process_document_extraction(
    file: UploadFile,
    agent_name: str,
    system_prompt: str,
    schema_class: Type,
    log_label: str = "Document",
    allowed_extensions: tuple[str, ...] = EXTRACTOR_ALLOWED_EXTENSIONS,
    allowed_mime_types: tuple[str, ...] = EXTRACTOR_ALLOWED_MIME_TYPES
) -> ResponseEnvelope:
    """
    Generic document extraction handler.

    Args:
        file (UploadFile): The uploaded document.
        agent_name (str): The registered agent name to use.
        system_prompt (str): System prompt to initialize the extractor.
        schema_class (BaseModel): The pydantic schema to enforce on output.
        log_label (str): Optional label for logging context.
        allowed_extensions:
        allowed_mime_types: 

    Returns:
        dict: Structured extraction result.
    """
    temp_path = None

    try:
        validate_file_type(file, allowed_extensions, allowed_mime_types)
        temp_path = save_temp_file(file)
        agent = get_llama_extractor(
            agent_name=agent_name,
            system_prompt=system_prompt,
            data_schema=schema_class,
        )
        result = agent.extract(temp_path)
        return ResponseEnvelope(
            data=result.data,
            meta=Meta(
                usage=result.extraction_metadata.get("usage", {}) if result.extraction_metadata else None
            )
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"❌ Error in {log_label} extraction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to extract {log_label} data from document")
    finally:
        if temp_path:
            cleanup_temp_file(temp_path)