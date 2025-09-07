from app.db.session import get_table, get_db
from sqlalchemy import update, select, insert, delete

"""
Get an airport by ID from the database of the current organization.
- Returns: A single airport or None if not found.
"""
async def get_airport(airport_id: str, organization_id: str):
    airports = await get_table("airports")
    async for session in get_db():
        query = select(airports).where(
          airports.c.id == airport_id, 
          airports.c.org_id == organization_id) 
        res = await session.execute(query)
        return res.mappings().first()

"""
List all airports from the database of the current organization.
- Returns: A list of airports.
"""
async def list_airports(organization_id: str):
    airports = await get_table("airports")
    async for session in get_db():
        query = select(airports).where(airports.c.org_id == organization_id)
        res = await session.execute(query)
        return res.mappings().all()

"""
Create a new airport in the database of the current organization.
- Returns: The created airport.
"""
async def create_airport(organization_id: str, airport: dict):
    airports = await get_table("airports")
    async for session in get_db():
        airport['org_id'] = organization_id
        stmt = insert(airports).values(**airport).returning(airports)
        res = await session.execute(stmt)
        await session.commit()
        return res.mappings().first()

"""
Update a airport in the database of the current organization.
- Returns: The updated airport.
"""
async def update_airport(airport_id: str, organization_id: str, airport: dict):
    airports = await get_table("airports")
    async for session in get_db():
          # build UPDATE statement with returning
          stmt = (
              update(airports)
              .where(airports.c.id == airport_id, airports.c.org_id == organization_id)
              .values(**airport)
              .returning(airports)  # return the updated row
          )
          res = await session.execute(stmt)
          await session.commit()
          return res.mappings().first()

"""
Delete a airport from the database of the current organization.
- Returns: The deleted airport.
"""
async def delete_airport(airport_id: str, organization_id: str):
    airports = await get_table("airports")
    async for session in get_db():
        stmt = (
            delete(airports)
            .where(airports.c.id == airport_id, airports.c.org_id == organization_id)
            .returning(airports)
        )
        res = await session.execute(stmt)
        await session.commit()
        return res.mappings().first()