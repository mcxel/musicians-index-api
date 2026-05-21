# COPILOT_PACK32_WIRING.md
## Pack 32 — Copilot Wiring Instructions
### BerntoutGlobal XXL / The Musician's Index

---

```
COPILOT — PACK 32 WIRING

After Blackbox places Pack 32 files, wire these specific things.

READ FIRST:
  docs/system/PACK29_SAFE_WIRING_ORDER.md  (follow slice order)
  docs/pack28/design-system/TMI_UI_DESIGN_SYSTEM.md (visual reference)
  docs/system/CHAIN_INVENTORY.md (chain references)

WIRE 1 — HOMEPAGE → MAGAZINE CHAIN
  1. Magazine Jump Star onClick → router.push('/magazine')
  2. Section jump chips: scrollTo anchors OR route navigation
  3. Lobby wall: GET /api/rooms?sort=viewers_asc (discovery-first — CRITICAL)
  4. Countdown timer: connects to /api/home/composition (BELT_TRENDS → WORLD_PREMIERES)
  5. News ticker: GET /api/editorial?category=music_news&limit=4&maxAgeHours=2
  6. Top 10 Charts: GET /api/seasons/current/rankings?limit=10
  7. Belt ad slots: each renders <AdRenderer slotId="[slotId]" />

  Proof: 
    - Click magazine star → /magazine loads with "Welcome" headline
    - Lobby wall shows artists sorted by viewers ascending
    - pnpm test:discovery PASSES

WIRE 2 — MAGAZINE ENTRY SCENE
  1. "Welcome to The Musician's Index Magazine" fades in on mount
  2. Featured Performer: GET /api/editorial?featured=true → first result
  3. News Billboard: GET /api/editorial?category=music_news&limit=4
  4. Section cards link to correct magazine sub-routes

  Proof: /magazine loads with real editorial data from API

WIRE 3 — ARTICLE → STATION LINK (CRITICAL RULE)
  Every article page MUST include:
    const { artistSlug } = article.author;  // from GET /api/editorial/[slug]
    <Link href={`/stations/${artistSlug}`}>📻 VIEW STATION</Link>
    <Link href={`/profile/artist/${artistSlug}`}>👤 VIEW PROFILE</Link>

  This must work for EVERY article, not just one.
  Proof: Open any article → station link visible → clicking opens station

WIRE 4 — DESIGN TOKENS
  Replace all hardcoded hex colors in pages with TMI design tokens:
    import { TMI } from '@/config/design-tokens';
    style={{ background: TMI.colors.void }}  instead of "#0D0520"
  Do NOT change visual output — just make it token-driven.

WIRE 5 — SCENE SYSTEM (minimal first wire)
  Add to room pages:
    import { getScene } from '@/config/scene-registry';
    const scene = getScene(room.sceneId);
    background: scene.background

  Start with Arena room only. Wire other room types in later slices.

VISUAL LAWS (always check after wiring):
  - Background: #0D0520 everywhere
  - Font: Bebas Neue for headers, Oswald for labels, Inter for body
  - No white backgrounds, no generic SaaS look
  - Coaching sticky notes on artist dashboard
  - "Stations" not "Channels"
  - Article pages always link to station

PROOF AFTER EACH WIRE:
  pnpm -C apps/web typecheck
  pnpm test:discovery  (CRITICAL — must pass)
  Visual check: backgrounds are dark, fonts are Bebas/Oswald/Inter
```
