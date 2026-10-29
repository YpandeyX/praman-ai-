import React, { useState, useEffect } from 'react';
import { History, GitCommit, ChevronRight, Award, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { DoctrineTimelineResponse, DoctrineNode } from '../types';

interface DoctrineTimelineProps {
  caseName?: string;
}

export const DoctrineTimeline: React.FC<DoctrineTimelineProps> = ({ caseName = 'Puttaswamy' }) => {
  const [timeline, setTimeline] = useState<DoctrineTimelineResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeDoctrine, setActiveDoctrine] = useState<'privacy' | 'basic_structure' | 'due_process'>('privacy');

  const fetchTimeline = async (name: string) => {
    setLoading(true);
    try {
      const res = await api.getDoctrineTimeline(name);
      setTimeline(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline(caseName);
  }, [caseName]);

  const handleDoctrineSwitch = (key: 'privacy' | 'basic_structure' | 'due_process') => {
    setActiveDoctrine(key);
    const lookupMap = {
      privacy: 'Puttaswamy',
      basic_structure: 'Kesavananda Bharati',
      due_process: 'Maneka Gandhi',
    };
    fetchTimeline(lookupMap[key]);
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('overruled')) {
      return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300';
    }
    if (s.includes('authoritative') || s.includes('foundational')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300';
    }
    if (s.includes('precursor') || s.includes('pioneering')) {
      return 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300';
    }
    return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Precedent Doctrine Lineage & Historical Evolution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tracing judicial evolution, bench sizes, and subsequent affirmations/overrulings.
            </p>
          </div>
        </div>

        {/* Doctrine switch tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => handleDoctrineSwitch('privacy')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeDoctrine === 'privacy'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Privacy (Art 21)
          </button>
          <button
            onClick={() => handleDoctrineSwitch('basic_structure')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeDoctrine === 'basic_structure'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Basic Structure (Art 368)
          </button>
          <button
            onClick={() => handleDoctrineSwitch('due_process')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeDoctrine === 'due_process'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Due Process / Fairness
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Tracing constitutional lineage...</span>
        </div>
      ) : timeline ? (
        <div className="space-y-4">
          <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/20 rounded-lg border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-950 dark:text-indigo-200">
            <span className="font-bold">{timeline.doctrine_name}: </span>
            {timeline.description}
          </div>

          {/* Timeline Nodes */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {timeline.nodes.map((node, idx) => (
              <div key={idx} className="relative group">
                {/* Node icon circle */}
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300">
                        {node.year}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {node.case_title}
                      </h4>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(node.status)}`}>
                      {node.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-mono">{node.citation}</span>
                    <span>•</span>
                    <span>Bench: {node.bench}</span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
                    "{node.ruling_summary}"
                  </p>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Doctrine Impact:</span>
                    <span>{node.impact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
