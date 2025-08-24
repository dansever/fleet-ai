import os
from dotenv import load_dotenv

load_dotenv()

# Llama Document Extraction API Credentials
LLAMA_CLOUD_API_KEY = os.getenv("LLAMA_CLOUD_API_KEY")
LLAMA_EXTRACT_PROJECT_ID = os.getenv("LLAMA_EXTRACT_PROJECT_ID")
LLAMA_ORGANIZATION_ID = os.getenv("LLAMA_ORGANIZATION_ID")


# Constants
MIME_TYPE_PDF = "application/pdf"
MAX_ENTITIES_PER_BATCH = 20