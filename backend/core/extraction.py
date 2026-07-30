import re

import pymupdf as fitz #PyMuPDF

def extract_text(pdf_bytes: bytes) -> str:
    """Extracts and cleans text from PDF Bytes, all pages, in reading order."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    try:
        pages = [page.get_text() for page in doc]  # type: ignore
    finally:
        doc.close()
    return _clean_text("\n".join(pages))

def _clean_text(text: str) -> str:
    """Fixes common PDF-extraction artifacts.
    
    NOTE on the ligature regex below: some PDF fonts render the "ti"/"fi"
    ligature as a stray capital letter when text is extraccted (e.g. "soluAon"
    instead of "solution"). This heuistic assumes any lower-CAPITAL-
    lowercase pattern is one of these mangled ligatures and reqrites it. It
    will occasionally misfire on real words thaat happen to match the same 
    shaoe -- it's a guess, not a guarantee, and worth mentioning as a known
    limitation if anyone asks about text quality.
    """
    text = re.sub(r"([a-z])A([a-z])", r"\1ti\2", text)
    text = text.replace("\x00", "")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()