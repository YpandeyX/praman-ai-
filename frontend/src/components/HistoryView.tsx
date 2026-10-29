import React, { useState, useEffect } from 'react';
import {
  Clock,
  Search,
  Filter,
  Download,
  Trash2,
  ExternalLink,
  Loader2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { VerifyQuoteResponse } from '../types';
import { api } from '../services/api';
import { StatusBadge } from './StatusBadge';

interface HistoryViewProps {
  onSelectResult: (record: VerifyQuoteResponse) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onSelectResult }) => {
  const [history, setHistory] = useState<VerifyQuoteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getHistory(statusFilter, search);
      setHistory(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch verification history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleDeleteItem = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await api.deleteHistoryItem(id);
      setHistory(history.filter((h) => h.id !== id));
    } catch (err: any) {
      alert('Could not delete record');
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all verification history records?')) {
      try {
        await api.clearAllHistory();
        setHistory([]);
      } catch (err: any) {
        alert('Could not clear history');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Verification History & Audit Archive
              </h2>
              <p className="text-xs text-slate-600">
                Chronological ledger of verified legal quotations and downloadable evidence certificates.
              </p>
            </div>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors"
            >
              <Trash2 size={13} />
              Clear All Records
            </button>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by quote keywords or case title..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </form>

          {/* Status filters */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto">
            {['ALL', 'Exact Match', 'Modified Quote', 'Context Mismatch', 'Source Not Found', 'Inconclusive'].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`text-[11px] px-2.5 py-1 rounded-md transition-all font-medium whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              )
            )}
          </div>
        </div>

        {/* List of verification records */}
        <div className="mt-5">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-600 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Loading audit logs...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-lg">
              {error}
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-slate-600 space-y-2">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs">No verification records found matching current criteria.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {history.map((record) => (
                <div
                  key={record.id}
                  onClick={() => onSelectResult(record)}
                  className="p-4 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex items-center gap-2.5">
                      <StatusBadge status={record.status} size="sm" />
                      <span className="text-xs font-bold text-slate-800">
                        {record.judgment_title || 'Unverified Case'}
                      </span>
                      {record.citation && (
                        <span className="text-[11px] text-slate-600 font-mono">
                          ({record.citation})
                        </span>
                      )}
                      <span className="text-[11px] text-slate-600 flex items-center gap-1">
                        <Calendar size={11} />
                        {record.created_at ? new Date(record.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 font-serif line-clamp-2">
                      "{record.submitted_quote}"
                    </p>

                    <div className="text-[11px] text-slate-600 line-clamp-1">
                      {record.explanation}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                      {Math.round(record.confidence * 100)}% Conf
                    </span>

                    {record.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(api.getPdfReportUrl(record.id!), '_blank');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs"
                        title="Download PDF"
                      >
                        <Download size={13} />
                        PDF
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDeleteItem(e, record.id!)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
