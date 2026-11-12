import React, { useState } from 'react';
import { ProposedPatch } from '../../types';
import { Check, X, ShieldAlert, FileCode, Columns, AlignJustify, AlertCircle } from 'lucide-react';

interface CodeDiffViewerProps {
  patch: ProposedPatch;
  onApprove?: () => void;
  onReject?: () => void;
  status?: string;
  readOnly?: boolean;
}

export const CodeDiffViewer: React.FC<CodeDiffViewerProps> = ({
  patch,
  onApprove,
  onReject,
  status,
  readOnly = false
}) => {
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');

  return (
    <div className="bg-dark-850 border border-dark-700/90 rounded-lg overflow-hidden flex flex-col">
      {/* File Header Bar */}
      <div className="px-4 py-3 bg-dark-900 border-b border-dark-700/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <FileCode className="w-4 h-4 text-electric-400 shrink-0" />
          <span className="font-mono text-xs font-semibold text-slate-200">
            {patch.filePath}
          </span>
          <span className="font-mono text-[11px] text-slate-500 hidden sm:inline">
            ({patch.fileRevision})
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/20">
            +{patch.linesAdded}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950/60 text-rose-400 border border-rose-500/20">
            -{patch.linesRemoved}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center p-0.5 rounded-md bg-dark-800 border border-dark-700 text-slate-400">
            <button
              onClick={() => setViewMode('unified')}
              className={`px-2 py-1 text-xs rounded font-medium flex items-center gap-1 transition-colors ${
                viewMode === 'unified'
                  ? 'bg-dark-700 text-slate-100 shadow-sm'
                  : 'hover:text-slate-200'
              }`}
              title="Unified Diff View"
            >
              <AlignJustify className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Unified</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2 py-1 text-xs rounded font-medium flex items-center gap-1 transition-colors ${
                viewMode === 'split'
                  ? 'bg-dark-700 text-slate-100 shadow-sm'
                  : 'hover:text-slate-200'
              }`}
              title="Split Comparison View"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Split</span>
            </button>
          </div>

          {!readOnly && (
            <div className="flex items-center gap-2 pl-2 border-l border-dark-700">
              <button
                onClick={onReject}
                disabled={status === 'PATCH_APPROVED' || status === 'VERIFIED'}
                className="px-3 py-1.5 rounded text-xs font-medium border border-rose-500/30 text-rose-300 hover:bg-rose-950/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                Reject
              </button>
              <button
                onClick={onApprove}
                disabled={status === 'PATCH_APPROVED' || status === 'VERIFIED'}
                className="px-3 py-1.5 rounded text-xs font-medium bg-electric-600 hover:bg-electric-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 shadow-sm shadow-electric-500/20"
              >
                <Check className="w-3.5 h-3.5" />
                {status === 'PATCH_APPROVED' ? 'Approved' : 'Approve Patch'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rationale and Risk Banner */}
      <div className="px-4 py-3 bg-dark-850 border-b border-dark-700/60 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="md:col-span-2 space-y-1">
          <span className="font-semibold text-slate-300">Intended Correction:</span>
          <p className="text-slate-400 leading-relaxed">{patch.explanation}</p>
        </div>
        <div className="space-y-1 border-t md:border-t-0 md:border-l border-dark-700/80 pt-2 md:pt-0 md:pl-4">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Risk Assessment:</span>
            <span className="font-mono text-emerald-400 text-[11px] bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
              {patch.riskAssessment}
            </span>
          </div>
          <p className="text-slate-400 text-[11px] leading-snug">{patch.riskDetails}</p>
        </div>
      </div>

      {/* Code diff body */}
      <div className="overflow-x-auto font-mono text-xs leading-relaxed bg-[#0A0E17]">
        {viewMode === 'unified' ? (
          <table className="w-full border-collapse">
            <tbody>
              {patch.diffLines.map((line, idx) => {
                const isAdd = line.type === 'addition';
                const isDel = line.type === 'deletion';

                const rowBg = isAdd
                  ? 'bg-emerald-950/30 text-emerald-300'
                  : isDel
                  ? 'bg-rose-950/30 text-rose-300'
                  : 'text-slate-300 hover:bg-dark-800/50';

                const prefixSymbol = isAdd ? '+' : isDel ? '-' : ' ';
                const prefixColor = isAdd
                  ? 'text-emerald-400 font-bold'
                  : isDel
                  ? 'text-rose-400 font-bold'
                  : 'text-slate-600';

                return (
                  <tr key={idx} className={`${rowBg} transition-colors border-l-2 ${
                    isAdd ? 'border-emerald-500' : isDel ? 'border-rose-500' : 'border-transparent'
                  }`}>
                    {/* Original line num */}
                    <td className="w-10 px-2 py-0.5 text-right text-slate-600 select-none text-[11px] border-r border-dark-800">
                      {line.lineNumOriginal || ''}
                    </td>
                    {/* Proposed line num */}
                    <td className="w-10 px-2 py-0.5 text-right text-slate-600 select-none text-[11px] border-r border-dark-800">
                      {line.lineNumProposed || ''}
                    </td>
                    {/* Prefix */}
                    <td className={`w-6 px-1.5 py-0.5 text-center select-none ${prefixColor}`}>
                      {prefixSymbol}
                    </td>
                    {/* Code Content */}
                    <td className="px-3 py-0.5 whitespace-pre overflow-x-visible">
                      {line.content}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* Split View */
          <div className="grid grid-cols-2 divide-x divide-dark-700/80">
            {/* Original Snippet */}
            <div className="p-4 bg-rose-950/10">
              <div className="text-[10px] font-mono uppercase tracking-wider text-rose-400 mb-2 font-semibold flex items-center justify-between">
                <span>Original (Observed Defect)</span>
                <span className="text-slate-500">Lines 21 - 27</span>
              </div>
              <pre className="text-slate-300 whitespace-pre overflow-x-auto font-mono text-xs leading-relaxed">
                {patch.originalCodeSnippet}
              </pre>
            </div>
            {/* Proposed Snippet */}
            <div className="p-4 bg-emerald-950/10">
              <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 mb-2 font-semibold flex items-center justify-between">
                <span>Proposed Correction</span>
                <span className="text-slate-500">Lines 21 - 32</span>
              </div>
              <pre className="text-emerald-200 whitespace-pre overflow-x-auto font-mono text-xs leading-relaxed">
                {patch.proposedCodeSnippet}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Footer Disclaimer */}
      <div className="px-4 py-2 bg-dark-900/90 border-t border-dark-700/70 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
          Sample demonstration code — not a verified production-ready PayPal SDK distribution.
        </span>
        <span className="hidden sm:inline">Mock revision control: Git sha rev-a8f9021</span>
      </div>
    </div>
  );
};
