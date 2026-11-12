import React from 'react';
import { ArrowRight, Bug, Cpu, FileDiff, CheckCircle2, FileText } from 'lucide-react';
import { SessionWorkflowStatus } from '../../types';

interface WorkflowDiagramProps {
  currentStage?: SessionWorkflowStatus;
  interactive?: boolean;
  onStageClick?: (stageIndex: number) => void;
}

export const WorkflowDiagram: React.FC<WorkflowDiagramProps> = ({ currentStage }) => {
  const stages = [
    {
      id: 'reproduce',
      number: '01',
      title: 'Reproduce',
      desc: 'Simulate incoming webhook or client call',
      icon: Bug,
      activeStatuses: [
        'FAILURE_REPRODUCED',
        'DIAGNOSIS_READY',
        'PATCH_READY',
        'PATCH_APPROVED',
        'PATCH_REJECTED',
        'VERIFICATION_RUNNING',
        'VERIFICATION_COMPLETED',
        'REPRODUCED',
        'DIAGNOSED',
        'PATCH_PROPOSED',
        'VERIFIED'
      ]
    },
    {
      id: 'diagnose',
      number: '02',
      title: 'Diagnose',
      desc: 'Probable cause & code line pointers',
      icon: Cpu,
      activeStatuses: [
        'DIAGNOSIS_READY',
        'PATCH_READY',
        'PATCH_APPROVED',
        'PATCH_REJECTED',
        'VERIFICATION_RUNNING',
        'VERIFICATION_COMPLETED',
        'DIAGNOSED',
        'PATCH_PROPOSED',
        'VERIFIED'
      ]
    },
    {
      id: 'review-patch',
      number: '03',
      title: 'Review Patch',
      desc: 'Developer reviews & approves fix',
      icon: FileDiff,
      activeStatuses: [
        'PATCH_READY',
        'PATCH_APPROVED',
        'VERIFICATION_RUNNING',
        'VERIFICATION_COMPLETED',
        'PATCH_PROPOSED',
        'VERIFIED'
      ]
    },
    {
      id: 'run-tests',
      number: '04',
      title: 'Run Tests',
      desc: 'Local test suite validates fix',
      icon: CheckCircle2,
      activeStatuses: [
        'VERIFICATION_RUNNING',
        'VERIFICATION_COMPLETED',
        'VERIFIED'
      ]
    },
    {
      id: 'view-evidence',
      number: '05',
      title: 'View Evidence',
      desc: 'Tamper-evident verification report',
      icon: FileText,
      activeStatuses: [
        'VERIFICATION_COMPLETED',
        'VERIFIED'
      ]
    }
  ];

  const getStageStatus = (stage: typeof stages[0]) => {
    if (!currentStage) return 'default';
    if (stage.activeStatuses.includes(currentStage)) {
      return 'completed';
    }
    return 'pending';
  };

  return (
    <div className="w-full bg-dark-850/80 border border-dark-700/80 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            IntegrateIQ Five-Stage Verification Lifecycle
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict separation between AI proposal generation and independent deterministic testing
          </p>
        </div>
        <div className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded bg-electric-950/40 border border-electric-500/20 text-electric-400 text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-electric-400 animate-pulse" />
          Deterministic Sandbox Gate
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {stages.map((stage, idx) => {
          const status = getStageStatus(stage);
          const isCurrent =
            ((currentStage === 'CREATED' || currentStage === 'INITIAL') && idx === 0) ||
            ((currentStage === 'FAILURE_REPRODUCED' || currentStage === 'REPRODUCED') && idx === 1) ||
            ((currentStage === 'PATCH_READY' || currentStage === 'DIAGNOSIS_READY' || currentStage === 'PATCH_PROPOSED') && idx === 2) ||
            ((currentStage === 'PATCH_APPROVED' || currentStage === 'VERIFICATION_RUNNING') && idx === 3) ||
            ((currentStage === 'VERIFICATION_COMPLETED' || currentStage === 'VERIFIED') && idx === 4);

          return (
            <div key={stage.id} className="relative flex flex-col">
              <div
                className={`p-3.5 rounded-lg border transition-all h-full flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-electric-950/30 border-electric-500 text-slate-100 shadow-sm shadow-electric-500/10'
                    : status === 'completed'
                    ? 'bg-dark-800/90 border-emerald-500/30 text-slate-200'
                    : 'bg-dark-900/60 border-dark-700/60 text-slate-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-dark-950 border border-dark-700 text-slate-400">
                      {stage.number}
                    </span>
                    <stage.icon
                      className={`w-4 h-4 ${
                        isCurrent
                          ? 'text-electric-400'
                          : status === 'completed'
                          ? 'text-emerald-400'
                          : 'text-slate-500'
                      }`}
                    />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 tracking-tight">
                    {stage.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {stage.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-dark-700/50 flex items-center justify-between text-[10px] font-mono">
                  <span
                    className={
                      isCurrent
                        ? 'text-electric-400 font-medium'
                        : status === 'completed'
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }
                  >
                    {isCurrent ? '● Active' : status === 'completed' ? '✓ Passed' : '○ Standby'}
                  </span>
                </div>
              </div>

              {idx < stages.length - 1 && (
                <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-dark-600">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
