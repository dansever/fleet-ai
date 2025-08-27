# /backend/db/session.py

import os
import dotenv
import asyncpg
from typing import Optional
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.utils import get_logger

dotenv.load_dotenv()
logger = get_logger(__name__)

# SQLAlchemy setup
raw_url = os.getenv("DATABASE_URL")
if raw_url.startswith("postgres://"):
    raw_url = raw_url.replace("postgres://", "postgresql+asyncpg://", 1)

DATABASE_URL = raw_url

engine = create_async_engine(DATABASE_URL, echo=True)

AsyncSessionLocal = sessionmaker(
    bind=engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

# Dependency for route injection
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# AsyncPG connection pool management (for direct database operations)
_connection_pool: Optional[asyncpg.Pool] = None

async def get_db_connection() -> asyncpg.Pool:
    """Get database connection pool for direct database operations"""
    global _connection_pool
    
    if _connection_pool is None:
        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            raise ValueError("DATABASE_URL environment variable is required")
        
        try:
            _connection_pool = await asyncpg.create_pool(
                database_url,
                min_size=1,
                max_size=10,
                command_timeout=60
            )
            logger.info("✅ Database connection pool created successfully")
        except Exception as e:
            logger.error(f"❌ Failed to create database connection pool: {e}")
            raise
    
    return _connection_pool

async def close_db_connection():
    """Close database connection pool"""
    global _connection_pool
    if _connection_pool:
        await _connection_pool.close()
        _connection_pool = None
        logger.info("🔐 Database connection pool closed")
