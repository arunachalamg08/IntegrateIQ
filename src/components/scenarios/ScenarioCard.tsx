import React from 'react';
import { ScenarioDefinition } from '../../types';
import { ShieldAlert, RefreshCw, ServerCrash, Lock, Coins, ArrowRight, Check } from 'lucide-react';

interface ScenarioCardProps {
  scenario: ScenarioDefinition;
  isSelected?: boolean;
  onSelect?: () => void;
  showSelectAction?: boolean;
  onViewDetails?: () => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  isSelected,
  onSelect,
  showSelectAction = true,
  onViewDetails
}) => {
  const getIcon = () => {
    switch (scenario.iconName) {
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'RefreshCw':
        return <RefreshCw className="w-5 h-5 text-electric-400" />;
      case 'ServerCrash':
        return <ServerCrash className="w-5 h-5 text-amber-400" />;
      case 'Lock':
        return <Lock className="w-5 h-5 text-indigo-400" />;
      case 'Coins':
        return <Coins className="w-5 h-5 text-emerald-400" />;
      default:
        return <ShieldAlert className="w-5 h-5 text-electric-400" />;
    }
  };

  const difficultyBadge = {
    Low: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30',
    Medium: 'bg-amber-950/40 text-amber-400 border-amber-500/30',
    High: 'bg-rose-950/40 text-rose-400 border-rose-500/30'
  }[scenario.difficulty];

  return (
    <div
      onClick={onSelect}
      className={`relative p-5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between group ${
        isSelected
          ? 'bg-dark-800 border-electric-500 shadow-md shadow-electric-500/10 ring-1 ring-electric-500/50'
          : 'bg-dark-850 hover:bg-dark-800/80 border-dark-700/80 hover:border-dark-600'
      }`}
    >
      <div>
        {/* Top meta */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="p-2.5 rounded-lg bg-dark-900 border border-dark-700/80">
            {getIcon()}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${difficultyBadge}`}
            >
              {scenario.difficulty} Complexity
            </span>
            {isSelected && (
              <span className="p-1 rounded-full bg-electric-600 text-white">
                <Check className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors">
          {scenario.name}
        </h3>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          {scenario.shortDescription}
        </p>

        {/* Example Symptom */}
        <div className="mt-3.5 p-2.5 rounded bg-dark-900/80 border border-dark-700/60 font-mono text-[11px]">
          <span className="text-slate-500 block mb-0.5 uppercase tracking-wider text-[9px] font-sans font-semibold">
            Observed Demo Symptom
          </span>
          <span className="text-rose-400/90 leading-snug block">
            {scenario.exampleSymptom}
          </span>
        </div>
      </div>

      {/* Footer Details */}
      <div className="mt-4 pt-3 border-t border-dark-700/60 flex items-center justify-between text-xs">
        <span className="font-mono text-[11px] text-slate-500">
          Target: {scenario.affectedFile.split('/').pop()}
        </span>

        <div className="flex items-center gap-2">
          {onViewDetails && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
              className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors underline-offset-2 hover:underline"
            >
              Inspect Suite
            </button>
          )}

          {showSelectAction && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium font-mono ${
                isSelected ? 'text-electric-400' : 'text-slate-500 group-hover:text-slate-300'
              }`}
            >
              {isSelected ? 'Selected' : 'Select'}
              <ArrowRight className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
