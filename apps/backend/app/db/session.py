# /backend/db/session.py
from __future__ import annotations

import os

import dotenv
import asyncpg
from typing import Optional
from sqlalchemy import MetaData
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.utils import get_logger

logger = get_logger(__name__)

# ---------------------------
# Env & URL normalization
# ---------------------------
dotenv.load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set in backend/.env")

# Normalize for SQLAlchemy async + asyncpg driver
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://") and "+asyncpg://" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)


# ---------------------------
# SQLAlchemy async engine & session
# ---------------------------

# Create SQLAlchemy engine
engine = create_async_engine(
    DATABASE_URL,
    echo=False,          # set True locally if you want SQL logs
    pool_pre_ping=True,  # ping every 30 min to keep conns alive
    pool_size=5,  # min number of connections to keep in pool
    max_overflow=10,  # max number of connections to keep in pool
    pool_recycle=1800,  # recycle every 30 min to avoid stale conns
)

# Create SQLAlchemy AsyncSessionLocal
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autoflush=False,
    expire_on_commit=False,
)

# Create get_db function
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session

# Metadata reflection (since Drizzle manages schema)
metadata = MetaData()

async def reflect_metadata() -> MetaData:
    async with engine.begin() as conn:
        await conn.run_sync(metadata.reflect)
    return metadata

async def get_table(name: str):
    if not metadata.tables:
        await reflect_metadata()
    table = metadata.tables.get(name)
    if table is None:
        raise KeyError(f"Table '{name}' not found in DB")
    return table