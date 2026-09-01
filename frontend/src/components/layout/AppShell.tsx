import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ResponsibleDisclaimer } from '../common/ResponsibleDisclaimer';
import { CopilotProvider } from '../../context/CopilotContext';
import { CopilotLauncher } from '../copilot/CopilotLauncher';
import { CopilotDrawer } from '../copilot/CopilotDrawer';

export const AppShell: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <CopilotProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block flex-shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative z-10">
              <Sidebar onCloseMobile={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* Main App Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar onToggleMobileMenu={() => setMobileOpen(!mobileOpen)} />
          
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6 pb-12">
              <Outlet />
              <ResponsibleDisclaimer compact />
            </div>
          </main>
        </div>

        {/* Persistent Copilot Floating Launcher & Slide-out Drawer */}
        <CopilotLauncher />
        <CopilotDrawer />
      </div>
    </CopilotProvider>
  );
};
