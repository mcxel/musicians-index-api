const CACHE_NAME = 'tmi-shell-v4';
const STATIC_ASSETS = ['/og-image.jpg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // CRITICAL: never intercept page navigations — navigate requests use
  // redirect:'manual' by default, so a server redirect becomes an opaque
  // response that respondWith() can't use → ERR_FAILED for every page load.
  if (event.request.mode === 'navigate') return;

  const url = new URL(event.request.url);

  // Only cache same-origin static file assets
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (!/\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf)$/.test(url.pathname)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(event.request, clone))
              .catch(() => undefined);
          }
          return response;
        })
        .catch(() => new Response('', { status: 503 }));
    })
  );
});
