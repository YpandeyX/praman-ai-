import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Scale,
  RotateCcw,
  BookOpen,
  Info,
  Maximize2,
  Wand2,
  History,
} from 'lucide-react';
import { VerifyQuoteResponse } from '../types';
import { StatusBadge } from './StatusBadge';
import { DiffViewer } from './DiffViewer';
import { ContextIntegrityCard } from './ContextIntegrityCard';
import { CrossCaseCard } from './CrossCaseCard';
import { RiskRadar } from './RiskRadar';
import { CitationGenerator } from './CitationGenerator';
import { QuoteHarmonizer } from './QuoteHarmonizer';
import { DoctrineTimeline } from './DoctrineTimeline';
import { CourtroomModal } from './CourtroomModal';
import { api } from '../services/api';

interface ResultViewProps {
  result: VerifyQuoteResponse;
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [courtroomOpen, setCourtroomOpen] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const confidencePercent = Math.round((result.confidence || 0) * 100);

  const handleCopyCitation = () => {
    const text = `"${result.submitted_quote}" — Verified against ${result.judgment_title || 'Supreme Court of India'}, ${
      result.citation || 'Official Record'
    }${result.para_number ? `, Para ${result.para_number}` : ''}. [Praman AI Evidence Certificate Ref: ${result.id || 'N/A'}]`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    if (result.id) {
      window.open(api.getPdfReportUrl(result.id), '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
        >
          <RotateCcw size={13} />
          Verify Another Quote
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Courtroom Presentation Mode Button */}
          <button
            onClick={() => setCourtroomOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 transition-all shadow-xs"
          >
            <Maximize2 size={13} />
            Courtroom Presentation Mode
          </button>

          <button
            onClick={handleCopyCitation}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            {copied ? 'Citation Copied!' : 'Copy Traceable Citation'}
          </button>

          {result.id && (
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <Download size={14} />
              Download Evidence Report (PDF)
            </button>
          )}
        </div>
      </div>

      {/* Prominent Verification Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <StatusBadge status={result.status} size="lg" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                PRAMAN-REF-#{result.id || 'LIVE'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {result.judgment_title || 'Authority Source Unverified'}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
              {result.citation && (
                <span className="font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  Citation: {result.citation}
                </span>
              )}
              <span>Court: {result.court || 'Supreme Court of India'}</span>
              {result.para_number && <span>Para: {result.para_number}</span>}
              {result.page_number && <span>Page: {result.page_number}</span>}
              {result.year && <span>Year: {result.year}</span>}
              {result.source_url && (
                <a
                  href={result.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  <ExternalLink size={12} />
                  Official Source Record
                </a>
              )}
            </div>
          </div>

          {/* Confidence Score Dial */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700/80 min-w-[200px] shrink-0 text-center">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Deterministic Confidence
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1">
              <span>{confidencePercent}%</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div>
                <span className="block font-bold text-slate-800 dark:text-slate-200">
                  {Math.round(result.confidence_breakdown.lexical || 0)}%
                </span>
                <span>Lexical</span>
              </div>
              <div>
                <span className="block font-bold text-slate-800 dark:text-slate-200">
                  {Math.round(result.confidence_breakdown.semantic || 0)}%
                </span>
                <span>Semantic</span>
              </div>
              <div>
                <span className="block font-bold text-slate-800 dark:text-slate-200">
                  {Math.round(result.confidence_breakdown.context || 0)}%
                </span>
                <span>Context</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reasoned Explanation */}
        <div className="mt-5 space-y-2">
          <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/70 dark:bg-slate-800/40 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <Info size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-0.5">
                Proof-Carrying Findings:
              </span>
              <span>{result.explanation}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 italic px-1">
            Methodological Limitations: {result.limitations}
          </div>
        </div>
      </div>

      {/* Legal Citation Risk Matrix */}
      <RiskRadar
        status={result.status}
        confidence={result.confidence}
        diff={result.diff}
        contextAnalysis={result.context_analysis}
      />

      {/* Quote Harmonizer (If modified or user wants clean ellipses format) */}
      {result.original_passage && (
        <QuoteHarmonizer
          submittedQuote={result.submitted_quote}
          originalPassage={result.original_passage}
        />
      )}

      {/* Word-Level Diff Viewer */}
      {result.diff && (
        <DiffViewer
          diff={result.diff}
          submittedQuote={result.submitted_quote}
          originalPassage={result.original_passage || ''}
        />
      )}

      {/* Multi-Standard Citation Generator */}
      <CitationGenerator
        judgmentTitle={result.judgment_title || 'Supreme Court of India'}
        citation={result.citation}
        court={result.court}
        year={result.year}
        paraNumber={result.para_number}
        pageNumber={result.page_number}
        quoteText={result.original_passage || result.submitted_quote}
      />

      {/* Context Integrity & Attribution Analysis */}
      {result.context_analysis && (
        <ContextIntegrityCard
          contextAnalysis={result.context_analysis}
          paraNumber={result.para_number}
        />
      )}

      {/* Cross-Case Precedent Tracing */}
      {result.cross_case && <CrossCaseCard crossCase={result.cross_case} />}

      {/* Collapsible Doctrine Lineage Timeline */}
      <div className="pt-2">
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200/70 transition-all"
        >
          <span className="flex items-center gap-2">
            <History size={16} className="text-indigo-600 dark:text-indigo-400" />
            {showTimeline ? 'Hide Precedent Doctrine Lineage' : 'Explore Historical Doctrine Lineage & Overrulings'}
          </span>
          <span className="text-indigo-600 dark:text-indigo-400 underline">
            {showTimeline ? 'Close' : 'View Timeline &rarr;'}
          </span>
        </button>

        {showTimeline && (
          <div className="mt-4">
            <DoctrineTimeline caseName={result.judgment_title || 'Puttaswamy'} />
          </div>
        )}
      </div>

      {/* Courtroom Oral Argument Presentation Modal */}
      {courtroomOpen && (
        <CourtroomModal
          result={result}
          onClose={() => setCourtroomOpen(false)}
        />
      )}
    </div>
  );
};
