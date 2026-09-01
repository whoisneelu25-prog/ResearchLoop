import React from 'react';

interface ConfidenceBadgeProps {
  confidence: 'High' | 'Medium' | 'Low' | string;
  showIcon?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence }) => {
  const conf = confidence || 'Medium';
  let styles = 'bg-slate-100 text-slate-700 border-slate-300';
  let stars = '•••';

  if (conf.toLowerCase() === 'high') {
    styles = 'bg-blue-50 text-blue-800 border-blue-200 font-semibold';
    stars = '●●●';
  } else if (conf.toLowerCase() === 'medium') {
    styles = 'bg-amber-50 text-amber-800 border-amber-200';
    stars = '●●○';
  } else {
    styles = 'bg-slate-100 text-slate-600 border-slate-200';
    stars = '●○○';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs border ${styles}`} title={`Confidence: ${conf}`}>
      <span className="tracking-widest text-[10px] opacity-80">{stars}</span>
      <span>{conf}</span>
    </span>
  );
};
