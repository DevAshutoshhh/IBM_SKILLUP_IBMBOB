import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  ExternalLink,
  FileWarning,
  HelpCircle,
  RotateCcw,
  ShieldQuestion,
  UserRoundPlus,
} from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { getOpportunity } from '../data/opportunities';
import { getDocument } from '../data/documents';
import { matchOpportunity } from '../utils/matching';
import { buildInitialChecklist } from '../utils/readiness';
import {
  buildCoachPlan,
  coachCompletionPct,
  countCompleted,
  DOCUMENT_WHY_PREFIX,
} from '../utils/coach';
import { pick, translate } from '../i18n';
import { ProgressBar, EmptyState } from '../components/Indicators';
import type { CoachAction, PageId } from '../types';

interface CoachPageProps {
  onNavigate: (page: PageId) => void;
}

/* ------------------------------------------------------------------ */
/* Small helpers                                                        */
/* ------------------------------------------------------------------ */

/** Resolves a document ID inside a label-values map to its bilingual label. */
function resolveDocumentLabel(docId: string, language: 'en' | 'hi'): string {
  const def = getDocument(docId as Parameters<typeof getDocument>[0]);
  return def ? pick(def.label, language) : docId;
}

/** Resolve the `why` sentence for an action. */
function resolveWhy(action: CoachAction, language: 'en' | 'hi'): string {
  // Document actions encode their why as 'doc:<documentId>' so the why text
  // comes from the document catalogue's bilingual `why` field, not a flat key.
  if (action.whyKey.startsWith(DOCUMENT_WHY_PREFIX)) {
    const docId = action.whyKey.slice(DOCUMENT_WHY_PREFIX.length);
    const def = getDocument(docId as Parameters<typeof getDocument>[0]);
    return def ? pick(def.why, language) : '';
  }
  const values: Record<string, string> = {};
  for (const [k, v] of Object.entries(action.whyValues ?? {})) {
    values[k] = v;
  }
  return translate(language, action.whyKey, values);
}

/** Resolve the label sentence for an action. */
function resolveLabel(action: CoachAction, language: 'en' | 'hi'): string {
  const values: Record<string, string> = {};
  for (const [k, raw] of Object.entries(action.labelValues ?? {})) {
    // document IDs stored as their string id — convert to human label
    if (k === 'document') {
      values[k] = resolveDocumentLabel(raw, language);
    } else if (raw.startsWith('@')) {
      values[k] = translate(language, raw.slice(1));
    } else {
      values[k] = raw;
    }
  }
  return translate(language, action.labelKey, values);
}

/* ------------------------------------------------------------------ */
/* Action row component                                                 */
/* ------------------------------------------------------------------ */

interface ActionRowProps {
  action: CoachAction;
  done: boolean;
  language: 'en' | 'hi';
  onChange: (id: string, done: boolean) => void;
}

function ActionRow({ action, done, language, onChange }: ActionRowProps) {
  const [whyOpen, setWhyOpen] = useState(false);
  const label = resolveLabel(action, language);
  const why = resolveWhy(action, language);

  return (
    <li className={`coach-action${done ? ' coach-action--done' : ''}`}>
      <label className="coach-action__check">
        <input
          type="checkbox"
          className="coach-action__input"
          checked={done}
          onChange={(e) => onChange(action.id, e.target.checked)}
          aria-label={done
            ? translate(language, 'coach.action.undone') + ': ' + label
            : translate(language, 'coach.action.done') + ': ' + label}
        />
        <span className="coach-action__label" aria-hidden="true">
          {label}
        </span>
        {done ? (
          <span className="coach-action__done-badge">
            <CheckCircle2 aria-hidden="true" size={15} />
            {translate(language, 'coach.action.done.label')}
          </span>
        ) : null}
      </label>

      {why ? (
        <div className="coach-action__why">
          <button
            type="button"
            className="coach-action__why-toggle"
            aria-expanded={whyOpen}
            aria-label={translate(language, 'coach.why.toggleLabel')}
            onClick={() => setWhyOpen((o) => !o)}
          >
            <HelpCircle aria-hidden="true" size={14} />
            <span aria-hidden="true">{translate(language, 'coach.why.prefix')}</span>
            {whyOpen
              ? <ChevronUp aria-hidden="true" size={14} />
              : <ChevronDown aria-hidden="true" size={14} />}
          </button>
          {whyOpen ? <p className="coach-action__why-text">{why}</p> : null}
        </div>
      ) : null}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Section component                                                   */
/* ------------------------------------------------------------------ */

interface SectionProps {
  titleKey: string;
  helpKey: string;
  actions: CoachAction[];
  progress: Partial<Record<string, boolean>>;
  language: 'en' | 'hi';
  icon: React.ReactNode;
  onChange: (id: string, done: boolean) => void;
}

function CoachSection({ titleKey, helpKey, actions, progress, language, icon, onChange }: SectionProps) {
  if (actions.length === 0) return null;
  const done = countCompleted(actions, progress);
  return (
    <section className="coach-section" aria-labelledby={`coach-section-${titleKey}`}>
      <h2 className="coach-section__title" id={`coach-section-${titleKey}`}>
        {icon}
        {translate(language, titleKey)}
        <span className="coach-section__count">{done}/{actions.length}</span>
      </h2>
      <p className="coach-section__help">{translate(language, helpKey)}</p>
      <ul className="coach-action-list">
        {actions.map((action) => (
          <ActionRow
            key={action.id}
            action={action}
            done={progress[action.id] === true}
            language={language}
            onChange={onChange}
          />
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                            */
/* ------------------------------------------------------------------ */

export function CoachPage({ onNavigate }: CoachPageProps) {
  const { t, language, state, setCoachActionDone, resetCoachProgress } = useAppState();
  const liveRegionRef = useRef<HTMLParagraphElement>(null);
  const [prevPct, setPrevPct] = useState<number | null>(null);

  const opportunity = state.selectedOpportunityId
    ? getOpportunity(state.selectedOpportunityId) ?? null
    : null;

  const result = useMemo(
    () => (opportunity ? matchOpportunity(state.profile, opportunity) : null),
    [opportunity, state.profile],
  );

  // The checklist for the selected opportunity (may not be seeded yet).
  const checklist = useMemo(() => {
    if (!opportunity) return {};
    const saved = state.checklists[opportunity.id];
    return saved ?? buildInitialChecklist(opportunity, state.profile);
  }, [opportunity, state.checklists, state.profile]);

  const plan = useMemo(
    () => (opportunity && result ? buildCoachPlan(opportunity, result, checklist as Record<string, string>) : null),
    [opportunity, result, checklist],
  );

  const progress = useMemo(
    () => (opportunity ? (state.coachProgress[opportunity.id] ?? {}) : {}),
    [opportunity, state.coachProgress],
  );

  const pct = useMemo(
    () => (plan ? coachCompletionPct(plan.allActions, progress) : 0),
    [plan, progress],
  );

  const doneCount = useMemo(
    () => (plan ? countCompleted(plan.allActions, progress) : 0),
    [plan, progress],
  );

  // Announce progress to screen readers whenever the percentage changes.
  useEffect(() => {
    if (!plan || pct === prevPct) return;
    setPrevPct(pct);
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = t('coach.progress.announced', {
        done: doneCount,
        total: plan.allActions.length,
        pct,
      });
    }
  }, [pct, prevPct, doneCount, plan, t]);

  const handleChange = useCallback(
    (actionId: string, done: boolean) => {
      if (!opportunity) return;
      setCoachActionDone(opportunity.id, actionId, done);
    },
    [opportunity, setCoachActionDone],
  );

  const handleReset = useCallback(() => {
    if (!opportunity) return;
    if (window.confirm(t('coach.reset.confirm'))) {
      resetCoachProgress(opportunity.id);
    }
  }, [opportunity, resetCoachProgress, t]);

  if (!opportunity || !result || !plan) {
    return (
      <div className="page">
        <header className="page__header">
          <h1 className="page__title">{t('coach.title')}</h1>
        </header>
        <EmptyState
          icon={<UserRoundPlus size={28} />}
          title={t('coach.empty.title')}
          body={t('coach.empty.body')}
          action={
            <button
              type="button"
              className="button button--primary"
              onClick={() => onNavigate('matches')}
            >
              {t('coach.empty.cta')}
            </button>
          }
        />
      </div>
    );
  }

  const oppName = pick(opportunity.name, language);
  const allDone = pct === 100;

  return (
    <div className="page coach-page">
      {/* Screen-reader live region — updated when progress changes */}
      <p
        ref={liveRegionRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />

      <header className="page__header">
        <h1 className="page__title">{t('coach.title')}</h1>
        <p className="page__lead">{t('coach.subtitle')}</p>
        <p className="notice notice--warning">
          <AlertTriangle aria-hidden="true" size={18} />
          {t('coach.demoNotice')}
        </p>
        {result.conflicts.length > 0 ? (
          <p className="notice notice--critical">
            <FileWarning aria-hidden="true" size={18} />
            {t('coach.conflict.notice')}
          </p>
        ) : null}
      </header>

      {/* Progress bar */}
      <section className="coach-progress" aria-labelledby="coach-progress-heading">
        <h2 className="coach-progress__heading" id="coach-progress-heading">
          {oppName}
        </h2>
        <ProgressBar
          value={pct}
          label={t('coach.progress.label')}
          valueText={t('coach.progress.value', { done: doneCount, total: plan.allActions.length })}
        />
        <div className="coach-progress__meta">
          <p className="coach-progress__note">
            {t('coach.noUpload')}
          </p>
          <button
            type="button"
            className="button button--ghost button--small"
            onClick={handleReset}
          >
            <RotateCcw aria-hidden="true" size={15} />
            {t('coach.reset')}
          </button>
        </div>
      </section>

      {allDone ? (
        <div className="notice notice--positive coach-all-done">
          <CheckCircle2 aria-hidden="true" size={20} />
          <div>
            <strong>{t('coach.allDone.title')}</strong>
            <p>{t('coach.allDone.body')}</p>
          </div>
          <a
            href={opportunity.officialUrl}
            className="button button--primary button--small"
            target="_blank"
            rel="noreferrer noopener"
          >
            <ExternalLink aria-hidden="true" size={15} />
            {t('coach.officialLink')}
          </a>
        </div>
      ) : null}

      <CoachSection
        titleKey="coach.section.verify"
        helpKey="coach.section.verify.help"
        actions={plan.verifyActions}
        progress={progress}
        language={language}
        icon={<ShieldQuestion aria-hidden="true" size={18} />}
        onChange={handleChange}
      />

      <CoachSection
        titleKey="coach.section.documents"
        helpKey="coach.section.documents.help"
        actions={plan.documentActions}
        progress={progress}
        language={language}
        icon={<ClipboardCheck aria-hidden="true" size={18} />}
        onChange={handleChange}
      />

      <CoachSection
        titleKey="coach.section.apply"
        helpKey="coach.section.apply.help"
        actions={plan.applyActions}
        progress={progress}
        language={language}
        icon={<CheckCircle2 aria-hidden="true" size={18} />}
        onChange={handleChange}
      />

      <div className="page__actions coach-page__actions">
        <a
          href={opportunity.officialUrl}
          className="button button--secondary"
          target="_blank"
          rel="noreferrer noopener"
        >
          <ExternalLink aria-hidden="true" size={16} />
          {t('coach.officialLink')}
        </a>
        <button
          type="button"
          className="button button--ghost"
          onClick={() => onNavigate('matches')}
        >
          {t('plan.backToMatches')}
        </button>
      </div>
    </div>
  );
}
