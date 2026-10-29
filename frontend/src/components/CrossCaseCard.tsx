import React from 'react';
import { GitCompare, History, ExternalLink } from 'lucide-react';
import { CrossCaseTracingResult } from '../types';

interface CrossCaseCardProps {
  crossCase: CrossCaseTracingResult;
}

export const CrossCaseCard: React.FC<CrossCaseCardProps> = ({ crossCase }) => {
  if (!crossCase || !crossCase.alternative_source_found) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-indigo-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 bg-indigo-50/60 border-b border-indigo-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-700" />
          <h3 className="font-semibold text-indigo-950 text-sm">
            Cross-Case Precedent Origin Tracing
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
          Repository Multi-Source Match
        </span>
      </div>

      <div className="p-5 space-y-3.5">
        <p className="text-xs text-indigo-950 leading-relaxed font-medium">
          {crossCase.trace_summary}
        </p>

        {crossCase.all_matching_cases && crossCase.all_matching_cases.length > 0 && (
          <div className="rounded-lg border border-slate-200 overflow-hidden text-xs">
            <div className="bg-slate-100/70 px-3 py-2 font-semibold text-slate-700 grid grid-cols-12 gap-2">
              <span className="col-span-5">Case Title</span>
              <span className="col-span-3">Citation</span>
              <span className="col-span-2">Year</span>
              <span className="col-span-2 text-right">Alignment</span>
            </div>
            <div className="divide-y divide-slate-100">
              {crossCase.all_matching_cases.map((c, idx) => (
                <div key={idx} className="px-3 py-2.5 grid grid-cols-12 gap-2 items-center hover:bg-slate-50">
                  <span className="col-span-5 font-medium text-slate-800 truncate" title={c.title}>
                    {c.title}
                  </span>
                  <span className="col-span-3 text-slate-600 truncate">{c.citation || 'N/A'}</span>
                  <span className="col-span-2 font-mono text-slate-700">{c.year || 'Unknown'}</span>
                  <span className="col-span-2 text-right font-semibold text-indigo-700">
                    {Math.round((c.similarity || 0) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-[11px] text-slate-600 italic">
          Notice: Shows earliest matching authority discovered in the indexed repository. Does not presume to establish first-ever origin in global judicial history without unindexed archives.
        </div>
      </div>
    </div>
  );
};
