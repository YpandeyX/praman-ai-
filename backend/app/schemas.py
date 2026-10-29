from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class VerifyQuoteRequest(BaseModel):
    quote: str = Field(..., min_length=5, description="The legal quotation to verify")
    case_name: Optional[str] = Field(None, description="Case or judgment name")
    court_name: Optional[str] = Field(None, description="Court name if known")
    citation: Optional[str] = Field(None, description="Case citation")
    judgment_url: Optional[str] = Field(None, description="Judgment URL if available")


class DiffChunk(BaseModel):
    type: str  # "equal", "insert", "delete", "replace"
    text: str
    submitted_text: Optional[str] = None
    source_text: Optional[str] = None
    is_critical: bool = False
    critical_reason: Optional[str] = None


class DiffSummary(BaseModel):
    similarity_ratio: float
    added_words: List[str] = []
    removed_words: List[str] = []
    replaced_words: List[Dict[str, str]] = []
    missing_sentences: List[str] = []
    critical_alterations: List[Dict[str, str]] = []
    chunks: List[DiffChunk] = []
    submitted_tokens_highlighted: List[Dict[str, Any]] = []
    source_tokens_highlighted: List[Dict[str, Any]] = []


class ContextIntegrityResult(BaseModel):
    has_warnings: bool = False
    warnings: List[str] = []
    is_party_argument: bool = False
    is_dissent: bool = False
    speaker_or_party: Optional[str] = None
    omitted_qualifications: List[str] = []
    preceding_text: Optional[str] = None
    matched_text: Optional[str] = None
    succeeding_text: Optional[str] = None


class CrossCaseTracingResult(BaseModel):
    alternative_source_found: bool = False
    earliest_case_title: Optional[str] = None
    earliest_citation: Optional[str] = None
    earliest_year: Optional[int] = None
    earliest_court: Optional[str] = None
    trace_summary: Optional[str] = None
    all_matching_cases: List[Dict[str, Any]] = []


class VerifyQuoteResponse(BaseModel):
    id: Optional[int] = None
    status: str  # "Exact Match" | "Modified Quote" | "Context Mismatch" | "Source Not Found" | "Inconclusive"
    confidence: float
    confidence_breakdown: Dict[str, float] = {}
    submitted_quote: str
    judgment_title: Optional[str] = None
    citation: Optional[str] = None
    court: Optional[str] = None
    year: Optional[int] = None
    bench: Optional[str] = None
    para_number: Optional[int] = None
    page_number: Optional[int] = None
    source_url: Optional[str] = None
    original_passage: Optional[str] = None
    diff: Optional[DiffSummary] = None
    context_analysis: Optional[ContextIntegrityResult] = None
    cross_case: Optional[CrossCaseTracingResult] = None
    explanation: str
    limitations: str
    report_url: Optional[str] = None
    created_at: Optional[str] = None


class BatchVerifyRequest(BaseModel):
    job_name: Optional[str] = "Batch Quotation Verification"
    quotes: List[VerifyQuoteRequest]


class BatchVerifyResponse(BaseModel):
    job_id: int
    job_name: str
    total_quotes: int
    exact_count: int
    modified_count: int
    mismatch_count: int
    not_found_count: int
    inconclusive_count: int
    results: List[VerifyQuoteResponse]
    created_at: str


class JudgmentOut(BaseModel):
    id: int
    title: str
    citation: Optional[str] = None
    court: str
    year: Optional[int] = None
    bench: Optional[str] = None
    source_url: Optional[str] = None
    is_landmark: bool = False
    passages_count: int = 0


class SampleQuotePreset(BaseModel):
    id: str
    label: str
    category: str
    quote: str
    case_name: str
    citation: str
    court_name: str
    expected_status: str
    description: str


class EvaluationResultItem(BaseModel):
    id: str
    test_type: str
    quote: str
    case_name: str
    ground_truth_status: str
    predicted_status: str
    is_correct: bool
    confidence: float
    explanation: str


class EvaluationReportResponse(BaseModel):
    total_samples: int
    correct_predictions: int
    accuracy: float
    precision_macro: float
    recall_macro: float
    f1_macro: float
    false_positive_rate: float
    status_metrics: Dict[str, Dict[str, float]]
    results: List[EvaluationResultItem]


class CitationFormatRequest(BaseModel):
    judgment_title: str
    citation: Optional[str] = None
    court: Optional[str] = "Supreme Court of India"
    year: Optional[int] = None
    para_number: Optional[int] = None
    page_number: Optional[int] = None
    quote_text: Optional[str] = None


class CitationFormatResponse(BaseModel):
    scc: str
    air: str
    neutral_insc: str
    bluebook: str
    pleading_blockquote: str


class HarmonizeQuoteRequest(BaseModel):
    submitted_quote: str
    original_passage: str


class HarmonizeQuoteResponse(BaseModel):
    original_submitted: str
    source_reference_span: str
    harmonized_quote: str
    corrections_applied: List[str]
    total_corrections: int
    legal_advisory: str


class DoctrineNode(BaseModel):
    year: int
    case_title: str
    citation: str
    bench: str
    ruling_summary: str
    status: str
    impact: str


class DoctrineTimelineResponse(BaseModel):
    doctrine_name: str
    description: str
    nodes: List[DoctrineNode]


class BriefAuditRequest(BaseModel):
    document_text: str


class BriefQuotationSpan(BaseModel):
    span_id: str
    start: int
    end: int
    quote: str
    case_name: Optional[str] = None
    citation: Optional[str] = None
    status: str
    confidence: float
    verification_result: VerifyQuoteResponse


class BriefAuditResponse(BaseModel):
    document_text: str
    total_quotes: int
    exact_count: int
    modified_count: int
    mismatch_count: int
    not_found_count: int
    spans: List[BriefQuotationSpan]

