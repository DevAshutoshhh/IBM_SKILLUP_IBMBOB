import { useEffect, useState } from 'react';
import {
  BarChart3,
  ClipboardList,
  FileCheck2,
  Home,
  Languages,
  Menu,
  Scale,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { LANGUAGES } from '../i18n';
import type { Language, PageId } from '../types';
import { Logo } from './Logo';

interface HeaderProps {
  page: PageId;
  onNavigate: (page: PageId) => void;
  onOpenPrivacy: () => void;
}

const NAV_ITEMS: { page: PageId; labelKey: string; icon: typeof Home }[] = [
  { page: 'home', labelKey: 'nav.home', icon: Home },
  { page: 'dashboard', labelKey: 'nav.dashboard', icon: BarChart3 },
  { page: 'profile', labelKey: 'nav.profile', icon: UserRound },
  { page: 'matches', labelKey: 'nav.matches', icon: Sparkles },
  { page: 'compare', labelKey: 'nav.compare', icon: Scale },
  { page: 'documents', labelKey: 'nav.documents', icon: ClipboardList },
  { page: 'plan', labelKey: 'nav.plan', icon: FileCheck2 },
];

function LanguageToggle() {
  const { language, setLanguage, t } = useAppState();
  return (
    <div className="language-toggle" role="group" aria-label={t('nav.language')}>
      <Languages aria-hidden="true" size={16} className="language-toggle__icon" />
      {LANGUAGES.map((option) => (
        <button
          key={option.code}
          type="button"
          className={`language-toggle__option${language === option.code ? ' is-active' : ''}`}
          onClick={() => setLanguage(option.code as Language)}
          aria-pressed={language === option.code}
          lang={option.htmlLang}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ConnectionStatus() {
  const { t } = useAppState();
  const online = useOnlineStatus();
  return (
    <p className={`connection connection--${online ? 'online' : 'offline'}`}>
      {online ? <Wifi aria-hidden="true" size={14} /> : <WifiOff aria-hidden="true" size={14} />}
      <span>{online ? t('status.online') : t('status.offline')}</span>
    </p>
  );
}

export function Header({ page, onNavigate, onOpenPrivacy }: HeaderProps) {
  const { t, state } = useAppState();
  const [menuOpen, setMenuOpen] = useState(false);

  // Any route change should leave the mobile drawer closed behind it.
  useEffect(() => {
    setMenuOpen(false);
  }, [page]);

  const go = (next: PageId) => {
    onNavigate(next);
    setMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <button type="button" className="brand" onClick={() => go('home')}>
          <Logo size={36} />
          <span className="brand__text">
            <span className="brand__name">{t('app.name')}</span>
            <span className="brand__tagline">{t('app.tagline')}</span>
          </span>
        </button>

        <div className="site-header__meta">
          <ConnectionStatus />
          <LanguageToggle />
          <button type="button" className="button button--ghost button--small" onClick={onOpenPrivacy}>
            <ShieldCheck aria-hidden="true" size={16} />
            {t('nav.privacy')}
          </button>
        </div>

        <button
          type="button"
          className="menu-button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
          <span className="sr-only">{menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}</span>
        </button>
      </div>

      <nav
        id="primary-navigation"
        className={`site-nav${menuOpen ? ' site-nav--open' : ''}`}
        aria-label={t('nav.primary')}
      >
        <ul className="site-nav__list">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isCompare = item.page === 'compare';
            return (
              <li key={item.page}>
                <button
                  type="button"
                  className={`site-nav__link${page === item.page ? ' is-current' : ''}`}
                  onClick={() => go(item.page)}
                  aria-current={page === item.page ? 'page' : undefined}
                >
                  <Icon aria-hidden="true" size={17} />
                  {t(item.labelKey)}
                  {isCompare && state.compareIds.length > 0 ? (
                    <span className="site-nav__count">{state.compareIds.length}</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="site-nav__mobile-meta">
          <LanguageToggle />
          <button type="button" className="button button--ghost button--small" onClick={onOpenPrivacy}>
            <ShieldCheck aria-hidden="true" size={16} />
            {t('nav.privacy')}
          </button>
          <ConnectionStatus />
        </div>
      </nav>
    </header>
  );
}
