import uuid
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import VerificationRecord, BatchJob, Judgment, JudgmentPassage
from app.schemas import (
    VerifyQuoteRequest, VerifyQuoteResponse, BatchVerifyRequest, BatchVerifyResponse
)
from app.services.search_engine import VerificationEngine
from app.services.pdf_processor import extract_text_from_pdf
from app.services.report_generator import generate_evidence_pdf
from app.config import UPLOADS_DIR, MAX_UPLOAD_SIZE_MB

router = APIRouter(prefix="/api/verify", tags=["Verification"])

@router.post("", response_model=VerifyQuoteResponse)
def verify_quote(payload: VerifyQuoteRequest, db: Session = Depends(get_db)):
    """
    Verifies a single legal quotation against the indexed judgments database.
    """
    engine = VerificationEngine(db)
    result = engine.search_and_verify(
        quote=payload.quote,
        case_name=payload.case_name,
        citation=payload.citation,
        court_name=payload.court_name,
        judgment_url=payload.judgment_url
    )

    # Persist in verification history
    record = VerificationRecord(
        submitted_quote=result["submitted_quote"],
        case_name=payload.case_name,
        citation=payload.citation,
        court_name=payload.court_name,
        status=result["status"],
        confidence=result["confidence"],
        judgment_title=result.get("judgment_title"),
        matched_citation=result.get("citation"),
        matched_court=result.get("court"),
        para_number=result.get("para_number"),
        page_number=result.get("page_number"),
        source_url=result.get("source_url"),
        original_passage=result.get("original_passage"),
        diff_data=result.get("diff"),
        context_analysis=result.get("context_analysis"),
        cross_case_data=result.get("cross_case"),
        explanation=result["explanation"],
        limitations=result["limitations"]
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    # Generate PDF Evidence Certificate
    report_filename = f"praman_evidence_{record.id}.pdf"
    result["id"] = record.id
    result["created_at"] = record.created_at.isoformat()
    try:
        generate_evidence_pdf(result, report_filename)
        record.report_filename = report_filename
        db.commit()
        result["report_url"] = f"/api/reports/{record.id}/pdf"
    except Exception as e:
        result["report_url"] = None

    return result


@router.post("/upload", response_model=VerifyQuoteResponse)
async def verify_quote_with_pdf(
    quote: str = Form(...),
    case_name: Optional[str] = Form(None),
    citation: Optional[str] = Form(None),
    court_name: Optional[str] = Form("Uploaded Court Judgment"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Verifies a quotation against an uploaded judgment PDF using PyMuPDF text extraction.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_id = str(uuid.uuid4())[:8]
    safe_filename = f"{file_id}_{file.filename.replace(' ', '_')}"
    saved_path = UPLOADS_DIR / safe_filename

    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text with PyMuPDF
    try:
        passages = extract_text_from_pdf(str(saved_path))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract text from PDF: {str(e)}")

    if not passages:
        raise HTTPException(status_code=400, detail="No readable text found in uploaded PDF.")

    # Create Judgment in DB for this upload
    judgment = Judgment(
        title=case_name or file.filename.replace(".pdf", ""),
        citation=citation or f"Uploaded Doc ({file.filename})",
        court=court_name or "Uploaded Judgment Document",
        original_filename=file.filename,
        is_landmark=False
    )
    db.add(judgment)
    db.commit()
    db.refresh(judgment)

    # Create passage dicts for verification
    enriched_passages = []
    for p in passages:
        db_p = JudgmentPassage(
            judgment_id=judgment.id,
            para_number=p["para_number"],
            page_number=p["page_number"],
            text=p["text"],
            cleaned_text=p["cleaned_text"],
            is_holding=True,
            is_party_argument=False,
            is_dissent=False
        )
        db.add(db_p)
        enriched_passages.append({
            "id": None,
            "judgment_id": judgment.id,
            "judgment_title": judgment.title,
            "judgment_citation": judgment.citation,
            "judgment_court": judgment.court,
            "judgment_year": judgment.year,
            "judgment_bench": judgment.bench,
            "source_url": None,
            "para_number": p["para_number"],
            "page_number": p["page_number"],
            "text": p["text"],
            "cleaned_text": p["cleaned_text"],
            "is_holding": True,
            "is_party_argument": False,
            "is_dissent": False,
            "speaker_or_party": None,
            "section_title": f"Page {p['page_number']}"
        })
    db.commit()

    # Verify against extracted passages
    engine = VerificationEngine(db)
    result = engine.search_and_verify(
        quote=quote,
        case_name=judgment.title,
        citation=judgment.citation,
        court_name=judgment.court,
        target_passages_override=enriched_passages
    )

    # Record history
    record = VerificationRecord(
        submitted_quote=result["submitted_quote"],
        case_name=judgment.title,
        citation=judgment.citation,
        court_name=judgment.court,
        status=result["status"],
        confidence=result["confidence"],
        judgment_title=result.get("judgment_title"),
        matched_citation=result.get("citation"),
        matched_court=result.get("court"),
        para_number=result.get("para_number"),
        page_number=result.get("page_number"),
        source_url=None,
        original_passage=result.get("original_passage"),
        diff_data=result.get("diff"),
        context_analysis=result.get("context_analysis"),
        cross_case_data=result.get("cross_case"),
        explanation=result["explanation"],
        limitations=result["limitations"]
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    report_filename = f"praman_evidence_{record.id}.pdf"
    result["id"] = record.id
    result["created_at"] = record.created_at.isoformat()
    try:
        generate_evidence_pdf(result, report_filename)
        record.report_filename = report_filename
        db.commit()
        result["report_url"] = f"/api/reports/{record.id}/pdf"
    except Exception:
        result["report_url"] = None

    return result


@router.post("/batch", response_model=BatchVerifyResponse)
def verify_batch(payload: BatchVerifyRequest, db: Session = Depends(get_db)):
    """
    Verifies multiple legal quotations in a single batch request and returns aggregated audit statistics.
    """
    if not payload.quotes:
        raise HTTPException(status_code=400, detail="No quotations provided for batch verification.")

    engine = VerificationEngine(db)
    results = []
    exact_count = 0
    modified_count = 0
    mismatch_count = 0
    not_found_count = 0
    inconclusive_count = 0

    for req in payload.quotes:
        res = engine.search_and_verify(
            quote=req.quote,
            case_name=req.case_name,
            citation=req.citation,
            court_name=req.court_name,
            judgment_url=req.judgment_url
        )
        status = res["status"]
        if status == "Exact Match":
            exact_count += 1
        elif status == "Modified Quote":
            modified_count += 1
        elif status == "Context Mismatch":
            mismatch_count += 1
        elif status == "Source Not Found":
            not_found_count += 1
        else:
            inconclusive_count += 1

        # Save record
        rec = VerificationRecord(
            submitted_quote=res["submitted_quote"],
            case_name=req.case_name,
            citation=req.citation,
            court_name=req.court_name,
            status=res["status"],
            confidence=res["confidence"],
            judgment_title=res.get("judgment_title"),
            matched_citation=res.get("citation"),
            matched_court=res.get("court"),
            para_number=res.get("para_number"),
            page_number=res.get("page_number"),
            source_url=res.get("source_url"),
            original_passage=res.get("original_passage"),
            diff_data=res.get("diff"),
            context_analysis=res.get("context_analysis"),
            cross_case_data=res.get("cross_case"),
            explanation=res["explanation"],
            limitations=res["limitations"]
        )
        db.add(rec)
        db.commit()
        db.refresh(rec)

        res["id"] = rec.id
        res["created_at"] = rec.created_at.isoformat()
        res["report_url"] = f"/api/reports/{rec.id}/pdf"
        results.append(res)

    batch_job = BatchJob(
        job_name=payload.job_name or "Batch Legal Quotation Verification",
        total_quotes=len(payload.quotes),
        exact_count=exact_count,
        modified_count=modified_count,
        mismatch_count=mismatch_count,
        not_found_count=not_found_count,
        inconclusive_count=inconclusive_count
    )
    db.add(batch_job)
    db.commit()
    db.refresh(batch_job)

    return {
        "job_id": batch_job.id,
        "job_name": batch_job.job_name,
        "total_quotes": len(payload.quotes),
        "exact_count": exact_count,
        "modified_count": modified_count,
        "mismatch_count": mismatch_count,
        "not_found_count": not_found_count,
        "inconclusive_count": inconclusive_count,
        "results": results,
        "created_at": batch_job.created_at.isoformat()
    }
