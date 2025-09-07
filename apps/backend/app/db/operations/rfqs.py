from app.db.session import get_table, get_db
from sqlalchemy import update, select, insert, delete

__all__ = [
    "get_rfq",
    "list_rfqs",
    "list_rfqs_by_status",
    "list_rfqs_by_vendor",
    "create_rfq",
    "update_rfq",
    "delete_rfq",
]

"""
Get an RFQ by ID from the database of the current organization.
- Returns: A single RFQ or None if not found.
"""
async def get_rfq(rfq_id: str, organization_id: str):
    rfqs = await get_table("rfqs")
    async for session in get_db():
        query = select(rfqs).where(
          rfqs.c.id == rfq_id, 
          rfqs.c.org_id == organization_id) 
        res = await session.execute(query)
        return res.mappings().first()

"""
List all RFQs from the database of the current organization.
- Returns: A list of RFQs.
"""
async def list_rfqs(organization_id: str):
    rfqs = await get_table("rfqs")
    async for session in get_db():
        query = select(rfqs).where(rfqs.c.org_id == organization_id)
        res = await session.execute(query)
        return res.mappings().all()

"""
List RFQs by status from the database of the current organization.
- Returns: A list of RFQs with the specified status.
"""
async def list_rfqs_by_status(organization_id: str, status: str):
    rfqs = await get_table("rfqs")
    async for session in get_db():
        query = select(rfqs).where(
            rfqs.c.org_id == organization_id,
            rfqs.c.status == status
        )
        res = await session.execute(query)
        return res.mappings().all()

"""
List RFQs by vendor from the database of the current organization.
- Returns: A list of RFQs for the specified vendor.
"""
async def list_rfqs_by_vendor(organization_id: str, vendor_id: str):
    rfqs = await get_table("rfqs")
    async for session in get_db():
        query = select(rfqs).where(
            rfqs.c.org_id == organization_id,
            rfqs.c.vendor_id == vendor_id
        )
        res = await session.execute(query)
        return res.mappings().all()

"""
Create a new RFQ in the database of the current organization.
- Returns: The created RFQ.
"""
async def create_rfq(organization_id: str, rfq: dict):
    rfqs = await get_table("rfqs")
    async for session in get_db():
        rfq['org_id'] = organization_id
        stmt = insert(rfqs).values(**rfq).returning(rfqs)
        res = await session.execute(stmt)
        await session.commit()
        return res.mappings().first()

"""
Update an RFQ in the database of the current organization.
- Returns: The updated RFQ.
"""
async def update_rfq(rfq_id: str, organization_id: str, rfq: dict):
    rfqs = await get_table("rfqs")
    async for session in get_db():
          # build UPDATE statement with returning
          stmt = (
              update(rfqs)
              .where(rfqs.c.id == rfq_id, rfqs.c.org_id == organization_id)
              .values(**rfq)
              .returning(rfqs)  # return the updated row
          )
          res = await session.execute(stmt)
          await session.commit()
          return res.mappings().first()

"""
Delete an RFQ from the database of the current organization.
- Returns: The deleted RFQ.
"""
async def delete_rfq(rfq_id: str, organization_id: str):
    rfqs = await get_table("rfqs")
    async for session in get_db():
        stmt = (
            delete(rfqs)
            .where(rfqs.c.id == rfq_id, rfqs.c.org_id == organization_id)
            .returning(rfqs)
        )
        res = await session.execute(stmt)
        await session.commit()
        return res.mappings().first()
