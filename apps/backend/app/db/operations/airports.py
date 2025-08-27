"""
Airport database operations
Handles all CRUD operations for airports
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload

from ..models_auto import Airports

"""
Methods:
- get_airport_by_id
- get_airports_by_org
- update_airport
"""


# get_airport_by_id - Get an airport by its ID
async def get_airport_by_id(
    session: AsyncSession,
    airport_id: str
) -> Optional[Airports]:
    """Get airport by ID"""
    result = await session.execute(
        select(Airports).where(Airports.id == airport_id)
    )
    return result.scalar_one_or_none()


# get_airports_by_org - Get all airports for an organization
async def get_airports_by_org(
    session: AsyncSession,
    org_id: str
) -> List[Airports]:
    """Get all airports for an organization"""
    result = await session.execute(
        select(Airports).where(Airports.org_id == org_id)
    )
    return result.scalars().all()


# update_airport - Update an airport's fields
async def update_airport(
    session: AsyncSession,
    airport_id: str,
    **kwargs
) -> Optional[Airports]:
    """Update airport fields"""
    update_data = {k: v for k, v in kwargs.items() if v is not None}
    
    if not update_data:
        return None
    
    await session.execute(
        update(Airports)
        .where(Airports.id == airport_id)
        .values(**update_data)
    )
    await session.commit()
    
    return await get_airport_by_id(session, airport_id)