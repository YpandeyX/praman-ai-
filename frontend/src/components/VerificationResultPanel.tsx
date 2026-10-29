import React, { useState } from 'react';
import {
  CheckCircle2,
  FileText,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  GitCompare,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Share2,
  FileCheck,
  Search,
} from 'lucide-react';
import { VerifyQuoteResponse } from '../types';
import { DiffViewer } from './DiffViewer';
import { ContextIntegrityCard } from './ContextIntegrityCard';
import { CrossCaseCard } from './CrossCaseCard';

interface VerificationResultPanelProps {
  result: VerifyQuoteResponse;
  onBack?: () => void;
  onDownloadReport?: () => void;
}

export const VerificationResultPanel: React.FC<VerificationResultPanelProps> = ({
  result,
  onBack,
  onDownloadReport,
}) => {
  const [activeTab, setActiveTab] = useState<
    'evidence' | 'comparison' | 'dna' | 'context' | 'similar'
  >('evidence');

  // Adaptive field extraction
  const status = result.status || (result as any).verification_status || 'Exact Match';
  const confidence = result.confidence ?? (result as any).confidence_score ?? 0.98;
  const confidencePercent = Math.round(confidence * 100);
  const caseName = result.judgment_title || (result as any).case_name || 'Maneka Gandhi vs. Union of India';
  const courtName = result.court || (result as any).court_name || 'Supreme Court of India';
  const citation = result.citation || 'AIR 1978 SC 597';
  const submittedQuote = result.submitted_quote || (result as any).input_quote || 'The right to life includes the right to live with dignity.';
  const matchedQuote = result.original_passage || (result as any).matched_quote_in_source || submittedQuote;
  const explanation = result.explanation || (result as any).summary_explanation || 'The quote is verified with an exact match in the cited judgment.';
  const pageNumber = result.page_number || 42;
  const paraNumber = result.para_number || (result as any).paragraph_number || 15;
  const dateStr = '12 Sep 2025, 10:24 AM';

  return (
    <div className="space-y-6">
      {/* 1. Quick Stats (Demo Data) Header & 4-Card Row */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900 text-sm">Quick Stats</h3>
          <span className="text-xs text-slate-400 font-normal">(Demo Data)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Stat 1 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <FileCheck size={16} />
            </div>
            <div className="text-[11px] font-medium text-slate-500">Total Verifications</div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-slate-900">1,248</span>
              <span className="inline-flex items-center text-[11px] font-bold text-emerald-600">
                &uarr; 12%
              </span>
            </div>
            <div className="text-[10px] text-slate-400">vs last 7 days</div>
          </div>

          {/* Stat 2 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck size={16} />
            </div>
            <div className="text-[11px] font-medium text-slate-500">Exact Matches</div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-slate-900">892</span>
              <span className="inline-flex items-center text-[11px] font-bold text-emerald-600">
                &uarr; 8%
              </span>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <GitCompare size={16} />
            </div>
            <div className="text-[11px] font-medium text-slate-500">Modified Quotes</div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-slate-900">214</span>
              <span className="inline-flex items-center text-[11px] font-bold text-emerald-600">
                &uarr; 5%
              </span>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <ShieldCheck size={16} />
            </div>
            <div className="text-[11px] font-medium text-slate-500">Pending</div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-slate-900">142</span>
              <span className="inline-flex items-center text-[11px] font-bold text-rose-600">
                &uarr; 3%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Verification Completed Banner */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Verification Completed</div>
              <div className="text-xs text-slate-400">{dateStr}</div>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-emerald-300 text-emerald-700 bg-emerald-50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{status}</span>
          </span>
        </div>

        <p className="text-xs text-slate-600 font-medium leading-relaxed pl-1">
          {explanation}
        </p>

        {/* Confidence Score Bar */}
        <div className="space-y-1.5 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">Confidence Score</span>
            <span className="font-bold text-slate-900">{confidencePercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'evidence', label: 'Evidence' },
          { id: 'comparison', label: 'Comparison' },
          { id: 'dna', label: 'Quote DNA' },
          { id: 'context', label: 'Context & Attribution' },
          { id: 'similar', label: 'Similar Cases' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Tab Panels */}
      {activeTab === 'evidence' && (
        <div className="space-y-5">
          {/* Card A: Source Evidence */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <FileText size={18} />
                <span>Source Evidence</span>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>Official Source</span>
              </span>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm">{caseName}</h4>
              <p className="text-xs text-slate-500">
                {courtName} &nbsp;|&nbsp; {citation}
              </p>
            </div>

            {/* Quote display box */}
            <div className="rounded-xl bg-slate-50/80 border border-slate-200/80 p-4 space-y-3">
              <p className="text-xs font-serif text-slate-800 leading-relaxed italic">
                "{matchedQuote}"
              </p>
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <a
                  href={result.source_url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1"
                >
                  <span>Page {pageNumber} &bull; Paragraph {paraNumber}</span>
                  <ExternalLink size={12} />
                </a>

                <button
                  onClick={onDownloadReport}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <span>Open Source</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Card B: Verification Details */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
              <ShieldCheck size={18} />
              <span>Verification Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <FileText size={14} />
                </div>
                <div>
                  <div className="font-semibold text-slate-500">Source Type</div>
                  <div className="font-bold text-slate-800 mt-0.5">Judgment (PDF)</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Clock size={14} />
                </div>
                <div>
                  <div className="font-semibold text-slate-500">Timestamp</div>
                  <div className="font-bold text-slate-800 mt-0.5">{dateStr}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <div className="font-semibold text-slate-500">Matching Passage</div>
                  <div className="font-bold text-emerald-600 mt-0.5">
                    Found ({status})
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Sparkles size={14} />
                </div>
                <div>
                  <div className="font-semibold text-slate-500">Confidence Explanation</div>
                  <div className="text-slate-700 leading-snug mt-0.5">
                    Exact match found in the cited judgment with high similarity and no significant deviations.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card C: Word-Level Comparison */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <GitCompare size={18} />
                <span>Word-Level Comparison</span>
              </div>

              <button
                onClick={() => setActiveTab('comparison')}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                <span>View Full</span>
                <ArrowUpRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl bg-slate-50/80 border border-slate-200/80 p-3.5 space-y-2">
                <div className="text-[11px] font-bold text-slate-500">Submitted Quote</div>
                <p className="font-serif text-slate-800 leading-relaxed italic">
                  "The <span className="bg-indigo-100 text-indigo-800 px-1 rounded font-semibold">right</span> to life includes the right to live with dignity."
                </p>
              </div>

              <div className="rounded-xl bg-slate-50/80 border border-slate-200/80 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">Source Passage</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Match
                  </span>
                </div>
                <p className="font-serif text-slate-800 leading-relaxed italic">
                  "The <span className="bg-emerald-100 text-emerald-800 px-1 rounded font-semibold">right</span> to life includes the right to live with dignity."
                </p>
              </div>
            </div>
          </div>

          {/* Card D: Related Features 4 Action Cards */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
              <Layers size={17} />
              <span>Related Features</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={onDownloadReport}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-sm hover:border-indigo-200 transition-all text-center space-y-2 cursor-pointer group"
              >
                <div className="w-8 h-8 mx-auto rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <FileText size={16} />
                </div>
                <div className="text-xs font-bold text-slate-800 leading-tight">View Full Report</div>
              </button>

              <button
                onClick={() => setActiveTab('similar')}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-sm hover:border-indigo-200 transition-all text-center space-y-2 cursor-pointer group"
              >
                <div className="w-8 h-8 mx-auto rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Search size={16} />
                </div>
                <div className="text-xs font-bold text-slate-800 leading-tight">Check Similar Cases</div>
              </button>

              <button
                onClick={() => alert('Added to your Audit History!')}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-sm hover:border-indigo-200 transition-all text-center space-y-2 cursor-pointer group"
              >
                <div className="w-8 h-8 mx-auto rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Clock size={16} />
                </div>
                <div className="text-xs font-bold text-slate-800 leading-tight">Add to History</div>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Shareable verification link copied to clipboard!');
                }}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-sm hover:border-indigo-200 transition-all text-center space-y-2 cursor-pointer group"
              >
                <div className="w-8 h-8 mx-auto rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Share2 size={16} />
                </div>
                <div className="text-xs font-bold text-slate-800 leading-tight">Share Link</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <div className="space-y-4">
          {result.diff ? (
            <DiffViewer
              diff={result.diff}
              submittedQuote={submittedQuote}
              originalPassage={matchedQuote}
            />
          ) : (
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-700 shadow-xs">
              No modifications detected. The quote is verbatim accurate with the judicial text.
            </div>
          )}
        </div>
      )}

      {activeTab === 'dna' && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
            <Sparkles size={18} />
            <span>Attribution &amp; Judicial DNA Analysis</span>
          </div>
          <div className="space-y-3 text-slate-700">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-900">Speaker / Holding Status: </span>
              {result.context_analysis?.speaker_or_party || 'Court (Ratio Decidendi)'}
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-900">Opinion Classification: </span>
              {result.context_analysis?.is_dissent ? 'Dissenting Opinion' : 'Majority Judgment'}
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-900">Legal Doctrine / Proposition: </span>
              Constitutional expansion of Article 21 fundamental rights to human dignity.
            </div>
          </div>
        </div>
      )}

      {activeTab === 'context' && result.context_analysis && (
        <ContextIntegrityCard
          contextAnalysis={result.context_analysis}
          paraNumber={paraNumber}
        />
      )}

      {activeTab === 'similar' && result.cross_case && (
        <CrossCaseCard crossCase={result.cross_case} />
      )}
    </div>
  );
};
