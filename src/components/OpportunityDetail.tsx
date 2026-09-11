import { AlertTriangle, CalendarClock, ExternalLink, FileText, Info } from 'lucide-react';
import { useTranslation } from '../hooks/useAppState';
import { getDocument } from '../data/documents';
import { getStateLabel } from '../data/states';
import { formatDate, pick } from '../i18n';
import { ALL_INDIA, type MatchResult, type Opportunity } from '../types';
import { Dialog } from './Dialog';
import { MatchExplanation } from './MatchExplanation';
import { Badge } from './Indicators';

interface OpportunityDetailProps {
  opportunity: Opportunity | null;
  result: MatchResult | null;
  open: boolean;
  onClose: () => void;
  onSelect?: (id: string) => void;
  selectLabel?: string;
}

function DefinitionRow({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="definition-row">
      <dt>{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function OpportunityDetail({
  opportunity,
  result,
  open,
  onClose,
  onSelect,
  selectLabel,
}: OpportunityDetailProps) {
  const { t, language } = useTranslation();
  if (!opportunity) return null;

  const locations = opportunity.locations.includes(ALL_INDIA)
    ? t('detail.allIndia')
    : opportunity.locations
        .map((code) => {
          const label = getStateLabel(code);
          return label ? pick(label, language) : code;
        })
        .join(', ');

  return (
    <Dialog
      open={open}
      title={pick(opportunity.name, language)}
      onClose={onClose}
      size="large"
      footer={
        <div className="dialog__actions">
          <a
            className="button button--primary"
            href={opportunity.officialUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            <ExternalLink aria-hidden="true" size={16} />
            {t('detail.openOfficial')}
            <span className="sr-only"> ({t('common.opensInNewTab')})</span>
          </a>
          {onSelect ? (
            <button type="button" className="button button--secondary" onClick={() => onSelect(opportunity.id)}>
              {selectLabel ?? t('matches.select')}
            </button>
          ) : null}
        </div>
      }
    >
      <p className="notice notice--warning">
        <AlertTriangle aria-hidden="true" size={18} />
        {t('detail.demoWarning')}
      </p>

      <p className="lead">{pick(opportunity.description, language)}</p>

      <dl className="definition-list">
        <DefinitionRow term={t('detail.provider')}>{pick(opportunity.provider, language)}</DefinitionRow>
        <DefinitionRow term={t('detail.supportType')}>
          <span className="chip-row">
            {opportunity.supportTypes.map((type) => (
              <Badge key={type} tone="info">
                {t(`support.${type}`)}
              </Badge>
            ))}
          </span>
        </DefinitionRow>
        <DefinitionRow term={t('detail.educationLevels')}>
          {opportunity.educationLevels.map((level) => t(`education.${level}`)).join(', ')}
        </DefinitionRow>
        <DefinitionRow term={t('detail.locations')}>{locations}</DefinitionRow>
        <DefinitionRow term={t('detail.income')}>{pick(opportunity.income.label, language)}</DefinitionRow>
        <DefinitionRow term={t('detail.marks')}>{pick(opportunity.marks.label, language)}</DefinitionRow>
        <DefinitionRow term={t('detail.special')}>
          {opportunity.specialConditions.length === 0
            ? t('detail.noSpecial')
            : opportunity.specialConditions.map((condition) => t(`condition.${condition.kind}`)).join(', ')}
        </DefinitionRow>
        <DefinitionRow term={t('detail.deadline')}>
          <span className="inline-icon">
            <CalendarClock aria-hidden="true" size={16} />
            {opportunity.deadline ? formatDate(opportunity.deadline, language) : t('common.verifyOnPortal')}
          </span>
        </DefinitionRow>
        <DefinitionRow term={t('common.lastVerified')}>
          {formatDate(opportunity.lastVerified, language)}
        </DefinitionRow>
      </dl>

      <section className="detail-section">
        <h3 className="detail-section__title">
          <FileText aria-hidden="true" size={18} />
          {t('detail.documents')}
        </h3>
        <ul className="bullet-list">
          {opportunity.requiredDocuments.map((id) => {
            const doc = getDocument(id);
            return <li key={id}>{doc ? pick(doc.label, language) : id}</li>;
          })}
        </ul>
        {opportunity.optionalDocuments.length > 0 ? (
          <>
            <h4 className="detail-section__subtitle">{t('detail.optionalDocuments')}</h4>
            <ul className="bullet-list bullet-list--muted">
              {opportunity.optionalDocuments.map((id) => {
                const doc = getDocument(id);
                return <li key={id}>{doc ? pick(doc.label, language) : id}</li>;
              })}
            </ul>
          </>
        ) : null}
      </section>

      <section className="detail-section">
        <h3 className="detail-section__title">
          <Info aria-hidden="true" size={18} />
          {t('detail.steps')}
        </h3>
        <ol className="step-list">
          {opportunity.applicationSteps.map((step, index) => (
            <li key={index}>{pick(step, language)}</li>
          ))}
        </ol>
      </section>

      {result ? (
        <section className="detail-section">
          <h3 className="detail-section__title">{t('matches.showExplanation')}</h3>
          <MatchExplanation result={result} />
        </section>
      ) : null}

      <section className="detail-section">
        <h3 className="detail-section__title">{t('detail.tags')}</h3>
        <span className="chip-row">
          {opportunity.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </span>
      </section>
    </Dialog>
  );
}
