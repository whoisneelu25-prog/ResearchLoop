import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Lightbulb,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ResearchLoopLogo } from '../components/common/ResearchLoopLogo';

export const LandingPage: React.FC = () => {
  const { demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleTryDemo = async () => {
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Navigation */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <ResearchLoopLogo size="md" showText={true} />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-700 hover:text-brand-600 px-3 py-2 transition-standard"
            >
              Sign In
            </Link>
            <button
              onClick={handleTryDemo}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md transition-standard border border-slate-200 shadow-xs"
            >
              Instant Access
            </button>
            <Link
              to="/register"
              className="px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-md shadow-sm transition-standard"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Powered Biomedical Research Intelligence Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-950 leading-[1.15]">
          Turn past research into the <span className="text-brand-500">next research direction.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Traditional literature search only answers what already exists. ResearchLoop analyzes published biomedical evidence, detects negative findings and contradictions, exposes evidence gaps, and ranks next-step research opportunities.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleTryDemo}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg text-sm shadow-md transition-standard"
          >
            <span>Explore Live Intelligence</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-lg text-sm border border-slate-300 shadow-xs transition-standard"
          >
            <span>Create Researcher Account</span>
          </Link>
        </div>
      </section>

      {/* Product Preview Card */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
              <span className="text-xs text-slate-400 font-mono ml-2">researchloop.app / lung-cancer-drug-response</span>
            </div>
            <span className="text-xs bg-slate-800 px-2.5 py-1 rounded text-brand-300 font-semibold">
              Live Intelligence Preview
            </span>
          </div>

          <div className="p-6 md:p-8 bg-slate-50 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold uppercase">Studies Analyzed</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">18 Papers</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-red-200 bg-red-50/10">
                <span className="text-xs text-red-600 font-semibold uppercase">Negative / Null</span>
                <div className="text-2xl font-bold text-red-700 mt-1">6 Findings</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-amber-200 bg-amber-50/10">
                <span className="text-xs text-amber-600 font-semibold uppercase">Contradictions</span>
                <div className="text-2xl font-bold text-amber-700 mt-1">2 Divergences</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200 bg-blue-50/10">
                <span className="text-xs text-brand-600 font-semibold uppercase">Opportunity Score</span>
                <div className="text-2xl font-bold text-brand-700 mt-1">82 / 100</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-700 uppercase">
                <Lightbulb className="w-4 h-4 text-brand-600" />
                <span>Signature Research Direction:</span>
              </div>
              <p className="text-sm font-semibold text-slate-900">
                "Does biomarker status modify response to targeted kinase inhibitors, and can downstream vertical co-inhibition overcome de novo resistance?"
              </p>
              <div className="text-xs text-slate-500 font-mono pt-1">
                Formulated from contradiction between Smith et al. (PFS 18.9 mo in Biomarker X+) and Johnson et al. (PFS 3.4 mo null in Biomarker X-).
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Methodology</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950">How ResearchLoop Works</h2>
            <p className="text-xs sm:text-sm text-slate-600">A rigorous multi-step biomedical intelligence pipeline.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
              <div className="text-xl font-bold text-brand-600 font-mono">01</div>
              <h3 className="font-bold text-slate-900 text-sm">Literature Ingestion</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connects to PubMed and Europe PMC to retrieve relevant peer-reviewed trials and observational studies.
              </p>
            </div>
            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
              <div className="text-xl font-bold text-brand-600 font-mono">02</div>
              <h3 className="font-bold text-slate-900 text-sm">Evidence Extraction</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Extracts structured parameters including cohort sample size, biomarker stratification, effect sizes, and exact sentence quotes.
              </p>
            </div>
            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
              <div className="text-xl font-bold text-brand-600 font-mono">03</div>
              <h3 className="font-bold text-slate-900 text-sm">Gaps & Contradictions</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Compares discordant findings across study designs and identifies severe evidence vacuums in published literature.
              </p>
            </div>
            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
              <div className="text-xl font-bold text-brand-600 font-mono">04</div>
              <h3 className="font-bold text-slate-900 text-sm">Opportunity Ranking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Formulates transparently scored research directions using weighted Novelty, Gap Severity, Feasibility, and Impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Responsible AI Disclaimer Banner */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="p-4 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-slate-800 mb-0.5">Responsible AI & Exploratory Research Disclaimer</h4>
            <p className="leading-relaxed">
              ResearchLoop is a scientific hypothesis generation and research exploration tool. AI-generated potential directions are not medical diagnoses, treatment recommendations, or clinical guidelines. All findings require independent validation by qualified investigators.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 ResearchLoop. AI-Powered Biomedical Research Intelligence.</div>
          <div className="flex items-center gap-4 text-slate-600">
            <Link to="/login" className="hover:underline">Sign In</Link>
            <button onClick={handleTryDemo} className="hover:underline">Instant Access</button>
            <Link to="/settings" className="hover:underline">System Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
