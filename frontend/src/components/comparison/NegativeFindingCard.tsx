import React from 'react';
import { Flame, ShieldAlert, Quote, ChevronRight } from 'lucide-react';
import { StudyEvidence } from '../../types';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';

interface NegativeFindingCardProps {
  finding: StudyEvidence;
  onInspect: () => void;
}

export const NegativeFindingCard: React.FC<NegativeFindingCardProps> = ({ finding, onInspect }) => {
  return (
    <div
      onClick={onInspect}
      className="bg-white border border-red-200/80 hover:border-red-300 rounded-lg p-5 cursor-pointer transition-standard shadow-xs hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-50 text-red-700 rounded-md border border-red-100 flex-shrink-0 mt-0.5">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold text-red-800 uppercase tracking-wider">
                {finding.negative_classification || finding.result_category || 'Null Result'}
              </span>
              <ConfidenceBadge confidence={finding.confidence} />
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-700">{finding.study_label}</span>
              <span className="text-xs text-slate-500 font-mono">({finding.year || 2024})</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 leading-snug">
              {finding.paper?.title || `${finding.intervention} Evaluation in ${finding.population}`}
            </h4>
          </div>
        </div>
        <button className="text-slate-400 hover:text-brand-600 p-1">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Outcome Summary */}
      <div className="mt-3 text-xs text-slate-700 leading-relaxed bg-red-50/30 border border-red-100/60 p-3 rounded">
        <span className="font-semibold text-slate-900 block mb-0.5">Reported Outcome:</span>
        {finding.result_summary}
      </div>

      {/* Parameters */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
        <div>
          <span className="text-slate-400 block uppercase font-semibold text-[10px]">Intervention</span>
          <span className="font-medium text-slate-800 truncate block">{finding.intervention}</span>
        </div>
        <div>
          <span className="text-slate-400 block uppercase font-semibold text-[10px]">Biomarker</span>
          <span className="font-medium text-slate-800 truncate block">{finding.biomarker || 'Unstratified'}</span>
        </div>
        <div>
          <span className="text-slate-400 block uppercase font-semibold text-[10px]">Sample Size</span>
          <span className="font-mono text-slate-800 block">{finding.sample_size_display || (finding.sample_size ? `n=${finding.sample_size}` : 'n=unspecified')}</span>
        </div>
        <div>
          <span className="text-slate-400 block uppercase font-semibold text-[10px]">Primary Endpoint</span>
          <span className="font-medium text-slate-800 truncate block">{finding.primary_outcome || 'PFS'}</span>
        </div>
      </div>
    </div>
  );
};
