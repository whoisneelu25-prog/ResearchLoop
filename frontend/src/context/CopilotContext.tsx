import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { api } from '../services/api';

interface CopilotContextType {
  isOpen: boolean;
  openCopilot: (query?: string, context?: { type: string; id?: string }) => void;
  closeCopilot: () => void;
  toggleCopilot: () => void;
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  initialQuery: string | null;
  initialContext: { type: string; id?: string } | null;
  clearInitialQuery: () => void;
  currentPageContext: string;
}

const CopilotContext = createContext<CopilotContextType | undefined>(undefined);

export const CopilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [initialQuery, setInitialQuery] = useState<string | null>(null);
  const [initialContext, setInitialContext] = useState<{ type: string; id?: string } | null>(null);

  const location = useLocation();

  // Determine current active page context
  const currentPageContext = React.useMemo(() => {
    const path = location.pathname;
    if (path.includes('/evidence')) return 'evidence';
    if (path.includes('/failures')) return 'failures';
    if (path.includes('/contradictions')) return 'contradictions';
    if (path.includes('/gaps')) return 'gaps';
    if (path.includes('/hypotheses')) return 'hypotheses';
    if (path.includes('/what-if')) return 'whatif';
    if (path.includes('/graph')) return 'graph';
    return 'overview';
  }, [location.pathname]);

  // Automatically detect project ID from URL if on a /research/:id page
  useEffect(() => {
    const match = location.pathname.match(/\/research\/([a-zA-Z0-9_-]+)/);
    if (match && match[1] && match[1] !== 'new') {
      setActiveProjectId(match[1]);
    } else if (!activeProjectId) {
      // If on /dashboard or other page, fetch default demo/first project
      api.getProjects().then((projects) => {
        if (projects.length > 0) {
          setActiveProjectId(projects[0].id);
        }
      }).catch((e) => console.error('Could not fetch default project for copilot:', e));
    }
  }, [location.pathname]);

  const openCopilot = (query?: string, context?: { type: string; id?: string }) => {
    if (query) setInitialQuery(query);
    if (context) setInitialContext(context);
    setIsOpen(true);
  };

  const closeCopilot = () => {
    setIsOpen(false);
  };

  const toggleCopilot = () => {
    setIsOpen((prev) => !prev);
  };

  const clearInitialQuery = () => {
    setInitialQuery(null);
    setInitialContext(null);
  };

  return (
    <CopilotContext.Provider
      value={{
        isOpen,
        openCopilot,
        closeCopilot,
        toggleCopilot,
        activeProjectId,
        setActiveProjectId,
        initialQuery,
        initialContext,
        clearInitialQuery,
        currentPageContext,
      }}
    >
      {children}
    </CopilotContext.Provider>
  );
};

export const useCopilot = () => {
  const context = useContext(CopilotContext);
  if (!context) {
    throw new Error('useCopilot must be used within a CopilotProvider');
  }
  return context;
};
