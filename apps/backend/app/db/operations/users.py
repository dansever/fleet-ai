from app.db.session import get_table, get_db
from sqlalchemy import update, select, insert, delete

__all__ = [
    "get_user",
    "get_user_by_clerk_id",
    "list_users",
    "create_user",
    "update_user",
    "delete_user",
]


"""
Get a user by ID from the database of the current organization.
- Returns: A single user or None if not found.
"""
async def get_user(user_id: str, organization_id: str):
    users = await get_table("users")
    async for session in get_db():
        query = select(users).where(
          users.c.id == user_id, 
          users.c.organization_id == organization_id) 
        res = await session.execute(query)
        return res.mappings().first()

"""
Get a user by Clerk user ID from the database.
- Returns: A single user or None if not found.
"""
async def get_user_by_clerk_id(clerk_user_id: str):
    users = await get_table("users")
    async for session in get_db():
        query = select(users).where(users.c.clerk_user_id == clerk_user_id)
        res = await session.execute(query)
        return res.mappings().first()

"""
List all users from the database of the current organization.
- Returns: A list of users.
"""
async def list_users(organization_id: str):
    users = await get_table("users")
    async for session in get_db():
        query = select(users).where(users.c.organization_id == organization_id)
        res = await session.execute(query)
        return res.mappings().all()

"""
Create a new user in the database of the current organization.
- Returns: The created user.
"""
async def create_user(organization_id: str, user: dict):
    users = await get_table("users")
    async for session in get_db():
        user['organization_id'] = organization_id
        stmt = insert(users).values(**user).returning(users)
        res = await session.execute(stmt)
        await session.commit()
        return res.mappings().first()

"""
Update a user in the database of the current organization.
- Returns: The updated user.
"""
async def update_user(user_id: str, organization_id: str, user: dict):
    users = await get_table("users")
    async for session in get_db():
          # build UPDATE statement with returning
          stmt = (
              update(users)
              .where(users.c.id == user_id, users.c.organization_id == organization_id)
              .values(**user)
              .returning(users)  # return the updated row
          )
          res = await session.execute(stmt)
          await session.commit()
          return res.mappings().first()

"""
Delete a user from the database of the current organization.
- Returns: The deleted user.
"""
async def delete_user(user_id: str, organization_id: str):
    users = await get_table("users")
    async for session in get_db():
        stmt = (
            delete(users)
            .where(users.c.id == user_id, users.c.organization_id == organization_id)
            .returning(users)
        )
        res = await session.execute(stmt)
        await session.commit()
        return res.mappings().first()
