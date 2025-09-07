# backend/app/features/contract/contract_config.py

from app.schemas.contract import Contract
from app.config import ai_config

# ============================== CONTRACT Extractor ==============================
CONTRACT_EXTRACTOR_SYSTEM_PROMPT = """
    You are an AI agent specialized in parsing and interpreting aviation contract documents.
    These documents are contracts submitted for fuel agreements and various ground handling services at airports.
    Your task is to extract structured information from contract documents and identify individual contracts, even when multiple contracts are present in a single document.
    """

LLAMA_CONTRACT_EXTRACTOR_AGENT_NAME = "fleet-ai-contract-extractor"