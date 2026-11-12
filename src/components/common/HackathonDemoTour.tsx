import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Play,
  X,
  Server,
  AlertOctagon,
  ShieldAlert,
  FileCheck2,
  FileDiff,
  Award
} from 'lucide-react';
import { PageId } from '../../types';

interface TourStep {
  step: number;
  title: string;
  page: PageId;
  description: string;
  icon: React.ElementType;
}

export const HackathonDemoTour: React.FC = () => {
  const { currentPage, setCurrentPage } = useApp();
  const [isOpen, setIsOpen] = useState(true);

  const steps: TourStep[] = [
    {
      step: 1,
      title: 'PayPal Inspector',
      page: 'paypal-inspector',
      description: 'Verify live Sandbox OAuth 2.0 handshake & latency',
      icon: Server
    },
    {
      step: 2,
      title: 'Error Analyzer',
      page: 'error-analyzer',
      description: 'Correlate PayPal Debug IDs with Gemini root-cause breakdown',
      icon: AlertOctagon
    },
    {
      step: 3,
      title: 'Scenario Catalogue',
      page: 'scenarios',
      description: 'Select flagship Webhook Signature Verification scenario',
      icon: ShieldAlert
    },
    {
      step: 4,
      title: 'Reproduce Failure',
      page: 'debug-session',
      description: 'Execute isolated Pytest runner to capture exit code 1',
      icon: Play
    },
    {
      step: 5,
      title: 'Review Patch',
      page: 'patch-review',
      description: 'Human gatekeeper reviews unified diff & approves fix',
      icon: FileDiff
    },
    {
      step: 6,
      title: 'Verify & Export',
      page: 'reports',
      description: 'Independent Pytest verification & HTML/JSON report download',
      icon: FileCheck2
    }
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold shadow-lg shadow-electric-600/30 transition-all cursor-pointer"
        >
          <Award className="w-4 h-4" />
          <span>Hackathon Demo Guide</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-dark-950 border-b border-electric-500/30 px-4 py-2.5 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-1 rounded bg-electric-500/20 text-electric-400">
            <Award className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-white tracking-tight">
            PayPal + AI Hackathon Demo Flow:
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = currentPage === s.page;
            return (
              <button
                key={s.step}
                onClick={() => setCurrentPage(s.page)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-electric-600 text-white font-bold ring-1 ring-electric-400 shadow-xs'
                    : 'bg-dark-900 border border-dark-700/80 text-slate-400 hover:text-slate-200 hover:bg-dark-850'
                }`}
                title={s.description}
              >
                <span className="opacity-70">{s.step}.</span>
                <Icon className="w-3 h-3" />
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-500 hover:text-slate-300 p-1 shrink-0 ml-auto md:ml-0"
          title="Minimize Demo Guide"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
