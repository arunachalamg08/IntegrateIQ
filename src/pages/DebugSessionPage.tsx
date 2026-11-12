import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { CodeDiffViewer } from '../components/diff/CodeDiffViewer';
import { VerificationTimeline } from '../components/verification/VerificationTimeline';
import { TestResultsTable } from '../components/verification/TestResultsTable';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { getScenarioTemplate } from '../data/mockSessionData';
import {
  Bug,
  Cpu,
  FileDiff,
  CheckCircle2,
  Play,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  FileCode,
  RotateCcw,
  Check,
  FileText,
  Copy,
  Terminal,
  ExternalLink,
  Clock,
  ShieldAlert
} from 'lucide-react';

export const DebugSessionPage: React.FC = () => {
  const {
    activeSession,
    reproduceFailure,
    generateDiagnosis,
    approvePatch,
    rejectPatch,
    runVerification,
    setCurrentPage,
    isApprovalModalOpen,
    setIsApprovalModalOpen
  } = useApp();

  const [activeTab, setActiveTab] = useState<'reproduce' | 'diagnosis' | 'patch' | 'verify'>('reproduce');

  if (!activeSession) {
    return (
      <div className="p-8 text-center bg-dark-850 rounded-lg border border-dark-700">
        <p className="text-slate-400">No active debug session found.</p>
        <button
          onClick={() => setCurrentPage('new-session')}
          className="mt-4 px-4 py-2 rounded bg-electric-600 text-white text-xs font-medium"
        >
          Start New Session
        </button>
      </div>
    );
  }

  // Authoritative session states & scenario fallback templates
  const template = getScenarioTemplate(activeSession.scenarioId);
  const reproduction = activeSession.reproduction || template.reproduction;
  const isReproduced = activeSession.reproductionStatus === 'REPRODUCED';
  const diagnosis = activeSession.diagnosis;
  const patch = activeSession.patch;
  const testCases = activeSession.testCases || template.testCases;
  const { status, isReproducing, isDiagnosing, isVerifying, verificationProgress, patchReviewStatus, verificationStatus } = activeSession;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Workspace Header Bar */}
      <div className="p-5 bg-dark-850 border border-dark-700/80 rounded-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold text-electric-400 px-2 py-0.5 rounded bg-electric-950/80 border border-electric-500/30">
              {activeSession.id}
            </span>
            <span className="text-xs font-mono text-slate-500">
              {activeSession.sampleApp}
            </span>
            <StatusBadge status={status} size="sm" />
          </div>

          <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
            {activeSession.scenarioName}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Mode: {activeSession.verificationMode || 'LOCAL_FIXTURE'} &bull; Created {new Date(activeSession.createdAt).toLocaleTimeString()} &bull; Last updated {activeSession.lastUpdated}
          </p>
        </div>

        {/* Dynamic Contextual Action CTAs */}
        <div className="flex flex-wrap items-center gap-2.5">
          {!isReproduced && (
            <button
              onClick={reproduceFailure}
              disabled={isReproducing}
              className="px-4 py-2 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-medium transition-all flex items-center gap-2 shadow-sm shadow-electric-500/20 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isReproducing ? 'Executing Pytest Runner...' : 'Reproduce Failure'}</span>
            </button>
          )}

          {isReproduced && !diagnosis && (
            <button
              onClick={generateDiagnosis}
              disabled={isDiagnosing}
              className="px-4 py-2 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-medium transition-all flex items-center gap-2 shadow-sm shadow-electric-500/20 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isDiagnosing ? 'Analyzing Root Cause...' : 'Generate Proposed Fix'}</span>
            </button>
          )}

          {patch && patchReviewStatus === 'PENDING' && (
            <button
              onClick={() => setIsApprovalModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all flex items-center gap-2 shadow-sm shadow-emerald-500/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Review &amp; Approve Patch</span>
            </button>
          )}

          {patch && patchReviewStatus === 'REJECTED' && (
            <span className="px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-mono">
              Patch Rejected — Verification Blocked
            </span>
          )}

          {patchReviewStatus === 'APPROVED' && verificationStatus !== 'PASS' && (
            <button
              onClick={runVerification}
              disabled={isVerifying}
              className="px-4 py-2 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-medium transition-all flex items-center gap-2 shadow-sm shadow-electric-500/20 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isVerifying ? `Running Test Runner (${verificationProgress}%)...` : 'Run Demo Verification'}</span>
            </button>
          )}

          {(verificationStatus === 'PASS' || status === 'VERIFICATION_COMPLETED') && (
            <button
              onClick={() => setCurrentPage('reports')}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all flex items-center gap-2 shadow-sm shadow-emerald-500/20"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Inspect Evidence Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Workspace Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-dark-700/80 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab('reproduce')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'reproduce'
              ? 'border-electric-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bug className="w-4 h-4 text-rose-400" />
          <span>A. Failure Reproduction</span>
          {isReproduced && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('diagnosis')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'diagnosis'
              ? 'border-electric-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4 text-electric-400" />
          <span>B. AI-Assisted Diagnosis</span>
          {diagnosis && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('patch')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'patch'
              ? 'border-electric-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileDiff className="w-4 h-4 text-indigo-400" />
          <span>C. Proposed Code Fix</span>
          {patchReviewStatus === 'APPROVED' && (
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 rounded border border-emerald-500/20">
              Approved
            </span>
          )}
          {patchReviewStatus === 'REJECTED' && (
            <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-1.5 rounded border border-rose-500/20">
              Rejected
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('verify')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'verify'
              ? 'border-electric-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>D. Verification Workflow</span>
          {verificationStatus === 'PASS' && (
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 rounded border border-emerald-500/20">
              PASS
            </span>
          )}
        </button>
      </div>

      {/* TAB CONTENT A: FAILURE REPRODUCTION */}
      {activeTab === 'reproduce' && (
        <div className="space-y-6">
          {/* Simulation Control Card */}
          <div className="p-5 rounded-lg bg-dark-850 border border-dark-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-500/20">
                  DEFECT STIMULUS
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Target Event: {reproduction.eventType}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-100">
                Execute Failure Reproduction (Pytest Subprocess)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Executes the automated test suite in an isolated sandbox against the target fixture to capture genuine assertions and stack traces.
              </p>
            </div>

            <button
              onClick={reproduceFailure}
              disabled={isReproducing}
              className="px-5 py-2.5 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm shadow-electric-500/20 disabled:opacity-50 shrink-0"
            >
              <Play className="w-3.5 h-3.5" />
              <span>
                {isReproducing
                  ? 'Running Pytest Subprocess...'
                  : isReproduced
                  ? 'Re-Run Failure Suite'
                  : 'Reproduce Failure'}
              </span>
            </button>
          </div>

          {/* Side-by-Side: Incoming Request vs Response Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Incoming Request Preview */}
            <div className="bg-dark-850 border border-dark-700/80 rounded-lg overflow-hidden flex flex-col">
              <div className="p-3.5 bg-dark-900 border-b border-dark-700/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <span className="px-1.5 py-0.5 rounded bg-electric-950 text-electric-400 font-mono text-[10px] border border-electric-500/20">
                    POST
                  </span>
                  <span>/api/webhooks/paypal</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  Event ID: {reproduction.eventId}
                </span>
              </div>

              {/* Headers */}
              <div className="p-3 bg-dark-900/40 border-b border-dark-700/50">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1.5">
                  Simulated Headers
                </span>
                <div className="space-y-1 font-mono text-[11px] text-slate-300">
                  {Object.entries(reproduction.headers).map(([k, v]) => (
                    <div key={k} className="flex">
                      <span className="text-slate-500 w-44 truncate shrink-0">{k}:</span>
                      <span className="text-electric-300 truncate">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payload */}
              <div className="p-3 flex-1 bg-dark-950/60 font-mono text-xs">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1.5">
                  Payload JSON (Sample)
                </span>
                <pre className="text-slate-300 text-[11px] overflow-x-auto p-2 rounded bg-dark-900/80 border border-dark-700/40 max-h-56">
                  {reproduction.payloadJson}
                </pre>
              </div>
            </div>

            {/* Observed Response vs Expected Behavior */}
            <div className="space-y-4 flex flex-col justify-between">
              {/* Observed Demo Response */}
              <div className="bg-dark-850 border border-dark-700/80 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Observed Demo Response
                  </span>
                  {isReproduced ? (
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-500/30">
                      HTTP {reproduction.simulatedStatus} BAD REQUEST
                    </span>
                  ) : (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-dark-800 text-slate-400 border border-dark-700">
                      AWAITING STIMULUS
                    </span>
                  )}
                </div>

                {isReproduced ? (
                  <>
                    <div className="p-3 rounded-md bg-dark-900/90 border border-rose-500/20 font-mono text-xs text-rose-300 mb-3">
                      {reproduction.simulatedError}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {reproduction.observedDemoBehavior}
                    </p>
                  </>
                ) : (
                  <div className="p-3.5 rounded-md bg-dark-900/70 border border-dark-700/60 text-xs text-slate-400 font-mono leading-relaxed">
                    Click &ldquo;Reproduce Failure&rdquo; above to dispatch the synthetic test event and observe the simulated PayPal verification rejection.
                  </div>
                )}
              </div>

              {/* Expected Behavior */}
              <div className="bg-dark-850 border border-dark-700/80 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Expected Behavior
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                    HTTP 200 OK
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {reproduction.expectedBehavior}
                </p>
              </div>

              {/* Advance action */}
              <div className="p-3 bg-dark-900 rounded-lg border border-dark-700/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  State: {isReproduced ? 'Failure reproduced' : 'Ready to reproduce'}
                </span>
                <button
                  onClick={() => setActiveTab('diagnosis')}
                  className="px-3 py-1.5 rounded bg-dark-800 hover:bg-dark-750 text-electric-300 text-xs font-medium font-mono flex items-center gap-1.5 transition-colors"
                >
                  <span>Proceed to AI Diagnosis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT B: AI-ASSISTED DIAGNOSIS */}
      {activeTab === 'diagnosis' && (
        <div className="space-y-6">
          {!isReproduced ? (
            <div className="p-8 text-center bg-dark-850 rounded-lg border border-dark-700 space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-200">
                Prerequisite: Failure Reproduction Required
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                IntegrateIQ requires observed error symptoms before running root-cause analysis. Please dispatch the synthetic webhook in Step A first.
              </p>
              <button
                onClick={() => setActiveTab('reproduce')}
                className="px-4 py-2 rounded-lg bg-electric-600 text-white text-xs font-medium inline-flex items-center gap-1.5"
              >
                <span>Go to Step A (Reproduce)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : !diagnosis ? (
            <div className="p-8 text-center bg-dark-850 rounded-lg border border-dark-700 space-y-4">
              <div className="p-3 rounded-full bg-electric-950/80 border border-electric-500/30 text-electric-400 w-12 h-12 mx-auto flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-100">
                  Defect Captured — Ready for Diagnosis
                </h3>
                <p className="text-xs text-slate-400 max-w-lg mx-auto mt-1">
                  The simulated HTTP 400 signature failure has been registered. IntegrateIQ can now analyze the Node.js sample application code to isolate the root cause.
                </p>
              </div>
              <button
                onClick={generateDiagnosis}
                disabled={isDiagnosing}
                className="px-6 py-2.5 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-sm shadow-electric-500/20 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isDiagnosing ? 'Analyzing Root Cause...' : 'Generate Proposed Fix'}</span>
              </button>
            </div>
          ) : (
            <>
              {/* Diagnosis Header Card */}
              <div className="p-5 rounded-lg bg-dark-850 border border-dark-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-electric-950/80 text-electric-400 border border-electric-500/30">
                      AI REASONING ENGINE
                    </span>
                    <span className="text-xs font-mono text-emerald-400">
                      {diagnosis.confidenceLabel}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    AI Root-Cause Diagnosis ({diagnosis.provider || 'Google Gemini'})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    IntegrateIQ correlates PayPal developer specs with static code fixtures.
                  </p>
                </div>

                <button
                  onClick={generateDiagnosis}
                  disabled={isDiagnosing}
                  className="px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-750 border border-dark-700 text-slate-200 text-xs font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isDiagnosing ? 'Analyzing...' : 'Re-analyze'}</span>
                </button>
              </div>

              {/* Root Cause & Supporting Evidence */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Probable Cause */}
                <div className="p-5 rounded-lg bg-dark-850 border border-dark-700/80 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Probable Root Cause
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500">
                        Hypothesis isolated with primary confidence
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded bg-dark-900 border border-amber-500/30 text-xs text-amber-200 leading-relaxed font-mono">
                    {diagnosis.probableRootCause}
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-slate-300 mb-1.5">
                      Supporting Evidence:
                    </h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {diagnosis.supportingEvidence}
                    </p>
                  </div>

                  {/* Code Line References */}
                  <div>
                    <h5 className="text-xs font-semibold text-slate-300 mb-2">
                      Sample Code Pointers:
                    </h5>
                    <div className="space-y-2">
                      {diagnosis.fileReferences.map((ref, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded bg-dark-900 border border-dark-700/60 font-mono text-xs flex flex-col gap-1"
                        >
                          <div className="flex items-center justify-between text-[11px] text-electric-400">
                            <span className="flex items-center gap-1.5">
                              <FileCode className="w-3.5 h-3.5" />
                              {ref.file}
                            </span>
                            <span className="text-slate-400">Line {ref.line}</span>
                          </div>
                          {ref.snippet && (
                            <div className="text-slate-400 text-[11px] overflow-x-auto bg-dark-950 p-1.5 rounded">
                              <code>{ref.snippet}</code>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Alternative Hypotheses & Recommended Action */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="p-5 rounded-lg bg-dark-850 border border-dark-700/80 space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Alternative Hypotheses Considered
                    </h4>
                    <ul className="space-y-2.5 text-xs text-slate-400">
                      {diagnosis.alternativeHypotheses.map((hyp, idx) => (
                        <li key={idx} className="flex items-start gap-2 p-2 rounded bg-dark-900/60 border border-dark-700/50">
                          <span className="text-slate-500 font-mono text-[10px] mt-0.5">#{idx + 1}</span>
                          <span>{hyp}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-3 border-t border-dark-700/60">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Recommended Next Step
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {diagnosis.recommendedNextStep}
                      </p>
                    </div>
                  </div>

                  {/* Action Banner */}
                  <div className="p-4 bg-dark-900 rounded-lg border border-dark-700/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">
                        Candidate Patch Ready
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {patch ? `ID: ${patch.id} (${patch.filePath})` : 'Synthesized patch ready'}
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveTab('patch')}
                      className="px-4 py-2 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-medium transition-all flex items-center gap-1.5"
                    >
                      <span>Review Code Patch</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB CONTENT C: PROPOSED CODE FIX */}
      {activeTab === 'patch' && (
        <div className="space-y-6">
          {!patch ? (
            <div className="p-8 text-center bg-dark-850 rounded-lg border border-dark-700 space-y-3">
              <FileDiff className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-200">
                No Proposed Patch Available Yet
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Execute Step B (AI-Assisted Diagnosis) to synthesize a candidate code patch for review.
              </p>
              <button
                onClick={() => setActiveTab('diagnosis')}
                className="px-4 py-2 rounded-lg bg-electric-600 text-white text-xs font-medium inline-flex items-center gap-1.5"
              >
                <span>Go to Step B (Diagnosis)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              {patchReviewStatus === 'REJECTED' && (
                <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>
                      <strong>Patch Rejected by Developer:</strong> Verification is blocked for this proposed patch. You may reconsider and approve, or return to diagnosis to inspect alternatives.
                    </span>
                  </div>
                  <button
                    onClick={() => setIsApprovalModalOpen(true)}
                    className="px-3 py-1.5 rounded bg-dark-800 hover:bg-dark-750 text-slate-200 border border-dark-700 text-xs font-medium font-mono shrink-0 ml-3"
                  >
                    Reconsider &amp; Approve
                  </button>
                </div>
              )}

              <CodeDiffViewer
                patch={patch}
                status={patchReviewStatus === 'APPROVED' ? 'PATCH_APPROVED' : patchReviewStatus === 'REJECTED' ? 'PATCH_REJECTED' : 'PATCH_READY'}
                onApprove={() => setIsApprovalModalOpen(true)}
                onReject={rejectPatch}
              />

              {/* Action Footer */}
              <div className="p-4 bg-dark-850 border border-dark-700/80 rounded-lg flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  {patchReviewStatus === 'APPROVED' ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Patch approved for verification suite.
                    </span>
                  ) : patchReviewStatus === 'REJECTED' ? (
                    <span className="text-rose-400 font-semibold">
                      Patch rejected. Verification cannot proceed.
                    </span>
                  ) : (
                    <span>Awaiting developer approval before running verification test runner.</span>
                  )}
                </div>

                <button
                  onClick={() => setActiveTab('verify')}
                  className="px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-750 text-electric-300 text-xs font-medium font-mono flex items-center gap-1.5 transition-colors border border-dark-700"
                >
                  <span>View Verification Pipeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB CONTENT D: VERIFICATION WORKFLOW */}
      {activeTab === 'verify' && (
        <div className="space-y-6">
          {/* Action Trigger Card */}
          <div className="p-5 rounded-lg bg-dark-850 border border-dark-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                  DETERMINISTIC TEST RUNNER
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Mode: SIMULATED (4 Assertions)
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-100">
                Execute Verification Suite Against Sample Application
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Runs the independent test harness to verify that the proposed patch eliminates the defect without regressions.
              </p>
            </div>

            <button
              onClick={runVerification}
              disabled={isVerifying || patchReviewStatus !== 'APPROVED'}
              className="px-5 py-2.5 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm shadow-electric-500/20 disabled:opacity-50 shrink-0"
            >
              <Play className="w-3.5 h-3.5" />
              <span>
                {isVerifying
                  ? `Simulating Verification (${verificationProgress}%)...`
                  : verificationStatus === 'PASS'
                  ? 'Re-Run Verification Suite'
                  : patchReviewStatus === 'APPROVED'
                  ? 'Run Demo Verification'
                  : patchReviewStatus === 'REJECTED'
                  ? 'Blocked: Patch Rejected'
                  : 'Approve Patch to Run Tests'}
              </span>
            </button>
          </div>

          {patchReviewStatus === 'REJECTED' && (
            <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between">
              <span><strong>Verification Blocked:</strong> The candidate patch was rejected during patch review. Verification tests can only run against an approved proposal.</span>
              <button
                onClick={() => setActiveTab('patch')}
                className="px-3 py-1 rounded bg-dark-800 text-slate-200 border border-dark-700 text-xs shrink-0 ml-3"
              >
                Go to Patch Review
              </button>
            </div>
          )}

          {patchReviewStatus === 'PENDING' && (
            <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between">
              <span><strong>Approval Required:</strong> The candidate patch must be approved before running the verification suite.</span>
              <button
                onClick={() => setActiveTab('patch')}
                className="px-3 py-1 rounded bg-dark-800 text-slate-200 border border-dark-700 text-xs shrink-0 ml-3"
              >
                Review Patch Now
              </button>
            </div>
          )}

          {/* Verification Timeline */}
          <VerificationTimeline status={status} isVerifying={isVerifying} />

          {/* Test Results Table */}
          <TestResultsTable testCases={testCases} status={status} />

          {/* Verified Evidence Link */}
          {(verificationStatus === 'PASS' || status === 'VERIFICATION_COMPLETED') && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-emerald-300">
                    Verification Complete — 4 of 4 Assertions Passed (Simulated)
                  </h4>
                  <p className="text-xs text-slate-400">
                    A formal simulated evidence report has been generated for this session.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCurrentPage('reports')}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>Inspect Evidence Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {patch && (
        <ConfirmationModal
          isOpen={isApprovalModalOpen}
          onClose={() => setIsApprovalModalOpen(false)}
          onApprove={approvePatch}
          onReject={rejectPatch}
          patchId={patch.id}
          filePath={patch.filePath}
        />
      )}
    </div>
  );
};
