import React, { useState } from 'react';
import {
  FileCheck,
  Search,
  UploadCloud,
  Layers,
  Clock,
  BookOpen,
  BarChart3,
  ArrowRight,
  Sparkles,
  GitCompare,
  FileText,
  Dna,
  ShieldCheck,
  CheckCircle2,
  Paperclip,
  FileCode,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { SampleQuotePreset, VerifyQuoteRequest } from '../types';

interface DashboardWorkspaceProps {
  onVerify: (data: VerifyQuoteRequest, pdfFile?: File | null) => Promise<void>;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
  onSelectRecent: (preset: SampleQuotePreset) => void;
  onNavigateTab: (tab: string) => void;
  presets: SampleQuotePreset[];
}

export const DashboardWorkspace: React.FC<DashboardWorkspaceProps> = ({
  onVerify,
  loading,
  error,
  onClearError,
  onSelectRecent,
  onNavigateTab,
  presets,
}) => {
  // Form fields
  const [quote, setQuote] = useState(
    '"The right to life includes the right to live with dignity."'
  );
  const [caseName, setCaseName] = useState('Maneka Gandhi vs. Union of India');
  const [courtName, setCourtName] = useState('Supreme Court of India');
  const [citation, setCitation] = useState('AIR 1978 SC 597');
  const [judgmentUrl, setJudgmentUrl] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [demoFileAttached, setDemoFileAttached] = useState<boolean>(true);

  const handleUseDemo = () => {
    setQuote('"The right to life includes the right to live with dignity."');
    setCaseName('Maneka Gandhi vs. Union of India');
    setCourtName('Supreme Court of India');
    setCitation('AIR 1978 SC 597');
    setJudgmentUrl('');
    setDemoFileAttached(true);
    onClearError();
  };

  const handleToggleDemoFile = () => {
    setDemoFileAttached(!demoFileAttached);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote.trim()) return;

    onVerify(
      {
        quote: quote.trim(),
        case_name: caseName.trim() || undefined,
        court_name: courtName.trim() || undefined,
        citation: citation.trim() || undefined,
        judgment_url: judgmentUrl.trim() || undefined,
      },
      pdfFile
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPdfFile(file);
      setDemoFileAttached(false);
    }
  };

  const recentRows = [
    {
      id: '1',
      num: 1,
      quoteShort: 'Right to life includes the right to live...',
      fullQuote: 'The right to life includes the right to live with dignity.',
      caseName: 'Maneka Gandhi vs. Union of India',
      courtCase: 'SC / Maneka Gandhi',
      citation: 'AIR 1978 SC 597',
      court: 'Supreme Court of India',
      status: 'Exact Match',
      statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotClass: 'bg-emerald-500',
      date: '12 Sep 2025, 10:24 AM',
    },
    {
      id: '2',
      num: 2,
      quoteShort: 'Bail is the rule and jail is the exception...',
      fullQuote: 'Bail is the rule and jail is the exception in modern penal jurisprudence.',
      caseName: 'State of Rajasthan v. Balchand',
      courtCase: 'SC / Kalyan Chandra',
      citation: '1977 AIR 2447',
      court: 'Supreme Court of India',
      status: 'Modified Quote',
      statusClass: 'bg-amber-50 text-amber-700 border-amber-200',
      dotClass: 'bg-amber-500',
      date: '11 Sep 2025, 06:18 PM',
    },
    {
      id: '3',
      num: 3,
      quoteShort: 'Doctrine of basic structure...',
      fullQuote: 'Parliament cannot alter the basic structure or essential framework of the Constitution.',
      caseName: 'Kesavananda Bharati v. State of Kerala',
      courtCase: 'SC / Kesavananda Bharati',
      citation: '(1973) 4 SCC 225',
      court: 'Supreme Court of India',
      status: 'Context Mismatch',
      statusClass: 'bg-rose-50 text-rose-700 border-rose-200',
      dotClass: 'bg-rose-500',
      date: '10 Sep 2025, 02:32 PM',
    },
    {
      id: '4',
      num: 4,
      quoteShort: 'Every citizen has a right to privacy...',
      fullQuote: 'Every citizen has a right to privacy extending to commercial espionage.',
      caseName: 'Justice K.S. Puttaswamy v. Union of India',
      courtCase: '—',
      citation: '(2017) 10 SCC 1',
      court: 'Supreme Court of India',
      status: 'Source Not Found',
      statusClass: 'bg-blue-50 text-blue-700 border-blue-200',
      dotClass: 'bg-blue-500',
      date: '09 Sep 2025, 11:07 AM',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Hero Banner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-50/80 via-blue-50/40 to-indigo-100/50 border border-indigo-100/80 p-6 sm:p-7">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
              AI POWERED LEGAL VERIFICATION
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Verify Legal Quotes.<br />
              <span className="text-indigo-600">Get Real Evidence.</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-xl">
              Check the authenticity of legal quotations with AI, backed by real judgments, trusted sources and transparent evidence.
            </p>

            {/* 4 Feature Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200/80 text-[11px] font-semibold text-slate-700 shadow-2xs">
                <FileCheck size={12} className="text-indigo-600" />
                <span>Source Verification</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200/80 text-[11px] font-semibold text-slate-700 shadow-2xs">
                <GitCompare size={12} className="text-indigo-600" />
                <span>Word-level Comparison</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200/80 text-[11px] font-semibold text-slate-700 shadow-2xs">
                <Dna size={12} className="text-indigo-600" />
                <span>Quote DNA</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200/80 text-[11px] font-semibold text-slate-700 shadow-2xs">
                <FileText size={12} className="text-indigo-600" />
                <span>Evidence Reports</span>
              </span>
            </div>
          </div>

          {/* Right Side 3D Graphic Cards Illustration */}
          <div className="lg:col-span-4 hidden sm:flex justify-center lg:justify-end relative">
            <div className="relative w-48 h-36">
              {/* White Sheet */}
              <div className="absolute top-1 right-3 w-36 h-28 rounded-xl bg-white border border-slate-200/80 shadow-md p-3 space-y-2 transform rotate-3">
                <div className="h-1.5 w-16 bg-slate-200 rounded"></div>
                <div className="h-1.5 w-24 bg-slate-100 rounded"></div>
                <div className="h-1.5 w-20 bg-slate-100 rounded"></div>
              </div>

              {/* Blue scale icon sheet */}
              <div className="absolute top-4 right-1 w-24 h-24 rounded-xl bg-indigo-600 text-white shadow-lg p-2.5 flex items-center justify-center transform -rotate-6">
                <ShieldCheck size={36} className="text-white/90" />
              </div>

              {/* Floating Verified Badge */}
              <div className="absolute top-2 left-0 bg-white border border-emerald-200 shadow-md rounded-full px-2.5 py-1 flex items-center gap-1.5 text-[10px] font-bold text-emerald-700">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Verify a Legal Quote Form Card */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <FileCheck size={18} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Verify a Legal Quote</h2>
              <p className="text-xs text-slate-500">
                Enter the details below to verify a legal quotation against authentic sources.
              </p>
            </div>
          </div>

          {/* Use Demo button */}
          <button
            type="button"
            onClick={handleUseDemo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/70 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <Sparkles size={13} className="text-indigo-600" />
            <span>Use Demo</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
            <button onClick={onClearError} className="hover:text-rose-900 cursor-pointer">
              <X size={14} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Legal Quotation <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    maxLength={1000}
                    placeholder='"The right to life includes the right to live with dignity."'
                    className="w-full p-3 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-serif"
                    required
                  />
                  <span className="absolute bottom-2.5 right-3 text-[10px] text-slate-400">
                    {quote.length}/1000
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Case / Judgment Name <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={caseName}
                  onChange={(e) => setCaseName(e.target.value)}
                  placeholder="e.g. Maneka Gandhi vs. Union of India"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Court Name <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={courtName}
                  onChange={(e) => setCourtName(e.target.value)}
                  placeholder="e.g. Supreme Court of India"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Right Column Form Fields */}
            <div className="space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Case Citation <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={citation}
                    onChange={(e) => setCitation(e.target.value)}
                    placeholder="e.g. AIR 1978 SC 597"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judgment URL <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={judgmentUrl}
                    onChange={(e) => setJudgmentUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Upload Judgment PDF <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 rounded-xl hover:border-indigo-400 bg-slate-50/70 cursor-pointer transition-all">
                    <UploadCloud size={20} className="text-indigo-600 mb-1" />
                    <span className="text-xs font-medium text-slate-600">
                      {pdfFile ? pdfFile.name : 'Drag & drop or click to upload PDF (max 10MB)'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Bottom Row with Demo File & Verify Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleDemoFile}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 text-indigo-700 font-bold text-xs hover:bg-indigo-50/70 transition-colors cursor-pointer"
              >
                <Paperclip size={14} />
                <span>Choose Demo File</span>
              </button>

              {demoFileAttached && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200/80 text-[11px] text-slate-700 font-medium">
                  <FileText size={14} className="text-indigo-600" />
                  <span className="font-semibold text-slate-900">Sample_Judgment.pdf</span>
                  <span className="text-slate-400">(2.4 MB)</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Search size={14} />
                  <span>Verify Quote &rarr;</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Recent Verifications Table Card */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Recent Verifications</h3>
          <button
            onClick={() => onNavigateTab('history')}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Quote (short)</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Court / Case</th>
                <th className="py-2.5 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => {
                    setQuote(row.fullQuote);
                    setCaseName(row.caseName);
                    setCourtName(row.court);
                    setCitation(row.citation);
                  }}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-3 text-slate-400 font-mono">{row.num}</td>
                  <td className="py-3 px-3 font-medium text-slate-800 group-hover:text-indigo-600 max-w-xs truncate">
                    {row.quoteShort}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${row.statusClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${row.dotClass}`}></span>
                      <span>{row.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{row.courtCase}</td>
                  <td className="py-3 px-3 text-slate-400">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
