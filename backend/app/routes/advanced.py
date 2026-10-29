from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import (
    BriefAuditRequest, BriefAuditResponse,
    HarmonizeQuoteRequest, HarmonizeQuoteResponse,
    DoctrineTimelineResponse,
    CitationFormatRequest, CitationFormatResponse
)
from app.services.brief_scanner import scan_and_audit_brief
from app.services.harmonizer import harmonize_quote
from app.services.doctrine_timeline import get_doctrine_lineage_for_case
from app.services.citation_formatter import format_citations

router = APIRouter(prefix="/api/advanced", tags=["Advanced Legal Intelligence"])

@router.post("/scan-brief", response_model=BriefAuditResponse)
def scan_brief(payload: BriefAuditRequest, db: Session = Depends(get_db)):
    """
    Parses a complete legal brief or pleading, detects all quotation marks and citations,
    and returns character offset spans paired with verified evidence results.
    """
    result = scan_and_audit_brief(payload.document_text, db)
    return result


@router.post("/harmonize", response_model=HarmonizeQuoteResponse)
def harmonize(payload: HarmonizeQuoteRequest):
    """
    Generates a legally sanitized, canonically corrected quotation with Supreme Court
    ellipses '[...]' and bracket notations for direct use in court filings.
    """
    if not payload.submitted_quote or not payload.original_passage:
        raise HTTPException(status_code=400, detail="Both submitted quote and original passage required.")
    return harmonize_quote(payload.submitted_quote, payload.original_passage)


@router.get("/timeline/{case_name}", response_model=DoctrineTimelineResponse)
def get_timeline(case_name: str):
    """
    Retrieves the judicial doctrine evolution timeline and historical precedent graph.
    """
    return get_doctrine_lineage_for_case(case_name)


@router.post("/citations/format", response_model=CitationFormatResponse)
def format_citation_styles(payload: CitationFormatRequest):
    """
    Formats citations across SCC, AIR, Neutral INSC, and Bluebook styles with pleading blockquotes.
    """
    return format_citations(
        judgment_title=payload.judgment_title,
        citation=payload.citation,
        court=payload.court,
        year=payload.year,
        para_number=payload.para_number,
        page_number=payload.page_number,
        quote_text=payload.quote_text
    )
