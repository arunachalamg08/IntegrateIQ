import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_SCENARIOS } from '../data/mockScenarios';
import { ScenarioCard } from '../components/scenarios/ScenarioCard';
import { ScenarioId } from '../types';
import {
  Server,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const StartSessionPage: React.FC = () => {
  const { createNewSession, setCurrentPage } = useApp();
  const [selectedScenarioId, setSelectedScenarioId] = useState<ScenarioId>('wh-signature');
  const [selectedApp, setSelectedApp] = useState<'paypal-webhook-receiver-node'>('paypal-webhook-receiver-node');

  const selectedScenario = MOCK_SCENARIOS.find((s) => s.id === selectedScenarioId) || MOCK_SCENARIOS[0];

  const handleCreateSession = () => {
    createNewSession(selectedScenarioId);
    setCurrentPage('debug-session');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="border-b border-dark-700/80 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-electric-950/60 text-electric-400 border border-electric-500/30">
            STEP-BY-STEP WIZARD
          </span>
          <span className="text-xs text-slate-500 font-mono">3-Minute Setup</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
          Start Debug Session
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Select a PayPal integration failure scenario and simulated application runner to begin guided diagnosis.
        </p>
      </div>

      {/* Step 1: Scenario Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-electric-600 text-white text-xs font-bold flex items-center justify-center font-mono">
              1
            </span>
            <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              Select Failure Scenario
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            3 Pre-configured Demo Scenarios
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_SCENARIOS.map((sc) => (
            <ScenarioCard
              key={sc.id}
              scenario={sc}
              isSelected={selectedScenarioId === sc.id}
              onSelect={() => setSelectedScenarioId(sc.id)}
            />
          ))}
        </div>
      </div>

      {/* Step 2: Sample Application */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-electric-600 text-white text-xs font-bold flex items-center justify-center font-mono">
              2
            </span>
            <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              Select Sample Application Target
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Simulated Local Environment
          </span>
        </div>

        <div className="p-5 rounded-lg border bg-dark-800 border-electric-500/60 shadow-sm shadow-electric-500/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-electric-500/10 text-electric-400 border border-electric-500/20">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-100">
                    PayPal Webhook Receiver — Node.js
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                    Preconfigured
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Express.js webhook listener handling PayPal captures, refunds, and signature verification.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2.5 py-1 rounded bg-dark-900 border border-dark-700 text-slate-300">
                Node.js v20.x
              </span>
              <span className="px-2.5 py-1 rounded bg-dark-900 border border-dark-700 text-electric-400">
                Mock Local
              </span>
            </div>
          </div>

          {/* Environmental Spec Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-4 border-t border-dark-700/60 text-xs">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Environment</span>
              <span className="font-semibold text-slate-300">Mock Local Environment</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Runtime</span>
              <span className="font-semibold text-slate-300">Node.js (Express)</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Scenario</span>
              <span className="font-semibold text-electric-400 truncate block">{selectedScenario.name}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Execution Mode</span>
              <span className="font-semibold text-slate-300">Simulated</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Credentials</span>
              <span className="font-semibold text-emerald-400">Not Required (Safe)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Session Creation CTA */}
      <div className="p-6 rounded-lg bg-dark-850 border border-dark-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1">
            <span className="w-5 h-5 rounded-full bg-electric-600 text-white text-xs font-bold flex items-center justify-center font-mono">
              3
            </span>
            <span>Create Demo Session</span>
          </div>
          <p className="text-xs text-slate-400">
            Initializes local session state and loads simulated request fixtures into the workspace.
          </p>
        </div>

        <button
          onClick={handleCreateSession}
          className="px-6 py-3 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-md shadow-electric-500/25 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Create Demo Session</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-lg bg-dark-900/60 border border-dark-700/60 flex items-start gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Safe Hackathon Demonstration:</strong> Clicking &ldquo;Create Demo Session&rdquo; modifies only client-side browser state. No actual PayPal endpoints are contacted, no live API credentials are required, and no code files on your system will be altered.
        </p>
      </div>
    </div>
  );
};
