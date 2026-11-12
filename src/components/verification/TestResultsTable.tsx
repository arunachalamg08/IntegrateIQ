import React from 'react';
import { TestCase, SessionWorkflowStatus } from '../../types';
import { CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';

interface TestResultsTableProps {
  testCases: TestCase[];
  status: SessionWorkflowStatus;
  showComparison?: boolean;
}

export const TestResultsTable: React.FC<TestResultsTableProps> = ({
  testCases,
  status,
  showComparison = true
}) => {
  const isVerified = status === 'VERIFICATION_COMPLETED' || status === 'VERIFIED';
  const isRunning = status === 'VERIFICATION_RUNNING';

  const baselinePassed = testCases.filter((t) => t.baselineResult === 'pass').length;
  const baselineFailed = testCases.filter((t) => t.baselineResult === 'fail').length;

  const afterPassed = isVerified
    ? testCases.filter((t) => t.afterFixResult === 'pass').length
    : 0;
  const afterFailed = isVerified
    ? testCases.filter((t) => t.afterFixResult === 'fail').length
    : 0;

  return (
    <div className="bg-dark-850 border border-dark-700/80 rounded-lg overflow-hidden flex flex-col">
      {/* Header and Summary Bar */}
      <div className="p-4 bg-dark-900 border-b border-dark-700/80 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Deterministic Test Suite Comparison
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Independent fixture runner executing before-and-after regression checks
          </p>
        </div>

        {/* Comparison Summary Badges */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-2.5 py-1 rounded bg-dark-800 border border-dark-700 flex items-center gap-2">
            <span className="text-slate-400">Baseline:</span>
            <span className="text-emerald-400 font-semibold">{baselinePassed}P</span>
            <span className="text-rose-400 font-semibold">{baselineFailed}F</span>
          </div>

          {showComparison && (
            <div className={`px-2.5 py-1 rounded border flex items-center gap-2 ${
              isVerified
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-dark-800 border-dark-700 text-slate-500'
            }`}>
              <span>After-Fix:</span>
              {isVerified ? (
                <>
                  <span className="text-emerald-400 font-semibold">{afterPassed}P</span>
                  <span className="text-slate-400 font-semibold">{afterFailed}F</span>
                </>
              ) : isRunning ? (
                <span className="text-electric-400 animate-pulse font-mono">Running Simulation...</span>
              ) : (
                <span className="italic">Awaiting Verification</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-dark-900/60 border-b border-dark-700/60 text-slate-400 font-mono text-[11px]">
              <th className="py-2.5 px-4 font-medium">Test Case Identifier</th>
              <th className="py-2.5 px-3 font-medium">Category</th>
              <th className="py-2.5 px-3 font-medium text-center">Baseline</th>
              <th className="py-2.5 px-3 font-medium text-center">After Fix</th>
              <th className="py-2.5 px-3 font-medium text-right">Duration</th>
              <th className="py-2.5 px-4 font-medium">Observed Output / Verification Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700/40">
            {testCases.map((tc) => {
              return (
                <tr key={tc.id} className="hover:bg-dark-800/40 transition-colors">
                  {/* Test ID & Name */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200">{tc.name}</div>
                    <div className="font-mono text-[11px] text-slate-500">{tc.id}</div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-dark-800 text-slate-300 border border-dark-700">
                      {tc.category}
                    </span>
                  </td>

                  {/* Baseline status */}
                  <td className="py-3 px-3 text-center">
                    {tc.baselineResult === 'pass' ? (
                      <span className="inline-flex items-center gap-1 font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        PASS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/20 text-[11px]">
                        <XCircle className="w-3.5 h-3.5" />
                        FAIL
                      </span>
                    )}
                  </td>

                  {/* After fix status */}
                  <td className="py-3 px-3 text-center">
                    {!isVerified ? (
                      <span className="inline-flex items-center gap-1 font-mono text-slate-500 text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        Pending
                      </span>
                    ) : tc.afterFixResult === 'pass' ? (
                      <span className="inline-flex items-center gap-1 font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        PASS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/20 text-[11px]">
                        <XCircle className="w-3.5 h-3.5" />
                        FAIL
                      </span>
                    )}
                  </td>

                  {/* Duration */}
                  <td className="py-3 px-3 text-right font-mono text-slate-400 text-[11px]">
                    {tc.durationMs}ms
                  </td>

                  {/* Output */}
                  <td className="py-3 px-4 text-slate-300 text-xs font-mono">
                    <span className="text-slate-400">{tc.observedOutput}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mandatory Persistent Simulation Notice */}
      <div className="p-3 bg-dark-900 border-t border-dark-700/80 flex items-center justify-between text-xs text-amber-300 font-mono">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold tracking-wide">
            SIMULATED RESULTS — NO TESTS ACTUALLY EXECUTED.
          </span>
        </div>
        <span className="text-slate-500 text-[11px] hidden sm:inline">
          Mock runner assertions only — not evaluated by PayPal.
        </span>
      </div>
    </div>
  );
};
