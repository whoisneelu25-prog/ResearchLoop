import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  Flame,
  SearchCode,
  Lightbulb,
  SlidersHorizontal,
  Network,
  LayoutDashboard,
  Bookmark,
  Share2,
  Download,
  Check,
  Award,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import {
  ResearchProjectDetail,
  StudyEvidence,
  Contradiction,
  ResearchGap,
  ResearchDirection,
  KnowledgeGraph,
} from '../types';
import { EvidenceTable } from '../components/evidence/EvidenceTable';
import { PaperDrawer } from '../components/evidence/PaperDrawer';
import { ContradictionCard } from '../components/comparison/ContradictionCard';
import { NegativeFindingCard } from '../components/comparison/NegativeFindingCard';
import { GapCard } from '../components/comparison/GapCard';
import { ReasoningChain } from '../components/analysis/ReasoningChain';
import { OpportunityScoreCard } from '../components/analysis/OpportunityScoreCard';
import { WhyModal } from '../components/analysis/WhyModal';
import { WhatIfPanel } from '../components/whatif/WhatIfPanel';
import { KnowledgeGraphFlow } from '../components/graph/KnowledgeGraphFlow';

export const AnalysisDetailPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'failures' | 'contradictions' | 'gaps' | 'hypotheses' | 'whatif' | 'graph'>('overview');

  // Match URL path if direct tab requested
  useEffect(() => {
    if (location.pathname.endsWith('/evidence')) setActiveTab('evidence');
    else if (location.pathname.endsWith('/failures')) setActiveTab('failures');
    else if (location.pathname.endsWith('/contradictions')) setActiveTab('contradictions');
    else if (location.pathname.endsWith('/gaps')) setActiveTab('gaps');
    else if (location.pathname.endsWith('/hypotheses')) setActiveTab('hypotheses');
    else if (location.pathname.endsWith('/what-if')) setActiveTab('whatif');
    else if (location.pathname.endsWith('/graph')) setActiveTab('graph');
    else setActiveTab('overview');
  }, [location.pathname]);

  const [project, setProject] = useState<ResearchProjectDetail | null>(null);
  const [evidenceList, setEvidenceList] = useState<StudyEvidence[]>([]);
  const [failuresList, setFailuresList] = useState<StudyEvidence[]>([]);
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [gaps, setGaps] = useState<ResearchGap[]>([]);
  const [hypotheses, setHypotheses] = useState<ResearchDirection[]>([]);
  const [graphData, setGraphData] = useState<KnowledgeGraph | null>(null);

  const [loading, setLoading] = useState(true);
  const [selectedFailureDrawer, setSelectedFailureDrawer] = useState<StudyEvidence | null>(null);
  const [whyModalDirection, setWhyModalDirection] = useState<ResearchDirection | null>(null);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const loadAnalysisData = async () => {
      setLoading(true);
      try {
        const [proj, evs, fails, contras, gps, hyps, grph] = await Promise.all([
          api.getProjectDetail(projectId),
          api.getEvidence(projectId),
          api.getFailures(projectId),
          api.getContradictions(projectId),
          api.getGaps(projectId),
          api.getHypotheses(projectId),
          api.getKnowledgeGraph(projectId),
        ]);

        setProject(proj);
        setEvidenceList(evs);
        setFailuresList(fails);
        setContradictions(contras);
        setGaps(gps);
        setHypotheses(hyps);
        setGraphData(grph);
      } catch (err) {
        console.error('Error fetching analysis details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalysisData();
  }, [projectId]);

  const handleToggleSave = async (dirId: string) => {
    if (!projectId) return;
    try {
      const updated = await api.toggleSaveDirection(projectId, dirId);
      setHypotheses((prev) =>
        prev.map((h) => (h.id === dirId ? { ...h, is_saved: updated.is_saved } : h))
      );
      setSavedSuccessMsg(updated.is_saved ? 'Direction saved to your workspace' : 'Direction removed from saved list');
      setTimeout(() => setSavedSuccessMsg(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (!projectId) return;
    if (tab === 'overview') navigate(`/research/${projectId}`);
    else if (tab === 'whatif') navigate(`/research/${projectId}/what-if`);
    else navigate(`/research/${projectId}/${tab}`);
  };

  if (loading || !project) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="inline-flex items-center gap-2">
          <span className="w-5 h-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <span className="text-sm font-medium">Loading research intelligence analysis...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">Research Intelligence</span>
              {project.is_demo && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  Verified Literature Corpus
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">{project.title}</h1>
            <div className="text-xs text-slate-500 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span><strong>Studies Analyzed:</strong> {project.paper_count}</span>
              <span>•</span>
              <span><strong>Disease:</strong> {project.disease || 'NSCLC'}</span>
              <span>•</span>
              <span><strong>Target Intervention:</strong> {project.intervention || 'Targeted TKI / Anti-PD-1'}</span>
              <span>•</span>
              <span><strong>Biomarkers:</strong> {project.biomarker || 'Biomarker X / Y / PD-L1'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {savedSuccessMsg && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                {savedSuccessMsg}
              </span>
            )}
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition-standard"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Summary</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-slate-100 pt-3 flex flex-wrap gap-1">
          <button
            onClick={() => handleTabChange('overview')}
            className={`px-3 py-2 rounded-md text-xs font-semibold transition-standard flex items-center gap-1.5 ${
              activeTab === 'overview' ? 'bg-brand-500 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => handleTabChange('evidence')}
            className={`px-3 py-2 rounded-md text-xs font-semibold transition-standard flex items-center gap-1.5 ${
              activeTab === 'evidence' ? 'bg-brand-500 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Evidence Table ({evidenceList.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('contradictions')}
            className={`px-3 py-2 rounded-md text-xs font-semibold transition-standard flex items-center gap-1.5 ${
              activeTab === 'contradictions' ? 'bg-brand-500 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Contradictions ({contradictions.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('failures')}
            className={`px-3 py-2 rounded-md text-xs font-semibold transition-standard flex items-center gap-1.5 ${
              activeTab === 'failures' ? 'bg-brand-500 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-red-500" />
            <span>Negative Findings ({failuresList.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('gaps')}
            className={`px-3 py-2 rounded-md text-xs font-semibold transition-standard flex items-center gap-1.5 ${
              activeTab === 'gaps' ? 'bg-brand-500 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <SearchCode className="w-3.5 h-3.5 text-blue-500" />
            <span>Research Gaps ({gaps.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('hypotheses')}
            className={`px-3 py-2 rounded-md text-xs font-semibold transition-standard flex items-center gap-1.5 ${
              activeTab === 'hypotheses' ? 'bg-brand-500 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Research Directions ({hypotheses.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('whatif')}
            className={`px-3 py-2 rounded-md text-xs font-semibold transition-standard flex items-center gap-1.5 ${
              activeTab === 'whatif' ? 'bg-brand-500 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>What-If Analysis</span>
          </button>

          <button
            onClick={() => handleTabChange('graph')}
            className={`px-3 py-2 rounded-md text-xs font-semibold transition-standard flex items-center gap-1.5 ${
              activeTab === 'graph' ? 'bg-brand-500 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Knowledge Graph</span>
          </button>
        </div>
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* AI Evidence Synthesis Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-brand-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Evidence Intelligence Summary</span>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {project.summary}
            </p>
          </div>

          {/* Signal Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              onClick={() => handleTabChange('contradictions')}
              className="bg-white p-4 rounded-lg border border-amber-200 bg-amber-50/10 cursor-pointer hover:border-amber-300 transition-standard"
            >
              <div className="text-[11px] font-bold text-amber-700 uppercase">Contradictions</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{contradictions.length} Divergences</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Discordant biomarker outcomes</span>
            </div>

            <div
              onClick={() => handleTabChange('failures')}
              className="bg-white p-4 rounded-lg border border-red-200 bg-red-50/10 cursor-pointer hover:border-red-300 transition-standard"
            >
              <div className="text-[11px] font-bold text-red-700 uppercase">Negative Findings</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{failuresList.length} Null Trials</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Unreplicated or null outcomes</span>
            </div>

            <div
              onClick={() => handleTabChange('gaps')}
              className="bg-white p-4 rounded-lg border border-blue-200 bg-blue-50/10 cursor-pointer hover:border-blue-300 transition-standard"
            >
              <div className="text-[11px] font-bold text-brand-700 uppercase">Evidence Gaps</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{gaps.length} Vacuums</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Missing cohort coverage</span>
            </div>

            <div
              onClick={() => handleTabChange('hypotheses')}
              className="bg-white p-4 rounded-lg border border-purple-200 bg-purple-50/10 cursor-pointer hover:border-purple-300 transition-standard"
            >
              <div className="text-[11px] font-bold text-purple-700 uppercase">Research Directions</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{hypotheses.length} Directions</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Opportunity ranked</span>
            </div>
          </div>

          {/* Key Directions Preview */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Top Potential Research Directions
              </span>
              <button
                onClick={() => handleTabChange('hypotheses')}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                View Full Reasoning Chains →
              </button>
            </div>

            <div className="space-y-4">
              {hypotheses.slice(0, 2).map((h) => (
                <div key={h.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block">
                        {h.tier}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug mt-0.5">{h.research_question}</h4>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-brand-700 font-mono">
                        {h.overall_score} <span className="text-[10px] text-slate-400 font-sans">/ 100</span>
                      </div>
                    </div>
                  </div>
                  <ReasoningChain direction={h} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: EVIDENCE TABLE */}
      {activeTab === 'evidence' && (
        <div className="space-y-4">
          <EvidenceTable evidenceList={evidenceList} />
        </div>
      )}

      {/* Tab 3: CONTRADICTIONS */}
      {activeTab === 'contradictions' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed">
            <strong>Contradiction Intelligence:</strong> Identifies divergent study outcomes across comparable trials and analyzes potential contributing factors (biomarker status, patient population lines, dosing protocols, or endpoints).
          </div>
          <div className="space-y-4">
            {contradictions.map((c) => (
              <ContradictionCard key={c.id} contradiction={c} />
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: NEGATIVE FINDINGS & FAILURES */}
      {activeTab === 'failures' && (
        <div className="space-y-4">
          <div className="p-4 bg-red-50/50 border border-red-200 rounded-lg text-xs text-red-900 leading-relaxed">
            <strong>Negative & Null Result Detection:</strong> Documents studies where the tested intervention failed to improve primary outcomes, failed replication hypotheses, or was halted early for safety.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {failuresList.map((f) => (
              <NegativeFindingCard
                key={f.id}
                finding={f}
                onInspect={() => setSelectedFailureDrawer(f)}
              />
            ))}
          </div>
          <PaperDrawer evidence={selectedFailureDrawer} onClose={() => setSelectedFailureDrawer(null)} />
        </div>
      )}

      {/* Tab 5: RESEARCH GAPS */}
      {activeTab === 'gaps' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-lg text-xs text-blue-900 leading-relaxed">
            <strong>Evidence Gap Discovery:</strong> Detects severe evidence vacuums in published literature where patient cohorts are under-studied, comparisons are missing, or outcomes are unresolved.
          </div>
          <div className="space-y-4">
            {gaps.map((g) => (
              <GapCard key={g.id} gap={g} />
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: POTENTIAL RESEARCH DIRECTIONS (Signature View) */}
      {activeTab === 'hypotheses' && (
        <div className="space-y-6">
          <div className="p-4 bg-brand-50/60 border border-brand-200 rounded-lg text-xs text-brand-900 leading-relaxed">
            <strong>Signature Feature — Potential Research Directions:</strong> Evidence-grounded hypotheses generated through explicit reasoning chains from observed contradictions and literature gaps, ranked via transparent Opportunity Scoring.
          </div>

          <div className="space-y-6">
            {hypotheses.map((h, idx) => (
              <div key={h.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                        Research Direction 0{idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                        {h.tier}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {h.research_question}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => handleToggleSave(h.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition-standard ${
                        h.is_saved
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${h.is_saved ? 'fill-amber-500 text-amber-500' : ''}`} />
                      <span>{h.is_saved ? 'Saved' : 'Save Direction'}</span>
                    </button>

                    <button
                      onClick={() => setWhyModalDirection(h)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold border border-slate-200 transition-standard"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
                      <span>Why this direction?</span>
                    </button>
                  </div>
                </div>

                {/* Reasoning Chain */}
                <ReasoningChain direction={h} />

                {/* Opportunity Score Breakdown */}
                <OpportunityScoreCard
                  direction={h}
                  onOpenWhyModal={() => setWhyModalDirection(h)}
                />
              </div>
            ))}
          </div>

          <WhyModal direction={whyModalDirection} onClose={() => setWhyModalDirection(null)} />
        </div>
      )}

      {/* Tab 7: WHAT-IF SIMULATION */}
      {activeTab === 'whatif' && (
        <div className="space-y-4">
          <WhatIfPanel projectId={projectId || ''} />
        </div>
      )}

      {/* Tab 8: KNOWLEDGE GRAPH */}
      {activeTab === 'graph' && graphData && (
        <div className="space-y-4">
          <KnowledgeGraphFlow graph={graphData} />
        </div>
      )}
    </div>
  );
};
