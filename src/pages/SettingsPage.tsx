import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Cpu,
  KeyRound,
  ShieldCheck,
  Server,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
  CheckCircle2,
  Terminal,
  X,
  RefreshCw
} from 'lucide-react';

interface ConfigStatus {
  gemini: {
    status: string;
    message: string;
    provider: string;
    model: string;
    is_connected: boolean;
    timestamp?: string;
  };
  paypal: {
    status: string;
    message: string;
    endpoint: string;
    is_connected: boolean;
    last_checked?: string;
  };
  test_runner: {
    status: string;
    runtime: string;
    timeout_seconds: number;
    isolation: string;
  };
}

export const SettingsPage: React.FC = () => {
  const { addToast } = useApp();

  const [aiProvider, setAiProvider] = useState<'gemini' | 'anthropic' | 'openai'>('gemini');
  const [modelName, setModelName] = useState('gemini-2.5-flash');
  const [paypalEnv, setPaypalEnv] = useState<'sandbox' | 'production'>('sandbox');

  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [connectionModal, setConnectionModal] = useState<{
    title: string;
    status: string;
    message: string;
    isConnected: boolean;
    details?: string;
  } | null>(null);

  const fetchStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/config/status');
      if (res.ok) {
        const data = await res.json();
        setConfigStatus(data);
      }
    } catch (err) {
      console.warn('Failed to fetch config status', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTestConnection = async (type: 'gemini' | 'paypal') => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/config/status');
      if (res.ok) {
        const data: ConfigStatus = await res.json();
        setConfigStatus(data);

        if (type === 'gemini') {
          const g = data.gemini;
          setConnectionModal({
            title: 'Google Gemini API Connection Test',
            status: g.status,
            message: g.message,
            isConnected: g.is_connected,
            details: `Model: ${g.model} • Provider: ${g.provider}`
          });
        } else {
          const p = data.paypal;
          setConnectionModal({
            title: 'PayPal Sandbox Connection Test',
            status: p.status,
            message: p.message,
            isConnected: p.is_connected,
            details: `Target Endpoint: ${p.endpoint}`
          });
        }
      }
    } catch (err) {
      setConnectionModal({
        title: 'Backend Connection Error',
        status: 'DISCONNECTED',
        message: 'Could not contact IntegrateIQ FastAPI backend on http://localhost:8000.',
        isConnected: false
      });
    } finally {
      setIsLoadingStatus(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="border-b border-dark-700/80 pb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-800 text-electric-400 border border-dark-700">
              INTEGRATION SETTINGS
            </span>
            <span className="text-xs text-slate-500 font-mono">
              FastAPI &bull; Python 3.12 &bull; Pytest 9.1
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Settings &amp; Integration Health
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage live Gemini API keys, PayPal Sandbox credentials, and inspect automated test execution policies.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={isLoadingStatus}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dark-700 bg-dark-850 hover:bg-dark-800 text-xs text-slate-300 font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? 'animate-spin' : ''}`} />
          <span>Refresh Health</span>
        </button>
      </div>

      {/* Security Advisory Banner */}
      <div className="p-4 rounded-lg bg-dark-900 border border-dark-700 text-xs text-slate-300 space-y-1.5">
        <div className="flex items-center gap-2 font-semibold text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Security &amp; Secret Isolation Policy</span>
        </div>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          All API keys and secrets reside exclusively in backend environment variables (<code>.env</code>) and are never exposed to client-side JavaScript or browser storage. Test execution runs in isolated subprocesses with timeouts. Production PayPal rails are permanently blocked for safety.
        </p>
      </div>

      {/* SECTION A: AI PROVIDER CONFIGURATION */}
      <div className="bg-dark-850 border border-dark-700/80 rounded-lg p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-dark-700/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-electric-500/10 text-electric-400 border border-electric-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                A. AI Reasoning Provider (Google Gemini API)
              </h2>
              <p className="text-xs text-slate-400">
                Official Google Gen AI SDK integration for error diagnosis and candidate patch generation
              </p>
            </div>
          </div>

          {configStatus && (
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold ${
                configStatus.gemini.is_connected
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-950 text-amber-300 border border-amber-500/40'
              }`}
            >
              {configStatus.gemini.status}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Reasoning Engine Provider
            </label>
            <select
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-dark-700 text-xs text-slate-200 focus:outline-hidden focus:border-electric-500 font-mono"
            >
              <option value="gemini">Google Gemini (Official Google Gen AI SDK)</option>
              <option value="anthropic" disabled>Anthropic Claude (Future)</option>
              <option value="openai" disabled>OpenAI (Future)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Configured Model Identifier
            </label>
            <input
              type="text"
              value={configStatus?.gemini.model || modelName}
              readOnly
              className="w-full px-3 py-2 rounded-lg bg-dark-900/60 border border-dark-700 text-xs text-slate-300 font-mono"
            />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-dark-900 border border-dark-700/60 text-xs space-y-1">
          <div className="text-slate-300 font-medium">Environment Setup Instructions:</div>
          <p className="text-slate-400 text-[11px] font-mono leading-relaxed">
            Set <code>GEMINI_API_KEY=your_key_here</code> in the project root <code>.env</code> file. When absent, the system seamlessly uses deterministic offline contract rules.
          </p>
        </div>

        {/* Action */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            Endpoint: Google Gen AI REST / gRPC API
          </span>
          <button
            onClick={() => handleTestConnection('gemini')}
            disabled={isLoadingStatus}
            className="px-4 py-2 rounded-lg border border-dark-700 bg-dark-800 hover:bg-dark-750 text-slate-200 text-xs font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-3 h-3 ${isLoadingStatus ? 'animate-spin' : ''}`} />
            <span>Test Gemini Connection</span>
          </button>
        </div>
      </div>

      {/* SECTION B: PAYPAL SANDBOX CONFIGURATION */}
      <div className="bg-dark-850 border border-dark-700/80 rounded-lg p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-dark-700/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                B. PayPal Sandbox Integration
              </h2>
              <p className="text-xs text-slate-400">
                Official PayPal REST API OAuth 2.0 and webhook verification service
              </p>
            </div>
          </div>

          {configStatus && (
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold ${
                configStatus.paypal.is_connected
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-950 text-amber-300 border border-amber-500/40'
              }`}
            >
              {configStatus.paypal.status}
            </span>
          )}
        </div>

        {/* Environment Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Target PayPal Gateway Environment
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border bg-electric-950/40 border-electric-500 text-slate-100 ring-1 ring-electric-500/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold">Sandbox Environment</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400">
                https://api-m.sandbox.paypal.com (Active REST Endpoint)
              </p>
            </div>

            <div className="p-3 rounded-lg border bg-dark-900/40 border-dark-800 text-slate-500 cursor-not-allowed opacity-60">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold line-through">Production (Live Rails)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-500/30">
                  DISABLED
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Permanently blocked for security compliance.
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-dark-900 border border-dark-700/60 text-xs space-y-1">
          <div className="text-slate-300 font-medium">PayPal Sandbox Credentials Setup:</div>
          <p className="text-slate-400 text-[11px] font-mono leading-relaxed">
            Configure <code>PAYPAL_CLIENT_ID</code>, <code>PAYPAL_CLIENT_SECRET</code>, and <code>PAYPAL_WEBHOOK_ID</code> in <code>.env</code>. The backend verifies credentials using real OAuth token acquisition.
          </p>
        </div>

        {/* Action */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            Sandbox endpoint: https://api-m.sandbox.paypal.com
          </span>
          <button
            onClick={() => handleTestConnection('paypal')}
            disabled={isLoadingStatus}
            className="px-4 py-2 rounded-lg border border-dark-700 bg-dark-800 hover:bg-dark-750 text-slate-200 text-xs font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-3 h-3 ${isLoadingStatus ? 'animate-spin' : ''}`} />
            <span>Test PayPal Connection</span>
          </button>
        </div>
      </div>

      {/* SECTION C: TEST EXECUTION CONFIGURATION */}
      <div className="bg-dark-850 border border-dark-700/80 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-dark-700/60">
          <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              C. Test Execution Engine &amp; Policies
            </h2>
            <p className="text-xs text-slate-400">
              Subprocess test runner, execution timeouts, and isolated directory sandboxing
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded bg-dark-900 border border-dark-700/60">
            <div>
              <span className="font-semibold text-slate-200 block">Subprocess Test Runner</span>
              <span className="text-slate-400 text-[11px]">Python 3.12 / Pytest 9.1 Subprocess Runner</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30">
              Active &bull; Subprocess
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-dark-900 border border-dark-700/60">
            <div>
              <span className="font-semibold text-slate-200 block">Isolation Sandbox</span>
              <span className="text-slate-400 text-[11px]">Temporary Directory Copy &bull; Original Fixtures Preserved</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-dark-800 text-slate-300 border border-dark-700">
              Enforced
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-dark-900 border border-dark-700/60">
            <div>
              <span className="font-semibold text-slate-200 block">Verification Assertion Policy</span>
              <span className="text-slate-400 text-[11px]">Strict Independent Test Assertion (&ldquo;AI suggests, tests decide&rdquo;)</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-electric-950 text-electric-400 border border-electric-500/30">
              Enforced
            </span>
          </div>
        </div>
      </div>

      {/* Test Connection Modal */}
      {connectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-dark-850 border border-dark-700 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-sm text-slate-100">
                {connectionModal.isConnected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                )}
                <span>{connectionModal.title}</span>
              </div>
              <button
                onClick={() => setConnectionModal(null)}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded bg-dark-900 border border-dark-700 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Status:</span>
                <span
                  className={`text-xs font-mono font-bold ${
                    connectionModal.isConnected ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {connectionModal.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-1">
                {connectionModal.message}
              </p>
              {connectionModal.details && (
                <p className="text-[10px] text-slate-500 font-mono mt-1 border-t border-dark-800 pt-1">
                  {connectionModal.details}
                </p>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-snug">
              {connectionModal.isConnected
                ? 'External integration is authenticated and ready to receive real live API requests.'
                : 'Configure credentials in .env to activate live requests. When unconfigured, IntegrateIQ safely runs offline contract test fixtures.'}
            </p>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setConnectionModal(null)}
                className="px-4 py-2 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
