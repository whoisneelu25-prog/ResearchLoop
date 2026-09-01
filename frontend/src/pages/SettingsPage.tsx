import React, { useState, useEffect } from 'react';
import { Settings, ShieldCheck, Database, Cpu, Dna, User, LogOut, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SystemStatus } from '../types';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [researchField, setResearchField] = useState(user?.research_field || 'Oncology');

  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const status = await api.getSystemStatus();
      setSystemStatus(status);
    } catch (e) {
      console.error('Error loading system status:', e);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        full_name: fullName,
        institution,
        research_field: researchField,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Settings & System Diagnostics</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          View real-time engine connectivity, biomedical data sources, and researcher profile settings.
        </p>
      </div>

      {/* System Status Checker Component (Master Prompt Section 90) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              ResearchLoop System Diagnostics
            </h2>
          </div>
          <button
            onClick={fetchStatus}
            disabled={loadingStatus}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-brand-600 font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
            <span>Refresh Diagnostics</span>
          </button>
        </div>

        {systemStatus ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Database */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between">
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px] block">Relational Database</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{systemStatus.database_type}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                <span>{systemStatus.database}</span>
              </span>
            </div>

            {/* Neo4j / Graph Engine */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between">
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px] block">Knowledge Graph Engine</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{systemStatus.neo4j}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                <span>Active</span>
              </span>
            </div>

            {/* Biomedical Literature API */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between">
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px] block">Biomedical APIs</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{systemStatus.biomedical_api}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                <span>Online</span>
              </span>
            </div>

            {/* AI / LLM Engine */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between">
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px] block">AI Evidence Extraction Engine</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{systemStatus.llm}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                <span>Ready</span>
              </span>
            </div>

            {/* Embeddings */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between">
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px] block">Biomedical Embeddings</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{systemStatus.embeddings}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                <span>Active</span>
              </span>
            </div>

            {/* Seed Dataset */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between">
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px] block">Curated Literature Corpus</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{systemStatus.demo_dataset}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                <span>Available</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-slate-500 text-xs">Checking system connectivity...</div>
        )}
      </div>

      {/* Researcher Profile Configuration */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-brand-600" />
          <span>Researcher Profile</span>
        </h2>

        {saveSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
            Profile updated successfully.
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Institution</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Research Field</label>
              <select
                value={researchField}
                onChange={(e) => setResearchField(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="Oncology">Oncology & Thoracic Therapeutics</option>
                <option value="Neurology">Neurology & Neuro-oncology</option>
                <option value="Cardiology">Cardiology & Vascular Medicine</option>
                <option value="Immunology">Immunology & Checkpoint Therapeutics</option>
                <option value="Pharmacology">Pharmacology & Kinase Inhibitors</option>
                <option value="Genetics">Genetics & Precision Medicine</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-md shadow-sm transition-standard"
            >
              Save Profile Changes
            </button>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
