import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Search,
  BookOpen,
  Cpu,
  AlertCircle,
  ArrowRight,
  Database,
  SlidersHorizontal,
  Flame,
  SearchCode,
  Lightbulb,
  Zap,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { TopicMatchResult } from '../types';

const PIPELINE_STEPS = [
  { id: 'FETCHING', label: 'Collecting Literature', icon: BookOpen, desc: 'Querying PubMed Entrez and Europe PMC REST APIs' },
  { id: 'PROCESSING', label: 'Processing Papers', icon: Database, desc: 'Normalizing abstracts, study designs, and cohorts' },
  { id: 'EXTRACTING', label: 'Extracting Evidence', icon: Cpu, desc: 'Extracting biomarker stratifications, endpoints, and quotes' },
  { id: 'ANALYZING', label: 'Comparing Findings', icon: Flame, desc: 'Detecting negative/null results and contextual contradictions' },
  { id: 'GAPS', label: 'Detecting Research Gaps', icon: SearchCode, desc: 'Quantifying literature coverage depth and cohort vacuums' },
  { id: 'GENERATING', label: 'Generating Research Directions', icon: Lightbulb, desc: 'Formulating hypotheses and calculating opportunity scores' },
];

export const NewAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialQuery = searchParams.get('q') || 'Cancer Immunotherapy Resistance';
  const [topicQuery, setTopicQuery] = useState(initialQuery);
  const [matchResult, setMatchResult] = useState<TopicMatchResult | null>(null);

  const [disease, setDisease] = useState('');
  const [intervention, setIntervention] = useState('');
  const [biomarker, setBiomarker] = useState('');
  const [population, setPopulation] = useState('');
  const [studyType, setStudyType] = useState('Phase III RCTs & Clinical Trials');
  const [useDemo, setUseDemo] = useState(true);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Run live topic matching debounce
  useEffect(() => {
    if (!topicQuery.trim()) {
      setMatchResult(null);
      return;
    }

    const timer = setTimeout(() => {
      api.matchTopic(topicQuery)
        .then((res) => {
          setMatchResult(res);
          if (res.matched_topic) {
            setDisease(res.matched_topic.disease || '');
            setIntervention(res.matched_topic.intervention || '');
            setBiomarker(res.matched_topic.biomarker || '');
          }
        })
        .catch((err) => console.error('Topic match error:', err));
    }, 200);

    return () => clearTimeout(timer);
  }, [topicQuery]);

  const handleStartAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicQuery.trim()) return;

    // If auto-match >= 90%, immediately open the predefined verified project
    if (matchResult?.is_auto_match && matchResult.matched_topic) {
      navigate(`/research/${matchResult.matched_topic.id}/evidence`);
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setCurrentStepIdx(0);

    try {
      const project = await api.createProject({
        query: topicQuery,
        title: `${topicQuery.slice(0, 45)} Analysis`,
        disease: disease || undefined,
        intervention: intervention || undefined,
        biomarker: biomarker || undefined,
        population: population || undefined,
        study_type: studyType || undefined,
        use_demo_data: useDemo,
      });

      const stepInterval = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev < PIPELINE_STEPS.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 700);

      await api.triggerAnalysis(project.id);
      clearInterval(stepInterval);
      navigate(`/research/${project.id}/evidence`);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize analysis pipeline');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200">
            Biomedical Intelligence Pipeline
          </span>
          <span className="text-xs text-slate-500 font-medium">PubMed & Europe PMC Grounded</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Search or Initialize Research Analysis
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-3xl">
          Search clinical research domains or initiate a multi-stage evidence extraction and contradiction analysis pipeline.
        </p>
      </div>

      {/* Main Search & Analysis Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <form onSubmit={handleStartAnalysis} className="space-y-5">
          {/* Main Query Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-brand-600" />
                <span>Research Topic / Clinical Query</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Semantic Research Recognition & Evidence Grounding
              </span>
            </label>

            <div className="relative">
              <input
                type="text"
                value={topicQuery}
                onChange={(e) => setTopicQuery(e.target.value)}
                placeholder="e.g., Cancer Immunotherapy Resistance, Tuberculosis Drug Resistance, Alzheimer's Biomarkers..."
                className="w-full pl-4 pr-32 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-standard"
                required
              />
              <button
                type="submit"
                disabled={isAnalyzing}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-lg shadow-sm transition-standard flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{matchResult?.is_auto_match ? 'Open Topic' : 'Analyze'}</span>
              </button>
            </div>
          </div>

          {/* Live Topic Match Display */}
          {matchResult?.matched_topic && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-brand-200/80 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-600 text-white font-mono">
                      Research Domain Recognized ({matchResult.confidence_score}% Confidence)
                    </span>
                    {matchResult.is_auto_match && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Evidence Dataset Grounded</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {matchResult.matched_topic.title}
                  </h3>
                  {matchResult.matched_topic.disease && (
                    <p className="text-xs text-brand-800 font-semibold mt-0.5">
                      Disease: {matchResult.matched_topic.disease}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                    {matchResult.matched_topic.summary}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/research/${matchResult.matched_topic?.id}/evidence`)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-xs transition-standard flex-shrink-0"
                >
                  <span>Explore Research</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Real Stored Counts */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs bg-white/80 p-2.5 rounded-lg border border-brand-100 font-mono">
                <div>
                  <div className="font-extrabold text-slate-900">{matchResult.matched_topic.paper_count}</div>
                  <div className="text-[10px] text-slate-500 font-sans uppercase">Papers</div>
                </div>
                <div>
                  <div className="font-extrabold text-amber-700">{matchResult.matched_topic.contradiction_count}</div>
                  <div className="text-[10px] text-slate-500 font-sans uppercase">Contradictions</div>
                </div>
                <div>
                  <div className="font-extrabold text-blue-700">{matchResult.matched_topic.gap_count}</div>
                  <div className="text-[10px] text-slate-500 font-sans uppercase">Research Gaps</div>
                </div>
                <div>
                  <div className="font-extrabold text-purple-700">{matchResult.matched_topic.direction_count}</div>
                  <div className="text-[10px] text-slate-500 font-sans uppercase">Directions</div>
                </div>
              </div>

              {/* Alternative Suggestions */}
              {matchResult.alternatives && matchResult.alternatives.length > 0 && (
                <div className="pt-2 border-t border-brand-100 flex items-center gap-2 text-xs flex-wrap">
                  <span className="text-slate-500 font-semibold text-[11px]">Did you mean?</span>
                  {matchResult.alternatives.map((alt) => (
                    <button
                      key={alt.topic_id}
                      type="button"
                      onClick={() => {
                        setTopicQuery(alt.title);
                        navigate(`/research/${alt.topic_id}/evidence`);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded-md border border-slate-200 text-xs font-medium transition-standard"
                    >
                      <span>{alt.title}</span>
                      <span className="text-slate-400 font-mono text-[10px]">({alt.confidence}%)</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Advanced Parameters Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showAdvanced ? 'Hide Advanced Filters' : 'Custom Cohort Stratification & Filters'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Target Disease</label>
                  <input
                    type="text"
                    value={disease}
                    onChange={(e) => setDisease(e.target.value)}
                    placeholder="e.g., Solid Tumors / NSCLC"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Intervention / Drug</label>
                  <input
                    type="text"
                    value={intervention}
                    onChange={(e) => setIntervention(e.target.value)}
                    placeholder="e.g., Targeted TKI & Checkpoint Inhibitors"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Biomarker Stratification</label>
                  <input
                    type="text"
                    value={biomarker}
                    onChange={(e) => setBiomarker(e.target.value)}
                    placeholder="e.g., PD-L1, TMB, MSI-H"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Study Design Filter</label>
                  <input
                    type="text"
                    value={studyType}
                    onChange={(e) => setStudyType(e.target.value)}
                    placeholder="e.g., Phase III RCTs & Clinical Trials"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Pipeline Execution Animation */}
        {isAnalyzing && (
          <div className="p-6 bg-slate-900 text-white rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand-400 animate-pulse" />
                <span className="font-bold text-sm">Executing Biomedical Analysis Pipeline</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Step {currentStepIdx + 1} of {PIPELINE_STEPS.length}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {PIPELINE_STEPS.map((step, idx) => {
                const isCurrent = idx === currentStepIdx;
                const isPast = idx < currentStepIdx;
                return (
                  <div
                    key={step.id}
                    className={`p-2.5 rounded-lg border text-xs transition-all ${
                      isCurrent
                        ? 'bg-brand-900/60 border-brand-400 text-white scale-105'
                        : isPast
                        ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                        : 'bg-slate-800/30 border-slate-800 text-slate-500'
                    }`}
                  >
                    <step.icon className={`w-4 h-4 mb-1 ${isCurrent ? 'text-cyan-300 animate-spin' : isPast ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div className="font-bold text-[11px] truncate">{step.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
