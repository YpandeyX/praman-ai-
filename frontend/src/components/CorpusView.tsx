import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, Scale, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { JudgmentOut } from '../types';
import { api } from '../services/api';

export const CorpusView: React.FC = () => {
  const [sources, setSources] = useState<JudgmentOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
  const [sourceDetail, setSourceDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    api.getSources()
      .then((data) => {
        setSources(data);
        if (data.length > 0) {
          handleSelectSource(data[0].id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectSource = async (id: number) => {
    setSelectedSourceId(id);
    setDetailLoading(true);
    try {
      const d = await api.getSourceDetail(id);
      setSourceDetail(d);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Verified Landmark Judgments Repository
            </h2>
            <p className="text-xs text-slate-600">
              Authoritative Indian Supreme Court judgments indexed with paragraph numbers, holdings, and party submission demarcations.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-600 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Loading judgment corpus...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
            {/* Left Column: List of Judgments */}
            <div className="lg:col-span-5 space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Available Cases ({sources.length})
              </span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-[550px] overflow-y-auto">
                {sources.map((src) => (
                  <div
                    key={src.id}
                    onClick={() => handleSelectSource(src.id)}
                    className={`p-3.5 transition-colors cursor-pointer text-xs flex items-center justify-between ${
                      selectedSourceId === src.id
                        ? 'bg-indigo-50/80 border-l-4 border-indigo-600 font-semibold text-indigo-950'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="space-y-1 pr-2">
                      <div className="font-bold line-clamp-1">{src.title}</div>
                      <div className="text-[11px] text-slate-600 flex items-center gap-2">
                        <span className="font-mono">{src.citation || 'Unassigned'}</span>
                        <span>•</span>
                        <span>{src.year || 'N/A'}</span>
                        <span>•</span>
                        <span>{src.passages_count} Passages</span>
                      </div>
                    </div>
                    <ChevronRight size={15} className="text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Case Details & Passages */}
            <div className="lg:col-span-7">
              {detailLoading ? (
                <div className="py-16 text-center text-xs text-slate-600 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Loading judgment text...</span>
                </div>
              ) : sourceDetail ? (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {sourceDetail.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>
                        <b>Citation:</b> {sourceDetail.citation || 'N/A'}
                      </div>
                      <div>
                        <b>Court:</b> {sourceDetail.court}
                      </div>
                      <div>
                        <b>Year:</b> {sourceDetail.year || 'N/A'}
                      </div>
                      <div>
                        <b>Bench:</b> {sourceDetail.bench || 'Full Bench'}
                      </div>
                    </div>
                    {sourceDetail.source_url && (
                      <a
                        href={sourceDetail.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline font-medium pt-1"
                      >
                        <ExternalLink size={12} />
                        View External Official Repository Record
                      </a>
                    )}
                  </div>

                  {/* Passages List */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Indexed Paragraphs ({sourceDetail.passages.length})
                    </span>
                    <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                      {sourceDetail.passages.map((p: any) => (
                        <div
                          key={p.id}
                          className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-800">
                              Para {p.para_number || 'N/A'} {p.page_number ? `(Page ${p.page_number})` : ''}
                            </span>
                            <div className="flex gap-1.5">
                              {p.is_party_argument && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                                  Party Argument
                                </span>
                              )}
                              {p.is_dissent && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                                  Dissenting Opinion
                                </span>
                              )}
                              {p.is_holding && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                                  Judicial Holding
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-slate-700 font-serif leading-relaxed italic">
                            "{p.text}"
                          </p>
                          {p.speaker_or_party && (
                            <div className="text-[11px] text-slate-600 font-medium">
                              Attributed: {p.speaker_or_party}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
