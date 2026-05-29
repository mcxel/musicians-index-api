const CACHE_NAME = 'tmi-shell-v3';
const CORE_ASSETS = ['/', '/home/1', '/og-image.jpg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => undefined)
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

  const url = new URL(event.request.url);

  // Don't intercept third-party requests or API routes — let them go to network
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => undefined);
          }
          return response;
        })
        .catch(() =>
          caches.match('/home/1').then(
            (fallback) => fallback ?? new Response('Service temporarily unavailable', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' },
            })
          )
        );
    })
  );
});
