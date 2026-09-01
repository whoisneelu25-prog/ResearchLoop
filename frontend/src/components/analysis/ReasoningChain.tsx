import React from 'react';
import { ArrowRight, BookOpen, AlertTriangle, HelpCircle, Lightbulb, Award } from 'lucide-react';
import { ResearchDirection } from '../../types';

interface ReasoningChainProps {
  direction: ResearchDirection;
}

export const ReasoningChain: React.FC<ReasoningChainProps> = ({ direction }) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
        <span>Evidence-to-Direction Reasoning Chain</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
        {/* Step 1: Observed Evidence */}
        <div className="bg-white border border-slate-200 rounded-md p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">
              <BookOpen className="w-3 h-3 text-brand-600" />
              <span>01. Observed Evidence</span>
            </div>
            <p className="text-slate-700 leading-snug line-clamp-4">
              {direction.observed_evidence_summary}
            </p>
          </div>
        </div>

        {/* Step 2: Contradiction / Gap */}
        <div className="bg-white border border-slate-200 rounded-md p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>02. Identified Gap</span>
            </div>
            <p className="text-slate-700 leading-snug line-clamp-4">
              {direction.gap_addressed}
            </p>
          </div>
        </div>

        {/* Step 3: Scientific Uncertainty */}
        <div className="bg-white border border-slate-200 rounded-md p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-1">
              <HelpCircle className="w-3 h-3 text-rose-600" />
              <span>03. Uncertainty</span>
            </div>
            <p className="text-slate-700 leading-snug line-clamp-4">
              {direction.uncertainty_unresolved}
            </p>
          </div>
        </div>

        {/* Step 4: Research Question */}
        <div className="bg-white border border-slate-200 rounded-md p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-brand-700 uppercase tracking-wider mb-1">
              <Lightbulb className="w-3 h-3 text-brand-600" />
              <span>04. Question</span>
            </div>
            <p className="font-semibold text-slate-900 leading-snug line-clamp-4">
              {direction.research_question}
            </p>
          </div>
        </div>

        {/* Step 5: Opportunity Score */}
        <div className="bg-brand-50/60 border border-brand-200 rounded-md p-3 flex flex-col justify-between text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-brand-800 uppercase tracking-wider mb-1">
              <Award className="w-3.5 h-3.5 text-brand-600" />
              <span>05. Opportunity</span>
            </div>
            <div className="text-2xl font-bold text-brand-700 mt-1 font-mono">
              {direction.overall_score} <span className="text-xs text-slate-500 font-sans">/ 100</span>
            </div>
            <span className="inline-block mt-1 px-2 py-0.5 bg-brand-100 text-brand-800 text-[10px] font-bold rounded">
              {direction.tier}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
