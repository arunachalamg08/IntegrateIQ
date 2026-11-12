import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';

export const DemoNoticeBanner: React.FC = () => {
  return (
    <div className="bg-dark-900 border-b border-dark-700/80 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-electric-500/15 text-electric-300 border border-electric-500/30">
          <Activity className="w-3 h-3 text-electric-400" />
          REAL-TIME EXECUTION ACTIVE
        </span>
        <span className="text-slate-400 hidden sm:inline">
          Subprocess Pytest runner executes isolated test fixtures. Live Gemini API &amp; PayPal Sandbox verified when configured.
        </span>
      </div>

      <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          &ldquo;AI suggests, tests decide.&rdquo;
        </span>
        <span className="hidden md:inline text-slate-600">|</span>
        <span className="hidden md:inline text-slate-400">
          FastAPI &bull; Python 3.12 &bull; SQLite Persistence
        </span>
      </div>
    </div>
  );
};
