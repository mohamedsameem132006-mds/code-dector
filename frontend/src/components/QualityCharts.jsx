import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';
import { Info, CheckCircle2 } from 'lucide-react';

export function SeverityChart({ counts = {} }) {
  const data = [
    { name: 'Critical', count: counts.critical || 0, color: '#ef4444' },
    { name: 'Error', count: counts.error || 0, color: '#f97316' },
    { name: 'Warning', count: counts.warning || 0, color: '#eab308' },
    { name: 'Suggestion', count: counts.info || 0, color: '#3b82f6' },
  ].filter(d => d.count > 0);

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
        No errors or warnings detected in this code.
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
          <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryPieChart({ categoryCounts = {} }) {
  const COLORS = {
    syntax: '#ec4899',
    logic: '#8b5cf6',
    security: '#ef4444',
    runtime: '#f59e0b',
    type: '#06b6d4',
    style: '#10b981',
    performance: '#6366f1'
  };

  const data = Object.entries(categoryCounts)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: key.toUpperCase(),
      value,
      color: COLORS[key] || '#94a3b8'
    }));

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
        All issue categories clear.
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={65}
            innerRadius={40}
            paddingAngle={4}
          >
            {data.map((entry, index) => (
              <Cell key={`slice-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function QualityScoreGauge({ score = 0, counts = {}, lineCount = 0 }) {
  const [showDetails, setShowDetails] = useState(false);

  const getScoreInfo = (val) => {
    if (val >= 90) return { label: 'Excellent Quality', color: 'text-emerald-500 border-emerald-500/40 bg-emerald-500/10', desc: 'Code is clean, robust, and well structured.' };
    if (val >= 75) return { label: 'Good Quality', color: 'text-indigo-500 border-indigo-500/40 bg-indigo-500/10', desc: 'Minor style or warning suggestions found.' };
    if (val >= 50) return { label: 'Needs Improvement', color: 'text-amber-500 border-amber-500/40 bg-amber-500/10', desc: 'Several logic warnings or potential bugs detected.' };
    return { label: 'Critical Action Needed', color: 'text-rose-500 border-rose-500/40 bg-rose-500/10', desc: 'Syntax errors or security risks require attention.' };
  };

  const info = getScoreInfo(score);

  return (
    <div className="flex flex-col items-center justify-center p-4 text-center">
      {/* Gauge Circle */}
      <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center shadow-lg transition-transform hover:scale-105 ${info.color}`}>
        <span className="text-3xl font-extrabold tracking-tight">{score}</span>
        <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">Score / 100</span>
      </div>

      {/* Neat Quality Label & Description */}
      <div className="mt-3.5 space-y-1">
        <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
          {info.label}
        </span>
        <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
          {info.desc}
        </p>
      </div>

      {/* Explanatory Toggle / Modal */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 w-full max-w-xs">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition"
        >
          <Info className="w-3.5 h-3.5" />
          <span>{showDetails ? 'Hide Score Breakdown' : 'How is this score calculated?'}</span>
        </button>

        {showDetails && (
          <div className="mt-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-left text-[11px] text-slate-300 space-y-2 shadow-md">
            <div className="flex items-center justify-between font-semibold text-indigo-300 pb-1 border-b border-slate-800">
              <span>Scoring Factors</span>
              <span>Penalties</span>
            </div>
            <div className="space-y-1 text-[10px] text-slate-400">
              <div className="flex justify-between">
                <span>Critical Bugs / Security:</span>
                <span className="text-rose-400 font-mono">-25 pts each</span>
              </div>
              <div className="flex justify-between">
                <span>Errors / Syntax Breaks:</span>
                <span className="text-orange-400 font-mono">-15 pts each</span>
              </div>
              <div className="flex justify-between">
                <span>Logic & Type Warnings:</span>
                <span className="text-amber-400 font-mono">-5 pts each</span>
              </div>
              <div className="flex justify-between">
                <span>Style / Info Suggestions:</span>
                <span className="text-blue-400 font-mono">-2 pts each</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 leading-normal">
              Penalties are normalized against file length so larger programs are evaluated fairly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
