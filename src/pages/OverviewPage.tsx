import React from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_SCENARIOS } from '../data/mockScenarios';
import { StatusBadge } from '../components/common/StatusBadge';
import { WorkflowDiagram } from '../components/common/WorkflowDiagram';
import {
  Terminal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  Clock,
  Layers,
  FileDiff,
  FileCheck2,
  TrendingUp,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export const OverviewPage: React.FC = () => {
  const { setCurrentPage, sessions, loadSession, errorReports } = useApp();

  // ── Compute real metrics from session records ──
  const totalSessions = sessions.length;

  const verifiedPass = sessions.filter(
    (s) => s.verificationStatus === 'PASS' && !!s.report
  ).length;

  const verifiedFail = sessions.filter(
    (s) => s.verificationStatus === 'FAIL'
  ).length;

  const inconclusive = sessions.filter(
    (s) => s.verificationStatus === 'INCONCLUSIVE'
  ).length;

  const pendingReview = sessions.filter(
    (s) => s.patchReviewStatus === 'PENDING' && !!s.patch
  ).length;

  const openDebugSessions = sessions.filter(
    (s) =>
      s.status !== 'VERIFICATION_COMPLETED' &&
      s.status !== 'VERIFIED' &&
      s.verificationStatus !== 'PASS'
  ).length;

  // ── Scenario usage breakdown ──
  const scenarioUsage = MOCK_SCENARIOS.map((sc) => ({
    name: sc.name.length > 22 ? sc.name.slice(0, 22) + '…' : sc.name,
    count: sessions.filter((s) => s.scenarioId === sc.id).length
  }));

  // ── Recent sessions (last 5) ──
  const recentSessions = sessions.slice(0, 5);

  // ── KPI card helper ──
  const KpiCard = ({
    label,
    value,
    icon: Icon,
    color,
    sub
  }: {
    label: string;
    value: number;
    icon: React.ElementType;
    color: string;
    sub?: string;
  }) => (
    <div className="p-5 rounded-xl bg-dark-850 border border-dark-700/80 flex items-start justify-between gap-3">
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
        {sub && <p className="text-[11px] text-slate-500 mt-1 font-mono">{sub}</p>}
      </div>
      <div className={`p-2.5 rounded-lg bg-dark-900 border border-dark-700`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-700/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Payment Integration Health
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-electric-950/60 text-electric-400 border border-electric-500/30">
              ACTIVE BACKEND ENGINE
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Investigate failures. Review fixes. Verify before deployment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage('verification-results')}
            className="px-4 py-2 rounded-lg border border-dark-700 bg-dark-850 hover:bg-dark-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            Verification Results
          </button>
          <button
            onClick={() => setCurrentPage('new-session')}
            className="px-4 py-2 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm shadow-electric-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Start Debug Session</span>
          </button>
        </div>
      </div>

      {/* KPI Cards — computed from real session records */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Session Metrics</p>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-dark-800 text-slate-500 border border-dark-700">
            Computed from {totalSessions} session{totalSessions !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard label="Total Sessions" value={totalSessions} icon={Terminal} color="text-electric-400" />
          <KpiCard label="Verified PASS" value={verifiedPass} icon={CheckCircle2} color="text-emerald-400" sub="Completed with evidence" />
          <KpiCard label="Verified FAIL" value={verifiedFail} icon={XCircle} color="text-rose-400" sub="Failed assertions" />
          <KpiCard label="Inconclusive" value={inconclusive} icon={AlertCircle} color="text-amber-400" sub="Missing evidence" />
          <KpiCard label="Pending Review" value={pendingReview} icon={FileDiff} color="text-sky-400" sub="Patches awaiting approval" />
          <KpiCard label="Open Sessions" value={openDebugSessions} icon={Activity} color="text-violet-400" sub="In progress" />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scenario Usage */}
        <div className="bg-dark-850 border border-dark-700/80 rounded-xl p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-electric-400" />
            Scenario Usage Distribution
          </h3>
          {scenarioUsage.every((s) => s.count === 0) ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-xs">
              No sessions yet. Create your first debug session.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={scenarioUsage} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: '#e2e8f0' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Error Reports by Category */}
        <div className="bg-dark-850 border border-dark-700/80 rounded-xl p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-electric-400" />
            Evidence Reports by Category
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Successful Verifications', count: errorReports.filter(r => r.category === 'VERIFICATION_PASS').length, color: 'bg-emerald-500' },
              { label: 'Error / Active Failures', count: errorReports.filter(r => r.category === 'ERROR').length, color: 'bg-rose-500' },
              { label: 'Failed Verifications', count: errorReports.filter(r => r.category === 'VERIFICATION_FAIL').length, color: 'bg-amber-500' },
              { label: 'Inconclusive Results', count: errorReports.filter(r => r.category === 'INCONCLUSIVE').length, color: 'bg-sky-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-xs">
                <span className="text-slate-400 w-44 shrink-0">{item.label}</span>
                <div className="flex-1 bg-dark-900 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${errorReports.length > 0 ? (item.count / errorReports.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-slate-300 font-mono font-bold w-6 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div className="bg-dark-850 border border-dark-700/80 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-dark-700/80 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-electric-400" />
            Recent Debug Sessions
          </h3>
          <button
            onClick={() => setCurrentPage('workspace')}
            className="text-xs text-electric-400 hover:text-electric-300 font-medium flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-dark-700/60">
                <th className="text-left px-4 py-3 text-slate-500 font-mono uppercase tracking-wider">Session ID</th>
                <th className="text-left px-4 py-3 text-slate-500 font-mono uppercase tracking-wider">Scenario</th>
                <th className="text-left px-4 py-3 text-slate-500 font-mono uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-slate-500 font-mono uppercase tracking-wider">Verification</th>
                <th className="text-left px-4 py-3 text-slate-500 font-mono uppercase tracking-wider">Updated</th>
                <th className="text-right px-4 py-3 text-slate-500 font-mono uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/40">
              {recentSessions.map((s) => (
                <tr key={s.id} className="hover:bg-dark-800/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-electric-400">{s.id}</td>
                  <td className="px-4 py-3 text-slate-300 max-w-[200px] truncate">{s.scenarioName}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    {s.verificationStatus === 'PASS' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-mono font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                      </span>
                    ) : s.verificationStatus === 'FAIL' ? (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-mono font-semibold">
                        <XCircle className="w-3.5 h-3.5" /> FAIL
                      </span>
                    ) : s.verificationStatus === 'INCONCLUSIVE' ? (
                      <span className="inline-flex items-center gap-1 text-amber-400 font-mono font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" /> INCONCLUSIVE
                      </span>
                    ) : (
                      <span className="text-slate-500 font-mono">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono">{s.lastUpdated}</td>
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
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No sessions yet. Click "Start Debug Session" to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workflow Diagram */}
      <WorkflowDiagram currentStage={undefined} />

      {/* Quick Actions */}
      <div className="bg-dark-850 border border-dark-700/80 rounded-xl p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-electric-400" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'New Debug Session', page: 'new-session' as const, icon: PlusCircle, color: 'bg-electric-600 hover:bg-electric-500 text-white' },
            { label: 'View All Scenarios', page: 'scenarios' as const, icon: Layers, color: 'bg-dark-800 hover:bg-dark-750 border border-dark-700 text-slate-300' },
            { label: 'Review Patches', page: 'patch-review' as const, icon: FileDiff, color: 'bg-dark-800 hover:bg-dark-750 border border-dark-700 text-slate-300' },
            { label: 'Verification Results', page: 'verification-results' as const, icon: CheckCircle2, color: 'bg-dark-800 hover:bg-dark-750 border border-dark-700 text-slate-300' },
            { label: 'Evidence Reports', page: 'reports' as const, icon: FileCheck2, color: 'bg-dark-800 hover:bg-dark-750 border border-dark-700 text-slate-300' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.page}
                onClick={() => setCurrentPage(action.page)}
                className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${action.color}`}
              >
                <Icon className="w-4 h-4" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI suggests, tests decide */}
      <div className="p-5 rounded-xl bg-dark-900 border border-electric-500/20">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <p className="text-xs font-mono uppercase tracking-widest text-electric-400 mb-1">Core Principle</p>
            <h3 className="text-base font-bold text-white">"AI suggests, tests decide."</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              IntegrateIQ uses AI to generate probable root causes and candidate patches. The developer approves every patch. 
              An independent, deterministic test suite produces the final verdict — PASS, FAIL, or INCONCLUSIVE.
              <strong className="text-amber-400"> No AI-generated result is accepted without test evidence.</strong>
            </p>
          </div>
          <button
            onClick={() => setCurrentPage('new-session')}
            className="px-5 py-2.5 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-sm shadow-electric-500/20 shrink-0"
          >
            <span>Start Debugging</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
