from app.db.session import get_table, get_db
from sqlalchemy import update, select, insert, delete

__all__ = [
    "get_contract",
    "list_contracts",
    "create_contract",
    "update_contract",
    "delete_contract",
]

"""
Get a contract by ID from the database of the current organization.
- Returns: A single contract or None if not found.
"""
async def get_contract(organization_id: str, contract_id: str):
    contracts = await get_table("contracts")
    async for session in get_db():
        query = select(contracts).where(
          contracts.c.id == contract_id, 
          contracts.c.org_id == organization_id) 
        res = await session.execute(query)
        return res.mappings().first()

"""
List all contracts from the database of the current organization.
- Returns: A list of contracts.
"""
async def list_contracts(organization_id: str):
    contracts = await get_table("contracts")
    async for session in get_db():
        query = select(contracts).where(contracts.c.org_id == organization_id)
        res = await session.execute(query)
        return res.mappings().all()

"""
Create a new contract in the database of the current organization.
- Returns: The created contract.
"""
async def create_contract(organization_id: str, contract: dict):
    contracts = await get_table("contracts")
    async for session in get_db():
        contract['org_id'] = organization_id
        stmt = insert(contracts).values(**contract).returning(contracts)
        res = await session.execute(stmt)
        await session.commit()
        return res.mappings().first()

"""
Update a contract in the database of the current organization.
- Returns: The updated contract.
"""
async def update_contract(contract_id: str, organization_id: str, contract: dict):
    contracts = await get_table("contracts")
    async for session in get_db():
          # build UPDATE statement with returning
          stmt = (
              update(contracts)
              .where(contracts.c.id == contract_id, contracts.c.org_id == organization_id)
              .values(**contract)
              .returning(contracts)  # return the updated row
          )
          res = await session.execute(stmt)
          await session.commit()
          return res.mappings().first()

"""
Delete a contract from the database of the current organization.
- Returns: The deleted contract.
"""
async def delete_contract(contract_id: str, organization_id: str):
    contracts = await get_table("contracts")
    async for session in get_db():
        stmt = (
            delete(contracts)
            .where(contracts.c.id == contract_id, contracts.c.org_id == organization_id)
            .returning(contracts)
        )
        res = await session.execute(stmt)
        await session.commit()
        return res.mappings().first()