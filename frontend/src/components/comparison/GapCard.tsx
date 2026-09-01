import React, { useState } from 'react';
import { SearchCode, HelpCircle, CheckCircle, AlertCircle, Sparkles, BookOpen, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { ResearchGap } from '../../types';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { useCopilot } from '../../context/CopilotContext';

interface GapCardProps {
  gap: ResearchGap;
}

export const GapCard: React.FC<GapCardProps> = ({ gap }) => {
  const { openCopilot } = useCopilot();
  const [showDetails, setShowDetails] = useState(false);
  const coverage = Math.min(100, Math.max(0, gap.evidence_coverage || 25));

  const handleWhyThisGap = (e: React.MouseEvent) => {
    e.stopPropagation();
    openCopilot(
      `Why did ResearchLoop identify "${gap.title}" as a critical evidence gap and what trials are needed to address it?`,
      { type: 'gap', id: gap.id }
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 transition-standard">
      {/* Compact Header Summary */}
      <div
        onClick={() => setShowDetails(!showDetails)}
        className="p-4 sm:p-5 cursor-pointer bg-white hover:bg-slate-50/70 transition-standard"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="p-2 bg-blue-50 border border-blue-200 text-brand-600 rounded-lg shrink-0 mt-0.5">
              <SearchCode className="w-4 h-4" />
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider bg-brand-50 px-2 py-0.5 rounded border border-brand-200 font-mono">
                  Evidence Gap
                </span>
                <ConfidenceBadge confidence={gap.confidence} />
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {coverage}% Literature Coverage
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {gap.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                {gap.description}
              </p>
            </div>
          </div>

          {/* Action Chips */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
            <button
              type="button"
              onClick={handleWhyThisGap}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-brand-700 text-xs font-bold rounded-lg border border-brand-200 transition-standard shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Why this gap?</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-standard"
            >
              <span>{showDetails ? 'Hide Analysis' : 'View Breakdown'}</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Quick Progress Bar Preview */}
        {!showDetails && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 gap-4 flex-wrap">
            <div className="flex-1 min-w-[180px] max-w-sm flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-mono">Deficit:</span>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-1.5 rounded-full"
                  style={{ width: `${coverage}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-brand-600 font-semibold text-xs">
              <span>Click to view known vs uncertain vs missing evidence</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
      </div>

      {/* Expanded Drill-Down Content */}
      {showDetails && (
        <div className="p-5 border-t border-slate-100 bg-slate-50/60 space-y-4">
          {/* Progress Bar Detail */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Published Literature Coverage Depth:</span>
              <span className="font-bold text-amber-700 font-mono">{coverage}% Coverage (Significant Evidence Deficit)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${coverage}%` }}
              />
            </div>
          </div>

          {/* 4-Box Structured Explanation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Known */}
            <div className="p-3.5 bg-white border border-emerald-200 rounded-xl shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 uppercase tracking-wider text-[11px] mb-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>What is Known?</span>
              </div>
              <p className="text-slate-700 leading-relaxed">{gap.known_evidence}</p>
            </div>

            {/* Uncertain */}
            <div className="p-3.5 bg-white border border-amber-200 rounded-xl shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 uppercase tracking-wider text-[11px] mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>What is Uncertain?</span>
              </div>
              <p className="text-slate-700 leading-relaxed">{gap.uncertain_evidence}</p>
            </div>

            {/* Missing */}
            <div className="p-3.5 bg-white border border-rose-200 rounded-xl shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-rose-800 uppercase tracking-wider text-[11px] mb-1">
                <HelpCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>What is Missing in Literature?</span>
              </div>
              <p className="text-slate-700 leading-relaxed">{gap.missing_evidence}</p>
            </div>

            {/* Why it Matters */}
            <div className="p-3.5 bg-white border border-blue-200 rounded-xl shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-brand-800 uppercase tracking-wider text-[11px] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Strategic Research Opportunity</span>
              </div>
              <p className="text-slate-700 leading-relaxed">{gap.why_it_matters}</p>
            </div>
          </div>

          {/* Supporting Evidence List */}
          {gap.supporting_studies_summary && gap.supporting_studies_summary.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Supporting Studies ({gap.supporting_studies_count || gap.supporting_studies_summary.length}):</span>
              </span>
              {gap.supporting_studies_summary.map((study: any, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg text-[11px] font-medium shadow-xs"
                >
                  {study.label || study.title || `Study ${idx + 1}`} ({study.result || study.year || 'Analyzed'})
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
