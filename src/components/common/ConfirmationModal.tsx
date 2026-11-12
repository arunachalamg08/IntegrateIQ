import React from 'react';
import { X, Check, AlertTriangle, ShieldAlert } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  patchId: string;
  filePath: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  onReject,
  patchId,
  filePath
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-850 border border-dark-700 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-electric-500/10 text-electric-400 border border-electric-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Patch Approval Decision
              </h3>
              <p className="text-xs font-mono text-slate-400">
                {patchId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-dark-750 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-lg bg-dark-900 border border-dark-700/80">
            <p className="text-sm font-medium text-slate-200">
              Approve this proposed patch for simulated verification?
            </p>
            <p className="text-xs text-slate-400 mt-1.5 font-mono">
              Target File: <span className="text-electric-400">{filePath}</span>
            </p>
          </div>

          <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Demo Notice:</strong> Approving this proposed patch updates the local prototype state only and advances the workflow to the verification suite. No physical files on your file system are modified.
            </p>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            By proceeding, you verify that you have reviewed the code diff, verified the line references, and intend to run the simulated after-fix test suite.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-dark-900/60 border-t border-dark-700/80 flex items-center justify-between gap-3">
          <button
            onClick={onReject}
            className="px-3.5 py-2 rounded-lg border border-rose-500/30 bg-rose-950/30 text-rose-300 hover:bg-rose-950/60 text-xs font-medium transition-colors"
          >
            Reject Patch
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-dark-700 text-slate-300 hover:bg-dark-750 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onApprove}
              className="px-4 py-2 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-medium transition-colors inline-flex items-center gap-1.5 shadow-sm shadow-electric-500/20"
            >
              <Check className="w-3.5 h-3.5" />
              Approve for Verification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
