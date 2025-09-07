from app.db.session import get_table, get_db
from sqlalchemy import update, select, insert, delete

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
Get an organization by Clerk organization ID from the database.
- Returns: A single organization or None if not found.
"""
async def get_organization_by_clerk_id(clerk_org_id: str):
    organizations = await get_table("organizations")
    async for session in get_db():
        query = select(organizations).where(organizations.c.clerk_org_id == clerk_org_id)
        res = await session.execute(query)
        return res.mappings().first()

"""
List all organizations from the database.
- Returns: A list of organizations.
"""
async def list_organizations():
    organizations = await get_table("organizations")
    async for session in get_db():
        query = select(organizations)
        res = await session.execute(query)
        return res.mappings().all()

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
