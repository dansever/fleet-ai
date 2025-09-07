"""
RAG creation base in one file.

Receives a PDF file path, then:
1. Loads it with an async PyPDFLoader
2. Chunks pages with RecursiveCharacterTextSplitter
3. Indexes chunks in a vector store (in-memory by default)
4. Returns a retriever so you can ask questions immediately

Usage from code:

    import asyncio
    from rag_base import rag_pipeline, build_qa_chain

    async def main():
        retriever, chunks = await rag_pipeline(
            file_path="/path/to/file.pdf",
            chunk_size=1000,
            chunk_overlap=150,
            embedding_model="text-embedding-3-large",
        )
        qa = build_qa_chain(retriever)
        answer = await qa.ainvoke("What are the payment terms?")
        print(answer.content)

    asyncio.run(main())

Requirements:
    pip install -U langchain_community langchain-text-splitters langchain-openai pypdf

Environment:
    export OPENAI_API_KEY="your-key"  # if using OpenAIEmbeddings

Notes:
- The loader is async and returns a list of LangChain Document objects.
- InMemoryVectorStore embeds internally. You do not pass precomputed vectors.
- Swap to PGVector later for persistence without changing the QA layer.
"""
from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Sequence, Tuple

from app.config import ai_config
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.retrievers import BaseRetriever
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.vectorstores import InMemoryVectorStore

try:
    # Default embedder. Swap with another provider if desired.
    from langchain_openai import OpenAIEmbeddings  # type: ignore
except Exception:  # pragma: no cover
    OpenAIEmbeddings = None  # type: ignore

# Typing-only fallbacks
try:
    from langchain_core.documents import Document
    from langchain_core.embeddings import Embeddings
except Exception:  # pragma: no cover
    Document = Any  # type: ignore
    Embeddings = Any  # type: ignore

# -----------------------------
# 1) Loader
# -----------------------------
async def load_pdf(file_path: str) -> List[Document]:
    """
    Loader for PDF files.

    - Uses langchain_community.document_loaders.PyPDFLoader
    - Uses async iteration for loading
    - Returns a list of Document objects with `metadata` and `page_content`
    """
    loader = PyPDFLoader(file_path)
    pages: List[Document] = []
    async for page in loader.alazy_load():
        pages.append(page)
    return pages


# -----------------------------
# 2) Chunker
# -----------------------------
@dataclass
class ChunkingConfig:
    chunk_size: int = 1000
    chunk_overlap: int = 150
    add_start_index: bool = True  # adds `metadata["start_index"]`


def chunk_documents(
    docs: Sequence[Document], config: ChunkingConfig
) -> List[Document]:
    """Split documents into overlapping chunks suitable for embedding.

    Uses RecursiveCharacterTextSplitter which prefers paragraph, newline, space,
    then character boundaries.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=config.chunk_size,
        chunk_overlap=config.chunk_overlap,
        add_start_index=config.add_start_index,
    )
    return splitter.split_documents(list(docs))


# -----------------------------
# 3) Embedder
# -----------------------------
@dataclass
class EmbeddingConfig:
    provider: str = "openai"  # for defaults only
    model: Optional[str] = None  # e.g., "text-embedding-3-large"


def build_embedder(cfg: EmbeddingConfig) -> Embeddings:
    """Create a LangChain Embeddings instance based on config.

    Defaults to OpenAIEmbeddings if available. Replace as needed.
    """
    if cfg.provider.lower() == "openai":
        if OpenAIEmbeddings is None:
            raise RuntimeError(
                "langchain-openai is not installed. `pip install -U langchain-openai`"
            )
        kwargs: Dict[str, Any] = {}
        if cfg.model:
            kwargs["model"] = cfg.model
        return OpenAIEmbeddings(**kwargs)

    raise ValueError(f"Unsupported embeddings provider: {cfg.provider}")


# -----------------------------
# 4) Orchestrator – build retriever
# -----------------------------
async def rag_pipeline(
    file_path: str,
    chunk_size: int = 1000,
    chunk_overlap: int = 150,
    embedding_model: ai_config.openai.embedding_model = None,
) -> Tuple[BaseRetriever, List[Document]]:
    """Load PDF, chunk, and index in a vector store, returning a retriever.

    Returns:
        retriever: ready-to-use retriever for QA
        chunks: the chunked Document list
    """
    # Load
    pages = await load_pdf(file_path)

    # Chunk
    chunks = chunk_documents(
        pages, ChunkingConfig(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    )

    # Build embeddings and in-memory vector store
    embedder = build_embedder(EmbeddingConfig(provider="openai", model=embedding_model))
    vector_store = InMemoryVectorStore(embedding=embedder)
    vector_store.add_documents(chunks)

    retriever = vector_store.as_retriever(search_kwargs={"k": 4})
    return retriever, chunks


# -----------------------------
# 5) Simple QA layer
# -----------------------------
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnablePassthrough

QA_PROMPT = ChatPromptTemplate.from_template(
    "You are a helpful contract analyst.\n"
    "Use the provided context to answer the question clearly and concisely.\n\n"
    "Context:\n{context}\n\n"
    "Question: {question}\n"
)


def _format_docs(docs: List[Document]) -> str:
    parts = []
    for i, d in enumerate(docs, 1):
        src = d.metadata.get("source") or d.metadata.get("file_path") or "doc"
        parts.append(f"[{i}] {src}:\n{d.page_content}")
    return "\n\n".join(parts)


def build_qa_chain(retriever: BaseRetriever):
    llm = ChatOpenAI(model="gpt-4o-mini")
    chain = {
        "context": retriever | _format_docs,
        "question": RunnablePassthrough(),
    } | QA_PROMPT | llm
    return chain


# -----------------------------
# 6) CLI entry point for a quick smoke test
# -----------------------------
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="RAG base: load PDF, chunk, QA")
    parser.add_argument("pdf", help="Path to a PDF file")
    parser.add_argument("--chunk-size", type=int, default=1000)
    parser.add_argument("--chunk-overlap", type=int, default=150)
    parser.add_argument(
        "--model",
        type=str,
        default=None,
        help="Embedding model name, for example text-embedding-3-large",
    )
    parser.add_argument("--question", type=str, default="Summarize the document")

    args = parser.parse_args()

    async def _main() -> None:
        retriever, _ = await rag_pipeline(
            file_path=args.pdf,
            chunk_size=args.chunk_size,
            chunk_overlap=args.chunk_overlap,
            embedding_model=args.model,
        )
        qa = build_qa_chain(retriever)
        answer = await qa.ainvoke(args.question)
        print(answer.content)

    asyncio.run(_main())