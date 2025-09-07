from app.db.session import get_table, get_db
from sqlalchemy import update, select, insert, delete

__all__ = [
    "get_organization",
    "create_organization",
    "update_organization",
    "delete_organization",
]


"""
Get an organization by ID from the database.
- Returns: A single organization or None if not found.
"""
async def get_organization(organization_id: str):
    organizations = await get_table("organizations")
    async for session in get_db():
        query = select(organizations).where(organizations.c.id == organization_id)
        res = await session.execute(query)
        return res.mappings().first()


"""
Create a new organization in the database.
- Returns: The created organization.
"""
async def create_organization(organization: dict):
    organizations = await get_table("organizations")
    async for session in get_db():
        stmt = insert(organizations).values(**organization).returning(organizations)
        res = await session.execute(stmt)
        await session.commit()
        return res.mappings().first()

"""
Update an organization in the database.
- Returns: The updated organization.
"""
async def update_organization(organization_id: str, organization: dict):
    organizations = await get_table("organizations")
    async for session in get_db():
          # build UPDATE statement with returning
          stmt = (
              update(organizations)
              .where(organizations.c.id == organization_id)
              .values(**organization)
              .returning(organizations)  # return the updated row
          )
          res = await session.execute(stmt)
          await session.commit()
          return res.mappings().first()

"""
Delete an organization from the database.
- Returns: The deleted organization.
"""
async def delete_organization(organization_id: str):
    organizations = await get_table("organizations")
    async for session in get_db():
        stmt = (
            delete(organizations)
            .where(organizations.c.id == organization_id)
            .returning(organizations)
        )
        res = await session.execute(stmt)
        await session.commit()
        return res.mappings().first()
