import React, { useState } from 'react';
import {
  FileText,
  Search,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileDiff,
  SearchX,
  Loader2,
  ExternalLink,
  Download,
  Eye,
} from 'lucide-react';
import { api } from '../services/api';
import { BriefAuditResponse, BriefQuotationSpan, VerifyQuoteResponse } from '../types';
import { StatusBadge } from './StatusBadge';
import { DiffViewer } from './DiffViewer';
import { ContextIntegrityCard } from './ContextIntegrityCard';
import { QuoteHarmonizer } from './QuoteHarmonizer';

const DEFAULT_SAMPLE_BRIEF = `IN THE SUPREME COURT OF INDIA
CIVIL ORIGINAL JURISDICTION
WRIT PETITION (CIVIL) NO. 402 OF 2026

IN THE MATTER OF:
Constitutional Rights Foundation ... Petitioner
VERSUS
Union of India & Ors. ... Respondents

WRIT PETITION UNDER ARTICLE 32 OF THE CONSTITUTION OF INDIA

1. The Petitioner respectfully submits that the impugned executive surveillance directions arbitrarily infringe upon personal liberty. In the authoritative 9-judge bench decision, this Hon'ble Court declared:
"Privacy is the constitutional core of human dignity. Privacy has both positive and negative contents." [Justice K.S. Puttaswamy v. Union of India, (2017) 10 SCC 1]
The state intrusion directly violates the core negative content recognized by this Court.

2. It is further submitted that Parliament's constituent power is not absolute. In the historic ruling of Kesavananda Bharati, this Court settled:
"The power to amend the Constitution under Article 368 includes the discretionary power to alter the basic framework of the Constitution so as to adapt its identity." [Kesavananda Bharati v. State of Kerala, (1973) 4 SCC 225]
Any encroachment beyond these parameters violates the basic structure doctrine.

3. The Respondent Union's reliance on state necessity is misplaced. The Attorney General previously submitted that:
"The Constitution does not specifically guarantee a right to privacy and privacy is an elitist concept that must yield to the socio-economic welfare entitlements of the impoverished masses." [Justice K.S. Puttaswamy v. Union of India]
This contention was decisively repudiated by the majority bench.

4. Lastly, the respondents' assertion that modern algorithmic automated profiling creates corporate immunity has no judicial foundation. Citing fabricated authority:
"The Supreme Court of India in its landmark decision held that artificial intelligence models are legal persons under Article 300A with property rights in their generated software algorithms." [AI Robotics Society v. Union of India]
is entirely ungrounded and misleading.

PRAYER:
In view of the premises aforesaid, the Petitioner prays that this Hon'ble Court be pleased to issue a Writ of Mandamus...`;

export const BriefAuditor: React.FC = () => {
  const [briefText, setBriefText] = useState(DEFAULT_SAMPLE_BRIEF);
  const [loading, setLoading] = useState(false);
  const [auditData, setAuditData] = useState<BriefAuditResponse | null>(null);
  const [selectedSpanId, setSelectedSpanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScanBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!briefText.trim() || briefText.trim().length < 20) {
      setError('Please provide a legal brief or petition text of at least 20 characters.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await api.scanBrief(briefText);
      setAuditData(res);
      if (res.spans && res.spans.length > 0) {
        setSelectedSpanId(res.spans[0].span_id);
      }
    } catch (err: any) {
      setError(err.message || 'Brief scan failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusHighlightClass = (status: string, isSelected: boolean) => {
    let base = '';
    if (status === 'Exact Match') {
      base = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 border-b-2 border-emerald-500';
    } else if (status === 'Modified Quote') {
      base = 'bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border-b-2 border-amber-500';
    } else if (status === 'Context Mismatch') {
      base = 'bg-orange-100 dark:bg-orange-950/60 text-orange-950 dark:text-orange-200 border-b-2 border-orange-500';
    } else {
      base = 'bg-rose-100 dark:bg-rose-950/60 text-rose-950 dark:text-rose-200 border-b-2 border-rose-500';
    }
    return isSelected ? `${base} ring-2 ring-indigo-600 rounded-sm font-semibold` : `${base} cursor-pointer hover:opacity-80`;
  };

  const selectedSpan = auditData?.spans.find((s) => s.span_id === selectedSpanId);

  // Render text with interactive spans
  const renderAnnotatedDocument = () => {
    if (!auditData || auditData.spans.length === 0) {
      return <pre className="font-serif text-xs leading-relaxed whitespace-pre-wrap">{briefText}</pre>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sort spans by start offset
    const sortedSpans = [...auditData.spans].sort((a, b) => a.start - b.start);

    sortedSpans.forEach((span, idx) => {
      // Plain text before span
      if (span.start > lastIndex) {
        elements.push(
          <span key={`text-${idx}`}>{briefText.substring(lastIndex, span.start)}</span>
        );
      }

      // Highlighted span
      const isSelected = selectedSpanId === span.span_id;
      elements.push(
        <mark
          key={`span-${span.span_id}`}
          onClick={() => setSelectedSpanId(span.span_id)}
          className={`px-1 py-0.5 rounded transition-all ${getStatusHighlightClass(span.status, isSelected)}`}
          title={`Click to inspect: ${span.status} (${Math.round(span.confidence * 100)}% Conf)`}
        >
          {briefText.substring(span.start, span.end)}
        </mark>
      );
      lastIndex = span.end;
    });

    if (lastIndex < briefText.length) {
      elements.push(
        <span key="text-end">{briefText.substring(lastIndex)}</span>
      );
    }

    return (
      <div className="font-serif text-xs leading-relaxed whitespace-pre-wrap select-text">
        {elements}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Interactive Legal Brief & Pleading Auditor
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audit entire writ petitions, SLPs, or research papers. Ingests the full document and color-codes every quote with in-situ navigation.
              </p>
            </div>
          </div>

          <button
            onClick={handleScanBrief}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Auditing Document Citations...</span>
              </>
            ) : (
              <>
                <Search size={13} />
                <span>Scan & Annotate Brief</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-lg">
            {error}
          </div>
        )}

        {/* Input Text Area if not scanned or user wants to edit */}
        {!auditData && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold">Paste Brief or Pleading Text Below:</span>
              <button
                onClick={() => setBriefText(DEFAULT_SAMPLE_BRIEF)}
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Sparkles size={12} />
                Reset to Sample Supreme Court Petition
              </button>
            </div>
            <textarea
              value={briefText}
              onChange={(e) => setBriefText(e.target.value)}
              rows={12}
              className="w-full text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
            />
          </div>
        )}
      </div>

      {/* Split-Screen Interactive Brief Viewer */}
      {auditData && (
        <div className="space-y-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Quotations Detected</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                {auditData.total_quotes}
              </div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Exact Matches</span>
              <div className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300 mt-1">
                {auditData.exact_count}
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800 text-center">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">Modified Quotes</span>
              <div className="text-2xl font-extrabold text-amber-800 dark:text-amber-300 mt-1">
                {auditData.modified_count}
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded-xl border border-orange-200 dark:border-orange-800 text-center">
              <span className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase">Context Mismatch</span>
              <div className="text-2xl font-extrabold text-orange-800 dark:text-orange-300 mt-1">
                {auditData.mismatch_count}
              </div>
            </div>
            <div className="bg-rose-50 dark:bg-rose-950/30 p-3 rounded-xl border border-rose-200 dark:border-rose-800 text-center">
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase">Source Not Found</span>
              <div className="text-2xl font-extrabold text-rose-800 dark:text-rose-300 mt-1">
                {auditData.not_found_count}
              </div>
            </div>
          </div>

          {/* Dual-Pane View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Pane: Annotated Brief */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[650px]">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Eye size={13} className="text-indigo-600" />
                  Live Annotated Document (Click highlight to inspect)
                </span>
                <button
                  onClick={() => setAuditData(null)}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Edit Brief
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-slate-50/40 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200">
                {renderAnnotatedDocument()}
              </div>
            </div>

            {/* Right Pane: Selected Quote Evidence Card */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[650px]">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Selected Quotation Evidence Card</span>
                {selectedSpan?.verification_result?.id && (
                  <button
                    onClick={() => window.open(api.getPdfReportUrl(selectedSpan.verification_result.id!), '_blank')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    <Download size={12} />
                    Download PDF Certificate
                  </button>
                )}
              </div>

              <div className="p-5 overflow-y-auto flex-1 space-y-4">
                {selectedSpan ? (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="space-y-1">
                        <StatusBadge status={selectedSpan.status} size="md" />
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
                          {selectedSpan.verification_result.judgment_title || 'Authority Unverified'}
                        </h4>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {selectedSpan.verification_result.citation || 'N/A'} • Para {selectedSpan.verification_result.para_number || 'N/A'}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Confidence</span>
                        <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                          {Math.round(selectedSpan.confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      <b>Proof-Carrying Findings:</b> {selectedSpan.verification_result.explanation}
                    </div>

                    {/* Diff Viewer if available */}
                    {selectedSpan.verification_result.diff && (
                      <DiffViewer
                        diff={selectedSpan.verification_result.diff}
                        submittedQuote={selectedSpan.quote}
                        originalPassage={selectedSpan.verification_result.original_passage || ''}
                      />
                    )}

                    {/* Context Integrity if available */}
                    {selectedSpan.verification_result.context_analysis && (
                      <ContextIntegrityCard
                        contextAnalysis={selectedSpan.verification_result.context_analysis}
                        paraNumber={selectedSpan.verification_result.para_number}
                      />
                    )}

                    {/* Harmonizer if quote is modified */}
                    {selectedSpan.status === 'Modified Quote' && selectedSpan.verification_result.original_passage && (
                      <QuoteHarmonizer
                        submittedQuote={selectedSpan.quote}
                        originalPassage={selectedSpan.verification_result.original_passage}
                      />
                    )}
                  </>
                ) : (
                  <div className="py-20 text-center text-xs text-slate-500">
                    Click any highlighted quotation in the brief on the left to inspect its evidence and diff.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
