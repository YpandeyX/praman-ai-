import React, { useState } from 'react';
import {
  Layers,
  UploadCloud,
  FileSpreadsheet,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileDiff,
  SearchX,
  ChevronDown,
  ChevronUp,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { VerifyQuoteRequest, BatchVerifyResponse, VerifyQuoteResponse, VerificationStatus } from '../types';
import { api } from '../services/api';
import { StatusBadge } from './StatusBadge';
import { DiffViewer } from './DiffViewer';

export const BatchAudit: React.FC = () => {
  const [inputText, setInputText] = useState(
    `1. "Privacy is the constitutional core of human dignity. Privacy has both positive and negative contents." [Justice K.S. Puttaswamy v. Union of India (2017) 10 SCC 1]
2. "The power to amend the Constitution under Article 368 includes the discretionary power to alter the basic framework of the Constitution." [Kesavananda Bharati v. State of Kerala (1973) 4 SCC 225]
3. "The Constitution does not specifically guarantee a right to privacy and privacy is an elitist concept that must yield to socio-economic welfare." [Justice K.S. Puttaswamy v. Union of India]
4. "The Supreme Court of India in its landmark decision held that artificial intelligence models are legal persons under Article 300A with property rights." [AI Robotics Society v. Union of India (2024)]
5. "The procedure prescribed by law under Article 21 must be just, fair and reasonable and not arbitrary, fanciful or oppressive." [Maneka Gandhi v. Union of India (1978) 1 SCC 248]`
  );

  const [jobName, setJobName] = useState('Supreme Court Citation Audit Brief');
  const [loading, setLoading] = useState(false);
  const [batchResponse, setBatchResponse] = useState<BatchVerifyResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseQuotesFromText = (rawText: string): VerifyQuoteRequest[] => {
    const lines = rawText.split('\n').filter((l) => l.trim().length > 10);
    const parsed: VerifyQuoteRequest[] = [];

    const quoteRegex = /"([^"]+)"|'([^']+)'|“([^”]+)”/;
    const metaRegex = /\[([^\]]+)\]|\(([^)]+)\)/;

    for (const line of lines) {
      let quoteText = '';
      let caseName = '';
      let citation = '';

      const qMatch = line.match(quoteRegex);
      if (qMatch) {
        quoteText = qMatch[1] || qMatch[2] || qMatch[3] || '';
      } else {
        quoteText = line.replace(/^\d+[\.\)]\s*/, '').trim();
      }

      const mMatch = line.match(metaRegex);
      if (mMatch) {
        const metaStr = mMatch[1] || mMatch[2] || '';
        const parts = metaStr.split(/[,–-]/);
        caseName = parts[0]?.trim() || '';
        if (parts[1]) citation = parts[1]?.trim() || '';
      }

      if (quoteText && quoteText.length > 5) {
        parsed.push({
          quote: quoteText,
          case_name: caseName || undefined,
          citation: citation || undefined,
        });
      }
    }
    return parsed;
  };

  const handleRunBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const quotes = parseQuotesFromText(inputText);
    if (quotes.length === 0) {
      setError('Could not extract legal quotations. Please check formatting (e.g. numbered quotes in quotation marks).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.verifyBatch(quotes, jobName);
      setBatchResponse(res);
    } catch (err: any) {
      setError(err.message || 'Batch audit failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (!batchResponse) return;
    const headers = ['ID', 'Status', 'Confidence', 'Submitted Quote', 'Matched Judgment', 'Citation', 'Para', 'Explanation'];
    const rows = batchResponse.results.map((r) => [
      r.id || '',
      `"${r.status}"`,
      `${Math.round(r.confidence * 100)}%`,
      `"${r.submitted_quote.replace(/"/g, '""')}"`,
      `"${(r.judgment_title || '').replace(/"/g, '""')}"`,
      `"${r.citation || ''}"`,
      r.para_number || '',
      `"${r.explanation.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PramanAI_Batch_Audit_${batchResponse.job_id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredResults = batchResponse
    ? batchResponse.results.filter((r) => (statusFilter === 'ALL' ? true : r.status === statusFilter))
    : [];

  return (
    <div className="space-y-6">
      {/* Batch Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <Layers className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Batch Quotation Audit & Verification
            </h2>
            <p className="text-xs text-slate-600">
              Audit briefs, articles, or research filings containing multiple legal quotations in one pass.
            </p>
          </div>
        </div>

        <form onSubmit={handleRunBatch} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Audit Job Name</label>
            <input
              type="text"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Quotations & Citations (Paste list or brief excerpt)
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={6}
              className="w-full text-xs font-mono rounded-lg border border-slate-300 p-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder={`1. "Quote text" [Case Name (Citation)]`}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-600">
              Supports numbered lists with bracketed case names: <code className="text-indigo-600">[Case, Citation]</code>
            </span>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Auditing Citations in Parallel...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet size={14} />
                  <span>Execute Batch Verification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results View */}
      {batchResponse && (
        <div className="space-y-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-600 uppercase">Total Audited</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{batchResponse.total_quotes}</div>
            </div>
            <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200 text-center">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Exact Matches</span>
              <div className="text-2xl font-extrabold text-emerald-800 mt-1">{batchResponse.exact_count}</div>
            </div>
            <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200 text-center">
              <span className="text-[10px] font-bold text-amber-700 uppercase">Modified Quotes</span>
              <div className="text-2xl font-extrabold text-amber-800 mt-1">{batchResponse.modified_count}</div>
            </div>
            <div className="bg-orange-50/50 p-3.5 rounded-xl border border-orange-200 text-center">
              <span className="text-[10px] font-bold text-orange-700 uppercase">Context Mismatch</span>
              <div className="text-2xl font-extrabold text-orange-800 mt-1">{batchResponse.mismatch_count}</div>
            </div>
            <div className="bg-rose-50/50 p-3.5 rounded-xl border border-rose-200 text-center">
              <span className="text-[10px] font-bold text-rose-700 uppercase">Source Not Found</span>
              <div className="text-2xl font-extrabold text-rose-800 mt-1">{batchResponse.not_found_count}</div>
            </div>
            <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-600 uppercase">Inconclusive</span>
              <div className="text-2xl font-extrabold text-slate-700 mt-1">{batchResponse.inconclusive_count}</div>
            </div>
          </div>

          {/* Table Header & Controls */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-600" />
                <span className="text-xs font-semibold text-slate-700">Filter By Status:</span>
                <div className="flex flex-wrap gap-1">
                  {['ALL', 'Exact Match', 'Modified Quote', 'Context Mismatch', 'Source Not Found', 'Inconclusive'].map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`text-[11px] px-2.5 py-1 rounded-md transition-all font-medium ${
                          statusFilter === st
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <Download size={13} />
                Export Audit Table (CSV)
              </button>
            </div>

            {/* Audit Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/60 text-slate-700 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4 w-40">Status</th>
                    <th className="py-3 px-4 w-24">Confidence</th>
                    <th className="py-3 px-4">Quotation & Attribution</th>
                    <th className="py-3 px-4 w-44">Matched Authority</th>
                    <th className="py-3 px-4 w-24 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResults.map((item, idx) => (
                    <React.Fragment key={item.id || idx}>
                      <tr className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 text-center font-mono text-slate-600">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={item.status} size="sm" />
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {Math.round(item.confidence * 100)}%
                        </td>
                        <td className="py-3 px-4">
                          <div className="line-clamp-2 text-slate-900 font-serif">"{item.submitted_quote}"</div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            Attributed to: {item.judgment_title || 'Unspecified'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800 truncate" title={item.judgment_title}>
                            {item.judgment_title || 'No match located'}
                          </div>
                          <div className="text-[11px] text-slate-600">
                            {item.citation ? `Cit: ${item.citation}` : ''}
                            {item.para_number ? ` (Para ${item.para_number})` : ''}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => setExpandedRowId(expandedRowId === item.id ? null : item.id || null)}
                            className="p-1 rounded text-slate-600 hover:text-indigo-600 hover:bg-slate-100"
                            title="Toggle Diff & Findings"
                          >
                            {expandedRowId === item.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          {item.id && (
                            <button
                              onClick={() => window.open(api.getPdfReportUrl(item.id!), '_blank')}
                              className="p-1 rounded text-slate-600 hover:text-indigo-600 hover:bg-slate-100"
                              title="Download PDF Certificate"
                            >
                              <Download size={15} />
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expandable row detail */}
                      {expandedRowId === item.id && (
                        <tr>
                          <td colSpan={6} className="bg-slate-50 p-4 border-b border-slate-200">
                            <div className="space-y-3">
                              <div className="text-xs font-semibold text-slate-800">
                                Detailed Evidence Drill-Down for Item #{idx + 1}
                              </div>
                              <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                                <b>Explanation:</b> {item.explanation}
                              </p>
                              {item.diff && (
                                <DiffViewer
                                  diff={item.diff}
                                  submittedQuote={item.submitted_quote}
                                  originalPassage={item.original_passage || ''}
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
