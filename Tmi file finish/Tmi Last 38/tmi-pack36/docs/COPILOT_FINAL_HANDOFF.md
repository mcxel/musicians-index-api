# COPILOT_FINAL_HANDOFF.md
## The Complete Wiring Instruction — Everything Claude Built
### BerntoutGlobal LLC / The Musician's Index

Paste this to Copilot to start wiring. Read Pack 29 wiring order first.

---

```
COPILOT — TMI PLATFORM COMPLETE WIRING HANDOFF

Read first:
  docs/system/PACK29_SAFE_WIRING_ORDER.md  ← 9 slices, wiring order
  docs/MASTER_PLATFORM_MAP.md              ← complete platform reference
  docs/pack36-README.md                    ← Pack 36 new systems

WHAT CLAUDE BUILT (230+ files, 11 packs):
  Pack 25  → API contracts, Prisma 49+ models, WebSocket, Stripe
  Pack 26  → Owner finance (Marcel + Jay Paul PayPal), go-live signoff
  Pack 27  → Import order, conflict matrix, smoke tests
  Pack 28  → UI design system from PDF images, 8 homepage belts
  Pack 29  → File placement, state machines, RBAC, 9-slice wiring order
  Pack 30  → Pre-flight, shell commands, rollback per slice
  Pack 31  → 6 corrupted file fixes + 98 scaffold pages
  Pack 32  → Full homepage (all belts), magazine entry, registries
  Pack 33  → Tier engine, page zones, freshness, coaching, 4 chains
  Pack 34  → Core components, API stubs, Admin HUD, beats, hall of fame
  Pack 35  → Home 4 (Advertisers), WorldSwitcher [1][2][3][4], bot orchestrator
  Pack 36  → Venue system, game registry, scoring engine, item economy, registry

PLATFORM STRUCTURE:
  Home 1 (/)          → Magazine Cover + Crown + Weekly Cyphers
  Home 2 (/editorial) → Magazine Dashboard + Editorial/Discovery/Marketplace Belts
  Home 3 (/lobby)     → Live World + Lobby Wall + Cypher Arena
  Home 4 (/advertise) → Advertisers & Sponsors World

CORE SYSTEMS NOW DEFINED:
  WorldSwitcher [1][2][3][4]        → apps/web/src/components/hud/
  Platform Registry (worlds/routes) → apps/web/src/config/platform-registry.ts
  Scene Registry (18 scenes)        → apps/web/src/config/scene-registry.ts
  Bot Registry (35 bots)            → apps/web/src/config/bot-registry.ts
  Pipeline Registry (9 pipelines)   → apps/api/src/config/pipeline-registry.ts
  Tier Engine (6 tiers)             → apps/web/src/systems/tiers/tier-engine.ts
  Page Zone Registry (30+ zones)    → apps/web/src/config/page-zone-registry.ts
  Freshness Engine                  → apps/api/src/engines/freshness-engine.ts
  Earnings Coaching Engine (10 notes) → coaching/earnings-coaching-engine.ts
  Game Registry (9 games)           → apps/web/src/config/game-registry.ts
  Scoring Engine                    → apps/api/src/modules/scoring/scoring-engine.ts
  Item Economy                      → apps/api/src/modules/economy/item-economy.ts
  Venue Engine                      → apps/api/src/modules/venues/venue-engine.ts
  Bot Orchestrator                  → apps/api/src/bots/bot-orchestrator.ts

PERMANENT LAWS (never change):
  1. Discovery-first: 0 viewers = position 1 in lobby ALWAYS
  2. Diamond: Marcel Dickens (berntmusic33@gmail.com) + B.J. M Beat's — permanent
  3. Kids only talk to kids (canSendMessage middleware)
  4. Max 8 tickets per event per buyer
  5. Owner payouts from NET PROFIT only
  6. #0D0520 background, Bebas Neue headers, cyan/gold/pink — NO generic SaaS
  7. GET /api/ads/slot/:id ALWAYS returns 200
  8. Party persists when members enter/exit rooms
  9. Article pages ALWAYS link to artist station
  10. "Stations" not "Channels" everywhere
  11. Coaching sticky notes on artist dashboard
  12. No system breaks another system — isolated modules
  13. Pages > 5 zones → create child routes
  14. Artist articles auto-create on profile completion
  15. Freshness engine prevents repeat content on same surface

WIRING PRIORITY ORDER:
  Slice 0: Prisma migration (all models)
  Slice 1: Design system components
  Slice 2: AdRenderer + house ads (always 200)
  Slice 3: Homepage belt system → pnpm test:discovery MUST PASS HERE
  Slice 4: Editorial system
  Slice 5: Party lobby
  Slice 6: Games engine
  Slice 7: Advertiser self-serve
  Slice 8: Stream & Win + Scenes
  Slice 9: Final proof → pnpm test:smoke

  Then wire: WorldSwitcher into all 4 home pages
  Then wire: Games routes (dirty-dozens, deal-or-feud, cypher)
  Then wire: Venue pages with host/cohost/DJ/lighting/seating
  Then wire: Scoring engine to game rooms
  Then wire: Item economy + avatar store
  Then wire: Ticket system

RULES:
  - Smallest safe patch, one slice at a time
  - pnpm test:discovery must pass after Slice 3
  - typecheck after every slice
  - No invented file paths — use PACK29_REPO_FILE_PLACEMENT_MAP.md
  - No touching LOCKED files (middleware.ts, auth/*, CI.yml)

"This is your stage, be original." — BerntoutGlobal LLC
```
