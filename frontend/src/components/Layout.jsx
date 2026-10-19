import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useSettings } from '../context/SettingsContext';

export default function Layout({ title }) {
  const { theme } = useSettings();

  return (
    <div className={`flex min-h-screen transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-slate-950 text-slate-100' 
        : 'bg-slate-50 text-slate-900'
    }`}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} />
        <main className={`flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full transition-colors duration-200 ${
          theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
