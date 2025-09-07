from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.utils import get_logger
import os

# Initialize logger
logger = get_logger(__name__)

def create_app() -> FastAPI:
    """Create and configure the FastAPI application"""
    
    # Get configuration from environment variables
    app_title = os.getenv("APP_TITLE", "Fleet AI Backend API")
    app_description = os.getenv("APP_DESCRIPTION", "Backend API for Fleet AI document extraction and procurement management")
    app_version = os.getenv("APP_VERSION", "1.0.0")
    
    # CORS configuration
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    
    app = FastAPI(
        title=app_title,
        description=app_description,
        version=app_version,
        docs_url="/docs",
        redoc_url="/redoc"
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
        allow_headers=["*"],
    )
    
    # Include API routes
    app.include_router(api_router, prefix="/api/v1")
    
    @app.get("/health")
    async def health_check():
        """Health check endpoint"""
        return {
            "status": "healthy", 
            "service": "fleet-ai-backend",
            "version": app_version
        }
    
    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    
    # Get server configuration from environment variables
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("RELOAD", "true").lower() == "true"
    log_level = os.getenv("LOG_LEVEL", "info")
    
    logger.info(f"🚀 Starting Fleet AI Backend Server on {host}:{port}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level=log_level
    )
