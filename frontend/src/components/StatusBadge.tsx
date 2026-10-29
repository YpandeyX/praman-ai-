import React from 'react';
import { CheckCircle2, FileDiff, AlertTriangle, SearchX, HelpCircle } from 'lucide-react';
import { VerificationStatus } from '../types';

interface StatusBadgeProps {
  status: VerificationStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs = {
    'Exact Match': {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-emerald-500/20',
      icon: CheckCircle2,
      dot: 'bg-emerald-500',
      label: 'Exact Match',
    },
    'Modified Quote': {
      bg: 'bg-amber-50 text-amber-800 border-amber-200 ring-amber-500/20',
      icon: FileDiff,
      dot: 'bg-amber-500',
      label: 'Modified Quote',
    },
    'Context Mismatch': {
      bg: 'bg-orange-50 text-orange-800 border-orange-200 ring-orange-500/20',
      icon: AlertTriangle,
      dot: 'bg-orange-500',
      label: 'Context Mismatch',
    },
    'Source Not Found': {
      bg: 'bg-rose-50 text-rose-800 border-rose-200 ring-rose-500/20',
      icon: SearchX,
      dot: 'bg-rose-500',
      label: 'Source Not Found',
    },
    'Inconclusive': {
      bg: 'bg-slate-100 text-slate-800 border-slate-300 ring-slate-500/20',
      icon: HelpCircle,
      dot: 'bg-slate-400',
      label: 'Inconclusive',
    },
  };

  const config = configs[status] || configs['Inconclusive'];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2',
    lg: 'text-base px-4 py-1.5 gap-2.5 font-semibold',
  }[size];

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs font-medium ${config.bg} ${sizeClasses}`}
    >
      <Icon size={iconSizes} className="shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};
