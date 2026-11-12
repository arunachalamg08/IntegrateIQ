import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CodeDiffViewer } from '../components/diff/CodeDiffViewer';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  FileDiff,
  ShieldAlert,
  GitBranch,
  FileCode,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Cpu,
  RotateCcw,
  Hash,
  ExternalLink,
  Layers
} from 'lucide-react';

export const PatchReviewPage: React.FC = () => {
  const {
    sessions,
    activeSession,
    setActiveSession,
    approvePatch,
    rejectPatch,
    setCurrentPage,
    isApprovalModalOpen,
    setIsApprovalModalOpen
  } = useApp();

  // Find all sessions that have a proposed patch
  const sessionsWithPatches = sessions.filter((s) => !!s.patch);

  // If activeSession has no patch, but another session does, default to that session
  const effectiveSession =
    activeSession?.patch
      ? activeSession
      : sessionsWithPatches[0] || activeSession;

  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    effectiveSession?.id || ''
  );

  const currentSession =
    sessions.find((s) => s.id === selectedSessionId) || effectiveSession;

  const handleSelectSession = (id: string) => {
    setSelectedSessionId(id);
    const target = sessions.find((s) => s.id === id);
    if (target) {
      setActiveSession(target);
    }
  };

  if (!currentSession || !currentSession.patch) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
        <div className="border-b border-dark-700/80 pb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <FileDiff className="w-4 h-4 text-electric-400" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Patch Review &amp; Approval Gate
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Independent human review step ensuring AI proposed code changes meet security &amp; functional standards.
          </p>
        </div>

        <div className="p-12 text-center bg-dark-850 rounded-xl border border-dark-700 space-y-4">
          <div className="p-3.5 rounded-full bg-dark-900 border border-dark-700 text-slate-400 w-14 h-14 mx-auto flex items-center justify-center">
            <FileDiff className="w-7 h-7 text-slate-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              No Proposed Patches Available Yet
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
              Before a patch can be reviewed and approved, you must reproduce an integration failure and generate an AI diagnosis in the debug workspace.
            </p>
          </div>
          <button
            onClick={() => setCurrentPage('workspace')}
            className="px-5 py-2.5 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors shadow-sm shadow-electric-500/20"
          >
            <span>Proceed to Debug Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const { patch, status, patchReviewStatus } = currentSession;
  const isApproved = patchReviewStatus === 'APPROVED';
  const isRejected = patchReviewStatus === 'REJECTED';

  // Derived SHA-256 placeholder
  const patchSha256 =
    currentSession.report?.evidence?.patchSha256Placeholder ||
    `sha256:${patch.id.toLowerCase()}-e9b8c4d2e1a3b5c6e8d9a0b1c2d3e4f5a6b7c8d9e0f1a2b3`;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="border-b border-dark-700/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-800 text-slate-400 border border-dark-700">
              Session: {currentSession.id}
            </span>
            <StatusBadge status={status} size="sm" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Patch Review &amp; Approval Gate
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Review proposed code modifications, verify regression safeguards, and grant explicit approval before verification.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {isRejected ? (
            <button
              onClick={() => setIsApprovalModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-sm shadow-electric-500/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reconsider &amp; Approve</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsApprovalModalOpen(true)}
                disabled={isApproved}
                className="px-4 py-2 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-sm shadow-electric-500/20 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isApproved ? 'Patch Approved' : 'Review & Approve'}</span>
              </button>
              <button
                onClick={rejectPatch}
                disabled={isApproved}
                className="px-3.5 py-2 rounded-lg border border-rose-500/30 bg-rose-950/30 text-rose-300 hover:bg-rose-950/60 text-xs font-medium transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Multi-Session Patch Selector Bar */}
      {sessionsWithPatches.length > 1 && (
        <div className="p-3 bg-dark-850 border border-dark-700/80 rounded-xl flex items-center gap-3 overflow-x-auto">
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5 shrink-0">
            <Layers className="w-3.5 h-3.5 text-electric-400" />
            Available Patches ({sessionsWithPatches.length}):
          </span>
          <div className="flex items-center gap-2">
            {sessionsWithPatches.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectSession(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 ${
                  s.id === currentSession.id
                    ? 'bg-electric-600/20 border border-electric-500/50 text-electric-300 font-semibold'
                    : 'bg-dark-900 border border-dark-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{s.patch?.id}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded ${
                    s.patchReviewStatus === 'APPROVED'
                      ? 'bg-emerald-950 text-emerald-400'
                      : s.patchReviewStatus === 'REJECTED'
                      ? 'bg-rose-950 text-rose-400'
                      : 'bg-amber-950 text-amber-400'
                  }`}
                >
                  {s.patchReviewStatus}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rejection Alert Banner */}
      {isRejected && (
        <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <span>
              <strong>Patch Rejected:</strong> This patch proposal was rejected by the reviewer. Automated verification is permanently blocked for rejected patches.
            </span>
          </div>
          <button
            onClick={() => setIsApprovalModalOpen(true)}
            className="px-3 py-1 rounded bg-dark-800 hover:bg-dark-750 text-slate-200 border border-dark-700 text-xs font-medium font-mono shrink-0 ml-3"
          >
            Reconsider Decision
          </button>
        </div>
      )}

      {/* Approval Success Banner */}
      {isApproved && (
        <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              <strong>Patch Approved:</strong> Ready for automated verification runner. Click &ldquo;Run Verification&rdquo; to execute the test suite in the workspace.
            </span>
          </div>
          <button
            onClick={() => setCurrentPage('debug-session')}
            className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shrink-0 ml-3 transition-colors inline-flex items-center gap-1.5"
          >
            <span>Run Verification</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Revision & Patch Metadata Panel */}
      <div className="p-5 rounded-lg bg-dark-850 border border-dark-700/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div>
          <span className="text-[10px] text-slate-500 uppercase block mb-1">Source Revision</span>
          <span className="text-slate-200 flex items-center gap-1.5 font-semibold">
            <GitBranch className="w-3.5 h-3.5 text-slate-400" />
            {patch.fileRevision}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 uppercase block mb-1">Patch Identifier</span>
          <span className="text-electric-400 font-semibold">{patch.id}</span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 uppercase block mb-1">Files Changed</span>
          <span className="text-slate-200 font-semibold flex items-center gap-1">
            <FileCode className="w-3.5 h-3.5 text-slate-400" />
            {patch.filePath}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 uppercase block mb-1">Lines Added / Removed</span>
          <span className="text-slate-200 font-semibold">
            <span className="text-emerald-400">+{patch.linesAdded}</span> /{' '}
            <span className="text-rose-400">-{patch.linesRemoved}</span>
          </span>
        </div>
      </div>

      {/* Cryptographic Digest & Integrity Notice */}
      <div className="p-3.5 rounded-lg bg-dark-900 border border-dark-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <Hash className="w-4 h-4 text-electric-400 shrink-0" />
          <span className="text-[10px] text-slate-500 uppercase">SHA-256 Digest:</span>
          <span className="text-slate-300 truncate max-w-md select-all">{patchSha256}</span>
        </div>
        <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
          Risk: {patch.riskAssessment}
        </span>
      </div>

      {/* Intended Correction & Security Considerations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-lg bg-dark-850 border border-dark-700/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-electric-400" />
            <span>Intended Correction Rationale</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {patch.explanation}
          </p>
        </div>

        <div className="p-5 rounded-lg bg-dark-850 border border-dark-700/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Security Implications</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {patch.securityImplications}
          </p>
        </div>
      </div>

      {/* Potential Regressions Analysis */}
      <div className="p-4 rounded-lg bg-dark-850 border border-dark-700/80 text-xs space-y-1.5">
        <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] block">
          Potential Regressions &amp; Side-Effect Analysis:
        </span>
        <p className="text-slate-400 leading-relaxed">
          {patch.potentialRegressions}
        </p>
      </div>

      {/* The Code Diff Viewer */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Proposed Source Code Modification
        </h3>
        <CodeDiffViewer
          patch={patch}
          status={isApproved ? 'PATCH_APPROVED' : isRejected ? 'PATCH_REJECTED' : 'PATCH_READY'}
          onApprove={() => setIsApprovalModalOpen(true)}
          onReject={rejectPatch}
        />
      </div>

      {/* Decision CTA Bar */}
      <div className="p-5 rounded-lg bg-dark-900 border border-dark-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-semibold text-slate-200">
            {isApproved
              ? 'Patch Approved: Ready for Verification Runner'
              : isRejected
              ? 'Patch Rejected: Verification Disabled'
              : 'Awaiting Human Approval'}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            {isApproved
              ? 'The test runner will execute deterministic assertions against the isolated sample receiver.'
              : isRejected
              ? 'To proceed with verification, please reconsider and approve this proposal.'
              : 'Review the diff and approve to unlock the automated test runner.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage('debug-session')}
            className="px-4 py-2 rounded-lg border border-dark-700 text-slate-300 hover:bg-dark-800 text-xs font-medium transition-colors"
          >
            Open in Workspace
          </button>
          <button
            onClick={() => setCurrentPage('verification-results')}
            className="px-4 py-2 rounded-lg border border-dark-700 text-slate-300 hover:bg-dark-800 text-xs font-medium transition-colors"
          >
            View Test Results
          </button>
          {isApproved ? (
            <button
              onClick={() => setCurrentPage('debug-session')}
              className="px-4 py-2 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm shadow-electric-500/20"
            >
              <span>Go to Verification Suite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : isRejected ? (
            <button
              onClick={() => setIsApprovalModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-750 border border-dark-700 text-slate-200 text-xs font-medium transition-all"
            >
              Reconsider
            </button>
          ) : (
            <button
              onClick={() => setIsApprovalModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm shadow-electric-500/20"
            >
              <span>Approve &amp; Verify</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        onApprove={approvePatch}
        onReject={rejectPatch}
        patchId={patch.id}
        filePath={patch.filePath}
      />
    </div>
  );
};
