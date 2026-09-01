import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Scale, CheckCircle2, XCircle, Info, Sparkles } from 'lucide-react';
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
  const [expanded, setExpanded] = useState(true);
  const [drawerEvidence, setDrawerEvidence] = useState<StudyEvidence | null>(null);

  const { evidence_a, evidence_b } = contradiction;

  const handleAskCopilotWhy = () => {
    openCopilot(
      `Explain why ${evidence_a.study_label} and ${evidence_b.study_label} have conflicting findings in ${contradiction.topic}.`,
      { type: 'contradiction', id: contradiction.id }
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-md mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Literature Contradiction Detected</span>
              <ConfidenceBadge confidence={contradiction.confidence} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">{contradiction.topic}</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{contradiction.summary}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAskCopilotWhy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-md border border-amber-300 transition-standard shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Ask Copilot Why</span>
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 transition-standard"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-5 space-y-5">
          {/* Side-by-Side Comparison Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
            {/* Study A Card */}
            <div
              onClick={() => setDrawerEvidence(evidence_a)}
              className="bg-slate-50 hover:bg-blue-50/30 border border-slate-200 rounded-lg p-4 cursor-pointer transition-standard"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 text-sm">{evidence_a.study_label}</span>
                <EvidenceBadge type={evidence_a.result_type} category={evidence_a.result_category} size="sm" />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Biomarker:</span>
                  <span className="font-semibold text-slate-800">{evidence_a.biomarker || 'Standard'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Population:</span>
                  <span className="font-medium text-slate-700 truncate max-w-[200px]">{evidence_a.population || 'NSCLC'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Sample Size:</span>
                  <span className="font-mono text-slate-800">{evidence_a.sample_size_display || (evidence_a.sample_size ? `n=${evidence_a.sample_size}` : 'n=unspecified')}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Primary Finding:</span>
                  <span className="font-medium text-slate-900 text-right truncate max-w-[180px]">{evidence_a.result_summary}</span>
                </div>
              </div>
            </div>

            {/* VS Badge */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-[11px] items-center justify-center shadow-md border-2 border-white z-10 pointer-events-none">
              VS
            </div>

            {/* Study B Card */}
            <div
              onClick={() => setDrawerEvidence(evidence_b)}
              className="bg-slate-50 hover:bg-blue-50/30 border border-slate-200 rounded-lg p-4 cursor-pointer transition-standard"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 text-sm">{evidence_b.study_label}</span>
                <EvidenceBadge type={evidence_b.result_type} category={evidence_b.result_category} size="sm" />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Biomarker:</span>
                  <span className="font-semibold text-slate-800">{evidence_b.biomarker || 'Standard'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Population:</span>
                  <span className="font-medium text-slate-700 truncate max-w-[200px]">{evidence_b.population || 'NSCLC'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Sample Size:</span>
                  <span className="font-mono text-slate-800">{evidence_b.sample_size_display || (evidence_b.sample_size ? `n=${evidence_b.sample_size}` : 'n=unspecified')}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Primary Finding:</span>
                  <span className="font-medium text-slate-900 text-right truncate max-w-[180px]">{evidence_b.result_summary}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Potential Contributing Factors Table */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-brand-600" />
              <span>Potential Contributing Factors (Comparative Breakdown)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Population</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{contradiction.population_diff || 'Different'}</span>
              </div>
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Biomarker</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{contradiction.biomarker_diff || 'Different'}</span>
              </div>
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Dose / Protocol</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{contradiction.dosage_diff || 'Similar'}</span>
              </div>
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Endpoint / Design</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{contradiction.endpoint_diff || 'Similar'}</span>
              </div>
            </div>

            {/* Scientific Explanation */}
            <div className="mt-3 text-xs text-slate-700 bg-white p-3 rounded border border-slate-200 leading-relaxed">
              <span className="font-bold text-slate-900 block mb-1">Biological & Methodological Interpretation:</span>
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
