import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Trash2, ArrowRight, Clock, Code2 } from 'lucide-react';
import { apiService } from '../services/api';

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await apiService.listAnalyses();
      setAnalyses(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!window.confirm('Delete this analysis permanently?')) return;
    try {
      await apiService.deleteAnalysis(id);
      setAnalyses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Analysis History</h2>
          <p className="text-sm text-slate-400">All saved audits and code repairs in your MySQL database.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading historical analyses...</div>
        ) : analyses.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <History className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm">No analysis history found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {analyses.map((item) => (
              <div key={item.id} className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-800/30 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-indigo-500/20 text-indigo-300 uppercase">
                      {item.detected_language}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {item.analysis_summary?.substring(0, 80) || 'Code Analysis'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                    <span>ID: {item.id.substring(0, 16)}...</span>
                    <span>•</span>
                    <span>{new Date(item.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`text-sm font-bold ${(item.quality_score || 0) >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {item.quality_score || 'N/A'}/100
                  </span>

                  <Link
                    to={`/analysis/${item.id}`}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition"
                  >
                    View <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
