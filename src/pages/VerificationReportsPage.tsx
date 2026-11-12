import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EvidencePanel } from '../components/verification/EvidencePanel';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  FileCheck2,
  Download,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Terminal,
  Layers,
  FileCode,
  FileText,
  AlertCircle
} from 'lucide-react';

export const VerificationReportsPage: React.FC = () => {
  const { allReports, activeSession, addToast } = useApp();
  const [selectedReportId, setSelectedReportId] = useState<string>(
    allReports[0]?.id || (activeSession?.report?.id ?? 'REP-2026-PAYPAL-1042')
  );
  const [copied, setCopied] = useState(false);

  // If activeSession has a report not yet in allReports list, use that
  const currentReport =
    allReports.find((r) => r.id === selectedReportId) ||
    activeSession?.report ||
    allReports[0];

  if (!currentReport) {
    return (
      <div className="p-8 text-center bg-dark-850 rounded-lg border border-dark-700">
        <p className="text-slate-400">No verification reports generated yet.</p>
        <p className="text-xs text-slate-500 mt-1">Complete a debug session verification to issue a report.</p>
      </div>
    );
  }

  const handleCopySummary = () => {
    const summaryText = `[INTEGRATEIQ SIMULATED VERIFICATION REPORT]
Report ID: ${currentReport.id}
Session: ${currentReport.sessionId}
Scenario: ${currentReport.scenarioName}
Final Status: ${currentReport.finalStatus}
Baseline: ${currentReport.baselineSummary.passed} passed / ${currentReport.baselineSummary.failed} failed
After Fix: ${currentReport.afterFixSummary.passed} passed / ${currentReport.afterFixSummary.failed} failed
Verification Level: ${currentReport.verificationLevel}
PayPal Sandbox: ${currentReport.sandboxVerification}
Actual Tests Executed: NO (Simulated Visual Prototype)
Real Payment Processed: NO`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    addToast('Report summary copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const reportData = {
      watermark: 'INTEGRATEIQ_DEMO_REPORT_NOT_FOR_PRODUCTION',
      generatedAt: new Date().toISOString(),
      report: currentReport
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integrateiq-demo-report-${currentReport.id.toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(`Downloaded demo report: ${currentReport.id}.json`, 'info');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="border-b border-dark-700/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              AUDIT TRAIL
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Report: {currentReport.id}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Verification Reports &amp; Evidence
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Tamper-evident verification records linking failure reproduction, code diffs, and test assertions.
          </p>
        </div>

        {/* Action CTAs & Report Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {allReports.length > 1 && (
            <div className="flex items-center gap-2 mr-2">
              <label htmlFor="report-select" className="text-xs text-slate-400 font-mono">
                Select Report:
              </label>
              <select
                id="report-select"
                value={currentReport.id}
                onChange={(e) => setSelectedReportId(e.target.value)}
                className="bg-dark-900 border border-dark-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-electric-500"
              >
                {allReports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id} — {r.scenarioName.length > 25 ? r.scenarioName.slice(0, 25) + '...' : r.scenarioName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleCopySummary}
            className="px-3.5 py-2 rounded-lg border border-dark-700 bg-dark-850 hover:bg-dark-800 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Report Summary'}</span>
          </button>

          <button
            onClick={handleDownloadReport}
            className="px-4 py-2 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm shadow-electric-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Demo Report</span>
          </button>
        </div>
      </div>

      {/* Prominent Demo Watermark Header */}
      <div className="p-4 rounded-lg bg-dark-900 border-2 border-dashed border-amber-500/40 text-amber-300 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <h3 className="text-xs font-bold font-mono tracking-wider uppercase">
              SIMULATED DEMO REPORT — NOT FOR PRODUCTION USE
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              This document reflects local fixture simulation assertions. No live PayPal API endpoints or payment rails were contacted.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
          PROTOTYPE
        </span>
      </div>

      {/* 10 Structured Report Sections */}
      <div className="bg-dark-850 border border-dark-700/80 rounded-xl overflow-hidden divide-y divide-dark-700/70">
        {/* Section 1 & 10: Session Summary & Final Status */}
        <div className="p-6 bg-dark-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
              1. Session Summary
            </span>
            <h2 className="text-base font-bold text-white">
              {currentReport.scenarioName}
            </h2>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span>Session: <span className="text-electric-400">{currentReport.sessionId}</span></span>
              <span>&bull;</span>
              <span>Created: {new Date(currentReport.createdAt).toUTCString()}</span>
            </div>
          </div>

          <div className="text-right sm:text-right">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
              10. Final Verification Status
            </span>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-sm font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {currentReport.finalStatus}
            </div>
          </div>
        </div>

        {/* Section 2: Original Failure */}
        <div className="p-6 space-y-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
            2. Original Defect &amp; Failure Observation
          </span>
          <div className="p-3.5 rounded bg-rose-950/20 border border-rose-500/20 text-xs text-rose-300 font-mono">
            {currentReport.originalFailureSummary}
          </div>
        </div>

        {/* Section 3: Probable Root Cause */}
        <div className="p-6 space-y-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
            3. Probable Root Cause Anatomy
          </span>
          <div className="p-3.5 rounded bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200 font-mono">
            {currentReport.probableRootCause}
          </div>
        </div>

        {/* Section 4: Proposed Patch Summary */}
        <div className="p-6 space-y-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
            4. Proposed Patch Summary
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {currentReport.patchSummary}
          </p>
        </div>

        {/* Section 5 & 6: Baseline vs After-Fix Test Results */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Baseline */}
          <div className="p-4 rounded-lg bg-dark-900 border border-dark-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                5. Baseline Test Results
              </span>
              <span className="text-xs font-mono font-semibold text-rose-400">
                {currentReport.baselineSummary.passed}/{currentReport.baselineSummary.total} Passed
              </span>
            </div>
            <div className="w-full bg-dark-800 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="bg-emerald-500 h-2 rounded-full"
                style={{ width: `${(currentReport.baselineSummary.passed / currentReport.baselineSummary.total) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Demonstrates defect presence in pre-patch code.
            </p>
          </div>

          {/* After Fix */}
          <div className="p-4 rounded-lg bg-dark-900 border border-dark-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                6. After-Fix Test Results
              </span>
              <span className="text-xs font-mono font-semibold text-emerald-400">
                {currentReport.afterFixSummary.passed}/{currentReport.afterFixSummary.total} Passed (100%)
              </span>
            </div>
            <div className="w-full bg-dark-800 rounded-full h-2 overflow-hidden mb-2">
              <div className="bg-emerald-500 h-2 rounded-full w-full" />
            </div>
            <p className="text-[11px] text-slate-400">
              All 4 mock assertions satisfied without regression.
            </p>
          </div>
        </div>

        {/* Section 7: Regression Checks */}
        <div className="p-6 space-y-3">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
            7. Automated Regression Checks
          </span>
          <div className="space-y-2">
            {currentReport.regressionChecks.map((reg, idx) => (
              <div
                key={idx}
                className="p-3 rounded bg-dark-900/60 border border-dark-700/50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-mono font-bold">✓</span>
                  <span className="font-semibold text-slate-200">{reg.checkName}</span>
                  <span className="text-slate-400 hidden sm:inline">— {reg.description}</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                  PASS
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 8: Verification Environment Distinctions */}
        <div className="p-6 space-y-3">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
            8. Verification Environment Distinctions
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded bg-dark-900 border border-dark-700/60">
              <span className="text-[10px] text-slate-500 uppercase block mb-1">Verification Level</span>
              <span className="text-slate-200 font-semibold">{currentReport.verificationLevel}</span>
            </div>
            <div className="p-3 rounded bg-dark-900 border border-dark-700/60">
              <span className="text-[10px] text-slate-500 uppercase block mb-1">Actual PayPal Sandbox</span>
              <span className="text-amber-400 font-semibold">{currentReport.sandboxVerification}</span>
            </div>
            <div className="p-3 rounded bg-dark-900 border border-dark-700/60">
              <span className="text-[10px] text-slate-500 uppercase block mb-1">Production Verification</span>
              <span className="text-rose-400 font-semibold">{currentReport.productionVerification}</span>
            </div>
            <div className="p-3 rounded bg-dark-900 border border-dark-700/60">
              <span className="text-[10px] text-slate-500 uppercase block mb-1">Actual Tests Executed</span>
              <span className="text-amber-400 font-semibold">No (Simulated Prototype)</span>
            </div>
            <div className="p-3 rounded bg-dark-900 border border-dark-700/60 sm:col-span-2">
              <span className="text-[10px] text-slate-500 uppercase block mb-1">Real Payment Processed</span>
              <span className="text-emerald-400 font-semibold">No (Zero financial risk in demo)</span>
            </div>
          </div>
        </div>

        {/* Section 9: Verification Limitations */}
        <div className="p-6 space-y-3">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
            9. Verification Scope &amp; Known Limitations
          </span>
          <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside">
            {currentReport.limitations.map((lim, idx) => (
              <li key={idx} className="leading-relaxed">
                {lim}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Prominent Evidence Section */}
      <EvidencePanel evidence={currentReport.evidence} />
    </div>
  );
};
