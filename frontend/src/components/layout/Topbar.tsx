import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, Sparkles, LogOut, Bot } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCopilot } from '../../context/CopilotContext';
import { api } from '../../services/api';

interface TopbarProps {
  onToggleMobileMenu: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileMenu }) => {
  const { user, logout } = useAuth();
  const { openCopilot } = useCopilot();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const match = await api.matchTopic(searchQuery.trim());
      if (match?.matched_topic) {
        navigate(`/research/${match.matched_topic.id}/evidence`);
        return;
      }
    } catch (err) {
      console.error('Topic search error:', err);
    }
    navigate(`/research/new?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-md hover:bg-slate-100 text-slate-600"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search disease, drug, biomarker, pathway, or trial..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition-standard"
          />
        </form>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Researcher Status Badge */}
        {user && (
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Verified Researcher
          </span>
        )}

        <button
          type="button"
          onClick={() => openCopilot()}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold transition-standard border border-slate-200"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Copilot</span>
        </button>

        <button
          onClick={() => navigate('/research/new')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-md text-xs font-semibold shadow-sm transition-standard"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Analysis</span>
        </button>

        <button
          onClick={logout}
          title="Sign Out"
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-standard"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
