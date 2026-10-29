import fitz  # PyMuPDF
import re
from typing import List, Dict, Any
from app.services.text_normalizer import normalize_text

def extract_text_from_pdf(pdf_path: str) -> List[Dict[str, Any]]:
    """
    Extracts text from a PDF file using PyMuPDF (fitz), parsing it into pages and paragraphs.
    Returns:
        List of dicts: [
            {
                "page_number": int,
                "para_number": int,
                "text": str,
                "cleaned_text": str
            }, ...
        ]
    """
    doc = fitz.open(pdf_path)
    passages: List[Dict[str, Any]] = []
    global_para_idx = 1

    para_regex = re.compile(r'^(?:(?:\d+|[IVXLCDM]+)[\.\)]\s*|\(\d+\)\s*|Para\s*\d+[\.\:]?\s*)')

    for page_idx, page in enumerate(doc, start=1):
        blocks = page.get_text("blocks")
        # Sort blocks vertically then horizontally
        blocks.sort(key=lambda b: (round(b[1], -1), b[0]))
        
        for block in blocks:
            text = block[4].strip()
            # Skip tiny headers/footers or page numbers
            if len(text) < 15 and re.match(r'^\d+$', text):
                continue
            if not text:
                continue

            # Join lines that were broken in middle of sentences
            cleaned = normalize_text(text)
            if len(cleaned) < 20:
                continue

            # Check if there is an explicit paragraph number in text
            para_num = global_para_idx
            match = para_regex.match(cleaned)
            if match:
                num_part = re.sub(r'[^\d]', '', match.group(0))
                if num_part:
                    try:
                        para_num = int(num_part)
                    except ValueError:
                        para_num = global_para_idx

            passages.append({
                "page_number": page_idx,
                "para_number": para_num,
                "text": text,
                "cleaned_text": cleaned
            })
            global_para_idx += 1

    doc.close()
    return passages
