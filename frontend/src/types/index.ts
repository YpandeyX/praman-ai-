export type VerificationStatus =
  | 'Exact Match'
  | 'Modified Quote'
  | 'Context Mismatch'
  | 'Source Not Found'
  | 'Inconclusive';

export interface DiffChunk {
  type: 'equal' | 'insert' | 'delete' | 'replace';
  text: string;
  submitted_text?: string;
  source_text?: string;
  is_critical?: boolean;
  critical_reason?: string;
}

export interface CriticalAlteration {
  type: string;
  submitted: string;
  source: string;
  reason: string;
}

export interface DiffSummary {
  similarity_ratio: number;
  added_words: string[];
  removed_words: string[];
  replaced_words: Array<{ submitted: string; source: string }>;
  missing_sentences: string[];
  critical_alterations: CriticalAlteration[];
  chunks: DiffChunk[];
  submitted_tokens_highlighted: Array<{
    word: string;
    status: string;
    is_critical?: boolean;
    critical_reason?: string;
  }>;
  source_tokens_highlighted: Array<{
    word: string;
    status: string;
    is_critical?: boolean;
    critical_reason?: string;
  }>;
}

export interface ContextIntegrityResult {
  has_warnings: boolean;
  warnings: string[];
  is_party_argument: boolean;
  is_dissent: boolean;
  speaker_or_party?: string;
  omitted_qualifications: string[];
  preceding_text?: string;
  matched_text?: string;
  succeeding_text?: string;
}

export interface CrossCaseTracingResult {
  alternative_source_found: boolean;
  earliest_case_title?: string;
  earliest_citation?: string;
  earliest_year?: number;
  earliest_court?: string;
  trace_summary?: string;
  all_matching_cases: Array<{
    judgment_id: number;
    title: string;
    citation?: string;
    year?: number;
    similarity: number;
    para_number?: number;
  }>;
}

export interface VerifyQuoteResponse {
  id?: number;
  status: VerificationStatus;
  confidence: number;
  confidence_breakdown: {
    lexical?: number;
    semantic?: number;
    context?: number;
  };
  submitted_quote: string;
  judgment_title?: string;
  citation?: string;
  court?: string;
  year?: number;
  bench?: string;
  para_number?: number;
  page_number?: number;
  source_url?: string;
  original_passage?: string;
  diff?: DiffSummary;
  context_analysis?: ContextIntegrityResult;
  cross_case?: CrossCaseTracingResult;
  explanation: string;
  limitations: string;
  report_url?: string;
  created_at?: string;
}

export interface VerifyQuoteRequest {
  quote: string;
  case_name?: string;
  citation?: string;
  court_name?: string;
  judgment_url?: string;
}

export interface BatchVerifyResponse {
  job_id: number;
  job_name: string;
  total_quotes: number;
  exact_count: number;
  modified_count: number;
  mismatch_count: number;
  not_found_count: number;
  inconclusive_count: number;
  results: VerifyQuoteResponse[];
  created_at: string;
}

export interface JudgmentOut {
  id: number;
  title: string;
  citation?: string;
  court: string;
  year?: number;
  bench?: string;
  source_url?: string;
  is_landmark: boolean;
  passages_count: number;
}

export interface SampleQuotePreset {
  id: string;
  label: string;
  category: string;
  quote: string;
  case_name: string;
  citation: string;
  court_name: string;
  expected_status: string;
  description: string;
}

export interface EvaluationResultItem {
  id: string;
  test_type: string;
  quote: string;
  case_name: string;
  ground_truth_status: string;
  predicted_status: string;
  is_correct: boolean;
  confidence: number;
  explanation: string;
}

export interface EvaluationReportResponse {
  total_samples: number;
  correct_predictions: number;
  accuracy: number;
  precision_macro: number;
  recall_macro: number;
  f1_macro: number;
  false_positive_rate: number;
  status_metrics: Record<string, {
    precision: number;
    recall: number;
    f1: number;
    support: number;
  }>;
  results: EvaluationResultItem[];
}

export interface CitationFormatRequest {
  judgment_title: string;
  citation?: string;
  court?: string;
  year?: number;
  para_number?: number;
  page_number?: number;
  quote_text?: string;
}

export interface CitationFormatResponse {
  scc: string;
  air: string;
  neutral_insc: string;
  bluebook: string;
  pleading_blockquote: string;
}

export interface HarmonizeQuoteRequest {
  submitted_quote: string;
  original_passage: string;
}

export interface HarmonizeQuoteResponse {
  original_submitted: string;
  source_reference_span: string;
  harmonized_quote: string;
  corrections_applied: string[];
  total_corrections: number;
  legal_advisory: string;
}

export interface DoctrineNode {
  year: number;
  case_title: string;
  citation: string;
  bench: string;
  ruling_summary: string;
  status: string;
  impact: string;
}

export interface DoctrineTimelineResponse {
  doctrine_name: string;
  description: string;
  nodes: DoctrineNode[];
}

export interface BriefQuotationSpan {
  span_id: string;
  start: number;
  end: number;
  quote: string;
  case_name?: string;
  citation?: string;
  status: VerificationStatus;
  confidence: number;
  verification_result: VerifyQuoteResponse;
}

export interface BriefAuditResponse {
  document_text: string;
  total_quotes: number;
  exact_count: number;
  modified_count: number;
  mismatch_count: number;
  not_found_count: number;
  spans: BriefQuotationSpan[];
}
