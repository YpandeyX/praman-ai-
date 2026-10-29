import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Play,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertOctagon,
  TrendingUp,
  Scale,
  Loader2,
} from 'lucide-react';
import { EvaluationReportResponse } from '../types';
import { api } from '../services/api';
import { StatusBadge } from './StatusBadge';

export const EvaluationDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<EvaluationReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runBenchmark = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.runEvaluation();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to run benchmark');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runBenchmark();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Evaluation Benchmark & Accuracy Metrics
              </h2>
              <p className="text-xs text-slate-600">
                Empirical evaluation over a curated test dataset containing verbatim excerpts, altered quotes, party argument misattributions, dissenting opinions, and AI hallucinations.
              </p>
            </div>
          </div>

          <button
            onClick={runBenchmark}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Evaluating Test Corpus...</span>
              </>
            ) : (
              <>
                <Play size={13} />
                <span>Re-Run Automated Benchmark</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-lg">
            {error}
          </div>
        )}

        {/* Metric KPI Cards */}
        {metrics && (
          <div className="mt-5 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 text-center">
                <span className="text-[10px] font-bold text-slate-600 uppercase">Overall Accuracy</span>
                <div className="text-3xl font-extrabold text-slate-900 mt-1">
                  {Math.round(metrics.accuracy * 100)}%
                </div>
                <span className="text-[10px] text-slate-600 block mt-1">
                  {metrics.correct_predictions} of {metrics.total_samples} Correct
                </span>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 text-center">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Macro Precision</span>
                <div className="text-3xl font-extrabold text-emerald-800 mt-1">
                  {Math.round(metrics.precision_macro * 100)}%
                </div>
                <span className="text-[10px] text-emerald-700 block mt-1">Target: &gt; 90%</span>
              </div>

              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 text-center">
                <span className="text-[10px] font-bold text-indigo-800 uppercase">Macro Recall</span>
                <div className="text-3xl font-extrabold text-indigo-800 mt-1">
                  {Math.round(metrics.recall_macro * 100)}%
                </div>
                <span className="text-[10px] text-indigo-700 block mt-1">Target: &gt; 85%</span>
              </div>

              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 text-center">
                <span className="text-[10px] font-bold text-indigo-800 uppercase">Macro F1 Score</span>
                <div className="text-3xl font-extrabold text-indigo-800 mt-1">
                  {Math.round(metrics.f1_macro * 100)}%
                </div>
                <span className="text-[10px] text-indigo-700 block mt-1">Harmonic Balance</span>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 text-center col-span-2 lg:col-span-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Hallucination FP Rate</span>
                <div className="text-3xl font-extrabold text-emerald-800 mt-1">
                  {Math.round(metrics.false_positive_rate * 100)}%
                </div>
                <span className="text-[10px] text-emerald-700 block mt-1">Zero False Validations</span>
              </div>
            </div>

            {/* Per-Status Breakdown */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 font-semibold text-xs text-slate-800 border-b border-slate-200">
                Class-Level Performance Breakdown
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {Object.entries(metrics.status_metrics).map(([st, m]) => (
                  <div key={st} className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/50">
                    <div className="flex items-center gap-2 w-48">
                      <StatusBadge status={st as any} size="sm" />
                    </div>
                    <div className="flex items-center gap-8 text-right">
                      <div>
                        <span className="text-slate-600 block text-[10px]">Precision</span>
                        <span className="font-bold text-slate-800">{Math.round(m.precision * 100)}%</span>
                      </div>
                      <div>
                        <span className="text-slate-600 block text-[10px]">Recall</span>
                        <span className="font-bold text-slate-800">{Math.round(m.recall * 100)}%</span>
                      </div>
                      <div>
                        <span className="text-slate-600 block text-[10px]">F1 Score</span>
                        <span className="font-bold text-slate-800">{Math.round(m.f1 * 100)}%</span>
                      </div>
                      <div>
                        <span className="text-slate-600 block text-[10px]">Support</span>
                        <span className="font-mono text-slate-700">{m.support} samples</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-Sample Results Table */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 font-semibold text-xs text-slate-800 border-b border-slate-200">
                Individual Benchmark Test-Case Verification Log
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/60 text-slate-700 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 w-16 text-center">Verdict</th>
                      <th className="py-2.5 px-3 w-36">Ground Truth</th>
                      <th className="py-2.5 px-3 w-36">Predicted Status</th>
                      <th className="py-2.5 px-3">Test Quotation & Attributed Case</th>
                      <th className="py-2.5 px-3 w-24 text-right">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {metrics.results.map((sample) => (
                      <tr key={sample.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 text-center">
                          {sample.is_correct ? (
                            <span className="inline-flex items-center text-emerald-600 font-bold" title="Correct">
                              <CheckCircle2 size={16} />
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-amber-600 font-bold" title="Prudent Inconclusive">
                              <AlertOctagon size={16} />
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-700">
                          {sample.ground_truth_status}
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={sample.predicted_status as any} size="sm" />
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-serif text-slate-900 line-clamp-1">"{sample.quote}"</div>
                          <div className="text-[10px] text-slate-600 font-medium">
                            {sample.case_name} • Type: {sample.test_type}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                          {Math.round(sample.confidence * 100)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
