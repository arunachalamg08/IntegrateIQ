import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MOCK_SCENARIOS } from '../../data/mockScenarios';
import { PageId } from '../../types';
import {
  Search,
  Terminal,
  FileCheck2,
  FileDiff,
  Layers,
  Settings,
  PlusCircle,
  FileText,
  LayoutDashboard,
  X,
  ArrowRight
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setCurrentPage,
    sessions,
    loadSession,
    createNewSession
  } = useApp();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredSessions = sessions.filter(
    (s) =>
      s.id.toLowerCase().includes(query.toLowerCase()) ||
      s.scenarioName.toLowerCase().includes(query.toLowerCase())
  );

  const filteredScenarios = MOCK_SCENARIOS.filter(
    (sc) =>
      sc.name.toLowerCase().includes(query.toLowerCase()) ||
      sc.shortDescription.toLowerCase().includes(query.toLowerCase())
  );

  const navigationPages: { id: PageId; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'scenarios', label: 'Scenario Catalogue', icon: Layers },
    { id: 'new-session', label: 'New Debug Session', icon: PlusCircle },
    { id: 'workspace', label: 'Debug Workspace', icon: Terminal },
    { id: 'patch-review', label: 'Patch Review & Approval', icon: FileDiff },
    { id: 'verification-results', label: 'Verification Results', icon: FileCheck2 },
    { id: 'reports', label: 'Evidence Reports', icon: FileText },
    { id: 'settings', label: 'Settings & Health', icon: Settings },
  ];

  const filteredPages = navigationPages.filter((p) =>
    p.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-dark-850 border border-dark-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-dark-700/80 flex items-center gap-3 bg-dark-900">
          <Search className="w-4 h-4 text-electric-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, sessions, scenarios, or navigation..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="text-slate-500 hover:text-slate-300 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Quick Navigation */}
          <div>
            <div className="px-3 py-1 text-[10px] uppercase font-mono tracking-wider text-slate-500">
              Navigation
            </div>
            <div className="space-y-0.5">
              {filteredPages.map((page) => {
                const Icon = page.icon;
                return (
                  <button
                    key={page.id}
                    onClick={() => {
                      setCurrentPage(page.id);
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-dark-750 transition-colors group text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-slate-500 group-hover:text-electric-400 transition-colors" />
                      <span>{page.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Debug Sessions */}
          {filteredSessions.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] uppercase font-mono tracking-wider text-slate-500">
                Debug Sessions
              </div>
              <div className="space-y-0.5">
                {filteredSessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      loadSession(s.id);
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-dark-750 transition-colors group text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Terminal className="w-4 h-4 text-electric-400 shrink-0" />
                      <span className="font-mono text-electric-300 shrink-0">{s.id}</span>
                      <span className="text-slate-400 truncate">— {s.scenarioName}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-dark-900 border border-dark-700 text-slate-400">
                      {s.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Failure Scenarios */}
          {filteredScenarios.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] uppercase font-mono tracking-wider text-slate-500">
                Launch Failure Scenario
              </div>
              <div className="space-y-0.5">
                {filteredScenarios.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      createNewSession(sc.id);
                      setCurrentPage('debug-session');
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-dark-750 transition-colors group text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <PlusCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-200 truncate">{sc.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      Create Session
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 bg-dark-900 border-t border-dark-700/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Tip: Esc to close</span>
          <span>IntegrateIQ Quick Switcher</span>
        </div>
      </div>
    </div>
  );
};
