import os
import asyncpg
from typing import Optional
from app.utils import get_logger

logger = get_logger(__name__)

_connection_pool: Optional[asyncpg.Pool] = None

async def get_db_connection() -> asyncpg.Pool:
    """Get database connection pool"""
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
