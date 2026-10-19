import React, { useState } from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import { Copy, Check, Download, Split, Eye } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function CodeViewer({ 
  originalCode = '', 
  correctedCode = '', 
  language = 'javascript'
}) {
  const { theme } = useSettings();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('diff'); // 'diff', 'side', 'corrected'
  const [copied, setCopied] = useState(false);

  // Map to Monaco language identifiers
  const monacoLangMap = {
    python: 'python',
    javascript: 'javascript',
    typescript: 'typescript',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    csharp: 'csharp',
    php: 'php',
    html: 'html',
    css: 'css',
    sql: 'sql',
    go: 'go',
    ruby: 'ruby',
    rust: 'rust',
    kotlin: 'kotlin',
    swift: 'swift',
    json: 'json'
  };

  const monacoLang = monacoLangMap[language.toLowerCase()] || 'javascript';

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (codeToDownload, filenameSuffix = 'fixed') => {
    const blob = new Blob([codeToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `codesense_${filenameSuffix}.${language === 'python' ? 'py' : language === 'javascript' ? 'js' : language}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`border rounded-2xl overflow-hidden shadow-xl transition-colors ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      {/* Editor Header Navigation */}
      <div className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
        isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`flex p-1 rounded-lg border ${
            isDark ? 'bg-slate-800/80 border-slate-700/50' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setActiveTab('diff')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === 'diff' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              Side-by-Side Diff
            </button>
            <button
              onClick={() => setActiveTab('corrected')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === 'corrected' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Corrected Code
            </button>
            <button
              onClick={() => setActiveTab('original')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === 'original' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Original Source
            </button>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-500 font-mono font-medium border border-indigo-500/20">
            {language}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCopy(activeTab === 'original' ? originalCode : (correctedCode || originalCode))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
              isDark 
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={() => handleDownload(correctedCode || originalCode, 'corrected')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Download Fixed Code
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="h-[480px] w-full">
        {activeTab === 'diff' ? (
          <DiffEditor
            height="100%"
            language={monacoLang}
            original={originalCode}
            modified={correctedCode || originalCode}
            theme={isDark ? 'vs-dark' : 'light'}
            options={{
              readOnly: true,
              renderSideBySide: true,
              minimap: { enabled: false },
              fontSize: 13,
              scrollBeyondLastLine: false,
              wordWrap: 'on'
            }}
          />
        ) : (
          <Editor
            height="100%"
            language={monacoLang}
            value={activeTab === 'original' ? originalCode : (correctedCode || originalCode)}
            theme={isDark ? 'vs-dark' : 'light'}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              wordWrap: 'on'
            }}
          />
        )}
      </div>
    </div>
  );
}
