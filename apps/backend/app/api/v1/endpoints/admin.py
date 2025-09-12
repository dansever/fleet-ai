# backend/app/api/v1/endpoints/admin.py

from fastapi import APIRouter
from app.shared.schemas import ResponseEnvelope
from app.utils import get_logger
from app.llama_extractor import update_extractor_agents

logger = get_logger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])

# POST /api/v1/admin/update_extractors/ - Update extractor agents
@router.post("/update_extractors", response_model=ResponseEnvelope)
def update_extractors_endpoint(
) -> ResponseEnvelope:
    """
    Update the extractor agents with the latest schema and system prompt
    """
    updated_agents = update_extractor_agents()
    return ResponseEnvelope(
        data={f"updated {len(updated_agents)} extractor agents"},
        success=True,
        message="Extractor agents updated successfully"
    )