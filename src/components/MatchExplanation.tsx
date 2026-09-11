import { AlertOctagon, CheckCircle2, HelpCircle, Lightbulb } from 'lucide-react';
import { useTranslation } from '../hooks/useAppState';
import { explainFactor } from '../i18n';
import type { MatchFactor, MatchResult } from '../types';

interface GroupProps {
  title: string;
  emptyText: string;
  tone: 'positive' | 'warning' | 'critical';
  factors: MatchFactor[];
}

function FactorGroup({ title, emptyText, tone, factors }: GroupProps) {
  const { language } = useTranslation();
  const Icon = tone === 'positive' ? CheckCircle2 : tone === 'warning' ? HelpCircle : AlertOctagon;

  return (
    <section className={`factor-group factor-group--${tone}`}>
      <h4 className="factor-group__title">
        <Icon aria-hidden="true" size={18} />
        {title}
        <span className="factor-group__count">{factors.length}</span>
      </h4>
      {factors.length === 0 ? (
        <p className="factor-group__empty">{emptyText}</p>
      ) : (
        <ul className="factor-list">
          {factors.map((factor) => (
            <li key={`${factor.id}-${factor.messageKey}`} className="factor-list__item">
              <span className="factor-list__text">{explainFactor(factor, language)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

interface MatchExplanationProps {
  result: MatchResult;
  /** Hides the "suggested next step" block where the page already shows one. */
  hideNextStep?: boolean;
}

export function MatchExplanation({ result, hideNextStep = false }: MatchExplanationProps) {
  const { t } = useTranslation();

  return (
    <div className="match-explanation">
      <p className="match-explanation__note">{t('matches.scoreExplainer')}</p>

      <FactorGroup
        title={t('match.heading.confirmed')}
        emptyText={t('match.none.confirmed')}
        tone="positive"
        factors={result.confirmedReasons}
      />
      <FactorGroup
        title={t('match.heading.verify')}
        emptyText={t('match.none.verify')}
        tone="warning"
        factors={result.needsVerification}
      />
      <FactorGroup
        title={t('match.heading.conflict')}
        emptyText={t('match.none.conflict')}
        tone="critical"
        factors={result.conflicts}
      />

      {hideNextStep ? null : (
        <section className="next-step">
          <h4 className="next-step__title">
            <Lightbulb aria-hidden="true" size={18} />
            {t('match.heading.nextStep')}
          </h4>
          <p>{t(result.nextStepKey)}</p>
        </section>
      )}
    </div>
  );
}
