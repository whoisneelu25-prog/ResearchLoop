import React from 'react';
import { SearchCode, HelpCircle, CheckCircle, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import { ResearchGap } from '../../types';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { useCopilot } from '../../context/CopilotContext';

interface GapCardProps {
  gap: ResearchGap;
}

export const GapCard: React.FC<GapCardProps> = ({ gap }) => {
  const { openCopilot } = useCopilot();
  const coverage = Math.min(100, Math.max(0, gap.evidence_coverage || 25));

  const handleWhyThisGap = () => {
    openCopilot(
      `Why did ResearchLoop identify "${gap.title}" as a critical evidence gap and what trials are needed to address it?`,
      { type: 'gap', id: gap.id }
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 border border-blue-200 text-brand-600 rounded-md mt-0.5">
            <SearchCode className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider">Potential Research Gap</span>
              <ConfidenceBadge confidence={gap.confidence} />
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">{gap.title}</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{gap.description}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleWhyThisGap}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-brand-700 text-xs font-bold rounded-md border border-brand-200 transition-standard shadow-xs flex-shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Why this gap?</span>
        </button>
      </div>

      {/* Evidence Coverage Progress Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-700">Published Literature Coverage:</span>
          <span className="font-bold text-slate-900 font-mono">{coverage}% Coverage (Severe Evidence Deficit)</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-amber-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${coverage}%` }}
          />
        </div>
      </div>

      {/* 4-Box Structured Explanation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Known */}
        <div className="p-3.5 bg-emerald-50/40 border border-emerald-200/80 rounded-lg">
          <div className="flex items-center gap-1.5 font-bold text-emerald-800 uppercase tracking-wider text-[11px] mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>What is Known?</span>
          </div>
          <p className="text-slate-800 leading-relaxed">{gap.known_evidence}</p>
        </div>

        {/* Uncertain */}
        <div className="p-3.5 bg-amber-50/40 border border-amber-200/80 rounded-lg">
          <div className="flex items-center gap-1.5 font-bold text-amber-800 uppercase tracking-wider text-[11px] mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>What is Uncertain?</span>
          </div>
          <p className="text-slate-800 leading-relaxed">{gap.uncertain_evidence}</p>
        </div>

        {/* Missing */}
        <div className="p-3.5 bg-rose-50/40 border border-rose-200/80 rounded-lg">
          <div className="flex items-center gap-1.5 font-bold text-rose-800 uppercase tracking-wider text-[11px] mb-1">
            <HelpCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>What is Missing in Literature?</span>
          </div>
          <p className="text-slate-800 leading-relaxed">{gap.missing_evidence}</p>
        </div>

        {/* Why it Matters */}
        <div className="p-3.5 bg-blue-50/40 border border-blue-200/80 rounded-lg">
          <div className="flex items-center gap-1.5 font-bold text-brand-800 uppercase tracking-wider text-[11px] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Why it Matters for Research?</span>
          </div>
          <p className="text-slate-800 leading-relaxed">{gap.why_it_matters}</p>
        </div>
      </div>

      {/* Supporting Evidence List */}
      {gap.supporting_studies_summary && gap.supporting_studies_summary.length > 0 && (
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Supporting Studies ({gap.supporting_studies_count || gap.supporting_studies_summary.length}):</span>
          </span>
          {gap.supporting_studies_summary.map((study: any, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[11px] font-medium"
            >
              {study.label || study.title || `Study ${idx + 1}`} ({study.result || study.year || 'Analyzed'})
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
