import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const ResponsibleDisclaimer: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded">
        <ShieldAlert className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span><strong>Research Support Only:</strong> AI-generated hypotheses are exploratory directions requiring independent experimental and clinical validation.</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-600 flex items-start gap-3">
      <ShieldAlert className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
      <div>
        <h4 className="font-semibold text-slate-800 mb-0.5">Responsible AI & Clinical Research Notice</h4>
        <p className="leading-relaxed">
          ResearchLoop is an exploratory research intelligence system. It organizes and interprets published biomedical literature to assist in formulating hypotheses. 
          Generated potential directions do not establish clinical effectiveness, safety, or medical treatment guidelines. All findings must be reviewed against primary sources.
        </p>
      </div>
    </div>
  );
};
