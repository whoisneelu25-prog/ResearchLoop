import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  FileText,
  AlertTriangle,
  Flame,
  SearchCode,
  Lightbulb,
  SlidersHorizontal,
  Network,
  Settings,
  BookmarkCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCopilot } from '../../context/CopilotContext';
import { ResearchLoopLogo } from '../common/ResearchLoopLogo';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user } = useAuth();
  const { id: projectId } = useParams<{ id: string }>();
  const { openCopilot } = useCopilot();

  // Determine current active project id for contextual links
  const activeProjectId = projectId || 'demo-lung-cancer-project-001';

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-standard ${
      isActive
        ? 'bg-brand-50 text-brand-600 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen select-none">
      {/* Brand Header with New Logo */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <NavLink to="/dashboard" className="flex items-center gap-2.5" onClick={onCloseMobile}>
          <ResearchLoopLogo size="md" showText={true} />
        </NavLink>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Copilot Quick Launcher in Sidebar */}
        <div>
          <button
            type="button"
            onClick={() => {
              openCopilot();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between p-2.5 bg-gradient-to-r from-slate-900 to-brand-900 hover:from-slate-800 hover:to-brand-800 text-white rounded-lg shadow-xs transition-all group"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
              <div className="text-left leading-none">
                <span className="text-xs font-bold block">Research Copilot</span>
                <span className="text-[9px] text-cyan-200/80">Evidence AI Assistant</span>
              </div>
            </div>
            <span className="text-[9px] bg-cyan-500/30 text-cyan-200 px-1.5 py-0.5 rounded font-mono font-bold">
              OPEN
            </span>
          </button>
        </div>

        {/* Core Navigation */}
        <div>
          <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Core
          </div>
          <nav className="space-y-0.5">
            <NavLink to="/dashboard" className={linkClass} onClick={onCloseMobile}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </NavLink>
            <NavLink to="/research/new" className={linkClass} onClick={onCloseMobile}>
              <PlusCircle className="w-4 h-4 text-brand-600" />
              <span>New Analysis</span>
            </NavLink>
            <NavLink to="/research" className={linkClass} onClick={onCloseMobile}>
              <FolderKanban className="w-4 h-4" />
              <span>My Research</span>
            </NavLink>
          </nav>
        </div>

        {/* Evidence Intelligence */}
        <div>
          <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Evidence Intelligence</span>
          </div>
          <nav className="space-y-0.5">
            <NavLink to={`/research/${activeProjectId}/evidence`} className={linkClass} onClick={onCloseMobile}>
              <FileText className="w-4 h-4" />
              <span>Evidence Table</span>
            </NavLink>
            <NavLink to={`/research/${activeProjectId}/contradictions`} className={linkClass} onClick={onCloseMobile}>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Contradictions</span>
            </NavLink>
            <NavLink to={`/research/${activeProjectId}/failures`} className={linkClass} onClick={onCloseMobile}>
              <Flame className="w-4 h-4 text-red-600" />
              <span>Negative Findings</span>
            </NavLink>
            <NavLink to={`/research/${activeProjectId}/gaps`} className={linkClass} onClick={onCloseMobile}>
              <SearchCode className="w-4 h-4 text-blue-600" />
              <span>Research Gaps</span>
            </NavLink>
          </nav>
        </div>

        {/* Actionable Insights */}
        <div>
          <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Directions & Modeling
          </div>
          <nav className="space-y-0.5">
            <NavLink to={`/research/${activeProjectId}/hypotheses`} className={linkClass} onClick={onCloseMobile}>
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Research Directions</span>
            </NavLink>
            <NavLink to={`/research/${activeProjectId}/what-if`} className={linkClass} onClick={onCloseMobile}>
              <SlidersHorizontal className="w-4 h-4" />
              <span>What-If Analysis</span>
            </NavLink>
            <NavLink to={`/research/${activeProjectId}/graph`} className={linkClass} onClick={onCloseMobile}>
              <Network className="w-4 h-4 text-brand-600" />
              <span>Knowledge Graph</span>
            </NavLink>
            <NavLink to="/saved-directions" className={linkClass} onClick={onCloseMobile}>
              <BookmarkCheck className="w-4 h-4" />
              <span>Saved Directions</span>
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Footer Profile & Settings */}
      <div className="p-3 border-t border-slate-200 space-y-1">
        <NavLink to="/settings" className={linkClass} onClick={onCloseMobile}>
          <Settings className="w-4 h-4" />
          <span>Settings & Diagnostics</span>
        </NavLink>
        {user && (
          <div className="px-3 py-2 rounded-md bg-slate-50 border border-slate-100 mt-2 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
              {user.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-800 truncate">{user.full_name}</div>
              <div className="text-[10px] text-slate-500 truncate">{user.institution || user.email}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
