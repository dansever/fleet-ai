# backend/app/ai/rag/loader.py

from __future__ import annotations
from typing import List, Union
from pathlib import Path
from langchain_core.documents import Document
from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader


def load_file(path: Union[str, Path], glob: str = "**/*.pdf") -> List[Document]:
    """
    Load a single PDF or all PDFs under a directory.

    - If `path` is a directory: uses DirectoryLoader(glob="**/*.pdf" by default).
    - If `path` is a file: uses PyPDFLoader for that file.
    - Returns List[Document] with `page_content` and `metadata`.
    """
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"Path not found: {p}")

    if p.is_dir():
        loader = DirectoryLoader(str(p), glob=glob)
        return loader.load()

    # Single file
    if p.suffix.lower() == ".pdf":
        return PyPDFLoader(str(p)).load()

    raise ValueError(f"Unsupported file type for: {p.name}")