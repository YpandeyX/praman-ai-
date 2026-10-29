import React, { useState } from 'react';
import { X, Copy, Check, Scale, ZoomIn, ZoomOut, Maximize2, ShieldCheck, Download } from 'lucide-react';
import { VerifyQuoteResponse } from '../types';
import { StatusBadge } from './StatusBadge';
import { api } from '../services/api';

interface CourtroomModalProps {
  result: VerifyQuoteResponse;
  onClose: () => void;
}

export const CourtroomModal: React.FC<CourtroomModalProps> = ({ result, onClose }) => {
  const [fontSize, setFontSize] = useState<number>(18);
  const [copied, setCopied] = useState(false);

  const handleCopyBenchCite = () => {
    const text = `Per ${result.court || 'Supreme Court of India'} in ${result.judgment_title || 'Reported Decision'} (${result.citation || 'Official Citation'}), Para ${result.para_number || 'N/A'}: "${result.original_passage}"`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col text-slate-100 p-4 sm:p-6 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
            <Scale size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold tracking-wide uppercase text-amber-400">
                Courtroom Oral Argument Mode
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                PIN-Point Presentation
              </span>
            </div>
            <p className="text-xs text-slate-400">
              High-contrast, dual-pane comparative layout optimized for bench presentation.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setFontSize(Math.max(14, fontSize - 2))}
              className="p-1 rounded text-slate-400 hover:text-white"
              title="Decrease Font Size"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-xs font-mono px-2 text-slate-300">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(26, fontSize + 2))}
              className="p-1 rounded text-slate-400 hover:text-white"
              title="Increase Font Size"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          <button
            onClick={handleCopyBenchCite}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors shadow-xs"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Citation Copied!' : 'Copy PIN-Cite for Bench'}
          </button>

          {result.id && (
            <button
              onClick={() => window.open(api.getPdfReportUrl(result.id!), '_blank')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download size={14} />
              PDF Certificate
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors ml-2"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Case Header Banner */}
      <div className="py-3 px-4 bg-slate-900/80 rounded-xl my-4 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <StatusBadge status={result.status} size="md" />
          <span className="font-bold text-slate-200 text-sm">
            {result.judgment_title || 'Authority Record'}
          </span>
          {result.citation && (
            <span className="font-mono text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
              {result.citation}
            </span>
          )}
          {result.para_number && (
            <span className="text-slate-300 font-bold bg-slate-800 px-2 py-0.5 rounded">
              Para {result.para_number}
            </span>
          )}
        </div>

        <div className="text-slate-400">
          Confidence Alignment: <b className="text-white">{Math.round(result.confidence * 100)}%</b>
        </div>
      </div>

      {/* Main Comparative Presentation Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-1">
        {/* Left: Submitted Quotation */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Submitted Brief Excerpt</span>
              <span className="text-slate-500 font-mono">Opposing Counsel / Draft</span>
            </div>

            <p
              className="font-serif italic leading-relaxed text-slate-200"
              style={{ fontSize: `${fontSize}px` }}
            >
              "{result.submitted_quote}"
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>Length: {result.submitted_quote.split(' ').length} words</span>
            {result.diff?.critical_alterations && result.diff.critical_alterations.length > 0 && (
              <span className="text-rose-400 font-bold">
                ⚠️ {result.diff.critical_alterations.length} Critical Modal Shift(s)
              </span>
            )}
          </div>
        </div>

        {/* Right: Authentic Supreme Court Record */}
        <div className="bg-emerald-950/20 rounded-2xl border border-emerald-800/60 p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} />
                Authentic Judicial Passage
              </span>
              <span className="font-mono text-emerald-300">
                {result.court || 'Supreme Court of India'}
              </span>
            </div>

            <p
              className="font-serif italic leading-relaxed text-emerald-100"
              style={{ fontSize: `${fontSize}px` }}
            >
              "{result.original_passage || 'No matching passage located in official record.'}"
            </p>
          </div>

          <div className="pt-4 border-t border-emerald-800/60 text-xs text-emerald-300 flex items-center justify-between">
            <span>
              Official Paragraph: <b>Para {result.para_number || 'N/A'}</b>
            </span>
            <span className="font-semibold">Ratio Decidendi Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
