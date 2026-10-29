import {
  VerifyQuoteRequest,
  VerifyQuoteResponse,
  BatchVerifyResponse,
  JudgmentOut,
  SampleQuotePreset,
  EvaluationReportResponse,
} from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'https://praman-ai-dlpx.onrender.com/api').replace(/\/$/, '');

export const api = {
  async verifyQuote(payload: VerifyQuoteRequest): Promise<VerifyQuoteResponse> {
    const res = await fetch(`${API_BASE}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Verification failed' }));
      throw new Error(err.detail || 'Failed to verify quotation');
    }
    return res.json();
  },

  async verifyWithPdf(formData: FormData): Promise<VerifyQuoteResponse> {
    const res = await fetch(`${API_BASE}/verify/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload verification failed' }));
      throw new Error(err.detail || 'Failed to verify uploaded PDF');
    }
    return res.json();
  },

  async verifyBatch(quotes: VerifyQuoteRequest[], jobName?: string): Promise<BatchVerifyResponse> {
    const res = await fetch(`${API_BASE}/verify/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_name: jobName || 'Batch Audit', quotes }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Batch verification failed' }));
      throw new Error(err.detail || 'Failed to run batch verification');
    }
    return res.json();
  },

  async getSources(): Promise<JudgmentOut[]> {
    const res = await fetch(`${API_BASE}/sources`);
    if (!res.ok) throw new Error('Failed to fetch judgment sources');
    return res.json();
  },

  async getSourceDetail(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/sources/${id}`);
    if (!res.ok) throw new Error('Failed to fetch judgment detail');
    return res.json();
  },

  async getSamplePresets(): Promise<SampleQuotePreset[]> {
    const res = await fetch(`${API_BASE}/sources/presets/sample-quotes`);
    if (!res.ok) throw new Error('Failed to fetch sample presets');
    return res.json();
  },

  async getHistory(status?: string, search?: string): Promise<VerifyQuoteResponse[]> {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/history?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  async deleteHistoryItem(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/history/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete history record');
  },

  async clearAllHistory(): Promise<void> {
    const res = await fetch(`${API_BASE}/history`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to clear history');
  },

  async runEvaluation(): Promise<EvaluationReportResponse> {
    const res = await fetch(`${API_BASE}/evaluation/run`);
    if (!res.ok) throw new Error('Failed to execute evaluation benchmark');
    return res.json();
  },

  getPdfReportUrl(recordId: number): string {
    return `${API_BASE}/reports/${recordId}/pdf`;
  },

  async formatCitations(payload: any): Promise<any> {
    const res = await fetch(`${API_BASE}/advanced/citations/format`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to format citation');
    return res.json();
  },

  async harmonizeQuote(submittedQuote: string, originalPassage: string): Promise<any> {
    const res = await fetch(`${API_BASE}/advanced/harmonize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submitted_quote: submittedQuote,
        original_passage: originalPassage,
      }),
    });
    if (!res.ok) throw new Error('Failed to harmonize quotation');
    return res.json();
  },

  async getDoctrineTimeline(caseName: string): Promise<any> {
    const res = await fetch(`${API_BASE}/advanced/timeline/${encodeURIComponent(caseName)}`);
    if (!res.ok) throw new Error('Failed to fetch doctrine timeline');
    return res.json();
  },

  async scanBrief(documentText: string): Promise<any> {
    const res = await fetch(`${API_BASE}/advanced/scan-brief`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_text: documentText }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to scan brief' }));
      throw new Error(err.detail || 'Brief scanning failed');
    }
    return res.json();
  },
};
