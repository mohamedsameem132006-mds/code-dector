import React, { useState } from 'react';
import { Play, Terminal, Shield, CheckCircle, AlertOctagon, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

export default function SandboxRunner({ analysisId, language, initialVerification, onValidated }) {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [target, setTarget] = useState('corrected'); // 'original' or 'corrected'

  const isExecutable = ['python', 'javascript'].includes((language || '').toLowerCase());

  const handleRun = async () => {
    if (!isExecutable) return;
    setIsRunning(true);
    try {
      const res = await apiService.validateCode(analysisId, target);
      setResult(res.data.data);
      if (onValidated) onValidated(res.data.data);
    } catch (err) {
      setResult({
        success: false,
        status: 'failed',
        stderr: err.response?.data?.message || err.message,
        stdout: ''
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Disposable Execution Sandbox</h3>
            <p className="text-xs text-slate-400">
              Isolated subprocess with memory limits, execution timeout & restricted network
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Target selector */}
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            disabled={!isExecutable || isRunning}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="corrected">Run Corrected Code</option>
            <option value="original">Run Original Code</option>
          </select>

          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={!isExecutable || isRunning}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-md transition ${
              isExecutable
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Run Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sandbox Status Notice */}
      {!isExecutable ? (
        <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
          <Shield className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            Safe sandbox execution is currently enabled for Python and JavaScript. For '{language}', static parsing and AI analysis are active.
          </span>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Runtime: Node.js / Python Isolated Sandbox</span>
            <span className="font-mono text-[11px] text-slate-500">Limits: 6000ms • 64MB • No Network</span>
          </div>

          {result && (
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300 flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertOctagon className="w-4 h-4 text-rose-400" />
                  )}
                  Process Result: {result.status} (exit code: {result.exitCode})
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  Duration: {result.durationMs || 0}ms
                </span>
              </div>
              <div className="p-4 font-mono text-xs max-h-48 overflow-y-auto">
                {result.stdout && (
                  <pre className="text-emerald-300 whitespace-pre-wrap">{result.stdout}</pre>
                )}
                {result.stderr && (
                  <pre className="text-rose-400 whitespace-pre-wrap mt-1">{result.stderr}</pre>
                )}
                {!result.stdout && !result.stderr && (
                  <span className="text-slate-500 italic">Program executed with no console output.</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
