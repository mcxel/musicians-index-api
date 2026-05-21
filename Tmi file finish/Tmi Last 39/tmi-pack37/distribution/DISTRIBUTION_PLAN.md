# TMI DISTRIBUTION CHAIN PLAN
## All Platforms — Web → Mobile → Desktop → TV → Kiosk → Scanner

---

## PLATFORM MATRIX

| Platform | Status | Path | Store |
|---|---|---|---|
| Web (Next.js) | ✅ Running | themusiciansindex.com | N/A |
| PWA | 🔵 Config needed | Same domain | N/A |
| iOS | 🔵 Future | `/distribution/ios/` | App Store |
| Android | 🔵 Future | `/distribution/android/` | Google Play |
| Windows Desktop | 🔵 Future | `/distribution/windows/` | Microsoft Store |
| macOS Desktop | 🔵 Future | `/distribution/mac/` | App Store |
| Apple TV | 🔵 Future | `/distribution/tv/apple/` | tvOS App Store |
| Android TV | 🔵 Future | `/distribution/tv/android/` | Google Play (TV) |
| Roku | 🔵 Future | `/distribution/tv/roku/` | Roku Channel Store |
| Amazon Fire TV | 🔵 Future | `/distribution/tv/amazon/` | Amazon Appstore |
| Kiosk | 🔵 Future | `/distribution/kiosk/` | Self-deploy |
| Scanner | 🔵 Future | `/distribution/scanner/` | Self-deploy |

---

## FOLDER STRUCTURE TO CREATE

```
distribution/
  web/
    pwa/
      manifest.json           — name, icons, display, theme_color
      sw.js                   — service worker for offline
      offline.html            — offline fallback page
    seo/
      sitemap.xml             — all public routes
      robots.txt
      opengraph-defaults.ts
  mobile/
    ios/
      App.xcodeproj/
      Info.plist.template
      AppIcon.appiconset/     — all 20 required icon sizes
      Entitlements.plist
      fastlane/
        Fastfile              — build + TestFlight + App Store
        Appfile
      screenshots/            — 6.7", 6.1", 12.9" required by Apple
    android/
      app/
        build.gradle.template
        AndroidManifest.xml.template
        google-services.json.template
      fastlane/
        Fastfile
        Appfile
      screenshots/            — phone + 7" + 10" tablet
  desktop/
    windows/
      electron.config.js      — or tauri.conf.json
      installer/
      code-signing/README.md
    mac/
      electron.config.js      — or tauri.conf.json
      entitlements.mac.plist
      notarize.js
      code-signing/README.md
  tv/
    apple/
      TVTopShelfExtension/
      App.xcodeproj/
      tvOS.storyboard
    android/
      leanback/              — TV-specific layout
      AndroidManifest.xml.tv
    roku/
      source/
        main.brs
        home.brs
      images/
      manifest
    amazon/
      res/
        layout/activity_main.xml
  kiosk/
    config/
      kiosk.config.json
      allowed-urls.json
    setup/
      chromium-kiosk.sh
      raspberry-pi-setup.sh
    ui/
      kiosk-shell.tsx
  scanner/
    config/
      scanner.config.json
    ui/
      scan-checkin.tsx
      offline-mode.tsx
assets/
  store-listings/
    app-store/
      description-en.txt     — max 4000 chars
      keywords.txt           — max 100 chars
      promotional-text.txt   — max 170 chars
      subtitile.txt          — max 30 chars
    google-play/
      short-description.txt  — max 80 chars
      full-description.txt   — max 4000 chars
    microsoft-store/
      description.txt
    roku-channel/
      description.txt
  screenshots/
    ios/
    android/
    tv/
    desktop/
  icons/
    icon-512.png
    icon-1024.png
    adaptive-icon-foreground.png
    adaptive-icon-background.png
    favicon.ico
    apple-touch-icon.png
```

---

## PWA MANIFEST (Add to web now)

```json
{
  "name": "The Musician's Index",
  "short_name": "TMI",
  "description": "This is your stage, be original.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0D0520",
  "theme_color": "#FFB800",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "categories": ["music", "entertainment", "social"],
  "screenshots": [],
  "shortcuts": [
    { "name": "Live Now", "url": "/lobby", "icons": [{ "src": "/icons/live.png", "sizes": "96x96" }] },
    { "name": "Games", "url": "/games", "icons": [{ "src": "/icons/games.png", "sizes": "96x96" }] }
  ]
}
```

---

## COMPLIANCE CHECKLIST (before store submission)

- [ ] Privacy Policy at /privacy (required by all stores)
- [ ] Terms of Service at /terms
- [ ] Community Guidelines at /community-guidelines
- [ ] Content rating questionnaire (ESRB/PEGI/IARC for games)
- [ ] Age verification for 18+ content
- [ ] COPPA compliance for under-13 users
- [ ] GDPR compliance (EU users)
- [ ] CCPA compliance (California users)
- [ ] Accessibility statement (WCAG 2.1 AA)
- [ ] Refund policy clearly stated
- [ ] Subscription terms clearly stated
- [ ] Data retention policy
- [ ] Cookie policy
- [ ] Support email configured at support@themusiciansindex.com
