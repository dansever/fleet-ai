# app/ai/extractors/ocr_tesseract.py
from pathlib import Path
from PIL import Image
import pytesseract
from app.utils import get_logger

logger = get_logger(__name__)

class OcrTesseractClient:
    """
    Simple reusable client for OCR text extraction using Tesseract.
    """

    def __init__(self, lang: str = "eng"):
        self.lang = lang

    def extract_text(self, file_path: str | Path) -> str:
        """
        Extract text from an image or scanned PDF page.
        (For multipage PDFs, pre-convert to images.)
        """
        try:
            img = Image.open(file_path)
            text = pytesseract.image_to_string(img, lang=self.lang)
            return text.strip()
        except Exception as e:
            logger.error(f"OCR extraction failed: {e}")
            raise


def get_ocr_client(lang: str = "eng") -> OcrTesseractClient:
    return OcrTesseractClient(lang=lang)
