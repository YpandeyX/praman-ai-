import React from 'react';
import { BookMarked, ShieldCheck, Cpu, AlertTriangle, Scale, Lock, FileCode, CheckCircle2 } from 'lucide-react';

export const MethodologyView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Intro Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
        <div className="flex items-center gap-2.5">
          <BookMarked className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">
            Praman AI Verification Architecture & Legal Methodology
          </h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Praman AI is engineered to eliminate fabricated legal quotations and misleading judicial citations in legal briefs, academic articles, and generative AI systems. Unlike chatbots that generate plausible assertions, Praman AI operates as a <b>deterministic proof-carrying verification engine</b>. Every affirmation is accompanied by traceable source text, paragraph markers, and mathematical difference alignment.
        </p>
      </div>

      {/* 9-Stage Pipeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-600" />
          The 9-Stage Hybrid Verification Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5">
            <span className="font-bold text-indigo-700">1. Text Normalization</span>
            <p className="text-slate-600 leading-relaxed">
              Standardizes unicode typographical quotes, dashes, and spacing while preserving original casing and tokens for diff rendering.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5">
            <span className="font-bold text-indigo-700">2. Citation & Case Indexing</span>
            <p className="text-slate-600 leading-relaxed">
              Searches verified database and uploaded PDFs using case titles, standard SCC/AIR citation patterns, and distinctive keywords.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5">
            <span className="font-bold text-indigo-700">3. Exact Lexical Sub-Span Match</span>
            <p className="text-slate-600 leading-relaxed">
              Performs verbatim substring alignment to determine if the quotation represents an exact excerpt from a longer judicial paragraph.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5">
            <span className="font-bold text-indigo-700">4. RapidFuzz Sliding Alignment</span>
            <p className="text-slate-600 leading-relaxed">
              Executes sliding-window Levenshtein ratio matching to isolate corresponding sentence spans even amidst wording edits or rephrasing.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5">
            <span className="font-bold text-indigo-700">5. TF-IDF & Semantic Retrieval</span>
            <p className="text-slate-600 leading-relaxed">
              Computes character and word n-gram cosine similarities to discover semantically correlated passages across the full judgment corpus.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5">
            <span className="font-bold text-indigo-700">6. Surrounding Context Retrieval</span>
            <p className="text-slate-600 leading-relaxed">
              Fetches preceding and succeeding paragraphs to detect whether the quote has been ripped out of its structural context.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5">
            <span className="font-bold text-indigo-700">7. Myers Word-Level Diffing</span>
            <p className="text-slate-600 leading-relaxed">
              Calculates token-level insertions, deletions, replacements, and flags critical legal modal shifts (e.g. <i>shall</i> vs <i>may</i>, negations).
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5">
            <span className="font-bold text-indigo-700">8. Cross-Case Origin Tracing</span>
            <p className="text-slate-600 leading-relaxed">
              Scans all indexed decisions to discover whether a quotation was originated in an earlier landmark case (e.g. <i>Maneka Gandhi</i> before <i>Puttaswamy</i>).
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5">
            <span className="font-bold text-indigo-700">9. Deterministic Classification</span>
            <p className="text-slate-600 leading-relaxed">
              Applies verifiable decision trees to output the final status badge, confidence score, and downloadable ReportLab evidence certificate.
            </p>
          </div>
        </div>
      </div>

      {/* Status Definitions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Scale className="w-4 h-4 text-indigo-600" />
          Taxonomy of Verification Outcomes
        </h3>

        <div className="space-y-3 text-xs leading-relaxed">
          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50">
            <b className="text-emerald-900">1. Exact Match:</b> The submitted text matches the source judgment passage verbatim. No substantive or semantic variations exist.
          </div>

          <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50">
            <b className="text-amber-900">2. Modified Quote:</b> The quotation corresponds to an authenticated passage in the judgment, but exhibits additions, omissions, or word substitutions. Praman AI highlights every token difference and warns of any modal shifts.
          </div>

          <div className="p-3 rounded-lg border border-orange-200 bg-orange-50/50">
            <b className="text-orange-900">3. Context Mismatch:</b> The text matches a passage in the judgment, but serious attribution distortions are present. Examples: citing a party counsel submission as if it were the Court's binding ratio, citing a minority dissent without disclosure, or omitting qualifying statutory conditions.
          </div>

          <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/50">
            <b className="text-rose-900">4. Source Not Found:</b> No matching passage was located in the verified index or uploaded document. <b>Critical Ethic:</b> Praman AI never labels a quotation "fake" merely because an archive search did not discover it; unindexed archives or court books may exist.
          </div>

          <div className="p-3 rounded-lg border border-slate-300 bg-slate-100">
            <b className="text-slate-800">5. Inconclusive:</b> Available textual overlap (40%–65%) is ambiguous and insufficient to make a dependable determination without manual human inspection.
          </div>
        </div>
      </div>

      {/* Security & Document Handling */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3 text-xs text-slate-600 leading-relaxed">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-600" />
          Security, Privacy & Data Handling
        </h3>
        <p>
          Uploaded PDF judgments are processed locally in temporary storage using PyMuPDF. No client documents or sensitive legal brief submissions are sent to third-party public LLM endpoints. Clear retention controls allow researchers to delete individual verification records or wipe history at any time.
        </p>
        <p className="italic text-slate-600 pt-1">
          <b>Disclaimer:</b> Praman AI provides evidence-based assistance for legal research, journalism, and brief preparation. It is an auditing instrument and does not substitute for independent professional legal counsel.
        </p>
      </div>
    </div>
  );
};
