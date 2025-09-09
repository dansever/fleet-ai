from app.db.session import get_table, get_db
from sqlalchemy import insert

__all__ = [
    "create_contract_document",
]

async def create_contract_document(contract_id: str, org_id: str, contract_document: dict):
    contract_documents = await get_table("contract_documents")
    async for session in get_db():
        try:
            contract_document['contract_id'] = contract_id
            contract_document['org_id'] = org_id
            stmt = insert(contract_documents).values(**contract_document).returning(contract_documents)
            res = await session.execute(stmt)
            await session.commit()
            return res.mappings().first()
        except Exception:
            await session.rollback()
            raise
