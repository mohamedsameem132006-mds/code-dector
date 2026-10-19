import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Sparkles, 
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { apiService } from '../services/api';
import CodeViewer from '../components/CodeViewer';
import IssueList from '../components/IssueList';
import SandboxRunner from '../components/SandboxRunner';
import { SeverityChart, CategoryPieChart, QualityScoreGauge } from '../components/QualityCharts';
import { useSettings } from '../context/SettingsContext';

export default function AnalysisDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { explanationLanguage, theme } = useSettings();
  const isDark = theme === 'dark';

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAnalysis(id);
      setAnalysis(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePdf = async (lang = 'en') => {
    setGeneratingPdf(true);
    try {
      const res = await apiService.createReport(id, lang);
      const report = res.data.data;
      await apiService.downloadReport(report.reportId, report.fileName || `CodeSense-${lang === 'ta' ? 'Tamil' : 'English'}-Report.pdf`);
    } catch (err) {
      alert('PDF generation error: ' + (err.response?.data?.message || err.message));
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this analysis permanently?')) return;
    try {
      await apiService.deleteAnalysis(id);
      navigate('/history');
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Loading analysis report...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className={`p-8 rounded-2xl border text-center max-w-lg mx-auto mt-12 ${
        isDark ? 'bg-rose-950/20 border-rose-800' : 'bg-rose-50 border-rose-200'
      }`}>
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Analysis Not Found</h3>
        <p className="text-sm text-slate-500 mt-1">{error || 'This analysis could not be retrieved.'}</p>
        <Link to="/workspace" className="mt-4 inline-block px-4 py-2 bg-indigo-600 rounded-lg text-white text-xs font-semibold">
          Create New Analysis
        </Link>
      </div>
    );
  }

  const metrics = analysis.metrics || {};

  return (
    <div className="space-y-8 pb-12">
      {/* Top action header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className={`p-2 rounded-xl border transition ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' 
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Analysis Report
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-500 font-mono font-medium uppercase">
                {analysis.language}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              ID: {analysis.id} • Created {new Date(analysis.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleGeneratePdf('en')}
            disabled={generatingPdf}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            PDF (English)
          </button>

          <button
            onClick={() => handleGeneratePdf('ta')}
            disabled={generatingPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
          >
            <Download className="w-3.5 h-3.5" />
            PDF (தமிழ் Report)
          </button>

          <button
            onClick={handleDelete}
            className={`p-2 rounded-xl border transition ${
              isDark 
                ? 'bg-slate-900 hover:bg-rose-950/40 border-slate-800 text-slate-400 hover:text-rose-400' 
                : 'bg-white hover:bg-rose-50 border-slate-200 text-slate-500 hover:text-rose-600'
            }`}
            title="Delete analysis"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className={`p-6 rounded-2xl border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}>
          <Sparkles className="w-4 h-4 text-indigo-500" />
          Executive Audit Summary
        </h3>
        <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {analysis.summary}
        </p>
      </div>

      {/* Analytics & Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`border rounded-2xl p-4 flex flex-col justify-center transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 text-center ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>Quality Score</h4>
          <QualityScoreGauge score={analysis.qualityScore || 0} formula={metrics.formula} />
        </div>

        <div className={`border rounded-2xl p-4 transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 text-center ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>Severity Breakdown</h4>
          <SeverityChart counts={metrics.counts || {}} />
        </div>

        <div className={`border rounded-2xl p-4 transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 text-center ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>Category Distribution</h4>
          <CategoryPieChart categoryCounts={metrics.categoryCounts || {}} />
        </div>
      </div>

      {/* Original vs Corrected Monaco Diff Viewer */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Code Repair & Side-by-Side Diff
          </h3>
          <span className="text-xs text-slate-500">Original code is preserved and never overwritten</span>
        </div>
        <CodeViewer
          originalCode={analysis.originalCode}
          correctedCode={analysis.correctedCode}
          language={analysis.language}
        />
      </div>

      {/* AI Teacher & Issues Diagnostics in English/Tamil */}
      <IssueList
        issues={analysis.issues || []}
        teachingNotes={analysis.teachingNotes || {}}
      />

      {/* Safe Subprocess Sandbox Execution */}
      <SandboxRunner
        analysisId={analysis.id}
        language={analysis.language}
        initialVerification={analysis.verificationStatus}
        onValidated={(data) => {
          setAnalysis(prev => ({
            ...prev,
            verificationStatus: data.success ? 'sandbox_passed' : 'sandbox_failed'
          }));
        }}
      />
    </div>
  );
}
