import React, { useState, useEffect } from 'react';
import { Sparkles, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { useSettings } from '../context/SettingsContext';

export default function Topbar({ title = 'Dashboard' }) {
  const { theme } = useSettings();
  const isDark = theme === 'dark';

  const [health, setHealth] = useState({ status: 'checking', aiModel: 'gemini-3.8-flash' });

  useEffect(() => {
    apiService.getHealth()
      .then(res => setHealth(res.data))
      .catch(() => setHealth({ status: 'offline', aiModel: 'gemini-3.8-flash' }));
  }, []);

  return (
    <header className={`h-16 border-b px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur transition-colors duration-200 ${
      isDark 
        ? 'bg-slate-900/80 border-slate-800 text-white' 
        : 'bg-white/80 border-slate-200 text-slate-900 shadow-xs'
    }`}>
      <div>
        <h1 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Engine status */}
        <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ${
          isDark 
            ? 'bg-slate-800/80 border-slate-700/60 text-slate-300' 
            : 'bg-slate-100 border-slate-200 text-slate-700'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            health.status === 'ok' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
          }`} />
          <span className="font-medium capitalize">
            {health.status === 'ok' ? 'Engine Active' : 'Connecting'}
          </span>
          <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>•</span>
          <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3" />
            {health.aiModel || 'Gemini 3.8'}
          </span>
        </div>

        {/* Database Quick Link */}
        <Link 
          to="/database"
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition ${
            isDark 
              ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700' 
              : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-xs'
          }`}
          title="Open Database Explorer"
        >
          <Database className="w-3.5 h-3.5 text-indigo-500" />
          <span>View Database</span>
        </Link>
      </div>
    </header>
  );
}
