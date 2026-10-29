import re
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.services.search_engine import VerificationEngine

QUOTE_PATTERN = re.compile(
    r'(?:["“]([^"”]{15,800})["”]|[\']([^\']{20,800})[\'])'
    r'(?:\s*[\(\[]([^\)\]]{5,100})[\)\]])?'
)

def scan_and_audit_brief(full_text: str, db: Session) -> Dict[str, Any]:
    """
    Parses a complete legal document/brief, isolates all legal quotation spans
    with character offsets, and runs real-time verification against the corpus.
    """
    if not full_text or len(full_text.strip()) < 10:
        return {
            "document_text": full_text,
            "total_quotes": 0,
            "exact_count": 0,
            "modified_count": 0,
            "mismatch_count": 0,
            "not_found_count": 0,
            "spans": []
        }

    engine = VerificationEngine(db)
    spans: List[Dict[str, Any]] = []

    exact_c = 0
    mod_c = 0
    mis_c = 0
    nf_c = 0

    span_idx = 1
    for match in QUOTE_PATTERN.finditer(full_text):
        raw_quote = match.group(1) or match.group(2)
        meta_str = match.group(3) or ""
        
        if not raw_quote or len(raw_quote.strip().split()) < 4:
            continue

        case_name = None
        citation = None
        if meta_str:
            parts = meta_str.split(",")
            case_name = parts[0].strip()
            if len(parts) > 1:
                citation = parts[1].strip()

        # Run verification
        verif = engine.search_and_verify(
            quote=raw_quote.strip(),
            case_name=case_name,
            citation=citation
        )

        st = verif["status"]
        if st == "Exact Match":
            exact_c += 1
        elif st == "Modified Quote":
            mod_c += 1
        elif st == "Context Mismatch":
            mis_c += 1
        elif st == "Source Not Found":
            nf_c += 1

        spans.append({
            "span_id": f"quote-span-{span_idx}",
            "start": match.start(1) if match.group(1) else match.start(2),
            "end": match.end(1) if match.group(1) else match.end(2),
            "quote": raw_quote.strip(),
            "case_name": case_name,
            "citation": citation,
            "status": st,
            "confidence": verif["confidence"],
            "verification_result": verif
        })
        span_idx += 1

    return {
        "document_text": full_text,
        "total_quotes": len(spans),
        "exact_count": exact_c,
        "modified_count": mod_c,
        "mismatch_count": mis_c,
        "not_found_count": nf_c,
        "spans": spans
    }
