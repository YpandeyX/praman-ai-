import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Flame } from 'lucide-react';
import { VerificationStatus, DiffSummary, ContextIntegrityResult } from '../types';

interface RiskRadarProps {
  status: VerificationStatus;
  confidence: number;
  diff?: DiffSummary;
  contextAnalysis?: ContextIntegrityResult;
}

export const RiskRadar: React.FC<RiskRadarProps> = ({
  status,
  confidence,
  diff,
  contextAnalysis,
}) => {
  // Compute risk scores (0 - 100%)
  let alterationRisk = 0;
  if (status === 'Modified Quote') {
    alterationRisk = Math.min(100, Math.round((1 - (diff?.similarity_ratio || 0.7)) * 250));
    if (diff?.critical_alterations && diff.critical_alterations.length > 0) {
      alterationRisk = Math.max(alterationRisk, 85);
    }
  } else if (status === 'Exact Match') {
    alterationRisk = 0;
  } else if (status === 'Source Not Found') {
    alterationRisk = 95;
  } else {
    alterationRisk = 50;
  }

  let attributionRisk = 0;
  if (contextAnalysis?.is_party_argument) {
    attributionRisk = 92;
  } else if (contextAnalysis?.is_dissent) {
    attributionRisk = 78;
  } else if (status === 'Exact Match') {
    attributionRisk = 0;
  } else {
    attributionRisk = 20;
  }

  let contextOmissionRisk = 0;
  if (contextAnalysis?.omitted_qualifications && contextAnalysis.omitted_qualifications.length > 0) {
    contextOmissionRisk = 88;
  } else if (diff?.missing_sentences && diff.missing_sentences.length > 0) {
    contextOmissionRisk = 65;
  } else {
    contextOmissionRisk = 5;
  }

  let hallucinationLikelihood = 0;
  if (status === 'Source Not Found') {
    hallucinationLikelihood = 90;
  } else if (status === 'Inconclusive') {
    hallucinationLikelihood = 45;
  } else {
    hallucinationLikelihood = 0;
  }

  const getRiskColor = (val: number) => {
    if (val < 25) return 'bg-emerald-500';
    if (val < 60) return 'bg-amber-500';
    return 'bg-rose-600';
  };

  const getRiskTextColor = (val: number) => {
    if (val < 25) return 'text-emerald-700 dark:text-emerald-400';
    if (val < 60) return 'text-amber-700 dark:text-amber-400';
    return 'text-rose-700 dark:text-rose-400';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
            Legal Citation Risk Matrix
          </h4>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          Composite Vulnerability Assessment
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 dark:text-slate-400">Textual Alteration</span>
            <span className={`font-bold ${getRiskTextColor(alterationRisk)}`}>{alterationRisk}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getRiskColor(alterationRisk)}`}
              style={{ width: `${alterationRisk}%` }}
            ></div>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            {alterationRisk > 60 ? 'High word substitution shift' : 'Low / no wording variance'}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 dark:text-slate-400">Attribution Conflation</span>
            <span className={`font-bold ${getRiskTextColor(attributionRisk)}`}>{attributionRisk}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getRiskColor(attributionRisk)}`}
              style={{ width: `${attributionRisk}%` }}
            ></div>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            {attributionRisk > 60 ? 'Counsel argument / dissent alert' : 'Authoritative judicial ratio'}
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 dark:text-slate-400">Context Omission</span>
            <span className={`font-bold ${getRiskTextColor(contextOmissionRisk)}`}>
              {contextOmissionRisk}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getRiskColor(contextOmissionRisk)}`}
              style={{ width: `${contextOmissionRisk}%` }}
            ></div>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            {contextOmissionRisk > 60 ? 'Statutory caveats stripped' : 'Context intact'}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 dark:text-slate-400">Hallucination Risk</span>
            <span className={`font-bold ${getRiskTextColor(hallucinationLikelihood)}`}>
              {hallucinationLikelihood}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getRiskColor(hallucinationLikelihood)}`}
              style={{ width: `${hallucinationLikelihood}%` }}
            ></div>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            {hallucinationLikelihood > 60 ? 'Unsubstantiated citation' : 'Authentic source proven'}
          </div>
        </div>
      </div>
    </div>
  );
};
