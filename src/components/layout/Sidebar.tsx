import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageId } from '../../types';
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  Terminal,
  FileDiff,
  FileCheck2,
  FileText,
  Settings,
  Server,
  AlertOctagon,
  ShieldCheck,
  Cpu,
  UserCheck
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, sessions, errorReports } = useApp();

  // Compute live badges
  const pendingPatchesCount = sessions.filter(
    (s) => s.patchReviewStatus === 'PENDING' && !!s.patch
  ).length;

  const passVerificationCount = sessions.filter(
    (s) => s.verificationStatus === 'PASS' && !!s.report
  ).length;

  const totalReportsCount = errorReports.length;

  const navItems: {
    id: PageId;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeVariant?: 'default' | 'amber' | 'emerald';
  }[] = [
    {
      id: 'overview',
      label: 'Overview Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'scenarios',
      label: 'Scenario Catalogue',
      icon: Layers,
      badge: '3'
    },
    {
      id: 'new-session',
      label: 'New Debug Session',
      icon: PlusCircle
    },
    {
      id: 'workspace',
      label: 'Debug Workspace',
      icon: Terminal,
      badge: sessions.length > 0 ? sessions.length : undefined
    },
    {
      id: 'paypal-inspector',
      label: 'PayPal Connection Inspector',
      icon: Server
    },
    {
      id: 'error-analyzer',
      label: 'PayPal API Error Analyzer',
      icon: AlertOctagon
    },
    {
      id: 'patch-review',
      label: 'Patch Review & Approval',
      icon: FileDiff,
      badge: pendingPatchesCount > 0 ? `${pendingPatchesCount} pending` : undefined,
      badgeVariant: 'amber'
    },
    {
      id: 'verification-results',
      label: 'Verification Results',
      icon: FileCheck2,
      badge: passVerificationCount > 0 ? `${passVerificationCount} pass` : undefined,
      badgeVariant: 'emerald'
    },
    {
      id: 'reports',
      label: 'Evidence Reports',
      icon: FileText,
      badge: totalReportsCount > 0 ? totalReportsCount : undefined
    },
    {
      id: 'settings',
      label: 'Settings & Health',
      icon: Settings
    }
  ];

  return (
    <aside className="w-64 bg-dark-900 border-r border-dark-700/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30">
      {/* Brand & Wordmark */}
      <div>
        <div className="p-4 border-b border-dark-700/80">
          <div
            onClick={() => setCurrentPage('overview')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-electric-600 flex items-center justify-center text-white shadow-md shadow-electric-600/30 group-hover:bg-electric-500 transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white group-hover:text-electric-300 transition-colors">
                  IntegrateIQ
                </span>
                <span className="text-[10px] font-mono font-semibold px-1 py-0.2 rounded bg-electric-950 text-electric-400 border border-electric-500/30">
                  v0.2
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-tight">
                PayPal Debug &amp; Verification
              </p>
            </div>
          </div>

          {/* Quick CTA */}
          <button
            onClick={() => setCurrentPage('new-session')}
            className="w-full mt-4 px-3 py-2 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-medium transition-all flex items-center justify-center gap-2 shadow-sm shadow-electric-500/20 group cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
            <span>New Debug Session</span>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-2 space-y-1">
          <div className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-wider text-slate-500">
            Platform Navigation
          </div>
          {navItems.map((item) => {
            // Also treat debug-session as active when workspace item is checked
            const isActive =
              currentPage === item.id ||
              (item.id === 'workspace' && currentPage === 'debug-session');
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-electric-600/15 text-electric-300 border border-electric-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate mr-2">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-electric-400' : 'text-slate-500'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                      item.badgeVariant === 'amber'
                        ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                        : item.badgeVariant === 'emerald'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                        : isActive
                        ? 'bg-electric-500/20 text-electric-300'
                        : 'bg-dark-800 text-slate-400 border border-dark-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status & Profile */}
      <div className="p-3 border-t border-dark-700/80 space-y-2 bg-dark-900/50">
        {/* Prototype Mode Indicator */}
        <div className="p-2.5 rounded-lg bg-dark-850 border border-dark-700/80 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Prototype Mode
            </span>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/30">
              Mock Only
            </span>
          </div>

          {/* Mock Environment Indicator */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-electric-400" />
            <span className="truncate">Node.js Local Fixture</span>
          </div>
        </div>

        {/* User profile placeholder */}
        <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-dark-800 transition-colors cursor-pointer text-xs">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-dark-700 flex items-center justify-center text-slate-300 text-xs font-semibold">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-slate-200 font-medium truncate leading-tight">
              Lead Integration Dev
            </div>
            <div className="text-[10px] text-slate-500 truncate font-mono">
              hackathon-reviewer@demo
            </div>
          </div>
          <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        </div>
      </div>
    </aside>
  );
};
