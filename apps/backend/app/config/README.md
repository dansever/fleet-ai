### The correct ways to access your AI configuration:

from app.config import ai_config

# Model IDs (these are @property methods)

ai_config.active_chat_model_id # Returns the active chat model ID
ai_config.active_embedding_model_id # Returns the active embedding model ID  
ai_config.active_extraction_model_id # Returns the active extraction model ID

# API Keys (these are @property methods)

ai_config.active_chat_api_key # Returns API key for chat platform
ai_config.active_embedding_api_key # Returns API key for embedding platform
ai_config.active_extraction_api_key # Returns API key for extraction platform

# Platform settings (direct attributes)

ai_config.active.chat_platform # AIPlatform.openai, .llama, or .tavily
ai_config.active.embedding_platform # AIPlatform.openai, .llama, or .tavily
ai_config.active.extraction_platform # AIPlatform.openai, .llama, or .tavily

# Override settings (direct attributes)

ai_config.active.chat_model_id_override # str | None
ai_config.active.embedding_model_id_override # str | None
ai_config.active.extraction_model_id_override # str | None

# Specific platform settings

ai_config.openai.chat_model.value # The OpenAI chat model enum value
ai_config.openai.embedding_model.value # The OpenAI embedding model enum value
