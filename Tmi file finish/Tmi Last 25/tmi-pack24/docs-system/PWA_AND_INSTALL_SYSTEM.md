# PWA_AND_INSTALL_SYSTEM.md
## Progressive Web App — Install TMI on Any Device
### BerntoutGlobal XXL / The Musician's Index

---

## PWA CONFIGURATION

```json
// public/manifest.json
{
  "name": "The Musician's Index",
  "short_name": "TMI",
  "description": "Discovery-first live digital music magazine",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#FF6B00",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [
    { "src": "/screenshots/lobby.png", "sizes": "1280x720", "type": "image/png" }
  ],
  "categories": ["music", "entertainment"],
  "lang": "en-US"
}
```

---

## SERVICE WORKER

```
Cache strategy by content type:
- App shell (layout, fonts): Cache First
- API responses: Network First with 30s cache fallback
- Media (thumbnails, posters): Cache First with 7-day expiry
- Live room data: Network Only (always fresh)
```

Service worker managed by `next-pwa` or custom workbox config.

---

## PWA INSTALL PROMPT

Show `PWAInstallPrompt` component when:
- Browser fires `beforeinstallprompt` event
- User has visited at least 2 pages
- User has NOT previously dismissed
- User has NOT previously installed

Position: Bottom of screen, dismissable.
CTA: "Add to Home Screen — One-tap access to live music"

---

## iOS SAFARI INSTRUCTIONS

iOS does not support `beforeinstallprompt`.
On iOS, show manual instructions:
"Tap the Share button → Add to Home Screen"
Detect iOS via userAgent and show this guidance.

---

## REQUIRED ASSETS
```
public/manifest.json
public/icons/icon-192.png
public/icons/icon-512.png
public/icons/icon-maskable-512.png
public/screenshots/lobby.png
public/screenshots/room.png
```
