import React, { useState } from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Languages, 
  BookOpen 
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function IssueList({ issues = [], teachingNotes = {} }) {
  const { explanationLanguage, setExplanationLanguage, theme } = useSettings();
  const isDark = theme === 'dark';

  // Use global explanationLanguage preference as default
  const [selectedLang, setSelectedLang] = useState(explanationLanguage || 'en');
  const [expandedId, setExpandedId] = useState(null);

  // Sync with global setting if changed externally
  React.useEffect(() => {
    if (explanationLanguage) {
      setSelectedLang(explanationLanguage);
    }
  }, [explanationLanguage]);

  const handleLangChange = (lang) => {
    setSelectedLang(lang);
    setExplanationLanguage(lang);
  };

  const getSeverityBadge = (sev) => {
    switch ((sev || '').toLowerCase()) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-500 border border-rose-500/30 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Critical</span>;
      case 'error':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-500/20 text-orange-500 border border-orange-500/30 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Error</span>;
      case 'warning':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Warning</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-500 border border-blue-500/30 flex items-center gap-1"><Info className="w-3 h-3" /> Info</span>;
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header with Tamil / English language selector */}
      <div className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          <h3 className={`font-semibold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Detailed Diagnostics & AI Explanations ({issues.length})
          </h3>
        </div>

        <div className={`flex items-center gap-1.5 p-1 rounded-lg border ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <Languages className="w-4 h-4 text-indigo-500 ml-2" />
          <button
            onClick={() => handleLangChange('en')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
              selectedLang === 'en' 
                ? 'bg-indigo-600 text-white shadow' 
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English
          </button>
          <button
            onClick={() => handleLangChange('ta')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
              selectedLang === 'ta' 
                ? 'bg-indigo-600 text-white shadow' 
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            தமிழ் (Tamil)
          </button>
        </div>
      </div>

      {/* Teaching Notes Box */}
      {(teachingNotes.en || teachingNotes.ta) && (
        <div className={`p-5 rounded-2xl border ${
          isDark 
            ? 'bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 border-indigo-500/20' 
            : 'bg-indigo-50/70 border-indigo-200 shadow-sm'
        }`}>
          <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-300 flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
            {selectedLang === 'ta' ? 'AI குறியீட்டு ஆசிரியர் பாடம் (AI Teaching Guide)' : 'AI Code Teacher & Concept Guide'}
          </h4>
          <p className={`text-sm leading-relaxed font-sans ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {selectedLang === 'ta' && teachingNotes.ta ? teachingNotes.ta : (teachingNotes.en || teachingNotes.ta)}
          </p>
        </div>
      )}

      {/* Issues Accordion */}
      {issues.length === 0 ? (
        <div className={`p-8 rounded-2xl border text-center ${
          isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h4 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Clean Code Check</h4>
          <p className="text-sm text-slate-500 mt-1">No syntax errors, runtime hazards, or critical security vulnerabilities detected.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue, index) => {
            const isExpanded = expandedId === index || index === 0;
            const explanation = selectedLang === 'ta' && issue.explanation_ta ? issue.explanation_ta : (issue.explanation_en || issue.explanation_ta);

            return (
              <div 
                key={index}
                className={`border rounded-xl overflow-hidden transition-all ${
                  isDark 
                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700' 
                    : 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs'
                }`}
              >
                <div 
                  onClick={() => toggleExpand(index)}
                  className={`p-4 flex items-center justify-between cursor-pointer select-none transition ${
                    isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    {getSeverityBadge(issue.severity)}
                    <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                      isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}>
                      Line {issue.line_number || '1'}{issue.column_number ? `:${issue.column_number}` : ''}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded uppercase font-medium ${
                      isDark ? 'bg-slate-800/60 text-slate-400' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {issue.category}
                    </span>
                    <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                      {issue.message}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[11px] font-mono hidden sm:inline opacity-70">
                      {issue.verification_status || 'ai_suggestion'}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className={`p-5 border-t space-y-4 ${
                    isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/50'
                  }`}>
                    {/* Affected Code */}
                    {issue.affected_code && (
                      <div>
                        <span className="text-xs font-semibold text-slate-500 block mb-1">Affected Line:</span>
                        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 font-mono text-xs">
                          {issue.affected_code}
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    <div>
                      <span className="text-xs font-semibold text-indigo-500 block mb-1">
                        {selectedLang === 'ta' ? 'விளக்கம் மற்றும் தீர்வு (Tamil Explanation):' : 'Detailed Explanation:'}
                      </span>
                      <p className={`text-sm leading-relaxed font-sans ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        {explanation}
                      </p>
                    </div>

                    {/* Suggested Fix */}
                    {issue.suggested_fix && (
                      <div>
                        <span className="text-xs font-semibold text-emerald-500 block mb-1">
                          {selectedLang === 'ta' ? 'பரிந்துரைக்கப்பட்ட திருத்தம் (Suggested Fix):' : 'Suggested Fix:'}
                        </span>
                        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                          {issue.suggested_fix}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
