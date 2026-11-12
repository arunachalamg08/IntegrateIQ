import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { setCurrentPage } = useApp();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center text-amber-400 mb-6 shadow-lg shadow-black/20">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-dark-800 text-slate-400 border border-dark-700 mb-3">
        404 — ROUTE NOT FOUND
      </span>

      <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
        Page Does Not Exist
      </h1>

      <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
        The requested path could not be resolved in the IntegrateIQ workspace. Please return to the overview dashboard or choose another section from the sidebar.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentPage('overview')}
          className="px-4 py-2.5 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-sm shadow-electric-500/20"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2.5 rounded-lg border border-dark-700 bg-dark-850 hover:bg-dark-800 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
      </div>
    </div>
  );
};
