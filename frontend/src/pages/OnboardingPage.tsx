import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Dna, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ResearchLoopLogo } from '../components/common/ResearchLoopLogo';

export const OnboardingPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [field, setField] = useState(user?.research_field || 'Oncology');
  const [topic, setTopic] = useState('Drug treatment for lung cancer biomarker response');
  const [loading, setLoading] = useState(false);

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ research_field: field });
      navigate(`/research/new?q=${encodeURIComponent(topic)}`);
    } catch (err) {
      console.error(err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <ResearchLoopLogo size="lg" showText={false} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome to ResearchLoop</h2>
          <p className="text-xs text-slate-500">Configure your scientific research scope</p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-md space-y-5">
          <form onSubmit={handleComplete} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Dna className="w-3.5 h-3.5 text-brand-600" />
                <span>1. Primary Research Field</span>
              </label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="Oncology">Oncology & Thoracic Therapeutics</option>
                <option value="Neurology">Neurology & Neuro-oncology</option>
                <option value="Cardiology">Cardiology & Vascular Medicine</option>
                <option value="Immunology">Immunology & Checkpoint Therapeutics</option>
                <option value="Pharmacology">Pharmacology & Kinase Inhibitors</option>
                <option value="Genetics">Genetics & Precision Medicine</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-brand-600" />
                <span>2. What would you like to investigate?</span>
              </label>
              <textarea
                rows={3}
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Drug treatment for lung cancer biomarker response"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 leading-relaxed"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Example: "Drug treatment for lung cancer", "EGFR inhibitor resistance", "KRAS G12C therapies"
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-md shadow-sm transition-standard flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Initializing Analysis...' : 'Launch First Research Analysis'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
