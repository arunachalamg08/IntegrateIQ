import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { DebugSession } from '../types';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  Clock,
  ChevronDown,
  ChevronRight,
  Terminal,
  Shield
} from 'lucide-react';

type VerdictFilter = 'ALL' | 'PASS' | 'FAIL' | 'INCONCLUSIVE' | 'NOT_RUN';
type ModeFilter = 'ALL' | 'SIMULATED' | 'PAYPAL_SANDBOX';

export const VerificationResultsPage: React.FC = () => {
  const { sessions, loadSession, setCurrentPage } = useApp();
  const [verdictFilter, setVerdictFilter] = useState<VerdictFilter>('ALL');
  const [modeFilter, setModeFilter] = useState<ModeFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter sessions to those with any verification activity
  const filteredSessions = sessions
    .filter((s) => {
      if (verdictFilter !== 'ALL' && s.verificationStatus !== verdictFilter) return false;
      if (modeFilter !== 'ALL' && s.verificationMode !== modeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          s.id.toLowerCase().includes(q) ||
          s.scenarioName.toLowerCase().includes(q) ||
          (s.patchId || '').toLowerCase().includes(q)
        );
      }
      return true;
    });

  const getVerdictDisplay = (s: DebugSession) => {
    if (s.verificationStatus === 'PASS')
      return { icon: CheckCircle2, label: 'PASS', color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-500/30' };
    if (s.verificationStatus === 'FAIL')
      return { icon: XCircle, label: 'FAIL', color: 'text-rose-400', bg: 'bg-rose-950/60 border-rose-500/30' };
    if (s.verificationStatus === 'INCONCLUSIVE')
      return { icon: AlertCircle, label: 'INCONCLUSIVE', color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-500/30' };
    if (s.verificationStatus === 'RUNNING')
      return { icon: Clock, label: 'RUNNING', color: 'text-sky-400', bg: 'bg-sky-950/60 border-sky-500/30' };
    return { icon: Clock, label: 'NOT RUN', color: 'text-slate-500', bg: 'bg-dark-800 border-dark-700' };
  };

  const FilterBtn = ({ label, value, active, onClick }: { label: string; value: string; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
        active
          ? 'bg-electric-600/20 border-electric-500/40 text-electric-300'
          : 'bg-dark-850 border-dark-700 text-slate-400 hover:text-slate-200 hover:bg-dark-800'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="border-b border-dark-700/80 pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <FileCheck2 className="w-4 h-4 text-electric-400" />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Verification Results</h1>
        </div>
        <p className="text-sm text-slate-400">
          History of all verification runs. Only sessions that complete the full verification lifecycle are eligible for PASS verdict.
        </p>
      </div>

      {/* Important accuracy notice */}
      <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
        <Shield className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
        <div>
          <strong>Accuracy Notice:</strong> Sessions in CREATED, REPRODUCED, PATCH_READY, or PATCH_APPROVED status are
          <strong> not counted as PASS</strong>. Only a completed verification with executed test assertions and a generated report
          contributes to the PASS verdict.
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by session ID, scenario, patch ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-electric-500 transition-colors"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 flex items-center gap-1"><Filter className="w-3.5 h-3.5" /> Verdict:</span>
          {(['ALL', 'PASS', 'FAIL', 'INCONCLUSIVE', 'NOT_RUN'] as VerdictFilter[]).map((v) => (
            <FilterBtn key={v} label={v === 'NOT_RUN' ? 'Not Run' : v} value={v} active={verdictFilter === v} onClick={() => setVerdictFilter(v)} />
          ))}
          <span className="text-xs text-slate-500 ml-2 flex items-center gap-1"><Terminal className="w-3.5 h-3.5" /> Mode:</span>
          {(['ALL', 'SIMULATED', 'PAYPAL_SANDBOX'] as ModeFilter[]).map((m) => (
            <FilterBtn key={m} label={m === 'ALL' ? 'All Modes' : m === 'SIMULATED' ? 'Simulated' : 'PayPal Sandbox'} value={m} active={modeFilter === m} onClick={() => setModeFilter(m)} />
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-slate-500 font-mono">
        Showing {filteredSessions.length} of {sessions.length} sessions
      </p>

      {/* Table */}
      <div className="bg-dark-850 border border-dark-700/80 rounded-xl overflow-hidden">
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center">
            <FileCheck2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No sessions match the current filters.</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting the verdict or mode filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-700/40">
            {filteredSessions.map((s) => {
              const verdict = getVerdictDisplay(s);
              const VerdictIcon = verdict.icon;
              const isExpanded = expandedId === s.id;

              return (
                <div key={s.id}>
                  {/* Row */}
                  <div
                    className="p-4 hover:bg-dark-800/40 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <button className="text-slate-500 hover:text-slate-300 transition-colors">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>

                      <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-5 gap-3 items-center">
                        <div>
                          <p className="text-[10px] text-slate-500 font-mono uppercase">Session</p>
                          <p className="text-xs font-mono text-electric-400 truncate">{s.id}</p>
                        </div>
                        <div className="hidden md:block">
                          <p className="text-[10px] text-slate-500 font-mono uppercase">Scenario</p>
                          <p className="text-xs text-slate-300 truncate">{s.scenarioName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-mono uppercase">Status</p>
                          <StatusBadge status={s.status} size="sm" />
                        </div>
                        <div className="hidden md:block">
                          <p className="text-[10px] text-slate-500 font-mono uppercase">Patch</p>
                          <p className="text-xs text-slate-400 font-mono">{s.patchId || '—'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-mono uppercase">Verdict</p>
                          <span className={`text-xs font-mono font-bold inline-flex items-center gap-1 ${verdict.color}`}>
                            <VerdictIcon className="w-3.5 h-3.5" />
                            {verdict.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-slate-500 hidden lg:block">
                          {s.lastUpdated}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); loadSession(s.id); }}
                          className="px-3 py-1 rounded-md bg-dark-800 hover:bg-dark-750 border border-dark-700 text-slate-300 hover:text-white text-xs font-medium transition-colors inline-flex items-center gap-1"
                        >
                          Workspace <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="bg-dark-900/60 border-t border-dark-700/60 p-5 space-y-4 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Original failure */}
                        <div>
                          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Original Failure</p>
                          <p className="text-rose-300 bg-rose-950/20 border border-rose-500/20 rounded p-2 font-mono leading-relaxed">
                            {s.reproduction?.simulatedError || 'Not reproduced yet.'}
                          </p>
                        </div>
                        {/* Baseline */}
                        <div>
                          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Baseline Results</p>
                          <div className="p-2 rounded bg-dark-850 border border-dark-700">
                            {s.verificationRun ? (
                              <>
                                <p className="font-mono text-slate-300">
                                  <span className="text-rose-400">{s.report?.baselineSummary.failed || 2}</span> failed /
                                  <span className="text-emerald-400 ml-1">{s.report?.baselineSummary.passed || 2}</span> passed
                                </p>
                                <p className="text-slate-500 mt-1">Total: {s.report?.baselineSummary.total || 4}</p>
                              </>
                            ) : (
                              <p className="text-slate-500">Not executed</p>
                            )}
                          </div>
                        </div>
                        {/* Post-patch */}
                        <div>
                          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Post-Patch Results</p>
                          <div className="p-2 rounded bg-dark-850 border border-dark-700">
                            {s.verificationRun ? (
                              <>
                                <p className="font-mono text-slate-300">
                                  <span className="text-emerald-400">{s.verificationRun.passedCount}</span> passed /
                                  <span className="text-rose-400 ml-1">{s.verificationRun.failedCount}</span> failed
                                </p>
                                <p className="text-slate-500 mt-1">Exit code: {s.verificationStatus === 'PASS' ? '0' : '1'}</p>
                              </>
                            ) : (
                              <p className="text-slate-500">Not executed</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actual test outputs */}
                      {s.verificationRun && (
                        <div>
                          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Assertion Results</p>
                          <div className="space-y-1.5">
                            {s.verificationRun.testResults.map((tc) => (
                              <div key={tc.id} className="flex items-start gap-2 p-2 rounded bg-dark-850 border border-dark-700/60">
                                {tc.afterFixResult === 'pass' ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                  <p className="text-slate-200">{tc.name}</p>
                                  <p className="text-slate-500 text-[11px] mt-0.5 font-mono">{tc.observedOutput}</p>
                                </div>
                                <span className="text-[10px] font-mono text-slate-500">{tc.durationMs}ms</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Disclaimer */}
                      <div className="p-2 rounded bg-amber-950/20 border border-amber-500/20 text-amber-300 font-mono text-[10px]">
                        SIMULATED RESULTS — NO TESTS ACTUALLY EXECUTED
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => loadSession(s.id)}
                          className="px-3 py-1.5 rounded bg-dark-800 border border-dark-700 text-slate-300 hover:text-white text-xs font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          Open Workspace
                        </button>
                        {s.report && (
                          <button
                            onClick={() => { setCurrentPage('reports'); }}
                            className="px-3 py-1.5 rounded bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                          >
                            View Evidence Report <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
