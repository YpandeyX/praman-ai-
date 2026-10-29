from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import VerificationRecord
from app.schemas import VerifyQuoteResponse

router = APIRouter(prefix="/api/history", tags=["History"])

@router.get("", response_model=List[VerifyQuoteResponse])
def get_history(
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search quote or case title"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Retrieves chronological history of verifications with optional status filtering and keyword search.
    """
    query = db.query(VerificationRecord)
    if status:
        query = query.filter(VerificationRecord.status == status)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (VerificationRecord.submitted_quote.ilike(s)) |
            (VerificationRecord.case_name.ilike(s)) |
            (VerificationRecord.judgment_title.ilike(s))
        )
    records = query.order_by(desc(VerificationRecord.created_at)).limit(limit).all()

    out = []
    for r in records:
        out.append(
            VerifyQuoteResponse(
                id=r.id,
                status=r.status,
                confidence=r.confidence,
                confidence_breakdown={"lexical": r.confidence * 100, "semantic": r.confidence * 100, "context": 90.0},
                submitted_quote=r.submitted_quote,
                judgment_title=r.judgment_title or r.case_name,
                citation=r.matched_citation or r.citation,
                court=r.matched_court or r.court_name,
                para_number=r.para_number,
                page_number=r.page_number,
                source_url=r.source_url,
                original_passage=r.original_passage,
                diff=r.diff_data,
                context_analysis=r.context_analysis,
                cross_case=r.cross_case_data,
                explanation=r.explanation,
                limitations=r.limitations,
                report_url=f"/api/reports/{r.id}/pdf" if r.report_filename else None,
                created_at=r.created_at.isoformat()
            )
        )
    return out


@router.get("/{id}", response_model=VerifyQuoteResponse)
def get_history_detail(id: int, db: Session = Depends(get_db)):
    """
    Returns single verification record details by ID.
    """
    r = db.query(VerificationRecord).filter(VerificationRecord.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Verification record not found")

    return VerifyQuoteResponse(
        id=r.id,
        status=r.status,
        confidence=r.confidence,
        confidence_breakdown={"lexical": r.confidence * 100, "semantic": r.confidence * 100, "context": 90.0},
        submitted_quote=r.submitted_quote,
        judgment_title=r.judgment_title or r.case_name,
        citation=r.matched_citation or r.citation,
        court=r.matched_court or r.court_name,
        para_number=r.para_number,
        page_number=r.page_number,
        source_url=r.source_url,
        original_passage=r.original_passage,
        diff=r.diff_data,
        context_analysis=r.context_analysis,
        cross_case=r.cross_case_data,
        explanation=r.explanation,
        limitations=r.limitations,
        report_url=f"/api/reports/{r.id}/pdf" if r.report_filename else None,
        created_at=r.created_at.isoformat()
    )


@router.delete("/{id}")
def delete_history_item(id: int, db: Session = Depends(get_db)):
    """
    Deletes a single verification record for privacy/retention control.
    """
    r = db.query(VerificationRecord).filter(VerificationRecord.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(r)
    db.commit()
    return {"status": "success", "message": f"Record {id} deleted successfully."}


@router.delete("")
def clear_all_history(db: Session = Depends(get_db)):
    """
    Clears all verification history for user privacy.
    """
    db.query(VerificationRecord).delete()
    db.commit()
    return {"status": "success", "message": "All verification history cleared."}
