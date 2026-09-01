import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FolderKanban, PlusCircle, ChevronRight, Search, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { ResearchProjectSummary } from '../types';

export const ProjectsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ResearchProjectSummary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const list = await api.getProjects();
        setProjects(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.query.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Research Projects</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your biomedical literature evidence maps and intelligence syntheses.
          </p>
        </div>

        <Link
          to="/research/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-standard self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Research Analysis</span>
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by topic or title..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Projects List */}
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">Loading projects...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No research projects found.{' '}
              <Link to="/research/new" className="text-brand-600 font-semibold hover:underline">
                Start your first analysis.
              </Link>
            </div>
          ) : (
            filtered.map((proj) => (
              <div
                key={proj.id}
                onClick={() => navigate(`/research/${proj.id}`)}
                className="py-4 px-3 hover:bg-blue-50/30 rounded-lg cursor-pointer transition-standard flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm hover:text-brand-600">
                      {proj.title}
                    </span>
                    {proj.is_demo && (
                      <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        Verified Dataset
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 truncate">{proj.query}</p>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0 text-xs">
                  <span className="font-mono text-slate-600">{proj.paper_count} Papers</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
                    {proj.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
