import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { DemoNoticeBanner } from './components/common/DemoNoticeBanner';
import { ToastContainer } from './components/common/Toast';
import { CommandPalette } from './components/layout/CommandPalette';
import { PageId } from './types';

import { OverviewPage } from './pages/OverviewPage';
import { ScenarioCataloguePage } from './pages/ScenarioCataloguePage';
import { NewSessionPage } from './pages/NewSessionPage';
import { WorkspaceListPage } from './pages/WorkspaceListPage';
import { DebugSessionPage } from './pages/DebugSessionPage';
import { PatchReviewPage } from './pages/PatchReviewPage';
import { VerificationResultsPage } from './pages/VerificationResultsPage';
import { EvidenceReportsPage } from './pages/EvidenceReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PayPalConnectionInspectorPage } from './pages/PayPalConnectionInspectorPage';
import { PayPalErrorAnalyzerPage } from './pages/PayPalErrorAnalyzerPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { HackathonDemoTour } from './components/common/HackathonDemoTour';

export const App: React.FC = () => {
  const { currentPage, setCurrentPage, activeSession, loadSession } = useApp();

  // Helper to map pathname to PageId
  const getPageFromPath = (pathname: string): { page: PageId; id?: string } => {
    const clean = pathname.replace(/\/+$/, '') || '/';

    if (clean === '/' || clean === '/overview') {
      return { page: 'overview' };
    }
    if (clean === '/scenarios' || clean === '/test-scenarios') {
      return { page: 'scenarios' };
    }
    if (clean === '/new-session' || clean === '/start-session') {
      return { page: 'new-session' };
    }
    if (clean === '/workspace') {
      return { page: 'workspace' };
    }
    if (clean === '/paypal-inspector' || clean === '/paypal-connection') {
      return { page: 'paypal-inspector' };
    }
    if (clean === '/error-analyzer' || clean === '/paypal-errors') {
      return { page: 'error-analyzer' };
    }
    if (clean.startsWith('/workspace/')) {
      const sessionId = clean.split('/workspace/')[1];
      return { page: 'debug-session', id: sessionId };
    }
    if (clean === '/patch-review' || clean.startsWith('/patch-review/')) {
      return { page: 'patch-review' };
    }
    if (clean === '/verification-results' || clean.startsWith('/verification-results/')) {
      return { page: 'verification-results' };
    }
    if (clean === '/reports' || clean === '/verification-reports' || clean.startsWith('/reports/')) {
      return { page: 'reports' };
    }
    if (clean === '/settings') {
      return { page: 'settings' };
    }
    return { page: 'not-found' };
  };

  // Helper to get pathname from PageId
  const getPathFromPage = (page: PageId, sessionId?: string): string => {
    switch (page) {
      case 'overview':
        return '/';
      case 'scenarios':
        return '/scenarios';
      case 'new-session':
        return '/new-session';
      case 'workspace':
        return '/workspace';
      case 'debug-session':
        return sessionId ? `/workspace/${sessionId}` : '/workspace';
      case 'paypal-inspector':
        return '/paypal-inspector';
      case 'error-analyzer':
        return '/error-analyzer';
      case 'patch-review':
        return '/patch-review';
      case 'verification-results':
        return '/verification-results';
      case 'reports':
        return '/reports';
      case 'settings':
        return '/settings';
      default:
        return window.location.pathname;
    }
  };

  // Sync initial URL on mount and handle browser refresh / direct navigation
  useEffect(() => {
    const { page, id } = getPageFromPath(window.location.pathname);
    if (page === 'debug-session' && id) {
      loadSession(id);
    } else {
      setCurrentPage(page);
    }
  }, []);

  // Update browser history when currentPage changes
  useEffect(() => {
    const targetPath = getPathFromPage(currentPage, activeSession?.id);
    if (currentPage !== 'not-found' && window.location.pathname !== targetPath) {
      window.history.pushState({ page: currentPage }, '', targetPath);
    }
  }, [currentPage, activeSession?.id]);

  // Handle browser back and forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const { page, id } = getPageFromPath(window.location.pathname);
      if (page === 'debug-session' && id) {
        loadSession(id);
      } else {
        setCurrentPage(page);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewPage />;
      case 'scenarios':
        return <ScenarioCataloguePage />;
      case 'new-session':
        return <NewSessionPage />;
      case 'workspace':
        return <WorkspaceListPage />;
      case 'debug-session':
        return <DebugSessionPage />;
      case 'paypal-inspector':
        return <PayPalConnectionInspectorPage />;
      case 'error-analyzer':
        return <PayPalErrorAnalyzerPage />;
      case 'patch-review':
        return <PatchReviewPage />;
      case 'verification-results':
        return <VerificationResultsPage />;
      case 'reports':
        return <EvidenceReportsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'not-found':
        return <NotFoundPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col selection:bg-electric-600 selection:text-white">
      {/* Persistent Demo Notice Banner at the very top */}
      <DemoNoticeBanner />
      {/* Guided Hackathon Demonstration Tour Bar */}
      <HackathonDemoTour />

      <div className="flex flex-1 min-h-0">
        {/* Persistent Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-dark-900 overflow-y-auto">
          {/* Top Bar */}
          <TopBar />

          {/* Page Body */}
          <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderCurrentPage()}
          </main>
        </div>
      </div>

      {/* Floating Overlays */}
      <ToastContainer />
      <CommandPalette />
    </div>
  );
};

export default App;
