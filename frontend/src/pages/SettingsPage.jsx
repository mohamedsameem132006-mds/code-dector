import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { Moon, Sun, Languages, Terminal, Check } from 'lucide-react';

export default function SettingsPage() {
  const { theme, toggleTheme, explanationLanguage, setExplanationLanguage } = useSettings();
  const isDark = theme === 'dark';

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          System & Preference Settings
        </h2>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Configure theme, AI teaching language, and review server runtime parameters.
        </p>
      </div>

      <div className={`border rounded-2xl p-6 shadow-xl space-y-6 transition-colors duration-200 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Theme Setting */}
        <div className={`flex items-center justify-between pb-6 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div>
            <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Appearance & Theme
            </h4>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Current mode: <strong className="capitalize">{theme}</strong>. Switch between dark developer mode and clean light theme.
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition border ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200'
            }`}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Switch to Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span>Switch to Dark Mode</span>
              </>
            )}
          </button>
        </div>

        {/* AI Teaching Language */}
        <div className={`flex items-center justify-between pb-6 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div>
            <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              AI Code Teacher Language
            </h4>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Active: <strong className="text-indigo-500">{explanationLanguage === 'ta' ? 'தமிழ் (Tamil)' : 'English'}</strong>. Controls explanation and teaching language across analyses and reports.
            </p>
          </div>
          <div className={`flex p-1 rounded-xl border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setExplanationLanguage('en')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                explanationLanguage === 'en' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {explanationLanguage === 'en' && <Check className="w-3.5 h-3.5" />}
              English
            </button>
            <button
              onClick={() => setExplanationLanguage('ta')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                explanationLanguage === 'ta' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {explanationLanguage === 'ta' && <Check className="w-3.5 h-3.5" />}
              தமிழ் (Tamil)
            </button>
          </div>
        </div>

        {/* Runtime Diagnostics */}
        <div className="space-y-3">
          <h4 className={`text-sm font-semibold flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            <Terminal className="w-4 h-4 text-indigo-500" />
            Configured Runtime Integrations
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className={`p-3.5 rounded-xl border ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Database:</span>
              <p className={`font-semibold mt-0.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                MySQL 8.0 (codesense_db)
              </p>
            </div>
            <div className={`p-3.5 rounded-xl border ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>LLM Provider:</span>
              <p className={`font-semibold mt-0.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Gemini 3.8 Flash
              </p>
            </div>
            <div className={`p-3.5 rounded-xl border ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Execution Engine:</span>
              <p className={`font-semibold mt-0.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Disposable Subprocess Sandbox
              </p>
            </div>
            <div className={`p-3.5 rounded-xl border ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>PDF Engine:</span>
              <p className={`font-semibold mt-0.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                PDFKit with Unicode Font & Tamil
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
