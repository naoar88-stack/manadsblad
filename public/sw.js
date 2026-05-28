/**
 * Service Worker — Månadsblad PWA
 * Strategi:
 *   - App Shell (HTML + JS + CSS): Cache First med bakgrundsuppdatering (Stale-While-Revalidate)
 *   - API-anrop (/api/*): Network First med offline-fallback
 *   - Cloudinary-bilder: Cache First med 30-dagars expiry
 *   - Fonts (Google): Cache First med 1-års expiry
 */

const SHELL_CACHE  = 'manadsblad-shell-v1';
const IMAGE_CACHE  = 'manadsblad-images-v1';
const FONT_CACHE   = 'manadsblad-fonts-v1';

const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
];

// ------------------------------------------------------------------ install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ------------------------------------------------------------------ activate
self.addEventListener('activate', (event) => {
  const CURRENT = new Set([SHELL_CACHE, IMAGE_CACHE, FONT_CACHE]);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !CURRENT.has(k)).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ------------------------------------------------------------------ fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorera non-GET och chrome-extension
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // 1. API-anrop — Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 2. Cloudinary-bilder — Cache First (30 dagar)
  if (url.hostname === 'res.cloudinary.com') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, 30 * 24 * 60 * 60));
    return;
  }

  // 3. Google Fonts — Cache First (1 år)
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(cacheFirst(request, FONT_CACHE, 365 * 24 * 60 * 60));
    return;
  }

  // 4. App Shell (navigations + statiska assets) — Stale-While-Revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// ------------------------------------------------------------------ strategier

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    return new Response(
      JSON.stringify({ error: 'Ingen nätverksanslutning' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function cacheFirst(request, cacheName, maxAgeSeconds) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    const cachedDate = cached.headers.get('sw-cached-at');
    if (cachedDate) {
      const age = (Date.now() - Number(cachedDate)) / 1000;
      if (age < maxAgeSeconds) return cached;
    } else {
      return cached; // ingen datum-header = behåll
    }
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      // Lägg till timestamp-header för expiry-logik
      const headers = new Headers(response.headers);
      headers.set('sw-cached-at', String(Date.now()));
      const clone = new Response(await response.clone().arrayBuffer(), {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
      cache.put(request, clone);
    }
    return response;
  } catch {
    return cached || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  // För navigations: returnera cachad version direkt om offline
  if (cached) return cached;

  const fresh = await fetchPromise;

  // Offline-fallback: returnera cachat index.html för navigations
  if (!fresh && request.mode === 'navigate') {
    return cache.match('/index.html');
  }

  return fresh || new Response('Offline', { status: 503 });
}
