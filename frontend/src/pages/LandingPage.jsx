import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Code2, 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  Languages, 
  FileCheck2, 
  ArrowRight,
  Zap,
  Layers,
  Terminal
} from 'lucide-react';

export default function LandingPage() {
  const sampleCode = `// Sample Python code with syntax & logic error
def calculate_average(numbers):
    total = sum(numbers
    return total / len(numbers)

# ZeroDivisionError risk & unclosed paren
print(calculate_average([]))`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">CodeSense AI</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-sm font-medium text-slate-300 hover:text-white transition"
            >
              Dashboard
            </Link>
            <Link
              to="/workspace"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
            >
              Analyze Code Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 lg:py-28 px-6 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            Gemini 3.8 Flash • Dual Tamil & English Explanations • PDF Reports
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Detect Errors. Fix Code. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Learn Smarter in Tamil & English.
            </span>
          </h1>

          <p className="mt-6 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            A production-ready full-stack developer assistant that analyzes source code across 17+ languages, identifies syntax, logic, and security vulnerabilities, generates verified diffs, and computes transparent quality scores.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/workspace"
              className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center gap-2"
            >
              Open New Analysis Workspace <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard"
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm transition"
            >
              View Analytics Dashboard
            </Link>
          </div>

          {/* Interactive Preview Teaser */}
          <div className="mt-16 max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-left">
            <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs text-slate-400 font-mono">sample_buggy_script.py</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                Auto-Detected: Python
              </span>
            </div>

            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 font-mono text-xs">
              <div className="p-5 bg-slate-950/40 text-slate-300">
                <div className="text-[11px] text-rose-400 font-sans font-semibold mb-2">Original Buggy Input:</div>
                <pre className="text-slate-400">{sampleCode}</pre>
              </div>
              <div className="p-5 bg-indigo-950/20 text-slate-300">
                <div className="text-[11px] text-emerald-400 font-sans font-semibold mb-2">Corrected Output & Explanations:</div>
                <pre className="text-indigo-200">{`def calculate_average(numbers):
    if not numbers:
        return 0.0 # Guard empty list
    return sum(numbers) / len(numbers)

# Clean and zero-risk execution
print(calculate_average([]))`}</pre>
                <div className="mt-4 p-3 rounded-lg bg-slate-900 border border-indigo-500/20 text-[11px] font-sans text-indigo-300">
                  <span className="font-bold">தமிழ் விளக்கம்:</span> வெற்றுப் பட்டியல் (empty list) வரும்போது பூஜ்ஜியத்தால் வகுத்தல் (ZeroDivisionError) பிழை ஏற்படுவதை தடுக்க பாதுகாப்பு நிபந்தனை சேர்க்கப்பட்டது.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 bg-slate-900/40 border-t border-slate-800/80 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-12">
              Architected for Real Software Engineering
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                  <Languages className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Tamil & English AI Teacher</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Clear, educational line-by-line breakdowns in Tamil or English explaining why the problem happened, how it was resolved, and beginner-friendly advice.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Transparent Metrics & Diff</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Monaco side-by-side diff viewers, Recharts analytics, severity categorization, and auditable 0-100 quality scoring equations.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">PDFKit Multi-page Reports</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Export publication-quality PDF audit reports complete with Unicode font rendering, severity breakdowns, and timestamped metrics.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500">
        CodeSense AI • Full-Stack Static Analysis & Educational Platform • Powered by Gemini 3.8 Flash & MySQL
      </footer>
    </div>
  );
}
