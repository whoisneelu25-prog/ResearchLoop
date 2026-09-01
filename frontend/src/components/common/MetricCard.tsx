import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  subtext?: string;
  variant?: 'default' | 'negative' | 'warning' | 'info' | 'success';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon: Icon,
  subtext,
  variant = 'default',
  onClick,
}) => {
  let borderStyle = 'border-slate-200 hover:border-slate-300';
  let iconBg = 'bg-slate-100 text-slate-700';

  if (variant === 'negative') {
    borderStyle = 'border-red-200/80 hover:border-red-300 bg-gradient-to-b from-white to-red-50/20';
    iconBg = 'bg-red-50 text-red-700 border border-red-200';
  } else if (variant === 'warning') {
    borderStyle = 'border-amber-200/80 hover:border-amber-300 bg-gradient-to-b from-white to-amber-50/20';
    iconBg = 'bg-amber-50 text-amber-700 border border-amber-200';
  } else if (variant === 'info') {
    borderStyle = 'border-blue-200/80 hover:border-blue-300 bg-gradient-to-b from-white to-blue-50/20';
    iconBg = 'bg-blue-50 text-brand-600 border border-blue-200';
  } else if (variant === 'success') {
    borderStyle = 'border-emerald-200/80 hover:border-emerald-300 bg-gradient-to-b from-white to-emerald-50/20';
    iconBg = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border p-4 transition-standard ${borderStyle} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-md ${iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        {subtext && <span className="text-xs text-slate-500">{subtext}</span>}
      </div>
    </div>
  );
};
