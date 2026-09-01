import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewAnalysisPage } from './pages/NewAnalysisPage';
import { AnalysisDetailPage } from './pages/AnalysisDetailPage';
import { ProjectsListPage } from './pages/ProjectsListPage';
import { SavedDirectionsPage } from './pages/SavedDirectionsPage';
import { SettingsPage } from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes cache
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <span className="text-sm font-medium">Validating research session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />

            {/* Protected App Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/research" element={<ProjectsListPage />} />
              <Route path="/research/new" element={<NewAnalysisPage />} />
              
              {/* Research Project Detail Views */}
              <Route path="/research/:id" element={<AnalysisDetailPage />} />
              <Route path="/research/:id/evidence" element={<AnalysisDetailPage />} />
              <Route path="/research/:id/failures" element={<AnalysisDetailPage />} />
              <Route path="/research/:id/contradictions" element={<AnalysisDetailPage />} />
              <Route path="/research/:id/gaps" element={<AnalysisDetailPage />} />
              <Route path="/research/:id/hypotheses" element={<AnalysisDetailPage />} />
              <Route path="/research/:id/what-if" element={<AnalysisDetailPage />} />
              <Route path="/research/:id/graph" element={<AnalysisDetailPage />} />

              {/* Utility / User Routes */}
              <Route path="/saved-directions" element={<SavedDirectionsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
