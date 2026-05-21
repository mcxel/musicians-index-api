// public/sw.js — Service Worker for PWA
// Handles offline fallback, background sync, push notifications

const CACHE_NAME = "tmi-v1";
const OFFLINE_URL = "/offline";
const PRECACHE = [
  "/",
  "/offline",
  "/icons/icon-192.png",
  "/audio/ui/notification.mp3",
  "/standby/test-pattern.png",
];

// ── INSTALL ────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// ── ACTIVATE ──────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── FETCH ─────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // Skip API calls and WebSockets
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/") || url.protocol === "ws:") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful page responses
        if (response.ok && event.request.destination === "document") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline fallback
        return caches.match(event.request) ||
          caches.match(OFFLINE_URL) ||
          new Response("Offline", { status: 503 });
      })
  );
});

// ── PUSH NOTIFICATIONS ────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-72.png",
    image: data.imageUrl,
    data: { url: data.actionUrl || "/" },
    vibrate: [200, 100, 200],
    actions: [
      { action: "open", title: "Open" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ── NOTIFICATION CLICK ────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
