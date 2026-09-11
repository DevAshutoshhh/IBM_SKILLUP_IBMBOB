/*
 * SaathiSetu service worker.
 *
 * Goal: after the first visit, the whole guidance workflow — profile, matching,
 * the demonstration dataset, checklists and the action plan — keeps working
 * with no connection at all. Only the outbound links to official portals need
 * the network.
 *
 * Strategy:
 *   - navigations: network first, falling back to the cached app shell, so a
 *     student on a slow connection is never stuck on a browser error page;
 *   - same-origin assets (JS/CSS/icons, which carry the dataset): cache first,
 *     refreshed in the background;
 *   - anything cross-origin: left entirely alone.
 */

const VERSION = 'saathisetu-v1';
const APP_SHELL = `${VERSION}-shell`;
const ASSETS = `${VERSION}-assets`;

// Resolved against the worker's own scope, so this works at a domain root and
// under a GitHub Pages project path without any build-time substitution.
const SHELL_URLS = ['./', './index.html', './manifest.webmanifest', './icons/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL)
      .then((cache) => cache.addAll(SHELL_URLS.map((url) => new URL(url, self.registration.scope).toString())))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request) {
  const cache = await caches.open(APP_SHELL);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const fallback = await cache.match(new URL('./index.html', self.registration.scope).toString());
    if (fallback) return fallback;
    throw new Error('SaathiSetu is offline and no cached copy of the app is available yet.');
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(ASSETS);
  const cached = await cache.match(request);
  if (cached) {
    // Refresh in the background so the next load gets the newer build.
    fetch(request)
      .then((response) => {
        if (response && response.ok) cache.put(request, response.clone());
      })
      .catch(() => undefined);
    return cached;
  }
  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
