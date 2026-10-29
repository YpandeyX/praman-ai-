import React from 'react';
import {
  Scale,
  FileCheck,
  Sparkles,
  ArrowRight,
  GitCompare,
  AlertTriangle,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface LandingHeroProps {
  onStartVerify: () => void;
  onExplorePresets: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onStartVerify, onExplorePresets }) => {
  return (
    <div className="space-y-12 py-6">
      {/* Hero Header */}
      <div className="text-center max-w-4xl mx-auto space-y-5 flex flex-col items-center">
        {/* Top Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700 shadow-2xs">
          <Scale size={14} className="text-indigo-600" />
          <span>Intelligent Legal Quote Verification & Evidence Platform</span>
        </div>

        {/* Headline with Exact Wavy Underline */}
        <h1 className="text-4xl sm:text-5xl md:text-[54px] font-black text-slate-900 tracking-tight leading-[1.2] text-center pt-1">
          Every Legal Quote.{' '}
          <span className="inline-block relative text-indigo-600 align-top">
            <span>Verified with</span>
            <svg
              className="w-full h-3 sm:h-3.5 text-indigo-500 mt-1 block"
              viewBox="0 0 220 16"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M2 8 C 12 0, 18 16, 28 8 C 38 0, 44 16, 54 8 C 64 0, 70 16, 80 8 C 90 0, 96 16, 106 8 C 116 0, 122 16, 132 8 C 142 0, 148 16, 158 8 C 168 0, 174 16, 184 8 C 194 0, 200 16, 210 8 C 214 4, 217 12, 218 8"
                stroke="#6366f1"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <br />
          <span className="inline-block relative text-indigo-600 align-top mt-1">
            <span>Evidence.</span>
            <svg
              className="w-full h-3 sm:h-3.5 text-indigo-500 mt-1 block"
              viewBox="0 0 150 16"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M2 8 C 12 0, 18 16, 28 8 C 38 0, 44 16, 54 8 C 64 0, 70 16, 80 8 C 90 0, 96 16, 106 8 C 116 0, 122 16, 132 8 C 140 2, 144 14, 148 8"
                stroke="#6366f1"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        {/* Subtitle description */}
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-3xl mx-auto pt-1">
          AI systems hallucinate court citations. Legal briefs omit essential qualifications. Praman AI mathematically verifies quotations against authentic Indian court judgments, computes word-level Myers diffs, detects party submission conflations, and certifies results with downloadable evidence certificates.
        </p>

        {/* Action Buttons */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-3.5">
          <button
            onClick={onStartVerify}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <span>Verify a Legal Quote</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={onExplorePresets}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
          >
            <Sparkles size={16} className="text-indigo-600" />
            <span>Interactive Live Presets</span>
          </button>
        </div>
      </div>

      {/* 3 Core Pillars Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 transition-shadow hover:shadow-md">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <FileCheck size={20} />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Proof-Carrying Verification</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every verification anchors directly to a verified paragraph in the court judgment record. Never rely on unsupported LLM opinions.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 transition-shadow hover:shadow-md">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <GitCompare size={20} />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Word-Level Explainable Diff</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Pinpoints exact additions, deletions, and substitutions. Alerts users to critical modal shifts like reversing <i>shall</i> into <i>may</i>.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 transition-shadow hover:shadow-md">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <AlertTriangle size={20} />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Context & Attribution Integrity</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Detects whether a quote is merely an argument submitted by party counsel, a minority dissenting opinion, or an excerpt omitting statutory caveats.
          </p>
        </div>
      </div>

      {/* Live Sample Teaser Card */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-900/60 pb-4">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">
              SAMPLE LIVE VERIFICATION AUDIT
            </div>
            <div className="text-base font-bold">Justice K.S. Puttaswamy v. Union of India (2017) 10 SCC 1</div>
          </div>
          <StatusBadge status="Exact Match" size="md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2 backdrop-blur-xs">
            <div className="text-indigo-300 font-semibold uppercase text-[10px]">Submitted Quotation</div>
            <p className="font-serif italic leading-relaxed text-slate-200">
              "Privacy is the constitutional core of human dignity. Privacy has both positive and negative contents. The negative content restrains the State from committing an intrusion upon the life and personal liberty of a citizen."
            </p>
          </div>

          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-400/30 space-y-2 backdrop-blur-xs">
            <div className="text-emerald-300 font-semibold uppercase text-[10px]">
              Original Verified Record (Para 298, Page 265)
            </div>
            <p className="font-serif italic leading-relaxed text-emerald-100">
              "Privacy is the constitutional core of human dignity. Privacy has both positive and negative contents. The negative content restrains the State from committing an intrusion upon the life and personal liberty of a citizen."
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-indigo-200 pt-2 border-t border-indigo-900/50">
          <span>Alignment: 100% Verbatim • Para 298 Verified • Judicial Ratio Holding</span>
          <button
            onClick={onStartVerify}
            className="text-white hover:text-indigo-300 underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            Try Your Own Quotation Now &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
