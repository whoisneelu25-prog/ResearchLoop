import React from 'react';
import { X, ExternalLink, BookOpen, Quote, ShieldCheck, Activity, Calendar, Users, Dna, FileText, Sparkles } from 'lucide-react';
import { StudyEvidence } from '../../types';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { useCopilot } from '../../context/CopilotContext';

interface PaperDrawerProps {
  evidence: StudyEvidence | null;
  onClose: () => void;
}

export const PaperDrawer: React.FC<PaperDrawerProps> = ({ evidence, onClose }) => {
  const { openCopilot } = useCopilot();

  if (!evidence) return null;

  const paper = evidence.paper;

  const handleAskCopilot = () => {
    openCopilot(
      `Analyze the clinical findings, biomarkers, and endpoints in ${evidence.study_label} (${evidence.year || 2024}).`,
      { type: 'paper', id: evidence.paper_id }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col z-10 overflow-hidden">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{evidence.study_type || 'Clinical Study'}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-mono">{evidence.paper?.external_id || 'ID: Extracted'}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {paper?.title || evidence.study_label}
            </h3>
            <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-medium text-slate-700">{paper?.authors || evidence.study_label}</span>
              <span>•</span>
              <span className="italic text-slate-600">{paper?.journal || 'Biomedical Journal'}</span>
              <span>•</span>
              <span className="font-semibold text-slate-700">{evidence.year || paper?.publication_year || '2024'}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-standard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Findings Summary Banner */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EvidenceBadge type={evidence.result_type} category={evidence.result_category} />
                <ConfidenceBadge confidence={evidence.confidence} />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAskCopilot}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded border border-brand-200 transition-standard"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  <span>Ask Copilot</span>
                </button>
                {paper?.url && (
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium hover:underline ml-1"
                  >
                    <span>Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Extracted Result Summary</h4>
              <p className="text-sm font-medium text-slate-900 leading-relaxed">
                {evidence.result_summary}
              </p>
              {evidence.effect_description && (
                <p className="text-xs text-slate-600 mt-1.5 font-mono bg-slate-50 p-2 rounded border border-slate-200">
                  {evidence.effect_description}
                </p>
              )}
            </div>
          </div>

          {/* Evidence Provenance (Verbatim Quote from Literature) */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Quote className="w-4 h-4 text-brand-600" />
              <span>Evidence Provenance (Direct Excerpt from Literature)</span>
            </div>
            <blockquote className="text-xs sm:text-sm text-slate-800 italic leading-relaxed border-l-2 border-brand-500 pl-3">
              "{evidence.evidence_text}"
            </blockquote>
            {evidence.confidence_rationale && (
              <div className="mt-3 text-[11px] text-slate-600 flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600 flex-shrink-0 mt-0.5" />
                <span><strong>Traceability Note:</strong> {evidence.confidence_rationale}</span>
              </div>
            )}
          </div>

          {/* Study Parameters Matrix */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Study Parameters</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Intervention</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{evidence.intervention || 'Not specified'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Comparator</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{evidence.comparator || 'Standard of Care'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Population / Cohort</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{evidence.population || 'Advanced Disease'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Biomarker Stratification</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{evidence.biomarker || 'Unstratified'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Sample Size</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{evidence.sample_size_display || (evidence.sample_size ? `n=${evidence.sample_size}` : 'Unspecified')}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Primary Endpoint</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{evidence.primary_outcome || 'Progression-Free Survival'}</span>
              </div>
            </div>
          </div>

          {/* Full Abstract */}
          {paper?.abstract && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>Original Abstract</span>
              </h4>
              <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded border border-slate-200 max-h-56 overflow-y-auto">
                {paper.abstract}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <button
            type="button"
            onClick={handleAskCopilot}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded transition-standard shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span>Ask Copilot About This Paper</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded transition-standard"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
