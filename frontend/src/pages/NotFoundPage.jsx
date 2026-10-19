import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mb-4">
        <AlertOctagon className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white mb-2">404 - Page Not Found</h1>
      <p className="text-slate-400 text-sm max-w-sm mb-6">
        The requested developer resource does not exist or may have been deleted.
      </p>
      <Link
        to="/dashboard"
        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition"
      >
        <Home className="w-4 h-4" />
        Return to Dashboard
      </Link>
    </div>
  );
}
