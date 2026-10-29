from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import VerificationRecord
from app.services.report_generator import generate_evidence_pdf
from app.config import REPORTS_DIR

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/{id}/pdf")
def download_evidence_report(id: int, db: Session = Depends(get_db)):
    """
    Downloads or streams the verified ReportLab PDF Evidence Certificate for a given verification record.
    """
    record = db.query(VerificationRecord).filter(VerificationRecord.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Verification record not found")

    pdf_filename = record.report_filename or f"praman_evidence_{record.id}.pdf"
    pdf_path = REPORTS_DIR / pdf_filename

    # If file was deleted or not yet generated, build it now
    if not pdf_path.exists():
        data = {
            "id": record.id,
            "status": record.status,
            "confidence": record.confidence,
            "submitted_quote": record.submitted_quote,
            "case_name": record.case_name,
            "judgment_title": record.judgment_title,
            "citation": record.matched_citation or record.citation,
            "court": record.matched_court or record.court_name,
            "para_number": record.para_number,
            "page_number": record.page_number,
            "original_passage": record.original_passage,
            "diff": record.diff_data,
            "context_analysis": record.context_analysis,
            "cross_case": record.cross_case_data,
            "explanation": record.explanation,
            "limitations": record.limitations,
            "created_at": record.created_at.strftime("%Y-%m-%d %H:%M:%S UTC")
        }
        generate_evidence_pdf(data, pdf_filename)
        record.report_filename = pdf_filename
        db.commit()

    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename=f"PramanAI_Evidence_Report_{id}.pdf"
    )
