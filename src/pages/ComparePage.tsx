import { useMemo } from 'react';
import { Scale, X } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { getOpportunity } from '../data/opportunities';
import { getStateLabel } from '../data/states';
import { matchOpportunity } from '../utils/matching';
import { readinessFor } from '../utils/readiness';
import { formatDate, pick } from '../i18n';
import { EmptyState } from '../components/Indicators';
import { ALL_INDIA, type PageId } from '../types';

interface ComparePageProps {
  onNavigate: (page: PageId) => void;
}

interface Row {
  key: string;
  label: string;
  values: string[];
}

export function ComparePage({ onNavigate }: ComparePageProps) {
  const { t, language, state, toggleCompare } = useAppState();

  const entries = useMemo(
    () =>
      state.compareIds
        .map((id) => getOpportunity(id))
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .map((opportunity) => ({
          opportunity,
          result: matchOpportunity(state.profile, opportunity),
          readiness: readinessFor(opportunity, state.checklists, state.profile),
        })),
    [state.compareIds, state.profile, state.checklists],
  );

  if (entries.length === 0) {
    return (
      <div className="page">
        <header className="page__header">
          <h1 className="page__title">{t('compare.title')}</h1>
        </header>
        <EmptyState
          icon={<Scale size={28} />}
          title={t('compare.empty.title')}
          body={t('compare.empty.body')}
          action={
            <button type="button" className="button button--primary" onClick={() => onNavigate('matches')}>
              {t('compare.empty.cta')}
            </button>
          }
        />
      </div>
    );
  }

  const rows: Row[] = [
    {
      key: 'match',
      label: t('compare.row.match'),
      values: entries.map(({ result }) => `${result.score}%`),
    },
    {
      key: 'category',
      label: t('compare.row.category'),
      values: entries.map(({ opportunity }) => t(`category.label.${opportunity.category}`)),
    },
    {
      key: 'education',
      label: t('compare.row.education'),
      values: entries.map(({ opportunity }) =>
        opportunity.educationLevels.map((level) => t(`education.${level}`)).join(', '),
      ),
    },
    {
      key: 'location',
      label: t('compare.row.location'),
      values: entries.map(({ opportunity }) =>
        opportunity.locations.includes(ALL_INDIA)
          ? t('detail.allIndia')
          : opportunity.locations
              .map((code) => {
                const label = getStateLabel(code);
                return label ? pick(label, language) : code;
              })
              .join(', '),
      ),
    },
    {
      key: 'income',
      label: t('compare.row.income'),
      values: entries.map(({ opportunity }) => pick(opportunity.income.label, language)),
    },
    {
      key: 'special',
      label: t('compare.row.special'),
      values: entries.map(({ opportunity }) =>
        opportunity.specialConditions.length === 0
          ? t('detail.noSpecial')
          : opportunity.specialConditions.map((condition) => t(`condition.${condition.kind}`)).join(', '),
      ),
    },
    {
      key: 'documents',
      label: t('compare.row.documents'),
      values: entries.map(({ opportunity }) =>
        t('compare.documentsValue', { count: opportunity.requiredDocuments.length }),
      ),
    },
    {
      key: 'readiness',
      label: t('compare.row.readiness'),
      values: entries.map(({ readiness }) => `${readiness.score}%`),
    },
    {
      key: 'deadline',
      label: t('compare.row.deadline'),
      values: entries.map(({ opportunity }) =>
        opportunity.deadline ? formatDate(opportunity.deadline, language) : t('common.verifyOnPortal'),
      ),
    },
    {
      key: 'verify',
      label: t('compare.row.verify'),
      values: entries.map(({ result }) => t('compare.verifyValue', { count: result.needsVerification.length })),
    },
  ];

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">{t('compare.title')}</h1>
        <p className="page__lead">{t('compare.subtitle')}</p>
      </header>

      {/* Wide screens: a real table, which is the honest semantic for this data. */}
      <div className="compare-table-wrap">
        <table className="compare-table">
          <caption className="sr-only">{t('compare.tableCaption')}</caption>
          <thead>
            <tr>
              <th scope="col">{t('compare.row.match')}</th>
              {entries.map(({ opportunity }) => (
                <th scope="col" key={opportunity.id}>
                  <span className="compare-table__name">{pick(opportunity.name, language)}</span>
                  <button
                    type="button"
                    className="icon-button icon-button--small"
                    onClick={() => toggleCompare(opportunity.id)}
                    aria-label={t('compare.remove', { name: pick(opportunity.name, language) })}
                  >
                    <X aria-hidden="true" size={16} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <th scope="row">{row.label}</th>
                {row.values.map((value, index) => (
                  <td key={`${row.key}-${entries[index].opportunity.id}`}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Narrow screens: one readable card per opportunity instead of a table
          that would need horizontal scrolling to make any sense. */}
      <div className="compare-cards">
        {entries.map(({ opportunity }, index) => (
          <article className="compare-card" key={opportunity.id}>
            <div className="compare-card__head">
              <h2 className="compare-card__name">{pick(opportunity.name, language)}</h2>
              <button
                type="button"
                className="icon-button icon-button--small"
                onClick={() => toggleCompare(opportunity.id)}
                aria-label={t('compare.remove', { name: pick(opportunity.name, language) })}
              >
                <X aria-hidden="true" size={16} />
              </button>
            </div>
            <dl className="compare-card__list">
              {rows.map((row) => (
                <div className="compare-card__row" key={row.key}>
                  <dt>{row.label}</dt>
                  <dd>{row.values[index]}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      <div className="page__actions">
        <button type="button" className="button button--ghost" onClick={() => onNavigate('matches')}>
          {t('compare.empty.cta')}
        </button>
      </div>
    </div>
  );
}
