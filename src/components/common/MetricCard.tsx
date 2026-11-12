import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon?: LucideIcon;
  accentColor?: 'blue' | 'green' | 'amber' | 'purple';
  trend?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = 'blue',
  trend
}) => {
  const accentBorder = {
    blue: 'hover:border-electric-500/40',
    green: 'hover:border-emerald-500/40',
    amber: 'hover:border-amber-500/40',
    purple: 'hover:border-indigo-500/40'
  }[accentColor];

  const iconBg = {
    blue: 'bg-electric-500/10 text-electric-400 border-electric-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
  }[accentColor];

  return (
    <div
      className={`bg-dark-850 border border-dark-700/80 rounded-lg p-5 transition-all duration-200 relative group ${accentBorder}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-md border ${iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl font-semibold tracking-tight text-slate-50 font-mono">
          {value}
        </span>
        {trend && (
          <span className="text-xs font-mono text-slate-400">
            {trend}
          </span>
        )}
      </div>

      <p className="text-xs text-slate-400 line-clamp-1">
        {subtitle}
      </p>

      <div className="mt-3 pt-2.5 border-t border-dark-700/50 flex items-center justify-between">
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
          Illustrative demo data
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-electric-400 transition-colors" />
      </div>
    </div>
  );
};
