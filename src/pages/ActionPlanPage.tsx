import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  Printer,
  Save,
  Trash2,
} from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { getOpportunity } from '../data/opportunities';
import { getDocument } from '../data/documents';
import { matchOpportunity } from '../utils/matching';
import { readinessFor } from '../utils/readiness';
import { explainFactor, formatDate, pick } from '../i18n';
import { saveState } from '../utils/storage';
import { EmptyState } from '../components/Indicators';
import type { PageId } from '../types';

interface ActionPlanPageProps {
  onNavigate: (page: PageId) => void;
  onOpenPrivacy: () => void;
}

export function ActionPlanPage({ onNavigate, onOpenPrivacy }: ActionPlanPageProps) {
  const { t, language, state } = useAppState();
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const opportunity = state.selectedOpportunityId ? getOpportunity(state.selectedOpportunityId) : undefined;

  const plan = useMemo(() => {
    if (!opportunity) return null;
    const result = matchOpportunity(state.profile, opportunity);
    const readiness = readinessFor(opportunity, state.checklists, state.profile);
    return { result, readiness };
  }, [opportunity, state.profile, state.checklists]);

  if (!opportunity || !plan) {
    return (
      <div className="page">
        <header className="page__header">
          <h1 className="page__title">{t('plan.title')}</h1>
        </header>
        <EmptyState
          icon={<FileCheck2 size={28} />}
          title={t('plan.empty.title')}
          body={t('plan.empty.body')}
          action={
            <button type="button" className="button button--primary" onClick={() => onNavigate('matches')}>
              {t('plan.empty.cta')}
            </button>
          }
        />
      </div>
    );
  }

  const { result, readiness } = plan;
  const name = pick(opportunity.name, language);
  const outstanding = readiness.priorities.length;

  const steps: string[] = [
    t('plan.step.checkOfficial'),
    ...(result.needsVerification.length > 0
      ? [t('plan.step.verifyConditions', { count: result.needsVerification.length })]
      : []),
    ...(outstanding > 0 ? [t('plan.step.collectDocuments', { count: outstanding })] : []),
    ...opportunity.applicationSteps.map((step) => pick(step, language)),
    t('plan.step.apply'),
  ];

  const handleSave = () => {
    saveState(state);
    setSavedAt(new Date().toISOString());
  };

  return (
    <div className="page plan">
      <header className="page__header">
        <h1 className="page__title">{t('plan.title')}</h1>
        <p className="page__lead no-print">{t('plan.subtitle')}</p>
      </header>

      <article className="plan-sheet">
        <header className="plan-sheet__head">
          <p className="plan-sheet__brand">{t('app.name')}</p>
          <h2 className="plan-sheet__title">{t('plan.for', { name })}</h2>
          <p className="plan-sheet__meta">
            {pick(opportunity.provider, language)} · {t('plan.generatedOn', {
              date: formatDate(new Date().toISOString(), language),
            })}
          </p>
        </header>

        <div className="plan-scores">
          <div className="plan-score">
            <span className="plan-score__label">{t('plan.matchScore')}</span>
            <span className="plan-score__value">{result.score}%</span>
          </div>
          <div className="plan-score">
            <span className="plan-score__label">{t('plan.readinessScore')}</span>
            <span className="plan-score__value">{readiness.score}%</span>
          </div>
        </div>

        <section className="plan-section">
          <h3 className="plan-section__title">{t('plan.section.reasons')}</h3>
          {result.confirmedReasons.length === 0 ? (
            <p>{t('match.none.confirmed')}</p>
          ) : (
            <ul className="bullet-list">
              {result.confirmedReasons.map((factor) => (
                <li key={factor.id}>{explainFactor(factor, language)}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="plan-section">
          <h3 className="plan-section__title">{t('plan.section.verify')}</h3>
          {result.needsVerification.length === 0 && result.conflicts.length === 0 ? (
            <p>{t('match.none.verify')}</p>
          ) : (
            <ul className="bullet-list">
              {result.conflicts.map((factor) => (
                <li key={`conflict-${factor.id}`}>
                  <strong>{t('match.heading.conflict')}:</strong> {explainFactor(factor, language)}
                </li>
              ))}
              {result.needsVerification.map((factor) => (
                <li key={`verify-${factor.id}`}>{explainFactor(factor, language)}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="plan-section">
          <h3 className="plan-section__title">{t('plan.section.documents')}</h3>
          {readiness.priorities.length === 0 ? (
            <p>
              <CheckCircle2 aria-hidden="true" size={16} /> {t('documents.nextActions.empty')}
            </p>
          ) : (
            <ol className="step-list">
              {readiness.priorities.map((item) => {
                const doc = getDocument(item.documentId);
                const label = doc ? pick(doc.label, language) : item.documentId;
                return (
                  <li key={item.documentId}>
                    {item.status === 'needs_renewal'
                      ? t('documents.action.renew', { document: label })
                      : t('documents.action.collect', { document: label })}
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <section className="plan-section">
          <h3 className="plan-section__title">{t('plan.section.steps')}</h3>
          <ol className="step-list">
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="plan-section plan-section--deadline">
          <h3 className="plan-section__title">
            <CalendarClock aria-hidden="true" size={18} />
            {t('detail.deadline')}
          </h3>
          <p>
            {opportunity.deadline
              ? t('plan.deadline.warning', { date: formatDate(opportunity.deadline, language) })
              : t('plan.deadline.none')}
          </p>
        </section>

        <section className="plan-section">
          <h3 className="plan-section__title">{t('plan.section.official')}</h3>
          <p className="plan-source">
            <a href={opportunity.officialUrl} target="_blank" rel="noreferrer noopener">
              <ExternalLink aria-hidden="true" size={15} />
              {opportunity.officialUrl}
            </a>
          </p>
          <p className="plan-verified">
            {t('common.lastVerified')}: {formatDate(opportunity.lastVerified, language)} · {t('common.demoEntry')}
          </p>
        </section>

        <footer className="plan-disclaimer">
          <AlertTriangle aria-hidden="true" size={18} />
          <p>{t('plan.disclaimer')}</p>
        </footer>
      </article>

      <div className="page__actions no-print">
        <button type="button" className="button button--primary" onClick={() => window.print()}>
          <Printer aria-hidden="true" size={18} />
          {t('plan.print')}
        </button>
        <button type="button" className="button button--secondary" onClick={handleSave}>
          <Save aria-hidden="true" size={18} />
          {savedAt ? t('common.saved') : t('plan.saveProgress')}
        </button>
        <button type="button" className="button button--ghost" onClick={() => onNavigate('matches')}>
          {t('plan.backToMatches')}
        </button>
        <button type="button" className="button button--danger-outline" onClick={onOpenPrivacy}>
          <Trash2 aria-hidden="true" size={18} />
          {t('plan.deleteData')}
        </button>
      </div>

      {savedAt ? (
        <p className="page__note no-print" role="status">
          <CheckCircle2 aria-hidden="true" size={16} /> {t('common.savedAt')}
        </p>
      ) : null}
    </div>
  );
}
