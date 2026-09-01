import React, { useState, useEffect } from 'react';
import { BookmarkCheck, Lightbulb, ArrowRight, Award, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { ResearchDirection } from '../types';
import { ReasoningChain } from '../components/analysis/ReasoningChain';

export const SavedDirectionsPage: React.FC = () => {
  const [savedList, setSavedList] = useState<ResearchDirection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      const projects = await api.getProjects();
      const allSaved: ResearchDirection[] = [];
      for (const p of projects) {
        const hyps = await api.getHypotheses(p.id, true);
        allSaved.push(...hyps);
      }
      setSavedList(allSaved);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (projectId: string, id: string) => {
    try {
      await api.toggleSaveDirection(projectId, id);
      setSavedList((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookmarkCheck className="w-5 h-5 text-amber-500" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Saved Research Directions</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Bookmarked research questions and evidence-grounded hypotheses for upcoming grant proposals and laboratory validations.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">Loading saved directions...</div>
      ) : savedList.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs space-y-2">
          <BookmarkCheck className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700">No saved research directions yet.</p>
          <p>Click "Save Direction" on any analysis hypothesis to pin it here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {savedList.map((dir) => (
            <div key={dir.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block">
                    {dir.tier} Opportunity
                  </span>
                  <h3 className="text-base font-bold text-slate-900 leading-snug mt-0.5">{dir.research_question}</h3>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-lg font-bold text-brand-700 font-mono">
                      {dir.overall_score} <span className="text-[10px] text-slate-400 font-sans">/ 100</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(dir.project_id, dir.id)}
                    title="Remove from saved"
                    className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-standard"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <ReasoningChain direction={dir} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
