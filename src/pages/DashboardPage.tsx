import { useMemo } from 'react';
import { Bookmark, ClipboardList, FileWarning, Lightbulb, Sparkles, Target } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { OPPORTUNITIES, getOpportunity } from '../data/opportunities';
import { isProfileUsable, matchAll, profileCompletion } from '../utils/matching';
import { readinessFor } from '../utils/readiness';
import { formatDate, pick } from '../i18n';
import { ProgressBar, StatTile } from '../components/Indicators';
import type { PageId } from '../types';

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { t, language, state } = useAppState();

  const summary = useMemo(() => {
    const completion = profileCompletion(state.profile);
    const results = isProfileUsable(state.profile) ? matchAll(state.profile, OPPORTUNITIES) : [];
    const best = results[0] ?? null;
    const bestOpportunity = best ? getOpportunity(best.opportunityId) ?? null : null;

    const selected = state.selectedOpportunityId ? getOpportunity(state.selectedOpportunityId) ?? null : null;
    const readiness = selected ? readinessFor(selected, state.checklists, state.profile) : null;

    let nextActionKey = 'dashboard.action.completeProfile';
    if (completion >= 60 && !selected) nextActionKey = 'dashboard.action.reviewMatches';
    else if (selected && readiness && readiness.priorities.length > 0) nextActionKey = 'dashboard.action.workChecklist';
    else if (selected && readiness) nextActionKey = 'dashboard.action.printPlan';

    return { completion, best, bestOpportunity, selected, readiness, nextActionKey };
  }, [state.profile, state.selectedOpportunityId, state.checklists]);

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">{t('dashboard.title')}</h1>
        <p className="page__lead">{t('dashboard.subtitle')}</p>
        <p className="page__context">
          {state.profile.updatedAt
            ? t('dashboard.updated', { date: formatDate(state.profile.updatedAt, language) })
            : t('dashboard.neverUpdated')}
        </p>
      </header>

      <section className="dashboard-progress">
        <ProgressBar
          value={summary.completion}
          label={t('dashboard.profileCompletion')}
          valueText={t('common.percentComplete', { value: summary.completion })}
        />
      </section>

      <div className="dashboard-grid">
        <StatTile
          icon={<Bookmark size={20} />}
          label={t('dashboard.savedOpportunities')}
          value={String(state.bookmarks.length)}
        />
        <StatTile
          icon={<Sparkles size={20} />}
          label={t('dashboard.bestMatch')}
          value={summary.best ? `${summary.best.score}%` : t('dashboard.none')}
          hint={summary.bestOpportunity ? pick(summary.bestOpportunity.name, language) : undefined}
        />
        <StatTile
          icon={<Target size={20} />}
          label={t('dashboard.selectedApplication')}
          value={summary.selected ? pick(summary.selected.name, language) : t('dashboard.none')}
          variant="text"
        />
        <StatTile
          icon={<ClipboardList size={20} />}
          label={t('dashboard.readiness')}
          value={summary.readiness ? `${summary.readiness.score}%` : t('dashboard.none')}
        />
        <StatTile
          icon={<FileWarning size={20} />}
          label={t('dashboard.missingDocuments')}
          value={summary.readiness ? String(summary.readiness.priorities.length) : t('dashboard.none')}
        />
      </div>

      <section className="next-step">
        <h2 className="next-step__title">
          <Lightbulb aria-hidden="true" size={18} />
          {t('dashboard.nextAction')}
        </h2>
        <p>{t(summary.nextActionKey)}</p>
        <div className="page__actions">
          <button type="button" className="button button--primary button--small" onClick={() => onNavigate('matches')}>
            {t('nav.matches')}
          </button>
          <button type="button" className="button button--ghost button--small" onClick={() => onNavigate('profile')}>
            {t('nav.profile')}
          </button>
          {summary.selected ? (
            <button
              type="button"
              className="button button--ghost button--small"
              onClick={() => onNavigate('documents')}
            >
              {t('nav.documents')}
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
