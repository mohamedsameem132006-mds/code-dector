import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Upload, 
  Trash2, 
  Sparkles, 
  FileCode, 
  AlertCircle,
  Languages,
  Check
} from 'lucide-react';
import { apiService } from '../services/api';
import { useSettings } from '../context/SettingsContext';

const SAMPLE_TEMPLATES = {
  python: `# Python sample with logic and syntax errors
def divide_elements(values):
    res = []
    for i in range(len(values)):
        val = values[i]
        # Bug: Division by zero risk and unsafe indexing
        calc = 100 / val
        res.append(calc)
    return res

numbers = [10, 5, 0, 2]
print(divide_elements(numbers))`,
  javascript: `// JavaScript sample with missing variable and unhandled promise
function fetchUserData(userId) {
  if (!userId) {
    throw new Error("User ID is missing");
  }
  
  // Bug: 'userStatus' is undeclared (ReferenceError)
  status = userStatus || "active";
  
  return {
    id: userId,
    status: status,
    timestamp: Date.now()
  };
}

fetchUserData();`,
  sql: `-- SQL injection and syntax ambiguity
SELECT username, email, password 
FROM accounts 
WHERE is_active = 1 AND role = 'admin';`
};

export default function WorkspacePage() {
  const navigate = useNavigate();
  const { explanationLanguage, setExplanationLanguage, theme } = useSettings();
  const isDark = theme === 'dark';

  const [code, setCode] = useState(SAMPLE_TEMPLATES.python);
  const [manualLanguage, setManualLanguage] = useState('');
  const [filename, setFilename] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const languageOptions = [
    { value: '', label: '⚡ Auto-Detect Language' },
    { value: 'python', label: 'Python (.py)' },
    { value: 'javascript', label: 'JavaScript (.js, .jsx)' },
    { value: 'typescript', label: 'TypeScript (.ts, .tsx)' },
    { value: 'java', label: 'Java (.java)' },
    { value: 'c', label: 'C (.c, .h)' },
    { value: 'cpp', label: 'C++ (.cpp, .hpp)' },
    { value: 'php', label: 'PHP (.php)' },
    { value: 'html', label: 'HTML (.html)' },
    { value: 'css', label: 'CSS (.css)' },
    { value: 'sql', label: 'SQL (.sql)' },
    { value: 'csharp', label: 'C# (.cs)' },
    { value: 'go', label: 'Go (.go)' },
    { value: 'ruby', label: 'Ruby (.rb)' },
    { value: 'rust', label: 'Rust (.rs)' },
    { value: 'kotlin', label: 'Kotlin (.kt)' },
    { value: 'swift', label: 'Swift (.swift)' },
    { value: 'json', label: 'JSON (.json)' }
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 300 * 1024) {
      setErrorMsg('File exceeds 300KB size limit. Please upload a smaller code snippet.');
      return;
    }

    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setCode(content);
        setErrorMsg('');
      }
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setErrorMsg('Please paste or write some code to analyze.');
      return;
    }

    setErrorMsg('');
    setIsAnalyzing(true);

    try {
      const response = await apiService.createAnalysis({
        code,
        filename,
        manualLanguage: manualLanguage || undefined,
        explanationLanguage: explanationLanguage || 'ta'
      });

      if (response.data?.data?.id) {
        navigate(`/analysis/${response.data.data.id}`);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'Analysis request failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Code Analysis Workspace
          </h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Paste source code or upload files. Gemini 3.8 Flash will audit syntax, logic, security, and teach in Tamil or English.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick template loader */}
          <div className={`flex items-center gap-1.5 text-xs p-1 rounded-lg border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <span className={`px-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Samples:</span>
            <button
              onClick={() => { setCode(SAMPLE_TEMPLATES.python); setManualLanguage('python'); }}
              className={`px-2 py-1 rounded transition ${
                isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              Python Bug
            </button>
            <button
              onClick={() => { setCode(SAMPLE_TEMPLATES.javascript); setManualLanguage('javascript'); }}
              className={`px-2 py-1 rounded transition ${
                isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              JS Bug
            </button>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg shadow-indigo-600/30 transition ${
              isAnalyzing ? 'bg-indigo-700 opacity-75 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-500 cursor-pointer'
            }`}
          >
            {isAnalyzing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing with Gemini...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze & Fix Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error notification banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Editor Container */}
      <div className={`border rounded-2xl overflow-hidden shadow-2xl transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Workspace Toolbar */}
        <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-4 ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex flex-wrap items-center gap-3">
            {/* Language dropdown */}
            <select
              value={manualLanguage}
              onChange={(e) => setManualLanguage(e.target.value)}
              className={`border text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500 ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              {languageOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Teaching Language Button Group */}
            <div className={`flex items-center gap-1.5 p-1 rounded-lg border text-xs ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <Languages className="w-3.5 h-3.5 text-indigo-500 ml-1.5" />
              <button
                onClick={() => setExplanationLanguage('en')}
                className={`px-2.5 py-1 rounded font-semibold transition ${
                  explanationLanguage === 'en' 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setExplanationLanguage('ta')}
                className={`px-2.5 py-1 rounded font-semibold transition ${
                  explanationLanguage === 'ta' 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                தமிழ் (Tamil)
              </button>
            </div>

            {filename && (
              <span className="text-xs text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5" />
                {filename}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition border ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}>
              <Upload className="w-3.5 h-3.5" />
              Upload File
              <input type="file" onChange={handleFileUpload} className="hidden" accept=".py,.js,.ts,.java,.cpp,.c,.php,.html,.css,.sql,.cs,.go,.rb,.rs,.kt,.swift,.json,.txt" />
            </label>

            <button
              onClick={() => { setCode(''); setFilename(''); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                isDark 
                  ? 'bg-slate-800/60 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300' 
                  : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600'
              }`}
              title="Clear Editor"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>

        {/* Monaco Code Editor */}
        <div className="h-[520px] w-full">
          <Editor
            height="100%"
            language={manualLanguage || 'python'}
            value={code}
            onChange={(val) => setCode(val || '')}
            theme={isDark ? 'vs-dark' : 'light'}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              fontFamily: 'Fira Code, Consolas, monospace',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbers: 'on'
            }}
          />
        </div>
      </div>
    </div>
  );
}
