import React, { useState } from 'react';
import { Wand2, Check, Copy, Sparkles, AlertCircle, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { HarmonizeQuoteResponse } from '../types';

interface QuoteHarmonizerProps {
  submittedQuote: string;
  originalPassage: string;
}

export const QuoteHarmonizer: React.FC<QuoteHarmonizerProps> = ({
  submittedQuote,
  originalPassage,
}) => {
  const [harmonized, setHarmonized] = useState<HarmonizeQuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleHarmonize = async () => {
    setLoading(true);
    try {
      const res = await api.harmonizeQuote(submittedQuote, originalPassage);
      setHarmonized(res);
      setIsOpen(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (harmonized) {
      navigator.clipboard.writeText(`"${harmonized.harmonized_quote}"`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
            Quote Harmonizer & Judicial Ellipsis Formatter
          </h4>
        </div>

        {!isOpen ? (
          <button
            onClick={handleHarmonize}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Harmonizing...</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span>Sanitize & Harmonize Quote</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => setIsOpen(false)}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-semibold"
          >
            Collapse Harmonizer
          </button>
        )}
      </div>

      {!isOpen ? (
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Transform altered or paraphrased quotations into strictly compliant legal excerpts employing Supreme Court ellipses <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-amber-700 dark:text-amber-300 font-mono text-[11px]">[...]</code> and bracketed annotations.
        </p>
      ) : harmonized ? (
        <div className="space-y-4 pt-1">
          {/* Output Card */}
          <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={15} />
                Canonically Harmonized Quotation (Court-Ready)
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied!' : 'Copy Harmonized Quote'}
              </button>
            </div>

            <p className="font-serif italic text-sm text-slate-900 dark:text-slate-100 leading-relaxed pt-1">
              "{harmonized.harmonized_quote}"
            </p>
          </div>

          {/* Corrections Applied List */}
          {harmonized.corrections_applied.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Corrections Applied ({harmonized.total_corrections}):
              </span>
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                {harmonized.corrections_applied.map((c, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-amber-600 shrink-0">•</span>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
            {harmonized.legal_advisory}
          </div>
        </div>
      ) : null}
    </div>
  );
};
