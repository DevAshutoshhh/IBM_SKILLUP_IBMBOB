import { Info } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { Logo } from './Logo';

export function Footer() {
  const { t } = useAppState();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Logo size={30} />
          <div>
            <p className="site-footer__name">{t('app.name')}</p>
            <p className="site-footer__tagline">{t('app.tagline')}</p>
          </div>
        </div>

        <div className="site-footer__notes">
          <p className="site-footer__note">
            <Info aria-hidden="true" size={15} />
            {t('footer.builtFor')}
          </p>
          <p className="site-footer__note">{t('footer.notOfficial')}</p>
          <p className="site-footer__note">
            {t('footer.dataNote')}
          </p>
        </div>

        <p className="site-footer__legal">
          © {year} {t('app.name')} · {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
}
