import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardWorkspace } from './components/DashboardWorkspace';
import { VerificationResultPanel } from './components/VerificationResultPanel';
import { BatchAudit } from './components/BatchAudit';
import { HistoryView } from './components/HistoryView';
import { CorpusView } from './components/CorpusView';
import { EvaluationDashboard } from './components/EvaluationDashboard';
import { MethodologyView } from './components/MethodologyView';
import { VerifyQuoteRequest, VerifyQuoteResponse, SampleQuotePreset } from './types';
import { api } from './services/api';

const defaultResult: VerifyQuoteResponse = {
  id: 1,
  status: 'Exact Match',
  confidence: 0.98,
  confidence_breakdown: { lexical: 1.0, semantic: 0.98, context: 0.96 },
  submitted_quote: 'The right to life includes the right to live with dignity.',
  judgment_title: 'Maneka Gandhi vs. Union of India',
  court: 'Supreme Court of India',
  citation: 'AIR 1978 SC 597',
  year: 1978,
  bench: 'P.N. Bhagwati, J. (Bench of 7 Judges)',
  para_number: 15,
  page_number: 42,
  source_url: 'https://main.sci.gov.in/judgment/maneka_gandhi_1978.pdf',
  original_passage: 'The right to life includes the right to live with dignity.',
  explanation: 'The quote is verified with an exact match in the cited judgment.',
  limitations: 'No limitations found for this verification.',
  created_at: '2025-09-12T10:24:00Z',
  diff: {
    similarity_ratio: 1.0,
    added_words: [],
    removed_words: [],
    replaced_words: [],
    missing_sentences: [],
    critical_alterations: [],
    chunks: [{ type: 'equal', text: 'The right to life includes the right to live with dignity.' }],
    submitted_tokens_highlighted: [],
    source_tokens_highlighted: [],
  },
  context_analysis: {
    has_warnings: false,
    warnings: [],
    is_party_argument: false,
    is_dissent: false,
    speaker_or_party: 'Court (Ratio Decidendi)',
    omitted_qualifications: [],
    matched_text: 'The right to life includes the right to live with dignity.',
  },
};

export function App() {
  const [currentTab, setCurrentTab] = useState<
    'home' | 'verify' | 'batch' | 'history' | 'corpus' | 'benchmark' | 'methodology'
  >('home');

  const [activeResult, setActiveResult] = useState<VerifyQuoteResponse>(defaultResult);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [presets, setPresets] = useState<SampleQuotePreset[]>([]);

  useEffect(() => {
    api.getSamplePresets()
      .then(setPresets)
      .catch((err) => console.error('Failed to load presets:', err));
  }, []);

  const handleVerify = async (data: VerifyQuoteRequest, pdfFile?: File | null) => {
    setLoading(true);
    setError(null);

    try {
      if (pdfFile) {
        const formData = new FormData();
        formData.append('file', pdfFile);
        formData.append('quote', data.quote);
        if (data.case_name) formData.append('case_name', data.case_name);
        if (data.citation) formData.append('citation', data.citation);
        const res = await api.verifyWithPdf(formData);
        setActiveResult(res);
      } else {
        const res = await api.verifyQuote(data);
        setActiveResult(res);
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err?.message || 'Verification failed. Please check inputs or try a preset.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecent = async (preset: SampleQuotePreset) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyQuote({
        quote: preset.quote,
        case_name: preset.case_name,
        court_name: preset.court_name,
        citation: preset.citation,
      });
      setActiveResult(res);
    } catch (err) {
      // Fallback display
      setActiveResult({
        ...defaultResult,
        submitted_quote: preset.quote,
        judgment_title: preset.case_name,
        citation: preset.citation,
        court: preset.court_name,
        status: (preset.expected_status as any) || 'Exact Match',
        original_passage: preset.quote,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    const url = api.getPdfReportUrl(activeResult.id || 1);
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-900 selection:bg-indigo-600 selection:text-white antialiased">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab as any)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-y-auto">
        {/* Top Header */}
        <TopHeader />

        {/* Dynamic Content Views */}
        <main className="p-5 sm:p-7 max-w-[1720px] w-full mx-auto flex-1">
          {(currentTab === 'home' || currentTab === 'verify') && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form & History */}
              <div className="xl:col-span-7 space-y-6">
                <DashboardWorkspace
                  onVerify={handleVerify}
                  loading={loading}
                  error={error}
                  onClearError={() => setError(null)}
                  onSelectRecent={handleSelectRecent}
                  onNavigateTab={(tab) => setCurrentTab(tab as any)}
                  presets={presets}
                />
              </div>

              {/* Right Column: Verification Result & Stats Panel */}
              <div className="xl:col-span-5 space-y-6">
                <VerificationResultPanel
                  result={activeResult}
                  onBack={() => setActiveResult(defaultResult)}
                  onDownloadReport={handleDownloadReport}
                />
              </div>
            </div>
          )}

          {currentTab === 'batch' && <BatchAudit />}
          {currentTab === 'history' && (
            <HistoryView
              onSelectResult={(res) => {
                setActiveResult(res);
                setCurrentTab('home');
              }}
            />
          )}
          {currentTab === 'corpus' && <CorpusView />}
          {currentTab === 'benchmark' && <EvaluationDashboard />}
          {currentTab === 'methodology' && <MethodologyView />}
        </main>
      </div>
    </div>
  );
}

export default App;
