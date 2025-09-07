from app.db.session import get_table, get_db
from sqlalchemy import update, select, insert, delete

__all__ = [
    "get_vendor",
    "list_vendors",
    "list_vendors_by_type",
    "create_vendor",
    "update_vendor",
    "delete_vendor",
]

"""
Get a vendor by ID from the database of the current organization.
- Returns: A single vendor or None if not found.
"""
async def get_vendor(vendor_id: str, organization_id: str):
    vendors = await get_table("vendors")
    async for session in get_db():
        query = select(vendors).where(
          vendors.c.id == vendor_id, 
          vendors.c.org_id == organization_id) 
        res = await session.execute(query)
        return res.mappings().first()

"""
List all vendors from the database of the current organization.
- Returns: A list of vendors.
"""
async def list_vendors(organization_id: str):
    vendors = await get_table("vendors")
    async for session in get_db():
        query = select(vendors).where(vendors.c.org_id == organization_id)
        res = await session.execute(query)
        return res.mappings().all()

"""
List vendors by type from the database of the current organization.
- Returns: A list of vendors of the specified type.
"""
async def list_vendors_by_type(organization_id: str, vendor_type: str):
    vendors = await get_table("vendors")
    async for session in get_db():
        query = select(vendors).where(
            vendors.c.org_id == organization_id,
            vendors.c.vendor_type == vendor_type
        )
        res = await session.execute(query)
        return res.mappings().all()

"""
Create a new vendor in the database of the current organization.
- Returns: The created vendor.
"""
async def create_vendor(organization_id: str, vendor: dict):
    vendors = await get_table("vendors")
    async for session in get_db():
        vendor['org_id'] = organization_id
        stmt = insert(vendors).values(**vendor).returning(vendors)
        res = await session.execute(stmt)
        await session.commit()
        return res.mappings().first()

"""
Update a vendor in the database of the current organization.
- Returns: The updated vendor.
"""
async def update_vendor(vendor_id: str, organization_id: str, vendor: dict):
    vendors = await get_table("vendors")
    async for session in get_db():
          # build UPDATE statement with returning
          stmt = (
              update(vendors)
              .where(vendors.c.id == vendor_id, vendors.c.org_id == organization_id)
              .values(**vendor)
              .returning(vendors)  # return the updated row
          )
          res = await session.execute(stmt)
          await session.commit()
          return res.mappings().first()

"""
Delete a vendor from the database of the current organization.
- Returns: The deleted vendor.
"""
async def delete_vendor(vendor_id: str, organization_id: str):
    vendors = await get_table("vendors")
    async for session in get_db():
        stmt = (
            delete(vendors)
            .where(vendors.c.id == vendor_id, vendors.c.org_id == organization_id)
            .returning(vendors)
        )
        res = await session.execute(stmt)
        await session.commit()
        return res.mappings().first()
