# ASSET_LIBRARY_MAP.md
# Asset Library Map — Repo-Only Asset Policy
# All assets must live in repo-controlled paths. No Downloads/ paths. No cloud-only blobs.

## Policy

1. No runtime asset references may point to Downloads/, Desktop/, or any OS user folder
2. All images, fonts, icons, and media must be inside the repo
3. External CDN assets are allowed ONLY for sponsor/third-party logos (with explicit fallback)
4. PDFs (visual authority) must be copied into `assets/reference/pdfs/`
5. Brand assets must be in `assets/brand/`
6. On new asset adoption: move to repo → update reference → verify → commit

---

## Repo Asset Folder Structure

```
assets/
├── reference/
│   ├── pdfs/                   — Magazine PDFs (visual authority — all 20 pages)
│   └── mockups/                — Mockup screenshots (inspiration, not authority)
├── brand/
│   ├── logos/                  — TMI, BerntoutGlobal, Berntout Perductions logos
│   ├── wordmarks/              — Wordmark variants (light, dark, neon)
│   └── colors/                 — Brand color swatches (PNG reference)
├── ui/
│   ├── icons/                  — Platform icons (SVG preferred)
│   ├── illustrations/          — Editorial illustrations
│   └── backgrounds/            — Page and section backgrounds
├── magazine/
│   ├── covers/                 — Issue cover images
│   └── spreads/                — Spread layout reference images
├── live/
│   ├── room-backgrounds/       — Live room backdrop options
│   └── stage/                  — Cypher stage visuals
├── games/
│   ├── game-icons/             — Game type icons
│   └── backgrounds/            — Game surface backgrounds
├── admin/
│   └── command-icons/          — Admin control UI icons
└── fonts/
    ├── display/                — TMI display/headline font
    └── body/                   — Body copy font
```

---

## Current PDF Asset Checklist

These PDFs must be present in `assets/reference/pdfs/` before Slice 1:

| File | Description | Priority |
|------|-------------|----------|
| `tmi-magazine-pages-1-10.pdf` (or individual) | Homepage, Admin, Artists, Booking, Billboard, Games | CRITICAL |
| `tmi-magazine-pages-11-20.pdf` (or individual) | Discovery, Stream & Win, Watch Party, Cypher, Archive | CRITICAL |

*(Re-name and place actual PDF files here — confirm exact filenames)*

---

## Brand Asset Checklist

| Asset | Path | Status |
|-------|------|--------|
| TMI primary logo | `assets/brand/logos/tmi-primary.svg` | ❌ Confirm |
| BerntoutGlobal wordmark | `assets/brand/wordmarks/berntoutglobal.svg` | ❌ Confirm |
| Berntout Perductions logo | `assets/brand/logos/berntout-perductions.svg` | ❌ Confirm |
| Diamond badge icon | `assets/ui/icons/diamond-badge.svg` | ❌ Create |
| Neon belt divider | `assets/ui/backgrounds/belt-divider.svg` | ❌ Create |

---

## Font Asset Checklist

| Font | Usage | Path | Status |
|------|-------|------|--------|
| Display / Headline | Belt headers, HUD | `assets/fonts/display/` | ❌ Confirm |
| Body | Article text | `assets/fonts/body/` | ❌ Confirm |

Fonts must have self-hosted fallback — no Google Fonts runtime dependency.

---

## Asset Reference Audit Command

Before each slice, run this to confirm no Downloads/ paths exist in source code:

```bash
grep -r "Downloads/" apps/ packages/ --include="*.ts" --include="*.tsx" --include="*.json" -l
grep -r "Desktop/" apps/ packages/ --include="*.ts" --include="*.tsx" --include="*.json" -l
grep -r "Users/" apps/ packages/ --include="*.ts" --include="*.tsx" --include="*.json" -l
```

All results must be zero before committing any slice.

---

## External Asset Policy (CDN)

External URLs are permitted only for:
- Sponsor logos (sponsor provides URL, must have `onerror` fallback in `<img>`)
- Social media platform icons (well-known CDN only, e.g., Simpleicons, Iconify)

Pattern for safe external image:
```tsx
<img
  src={sponsor.logoUrl}
  alt={sponsor.name}
  onError={(e) => { (e.target as HTMLImageElement).src = '/assets/brand/logos/placeholder-sponsor.svg'; }}
/>
```

Never use `dangerouslySetInnerHTML` with externally fetched content.
