import { useState } from 'react';
import {
  AlertOctagon,
  Bookmark,
  BookmarkCheck,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  HelpCircle,
  Scale,
} from 'lucide-react';
import { useTranslation } from '../hooks/useAppState';
import { formatDate, pick } from '../i18n';
import { bandForScore } from '../utils/matching';
import type { MatchResult, Opportunity, ReadinessSummary } from '../types';
import { Badge } from './Indicators';
import { MatchExplanation } from './MatchExplanation';

interface OpportunityCardProps {
  opportunity: Opportunity;
  result: MatchResult;
  readiness: ReadinessSummary;
  bookmarked: boolean;
  comparing: boolean;
  compareDisabled: boolean;
  selected: boolean;
  onToggleBookmark: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onSelect: (id: string) => void;
}

export function OpportunityCard({
  opportunity,
  result,
  readiness,
  bookmarked,
  comparing,
  compareDisabled,
  selected,
  onToggleBookmark,
  onToggleCompare,
  onOpenDetail,
  onSelect,
}: OpportunityCardProps) {
  const { t, language } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const band = bandForScore(result.score, result.conflicts.length > 0);
  const name = pick(opportunity.name, language);

  return (
    <article className={`opportunity-card${selected ? ' opportunity-card--selected' : ''}`}>
      <div className="opportunity-card__head">
        <div className="opportunity-card__titles">
          <h3 className="opportunity-card__name">{name}</h3>
          <p className="opportunity-card__provider">{pick(opportunity.provider, language)}</p>
        </div>
        <button
          type="button"
          className={`icon-button icon-button--bookmark${bookmarked ? ' is-active' : ''}`}
          onClick={() => onToggleBookmark(opportunity.id)}
          aria-pressed={bookmarked}
          aria-label={bookmarked ? t('matches.bookmark.remove') : t('matches.bookmark.add')}
        >
          {bookmarked ? <BookmarkCheck aria-hidden="true" size={20} /> : <Bookmark aria-hidden="true" size={20} />}
        </button>
      </div>

      <div className="opportunity-card__badges">
        <Badge tone="info">{t(`category.label.${opportunity.category}`)}</Badge>
        {selected ? (
          <Badge tone="positive" icon={<CheckCircle2 size={13} />}>
            {t('matches.selected')}
          </Badge>
        ) : null}
      </div>

      <p className="opportunity-card__description">{pick(opportunity.description, language)}</p>

      <div className="opportunity-card__scores">
        <div className={`score-pill score-pill--${band}`}>
          <span className="score-pill__value">{result.score}%</span>
          <span className="score-pill__label">{t(`matches.band.${band}`)}</span>
        </div>
        <div className="opportunity-card__meters">
          <p className="meter-line">
            <ClipboardList aria-hidden="true" size={15} />
            {t('matches.readinessLabel', { score: readiness.score })}
          </p>
          <p className="meter-line">
            <CalendarClock aria-hidden="true" size={15} />
            {opportunity.deadline ? formatDate(opportunity.deadline, language) : t('common.verifyOnPortal')}
          </p>
        </div>
      </div>

      <div className="opportunity-card__flags">
        {result.conflicts.length > 0 ? (
          <Badge tone="critical" icon={<AlertOctagon size={13} />}>
            {t('matches.conflictBadge')}
          </Badge>
        ) : null}
        {result.needsVerification.length > 0 ? (
          <Badge tone="warning" icon={<HelpCircle size={13} />}>
            {t('matches.verifyBadge', { count: result.needsVerification.length })}
          </Badge>
        ) : null}
        {result.conflicts.length === 0 && result.needsVerification.length === 0 ? (
          <Badge tone="positive" icon={<CheckCircle2 size={13} />}>
            {t('matches.noConflictBadge')}
          </Badge>
        ) : null}
      </div>

      <div className="opportunity-card__actions">
        <button type="button" className="button button--primary button--small" onClick={() => onSelect(opportunity.id)}>
          {t('matches.select')}
        </button>
        <button
          type="button"
          className="button button--ghost button--small"
          onClick={() => onOpenDetail(opportunity.id)}
        >
          {t('common.viewDetails')}
        </button>
        <button
          type="button"
          className={`button button--ghost button--small${comparing ? ' is-active' : ''}`}
          onClick={() => onToggleCompare(opportunity.id)}
          aria-pressed={comparing}
          disabled={compareDisabled && !comparing}
          title={compareDisabled && !comparing ? t('matches.compare.full') : undefined}
        >
          <Scale aria-hidden="true" size={15} />
          {comparing ? t('matches.compare.remove') : t('matches.compare.add')}
        </button>
      </div>

      <button
        type="button"
        className="disclosure"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
      >
        {expanded ? <ChevronUp aria-hidden="true" size={16} /> : <ChevronDown aria-hidden="true" size={16} />}
        {expanded ? t('matches.hideExplanation') : t('matches.showExplanation')}
      </button>

      {expanded ? <MatchExplanation result={result} /> : null}
    </article>
  );
}
