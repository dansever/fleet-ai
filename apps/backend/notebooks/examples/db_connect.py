# (.venv) PS C:\Users\danse\Projects\FleetAI V1\fleet-ai\apps\backend> 
# py -m app.notebooks.examples.db_connect 

import sys
import os
import asyncio

# Check if we're in a Jupyter notebook
if '__file__' in globals():
    # Running as a script
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
else:
    # Running in Jupyter notebook
    current_dir = os.getcwd()
    backend_dir = os.path.join(current_dir, '..', '..')
    sys.path.insert(0, os.path.abspath(backend_dir))

from app.db import get_db, get_airports_by_org, get_quotes_by_rfq_id, get_user_by_id
from app.db.models_auto import Airports, Quotes, Users

async def test_airports():
    """Test airport operations"""
    print("=== Testing Airport Operations ===")
    
    async for session in get_db():
        # Get airports by organization
        org_id = "6c26bb58-b361-4feb-aa6b-1f01599200c5"
        airports = await get_airports_by_org(session, org_id)
        
        print(f"Found {len(airports)} airports for org {org_id}")
        for airport in airports:
            print(f"- {airport.name} ({airport.iata})")
        
        break  # Exit the async generator


async def test_raw_queries():
    """Test raw SQL queries using asyncpg"""
    print("\n=== Testing Raw SQL Queries ===")
    
    from app.db import get_db_connection
    
    pool = await get_db_connection()
    
    async with pool.acquire() as conn:
        # Example: Get all airports
        airports = await conn.fetch("SELECT * FROM airports LIMIT 5")
        print(f"Raw query found {len(airports)} airports")
        
        for airport in airports:
            print(f"- {airport['name']} ({airport['iata']})")

async def main():
    """Run all tests"""
    try:
        await test_airports()
        await test_raw_queries()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())