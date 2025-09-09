# backend/app/ai/rag/chunker.py

from dataclasses import dataclass
from typing import List, Sequence

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter


@dataclass
class ChunkingConfig:
    chunk_size: int = 600
    chunk_overlap: int = 150
    add_start_index: bool = True  # adds `metadata["start_index"]`


def chunk_documents(
    docs: Sequence[Document], 
    config: ChunkingConfig
) -> List[Document]:
    """Split documents into overlapping chunks suitable for embedding.

    Uses RecursiveCharacterTextSplitter which prefers paragraph, newline, space,
    then character boundaries.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=config.chunk_size,
        chunk_overlap=config.chunk_overlap,
        length_function=len,
        add_start_index=config.add_start_index,
    )
    
    chunks = splitter.split_documents(list(docs))
    print(f"Split {len(docs)} documents into {len(chunks)} chunks")

    return chunks