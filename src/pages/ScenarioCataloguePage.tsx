import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_SCENARIOS } from '../data/mockScenarios';
import { ScenarioId } from '../types';
import {
  Layers,
  ShieldAlert,
  RefreshCw,
  Settings,
  ArrowRight,
  CheckCircle2,
  Clock,
  Info,
  Tag
} from 'lucide-react';

export const ScenarioCataloguePage: React.FC = () => {
  const { setCurrentPage, createNewSession, addToast } = useApp();
  const [expandedId, setExpandedId] = useState<ScenarioId | null>(null);

  const iconMap: Record<string, React.ElementType> = {
    ShieldAlert,
    RefreshCw,
    Settings
  };

  const handleStartSession = async (scenarioId: ScenarioId) => {
    await createNewSession(scenarioId);
    setCurrentPage('debug-session');
    addToast(`Debug session started for: ${MOCK_SCENARIOS.find(s => s.id === scenarioId)?.name}`, 'success');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="border-b border-dark-700/80 pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <Layers className="w-4 h-4 text-electric-400" />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Scenario Catalogue
          </h1>
        </div>
        <p className="text-sm text-slate-400">
          Select a PayPal integration failure scenario to begin a structured debugging session.
        </p>
      </div>

      {/* Scenario Cards */}
      <div className="space-y-4">
        {MOCK_SCENARIOS.map((scenario) => {
          const Icon = iconMap[scenario.iconName] || Layers;
          const isExpanded = expandedId === scenario.id;
          const isAvailable = scenario.availability === 'Available in Demo';

          return (
            <div
              key={scenario.id}
              className={`bg-dark-850 border rounded-xl overflow-hidden transition-all ${
                isAvailable
                  ? 'border-dark-700/80 hover:border-dark-600'
                  : 'border-dark-700/50 opacity-60'
              }`}
            >
              {/* Card Header */}
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2.5 rounded-lg border shrink-0 ${
                      isAvailable
                        ? 'bg-electric-500/10 border-electric-500/20 text-electric-400'
                        : 'bg-dark-800 border-dark-700 text-slate-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white">{scenario.name}</h3>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          isAvailable
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                            : 'bg-dark-800 text-slate-500 border-dark-700'
                        }`}
                      >
                        {isAvailable ? 'AVAILABLE' : 'PLANNED'}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border bg-dark-800 text-slate-400 border-dark-700`}>
                        {scenario.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{scenario.shortDescription}</p>

                    {/* Category tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {scenario.categories.map((cat) => (
                        <span key={cat} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-dark-900 text-slate-500 border border-dark-700 inline-flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" /> {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : scenario.id)}
                      className="px-3 py-1.5 rounded-lg border border-dark-700 bg-dark-900 hover:bg-dark-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors inline-flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      {isExpanded ? 'Less' : 'Details'}
                    </button>
                    {isAvailable && (
                      <button
                        onClick={() => handleStartSession(scenario.id)}
                        className="px-4 py-1.5 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm shadow-electric-500/20"
                      >
                        Start Session <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Detail Panel */}
              {isExpanded && (
                <div className="border-t border-dark-700/60 bg-dark-900/60 p-5 space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Example Symptom</p>
                      <p className="text-rose-300 font-mono bg-rose-950/20 border border-rose-500/20 rounded p-2 leading-relaxed">
                        {scenario.exampleSymptom}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Root Cause Summary</p>
                      <p className="text-amber-300 font-mono bg-amber-950/20 border border-amber-500/20 rounded p-2 leading-relaxed">
                        {scenario.rootCauseSummary}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Full Description</p>
                    <p className="text-slate-300 leading-relaxed">{scenario.fullDescription}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
                    <div className="p-3 rounded bg-dark-850 border border-dark-700">
                      <p className="text-[10px] text-slate-500 uppercase mb-1">Affected File</p>
                      <p className="text-electric-400 text-[11px]">{scenario.affectedFile}</p>
                    </div>
                    <div className="p-3 rounded bg-dark-850 border border-dark-700">
                      <p className="text-[10px] text-slate-500 uppercase mb-1">Target Endpoint</p>
                      <p className="text-slate-200 text-[11px]">{scenario.targetEndpoint}</p>
                    </div>
                    <div className="p-3 rounded bg-dark-850 border border-dark-700">
                      <p className="text-[10px] text-slate-500 uppercase mb-1">Test Cases</p>
                      <p className="text-slate-200 text-[11px]">{scenario.testCases.length} assertions defined</p>
                    </div>
                  </div>

                  {/* Test cases */}
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Test Coverage</p>
                    <div className="space-y-1.5">
                      {scenario.testCases.map((tc) => (
                        <div key={tc.id} className="flex items-start gap-2 p-2 rounded bg-dark-850 border border-dark-700/60">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-slate-200 font-medium">{tc.name}</p>
                            <p className="text-slate-500 text-[11px] mt-0.5">{tc.description}</p>
                          </div>
                          <span className="ml-auto text-[10px] font-mono text-slate-500 shrink-0">{tc.category}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {isAvailable && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleStartSession(scenario.id)}
                        className="px-5 py-2 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-sm shadow-electric-500/20"
                      >
                        Start Debug Session for this Scenario
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {!isAvailable && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[11px]">This scenario is planned but not yet implemented in the prototype.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
