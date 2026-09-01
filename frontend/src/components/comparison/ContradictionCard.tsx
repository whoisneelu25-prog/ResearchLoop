import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Scale, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import { Contradiction, StudyEvidence } from '../../types';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { PaperDrawer } from '../evidence/PaperDrawer';
import { useCopilot } from '../../context/CopilotContext';

interface ContradictionCardProps {
  contradiction: Contradiction;
}

export const ContradictionCard: React.FC<ContradictionCardProps> = ({ contradiction }) => {
  const { openCopilot } = useCopilot();
  const [showDetails, setShowDetails] = useState(false);
  const [drawerEvidence, setDrawerEvidence] = useState<StudyEvidence | null>(null);

  const { evidence_a, evidence_b } = contradiction;

  const handleAskCopilotWhy = (e: React.MouseEvent) => {
    e.stopPropagation();
    openCopilot(
      `Explain why ${evidence_a.study_label} and ${evidence_b.study_label} have conflicting findings in ${contradiction.topic}.`,
      { type: 'contradiction', id: contradiction.id }
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 transition-standard">
      {/* Compact Main Row */}
      <div 
        onClick={() => setShowDetails(!showDetails)}
        className="p-4 sm:p-5 cursor-pointer bg-white hover:bg-slate-50/70 transition-standard"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="p-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
                  Divergence
                </span>
                <ConfidenceBadge confidence={contradiction.confidence} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {contradiction.topic}
              </h3>
              <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                {contradiction.summary}
              </p>
            </div>
          </div>

          {/* Action Chips */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
            <button
              type="button"
              onClick={handleAskCopilotWhy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-200 transition-standard shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Ask Copilot Why</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-standard"
            >
              <span>{showDetails ? 'Hide Breakdown' : 'View Comparison'}</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Quick Comparative Pills preview */}
        {!showDetails && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="font-semibold text-slate-700">{evidence_a.study_label}</span>
              <span className="text-slate-300">vs</span>
              <span className="font-semibold text-slate-700">{evidence_b.study_label}</span>
            </div>
            <div className="flex items-center gap-1.5 text-brand-600 font-semibold text-xs">
              <span>Click to compare studies & contributing factors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
      </div>

      {/* Expanded Drill-Down Details */}
      {showDetails && (
        <div className="p-5 border-t border-slate-100 bg-slate-50/60 space-y-4">
          {/* Side-by-Side Comparison Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
            {/* Study A Card */}
            <div
              onClick={() => setDrawerEvidence(evidence_a)}
              className="bg-white hover:border-brand-300 border border-slate-200 rounded-xl p-4 cursor-pointer transition-standard shadow-xs group"
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-bold text-slate-900 text-sm group-hover:text-brand-600 flex items-center gap-1.5">
                  <span>{evidence_a.study_label}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <EvidenceBadge type={evidence_a.result_type} category={evidence_a.result_category} size="sm" />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Biomarker:</span>
                  <span className="font-semibold text-slate-800">{evidence_a.biomarker || 'Standard'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Cohort:</span>
                  <span className="font-medium text-slate-700 truncate max-w-[200px]">{evidence_a.population || 'NSCLC'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Sample Size:</span>
                  <span className="font-mono text-slate-800">{evidence_a.sample_size_display || (evidence_a.sample_size ? `n=${evidence_a.sample_size}` : 'n=unspecified')}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Outcome:</span>
                  <span className="font-medium text-slate-900 text-right truncate max-w-[180px]">{evidence_a.result_summary}</span>
                </div>
              </div>
            </div>

            {/* VS Badge */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-[10px] items-center justify-center shadow-md border-2 border-white z-10 pointer-events-none font-mono">
              VS
            </div>

            {/* Study B Card */}
            <div
              onClick={() => setDrawerEvidence(evidence_b)}
              className="bg-white hover:border-brand-300 border border-slate-200 rounded-xl p-4 cursor-pointer transition-standard shadow-xs group"
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-bold text-slate-900 text-sm group-hover:text-brand-600 flex items-center gap-1.5">
                  <span>{evidence_b.study_label}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <EvidenceBadge type={evidence_b.result_type} category={evidence_b.result_category} size="sm" />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Biomarker:</span>
                  <span className="font-semibold text-slate-800">{evidence_b.biomarker || 'Standard'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Cohort:</span>
                  <span className="font-medium text-slate-700 truncate max-w-[200px]">{evidence_b.population || 'NSCLC'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Sample Size:</span>
                  <span className="font-mono text-slate-800">{evidence_b.sample_size_display || (evidence_b.sample_size ? `n=${evidence_b.sample_size}` : 'n=unspecified')}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Outcome:</span>
                  <span className="font-medium text-slate-900 text-right truncate max-w-[180px]">{evidence_b.result_summary}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Potential Contributing Factors Comparative Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-brand-600" />
              <span>Contributing Divergence Factors</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Population</span>
                <span className="font-semibold text-slate-800 mt-0.5 block truncate">{contradiction.population_diff || 'Different'}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Biomarker</span>
                <span className="font-semibold text-slate-800 mt-0.5 block truncate">{contradiction.biomarker_diff || 'Different'}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Dose / Protocol</span>
                <span className="font-semibold text-slate-800 mt-0.5 block truncate">{contradiction.dosage_diff || 'Similar'}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Endpoint</span>
                <span className="font-semibold text-slate-800 mt-0.5 block truncate">{contradiction.endpoint_diff || 'Similar'}</span>
              </div>
            </div>

            {/* Scientific Explanation */}
            <div className="text-xs text-slate-700 bg-blue-50/40 p-3 rounded-lg border border-blue-100/80 leading-relaxed">
              <span className="font-bold text-slate-900 block mb-0.5">Biological & Clinical Interpretation:</span>
              {contradiction.possible_explanation}
            </div>
          </div>
        </div>
      )}

      {/* Paper Drawer */}
      <PaperDrawer evidence={drawerEvidence} onClose={() => setDrawerEvidence(null)} />
    </div>
  );
};
