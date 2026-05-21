# BLACKBOX_MASTER_PROMPT.md
## Copy-Paste This to Blackbox — Complete Repo Integration
### BerntoutGlobal XXL / The Musician's Index

---

```
BLACKBOX TASK: TMI Platform Repo Integration

You are integrating scaffold files into the Next.js 14 app router monorepo at:
C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\web\src\app\

CRITICAL RULES:
1. DELETE and RECREATE files — do not append to existing files
2. Each page.tsx must export exactly ONE default React component
3. No code outside component functions
4. Ensure pnpm dev runs without syntax errors
5. Use "Stations" everywhere public-facing, not "Channels"
6. All pages use TMI visual style (dark bg #0D0520, Bebas Neue/Oswald/Inter fonts)
7. Artist article pages MUST link to the artist's Station

STEP 1 — FIX CORRUPTED FILES (Do this first)
Delete and recreate these completely:
  app/onboarding/admin/     → paste fix/onboarding/admin/page.tsx
  app/onboarding/artist/    → paste fix/onboarding/artist/page.tsx
  app/onboarding/fan/       → paste fix/onboarding/fan/page.tsx
  app/dashboard/admin/      → paste fix/dashboard/admin/page.tsx
  app/dashboard/artist/     → paste fix/dashboard/artist/page.tsx
  app/dashboard/fan/        → paste fix/dashboard/fan/page.tsx

STEP 2 — CREATE PROFILE SYSTEM
  app/profile/create/artist/page.tsx
  app/profile/create/fan/page.tsx
  app/profile/artist/[slug]/page.tsx  ← includes station link
  app/profile/fan/[slug]/page.tsx

STEP 3 — CREATE STATIONS SYSTEM (use "Station" not "Channel")
  app/stations/page.tsx
  app/stations/create/page.tsx
  app/stations/[slug]/page.tsx  ← main station hub with nav tabs
  app/stations/[slug]/schedule/page.tsx
  app/stations/[slug]/live/page.tsx
  app/stations/[slug]/archive/page.tsx
  app/stations/[slug]/sponsors/page.tsx
  app/stations/[slug]/advertisers/page.tsx
  app/stations/[slug]/analytics/page.tsx

STEP 4 — CREATE ARTICLE SYSTEM
  app/articles/page.tsx
  app/articles/[slug]/page.tsx  ← MUST include artist station link

STEP 5 — CREATE MAGAZINE
  app/magazine/page.tsx
  app/magazine/latest/page.tsx
  app/magazine/trending/page.tsx
  app/magazine/interviews/page.tsx
  app/editorial/page.tsx

STEP 6 — CREATE LOBBY / LIVE
  app/lobby/page.tsx
  app/lobby/party/page.tsx
  app/lobby/rooms/page.tsx
  app/lobby/room/[id]/page.tsx
  app/live/stage/page.tsx
  app/live/backstage/page.tsx
  app/live/chat/page.tsx
  app/live/replay/page.tsx

STEP 7 — CREATE CONTESTS
  app/contest/page.tsx
  app/contest/[id]/page.tsx
  app/contest/[id]/vote/page.tsx
  app/contest/[id]/leaderboard/page.tsx
  app/contest/[id]/results/page.tsx

STEP 8 — CREATE SPONSORS / ADVERTISERS / ADS / STORES
  app/sponsors/page.tsx
  app/sponsors/local/page.tsx
  app/sponsors/tasks/page.tsx
  app/advertisers/page.tsx
  app/advertisers/dashboard/page.tsx
  app/advertisers/campaigns/page.tsx
  app/advertisers/campaigns/create/page.tsx
  app/ads/page.tsx
  app/ads/create/page.tsx
  app/stores/page.tsx
  app/stores/[slug]/page.tsx

STEP 9 — CREATE EARNINGS / COACHING SYSTEM
  app/dashboard/artist/earnings/page.tsx     ← earnings panel with coaching notes
  app/dashboard/artist/payouts/page.tsx
  app/dashboard/artist/revenue/page.tsx
  app/dashboard/artist/sponsor-tasks/page.tsx
  app/dashboard/artist/analytics/page.tsx
  app/wallet/page.tsx
  app/earnings/page.tsx

STEP 10 — CREATE CLIPS / MEDIA SYSTEM
  app/clips/page.tsx
  app/clips/library/page.tsx
  app/clips/highlights/page.tsx
  app/dashboard/artist/clips/page.tsx
  app/media/page.tsx

STEP 11 — CREATE FUTURE COMMERCE (DISABLED — scaffold only)
  app/store/page.tsx           ← note: feature-flagged OFF
  app/products/[slug]/page.tsx ← note: feature-flagged OFF
  app/library/page.tsx
  app/dashboard/artist/store/page.tsx

STEP 12 — CREATE CONFIGS
  src/config/feature-flags.ts    ← feature flag registry
  src/config/module-registry.ts  ← module registry
  src/config/coaching-rules.ts   ← artist coaching note messages

STEP 13 — TEST
Run in PowerShell from apps/web/:
  Remove-Item -Recurse -Force .next
  pnpm dev

Test URLs:
  http://localhost:3000/onboarding/artist
  http://localhost:3000/dashboard/artist
  http://localhost:3000/stations/test-artist
  http://localhost:3000/articles/test-article
  http://localhost:3000/profile/artist/test-artist

All pages must load without syntax errors.

IMPORTANT RULES:
- Never append code to existing files — always delete and recreate
- Never put code outside a React component function
- Each file has exactly ONE default export
- Artist articles always link to /stations/[artistSlug]
- Use "Station" not "Channel" in all labels and UI
- Feature-flag the store pages but still create them as placeholders
```
