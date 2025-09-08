# app/db/chroma_client.py
import os
import chromadb
from functools import lru_cache

@lru_cache
def get_chroma_client():
    return chromadb.CloudClient(
        api_key=os.getenv("CHROMADB_API_KEY"),
        tenant=os.getenv("CHROMADB_TENANT"),
        database=os.getenv("CHROMADB_DATABASE"),
    )
