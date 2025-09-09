"""
RAG creation base in one file.

Receives a PDF file path, then:
1. Loads it with an async DirectoryLoader
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

Environment:
    export OPENAI_API_KEY="your-key"  # if using OpenAIEmbeddings

Notes:
- The loader is async and returns a list of LangChain Document objects.
- InMemoryVectorStore embeds internally. You do not pass precomputed vectors.
- Swap to PGVector later for persistence without changing the QA layer.
"""
from __future__ import annotations

from typing import Any, List, Tuple

from app.config import ai_config
from app.ai.rag.chunker import chunk_documents, ChunkingConfig
from app.ai.rag.embedder import build_embedder, EmbeddingConfig

from langchain_core.retrievers import BaseRetriever
from langchain_core.vectorstores import InMemoryVectorStore
from app.ai.rag.loader import load_file
from app.ai.rag.embedder import build_embedder, EmbeddingConfig

try:
    from langchain_core.documents import Document
except Exception:  # pragma: no cover
    Document = Any  # type: ignore
    Embeddings = Any  # type: ignore


# -----------------------------
# Orchestrator – build retriever
# -----------------------------
def rag_pipeline(
    file_path: str,
    chunk_size: int = 1000,
    chunk_overlap: int = 150,
    embedding_model: str | None = None,
) -> Tuple[BaseRetriever, List[Document]]:
    """Load PDF, chunk, and index in a vector store, returning a retriever.

    Args:
        file_path: Path to the PDF file
        chunk_size: Size of text chunks
        chunk_overlap: Overlap between chunks
        embedding_model_override: Optional override for embedding model, otherwise uses ai_config

    Returns:
        retriever: ready-to-use retriever for QA
        chunks: the chunked Document list
    """
    # =============== Load ===============
    pages = load_file(file_path)

    # =============== Chunk ===============
    chunks = chunk_documents(
        pages, 
        ChunkingConfig(
            chunk_size=chunk_size, 
            chunk_overlap=chunk_overlap,
            add_start_index=True
        )
    )

    # =============== Embed ===============
    embedding_model = embedding_model or ai_config.active_embedding_model_id

    # =============== Vector Store ===============
    embedder = build_embedder(EmbeddingConfig(provider="openai", model=embedding_model))
    vector_store = InMemoryVectorStore(embedding=embedder)
    vector_store.add_documents(chunks)

    retriever = vector_store.as_retriever(search_kwargs={"k": 4})
    return retriever, chunks


# =============== QA layer ===============
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
    # Use the configured chat model from ai_config instead of hardcoded "gpt-4o-mini"
    chat_model = ai_config.active_chat_model_id
    llm = ChatOpenAI(model=chat_model)
    chain = {
        "context": retriever | _format_docs,
        "question": RunnablePassthrough(),
    } | QA_PROMPT | llm
    return chain