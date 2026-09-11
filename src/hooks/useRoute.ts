import { useCallback, useEffect, useState } from 'react';
import type { PageId } from '../types';

const PAGES: PageId[] = ['home', 'profile', 'matches', 'compare', 'documents', 'plan', 'dashboard'];

function parseHash(hash: string): PageId {
  const value = hash.replace(/^#\/?/, '').split('?')[0];
  return (PAGES as string[]).includes(value) ? (value as PageId) : 'home';
}

/**
 * Hash routing rather than the History API: GitHub Pages serves this app from
 * a static path with no rewrite rules, so `#/matches` is the only form that
 * survives a page refresh everywhere the app is deployed.
 */
export function useRoute(): { page: PageId; navigate: (page: PageId) => void } {
  const [page, setPage] = useState<PageId>(() =>
    typeof window === 'undefined' ? 'home' : parseHash(window.location.hash),
  );

  useEffect(() => {
    const onHashChange = () => setPage(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((next: PageId) => {
    window.location.hash = `#/${next}`;
    setPage(next);
    // Landing on a new screen at the previous scroll offset is disorienting,
    // and screen-reader users lose their place entirely.
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return { page, navigate };
}
