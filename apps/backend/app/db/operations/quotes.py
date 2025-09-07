from app.db.session import get_table, get_db
from sqlalchemy import update, select, insert, delete

__all__ = [
    "get_quote",
    "list_quotes",
    "list_quotes_by_status",
    "list_quotes_by_rfq",
    "list_quotes_by_vendor",
    "create_quote",
    "update_quote",
    "delete_quote",
]


"""
Get a quote by ID from the database of the current organization.
- Returns: A single quote or None if not found.
"""
async def get_quote(quote_id: str, organization_id: str):
    quotes = await get_table("quotes")
    async for session in get_db():
        query = select(quotes).where(
          quotes.c.id == quote_id, 
          quotes.c.org_id == organization_id) 
        res = await session.execute(query)
        return res.mappings().first()

"""
List all quotes from the database of the current organization.
- Returns: A list of quotes.
"""
async def list_quotes(organization_id: str):
    quotes = await get_table("quotes")
    async for session in get_db():
        query = select(quotes).where(quotes.c.org_id == organization_id)
        res = await session.execute(query)
        return res.mappings().all()

"""
List quotes by status from the database of the current organization.
- Returns: A list of quotes with the specified status.
"""
async def list_quotes_by_status(organization_id: str, status: str):
    quotes = await get_table("quotes")
    async for session in get_db():
        query = select(quotes).where(
            quotes.c.org_id == organization_id,
            quotes.c.status == status
        )
        res = await session.execute(query)
        return res.mappings().all()

"""
List quotes by RFQ from the database of the current organization.
- Returns: A list of quotes for the specified RFQ.
"""
async def list_quotes_by_rfq(organization_id: str, rfq_id: str):
    quotes = await get_table("quotes")
    async for session in get_db():
        query = select(quotes).where(
            quotes.c.org_id == organization_id,
            quotes.c.rfq_id == rfq_id
        )
        res = await session.execute(query)
        return res.mappings().all()

"""
List quotes by vendor from the database of the current organization.
- Returns: A list of quotes from the specified vendor.
"""
async def list_quotes_by_vendor(organization_id: str, vendor_id: str):
    quotes = await get_table("quotes")
    async for session in get_db():
        query = select(quotes).where(
            quotes.c.org_id == organization_id,
            quotes.c.vendor_id == vendor_id
        )
        res = await session.execute(query)
        return res.mappings().all()

"""
Create a new quote in the database of the current organization.
- Returns: The created quote.
"""
async def create_quote(organization_id: str, quote: dict):
    quotes = await get_table("quotes")
    async for session in get_db():
        quote['org_id'] = organization_id
        stmt = insert(quotes).values(**quote).returning(quotes)
        res = await session.execute(stmt)
        await session.commit()
        return res.mappings().first()

"""
Update a quote in the database of the current organization.
- Returns: The updated quote.
"""
async def update_quote(quote_id: str, organization_id: str, quote: dict):
    quotes = await get_table("quotes")
    async for session in get_db():
          # build UPDATE statement with returning
          stmt = (
              update(quotes)
              .where(quotes.c.id == quote_id, quotes.c.org_id == organization_id)
              .values(**quote)
              .returning(quotes)  # return the updated row
          )
          res = await session.execute(stmt)
          await session.commit()
          return res.mappings().first()

"""
Delete a quote from the database of the current organization.
- Returns: The deleted quote.
"""
async def delete_quote(quote_id: str, organization_id: str):
    quotes = await get_table("quotes")
    async for session in get_db():
        stmt = (
            delete(quotes)
            .where(quotes.c.id == quote_id, quotes.c.org_id == organization_id)
            .returning(quotes)
        )
        res = await session.execute(stmt)
        await session.commit()
        return res.mappings().first()
