import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_SCENARIOS, CATALOGUE_ADDITIONAL_SCENARIOS } from '../data/mockScenarios';
import { ScenarioDefinition, ScenarioCategory } from '../types';
import { ScenarioDrawer } from '../components/scenarios/ScenarioDrawer';
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  ServerCrash,
  RefreshCw,
  Lock,
  Coins,
  PlusCircle
} from 'lucide-react';

export const TestScenariosPage: React.FC = () => {
  const { createNewSession, setCurrentPage } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [drawerScenario, setDrawerScenario] = useState<ScenarioDefinition | null>(null);

  const allScenarios: ScenarioDefinition[] = [
    ...MOCK_SCENARIOS,
    ...CATALOGUE_ADDITIONAL_SCENARIOS
  ];

  const categories = [
    'All',
    'Positive Tests',
    'Negative Tests',
    'Regression Tests',
    'Configuration Tests',
    'Security'
  ];

  const filteredScenarios = allScenarios.filter((sc) => {
    const matchesQuery =
      sc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sc.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sc.exampleSymptom.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      sc.categories.includes(selectedCategory as ScenarioCategory);

    return matchesQuery && matchesCategory;
  });

  const getIcon = (name: string) => {
    switch (name) {
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
        return <Layers className="w-5 h-5 text-electric-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="border-b border-dark-700/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-800 text-slate-400 border border-dark-700">
              TEST MATRIX
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {allScenarios.length} Curated Archetypes
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            PayPal Test Scenarios Catalogue
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Verified integration failure archetypes with baseline assertions and regression specifications.
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('new-session')}
          className="px-4 py-2 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm shadow-electric-500/20 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Launch Debug Session</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter scenarios by symptom, defect, or category..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-dark-850 border border-dark-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-electric-500 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-electric-600 text-white shadow-xs'
                  : 'bg-dark-850 hover:bg-dark-800 text-slate-400 hover:text-slate-200 border border-dark-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScenarios.map((scenario) => {
          const isInteractive = scenario.availability === 'Available in Demo';

          return (
            <div
              key={scenario.name}
              className="p-5 rounded-lg bg-dark-850 border border-dark-700/80 hover:border-dark-600 flex flex-col justify-between transition-all group"
            >
              <div>
                {/* Meta bar */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-2.5 rounded-lg bg-dark-900 border border-dark-700/80">
                    {getIcon(scenario.iconName)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-900 text-slate-400 border border-dark-700">
                      {scenario.difficulty}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        isInteractive
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                          : 'bg-dark-800 text-slate-400 border-dark-700'
                      }`}
                    >
                      {scenario.availability}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors">
                  {scenario.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {scenario.shortDescription}
                </p>

                {/* Expected Outcome */}
                <div className="mt-3.5 p-2.5 rounded bg-dark-900/80 border border-dark-700/60 font-mono text-[11px]">
                  <span className="text-slate-500 block mb-0.5 uppercase tracking-wider text-[9px] font-sans font-semibold">
                    Expected Outcome
                  </span>
                  <span className="text-emerald-400/90 leading-snug block">
                    {scenario.expectedOutcome}
                  </span>
                </div>

                {/* Categories */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {scenario.categories.map((c, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-900 text-slate-400 border border-dark-700/60"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-dark-700/60 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setDrawerScenario(scenario)}
                  className="text-slate-400 hover:text-slate-200 transition-colors font-medium text-[11px] underline-offset-2 hover:underline"
                >
                  View Details Drawer
                </button>

                {isInteractive ? (
                  <button
                    onClick={() => {
                      createNewSession(scenario.id);
                      setCurrentPage('debug-session');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-medium font-mono text-electric-400 hover:text-electric-300 transition-colors"
                  >
                    <span>Launch</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-[11px] font-mono text-slate-500">
                    Catalogue Only
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Drawer */}
      <ScenarioDrawer
        scenario={drawerScenario}
        isOpen={!!drawerScenario}
        onClose={() => setDrawerScenario(null)}
        onLaunchSession={(sc) => {
          createNewSession(sc.id);
          setCurrentPage('debug-session');
        }}
      />
    </div>
  );
};
