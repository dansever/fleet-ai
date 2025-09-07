from app.db.session import get_table, get_db
from sqlalchemy import update, select, insert, delete

"""
Get an invoice by ID from the database of the current organization.
- Returns: A single invoice or None if not found.
"""
async def get_invoice(invoice_id: str, organization_id: str):
    invoices = await get_table("invoices")
    async for session in get_db():
        query = select(invoices).where(
          invoices.c.id == invoice_id, 
          invoices.c.org_id == organization_id) 
        res = await session.execute(query)
        return res.mappings().first()

"""
List all invoices from the database of the current organization.
- Returns: A list of invoices.
"""
async def list_invoices(organization_id: str):
    invoices = await get_table("invoices")
    async for session in get_db():
        query = select(invoices).where(invoices.c.org_id == organization_id)
        res = await session.execute(query)
        return res.mappings().all()

"""
List invoices by status from the database of the current organization.
- Returns: A list of invoices with the specified status.
"""
async def list_invoices_by_status(organization_id: str, status: str):
    invoices = await get_table("invoices")
    async for session in get_db():
        query = select(invoices).where(
            invoices.c.org_id == organization_id,
            invoices.c.status == status
        )
        res = await session.execute(query)
        return res.mappings().all()

"""
List invoices by contract from the database of the current organization.
- Returns: A list of invoices for the specified contract.
"""
async def list_invoices_by_contract(organization_id: str, contract_id: str):
    invoices = await get_table("invoices")
    async for session in get_db():
        query = select(invoices).where(
            invoices.c.org_id == organization_id,
            invoices.c.contract_id == contract_id
        )
        res = await session.execute(query)
        return res.mappings().all()

"""
List invoices by vendor from the database of the current organization.
- Returns: A list of invoices from the specified vendor.
"""
async def list_invoices_by_vendor(organization_id: str, vendor_id: str):
    invoices = await get_table("invoices")
    async for session in get_db():
        query = select(invoices).where(
            invoices.c.org_id == organization_id,
            invoices.c.vendor_id == vendor_id
        )
        res = await session.execute(query)
        return res.mappings().all()

"""
List overdue invoices from the database of the current organization.
- Returns: A list of overdue invoices.
"""
async def list_overdue_invoices(organization_id: str):
    invoices = await get_table("invoices")
    async for session in get_db():
        from datetime import datetime
        query = select(invoices).where(
            invoices.c.org_id == organization_id,
            invoices.c.due_date < datetime.now(),
            invoices.c.status != 'paid'
        )
        res = await session.execute(query)
        return res.mappings().all()

"""
Create a new invoice in the database of the current organization.
- Returns: The created invoice.
"""
async def create_invoice(organization_id: str, invoice: dict):
    invoices = await get_table("invoices")
    async for session in get_db():
        invoice['org_id'] = organization_id
        stmt = insert(invoices).values(**invoice).returning(invoices)
        res = await session.execute(stmt)
        await session.commit()
        return res.mappings().first()

"""
Update an invoice in the database of the current organization.
- Returns: The updated invoice.
"""
async def update_invoice(invoice_id: str, organization_id: str, invoice: dict):
    invoices = await get_table("invoices")
    async for session in get_db():
          # build UPDATE statement with returning
          stmt = (
              update(invoices)
              .where(invoices.c.id == invoice_id, invoices.c.org_id == organization_id)
              .values(**invoice)
              .returning(invoices)  # return the updated row
          )
          res = await session.execute(stmt)
          await session.commit()
          return res.mappings().first()

"""
Delete an invoice from the database of the current organization.
- Returns: The deleted invoice.
"""
async def delete_invoice(invoice_id: str, organization_id: str):
    invoices = await get_table("invoices")
    async for session in get_db():
        stmt = (
            delete(invoices)
            .where(invoices.c.id == invoice_id, invoices.c.org_id == organization_id)
            .returning(invoices)
        )
        res = await session.execute(stmt)
        await session.commit()
        return res.mappings().first()
