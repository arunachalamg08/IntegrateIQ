import React from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Terminal,
  PlusCircle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Layers
} from 'lucide-react';

export const WorkspaceListPage: React.FC = () => {
  const { sessions, loadSession, setCurrentPage } = useApp();

  const getVerificationBadge = (status: string) => {
    if (status === 'PASS') return <span className="inline-flex items-center gap-1 text-emerald-400 font-mono font-semibold text-xs"><CheckCircle2 className="w-3.5 h-3.5" />PASS</span>;
    if (status === 'FAIL') return <span className="inline-flex items-center gap-1 text-rose-400 font-mono font-semibold text-xs"><XCircle className="w-3.5 h-3.5" />FAIL</span>;
    if (status === 'INCONCLUSIVE') return <span className="inline-flex items-center gap-1 text-amber-400 font-mono font-semibold text-xs"><AlertCircle className="w-3.5 h-3.5" />INCONCLUSIVE</span>;
    return <span className="text-slate-500 font-mono text-xs">—</span>;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="border-b border-dark-700/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Terminal className="w-4 h-4 text-electric-400" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Debug Workspace</h1>
          </div>
          <p className="text-sm text-slate-400">
            All active and completed debugging sessions. Click a session to open its workspace.
          </p>
        </div>
        <button
          onClick={() => setCurrentPage('new-session')}
          className="px-4 py-2 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-sm shadow-electric-500/20 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          New Session
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="p-12 text-center bg-dark-850 rounded-xl border border-dark-700">
          <Layers className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No debug sessions yet.</p>
          <p className="text-xs text-slate-500 mt-1">Create your first session to begin.</p>
          <button
            onClick={() => setCurrentPage('new-session')}
            className="mt-4 px-5 py-2.5 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Start Debug Session
          </button>
        </div>
      ) : (
        <div className="bg-dark-850 border border-dark-700/80 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-dark-700/60 bg-dark-900/40">
                <th className="text-left px-4 py-3 text-slate-500 font-mono uppercase tracking-wider">Session ID</th>
                <th className="text-left px-4 py-3 text-slate-500 font-mono uppercase tracking-wider">Scenario</th>
                <th className="text-left px-4 py-3 text-slate-500 font-mono uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-slate-500 font-mono uppercase tracking-wider">Patch</th>
                <th className="text-left px-4 py-3 text-slate-500 font-mono uppercase tracking-wider">Verification</th>
                <th className="text-left px-4 py-3 text-slate-500 font-mono uppercase tracking-wider hidden md:table-cell">Updated</th>
                <th className="text-right px-4 py-3 text-slate-500 font-mono uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/40">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-dark-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-electric-400 text-xs">{s.id}</td>
                  <td className="px-4 py-3 text-slate-300 max-w-[180px] truncate">{s.scenarioName}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    {s.patch ? (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        s.patchReviewStatus === 'APPROVED'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                          : s.patchReviewStatus === 'REJECTED'
                          ? 'bg-rose-950/60 text-rose-400 border-rose-500/30'
                          : 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                      }`}>
                        {s.patchReviewStatus}
                      </span>
                    ) : (
                      <span className="text-slate-600 font-mono text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{getVerificationBadge(s.verificationStatus)}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono hidden md:table-cell">
                    <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{s.lastUpdated}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => loadSession(s.id)}
                      className="px-3 py-1 rounded-md bg-dark-800 hover:bg-dark-750 border border-dark-700 text-slate-300 hover:text-white text-xs font-medium transition-colors inline-flex items-center gap-1"
                    >
                      Open <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
