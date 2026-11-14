const SW_VERSION = 'tmi-sw-2026-09-20-v6';
const CACHE_NAME = 'tmi-shell-v6';
const STATIC_ASSETS = ['/og-image.jpg', '/favicon.ico'];


function isCacheableStaticAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf)$/.test(pathname);
}


function isMediaRequest(request, pathname) {
  if (request.headers.has('range')) return true;
  if (request.destination === 'video' || request.destination === 'audio') return true;
  return /\.(mp4|webm|mov|m4v|mp3|wav|ogg|aac|m3u8)(\n?.*)?$/i.test(pathname);
}


self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => undefined)
  );
  self.skipWaiting();
});


self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => (key.startsWith('tmi-shell-') || key.startsWith('tmi-')) && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then((clients) => {
        for (const client of clients) {
          client.postMessage({
            type: 'TMI_SW_ACTIVATED',
            version: SW_VERSION,
          });
        }
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'TMI_SW_SKIP_WAITING') {
    self.skipWaiting();
    return;
  }


  if (event.data?.type === 'TMI_SW_GET_VERSION') {
    event.source?.postMessage({
      type: 'TMI_SW_VERSION',
      version: SW_VERSION,
    });
  }
});


self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // CRITICAL: never intercept page navigations
  if (event.request.mode === 'navigate') return;


  const url = new URL(event.request.url);


  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (isMediaRequest(event.request, url.pathname)) return;


  // CRITICAL: Never intercept Next.js static asset chunks (_next/static).
  // Next.js content-hashed assets are already immutable and managed properly by browser HTTP cache.
  if (url.pathname.startsWith('/_next/static/')) return;


  if (!isCacheableStaticAsset(url.pathname)) return;


  // Network-First with Cache Fallback for general static assets
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, clone))
            .catch(() => undefined);
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || new Response('', { status: 503 }))
      )
  );
});

