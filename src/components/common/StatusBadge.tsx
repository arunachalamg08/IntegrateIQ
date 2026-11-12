import React from 'react';
import { SessionWorkflowStatus, FinalReportStatus } from '../../types';

interface StatusBadgeProps {
  status: SessionWorkflowStatus | FinalReportStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = (status || '').toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case 'PASS':
      case 'VERIFIED':
      case 'VERIFICATION_COMPLETED':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30';
      case 'FAIL':
      case 'VERIFICATION_FAILED':
      case 'PATCH_REJECTED':
        return 'bg-rose-950/60 text-rose-400 border-rose-500/30';
      case 'INCONCLUSIVE':
      case 'VERIFICATION_INCONCLUSIVE':
      case 'REPRODUCED':
      case 'FAILURE_REPRODUCED':
        return 'bg-amber-950/60 text-amber-400 border-amber-500/30';
      case 'PATCH_APPROVED':
        return 'bg-blue-950/60 text-blue-400 border-blue-500/30';
      case 'PATCH_PROPOSED':
      case 'PATCH_READY':
      case 'DIAGNOSED':
      case 'DIAGNOSIS_READY':
        return 'bg-indigo-950/60 text-indigo-400 border-indigo-500/30';
      case 'VERIFICATION_RUNNING':
        return 'bg-electric-950/60 text-electric-300 border-electric-500/40 animate-pulse';
      case 'CREATED':
      case 'INITIAL':
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getLabel = () => {
    switch (normalized) {
      case 'CREATED':
      case 'INITIAL':
        return 'Ready to Reproduce';
      case 'FAILURE_REPRODUCED':
      case 'REPRODUCED':
        return 'Failure Reproduced';
      case 'DIAGNOSIS_READY':
      case 'DIAGNOSED':
        return 'Diagnosis Ready';
      case 'PATCH_READY':
      case 'PATCH_PROPOSED':
        return 'Patch Ready';
      case 'PATCH_APPROVED':
        return 'Patch Approved';
      case 'PATCH_REJECTED':
        return 'Patch Rejected';
      case 'VERIFICATION_RUNNING':
        return 'Verifying Tests...';
      case 'VERIFICATION_COMPLETED':
      case 'VERIFIED':
      case 'PASS':
        return 'Verified (Simulated Pass)';
      case 'VERIFICATION_FAILED':
      case 'FAIL':
        return 'Verification Failed';
      case 'VERIFICATION_INCONCLUSIVE':
      case 'INCONCLUSIVE':
        return 'Inconclusive Run';
      default:
        return status;
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded border ${getStyle()} ${sizeClasses[size]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {getLabel()}
    </span>
  );
};
