import React, { useState } from 'react';
import { HelpCircle, Calculator, Sparkles, ChevronDown, ChevronUp, Bookmark } from 'lucide-react';
import { ResearchDirection } from '../../types';
import { ReasoningChain } from './ReasoningChain';
import { OpportunityScoreCard } from './OpportunityScoreCard';

interface DirectionCardProps {
  direction: ResearchDirection;
  index: number;
  onToggleSave: (id: string) => void;
  onOpenWhyModal: (direction: ResearchDirection) => void;
}

export const DirectionCard: React.FC<DirectionCardProps> = ({
  direction: h,
  index: idx,
  onToggleSave,
  onOpenWhyModal,
}) => {
  const [showFullPlan, setShowFullPlan] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 transition-standard">
      {/* Compact Header Summary */}
      <div 
        onClick={() => setShowFullPlan(!showFullPlan)}
        className="p-5 cursor-pointer bg-white hover:bg-slate-50/70 transition-standard space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200 font-mono">
                Direction 0{idx + 1}
              </span>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {h.tier}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {h.research_question}
            </h3>
            <p className="text-xs text-slate-600 mt-1 line-clamp-1">
              {h.observed_evidence_summary}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            <div className="text-right">
              <div className="text-2xl font-black text-brand-700 font-mono">
                {h.overall_score} <span className="text-xs text-slate-400 font-sans font-normal">/ 100</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Opportunity Score</span>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-standard ml-1"
            >
              <span>{showFullPlan ? 'Hide Details' : 'View Strategy'}</span>
              {showFullPlan ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Quick Footer */}
        {!showFullPlan && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono text-[11px] text-slate-400">Novelty: {h.novelty_score} • Gap: {h.gap_score} • Feasibility: {h.feasibility_score} • Impact: {h.impact_score}</span>
            <span className="text-brand-600 font-semibold text-xs flex items-center gap-1">Click to expand reasoning chain & protocol →</span>
          </div>
        )}
      </div>

      {/* Expanded Drill-Down Strategy */}
      {showFullPlan && (
        <div className="p-5 border-t border-slate-100 bg-slate-50/60 space-y-5">
          {/* Action Bar */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-3 flex-wrap">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Experimental Strategy & Opportunity Decomposition
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(h.id);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-standard ${
                  h.is_saved
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${h.is_saved ? 'fill-amber-500 text-amber-500' : ''}`} />
                <span>{h.is_saved ? 'Saved' : 'Save Direction'}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenWhyModal(h);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-300 transition-standard shadow-xs"
              >
                <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
                <span>Why this direction?</span>
              </button>
            </div>
          </div>

          {/* Reasoning Chain */}
          <ReasoningChain direction={h} />

          {/* Opportunity Score Breakdown */}
          <OpportunityScoreCard
            direction={h}
            onOpenWhyModal={() => onOpenWhyModal(h)}
          />
        </div>
      )}
    </div>
  );
};
