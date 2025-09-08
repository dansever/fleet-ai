from app.db.session import get_table, get_db
from sqlalchemy import update, select, insert, delete

__all__ = [
    "get_org",
    "get_org_by_clerk_org_id",
    "create_org",
    "update_org",
    "delete_org",
]


"""
Get an organization by ID from the database.
- Returns: A single organization or None if not found.
"""
async def get_org(org_id: str):
    organizations = await get_table("organizations")
    async for session in get_db():
        query = select(organizations).where(organizations.c.id == org_id)
        res = await session.execute(query)
        return res.mappings().first()


async def get_org_by_clerk_org_id(clerk_org_id: str):
    organizations = await get_table("organizations")
    async for session in get_db():
        query = select(organizations).where(organizations.c.clerk_org_id == clerk_org_id)
        res = await session.execute(query)
        return res.mappings().first()



"""
Create a new organization in the database.
- Returns: The created organization.
"""
async def create_org(org: dict):
    organizations = await get_table("organizations")
    async for session in get_db():
        stmt = insert(organizations).values(**org).returning(organizations)
        res = await session.execute(stmt)
        await session.commit()
        return res.mappings().first()

"""
Update an organization in the database.
- Returns: The updated organization.
"""
async def update_org(org_id: str, org: dict):
    organizations = await get_table("organizations")
    async for session in get_db():
          # build UPDATE statement with returning
          stmt = (
              update(organizations)
              .where(organizations.c.id == org_id)
              .values(**org)
              .returning(organizations)  # return the updated row
          )
          res = await session.execute(stmt)
          await session.commit()
          return res.mappings().first()

"""
Delete an organization from the database.
- Returns: The deleted organization.
"""
async def delete_org(org_id: str):
    organizations = await get_table("organizations")
    async for session in get_db():
        stmt = (
            delete(organizations)
            .where(organizations.c.id == org_id)
            .returning(organizations)
        )
        res = await session.execute(stmt)
        await session.commit()
        return res.mappings().first()
