"""
User database operations
Handles all CRUD operations for users
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload

from ..models_auto import Users

"""
Methods:
- get_user_by_id
- update_user
"""


# get_user_by_id - Get a user by its ID
async def get_user_by_id(
    session: AsyncSession,
    user_id: str
) -> Optional[Users]:
    """Get user by ID"""
    result = await session.execute(
        select(Users).where(Users.id == user_id)
    )
    return result.scalar_one_or_none()


# update_user - Update a user's fields
async def update_user(
    session: AsyncSession,
    user_id: str,
    **kwargs
) -> Optional[Users]:
    """Update user fields"""
    update_data = {k: v for k, v in kwargs.items() if v is not None}
    
    if not update_data:
        return None
    
    await session.execute(
        update(Users)
        .where(Users.id == user_id)
        .values(**update_data)
    )
    await session.commit()
    
    return await get_user_by_id(session, user_id)