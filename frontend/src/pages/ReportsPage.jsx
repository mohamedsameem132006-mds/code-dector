import React, { useState, useEffect } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';
import { useSettings } from '../context/SettingsContext';

export default function ReportsPage() {
  const { theme } = useSettings();
  const isDark = theme === 'dark';

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    apiService.listReports()
      .then(res => setReports(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (report) => {
    setDownloadingId(report.id);
    try {
      await apiService.downloadReport(report.id, report.file_name);
    } catch (err) {
      alert('Download failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Saved PDF Reports
        </h2>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Download previously compiled PDF audit reports.
        </p>
      </div>

      <div className={`border rounded-2xl overflow-hidden shadow-xl ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {loading ? (
          <div className={`p-12 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Loading PDF records...
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className={`w-10 h-10 mx-auto ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No PDF reports generated yet.</p>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Generate a report directly from any analysis results page.
            </p>
          </div>
        ) : (
          <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
            {reports.map((report) => (
              <div
                key={report.id}
                className={`p-5 flex flex-wrap items-center justify-between gap-4 transition ${
                  isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {report.file_name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono uppercase">
                      {report.report_language === 'ta' ? 'தமிழ்' : 'English'}
                    </span>
                  </div>
                  <div className={`flex items-center gap-3 text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <span>Language: {report.detected_language}</span>
                    <span>•</span>
                    <span>Score: {report.quality_score}/100</span>
                    <span>•</span>
                    <span>{new Date(report.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(report)}
                  disabled={downloadingId === report.id}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/30 transition"
                >
                  {downloadingId === report.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  {downloadingId === report.id ? 'Downloading...' : 'Download PDF'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
