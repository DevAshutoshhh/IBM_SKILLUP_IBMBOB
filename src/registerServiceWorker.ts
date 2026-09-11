/**
 * Registers the offline service worker.
 *
 * Only in production builds: a service worker caching a dev server's modules
 * makes local development confusing, and the dev server already works offline
 * once loaded.
 */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  if (import.meta.env.DEV) return;

  window.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL || '/';
    navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch(() => {
      // Offline support is an enhancement. If registration fails — an
      // unsupported browser, a file:// origin — the app still works online.
    });
  });
}
