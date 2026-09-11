import { useMemo, useState } from 'react';
import { AlertTriangle, FilterX, Scale, Search, SearchX, UserRoundPlus } from 'lucide-react';
import { useAppState, MAX_COMPARE } from '../hooks/useAppState';
import { OPPORTUNITIES, getOpportunity } from '../data/opportunities';
import { matchAll, isProfileUsable } from '../utils/matching';
import { readinessFor } from '../utils/readiness';
import { pick } from '../i18n';
import { OpportunityCard } from '../components/OpportunityCard';
import { OpportunityDetail } from '../components/OpportunityDetail';
import { EmptyState } from '../components/Indicators';
import type { PageId, SupportCategory, SupportType } from '../types';

interface MatchesPageProps {
  onNavigate: (page: PageId) => void;
}

type SortKey = 'match' | 'name' | 'readiness';

const SUPPORT_FILTERS: SupportType[] = [
  'tuition',
  'living_expenses',
  'study_materials',
  'digital_learning',
  'skill_development',
  'internship_career',
];

const CATEGORY_FILTERS: SupportCategory[] = [
  'merit',
  'means',
  'post_matric',
  'women_technical',
  'disability',
  'minority',
  'rural',
  'digital',
  'vocational',
  'internship',
  'higher_education',
  'state_scheme',
];

export function MatchesPage({ onNavigate }: MatchesPageProps) {
  const { t, language, state, toggleBookmark, toggleCompare, selectOpportunity } = useAppState();

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('match');
  const [supportFilter, setSupportFilter] = useState<SupportType[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<SupportCategory[]>([]);
  const [hideConflicts, setHideConflicts] = useState(false);
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const results = useMemo(() => matchAll(state.profile, OPPORTUNITIES), [state.profile]);

  const rows = useMemo(() => {
    const search = query.trim().toLowerCase();

    const decorated = results.map((result) => {
      const opportunity = getOpportunity(result.opportunityId)!;
      return {
        result,
        opportunity,
        readiness: readinessFor(opportunity, state.checklists, state.profile),
      };
    });

    const filtered = decorated.filter(({ opportunity, result }) => {
      if (bookmarkedOnly && !state.bookmarks.includes(opportunity.id)) return false;
      if (hideConflicts && result.conflicts.length > 0) return false;
      if (supportFilter.length > 0 && !supportFilter.some((type) => opportunity.supportTypes.includes(type))) {
        return false;
      }
      if (categoryFilter.length > 0 && !categoryFilter.includes(opportunity.category)) return false;
      if (search) {
        const haystack = [
          pick(opportunity.name, language),
          pick(opportunity.provider, language),
          pick(opportunity.description, language),
          opportunity.tags.join(' '),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });

    const sorted = [...filtered];
    if (sort === 'name') {
      sorted.sort((a, b) => pick(a.opportunity.name, language).localeCompare(pick(b.opportunity.name, language)));
    } else if (sort === 'readiness') {
      sorted.sort((a, b) => b.readiness.score - a.readiness.score || b.result.score - a.result.score);
    }
    return sorted;
  }, [
    results,
    query,
    sort,
    supportFilter,
    categoryFilter,
    hideConflicts,
    bookmarkedOnly,
    state.bookmarks,
    state.checklists,
    state.profile,
    language,
  ]);

  const activeFilterCount =
    supportFilter.length + categoryFilter.length + (hideConflicts ? 1 : 0) + (bookmarkedOnly ? 1 : 0);

  const resetFilters = () => {
    setQuery('');
    setSupportFilter([]);
    setCategoryFilter([]);
    setHideConflicts(false);
    setBookmarkedOnly(false);
  };

  const detailOpportunity = detailId ? getOpportunity(detailId) ?? null : null;
  const detailResult = detailId ? results.find((item) => item.opportunityId === detailId) ?? null : null;

  const handleSelect = (id: string) => {
    selectOpportunity(id);
    onNavigate('documents');
  };

  const toggleIn = <T,>(list: T[], value: T, setter: (next: T[]) => void) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  if (!isProfileUsable(state.profile)) {
    return (
      <div className="page">
        <header className="page__header">
          <h1 className="page__title">{t('matches.title')}</h1>
        </header>
        <EmptyState
          icon={<UserRoundPlus size={28} />}
          title={t('matches.emptyProfile.title')}
          body={t('matches.emptyProfile.body')}
          action={
            <button type="button" className="button button--primary" onClick={() => onNavigate('profile')}>
              {t('matches.emptyProfile.cta')}
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">{t('matches.title')}</h1>
        <p className="page__lead">{t('matches.subtitle')}</p>
        <p className="notice notice--warning">
          <AlertTriangle aria-hidden="true" size={18} />
          {t('matches.demoNotice')}
        </p>
      </header>

      <div className="toolbar">
        <div className="toolbar__search">
          <label className="field__label" htmlFor="opportunity-search">
            {t('matches.search.label')}
          </label>
          <div className="input-with-icon">
            <Search aria-hidden="true" size={18} />
            <input
              id="opportunity-search"
              type="search"
              className="input"
              value={query}
              placeholder={t('matches.search.placeholder')}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="toolbar__sort">
          <label className="field__label" htmlFor="opportunity-sort">
            {t('matches.sort.label')}
          </label>
          <select
            id="opportunity-sort"
            className="select"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
          >
            <option value="match">{t('matches.sort.match')}</option>
            <option value="name">{t('matches.sort.name')}</option>
            <option value="readiness">{t('matches.sort.readiness')}</option>
          </select>
        </div>
      </div>

      <section className="filters" aria-labelledby="filters-heading">
        <div className="filters__head">
          <h2 className="filters__title" id="filters-heading">
            {t('matches.filter.title')}
          </h2>
          {activeFilterCount > 0 ? (
            <button type="button" className="button button--ghost button--small" onClick={resetFilters}>
              <FilterX aria-hidden="true" size={15} />
              {t('matches.filter.reset')}
            </button>
          ) : null}
        </div>

        <fieldset className="filters__group">
          <legend className="filters__legend">{t('matches.filter.support')}</legend>
          <div className="chip-row">
            {SUPPORT_FILTERS.map((type) => (
              <button
                key={type}
                type="button"
                className={`filter-chip${supportFilter.includes(type) ? ' is-active' : ''}`}
                aria-pressed={supportFilter.includes(type)}
                onClick={() => toggleIn(supportFilter, type, setSupportFilter)}
              >
                {t(`support.${type}`)}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="filters__group">
          <legend className="filters__legend">{t('matches.filter.category')}</legend>
          <div className="chip-row">
            {CATEGORY_FILTERS.map((category) => (
              <button
                key={category}
                type="button"
                className={`filter-chip${categoryFilter.includes(category) ? ' is-active' : ''}`}
                aria-pressed={categoryFilter.includes(category)}
                onClick={() => toggleIn(categoryFilter, category, setCategoryFilter)}
              >
                {t(`category.label.${category}`)}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="filters__toggles">
          <label className="switch">
            <input
              type="checkbox"
              checked={hideConflicts}
              onChange={(event) => setHideConflicts(event.target.checked)}
            />
            <span>{t('matches.filter.hideConflicts')}</span>
          </label>
          <label className="switch">
            <input
              type="checkbox"
              checked={bookmarkedOnly}
              onChange={(event) => setBookmarkedOnly(event.target.checked)}
            />
            <span>{t('matches.filter.bookmarkedOnly')}</span>
          </label>
        </div>
      </section>

      <div className="results-bar">
        <p className="results-bar__count" role="status">
          {t('matches.count', { shown: rows.length, total: OPPORTUNITIES.length })}
        </p>
        {state.compareIds.length > 0 ? (
          <button type="button" className="button button--secondary button--small" onClick={() => onNavigate('compare')}>
            <Scale aria-hidden="true" size={16} />
            {t('matches.compare.open', { count: state.compareIds.length })}
          </button>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={<SearchX size={28} />}
          title={t('matches.empty.title')}
          body={t('matches.empty.body')}
          action={
            <button type="button" className="button button--primary" onClick={resetFilters}>
              {t('matches.filter.reset')}
            </button>
          }
        />
      ) : (
        <div className="results-grid">
          {rows.map(({ opportunity, result, readiness }) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              result={result}
              readiness={readiness}
              bookmarked={state.bookmarks.includes(opportunity.id)}
              comparing={state.compareIds.includes(opportunity.id)}
              compareDisabled={state.compareIds.length >= MAX_COMPARE}
              selected={state.selectedOpportunityId === opportunity.id}
              onToggleBookmark={toggleBookmark}
              onToggleCompare={toggleCompare}
              onOpenDetail={setDetailId}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      <OpportunityDetail
        opportunity={detailOpportunity}
        result={detailResult}
        open={detailId !== null}
        onClose={() => setDetailId(null)}
        onSelect={(id) => {
          setDetailId(null);
          handleSelect(id);
        }}
      />
    </div>
  );
}
