import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Code2, 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  FileText, 
  Settings, 
  Database,
  Moon, 
  Sun, 
  Languages,
  LogIn,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, explanationLanguage, setExplanationLanguage } = useSettings();
  const { user, logout } = useAuth();

  const isDark = theme === 'dark';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'New Analysis', path: '/workspace', icon: PlusCircle },
    { label: 'History', path: '/history', icon: History },
    { label: 'PDF Reports', path: '/reports', icon: FileText },
    { label: 'Firestore DB', path: '/database', icon: Database },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className={`w-64 border-r flex flex-col justify-between h-screen sticky top-0 transition-colors duration-200 z-40 ${
      isDark 
        ? 'bg-slate-900 border-slate-800 text-slate-100' 
        : 'bg-white border-slate-200 text-slate-800 shadow-sm'
    }`}>
      <div>
        {/* Brand */}
        <div className={`p-6 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800/80' : 'border-slate-200'
        }`}>
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <span className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                CodeSense
              </span>
              <span className="text-xs ml-1 px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-500 font-medium">AI</span>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Smart Code Analysis</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : isDark 
                      ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Controls & Auth */}
      <div className={`p-4 border-t space-y-3 ${
        isDark ? 'border-slate-800/80' : 'border-slate-200'
      }`}>
        {/* User Account / Login Status */}
        {user ? (
          <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2 overflow-hidden">
              <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="truncate">
                <p className={`text-xs font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {user.displayName || user.email.split('@')[0]}
                </p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1 rounded text-slate-400 hover:text-rose-500 transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In / Register</span>
          </Link>
        )}

        {/* Language switch */}
        <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
          isDark 
            ? 'bg-slate-950/60 border-slate-800 text-slate-300' 
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-2 text-xs">
            <Languages className="w-4 h-4 text-indigo-500" />
            <span>AI Teacher:</span>
          </div>
          <button
            onClick={() => setExplanationLanguage(explanationLanguage === 'en' ? 'ta' : 'en')}
            className="text-xs px-2.5 py-1 rounded font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-xs cursor-pointer"
          >
            {explanationLanguage === 'en' ? 'English (EN)' : 'தமிழ் (TA)'}
          </button>
        </div>

        {/* Theme and Mode Switch */}
        <div className={`flex items-center justify-between text-xs px-1 ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <span className="font-medium">Interface Theme</span>
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition border cursor-pointer ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' 
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
            title="Toggle Light/Dark Theme"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
