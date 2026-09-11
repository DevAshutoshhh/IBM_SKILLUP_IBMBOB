import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { translate } from '../i18n';
import type { Language } from '../types';

interface Props {
  children: ReactNode;
  language: Language;
}

interface State {
  error: Error | null;
}

/**
 * A render error in one screen must never take the whole app down and must
 * never destroy what the student has already saved. The boundary keeps
 * localStorage untouched and offers a reload.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surfaced in the browser console only; nothing is reported anywhere.
    if (import.meta.env.DEV) {
      console.error('SaathiSetu render error', error, info.componentStack);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  render(): ReactNode {
    const { error } = this.state;
    const { language, children } = this.props;
    if (!error) return children;

    const t = (key: string) => translate(language, key);

    return (
      <div className="error-boundary" role="alert">
        <div className="error-boundary__card">
          <AlertTriangle aria-hidden="true" className="error-boundary__icon" size={32} />
          <h1>{t('error.title')}</h1>
          <p>{t('error.body')}</p>
          <button type="button" className="button button--primary" onClick={this.handleReload}>
            <RotateCcw aria-hidden="true" size={18} />
            {t('error.reload')}
          </button>
          <details className="error-boundary__details">
            <summary>{t('error.details')}</summary>
            <pre>{error.message}</pre>
          </details>
        </div>
      </div>
    );
  }
}
