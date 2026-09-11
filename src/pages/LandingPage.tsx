import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Compass,
  FileCheck2,
  Lock,
  PlayCircle,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useTranslation } from '../hooks/useAppState';
import { OPPORTUNITIES } from '../data/opportunities';
import { DOCUMENTS } from '../data/documents';
import type { PageId } from '../types';

interface LandingPageProps {
  onNavigate: (page: PageId) => void;
}

const BENEFITS = [
  { key: 'discovery', icon: Compass },
  { key: 'documents', icon: ClipboardList },
  { key: 'privacy', icon: Lock },
] as const;

const STEPS = [
  { key: 'step1', icon: UserRound },
  { key: 'step2', icon: Search },
  { key: 'step3', icon: ClipboardList },
  { key: 'step4', icon: FileCheck2 },
] as const;

const PRIVACY_POINTS = ['point1', 'point2', 'point3', 'point4'] as const;

export function LandingPage({ onNavigate }: LandingPageProps) {
  const { t } = useTranslation();

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero__inner">
          <div className="hero__main">
            <p className="hero__kicker">{t('app.demoBadge')}</p>
            <h1 className="hero__title">{t('landing.hero.title')}</h1>
            <p className="hero__subtitle">{t('landing.hero.subtitle')}</p>

            <div className="hero__actions">
              <button
                type="button"
                className="button button--primary button--large"
                onClick={() => onNavigate('profile')}
              >
                {t('landing.cta.primary')}
                <ArrowRight aria-hidden="true" size={18} />
              </button>
              <button
                type="button"
                className="button button--secondary button--large"
                onClick={() => onNavigate('matches')}
              >
                <PlayCircle aria-hidden="true" size={18} />
                {t('landing.cta.secondary')}
              </button>
            </div>
          </div>

          <aside className="hero__aside" aria-labelledby="problem-heading">
            <h2 className="hero__aside-title" id="problem-heading">
              {t('landing.hero.problemTitle')}
            </h2>
            <p className="hero__aside-body">{t('landing.hero.problem')}</p>
          </aside>
        </div>

        <dl className="hero__stats">
          <div className="hero__stat">
            <dt>{t('landing.stat.opportunities')}</dt>
            <dd>{OPPORTUNITIES.length}</dd>
          </div>
          <div className="hero__stat">
            <dt>{t('landing.stat.documents')}</dt>
            <dd>{DOCUMENTS.length}</dd>
          </div>
          <div className="hero__stat">
            <dt>{t('landing.stat.data')}</dt>
            <dd>{t('landing.stat.dataValue')}</dd>
          </div>
        </dl>
      </section>

      <section className="section" aria-labelledby="benefits-heading">
        <p className="eyebrow">{t('landing.eyebrow.benefits')}</p>
        <h2 className="section__title" id="benefits-heading">
          {t('landing.benefits.title')}
        </h2>
        <div className="benefits">
          {BENEFITS.map(({ key, icon: Icon }) => (
            <article key={key} className="benefit">
              <Icon aria-hidden="true" size={20} className="benefit__icon" />
              <h3 className="benefit__title">{t(`landing.benefit.${key}.title`)}</h3>
              <p className="benefit__body">{t(`landing.benefit.${key}.body`)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="how-heading">
        <p className="eyebrow">{t('landing.eyebrow.how')}</p>
        <h2 className="section__title" id="how-heading">
          {t('landing.how.title')}
        </h2>
        <ol className="steps">
          {STEPS.map(({ key, icon: Icon }, index) => (
            <li key={key} className="step">
              <span className="step__marker" aria-hidden="true">
                <span className="step__number">{index + 1}</span>
              </span>
              <h3 className="step__title">
                <Icon aria-hidden="true" size={17} />
                {t(`landing.how.${key}.title`)}
              </h3>
              <p className="step__body">{t(`landing.how.${key}.body`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="privacy-band" aria-labelledby="privacy-heading">
        <div className="privacy-band__inner">
          <div className="privacy-band__intro">
            <p className="eyebrow eyebrow--onDark">{t('landing.eyebrow.privacy')}</p>
            <h2 className="privacy-band__title" id="privacy-heading">
              {t('landing.privacy.title')}
            </h2>
            <p className="privacy-band__body">{t('landing.privacy.body')}</p>
          </div>
          <ul className="privacy-band__list">
            {PRIVACY_POINTS.map((point) => (
              <li key={point}>
                <ShieldCheck aria-hidden="true" size={17} />
                <span>{t(`landing.privacy.${point}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="disclaimer-heading">
        <div className="disclaimer">
          <h2 className="disclaimer__title" id="disclaimer-heading">
            <AlertTriangle aria-hidden="true" size={19} />
            {t('landing.disclaimer.title')}
          </h2>
          <p className="disclaimer__body">{t('landing.disclaimer.body')}</p>
        </div>

        <div className="closing-cta">
          <p className="closing-cta__body">{t('landing.closing.body')}</p>
          <button type="button" className="button button--primary button--large" onClick={() => onNavigate('profile')}>
            {t('landing.closing.cta')}
            <ArrowRight aria-hidden="true" size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}
