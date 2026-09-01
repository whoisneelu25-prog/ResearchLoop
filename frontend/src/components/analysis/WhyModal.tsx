import React from 'react';
import { X, HelpCircle, BookOpen, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ResearchDirection } from '../../types';

interface WhyModalProps {
  direction: ResearchDirection | null;
  onClose: () => void;
}

export const WhyModal: React.FC<WhyModalProps> = ({ direction, onClose }) => {
  if (!direction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-10">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-blue-50 border border-blue-200 text-brand-600 rounded-md mt-0.5">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider">AI Explainability & Traceability</span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">Why was this research direction formulated?</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-standard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
          {/* Question */}
          <div className="p-3 bg-brand-50/50 border border-brand-200 rounded-lg">
            <span className="text-[10px] font-bold text-brand-700 uppercase block mb-1">Generated Research Direction:</span>
            <p className="font-semibold text-slate-900 text-sm leading-snug">{direction.research_question}</p>
          </div>

          {/* Rationale */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">Scientific Rationale</h4>
            <p className="leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">{direction.rationale}</p>
          </div>

          {/* Evidence Provenance */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-brand-600" />
              <span>Literature Grounding ({direction.supporting_studies?.length || 0} Supporting Studies)</span>
            </h4>
            <div className="space-y-1.5">
              {direction.supporting_studies?.map((s: any, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                  <div className="font-semibold text-slate-800">{s.label || s.title || `Study ${idx + 1}`}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-slate-600">
                      {s.result_type || s.year || 'Study'}
                    </span>
                    <span className="text-[10px] text-blue-700 font-bold">Confidence: {s.confidence || 'High'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gap Addressed */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">Evidence Gap Addressed</h4>
            <p className="leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">{direction.gap_addressed}</p>
          </div>

          {/* Scoring Derivation */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1.5">Opportunity Score Derivation</h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Novelty</span>
                <span className="font-bold text-slate-900 text-sm font-mono">{direction.novelty_score}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Gap</span>
                <span className="font-bold text-slate-900 text-sm font-mono">{direction.gap_score}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Feasibility</span>
                <span className="font-bold text-slate-900 text-sm font-mono">{direction.feasibility_score}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Impact</span>
                <span className="font-bold text-slate-900 text-sm font-mono">{direction.impact_score}</span>
              </div>
            </div>
            <div className="mt-2 text-center p-2 bg-brand-50 rounded border border-brand-200 font-bold text-brand-900">
              Composite Opportunity Score: {direction.overall_score} / 100 ({direction.tier})
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded text-xs transition-standard"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
