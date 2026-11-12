import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ErrorReport, ErrorReportCategory, RemediationStatus } from '../types';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Download,
  ChevronDown,
  ChevronRight,
  Clock,
  Shield,
  Cpu
} from 'lucide-react';

type CategoryFilter = 'ALL' | ErrorReportCategory;

export const EvidenceReportsPage: React.FC = () => {
  const { errorReports, setCurrentPage, setSelectedReportId, updateRemediationAction, addToast } = useApp();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = errorReports.filter((r) => {
    if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.sessionId.toLowerCase().includes(q) ||
        r.scenarioName.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        (r.patchId || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getCategoryMeta = (cat: ErrorReportCategory) => {
    switch (cat) {
      case 'VERIFICATION_PASS':
        return { icon: CheckCircle2, label: 'Verification PASS', color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-500/30' };
      case 'VERIFICATION_FAIL':
        return { icon: XCircle, label: 'Verification FAIL', color: 'text-rose-400', bg: 'bg-rose-950/60 border-rose-500/30' };
      case 'INCONCLUSIVE':
        return { icon: AlertCircle, label: 'Inconclusive', color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-500/30' };
      default:
        return { icon: AlertTriangle, label: 'Error / Active', color: 'text-red-400', bg: 'bg-red-950/60 border-red-500/30' };
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return 'text-red-400 bg-red-950/60 border-red-500/30';
      case 'HIGH': return 'text-rose-400 bg-rose-950/60 border-rose-500/30';
      case 'MEDIUM': return 'text-amber-400 bg-amber-950/60 border-amber-500/30';
      case 'LOW': return 'text-sky-400 bg-sky-950/60 border-sky-500/30';
      default: return 'text-slate-400 bg-dark-800 border-dark-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'text-emerald-400';
      case 'IN_PROGRESS': return 'text-sky-400';
      case 'OPEN': return 'text-rose-400';
      default: return 'text-slate-500';
    }
  };

  const remediationTotal = (r: ErrorReport) => r.remediationActions.length;
  const remediationDone = (r: ErrorReport) => r.remediationActions.filter(a => a.status === 'COMPLETED').length;

  const handleExportJSON = (r: ErrorReport) => {
    // Attempt download from backend export endpoint
    window.open(`/api/reports/${r.id}/export?format=json`, '_blank');
    addToast(`Exported: ${r.id}.json`, 'success');
  };

  const handleExportHTML = (r: ErrorReport) => {
    // Attempt download from backend export endpoint
    window.open(`/api/reports/${r.id}/export?format=html`, '_blank');
    addToast(`Exported: ${r.id}.html`, 'success');
  };

  const FilterBtn = ({ label, value, active, onClick }: { label: string; value: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${active ? 'bg-electric-600/20 border-electric-500/40 text-electric-300' : 'bg-dark-850 border-dark-700 text-slate-400 hover:text-slate-200 hover:bg-dark-800'}`}>
      {label}
    </button>
  );

  const RemediationStatusSelector = ({ reportId, action }: { reportId: string; action: { id: string; status: RemediationStatus } }) => {
    const statuses: RemediationStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'];
    const colorMap: Record<RemediationStatus, string> = {
      NOT_STARTED: 'text-slate-400',
      IN_PROGRESS: 'text-sky-400',
      COMPLETED: 'text-emerald-400',
      BLOCKED: 'text-rose-400'
    };
    return (
      <select
        value={action.status}
        onChange={(e) => updateRemediationAction(reportId, action.id, e.target.value as RemediationStatus)}
        onClick={(e) => e.stopPropagation()}
        className={`bg-dark-900 border border-dark-700 rounded px-2 py-0.5 text-[10px] font-mono focus:outline-none focus:border-electric-500 ${colorMap[action.status]}`}
      >
        {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
      </select>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="border-b border-dark-700/80 pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <FileText className="w-4 h-4 text-electric-400" />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Evidence Reports</h1>
        </div>
        <p className="text-sm text-slate-400">
          All error reports, verification outcomes, and developer remediation plans. Each report includes actionable next steps.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-slate-500 flex items-center gap-1 self-center"><Filter className="w-3.5 h-3.5" /> Category:</span>
        {[
          { v: 'ALL', label: `All (${errorReports.length})` },
          { v: 'ERROR', label: `Error (${errorReports.filter(r => r.category === 'ERROR').length})` },
          { v: 'VERIFICATION_PASS', label: `Passed (${errorReports.filter(r => r.category === 'VERIFICATION_PASS').length})` },
          { v: 'VERIFICATION_FAIL', label: `Failed (${errorReports.filter(r => r.category === 'VERIFICATION_FAIL').length})` },
          { v: 'INCONCLUSIVE', label: `Inconclusive (${errorReports.filter(r => r.category === 'INCONCLUSIVE').length})` },
        ].map(({ v, label }) => (
          <FilterBtn key={v} label={label} value={v} active={categoryFilter === v} onClick={() => setCategoryFilter(v as CategoryFilter)} />
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search reports…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-electric-500 transition-colors"
        />
      </div>

      <p className="text-xs text-slate-500 font-mono">Showing {filtered.length} of {errorReports.length} reports</p>

      {/* Report Cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="p-12 text-center bg-dark-850 rounded-xl border border-dark-700">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No reports match the current filters.</p>
          </div>
        )}

        {filtered.map((report) => {
          const meta = getCategoryMeta(report.category);
          const MetaIcon = meta.icon;
          const isExpanded = expandedId === report.id;
          const done = remediationDone(report);
          const total = remediationTotal(report);

          return (
            <div key={report.id} className="bg-dark-850 border border-dark-700/80 rounded-xl overflow-hidden">
              {/* Card header */}
              <div
                className="p-5 cursor-pointer hover:bg-dark-800/40 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : report.id)}
              >
                <div className="flex items-start gap-3">
                  <button className="text-slate-500 hover:text-slate-300 mt-0.5 shrink-0">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <div className={`p-1.5 rounded-lg border shrink-0 ${meta.bg}`}>
                    <MetaIcon className={`w-4 h-4 ${meta.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${meta.bg} ${meta.color}`}>{meta.label}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getSeverityColor(report.severity)}`}>{report.severity}</span>
                      <span className={`text-[10px] font-mono font-semibold ${getStatusColor(report.status)}`}>{report.status}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-white leading-snug">{report.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">{report.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-mono text-slate-500">
                      <span className="text-electric-400">{report.id}</span>
                      <span>·</span>
                      <span>{report.sessionId}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(report.createdAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <span>Remediation: {done}/{total} done</span>
                    </div>
                    {/* Remediation progress bar */}
                    {total > 0 && (
                      <div className="mt-2 w-full max-w-xs bg-dark-900 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-electric-500 h-1.5 rounded-full transition-all" style={{ width: `${(done / total) * 100}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-auto" onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleExportJSON(report)} className="px-2.5 py-1.5 rounded border border-dark-700 bg-dark-900 hover:bg-dark-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors inline-flex items-center gap-1">
                      <Download className="w-3 h-3" /> JSON
                    </button>
                    <button onClick={() => handleExportHTML(report)} className="px-2.5 py-1.5 rounded border border-dark-700 bg-dark-900 hover:bg-dark-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors inline-flex items-center gap-1">
                      <Download className="w-3 h-3" /> HTML
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="border-t border-dark-700/60 bg-dark-900/60 p-5 space-y-5 text-xs">
                  {/* Executive Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Error Message</p>
                      <div className="p-2.5 rounded bg-rose-950/20 border border-rose-500/20 font-mono text-rose-300 leading-relaxed">{report.errorMessage}</div>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Affected Component</p>
                      <div className="p-2.5 rounded bg-dark-850 border border-dark-700 font-mono text-slate-300 space-y-1">
                        <p className="text-electric-400">{report.affectedFile}</p>
                        <p className="text-slate-400">{report.affectedFunction}</p>
                      </div>
                    </div>
                  </div>

                  {/* Root Cause */}
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Root Cause Analysis</p>
                    <div className="space-y-2">
                      {report.confirmedCause && (
                        <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/20 text-emerald-300">
                          <span className="font-semibold">✓ Confirmed: </span>{report.confirmedCause}
                        </div>
                      )}
                      <div className="p-2.5 rounded bg-amber-950/20 border border-amber-500/20 text-amber-200">
                        <span className="font-semibold">⚠ AI Hypothesis (not confirmed): </span>{report.aiHypothesis}
                        <span className="text-slate-500 ml-2">— {report.aiConfidenceLabel}</span>
                      </div>
                      {report.missingEvidence && (
                        <div className="p-2.5 rounded bg-dark-850 border border-dark-700 text-slate-400">
                          <span className="font-semibold">Missing Evidence: </span>{report.missingEvidence}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Test Results */}
                  {report.baselineTestResults && (
                    <div>
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Test Results</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded bg-dark-850 border border-dark-700">
                          <p className="text-[10px] text-slate-500 uppercase mb-1">Baseline</p>
                          <p className="font-mono"><span className="text-emerald-400">{report.baselineTestResults.passed}P</span> / <span className="text-rose-400">{report.baselineTestResults.failed}F</span> of {report.baselineTestResults.total}</p>
                        </div>
                        {report.afterFixTestResults && (
                          <div className="p-3 rounded bg-dark-850 border border-dark-700">
                            <p className="text-[10px] text-slate-500 uppercase mb-1">Post-Patch</p>
                            <p className="font-mono"><span className="text-emerald-400">{report.afterFixTestResults.passed}P</span> / <span className="text-rose-400">{report.afterFixTestResults.failed}F</span> of {report.afterFixTestResults.total}</p>
                            {report.exitCode !== undefined && <p className="text-slate-500 mt-1">Exit: {report.exitCode}</p>}
                          </div>
                        )}
                      </div>
                      {report.failedTests && report.failedTests.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {report.failedTests.map((ft, i) => (
                            <div key={i} className="p-2 rounded bg-rose-950/20 border border-rose-500/20 font-mono text-rose-300 text-[11px]">✗ {ft}</div>
                          ))}
                        </div>
                      )}
                      {report.exactFailureMessages && report.exactFailureMessages.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {report.exactFailureMessages.map((msg, i) => (
                            <div key={i} className="p-2 rounded bg-dark-850 border border-dark-700 font-mono text-slate-400 text-[10px]">{msg}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inconclusive detail */}
                  {report.category === 'INCONCLUSIVE' && (
                    <div className="space-y-2">
                      {report.whatWasAttempted && <div className="p-2.5 rounded bg-dark-850 border border-dark-700"><span className="font-semibold text-slate-300">What was attempted: </span><span className="text-slate-400">{report.whatWasAttempted}</span></div>}
                      {report.whatExecuted && <div className="p-2.5 rounded bg-dark-850 border border-dark-700"><span className="font-semibold text-slate-300">What executed: </span><span className="text-slate-400">{report.whatExecuted}</span></div>}
                      {report.whatDidNotExecute && <div className="p-2.5 rounded bg-dark-850 border border-dark-700"><span className="font-semibold text-slate-300">What did NOT execute: </span><span className="text-rose-300">{report.whatDidNotExecute}</span></div>}
                      {report.whyInconclusiveReason && <div className="p-2.5 rounded bg-amber-950/20 border border-amber-500/20 text-amber-300"><span className="font-semibold">Why inconclusive: </span>{report.whyInconclusiveReason}</div>}
                    </div>
                  )}

                  {/* Developer Remediation Plan */}
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-electric-400" />
                      What the Developer Should Do
                    </p>
                    <div className="space-y-2">
                      {report.remediationActions.map((action, idx) => (
                        <div key={action.id} className="p-3 rounded bg-dark-850 border border-dark-700/60 flex items-start gap-3">
                          <span className="text-[10px] font-mono text-slate-600 mt-0.5 w-5 shrink-0">{idx + 1}.</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                              <span className="font-semibold text-slate-200">{action.title}</span>
                              <span className={`text-[10px] font-mono px-1 py-0.5 rounded border ${
                                action.priority === 'CRITICAL' ? 'text-red-400 bg-red-950/40 border-red-500/30' :
                                action.priority === 'HIGH' ? 'text-rose-400 bg-rose-950/40 border-rose-500/30' :
                                action.priority === 'MEDIUM' ? 'text-amber-400 bg-amber-950/40 border-amber-500/30' :
                                'text-sky-400 bg-sky-950/40 border-sky-500/30'
                              }`}>{action.priority}</span>
                              {action.sourceType === 'AI_SUGGESTION' && (
                                <span className="text-[10px] font-mono px-1 py-0.5 rounded border text-purple-400 bg-purple-950/40 border-purple-500/30 flex items-center gap-0.5">
                                  <Cpu className="w-2.5 h-2.5" /> AI Suggestion
                                </span>
                              )}
                            </div>
                            <p className="text-slate-400 leading-relaxed">{action.description}</p>
                            <p className="text-slate-500 mt-0.5 italic">{action.reason}</p>
                          </div>
                          <RemediationStatusSelector reportId={report.id} action={action} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Simulation disclaimer */}
                  <div className="p-2.5 rounded bg-amber-950/20 border border-amber-500/20 text-amber-300 font-mono text-[10px] flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    SIMULATED DEMO REPORT — Execution Mode: {report.executionMode}. No real tests executed. No real PayPal API contacted.
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
