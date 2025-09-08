from app.db.session import get_table, get_db
from sqlalchemy import insert, select

__all__ = [
    "create_contract_chunk",
    "get_contract_chunks_by_contract_id",
]

async def get_contract_chunks_by_contract_id(contract_id: str):
    contract_chunks = await get_table("contract_chunks")
    async for session in get_db():
        query = select(contract_chunks).where(contract_chunks.c.contract_id == contract_id)
        res = await session.execute(query)
        return res.mappings().all()



async def create_contract_chunk(contract_id: str, doc_id: str, contract_chunk: dict):
    contract_chunks = await get_table("contract_chunks")
    async for session in get_db():
        try:
            contract_chunk['contract_id'] = contract_id
            contract_chunk['doc_id'] = doc_id
            stmt = insert(contract_chunks).values(**contract_chunk).returning(contract_chunks)
            res = await session.execute(stmt)
            await session.commit()
            return res.mappings().first()
        except Exception:
            await session.rollback()
            raise
