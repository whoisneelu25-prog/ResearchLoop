import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  BookOpen,
  AlertTriangle,
  Flame,
  SearchCode,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  FolderKanban,
  Award,
  ChevronRight,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '../services/api';
import { ResearchProjectSummary, ResearchProjectDetail, ResearchDirection } from '../types';
import { MetricCard } from '../components/common/MetricCard';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ResearchProjectSummary[]>([]);
  const [activeDetail, setActiveDetail] = useState<ResearchProjectDetail | null>(null);
  const [topDirections, setTopDirections] = useState<ResearchDirection[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickQuery, setQuickQuery] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const pList = await api.getProjects();
        setProjects(pList);

        if (pList.length > 0) {
          const firstProj = pList[0];
          const det = await api.getProjectDetail(firstProj.id);
          setActiveDetail(det);

          const hyps = await api.getHypotheses(firstProj.id);
          setTopDirections(hyps.slice(0, 3));
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleQuickSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    try {
      const match = await api.matchTopic(quickQuery.trim());
      if (match?.matched_topic) {
        navigate(`/research/${match.matched_topic.id}/evidence`);
        return;
      }
    } catch (err) {
      console.error('Match error:', err);
    }
    navigate(`/research/new?q=${encodeURIComponent(quickQuery.trim())}`);
  };

  // Distribution chart data
  const distributionData = activeDetail?.evidence_distribution
    ? [
        { name: 'Positive Evidence', value: activeDetail.evidence_distribution.positive || 0, color: '#15803D' },
        { name: 'Null Results', value: activeDetail.evidence_distribution.null || 0, color: '#DC2626' },
        { name: 'Negative / Adverse', value: activeDetail.evidence_distribution.negative || 0, color: '#991B1B' },
        { name: 'Mixed Efficacy', value: activeDetail.evidence_distribution.mixed || 0, color: '#D97706' },
      ].filter((d) => d.value > 0)
    : [];

  const totalEvidenceCount = distributionData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Topic Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Biomedical Research Intelligence Overview</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Turn past biomedical research—including failures and contradictions—into the next research direction.
            </p>
          </div>
          <button
            onClick={() => navigate('/research/new')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-standard self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>New Research Analysis</span>
          </button>
        </div>

        {/* Global Analysis Search Bar */}
        <form onSubmit={handleQuickSearch} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={quickQuery}
            onChange={(e) => setQuickQuery(e.target.value)}
            placeholder="Search a disease, drug, biomarker, pathway, or research question (e.g. Lung cancer drug response)..."
            className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-standard"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold"
          >
            Analyze
          </button>
        </form>
      </div>

      {/* Active Research Project Spotlight */}
      {activeDetail && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">Active Research Project</span>
                {activeDetail.is_demo && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                    Verified Literature Corpus
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">{activeDetail.title}</h2>
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span><strong>Target:</strong> {activeDetail.disease || 'NSCLC'}</span>
                <span>•</span>
                <span><strong>Intervention:</strong> {activeDetail.intervention || 'Targeted TKI / Anti-PD-1'}</span>
                <span>•</span>
                <span><strong>Biomarkers:</strong> {activeDetail.biomarker || 'Biomarker X, Biomarker Y, PD-L1'}</span>
              </div>
            </div>

            <Link
              to={`/research/${activeDetail.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-md self-start sm:self-auto transition-standard"
            >
              <span>Explore Analysis Results</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 4 Clinical Signal Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Negative / Null Findings"
              value={activeDetail.negative_count}
              icon={Flame}
              subtext="Unreplicated or null results"
              variant="negative"
              onClick={() => navigate(`/research/${activeDetail.id}/failures`)}
            />
            <MetricCard
              label="Literature Contradictions"
              value={activeDetail.contradiction_count}
              icon={AlertTriangle}
              subtext="Discordant study outcomes"
              variant="warning"
              onClick={() => navigate(`/research/${activeDetail.id}/contradictions`)}
            />
            <MetricCard
              label="Identified Evidence Gaps"
              value={activeDetail.gap_count}
              icon={SearchCode}
              subtext="Critical literature vacuums"
              variant="info"
              onClick={() => navigate(`/research/${activeDetail.id}/gaps`)}
            />
            <MetricCard
              label="Potential Directions"
              value={activeDetail.direction_count}
              icon={Lightbulb}
              subtext="Ranked research opportunities"
              variant="default"
              onClick={() => navigate(`/research/${activeDetail.id}/hypotheses`)}
            />
          </div>

          {/* Middle Row: Evidence Distribution Chart & Top Opportunities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Chart: Evidence Distribution */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <PieChartIcon className="w-4 h-4 text-brand-600" />
                  <span>Evidence Outcome Distribution</span>
                </span>
                <span className="text-xs text-slate-500 font-mono">{activeDetail.paper_count} Total Studies</span>
              </div>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', fontSize: '11px', borderRadius: '6px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <p className="text-[11px] text-slate-500 text-center leading-snug">
                Extracted evidence shows {activeDetail.evidence_distribution.positive || 0} positive efficacy trials, contrasted with {activeDetail.negative_count} null or divergent outcomes across biomarker groups.
              </p>
            </div>

            {/* Top Ranked Research Opportunities */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Top Research Opportunities</span>
                  </span>
                  <Link
                    to={`/research/${activeDetail.id}/hypotheses`}
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    View all ({activeDetail.direction_count})
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {topDirections.map((dir, idx) => (
                    <div
                      key={dir.id}
                      onClick={() => navigate(`/research/${activeDetail.id}/hypotheses`)}
                      className="p-3 bg-white border border-slate-200 hover:border-brand-300 rounded-lg cursor-pointer transition-standard shadow-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                          0{idx + 1} • {dir.tier}
                        </span>
                        <p className="text-xs font-bold text-slate-900 truncate leading-snug mt-0.5">
                          {dir.research_question}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-base font-extrabold text-brand-700 font-mono">
                          {dir.overall_score} <span className="text-[10px] font-sans text-slate-400">/ 100</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                <span>Calculated via Novelty, Gap Severity, Feasibility & Impact</span>
                <Link to={`/research/${activeDetail.id}/graph`} className="font-semibold text-brand-600 hover:underline">
                  Open Graph →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Research Projects History */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">My Research Analyses</h3>
          </div>
          <Link to="/research/new" className="text-xs font-semibold text-brand-600 hover:underline">
            + Start New Analysis
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => navigate(`/research/${proj.id}`)}
              className="py-3.5 px-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-standard flex items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{proj.title}</span>
                  {proj.is_demo && (
                    <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      Verified Dataset
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{proj.query}</p>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0 text-xs">
                <span className="font-mono text-slate-600">{proj.paper_count} Papers</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
                  {proj.status}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
