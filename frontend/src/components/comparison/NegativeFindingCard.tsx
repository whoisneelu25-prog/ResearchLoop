import React, { useState } from 'react';
import { Flame, ChevronRight, ChevronDown, ChevronUp, Sparkles, ExternalLink } from 'lucide-react';
import { StudyEvidence } from '../../types';
import { ConfidenceBadge } from '../common/ConfidenceBadge';

interface NegativeFindingCardProps {
  finding: StudyEvidence;
  onInspect: () => void;
}

export const NegativeFindingCard: React.FC<NegativeFindingCardProps> = ({ finding, onInspect }) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleCardClick = () => {
    setShowDetails(!showDetails);
  };

  const handleInspect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInspect();
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white border border-red-200/90 hover:border-red-300 rounded-xl overflow-hidden shadow-xs cursor-pointer transition-standard hover:shadow-sm"
    >
      {/* Compact Main Summary */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="p-2 bg-red-50 text-red-700 rounded-lg border border-red-100 shrink-0 mt-0.5">
              <Flame className="w-4 h-4" />
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded border border-red-200 font-mono">
                  {finding.negative_classification || finding.result_category || 'Null Result'}
                </span>
                <ConfidenceBadge confidence={finding.confidence} />
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold text-slate-700">{finding.study_label}</span>
                <span className="text-xs text-slate-400 font-mono">({finding.year || 2024})</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {finding.paper?.title || `${finding.intervention} Evaluation in ${finding.population}`}
              </h4>
              <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                {finding.result_summary}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
            <button
              type="button"
              onClick={handleInspect}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-800 rounded-md text-[11px] font-bold border border-red-200 transition-standard shadow-xs"
            >
              <span>Inspect Study</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button className="text-slate-400 p-1 hover:text-slate-600">
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Drill-Down Details */}
      {showDetails && (
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-red-50/20 space-y-3">
          {/* Outcome Summary */}
          <div className="text-xs text-slate-700 leading-relaxed bg-white border border-red-100 p-3 rounded-lg shadow-xs">
            <span className="font-bold text-slate-900 block mb-0.5">Reported Outcome:</span>
            {finding.result_summary}
          </div>

          {/* Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Intervention</span>
              <span className="font-semibold text-slate-800 truncate block mt-0.5">{finding.intervention}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Biomarker</span>
              <span className="font-semibold text-slate-800 truncate block mt-0.5">{finding.biomarker || 'Unstratified'}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Sample Size</span>
              <span className="font-mono text-slate-800 block mt-0.5">{finding.sample_size_display || (finding.sample_size ? `n=${finding.sample_size}` : 'n=unspecified')}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Endpoint</span>
              <span className="font-semibold text-slate-800 truncate block mt-0.5">{finding.primary_outcome || 'PFS'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
