import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertOctagon,
  Search,
  Sparkles,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Terminal,
  ShieldAlert,
  HelpCircle,
  FileText,
  Play,
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface PayPalErrorItem {
  id: string;
  operation: string;
  endpoint: string;
  httpStatus: number;
  paypalErrorName: string;
  message: string;
  debugId: string;
  details?: Record<string, any>;
  rawResponse?: Record<string, any>;
  aiAnalysis?: {
    what_happened: string;
    likely_cause: string;
    supporting_evidence: string;
    developer_action: string;
    how_to_verify: string;
  };
  environment: string;
  createdAt: string;
}

export const PayPalErrorAnalyzerPage: React.FC = () => {
  const { addToast } = useApp();
  const [errors, setErrors] = useState<PayPalErrorItem[]>([]);
  const [selectedError, setSelectedError] = useState<PayPalErrorItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  // Custom analysis input
  const [customOperation, setCustomOperation] = useState('POST /v2/checkout/orders');
  const [customHttpStatus, setCustomHttpStatus] = useState(400);
  const [customErrorName, setCustomErrorName] = useState('INVALID_REQUEST');
  const [customMessage, setCustomMessage] = useState('Request payload failed schema validation');
  const [customDebugId, setCustomDebugId] = useState('dbg_manual_test_01');
  const [isAnalyzingCustom, setIsAnalyzingCustom] = useState(false);
  const [customAnalysisResult, setCustomAnalysisResult] = useState<any>(null);

  const fetchErrors = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/paypal/errors');
      if (res.ok) {
        const data: PayPalErrorItem[] = await res.json();
        setErrors(data);
        if (data.length > 0 && !selectedError) {
          setSelectedError(data[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch PayPal errors', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors();
  }, []);

  const handleSimulateNegativeTest = async (scenario: string) => {
    setIsSimulating(true);
    addToast(`Triggering PayPal negative testing fixture: ${scenario}...`, 'info');
    try {
      const res = await fetch('/api/paypal/errors/simulate-negative-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testScenario: scenario })
      });
      if (res.ok) {
        addToast('Negative test error captured in database!', 'success');
        await fetchErrors();
      }
    } catch (err) {
      addToast('Failed to trigger negative test', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleAnalyzeCustom = async () => {
    setIsAnalyzingCustom(true);
    addToast('Submitting error payload to Google Gemini 2.5 Flash...', 'info');
    try {
      const res = await fetch('/api/paypal/errors/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: customOperation,
          httpStatus: customHttpStatus,
          paypalErrorName: customErrorName,
          message: customMessage,
          debugId: customDebugId
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCustomAnalysisResult(data.analysis);
        addToast('Gemini root-cause analysis generated!', 'success');
      }
    } catch (err) {
      addToast('Error analysis request failed', 'error');
    } finally {
      setIsAnalyzingCustom(false);
    }
  };

  const filteredErrors = errors.filter((e) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      e.paypalErrorName.toLowerCase().includes(q) ||
      e.message.toLowerCase().includes(q) ||
      e.operation.toLowerCase().includes(q) ||
      (e.debugId || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-700/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-800 text-rose-400 border border-dark-700">
              AI ERROR INVESTIGATION
            </span>
            <span className="text-xs text-slate-500 font-mono">Gemini 2.5 Flash &bull; PayPal REST API</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            PayPal API Error Analyzer
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Inspect captured gateway rejection codes, correlate PayPal Debug IDs, and generate AI root-cause hypotheses with verified remediation actions.
          </p>
        </div>

        <button
          onClick={fetchErrors}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-dark-700 bg-dark-850 hover:bg-dark-800 text-xs text-slate-300 font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Rejections</span>
        </button>
      </div>

      {/* Negative Testing Trigger Bar */}
      <div className="p-4 rounded-xl bg-dark-850 border border-dark-700/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-200 block">
            PayPal Supported Negative Testing Simulator
          </span>
          <span className="text-[11px] text-slate-400">
            Generate deterministic sandbox errors using official PayPal test headers.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleSimulateNegativeTest('duplicate-request-id')}
            disabled={isSimulating}
            className="px-3 py-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 border border-dark-700 text-xs font-mono text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 text-amber-400" />
            <span>422 DUPLICATE_REQUEST_ID</span>
          </button>

          <button
            onClick={() => handleSimulateNegativeTest('currency-precision')}
            disabled={isSimulating}
            className="px-3 py-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 border border-dark-700 text-xs font-mono text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 text-rose-400" />
            <span>400 DECIMAL_PRECISION</span>
          </button>

          <button
            onClick={() => handleSimulateNegativeTest('auth-mismatch')}
            disabled={isSimulating}
            className="px-3 py-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 border border-dark-700 text-xs font-mono text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 text-electric-400" />
            <span>401 INVALID_CLIENT</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Error Rejection Feed */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by error name, operation, debug ID..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-dark-850 border border-dark-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-hidden focus:border-electric-500"
            />
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredErrors.map((err) => {
              const isSelected = selectedError?.id === err.id;
              const statusColor =
                err.httpStatus === 422 ? 'text-amber-400 border-amber-500/30 bg-amber-950/40' :
                err.httpStatus === 401 ? 'text-electric-400 border-electric-500/30 bg-electric-950/40' :
                'text-rose-400 border-rose-500/30 bg-rose-950/40';

              return (
                <div
                  key={err.id}
                  onClick={() => setSelectedError(err)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-dark-800 border-electric-500 shadow-sm'
                      : 'bg-dark-850 border-dark-700 hover:bg-dark-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${statusColor}`}>
                      HTTP {err.httpStatus} &bull; {err.paypalErrorName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {err.debugId ? `Debug: ${err.debugId.slice(0, 8)}...` : err.environment}
                    </span>
                  </div>

                  <p className="text-xs font-mono font-medium text-slate-200 truncate">
                    {err.operation}
                  </p>

                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {err.message}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Error Analysis */}
        <div className="lg:col-span-7 space-y-5">
          {selectedError ? (
            <div className="bg-dark-850 border border-dark-700/80 rounded-xl p-6 space-y-6">
              {/* Header */}
              <div className="border-b border-dark-700/60 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                    HTTP {selectedError.httpStatus} &bull; {selectedError.paypalErrorName}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    PayPal Debug ID: <code className="text-electric-400">{selectedError.debugId || 'N/A'}</code>
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white font-mono">
                  {selectedError.operation}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Target: <span className="font-mono text-slate-300">{selectedError.endpoint}</span>
                </p>
              </div>

              {/* AI Analysis Cards */}
              {selectedError.aiAnalysis && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <Sparkles className="w-4 h-4 text-electric-400" />
                    <span>Gemini 2.5 Flash Root-Cause Breakdown</span>
                  </div>

                  <div className="p-4 rounded-lg bg-dark-900 border border-dark-700 space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-0.5">
                        1. Observed Fact (Gateway Rejection)
                      </span>
                      <p className="text-slate-200 leading-relaxed font-mono">
                        {selectedError.aiAnalysis.what_happened}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider block mb-0.5">
                        2. AI Root-Cause Hypothesis
                      </span>
                      <p className="text-slate-300 leading-relaxed font-mono">
                        {selectedError.aiAnalysis.likely_cause}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-electric-400 uppercase tracking-wider block mb-0.5">
                        3. Suggested Developer Action
                      </span>
                      <p className="text-slate-200 leading-relaxed font-mono bg-dark-850 p-2.5 rounded border border-dark-700">
                        {selectedError.aiAnalysis.developer_action}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-0.5">
                        4. Verification Strategy
                      </span>
                      <p className="text-slate-400 leading-relaxed font-mono">
                        {selectedError.aiAnalysis.how_to_verify}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Raw Gateway Response Accordion */}
              {selectedError.rawResponse && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                    Sanitized Gateway Response Payload
                  </span>
                  <pre className="p-4 rounded-lg bg-dark-950 border border-dark-700 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-56">
                    {JSON.stringify(selectedError.rawResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-dark-850 rounded-xl border border-dark-700">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">Select a PayPal error to inspect AI diagnosis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
