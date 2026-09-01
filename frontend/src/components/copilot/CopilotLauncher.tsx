import React from 'react';
import { Sparkles, Bot, MessageSquare } from 'lucide-react';
import { useCopilot } from '../../context/CopilotContext';

export const CopilotLauncher: React.FC = () => {
  const { isOpen, toggleCopilot } = useCopilot();

  if (isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <button
        onClick={toggleCopilot}
        aria-label="Open ResearchLoop Copilot"
        className="group relative flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg hover:shadow-xl border border-slate-700 transition-all duration-200 hover:-translate-y-0.5"
      >
        {/* Pulsating Indicator */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
        </span>

        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-cyan-300 transition-transform group-hover:rotate-12" />
          <span className="text-xs font-bold tracking-tight">ResearchLoop Copilot</span>
        </div>

        <span className="text-[10px] bg-brand-500/80 text-white px-1.5 py-0.5 rounded font-mono font-semibold">
          AI
        </span>
      </button>
    </div>
  );
};
