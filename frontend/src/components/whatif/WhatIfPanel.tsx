import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Activity, AlertTriangle, SearchCode, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { WhatIfResponse, StudyEvidence } from '../../types';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { PaperDrawer } from '../evidence/PaperDrawer';

interface WhatIfPanelProps {
  projectId: string;
}

export const WhatIfPanel: React.FC<WhatIfPanelProps> = ({ projectId }) => {
  const [biomarker, setBiomarker] = useState('All');
  const [population, setPopulation] = useState('All');
  const [intervention, setIntervention] = useState('All');
  const [studyType, setStudyType] = useState('All');
  const [outcome, setOutcome] = useState('All');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WhatIfResponse | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<StudyEvidence | null>(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await api.simulateWhatIf(projectId, {
        biomarker,
        population,
        intervention,
        study_type: studyType,
        outcome,
      });
      setResult(res);
    } catch (err) {
      console.error('What-if simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [projectId, biomarker, population, intervention, studyType, outcome]);

  return (
    <div className="space-y-6">
      {/* Simulation Controls Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-brand-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">What-If Condition Simulator</h3>
              <p className="text-xs text-slate-500">
                Dynamically adjust research parameters to evaluate published evidence coverage, contradiction counts, and remaining gaps.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setBiomarker('All');
              setPopulation('All');
              setIntervention('All');
              setStudyType('All');
              setOutcome('All');
            }}
            className="text-xs text-slate-500 hover:text-brand-600 font-medium"
          >
            Reset Conditions
          </button>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Biomarker */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Biomarker</label>
            <select
              value={biomarker}
              onChange={(e) => setBiomarker(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="All">All Biomarkers</option>
              <option value="Biomarker X+">Biomarker X+ (Sensitizing)</option>
              <option value="Biomarker X-">Biomarker X- (Wild-Type)</option>
              <option value="Biomarker Y">Biomarker Y (KRAS G12C)</option>
              <option value="PD-L1">PD-L1 Stratified</option>
            </select>
          </div>

          {/* Population */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Population Cohort</label>
            <select
              value={population}
              onChange={(e) => setPopulation(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="All">All Populations</option>
              <option value="Treatment-naïve">Treatment-Naïve (First-line)</option>
              <option value="Resistant">Pretreated / Resistant</option>
              <option value="Brain Metastases">Brain Metastases (CNS)</option>
            </select>
          </div>

          {/* Intervention */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Intervention</label>
            <select
              value={intervention}
              onChange={(e) => setIntervention(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="All">All Interventions</option>
              <option value="Drug A">Drug A (Targeted TKI)</option>
              <option value="Drug B">Drug B (Anti-PD-1)</option>
              <option value="Biomarker Y Inhibitor">Biomarker Y Inhibitor</option>
              <option value="Chemotherapy">Chemotherapy / Comparator</option>
            </select>
          </div>

          {/* Study Type */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Study Design</label>
            <select
              value={studyType}
              onChange={(e) => setStudyType(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="All">All Study Types</option>
              <option value="Phase III">Phase III RCTs</option>
              <option value="Phase II">Phase II Trials</option>
              <option value="Cohort">Observational / Cohorts</option>
            </select>
          </div>

          {/* Endpoint */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Primary Endpoint</label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="All">All Endpoints</option>
              <option value="Progression-Free Survival">Progression-Free Survival (PFS)</option>
              <option value="Overall Survival">Overall Survival (OS)</option>
              <option value="Response Rate">Objective Response (ORR)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Simulation Results Display */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Coverage Status Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Evidence Coverage</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                result.coverage_status.includes('Strong') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                result.coverage_status.includes('Moderate') ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {result.coverage_status}
              </span>
            </div>

            <div>
              <div className="text-2xl font-bold text-slate-900 font-mono">
                {result.coverage_percentage}% <span className="text-xs font-sans text-slate-500">Coverage Depth</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    result.coverage_percentage >= 70 ? 'bg-emerald-500' :
                    result.coverage_percentage >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${result.coverage_percentage}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Matching Studies</span>
                <span className="font-bold text-slate-900 text-sm font-mono">{result.total_matching_studies}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">High Confidence</span>
                <span className="font-bold text-slate-900 text-sm font-mono">{result.high_confidence_studies}</span>
              </div>
            </div>
          </div>

          {/* Gap & Contradiction Signals */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Clinical Signals</span>
            
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                <span className="text-slate-700 font-medium">Contradictions in subset:</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
                  {result.contradiction_count}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                <span className="text-slate-700 font-medium">Potential evidence gap:</span>
                <span className={`font-bold px-2 py-0.5 rounded border font-mono ${
                  result.potential_gap_detected ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                }`}>
                  {result.potential_gap_detected ? 'Yes (Detected)' : 'No (Well Covered)'}
                </span>
              </div>
            </div>

            {result.gap_description && (
              <p className="text-[11px] text-slate-600 italic bg-amber-50/50 p-2 rounded border border-amber-100 leading-snug">
                {result.gap_description}
              </p>
            )}
          </div>

          {/* Suggested Research Direction */}
          <div className="bg-brand-50/40 border border-brand-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-brand-700 uppercase tracking-wider block mb-1">
                Derived What-If Direction
              </span>
              <p className="text-xs font-semibold text-slate-900 leading-relaxed mt-2">
                "{result.recommended_direction}"
              </p>
            </div>
            <div className="text-[11px] text-slate-500 pt-3 border-t border-brand-100">
              Evaluated against current research database.
            </div>
          </div>
        </div>
      )}

      {/* Matching Evidence Sub-Table */}
      {result && result.matching_evidence && result.matching_evidence.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
            Matching Studies in Selection ({result.matching_evidence.length})
          </div>
          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {result.matching_evidence.map((ev) => (
              <div
                key={ev.id}
                onClick={() => setSelectedEvidence(ev)}
                className="p-3 hover:bg-blue-50/30 cursor-pointer transition-standard flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900">{ev.study_label} ({ev.year || 2024})</div>
                  <div className="text-slate-600 truncate max-w-md mt-0.5">{ev.result_summary}</div>
                </div>
                <EvidenceBadge type={ev.result_type} category={ev.result_category} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      <PaperDrawer evidence={selectedEvidence} onClose={() => setSelectedEvidence(null)} />
    </div>
  );
};
