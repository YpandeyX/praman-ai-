import React, { useState, useEffect } from 'react';
import {
  Search,
  UploadCloud,
  FileText,
  Sparkles,
  Scale,
  Loader2,
  AlertCircle,
  FileCheck,
  X,
} from 'lucide-react';
import { VerifyQuoteRequest, VerifyQuoteResponse, SampleQuotePreset } from '../types';
import { api } from '../services/api';
import { ResultView } from './ResultView';

export const VerifyWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'text' | 'pdf'>('text');
  
  // Form fields
  const [quote, setQuote] = useState('');
  const [caseName, setCaseName] = useState('');
  const [citation, setCitation] = useState('');
  const [courtName, setCourtName] = useState('Supreme Court of India');
  const [judgmentUrl, setJudgmentUrl] = useState('');

  // PDF Upload
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Presets
  const [presets, setPresets] = useState<SampleQuotePreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  // Execution state
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyQuoteResponse | null>(null);

  useEffect(() => {
    api.getSamplePresets()
      .then(setPresets)
      .catch((err) => console.error('Failed to load presets:', err));
  }, []);

  const handleApplyPreset = (preset: SampleQuotePreset) => {
    setSelectedPresetId(preset.id);
    setQuote(preset.quote);
    setCaseName(preset.case_name);
    setCitation(preset.citation);
    setCourtName(preset.court_name);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError('Please upload an authoritative PDF judgment document.');
        return;
      }
      setPdfFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote.trim() || quote.trim().length < 5) {
      setError('Please enter a quotation of at least 5 characters to verify.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (activeTab === 'pdf') {
        if (!pdfFile) {
          setError('Please select a PDF judgment file to upload.');
          setLoading(false);
          return;
        }
        setLoadingStep('Extracting PDF text with PyMuPDF...');
        const formData = new FormData();
        formData.append('quote', quote.trim());
        if (caseName) formData.append('case_name', caseName.trim());
        if (citation) formData.append('citation', citation.trim());
        if (courtName) formData.append('court_name', courtName.trim());
        formData.append('file', pdfFile);

        const res = await api.verifyWithPdf(formData);
        setResult(res);
      } else {
        setLoadingStep('Normalizing quote and searching landmark judgment index...');
        const payload: VerifyQuoteRequest = {
          quote: quote.trim(),
          case_name: caseName.trim() || undefined,
          citation: citation.trim() || undefined,
          court_name: courtName.trim() || undefined,
          judgment_url: judgmentUrl.trim() || undefined,
        };
        const res = await api.verifyQuote(payload);
        setResult(res);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  if (result) {
    return <ResultView result={result} onReset={handleReset} />;
  }

  return (
    <div className="space-y-6">
      {/* 1-Click Interactive Presets Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} className="text-indigo-600" />
            1-Click Interactive Test Presets (Instant Demonstration)
          </span>
          <span className="text-[11px] text-slate-600">Select any scenario below:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className={`text-xs px-3 py-1.5 rounded-lg border text-left transition-all ${
                selectedPresetId === preset.id
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold shadow-xs ring-1 ring-indigo-400'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="font-medium">{preset.label}</div>
              <div className="text-[10px] text-slate-600 mt-0.5">{preset.expected_status}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Workspace Mode Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 px-6 py-3.5 border-b-2 transition-all ${
              activeTab === 'text'
                ? 'border-indigo-600 text-indigo-600 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Search size={14} />
            Verify against Indexed Judgments
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center gap-2 px-6 py-3.5 border-b-2 transition-all ${
              activeTab === 'pdf'
                ? 'border-indigo-600 text-indigo-600 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <UploadCloud size={14} />
            Verify against Uploaded Judgment PDF (PyMuPDF)
          </button>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Quote Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              Legal Quotation to Verify <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Paste the judicial quotation, excerpt, or legal proposition to be verified..."
              rows={4}
              required
              className="w-full text-sm rounded-lg border border-slate-300 p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-serif"
            />
            <div className="flex justify-between text-[11px] text-slate-600">
              <span>Enter full or partial sentence attributed to a court judgment.</span>
              <span>{quote.length} characters</span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Case / Judgment Name
              </label>
              <input
                type="text"
                value={caseName}
                onChange={(e) => setCaseName(e.target.value)}
                placeholder="e.g. Kesavananda Bharati"
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Citation (if known)
              </label>
              <input
                type="text"
                value={citation}
                onChange={(e) => setCitation(e.target.value)}
                placeholder="e.g. (1973) 4 SCC 225"
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Court Name
              </label>
              <input
                type="text"
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
                placeholder="e.g. Supreme Court of India"
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Source URL (optional)
              </label>
              <input
                type="url"
                value={judgmentUrl}
                onChange={(e) => setJudgmentUrl(e.target.value)}
                placeholder="https://..."
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* PDF Upload File Area if activeTab === 'pdf' */}
          {activeTab === 'pdf' && (
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                Upload Judgment PDF for Text Extraction <span className="text-rose-500">*</span>
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
                {pdfFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileCheck className="w-8 h-8 text-emerald-600" />
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900">{pdfFile.name}</div>
                      <div className="text-[11px] text-slate-600">
                        {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for PyMuPDF extraction
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPdfFile(null)}
                      className="p-1 rounded-full text-slate-600 hover:text-rose-600 hover:bg-slate-200"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <UploadCloud className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-700 font-medium">
                      Drag and drop your court judgment PDF here, or click to browse
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Supports full Indian court judgments and orders up to 25 MB
                    </p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="pdf-upload-input"
                    />
                    <label
                      htmlFor="pdf-upload-input"
                      className="mt-3 inline-block cursor-pointer px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                    >
                      Select PDF File
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
              <Scale size={13} className="text-indigo-600" />
              <span>Grounded in actual source text — no unsupported LLM opinions.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>{loadingStep || 'Verifying Quotation...'}</span>
                </>
              ) : (
                <>
                  <Search size={15} />
                  <span>Verify Legal Quotation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
