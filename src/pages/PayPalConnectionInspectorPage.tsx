import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Server,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  KeyRound,
  ExternalLink,
  Clock,
  ArrowRight,
  Terminal,
  Activity,
  Zap
} from 'lucide-react';

interface InspectorStatus {
  status: 'CONNECTED' | 'CONFIGURATION_REQUIRED' | 'AUTHENTICATION_FAILED' | 'CONNECTION_ERROR';
  isAuthenticated: boolean;
  isConfigured: boolean;
  environment: string;
  targetEndpoint: string;
  oauthEndpoint: string;
  webhookVerifyEndpoint: string;
  httpStatus: number;
  latencyMs: number;
  clientPrefix: string;
  webhookIdConfigured: boolean;
  webhookId: string;
  message: string;
  lastChecked: string;
  recommendations: string[];
}

export const PayPalConnectionInspectorPage: React.FC = () => {
  const { addToast, setCurrentPage } = useApp();
  const [statusData, setStatusData] = useState<InspectorStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/paypal/inspector/status');
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
      }
    } catch (err) {
      console.warn('Failed to inspect PayPal Sandbox connection', err);
    } finally {
      setIsLoading(false);
    }
  };

  const testAuthLive = async () => {
    setIsLoading(true);
    addToast('Executing live OAuth 2.0 handshake against PayPal Sandbox...', 'info');
    try {
      const res = await fetch('/api/paypal/inspector/test-auth', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
        if (data.isAuthenticated) {
          addToast('PayPal Sandbox Connected! OAuth 2.0 token verified.', 'success');
        } else {
          addToast(`PayPal Check: ${data.status}`, 'warning');
        }
      }
    } catch (err) {
      addToast('Backend unreachable for connection check.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const getStatusBadge = () => {
    if (!statusData) return null;
    switch (statusData.status) {
      case 'CONNECTED':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>CONNECTED &bull; SANDBOX READY</span>
          </div>
        );
      case 'AUTHENTICATION_FAILED':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold shadow-xs">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>AUTHENTICATION FAILED</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold shadow-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>CONFIGURATION REQUIRED</span>
          </div>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-700/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1.5 rounded bg-electric-500/10 text-electric-400 border border-electric-500/20">
              <Server className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-800 text-electric-400 border border-dark-700">
              PAYPAL DEVELOPER PLATFORM
            </span>
            <span className="text-xs text-slate-500 font-mono">Sandbox Environment</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            PayPal Sandbox Connection Inspector
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Inspect real-time OAuth 2.0 handshake, gateway latency, and sandbox webhook registration parameters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={testAuthLive}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-sm shadow-electric-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Probing Gateway...' : 'Test Sandbox Connection'}</span>
          </button>
        </div>
      </div>

      {/* Hero Status Banner */}
      <div className="p-6 rounded-xl bg-dark-850 border border-dark-700/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            {statusData && (
              <span className="text-xs text-slate-500 font-mono">
                Latency: <span className="text-electric-400 font-semibold">{statusData.latencyMs}ms</span>
              </span>
            )}
          </div>
          <h2 className="text-base font-semibold text-white">
            {statusData?.message || 'Inspecting PayPal Sandbox Gateway...'}
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            IntegrateIQ connects exclusively to PayPal&apos;s free Developer Sandbox endpoint. Production credentials and live money rails are strictly blocked to prevent accidental financial impact.
          </p>
        </div>

        {statusData && (
          <div className="p-4 rounded-lg bg-dark-900 border border-dark-700/60 font-mono text-xs space-y-2 shrink-0 min-w-56">
            <div className="flex items-center justify-between text-slate-400">
              <span>HTTP Status:</span>
              <span className={statusData.httpStatus === 200 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {statusData.httpStatus || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Environment:</span>
              <span className="text-slate-200 uppercase">{statusData.environment}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Client ID:</span>
              <span className="text-slate-300">{statusData.clientPrefix}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Webhook ID:</span>
              <span className={statusData.webhookIdConfigured ? 'text-emerald-400' : 'text-slate-500'}>
                {statusData.webhookIdConfigured ? 'Configured' : 'Missing'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Endpoint Diagnostics Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-dark-850 border border-dark-700/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <KeyRound className="w-4 h-4 text-electric-400" />
            <span>OAuth 2.0 Token Endpoint</span>
          </div>
          <div className="p-2 rounded bg-dark-900 border border-dark-700 text-[11px] font-mono text-slate-400 break-all">
            POST /v1/oauth2/token
          </div>
          <p className="text-[11px] text-slate-500">
            Server-to-server client credentials exchange with in-memory caching.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-dark-850 border border-dark-700/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Webhook Signature Verification</span>
          </div>
          <div className="p-2 rounded bg-dark-900 border border-dark-700 text-[11px] font-mono text-slate-400 break-all">
            POST /v1/notifications/verify-webhook-signature
          </div>
          <p className="text-[11px] text-slate-500">
            Cryptographic public certificate verification against transmission headers.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-dark-850 border border-dark-700/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Gateway Safety Assertion</span>
          </div>
          <div className="p-2 rounded bg-dark-900 border border-dark-700 text-[11px] font-mono text-emerald-400 break-all">
            api-m.sandbox.paypal.com
          </div>
          <p className="text-[11px] text-slate-500">
            Live rails hard-blocked. All requests enforced to PayPal Developer Sandbox.
          </p>
        </div>
      </div>

      {/* Setup Guide & Recommendations */}
      <div className="bg-dark-850 border border-dark-700/80 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-electric-400" />
          <span>Sandbox Setup &amp; Verification Guidance</span>
        </h3>

        <div className="space-y-2 text-xs">
          {statusData?.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-dark-900 border border-dark-700/60 text-slate-300">
              <span className="text-electric-400 font-bold shrink-0">&bull;</span>
              <span className="font-mono leading-relaxed">{rec}</span>
            </div>
          ))}
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-dark-700/60">
          <a
            href="https://developer.paypal.com/dashboard/applications/sandbox"
            target="_blank"
            rel="noopener noreferrer"
            className="text-electric-400 hover:text-electric-300 font-medium inline-flex items-center gap-1.5"
          >
            <span>Open PayPal Developer Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => setCurrentPage('new-session')}
            className="px-3.5 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 border border-dark-700 text-slate-200 text-xs font-medium transition-colors inline-flex items-center gap-1.5"
          >
            <span>Start Webhook Debug Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
