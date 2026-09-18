import { useState } from 'react';
import { WifiOff } from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PrivacyPanel } from './components/PrivacyPanel';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAppState } from './hooks/useAppState';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useRoute } from './hooks/useRoute';
import { LandingPage } from './pages/LandingPage';
import { ProfileWizard } from './pages/ProfileWizard';
import { MatchesPage } from './pages/MatchesPage';
import { ComparePage } from './pages/ComparePage';
import { DocumentsPage } from './pages/DocumentsPage';
import { ActionPlanPage } from './pages/ActionPlanPage';
import { CoachPage } from './pages/CoachPage';
import { DashboardPage } from './pages/DashboardPage';

export function App() {
  const { t, language } = useAppState();
  const { page, navigate } = useRoute();
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const online = useOnlineStatus();

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        {t('app.skipToContent')}
      </a>

      <Header page={page} onNavigate={navigate} onOpenPrivacy={() => setPrivacyOpen(true)} />

      {!online ? (
        <div className="offline-banner" role="status">
          <WifiOff aria-hidden="true" size={18} />
          <p>
            <strong>{t('offline.title')}</strong> {t('offline.body')}
          </p>
        </div>
      ) : null}

      <main id="main-content" className="app-main" tabIndex={-1}>
        <ErrorBoundary language={language}>
          {page === 'home' ? <LandingPage onNavigate={navigate} /> : null}
          {page === 'profile' ? <ProfileWizard onNavigate={navigate} /> : null}
          {page === 'matches' ? <MatchesPage onNavigate={navigate} /> : null}
          {page === 'compare' ? <ComparePage onNavigate={navigate} /> : null}
          {page === 'documents' ? <DocumentsPage onNavigate={navigate} /> : null}
          {page === 'plan' ? (
            <ActionPlanPage onNavigate={navigate} onOpenPrivacy={() => setPrivacyOpen(true)} />
          ) : null}
          {page === 'coach' ? <CoachPage onNavigate={navigate} /> : null}
          {page === 'dashboard' ? <DashboardPage onNavigate={navigate} /> : null}
        </ErrorBoundary>
      </main>

      <Footer />

      <PrivacyPanel open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </div>
  );
}
