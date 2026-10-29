import React, { useState } from 'react';
import { Columns, Split, AlertOctagon, Plus, Minus, ArrowRightLeft, FileQuestion } from 'lucide-react';
import { DiffSummary } from '../types';

interface DiffViewerProps {
  diff: DiffSummary;
  submittedQuote: string;
  originalPassage: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ diff, submittedQuote, originalPassage }) => {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');

  const similarityPercent = Math.round((diff.similarity_ratio || 0) * 100);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            Word-Level Difference & Semantic Shift Viewer
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {similarityPercent}% Textual Alignment
          </span>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-xs font-medium text-slate-600">
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            <Columns size={13} />
            Side-by-Side
          </button>
          <button
            onClick={() => setViewMode('unified')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              viewMode === 'unified'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            <Split size={13} />
            Unified Token Flow
          </button>
        </div>
      </div>

      {/* Critical alterations alert banner */}
      {diff.critical_alterations && diff.critical_alterations.length > 0 && (
        <div className="px-5 py-3.5 bg-rose-50 border-b border-rose-200 flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
              Critical Legal Semantic Shifts Detected ({diff.critical_alterations.length})
            </h4>
            <div className="space-y-1 text-xs text-rose-800">
              {diff.critical_alterations.map((crit, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="px-1.5 py-0.2 rounded bg-rose-200/60 font-semibold text-rose-900 text-[11px] uppercase">
                    {crit.type}
                  </span>
                  <span>{crit.reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Diff Content */}
      <div className="p-5">
        {viewMode === 'side-by-side' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Submitted Quote Column */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                  Submitted Quotation
                </span>
                <span className="text-[11px] text-slate-600">
                  {diff.added_words.length} additions
                </span>
              </div>
              <div className="text-sm leading-relaxed text-slate-800 flex flex-wrap gap-x-1.5 gap-y-1">
                {diff.submitted_tokens_highlighted && diff.submitted_tokens_highlighted.length > 0 ? (
                  diff.submitted_tokens_highlighted.map((tok, idx) => {
                    if (tok.status === 'inserted') {
                      return (
                        <span
                          key={idx}
                          title={tok.critical_reason || 'Added word not present in original'}
                          className={`px-1 rounded font-medium ${
                            tok.is_critical
                              ? 'bg-rose-200 text-rose-900 border border-rose-300 ring-1 ring-rose-400'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          +{tok.word}
                        </span>
                      );
                    }
                    if (tok.status === 'replaced') {
                      return (
                        <span
                          key={idx}
                          title={`Substituted (Source had: "${tok.word}")`}
                          className={`px-1 rounded font-medium ${
                            tok.is_critical
                              ? 'bg-amber-200 text-amber-950 border border-amber-300 ring-1 ring-amber-400'
                              : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {tok.word}
                        </span>
                      );
                    }
                    return <span key={idx}>{tok.word}</span>;
                  })
                ) : (
                  <span>{submittedQuote}</span>
                )}
              </div>
            </div>

            {/* Source Passage Column */}
            <div className="rounded-lg border border-slate-200 bg-emerald-50/20 p-4">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-200/60 text-xs font-semibold text-emerald-900">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  Original Source Passage (Target Excerpt)
                </span>
                <span className="text-[11px] text-emerald-700">
                  {diff.removed_words.length} omissions
                </span>
              </div>
              <div className="text-sm leading-relaxed text-slate-800 flex flex-wrap gap-x-1.5 gap-y-1">
                {diff.source_tokens_highlighted && diff.source_tokens_highlighted.length > 0 ? (
                  diff.source_tokens_highlighted.map((tok, idx) => {
                    if (tok.status === 'deleted') {
                      return (
                        <span
                          key={idx}
                          title={tok.critical_reason || 'Word omitted in quotation'}
                          className="px-1 rounded bg-rose-100 text-rose-800 line-through decoration-rose-600 border border-rose-200"
                        >
                          {tok.word}
                        </span>
                      );
                    }
                    if (tok.status === 'replaced_by') {
                      return (
                        <span
                          key={idx}
                          title="Original term altered in submitted quote"
                          className="px-1 rounded bg-amber-100 text-amber-900 border border-amber-200"
                        >
                          {tok.word}
                        </span>
                      );
                    }
                    return <span key={idx}>{tok.word}</span>;
                  })
                ) : (
                  <span>{originalPassage}</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Unified Flow View */
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-sm leading-relaxed space-y-3">
            <div className="text-xs font-semibold text-slate-700 pb-2 border-b border-slate-200">
              Inline Myers Diff Alignment
            </div>
            <div className="flex flex-wrap gap-x-1.5 gap-y-1">
              {diff.chunks.map((chunk, idx) => {
                if (chunk.type === 'equal') {
                  return <span key={idx} className="text-slate-800">{chunk.text}</span>;
                }
                if (chunk.type === 'insert') {
                  return (
                    <span
                      key={idx}
                      title="Added in submitted quotation"
                      className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-medium"
                    >
                      +{chunk.text}
                    </span>
                  );
                }
                if (chunk.type === 'delete') {
                  return (
                    <span
                      key={idx}
                      title="Omitted from original source"
                      className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 line-through decoration-rose-600 border border-rose-300"
                    >
                      -{chunk.text}
                    </span>
                  );
                }
                if (chunk.type === 'replace') {
                  return (
                    <span
                      key={idx}
                      title={`Replaced: "${chunk.source_text}" -> "${chunk.submitted_text}"`}
                      className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-medium"
                    >
                      [{chunk.source_text} → {chunk.submitted_text}]
                    </span>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}

        {/* Missing Sentences Callout if any */}
        {diff.missing_sentences && diff.missing_sentences.length > 0 && (
          <div className="mt-4 p-3.5 rounded-lg bg-slate-100 border border-slate-300 text-xs space-y-1">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <FileQuestion size={14} className="text-slate-600" />
              Omitted Sentence from Original Source:
            </span>
            {diff.missing_sentences.map((sent, sIdx) => (
              <p key={sIdx} className="text-slate-600 italic bg-white p-2 rounded border border-slate-200">
                "{sent}"
              </p>
            ))}
          </div>
        )}

        {/* Change Stats Pills */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Plus size={12} />
            {diff.added_words.length} Added Words
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
            <Minus size={12} />
            {diff.removed_words.length} Omitted Words
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            <ArrowRightLeft size={12} />
            {diff.replaced_words.length} Substitutions
          </span>
        </div>
      </div>
    </div>
  );
};
