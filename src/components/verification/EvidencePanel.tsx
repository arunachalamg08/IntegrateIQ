import React, { useState } from 'react';
import { VerificationEvidence } from '../../types';
import { ShieldCheck, Copy, Check, Terminal, FileLock, AlertCircle } from 'lucide-react';

interface EvidencePanelProps {
  evidence: VerificationEvidence;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ evidence }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fields = [
    { label: 'Session Identifier', value: evidence.sessionId, key: 'sessionId', mono: true },
    { label: 'Source Revision Placeholder', value: evidence.sourceRevision, key: 'sourceRevision', mono: true },
    { label: 'Patch SHA-256 Placeholder', value: evidence.patchSha256Placeholder, key: 'sha', mono: true },
    { label: 'Test Suite Identifier', value: evidence.testSuiteIdentifier, key: 'suite', mono: true },
    { label: 'Test-Run Timestamp Placeholder', value: evidence.testRunTimestampPlaceholder, key: 'timestamp', mono: true },
    { label: 'Individual Tests Evaluated', value: `${evidence.individualTestResultsCount} assertions (mocked)`, key: 'tests', mono: false },
    { label: 'Simulated Process Exit Code', value: String(evidence.exitCodePlaceholder), key: 'exitCode', mono: true },
    { label: 'Target Verification Environment', value: evidence.verificationEnvironment, key: 'env', mono: false }
  ];

  return (
    <div className="bg-dark-850 border border-dark-700/80 rounded-lg overflow-hidden flex flex-col">
      {/* Evidence Header */}
      <div className="p-4 bg-dark-900 border-b border-dark-700/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-electric-500/10 text-electric-400 border border-electric-500/20">
            <FileLock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Verification Evidence Manifest
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulated provenance records for engineering audit and approval gate
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-dark-800 border border-dark-700 text-slate-400 font-mono text-[11px]">
          <Terminal className="w-3.5 h-3.5 text-electric-400" />
          Exit 0
        </span>
      </div>

      {/* Grid of Evidence Metadata */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {fields.map((field) => {
          const isCopied = copiedKey === field.key;
          return (
            <div
              key={field.key}
              className="p-3 rounded-md bg-dark-900/60 border border-dark-700/60 flex flex-col justify-between group hover:border-dark-600 transition-colors"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-medium">{field.label}</span>
                <button
                  onClick={() => handleCopy(field.value, field.key)}
                  className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded"
                  title="Copy value"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div
                className={`text-xs text-slate-200 break-all select-all ${
                  field.mono ? 'font-mono text-[11px]' : ''
                }`}
              >
                {field.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Integrity Disclaimer */}
      <div className="p-3 bg-dark-900/90 border-t border-dark-700/80 flex items-center gap-2 text-xs text-slate-400">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="text-[11px] leading-snug">
          <strong>Security Notice:</strong> {evidence.integrityNotice} No real cryptographic signature or public-key verification was executed against PayPal PKI.
        </span>
      </div>
    </div>
  );
};
