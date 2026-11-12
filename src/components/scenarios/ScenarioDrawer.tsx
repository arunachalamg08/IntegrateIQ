import React from 'react';
import { ScenarioDefinition } from '../../types';
import { X, ShieldAlert, CheckCircle2, FileCode, Layers, ArrowRight } from 'lucide-react';

interface ScenarioDrawerProps {
  scenario: ScenarioDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  onLaunchSession?: (scenario: ScenarioDefinition) => void;
}

export const ScenarioDrawer: React.FC<ScenarioDrawerProps> = ({
  scenario,
  isOpen,
  onClose,
  onLaunchSession
}) => {
  if (!isOpen || !scenario) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-dark-900 border-l border-dark-700 h-full overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-dark-700/80 bg-dark-850 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-dark-800 text-slate-300 border border-dark-700">
                {scenario.id}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-electric-950/40 text-electric-400 border border-electric-500/20">
                {scenario.availability}
              </span>
            </div>
            <h2 className="text-base font-semibold text-slate-100">
              {scenario.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-dark-750 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Overview */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Scenario Description
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {scenario.fullDescription}
            </p>
          </div>

          {/* Symptom & Root Cause */}
          <div className="grid grid-cols-1 gap-3 font-mono text-xs">
            <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-500/30">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-rose-400 block mb-1">
                Simulated Symptom
              </span>
              <p className="text-rose-200 leading-relaxed">
                {scenario.exampleSymptom}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-500/30">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-400 block mb-1">
                Root Cause Anatomy
              </span>
              <p className="text-amber-200 leading-relaxed">
                {scenario.rootCauseSummary}
              </p>
            </div>
          </div>

          {/* Technical Targets */}
          <div className="p-4 rounded-lg bg-dark-850 border border-dark-700/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-electric-400" />
                Affected File:
              </span>
              <span className="font-mono text-slate-200">{scenario.affectedFile}</span>
            </div>
            <div className="flex items-center justify-between border-t border-dark-700/50 pt-2">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-electric-400" />
                Target Endpoint:
              </span>
              <span className="font-mono text-slate-200">{scenario.targetEndpoint}</span>
            </div>
          </div>

          {/* Test Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              Covered Test Categories
            </h4>
            <div className="flex flex-wrap gap-2">
              {scenario.categories.map((cat, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded text-xs font-mono bg-dark-800 text-slate-300 border border-dark-700"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Test suite list */}
          {scenario.testCases.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                Pre-configured Assertions ({scenario.testCases.length})
              </h4>
              <div className="space-y-2">
                {scenario.testCases.map((tc) => (
                  <div
                    key={tc.id}
                    className="p-3 rounded-lg bg-dark-850 border border-dark-700/70 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-200">{tc.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 bg-dark-900 px-1.5 py-0.5 rounded border border-dark-700">
                        {tc.category}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-snug">
                      {tc.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-dark-850 border-t border-dark-700/80 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-dark-700 text-slate-300 hover:bg-dark-750 text-xs font-medium transition-colors"
          >
            Close Details
          </button>

          {onLaunchSession && scenario.availability === 'Available in Demo' && (
            <button
              onClick={() => {
                onClose();
                onLaunchSession(scenario);
              }}
              className="px-4 py-2 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-medium transition-colors inline-flex items-center gap-1.5 shadow-sm shadow-electric-500/20"
            >
              <span>Start Debug Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
