import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_SCENARIOS } from '../data/mockScenarios';
import { ScenarioId } from '../types';
import {
  PlusCircle,
  Terminal,
  ArrowRight,
  Info,
  Cpu,
  Globe
} from 'lucide-react';

const EXECUTION_MODES = [
  {
    id: 'offline',
    label: 'Offline Contract Testing',
    description: 'Runs entirely locally using static contract fixtures. No network required. No real PayPal API calls. Ideal for reproducing failure patterns in a sandboxed environment.',
    badge: 'SIMULATED',
    badgeColor: 'bg-amber-950/60 text-amber-400 border-amber-500/30'
  },
  {
    id: 'sandbox',
    label: 'PayPal Sandbox Integration Testing',
    description: 'Uses actual PayPal Sandbox credentials to issue real (but non-production) API requests. Requires PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to be configured.',
    badge: 'REQUIRES CONFIG',
    badgeColor: 'bg-sky-950/60 text-sky-400 border-sky-500/30'
  }
] as const;

export const NewSessionPage: React.FC = () => {
  const { createNewSession, setCurrentPage, addToast } = useApp();

  const [title, setTitle] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId | ''>('');
  const [executionMode, setExecutionMode] = useState<'offline' | 'sandbox'>('offline');
  const [description, setDescription] = useState('');
  const [environment, setEnvironment] = useState('Node.js v20 — Local Fixture Runner');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Session title is required.';
    if (!selectedScenario) newErrors.scenario = 'Please select a failure scenario.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!selectedScenario) return;

    setIsCreating(true);
    const session = await createNewSession(selectedScenario as ScenarioId);
    addToast(`Session ${session.id} created successfully!`, 'success');
    setCurrentPage('debug-session');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="border-b border-dark-700/80 pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <PlusCircle className="w-4 h-4 text-electric-400" />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            New Debug Session
          </h1>
        </div>
        <p className="text-sm text-slate-400">
          Create a structured debugging session. Each session follows the full 7-stage verification lifecycle.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Session Title */}
        <div>
          <label htmlFor="title" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Session Title <span className="text-rose-400">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Investigate webhook 400 error on PAYMENT.CAPTURE.COMPLETED"
            className={`w-full bg-dark-900 border rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-electric-500 transition-colors ${
              errors.title ? 'border-rose-500/60' : 'border-dark-700'
            }`}
          />
          {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title}</p>}
        </div>

        {/* Scenario Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Failure Scenario <span className="text-rose-400">*</span>
          </label>
          <div className="space-y-2">
            {MOCK_SCENARIOS.map((sc) => {
              const isAvailable = sc.availability === 'Available in Demo';
              return (
                <label
                  key={sc.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedScenario === sc.id
                      ? 'border-electric-500/50 bg-electric-500/5'
                      : isAvailable
                      ? 'border-dark-700 bg-dark-850 hover:border-dark-600'
                      : 'border-dark-700/50 bg-dark-850/50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <input
                    type="radio"
                    name="scenario"
                    value={sc.id}
                    checked={selectedScenario === sc.id}
                    onChange={() => isAvailable && setSelectedScenario(sc.id as ScenarioId)}
                    disabled={!isAvailable}
                    className="mt-0.5 accent-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-200">{sc.name}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        isAvailable
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                          : 'bg-dark-800 text-slate-500 border-dark-700'
                      }`}>
                        {isAvailable ? 'AVAILABLE' : 'PLANNED'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{sc.shortDescription}</p>
                  </div>
                </label>
              );
            })}
          </div>
          {errors.scenario && <p className="text-xs text-rose-400 mt-1">{errors.scenario}</p>}
        </div>

        {/* Execution Mode */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Execution Mode
          </label>
          <div className="space-y-2">
            {EXECUTION_MODES.map((mode) => (
              <label
                key={mode.id}
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  executionMode === mode.id
                    ? 'border-electric-500/50 bg-electric-500/5'
                    : 'border-dark-700 bg-dark-850 hover:border-dark-600'
                } ${mode.id === 'sandbox' ? 'opacity-70' : ''}`}
              >
                <input
                  type="radio"
                  name="executionMode"
                  value={mode.id}
                  checked={executionMode === mode.id}
                  onChange={() => setExecutionMode(mode.id)}
                  className="mt-0.5 accent-blue-500"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {mode.id === 'offline' ? (
                      <Cpu className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-sky-400" />
                    )}
                    <span className="text-sm font-medium text-slate-200">{mode.label}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${mode.badgeColor}`}>
                      {mode.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{mode.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Description <span className="text-slate-500">(optional)</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe the context, affected environment, or any additional notes..."
            className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-electric-500 transition-colors resize-none"
          />
        </div>

        {/* Environment */}
        <div>
          <label htmlFor="environment" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Environment
          </label>
          <input
            id="environment"
            type="text"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-electric-500 transition-colors font-mono"
          />
        </div>

        {/* Info Notice */}
        <div className="p-3.5 rounded-lg bg-dark-900 border border-dark-700/60 flex gap-2 text-xs text-slate-400">
          <Info className="w-4 h-4 text-electric-400 shrink-0 mt-0.5" />
          <span>
            A unique Session ID will be generated automatically. The session starts in <span className="font-mono text-electric-400">CREATED</span> state.
            No data from previous sessions will be carried over.
          </span>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setCurrentPage('overview')}
            className="px-4 py-2.5 rounded-lg border border-dark-700 text-slate-300 hover:bg-dark-800 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="flex-1 px-5 py-2.5 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm shadow-electric-500/20 disabled:opacity-60"
          >
            {isCreating ? (
              <>
                <Terminal className="w-4 h-4 animate-pulse" />
                Creating session…
              </>
            ) : (
              <>
                <span>Create Debug Session</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
