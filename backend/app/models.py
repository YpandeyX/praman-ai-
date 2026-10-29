import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Judgment(Base):
    __tablename__ = "judgments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    citation = Column(String(150), nullable=True, index=True)
    court = Column(String(150), nullable=False, default="Supreme Court of India")
    year = Column(Integer, nullable=True)
    bench = Column(String(255), nullable=True)
    source_url = Column(String(500), nullable=True)
    original_filename = Column(String(255), nullable=True)
    is_landmark = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    passages = relationship("JudgmentPassage", back_populates="judgment", cascade="all, delete-orphan")


class JudgmentPassage(Base):
    __tablename__ = "judgment_passages"

    id = Column(Integer, primary_key=True, index=True)
    judgment_id = Column(Integer, ForeignKey("judgments.id"), nullable=False, index=True)
    para_number = Column(Integer, nullable=True)
    page_number = Column(Integer, nullable=True)
    text = Column(Text, nullable=False)
    cleaned_text = Column(Text, nullable=False)
    is_holding = Column(Boolean, default=True)
    is_party_argument = Column(Boolean, default=False)
    is_dissent = Column(Boolean, default=False)
    speaker_or_party = Column(String(150), nullable=True)
    section_title = Column(String(255), nullable=True)

    judgment = relationship("Judgment", back_populates="passages")


class VerificationRecord(Base):
    __tablename__ = "verification_records"

    id = Column(Integer, primary_key=True, index=True)
    submitted_quote = Column(Text, nullable=False)
    case_name = Column(String(255), nullable=True)
    citation = Column(String(150), nullable=True)
    court_name = Column(String(150), nullable=True)
    
    # Verdict Status: Exact Match | Modified Quote | Context Mismatch | Source Not Found | Inconclusive
    status = Column(String(50), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    
    # Evidence
    judgment_title = Column(String(255), nullable=True)
    matched_citation = Column(String(150), nullable=True)
    matched_court = Column(String(150), nullable=True)
    para_number = Column(Integer, nullable=True)
    page_number = Column(Integer, nullable=True)
    source_url = Column(String(500), nullable=True)
    original_passage = Column(Text, nullable=True)
    
    # Detailed Analytical Payloads
    diff_data = Column(JSON, nullable=True)
    context_analysis = Column(JSON, nullable=True)
    cross_case_data = Column(JSON, nullable=True)
    
    explanation = Column(Text, nullable=False)
    limitations = Column(Text, nullable=False)
    report_filename = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class BatchJob(Base):
    __tablename__ = "batch_jobs"

    id = Column(Integer, primary_key=True, index=True)
    job_name = Column(String(255), nullable=False)
    total_quotes = Column(Integer, default=0)
    exact_count = Column(Integer, default=0)
    modified_count = Column(Integer, default=0)
    mismatch_count = Column(Integer, default=0)
    not_found_count = Column(Integer, default=0)
    inconclusive_count = Column(Integer, default=0)
    items_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
