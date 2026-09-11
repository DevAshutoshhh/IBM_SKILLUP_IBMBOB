import { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  FileWarning,
  Info,
  ListChecks,
  ShieldCheck,
} from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { getOpportunity } from '../data/opportunities';
import { getDocument } from '../data/documents';
import { readinessFor } from '../utils/readiness';
import { pick } from '../i18n';
import { EmptyState, ReadinessRing, StatTile } from '../components/Indicators';
import type { DocumentStatus, PageId } from '../types';

interface DocumentsPageProps {
  onNavigate: (page: PageId) => void;
}

const STATUSES: DocumentStatus[] = ['ready', 'needs_renewal', 'not_available', 'not_applicable'];

export function DocumentsPage({ onNavigate }: DocumentsPageProps) {
  const { t, language, state, setDocumentStatus } = useAppState();

  const opportunity = state.selectedOpportunityId ? getOpportunity(state.selectedOpportunityId) : undefined;

  const readiness = useMemo(
    () => (opportunity ? readinessFor(opportunity, state.checklists, state.profile) : null),
    [opportunity, state.checklists, state.profile],
  );

  if (!opportunity || !readiness) {
    return (
      <div className="page">
        <header className="page__header">
          <h1 className="page__title">{t('documents.title')}</h1>
        </header>
        <EmptyState
          icon={<ClipboardList size={28} />}
          title={t('documents.empty.title')}
          body={t('documents.empty.body')}
          action={
            <button type="button" className="button button--primary" onClick={() => onNavigate('matches')}>
              {t('documents.empty.cta')}
            </button>
          }
        />
      </div>
    );
  }

  const name = pick(opportunity.name, language);
  const checklist = state.checklists[opportunity.id] ?? {};

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">{t('documents.title')}</h1>
        <p className="page__lead">{t('documents.subtitle')}</p>
        <p className="page__context">{t('documents.for', { name })}</p>
      </header>

      <section className="readiness-summary" aria-label={t('documents.score')}>
        <ReadinessRing score={readiness.score} label={t('documents.score')} caption={t('documents.scoreHelp')} />
        <div className="readiness-summary__stats">
          <StatTile
            icon={<ListChecks size={20} />}
            label={t('documents.ready')}
            value={String(readiness.readyCount)}
            hint={t('documents.requiredCount', { count: readiness.requiredCount })}
          />
          <StatTile icon={<FileWarning size={20} />} label={t('documents.missing')} value={String(readiness.missingCount)} />
          <StatTile
            icon={<AlertTriangle size={20} />}
            label={t('documents.renewal')}
            value={String(readiness.renewalCount)}
          />
        </div>
      </section>

      {readiness.renewalCount > 0 ? (
        <p className="notice notice--warning" role="status">
          <AlertTriangle aria-hidden="true" size={18} />
          {t('documents.renewalWarning', { count: readiness.renewalCount })}
        </p>
      ) : null}

      <section className="next-actions" aria-labelledby="next-actions-heading">
        <h2 className="section__title section__title--small" id="next-actions-heading">
          {t('documents.nextActions')}
        </h2>
        {readiness.priorities.length === 0 ? (
          <p className="next-actions__empty">
            <ShieldCheck aria-hidden="true" size={18} />
            {t('documents.nextActions.empty')}
          </p>
        ) : (
          <ol className="next-actions__list">
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

      <p className="notice notice--info">
        <Info aria-hidden="true" size={18} />
        {t('documents.noUpload')}
      </p>

      <ul className="document-list">
        {readiness.items.map((item) => {
          const doc = getDocument(item.documentId);
          if (!doc) return null;
          const label = pick(doc.label, language);
          const current = checklist[item.documentId] ?? item.status;
          const groupName = `status-${opportunity.id}-${item.documentId}`;

          return (
            <li className="document-item" key={item.documentId}>
              <div className="document-item__head">
                <h3 className="document-item__name">{label}</h3>
                <span className={`tag tag--${item.required ? 'required' : 'optional'}`}>
                  {item.required ? t('documents.requiredTag') : t('documents.optionalTag')}
                </span>
              </div>

              <p className="document-item__why">
                <span className="document-item__why-label">{t('documents.why')}:</span> {pick(doc.why, language)}
              </p>

              <fieldset className="status-picker">
                <legend className="sr-only">{t('documents.statusLegend', { name: label })}</legend>
                {STATUSES.map((status) => {
                  const id = `${groupName}-${status}`;
                  return (
                    <label key={status} className={`status-option status-option--${status}`} htmlFor={id}>
                      <input
                        type="radio"
                        id={id}
                        name={groupName}
                        value={status}
                        checked={current === status}
                        onChange={() => setDocumentStatus(opportunity.id, item.documentId, status)}
                      />
                      <span>{t(`documents.status.${status}`)}</span>
                    </label>
                  );
                })}
              </fieldset>
            </li>
          );
        })}
      </ul>

      <div className="page__actions">
        <button type="button" className="button button--primary" onClick={() => onNavigate('plan')}>
          {t('documents.buildPlan')}
          <ArrowRight aria-hidden="true" size={18} />
        </button>
        <button type="button" className="button button--ghost" onClick={() => onNavigate('matches')}>
          {t('plan.backToMatches')}
        </button>
      </div>

      <p className="page__note">{t('documents.saved')}</p>
    </div>
  );
}
