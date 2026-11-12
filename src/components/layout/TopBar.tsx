import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Bell,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Info,
  CheckCircle2,
  X
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    activeSession,
    setIsCommandPaletteOpen
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);

  const getPageTitle = () => {
    switch (currentPage) {
      case 'overview':
        return 'Payment Integration Health';
      case 'scenarios':
        return 'Scenario Catalogue';
      case 'new-session':
        return 'New Debug Session';
      case 'workspace':
        return 'Debug Workspace';
      case 'debug-session':
        return 'Interactive Debug Workspace';
      case 'paypal-inspector':
        return 'PayPal Sandbox Connection Inspector';
      case 'error-analyzer':
        return 'PayPal API Error Analyzer';
      case 'patch-review':
        return 'Patch Review & Approval';
      case 'verification-results':
        return 'Verification Results';
      case 'reports':
        return 'Evidence Reports';
      case 'settings':
        return 'Settings & Health';
      case 'not-found':
        return 'Page Not Found (404)';
      default:
        return 'IntegrateIQ';
    }
  };

  const getBreadcrumb = () => {
    switch (currentPage) {
      case 'overview':
        return 'Overview';
      case 'scenarios':
        return 'Scenarios';
      case 'new-session':
        return 'New Session';
      case 'workspace':
        return 'Workspace';
      case 'debug-session':
        return 'Debug Session';
      case 'paypal-inspector':
        return 'PayPal Inspector';
      case 'error-analyzer':
        return 'Error Analyzer';
      case 'patch-review':
        return 'Patch Review';
      case 'verification-results':
        return 'Verification';
      case 'reports':
        return 'Reports';
      case 'settings':
        return 'Settings';
      default:
        return 'Overview';
    }
  };

  const notifications = [
    {
      id: 'notif-1',
      title: 'Incoming Webhook Simulated',
      desc: 'PAYMENT.CAPTURE.COMPLETED WH-EVENT-1042 triggered 400 Bad Request.',
      time: '12m ago',
      icon: ShieldAlert,
      color: 'text-amber-400'
    },
    {
      id: 'notif-2',
      title: 'Deterministic Fixtures Ready',
      desc: 'All 4 baseline PayPal test fixtures loaded into mock runner memory.',
      time: '1h ago',
      icon: CheckCircle2,
      color: 'text-emerald-400'
    },
    {
      id: 'notif-3',
      title: 'Demo Environment Active',
      desc: 'Operating in 100% simulated mode. Real PayPal credentials disabled.',
      time: '2h ago',
      icon: Info,
      color: 'text-electric-400'
    }
  ];

  return (
    <header className="h-14 bg-dark-900 border-b border-dark-700/80 px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Page Title & Breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={() => setCurrentPage('overview')}
          className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors hidden sm:inline"
        >
          IntegrateIQ
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline shrink-0" />
        <span className="text-xs text-slate-400 hidden sm:inline">
          {getBreadcrumb()}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline shrink-0" />
        <h1 className="text-sm font-semibold text-slate-100 truncate">
          {getPageTitle()}
        </h1>

        {currentPage === 'debug-session' && activeSession && (
          <span className="ml-2 px-2 py-0.5 rounded text-[11px] font-mono bg-dark-800 text-electric-400 border border-dark-700 hidden md:inline">
            {activeSession.id}
          </span>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Command palette trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-850 hover:bg-dark-800 border border-dark-700 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer group"
          title="Open Command Palette (Cmd+K / Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 group-hover:text-electric-400 transition-colors" />
          <span className="text-slate-400">Search sessions, scenarios...</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-dark-900 border border-dark-700 text-slate-400">
            Ctrl+K
          </kbd>
        </button>

        {/* Demo Mode Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-electric-950/80 border border-electric-500/40 text-electric-300 text-xs font-mono font-medium shadow-xs">
          <Sparkles className="w-3 h-3 text-electric-400" />
          <span>DEMO MODE</span>
        </div>

        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-dark-850 hover:bg-dark-800 border border-dark-700 text-slate-400 hover:text-slate-200 transition-colors relative"
            title="Activity Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-electric-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-dark-850 border border-dark-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in duration-150">
              <div className="p-3 bg-dark-900 border-b border-dark-700/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  Simulated Event Log
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-dark-700/50 max-h-72 overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} className="p-3 hover:bg-dark-800/60 transition-colors text-xs">
                      <div className="flex items-start gap-2.5">
                        <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${n.color}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{n.title}</span>
                            <span className="text-[10px] font-mono text-slate-500">{n.time}</span>
                          </div>
                          <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">
                            {n.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-2.5 bg-dark-900/60 border-t border-dark-700/80 text-center">
                <span className="text-[10px] font-mono text-slate-500">
                  Mock stream — no actual network listeners
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
