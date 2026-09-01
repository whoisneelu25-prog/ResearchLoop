import React from 'react';
import { HelpCircle, Calculator, Sparkles } from 'lucide-react';
import { ResearchDirection } from '../../types';
import { useCopilot } from '../../context/CopilotContext';

interface OpportunityScoreCardProps {
  direction: ResearchDirection;
  onOpenWhyModal?: () => void;
}

export const OpportunityScoreCard: React.FC<OpportunityScoreCardProps> = ({
  direction,
  onOpenWhyModal,
}) => {
  const { openCopilot } = useCopilot();
  const { novelty_score, gap_score, feasibility_score, impact_score, overall_score, tier } = direction;

  const handleExplainWithCopilot = () => {
    openCopilot(
      `Explain why this research direction was synthesized and how its ${overall_score}/100 opportunity score was calculated.`,
      { type: 'hypothesis', id: direction.id }
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
      {/* Header with Composite Score */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opportunity Score</span>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
              {tier}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">
            {overall_score} <span className="text-sm font-normal text-slate-500 font-sans">/ 100</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            type="button"
            onClick={handleExplainWithCopilot}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200 transition-standard shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Explain with Copilot</span>
          </button>
          {onOpenWhyModal && (
            <button
              onClick={onOpenWhyModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-standard"
            >
              <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
              <span>Why this score?</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Factor Breakdown Progress Bars */}
      <div className="space-y-3 text-xs">
        {/* Novelty */}
        <div>
          <div className="flex justify-between text-slate-700 mb-1">
            <span className="font-semibold">Novelty (30% weight)</span>
            <span className="font-bold text-slate-900 font-mono">{novelty_score}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${novelty_score}%` }} />
          </div>
        </div>

        {/* Evidence Gap */}
        <div>
          <div className="flex justify-between text-slate-700 mb-1">
            <span className="font-semibold">Evidence Gap Severity (30% weight)</span>
            <span className="font-bold text-slate-900 font-mono">{gap_score}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${gap_score}%` }} />
          </div>
        </div>

        {/* Feasibility */}
        <div>
          <div className="flex justify-between text-slate-700 mb-1">
            <span className="font-semibold">Experimental Feasibility (20% weight)</span>
            <span className="font-bold text-slate-900 font-mono">{feasibility_score}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${feasibility_score}%` }} />
          </div>
        </div>

        {/* Potential Impact */}
        <div>
          <div className="flex justify-between text-slate-700 mb-1">
            <span className="font-semibold">Potential Translational Impact (20% weight)</span>
            <span className="font-bold text-slate-900 font-mono">{impact_score}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${impact_score}%` }} />
          </div>
        </div>
      </div>

      {/* Formula Transparency Box */}
      <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-[11px] text-slate-600 font-mono">
        <span className="text-slate-400 block text-[10px] uppercase font-sans font-semibold mb-0.5">Calculated Formula:</span>
        ({novelty_score} × 0.30) + ({gap_score} × 0.30) + ({feasibility_score} × 0.20) + ({impact_score} × 0.20) = {overall_score}
      </div>
    </div>
  );
};
