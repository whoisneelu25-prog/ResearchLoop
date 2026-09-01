import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown, ChevronRight, ExternalLink } from 'lucide-react';
import { StudyEvidence } from '../../types';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { PaperDrawer } from './PaperDrawer';

interface EvidenceTableProps {
  evidenceList: StudyEvidence[];
  isLoading?: boolean;
}

export const EvidenceTable: React.FC<EvidenceTableProps> = ({ evidenceList, isLoading = false }) => {
  const [selectedEvidence, setSelectedEvidence] = useState<StudyEvidence | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [resultFilter, setResultFilter] = useState('All');
  const [biomarkerFilter, setBiomarkerFilter] = useState('All');
  const [confidenceFilter, setConfidenceFilter] = useState('All');

  // Filter evidence
  const filteredList = evidenceList.filter((ev) => {
    const matchesSearch =
      !searchQuery ||
      ev.study_label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.intervention && ev.intervention.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ev.result_summary && ev.result_summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ev.population && ev.population.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesResult =
      resultFilter === 'All' || ev.result_type.toLowerCase() === resultFilter.toLowerCase();

    const matchesBiomarker =
      biomarkerFilter === 'All' ||
      (ev.biomarker && ev.biomarker.toLowerCase().includes(biomarkerFilter.toLowerCase()));

    const matchesConfidence =
      confidenceFilter === 'All' || ev.confidence.toLowerCase() === confidenceFilter.toLowerCase();

    return matchesSearch && matchesResult && matchesBiomarker && matchesConfidence;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter studies, drugs, outcomes..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="All">All Results ({evidenceList.length})</option>
            <option value="positive">Positive Evidence</option>
            <option value="null">Null Results</option>
            <option value="negative">Negative / Adverse</option>
            <option value="mixed">Mixed Findings</option>
          </select>

          <select
            value={biomarkerFilter}
            onChange={(e) => setBiomarkerFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="All">All Biomarkers</option>
            <option value="Biomarker X+">Biomarker X+</option>
            <option value="Biomarker X-">Biomarker X-</option>
            <option value="Biomarker Y">Biomarker Y (KRAS)</option>
            <option value="PD-L1">PD-L1 Stratified</option>
          </select>

          <select
            value={confidenceFilter}
            onChange={(e) => setConfidenceFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="All">All Confidence</option>
            <option value="High">High Confidence</option>
            <option value="Medium">Medium Confidence</option>
            <option value="Low">Low Confidence</option>
          </select>
        </div>
      </div>

      {/* Dense Scientific Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 min-w-[140px]">Study & Author</th>
              <th className="py-3 px-3">Year</th>
              <th className="py-3 px-3 min-w-[120px]">Intervention</th>
              <th className="py-3 px-3 min-w-[130px]">Population</th>
              <th className="py-3 px-3 min-w-[110px]">Biomarker</th>
              <th className="py-3 px-3">Cohort</th>
              <th className="py-3 px-4 min-w-[200px]">Clinical Outcome</th>
              <th className="py-3 px-3 min-w-[110px]">Evidence</th>
              <th className="py-3 px-3">Confidence</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-500">
                  <div className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                    <span>Loading structured research evidence...</span>
                  </div>
                </td>
              </tr>
            ) : filteredList.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-500">
                  No matching clinical studies found for current filters.
                </td>
              </tr>
            ) : (
              filteredList.map((ev) => (
                <tr
                  key={ev.id}
                  onClick={() => setSelectedEvidence(ev)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-standard group"
                >
                  <td className="py-3 px-4 font-semibold text-slate-900 group-hover:text-brand-600">
                    <div className="flex items-center gap-1.5">
                      <span>{ev.study_label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block">{ev.study_type || 'RCT'}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono">{ev.year || '2024'}</td>
                  <td className="py-3 px-3 font-medium text-slate-800">{ev.intervention || 'Drug A'}</td>
                  <td className="py-3 px-3 text-slate-600 truncate max-w-[140px]" title={ev.population || ''}>
                    {ev.population || 'Advanced NSCLC'}
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-mono text-[11px]">{ev.biomarker || 'Standard'}</td>
                  <td className="py-3 px-3 text-slate-600 font-mono">{ev.sample_size_display || (ev.sample_size ? `n=${ev.sample_size}` : '—')}</td>
                  <td className="py-3 px-4 text-slate-700 leading-snug">
                    <span className="line-clamp-2">{ev.result_summary}</span>
                  </td>
                  <td className="py-3 px-3">
                    <EvidenceBadge type={ev.result_type} category={ev.result_category} size="sm" />
                  </td>
                  <td className="py-3 px-3">
                    <ConfidenceBadge confidence={ev.confidence} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvidence(ev);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-2 py-1 rounded transition-standard"
                    >
                      <span>Inspect</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
        <span>Showing {filteredList.length} of {evidenceList.length} analyzed studies</span>
        <span className="text-[11px] italic">Click any study row to view verbatim evidence excerpts and parameter provenance.</span>
      </div>

      {/* Paper Inspector Drawer */}
      <PaperDrawer evidence={selectedEvidence} onClose={() => setSelectedEvidence(null)} />
    </div>
  );
};
