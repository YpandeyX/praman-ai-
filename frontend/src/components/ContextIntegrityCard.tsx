import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Scale, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { ContextIntegrityResult } from '../types';

interface ContextIntegrityCardProps {
  contextAnalysis: ContextIntegrityResult;
  paraNumber?: number;
}

export const ContextIntegrityCard: React.FC<ContextIntegrityCardProps> = ({
  contextAnalysis,
  paraNumber,
}) => {
  const [showSurrounding, setShowSurrounding] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Scale className="w-4 h-4 text-indigo-600" />
          <h3 className="font-semibold text-slate-900 text-sm">
            Context Integrity & Attribution Audit
          </h3>
        </div>

        {contextAnalysis.has_warnings ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300">
            <AlertTriangle size={12} />
            Context Flags Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Context Verified
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Warning Banners */}
        {contextAnalysis.warnings && contextAnalysis.warnings.length > 0 ? (
          <div className="space-y-2.5">
            {contextAnalysis.warnings.map((w, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-orange-50 border border-orange-200 flex items-start gap-3"
              >
                <ShieldAlert className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="text-xs text-orange-900 leading-relaxed font-medium">
                  {w}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 leading-relaxed">
            <b>Holding Integrity Confirmed:</b> This passage forms part of the judicial opinion/ratio decidendi and does not conflate submissions by counsel or minority dissenting views.
          </div>
        )}

        {/* Specific Flag Pills */}
        <div className="flex flex-wrap gap-2 text-xs">
          <div
            className={`px-3 py-1 rounded-md border flex items-center gap-1.5 ${
              contextAnalysis.is_party_argument
                ? 'bg-rose-50 border-rose-200 text-rose-800 font-medium'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <span>Submissions / Party Argument:</span>
            <b>{contextAnalysis.is_party_argument ? 'Detected (Flagged)' : 'No'}</b>
          </div>

          <div
            className={`px-3 py-1 rounded-md border flex items-center gap-1.5 ${
              contextAnalysis.is_dissent
                ? 'bg-amber-50 border-amber-200 text-amber-800 font-medium'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <span>Dissenting View:</span>
            <b>{contextAnalysis.is_dissent ? 'Minority Dissent' : 'Majority Ratio'}</b>
          </div>

          {contextAnalysis.omitted_qualifications && contextAnalysis.omitted_qualifications.length > 0 && (
            <div className="px-3 py-1 rounded-md border bg-orange-50 border-orange-200 text-orange-800 font-medium flex items-center gap-1.5">
              <span>Omitted Caveat:</span>
              <b>{contextAnalysis.omitted_qualifications.join(', ')}</b>
            </div>
          )}
        </div>

        {/* Expandable Surrounding Context Accordion */}
        {(contextAnalysis.preceding_text || contextAnalysis.succeeding_text) && (
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setShowSurrounding(!showSurrounding)}
              className="flex items-center justify-between w-full py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
            >
              <span className="flex items-center gap-2">
                <BookOpen size={14} />
                Inspect Surrounding Judgment Context (Preceding & Succeeding Paragraphs)
              </span>
              {showSurrounding ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showSurrounding && (
              <div className="mt-3 space-y-3 text-xs leading-relaxed">
                {contextAnalysis.preceding_text && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600">
                    <span className="font-semibold text-slate-800 block mb-1">
                      Preceding Paragraph {paraNumber ? `(Para ${paraNumber - 1})` : ''}:
                    </span>
                    <p className="italic">"{contextAnalysis.preceding_text}"</p>
                  </div>
                )}

                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950 font-medium">
                  <span className="font-bold text-emerald-900 block mb-1">
                    Matched Judicial Passage {paraNumber ? `(Para ${paraNumber})` : ''}:
                  </span>
                  <p>"{contextAnalysis.matched_text}"</p>
                </div>

                {contextAnalysis.succeeding_text && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600">
                    <span className="font-semibold text-slate-800 block mb-1">
                      Succeeding Paragraph {paraNumber ? `(Para ${paraNumber + 1})` : ''}:
                    </span>
                    <p className="italic">"{contextAnalysis.succeeding_text}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
