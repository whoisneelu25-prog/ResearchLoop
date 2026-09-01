import React from 'react';

interface EvidenceBadgeProps {
  type: 'positive' | 'negative' | 'null' | 'mixed' | 'inconclusive' | string;
  category?: string;
  size?: 'sm' | 'md';
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({ type, category, size = 'md' }) => {
  const normalized = (type || 'inconclusive').toLowerCase();
  
  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';
  let label = category || 'Inconclusive';

  if (normalized === 'positive') {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-600';
    label = category || 'Positive';
  } else if (normalized === 'negative') {
    styles = 'bg-red-50 text-red-800 border-red-200';
    dotColor = 'bg-red-600';
    label = category || 'Negative';
  } else if (normalized === 'null') {
    styles = 'bg-rose-50 text-rose-800 border-rose-200';
    dotColor = 'bg-rose-600';
    label = category || 'Null Result';
  } else if (normalized === 'mixed') {
    styles = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-600';
    label = category || 'Mixed Efficacy';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded border ${padding} ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
};
