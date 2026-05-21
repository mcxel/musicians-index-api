# THE MUSICIAN'S INDEX — COMPLETE PLATFORM ARCHITECTURE
## 61+ Packs · 400+ Files · Architecture Phase: COMPLETE
## BerntoutGlobal LLC · "This is your stage, be original."

---

## MASTER COMPLETION STATUS

### Architecture Layer (Claude's Role) — 100% COMPLETE
Every engine, schema, type, contract, adapter, component, and doc has been designed.
Blackbox implements the business logic. Copilot wires the API calls.

### What Still Runs on Schedule (Not Claude's Role)
- API business logic: Blackbox
- Stripe webhook handlers: Blackbox
- WebSocket presence: Blackbox
- Bot activation: Blackbox cron
- Final wiring of adapters to real API: Copilot

---

## COMPLETE FILE INDEX BY CATEGORY

### Database
- `packages/db/prisma/schema.prisma` — 55+ models (Packs 37, 43)
- `packages/db/prisma/seed.ts` — Marcel + BJ Diamond + house ads (Pack 48)

### Homepage System (5 Worlds)
- `apps/web/src/app/page.tsx` — Home 1: Live Voting Magazine Cover (Pack 53)
- `apps/web/src/app/editorial/page.tsx` — Home 2: Editorial (Pack 47)
- `apps/web/src/app/lobby/page.tsx` — Home 3: Live World (Pack 47)
- `apps/web/src/app/advertise/page.tsx` — Home 4: Sponsor Tool (Pack 53)
- `apps/web/src/app/world/page.tsx` — Home 5: Advertisers World (Pack 53)

### Homepage Scheduler Engine
- `apps/web/src/engines/homepage/homepageScene.types.ts` (Pack 59)
- `apps/web/src/engines/homepage/homepageScheduler.engine.ts` (Pack 59)
- `apps/web/src/engines/homepage/homepageLoopProfile.ts` (Pack 59)
- `apps/web/src/engines/homepage/homepageInterruptRules.ts` (Pack 59)
- `apps/web/src/engines/homepage/motionPreset.registry.ts` (Pack 59)
- `apps/web/src/components/home/HomePage1Scheduler.tsx` (Pack 59)

### Homepage Feed Adapters
- `apps/web/src/adapters/homepage/genreRankings.adapter.ts` (Pack 59)
- `apps/web/src/adapters/homepage/weeklyCrown.adapter.ts` (Pack 59)
- `apps/web/src/adapters/homepage/magazineSpotlight.adapter.ts` (Pack 59)
- `apps/web/src/adapters/homepage/showcaseInterrupt.adapter.ts` (Pack 59)
- `apps/web/src/adapters/homepage.adapter.ts` (Pack 55)

### Core Engines (Packages)
- `packages/realtime/src/realtime.server.ts` (Pack 38)
- `packages/broadcast-engine/src/broadcast.engine.ts` (Pack 38)
- `packages/scoring-engine/src/scoring.service.ts` (Pack 38)
- `packages/economy-engine/src/economy.service.ts` (Pack 38)
- `packages/venue-engine/src/venue.service.ts` (Pack 38)
- `packages/media-pipeline/src/media.pipeline.ts` (Pack 38, 63)
- `packages/ui-hud/src/ui-hud.engine.ts` (Pack 38)
- `packages/audio-engine/src/audio.engine.ts` (Pack 38)
- `packages/vr-engine/src/WebXRManager.ts` (Pack 39)
- `packages/vr-engine/src/StadiumController.ts` (Pack 39)
- `packages/vr-engine/src/SpatialAudio.ts` (Pack 39)
- `packages/rewards-engine/src/rewards.service.ts` (Pack 43)
- `packages/freshness-engine/src/freshness.engine.ts` (Pack 49)
- `packages/coaching-engine/src/earnings-coaching.engine.ts` (Pack 49)

### System Intelligence
- `packages/orchestrator/src/orchestrator.ts` (Pack 54)
- `packages/events/src/event-bus.ts` (Pack 54)
- `packages/state/src/state-layer.ts` (Pack 54)
- `packages/world-system/src/world-system.ts` (Pack 54)
- `packages/contracts/src/api-contracts.ts` (Pack 55)

### Ranking + Audio + Games
- `apps/web/src/engines/ranking/artistEligibility.engine.ts` (Pack 60)
- `apps/web/src/engines/audio/audioCue.registry.ts` (Pack 60)
- `apps/web/src/engines/games/gameRegistry.ts` (Pack 60)

### Venues + Performers
- `packages/venue-engine/src/venueSkinEngine.ts` (Pack 62) — 20 skins
- `packages/venue-engine/src/performerStage.engine.ts` (Pack 62)

### Live Rooms + Streaming
- `apps/web/src/app/live/[roomId]/page.tsx` (Pack 63)
- `packages/media-pipeline/src/streamPipeline.ts` (Pack 63)

### Economy + Payments
- `packages/economy-core/src/sponsor-slots.ts` (Pack 56)
- `packages/payments/src/commerceSpine.ts` (Pack 64)
- `apps/web/src/app/wallet/page.tsx` (Pack 64)

### Bot System
- `packages/bots-core/src/bot-missions.ts` (Pack 56)
- `apps/api/src/queues/*` + `apps/api/src/bots/*` (Pack 42)

### UI System
- `apps/web/src/components/states/StateComponents.tsx` (Pack 57)
- `apps/web/src/components/hud/GlobalHUD.tsx` (Pack 47)
- `apps/web/src/app/dashboard/artist/page.tsx` (Pack 50)
- `apps/web/src/app/dashboard/fan/page.tsx` (Pack 57)

### Infrastructure
- `infra/docker-compose.yml` (Pack 42)
- `infra/.env.example` (Pack 42)
- `.github/workflows/ci.yml` (Pack 48)
- `public/manifest.json` (Pack 48)

### Docs + Guides
- `FINAL_MERGED_REPO_MANIFEST.md` (Pack 52)
- `MASTER_COMPLETION_CHECKLIST.md` (Pack 58)
- `FINAL_WIRING_GUIDE.md` (Pack 61)
- `COMPLETE_PLATFORM_ARCHITECTURE.md` (Pack 65 — this file)

---

## 15 PLATFORM LAWS — ALL ENFORCED

1. Discovery-first: 0 viewers = position 1 always
2. Marcel + BJ M Beat's: permanent Diamond forever
3. Kids safety: age-gated chat
4. Max 8 tickets per buyer
5. Big Ace approval required for ALL payouts
6. TMI visual identity locked
7. /api/ads/slot always returns 200
8. Rooms stay active even with 0 members
9. Articles must link to station slugs
10. "Stations" not "Channels" everywhere
11. Coaching sticky notes on artist dashboard
12. No circular imports between modules
13. >5 zones = child routes
14. Auto-create article on profile complete
15. Freshness engine prevents content repeats

---

## 20 VENUE SKINS

neon_underground · rooftop_city · stadium_arena · intimate_jazz · digital_studio
cypher_alley · vip_lounge · outdoor_festival · gaming_arena · tv_sound_stage
space_station · retro_80s · sold_out_hall · beach_stage · vinyl_record_shop
black_box_theater · church_gospel · basement_rap · award_show · school_auditorium

---

## 18 ROOM TYPES

LIVE_STAGE · AUDIENCE_ROOM · PREMIUM_FRONT_ROW · WATCH_PARTY · BACKSTAGE
CYPHER_ARENA · LIVE_CIPHER · SPONSOR_LOUNGE · GAME_ROOM · WINNER_HALL
PRIVATE_ROOM · OVERFLOW_SHARD · KARAOKE · COMEDY_STAGE · DANCE_PARTY
OPEN_MIC · LISTEN_PARTY · AFTERPARTY · CREATOR_WORKSHOP

---

## 10 GAME TYPES

DIRTY_DOZENS · DEAL_OR_FEUD_1000 · NAME_THAT_TUNE · LYRIC_BLACKOUT
BEAT_OR_DISS · GENRE_GUESS · ARTIST_TRIVIA · TMI_JEOPARDY
CYPHER_BATTLE · AUDIENCE_CHALLENGE

---

## 5-PAGE HOMEPAGE WORLD ROUTING

| World | Route | Purpose |
|---|---|---|
| 1 | / | Magazine Cover — live voting, crown, genre battles |
| 2 | /editorial | Editorial + Discovery + Marketplace |
| 3 | /lobby | Live World — lobby wall (discovery-first) |
| 4 | /advertise | Sponsor Tool — campaigns, analytics, deals |
| 5 | /world | Advertisers & Sponsors World — public marketplace |

Scheduler runs 8-11 minute loops. Magazine scene: 2-3 minutes.
Artist #1 clip: 5.2-6.8s. Artists 2-10: 2.8-4.2s.

---

## SPONSOR SLOT CAPACITY (LOCKED)

| Tier | Local | Platform | Total | Fee/mo |
|---|---|---|---|---|
| FREE | 6 | 4 | **10** | $0 |
| STARTER | 12 | 8 | **20** | $19.99 |
| PRO | 22 | 18 | **40** | $49.99 |
| GOLD | 35 | 40 | **75** | $99.99 |
| PLATINUM | 50 | 75 | **125** | $199.99 |
| DIAMOND | 90 | 160 | **250** | $499.99 |

---

## CRITICAL GATE — MUST PASS BEFORE DEPLOY

```bash
pnpm test:discovery   # Platform Law #1 — MUST PASS
curl /api/ads/slot/HOME1_HERO   # Must return 200 always (Law #7)
```

*Never deploy without passing these gates.*
