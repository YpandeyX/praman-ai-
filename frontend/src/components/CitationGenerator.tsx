import React, { useState, useEffect } from 'react';
import { Copy, Check, Quote, BookOpen, Layers } from 'lucide-react';
import { api } from '../services/api';
import { CitationFormatResponse } from '../types';

interface CitationGeneratorProps {
  judgmentTitle: string;
  citation?: string;
  court?: string;
  year?: number;
  paraNumber?: number;
  pageNumber?: number;
  quoteText?: string;
}

export const CitationGenerator: React.FC<CitationGeneratorProps> = ({
  judgmentTitle,
  citation,
  court,
  year,
  paraNumber,
  pageNumber,
  quoteText,
}) => {
  const [activeFormat, setActiveFormat] = useState<'scc' | 'air' | 'neutral_insc' | 'bluebook' | 'pleading_blockquote'>('scc');
  const [citations, setCitations] = useState<CitationFormatResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    api.formatCitations({
      judgment_title: judgmentTitle,
      citation,
      court,
      year,
      para_number: paraNumber,
      page_number: pageNumber,
      quote_text: quoteText,
    })
      .then(setCitations)
      .catch((err) => console.error(err));
  }, [judgmentTitle, citation, paraNumber, pageNumber, quoteText]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!citations) return null;

  const formats = [
    { key: 'scc', label: 'SCC Style', text: citations.scc },
    { key: 'air', label: 'AIR Reporter', text: citations.air },
    { key: 'neutral_insc', label: 'Neutral INSC', text: citations.neutral_insc },
    { key: 'bluebook', label: 'Bluebook / Academic', text: citations.bluebook },
    { key: 'pleading_blockquote', label: 'Court Pleading Blockquote', text: citations.pleading_blockquote },
  ];

  const currentFormatted = citations[activeFormat];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Quote className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
            Multi-Standard Citation Generator
          </h4>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Pin-Point Paragraph Citations for Indian Courts
        </span>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
        {formats.map((fmt) => (
          <button
            key={fmt.key}
            onClick={() => setActiveFormat(fmt.key as any)}
            className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeFormat === fmt.key
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {fmt.label}
          </button>
        ))}
      </div>

      {/* Formatted Code Box */}
      <div className="relative p-4 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
        <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
          {currentFormatted}
        </pre>

        <button
          onClick={() => handleCopy(currentFormatted, activeFormat)}
          className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs transition-all"
        >
          {copiedKey === activeFormat ? (
            <>
              <Check size={13} className="text-emerald-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy Citation</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
