"""
Quote database operations
Handles all CRUD operations for quotes
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload

from ..models_auto import Quotes

"""
Methods:
- get_quote_by_id
- get_quotes_by_rfq_id
- update_quote
"""


# get_quote_by_id - Get a quote by its ID
async def get_quote_by_id(
    session: AsyncSession,
    quote_id: str
) -> Optional[Quotes]:
    """Get quote by ID"""
    result = await session.execute(
        select(Quotes).where(Quotes.id == quote_id)
    )
    return result.scalar_one_or_none()


# get_quotes_by_rfq_id - Get all quotes for an RFQ
async def get_quotes_by_rfq_id(
    session: AsyncSession,
    rfq_id: str
) -> List[Quotes]:
    """Get all quotes for an RFQ"""
    result = await session.execute(
        select(Quotes).where(Quotes.rfq_id == rfq_id)
    )
    return result.scalars().all()


# update_quote - Update a quote's fields
async def update_quote(
    session: AsyncSession,
    quote_id: str,
    **kwargs
) -> Optional[Quotes]:
    """Update quote fields"""
    update_data = {k: v for k, v in kwargs.items() if v is not None}
    
    if not update_data:
        return None
    
    await session.execute(
        update(Quotes)
        .where(Quotes.id == quote_id)
        .values(**update_data)
    )
    await session.commit()

    return await get_quote_by_id(session, quote_id)