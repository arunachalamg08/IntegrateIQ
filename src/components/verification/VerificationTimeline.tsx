import React from 'react';
import { SessionWorkflowStatus } from '../../types';
import { CheckCircle2, Clock, CircleDot, AlertTriangle } from 'lucide-react';

interface VerificationTimelineProps {
  status: SessionWorkflowStatus;
  isVerifying?: boolean;
}

export const VerificationTimeline: React.FC<VerificationTimelineProps> = ({ status, isVerifying }) => {
  const steps = [
    {
      id: 'baseline',
      title: 'Baseline Test Suite',
      desc: 'Simulated failure reproduced (2 passed, 2 failed)',
      isComplete: status !== 'CREATED' && status !== 'INITIAL',
      isCurrent: status === 'CREATED' || status === 'INITIAL' || status === 'FAILURE_REPRODUCED' || status === 'REPRODUCED'
    },
    {
      id: 'diagnosis',
      title: 'AI Root-Cause Diagnosis',
      desc: 'Probable cause isolated with line references',
      isComplete: [
        'DIAGNOSIS_READY',
        'PATCH_READY',
        'PATCH_APPROVED',
        'PATCH_REJECTED',
        'VERIFICATION_RUNNING',
        'VERIFICATION_COMPLETED',
        'PATCH_PROPOSED',
        'VERIFIED'
      ].includes(status),
      isCurrent: status === 'FAILURE_REPRODUCED' || status === 'REPRODUCED'
    },
    {
      id: 'approval',
      title: 'Developer Patch Approval',
      desc:
        status === 'PATCH_REJECTED'
          ? 'Patch was rejected by developer'
          : ['PATCH_APPROVED', 'VERIFICATION_RUNNING', 'VERIFICATION_COMPLETED', 'VERIFIED'].includes(status)
          ? 'Patch approved for verification'
          : 'Pending human developer review',
      isComplete: ['PATCH_APPROVED', 'VERIFICATION_RUNNING', 'VERIFICATION_COMPLETED', 'VERIFIED'].includes(status),
      isCurrent: status === 'PATCH_READY' || status === 'DIAGNOSIS_READY' || status === 'PATCH_PROPOSED',
      isRejected: status === 'PATCH_REJECTED'
    },
    {
      id: 'after-fix',
      title: 'After-Fix Verification Run',
      desc: isVerifying || status === 'VERIFICATION_RUNNING'
        ? 'Executing simulated test runner...'
        : (status === 'VERIFICATION_COMPLETED' || status === 'VERIFIED')
        ? 'All 4 mock test cases passed'
        : 'Awaiting patch approval',
      isComplete: status === 'VERIFICATION_COMPLETED' || status === 'VERIFIED',
      isCurrent: status === 'PATCH_APPROVED' || isVerifying || status === 'VERIFICATION_RUNNING'
    },
    {
      id: 'evidence',
      title: 'Evidence Report Issued',
      desc: (status === 'VERIFICATION_COMPLETED' || status === 'VERIFIED') ? 'Audit report generated with SHA placeholder' : 'Generated upon successful verification',
      isComplete: status === 'VERIFICATION_COMPLETED' || status === 'VERIFIED',
      isCurrent: false
    }
  ];

  return (
    <div className="bg-dark-850 border border-dark-700/80 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Verification Pipeline Timeline
        </h4>
        <span className="text-[11px] font-mono text-slate-500">
          State: <span className="text-electric-400 font-medium">{status}</span>
        </span>
      </div>

      <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-dark-700/70 before:z-0">
        {steps.map((step, idx) => {
          return (
            <div key={step.id} className="relative z-10 flex items-start gap-3.5">
              <div className="shrink-0 mt-0.5">
                {step.isRejected ? (
                  <div className="w-7 h-7 rounded-full bg-rose-950 border border-rose-500/40 flex items-center justify-center text-rose-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                ) : step.isComplete ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : step.isCurrent ? (
                  <div className="w-7 h-7 rounded-full bg-electric-950 border border-electric-500 flex items-center justify-center text-electric-400 animate-pulse">
                    <CircleDot className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-dark-900 border border-dark-700 flex items-center justify-center text-slate-600">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h5 className={`text-xs font-semibold ${
                    step.isComplete ? 'text-slate-200' : step.isCurrent ? 'text-electric-300 font-bold' : 'text-slate-400'
                  }`}>
                    {idx + 1}. {step.title}
                  </h5>
                  <span className="text-[10px] font-mono text-slate-500">
                    {step.isComplete ? 'COMPLETED' : step.isCurrent ? 'IN PROGRESS' : 'STANDBY'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
