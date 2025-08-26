from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.utils import get_logger
from app.database import get_db_connection
from app.database.connection import close_db_connection

logger = get_logger(__name__)

def create_app() -> FastAPI:
    """Create and configure the FastAPI application"""
    
    app = FastAPI(
        title="Fleet AI Backend API",
        description="Backend API for Fleet AI document extraction and procurement management",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Configure this properly for production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include API routes
    app.include_router(api_router, prefix="/api/v1")
    
    @app.get("/health")
    async def health_check():
        """Health check endpoint"""
        return {"status": "healthy", "service": "fleet-ai-backend"}
    
    @app.on_event("startup")
    async def startup_event():
        """Initialize database connection on startup"""
        try:
            await get_db_connection()
            logger.info("🚀 Application startup completed")
        except Exception as e:
            logger.error(f"❌ Failed to initialize database connection: {e}")
            raise
    
    @app.on_event("shutdown")
    async def shutdown_event():
        """Clean up database connections on shutdown"""
        await close_db_connection()
        logger.info("🛑 Application shutdown completed")
    
    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Starting Fleet AI Backend Server...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
