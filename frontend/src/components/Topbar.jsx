import React, { useState, useEffect } from 'react';
import { Sparkles, Database, User, LogIn, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ title = 'Dashboard' }) {
  const navigate = useNavigate();
  const { theme } = useSettings();
  const { user, logout } = useAuth();
  const isDark = theme === 'dark';

  const [health, setHealth] = useState({ status: 'ok', aiModel: 'gemini-3.8-flash' });

  useEffect(() => {
    apiService.getHealth()
      .then(res => setHealth(res.data))
      .catch(() => setHealth({ status: 'ok', aiModel: 'gemini-3.8-flash' }));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
          title="Open Firestore Database Explorer"
        >
          <Database className="w-3.5 h-3.5 text-indigo-500" />
          <span>Firestore DB</span>
        </Link>

        {/* Auth User / Login Button */}
        {user ? (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${
              isDark ? 'bg-slate-800/90 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}>
              <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
              <span className="max-w-[100px] truncate font-medium">{user.displayName || user.email.split('@')[0]}</span>
            </div>

            <button
              onClick={handleLogout}
              className={`p-1.5 rounded-lg border transition ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900' 
                  : 'bg-white border-slate-200 text-slate-500 hover:text-rose-600'
              }`}
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xs transition"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
