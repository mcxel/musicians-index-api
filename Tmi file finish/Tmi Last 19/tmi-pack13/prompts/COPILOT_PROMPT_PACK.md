# COPILOT_PROMPT_PACK.md
## Paste-Ready Prompts for Every Wiring Slice

---

## HOW TO USE THIS
Copy the exact prompt for the current slice.
Paste it to Copilot in VS Code (Chat or Edits).
Do not modify the prompt — the instructions are precise.
After each slice: save proof screenshots, then paste the next slice prompt.

---

## ─────────────────────────────────────────
## SLICE 0 PROMPT — Fix the Build
## ─────────────────────────────────────────

```
Current blocker: apps/web fails to build because @tmi/hud-runtime cannot resolve.
The workspace packages export only dist/*, but dist does not exist during Vercel build.

Fix all three layers:

FIX A — In tmi-platform/apps/web/package.json, add prebuild:
  "prebuild": "pnpm --filter @tmi/hud-core run build && pnpm --filter @tmi/hud-runtime run build && pnpm --filter @tmi/hud-theme run build && pnpm --filter @tmi/hud-tmi run build && pnpm --filter @tmi/contracts run build",
  "build": "next build"

FIX B — In tmi-platform/apps/web/next.config.js, add:
  transpilePackages: ['@tmi/hud-core', '@tmi/hud-runtime', '@tmi/hud-theme', '@tmi/hud-tmi', '@tmi/contracts', '@tmi/core-domain']

FIX C — If still failing, stub tmi-platform/apps/web/src/app/hud/page.tsx:
  export default function HudPage() { return <div>HUD deploying soon.</div>; }

Then run local proof:
  pnpm -C packages/hud-core run build
  pnpm -C packages/hud-runtime run build
  pnpm -C packages/hud-theme run build
  pnpm -C packages/hud-tmi run build
  pnpm -C apps/web run build

Report: files changed, build exit code, whether dist/index.js exists for each HUD package, and any remaining errors.
```

---

## ─────────────────────────────────────────
## SLICE 1 PROMPT — Shared Infrastructure
## ─────────────────────────────────────────

```
Wire the shared infrastructure layer for the homepage system.
Use the specs in tmi-pack12/control-layer/REPO_ROUTES_COMPONENTS.md and tmi-pack13/starter-manifests/STARTER_MANIFEST_FILES.ts.

Create these files:
1. packages/hud-theme/src/motion.tokens.ts — use exact values from STARTER_MANIFEST_FILES.ts
2. packages/platform-kernel/src/feature-flags.ts — use exact values from STARTER_MANIFEST_FILES.ts
3. apps/web/src/config/homepage-belts.config.ts — use exact values from STARTER_MANIFEST_FILES.ts
4. apps/web/src/config/crown.config.ts — use exact values from STARTER_MANIFEST_FILES.ts
5. apps/web/src/config/discovery.config.ts — use exact values from STARTER_MANIFEST_FILES.ts
6. apps/web/src/config/sponsor-rules.config.ts — use exact values from STARTER_MANIFEST_FILES.ts
7. apps/web/src/components/tmi/homepage/HomepageHeader.tsx — props from MASTER_COMPONENT_REGISTRY.md
8. apps/web/src/components/tmi/homepage/HomepagePageStrip.tsx — props from MASTER_COMPONENT_REGISTRY.md
9. apps/web/src/components/tmi/homepage/CornerPeel.tsx — props from MASTER_COMPONENT_REGISTRY.md
10. apps/web/src/components/tmi/canvas/CanvasCard.tsx — base card, draggable, saves position

Rules:
- Follow all 8 editability laws from MASTER_EDITABILITY_RULES.md
- CanvasCard must be draggable via react-draggable
- Card position saves to localStorage for now (DB persistence is Phase 2)
- All animation values must import from motion.tokens.ts
- Do not hardcode any copy or labels in component files

Report: files created, TypeScript compiles, imports resolve.
```

---

## ─────────────────────────────────────────
## SLICE 2 PROMPT — Homepage 1 (Cover)
## ─────────────────────────────────────────

```
Wire Homepage 1 (Magazine Cover) using:
  - tmi-pack11/homepage-system/HOMEPAGE_SYSTEM_COMPLETE.md (layout spec)
  - tmi-pack12/control-layer/REPO_ROUTES_COMPONENTS.md (component specs)
  - tmi-pack12/control-layer/DATA_PROOF_FAILURES_LOGGING_WIRING.md (data sources)
  - tmi-pack13/types-contracts/TYPES_AND_CONTRACTS_STARTER.ts (TypeScript types)

Create these files:
1. apps/web/src/app/(magazine)/page.tsx — Homepage 1 shell
2. apps/web/src/components/tmi/crown/CrownCard.tsx — center #1 card
3. apps/web/src/components/tmi/crown/ArtistRingCard.tsx — #2-10 ring cards
4. apps/web/src/components/tmi/homepage/ComicInsert.tsx — weekly comic corner

Wire:
- CrownCard fetches from GET /api/crown/current
- ArtistRingCard fetches from GET /api/rankings/top10
- ComicInsert fetches from GET /api/issues/current/comic-insert
- Page uses HomepageHeader, HomepagePageStrip, CornerPeel from Slice 1
- All fallback states from FAILURE_STATE_AND_FALLBACK_MATRIX.md

Crown API (create stub if not exists):
- GET /api/crown/current → returns CrownState type from contracts
- GET /api/rankings/top10 → returns ArtistRankEntry[] sorted by rankNumber

Proof gate: run HOMEPAGE_PROOF_GATES.md section "Homepage 1" and confirm all pass.
Report: files created, proof gates passed, any failures.
```

---

## ─────────────────────────────────────────
## SLICE 3 PROMPT — Homepage 2 (Live World)
## ─────────────────────────────────────────

```
Wire Homepage 2 (Live World) using specs in tmi-pack11 and tmi-pack12.

Create:
1. apps/web/src/app/(magazine)/live/page.tsx — Homepage 2 shell
2. apps/web/src/components/tmi/live/PreviewLobbyCard.tsx — main large lobby card
3. apps/web/src/components/tmi/live/LobbyWall.tsx — 8-grid of artist thumbnails
4. apps/web/src/components/tmi/live/JoinRandomRoom.tsx — star button
5. apps/web/src/components/tmi/live/CountdownCard.tsx — world premieres countdown
6. apps/web/src/components/tmi/discovery/UndiscoveredBoostCard.tsx — lowest-view artist
7. apps/web/src/components/tmi/live/CypherArenaGateway.tsx — cypher link button
8. apps/web/src/components/tmi/stream/StreamAndWinCard.tsx — score strip

CRITICAL RULE: LobbyWall MUST sort by viewers_ascending (0 viewers = position 1).
This rule is in DISCOVERY_CONFIG and CANNOT be changed.

API stubs needed:
- GET /api/live/featured → PreviewLobbyEntry (most viewed currently live)
- GET /api/live/all?sort=viewers_asc → PreviewLobbyEntry[] ascending by viewerCount
- GET /api/events/premiere/next → WorldPremiereEvent
- GET /api/discovery/boost-artist → PreviewLobbyEntry (lowest viewerCount)

Standby mode: if GET /api/live/all returns empty array, show standby state with message "No artists live right now" and upcoming events link.

Proof gate: run HOMEPAGE_PROOF_GATES.md section "Homepage 2" — especially verify least-viewed-first sorting.
```

---

## ─────────────────────────────────────────
## SLICE 4 PROMPT — Homepage 3 (Editorial)
## ─────────────────────────────────────────

```
Wire Homepage 3 (Editorial + Discovery + Marketplace) using tmi-pack11 and tmi-pack12.

Create:
1. apps/web/src/app/(magazine)/editorial/page.tsx — Homepage 3 shell
2. apps/web/src/components/tmi/editorial/ArticleFeatureCard.tsx
3. apps/web/src/components/tmi/editorial/NewsTicker.tsx — scrolling headlines
4. apps/web/src/components/tmi/editorial/TopTenCharts.tsx — ranked list
5. apps/web/src/components/tmi/discovery/GenreCluster.tsx — hexagon grid
6. apps/web/src/components/tmi/sponsor/SponsorSpotlightCard.tsx + fallback
7. apps/web/src/components/tmi/shared/BookingCard.tsx
8. apps/web/src/components/tmi/shared/StoreCard.tsx
9. apps/web/src/components/tmi/shared/AchievementsCard.tsx

Wire sponsor fallback: if no active campaign, show house ad from /api/sponsors/fallback.
SponsorSpotlightCard must enforce sponsor-rules.config.ts: no audio, max 8s animation, fallback to house ad.

Genre hexagons: clicking Hip Hop → navigate to /genres/hip-hop

Proof gate: run HOMEPAGE_PROOF_GATES.md section "Homepage 3" — verify genres navigate, sponsor fallback renders, charts are not placeholder.
```

---

## ─────────────────────────────────────────
## SLICE 5 PROMPT — Auth + Onboarding
## ─────────────────────────────────────────

```
Wire authentication and onboarding using tmi-pack10/release-control/DEPLOY_AND_ONBOARDING_PACKS.md.

Prove:
1. POST /api/auth/register → creates user, returns session
2. POST /api/auth/login → returns session
3. GET /api/auth/session → returns user object
4. Session persists after page refresh
5. Logout → session destroyed, redirect to /login or /
6. Back button after logout → redirects to /login, not broken dashboard
7. Role routing: fan → /dashboard/fan, artist → /dashboard/artist
8. Marcel → /dashboard/analytics-overview (analytics only, no commands)
9. Jay Paul → /dashboard/analytics-overview (view only)
10. Fan cannot access /dashboard/artist (403)
11. Artist onboarding: all 8 steps completable
12. Fan onboarding: genre selection + first event entry

Run FIRST_REAL_ONBOARDING_PACK.md gates 1–6 and confirm all pass.
Save screenshots to /proof/slice-5/.
```

---

## ─────────────────────────────────────────
## SLICE 6 PROMPT — Economy + Points
## ─────────────────────────────────────────

```
Wire the economy layer using tmi-pack9/economy/ECONOMY_ENGINE.md and tmi-pack13/types-contracts/TYPES_AND_CONTRACTS_STARTER.ts.

Create:
- apps/api/src/services/points.service.ts — earn/spend/balance logic
- apps/api/src/services/subscription.service.ts — tier management
- apps/api/src/services/payout.service.ts — earnings ledger
- apps/api/src/services/spin.service.ts — daily spin logic
- apps/web/src/components/tmi/shared/PointsBalance.tsx
- apps/web/src/components/tmi/shared/TierProgressBar.tsx
- apps/web/src/components/tmi/artist/EarningsDashboard.tsx

Wire Stripe with STRIPE_SECRET_KEY from ENV_TEMPLATE_AND_KEYS_MAP.md.

Proof: fan watches 5 min → +10 points in DB → balance widget updates.
Proof: subscription upgrade → user tier changes in DB and UI.
```

---

## ─────────────────────────────────────────
## SLICE 7 PROMPT — Social + Discovery
## ─────────────────────────────────────────

```
Wire social and discovery systems using tmi-pack9/social-discovery/SOCIAL_DISCOVERY_ENGINE.md.

Create:
- apps/api/src/services/follow.service.ts
- apps/api/src/services/search.service.ts
- apps/api/src/services/discovery.service.ts (with discovery-first sort)
- apps/web/src/components/tmi/shared/FollowButton.tsx
- apps/web/src/components/tmi/nav/SearchBar.tsx

Enforce DISCOVERY_CONFIG.sortOrder = 'viewers_ascending'. This cannot be changed.

Proof: fan follows artist → artist follower count +1 → persists after reload.
Proof: search "jazz" → returns artist results with correct discovery ordering.
```

---

## ─────────────────────────────────────────
## SLICE 8 PROMPT — Live Rooms (Basic)
## ─────────────────────────────────────────

```
Wire the Free tier room system using tmi-pack7/free-tier/ROOM_FREE_01_LIVING_ROOM.md.

Start with only the Living Room (ROOM_FREE_01).
Wire:
- Room entry and seat assignment
- Basic crowd animation (Crowd AI, static crowd at < 30 viewers)
- Tier progress bar
- Stream & Win accrual during room session

Feature flags to check before wiring:
  ENABLE_LIVE_ROOMS=false → flip to true for this slice
  ENABLE_AUDIENCE_3D=false → keep false for now
  ENABLE_TIER_TRANSFORMATION=false → keep false for now

Proof: artist goes live → fan joins Living Room → fan sees artist on screen → Stream & Win score increments.
```

---

## ─────────────────────────────────────────
## FINAL PROOF PROMPT — Pre-Launch Checklist
## ─────────────────────────────────────────

```
Run the full launch proof before opening to members.

Verify all proof gates from:
  tmi-pack10/release-control/DEPLOY_AND_ONBOARDING_PACKS.md (8 gates)
  tmi-pack12/control-layer/DATA_PROOF_FAILURES_LOGGING_WIRING.md (homepage gates)

Required screenshots (save to /proof/launch/):
  1. Cloudflare both services green
  2. Homepage 1 loading at live URL
  3. Homepage 2 LobbyWall sorted least-viewers-first
  4. Homepage 3 editorial belt live
  5. Register flow complete
  6. Login + session persist
  7. Artist onboarding complete (8 steps)
  8. Fan onboarding complete
  9. Artist goes live → fan sees in room
  10. Points accumulate during stream

After all 10 screenshots: Big Ace signs off → members invited.
```

---

*Copilot Prompt Pack v1.0 — BerntoutGlobal XXL / The Musician's Index*
*"This is your stage, be original."*
