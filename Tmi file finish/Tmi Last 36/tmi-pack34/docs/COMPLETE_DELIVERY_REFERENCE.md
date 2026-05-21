# COMPLETE_DELIVERY_REFERENCE.md
## Every File Claude Built — All 9 Packs — With Full Context
### BerntoutGlobal LLC / The Musician's Index

---

## WHAT THIS PLATFORM IS

The Musician's Index (TMI) is a discovery-first live digital music magazine platform.
Not just a website — a full Music Media Ecosystem:

- Magazine platform (editorial, news, interviews, featured performers)
- Creator platform (artist profiles, stations, articles, earnings, coaching)
- Live streaming platform (lobby, rooms, shows, cyphers, battles)
- Contest platform (weekly crown, brackets, leaderboards, hall of fame)
- Sponsorship marketplace (local stores fund local artists)
- Advertising network (self-serve campaigns, slot booking, analytics)
- Creator tools (beats marketplace, booking portal, clip sharing)
- Economy system (tips, fan credits, wallet, payouts, Stream & Win)
- Automation platform (35 bots, 20 pipelines, 8 documented chains)

**Slogan:** "This is your stage, be original."
**Core Law:** Discovery-first — 0 viewers always = position 1 in lobby wall.
**Permanent Diamond:** Marcel Dickens (berntmusic33@gmail.com) + B.J. M Beat's

---

## ALL 9 PACKS — FILE-BY-FILE SUMMARY

### PACK 25 — The Contract Layer (21 files)
Everything Copilot needs to wire backend endpoints without guessing.

| File | What It Contains |
|---|---|
| API_CONTRACTS.md | 15 feature areas: search, notifications, feed, tips, wallet, fan clubs, beats, competitions, seasons, editorial, user settings, ticket anti-bot, family/kid, admin |
| PRISMA_SCHEMA_DELTA.md | 28 new models: Notification, FeedItem, Wallet, Transaction, Payout, Tip, FanClub+tiers, Beat+License, Season, Competition, Battle, RankEntry, SeasonAward, UserSettings, Report, ModerationAction, FamilyAccount, ChildAccount, ParentApproval, UserBlock, UserMute, PushSubscription |
| WEBSOCKET_EVENT_MAP.md | Every real-time event: room:join through room:ended, battle rounds, notifications, season updates, leaderboard, crown transfer, platform:broadcast, ticket queue |
| STRIPE_WIRING_PLAN.md | 8 complete flows with TypeScript code: tip PaymentIntent, fan credit purchase, fan club subscription, beat license, payout onboarding, payout transfer, owner profit distribution, ticket anti-bot |
| FAMILY_KID_SAFETY_RULES.md | canSendMessage() TypeScript function — kid↔kid allowed, adult↔kid blocked at middleware |
| TICKET_ANTI_BOT_RULES.md | 4 layers: Cloudflare Turnstile, Redis velocity, account age check, anomaly scoring |
| + 15 more files | Provider wiring, route audit, env templates, execution matrix, smoke test matrix, all system docs |

### PACK 26 — Owner Finance + Closure (18 files)
The business layer — how Marcel and Jay Paul get paid.

| File | What It Contains |
|---|---|
| OWNER_PROFIT_DISTRIBUTION_SYSTEM.md | Gross → Stripe fees → artist payouts → operating costs = distributable profit |
| OWNER_PAYOUT_CLOSURE_PACK.md | Marcel: berntmusic33@gmail.com PayPal, Jay Paul: configurable destination, PayPal Mass Payout API |
| PLATFORM_REVENUE_VS_PROFIT_LEDGER_SYSTEM.md | Tips 70/30, beats 80/20, tickets 75/25, fan clubs 70/30, sponsor packages 100/0 |
| FINANCIAL_RESERVE_POLICY_SYSTEM.md | $1K minimum launch reserve, $5K target at 6 months |
| REFUND_AND_CHARGEBACK_RESERVE_SYSTEM.md | Refund policy per product type, 7-day chargeback response |
| GO_LIVE_SIGNOFF_PACK.md | 8 sections with checkboxes + Big Ace signature line, owner payout config |
| COPILOT_REPO_MOVE_AND_WIRING_PLAN.md | 10-step plan from Cloudflare fix through owner finance wiring |
| + 11 more files | Readiness matrix, operator mode, visual QA board, tax handoff, reporting |

### PACK 27 — Operational Safeguards (6 files)
The safety layer that prevents broken imports.

| File | What It Contains |
|---|---|
| PACK_INDEX_AND_CHECKSUMS.md | File count verification + 15 critical files that must exist |
| REPO_IMPORT_ORDER.md | 10 phases: docs first, then Prisma, then API, then UI, never root layout |
| FILE_REPLACE_VS_MERGE_MATRIX.md | SAFE REPLACE vs MERGE ONLY vs INSPECT FIRST vs NEVER OVERWRITE |
| ENV_VAR_MASTER_LIST.md | All required vars with fail-fast TypeScript startup check |
| WEBHOOK_SECRET_AND_PROVIDER_CHECKLIST.md | 7 providers: Stripe, Resend, VAPID, Cloudflare, PayPal, Monitoring, ElevenLabs |
| POST_MOVE_SMOKE_TEST_ORDER.md | 8 tiers from automated build to manual admin+owner profit check |

### PACK 28 — Design System + Architecture Expansion (11 files)
The visual identity and platform expansion layer.

| File | What It Contains |
|---|---|
| TMI_UI_DESIGN_SYSTEM.md | Colors (#0D0520, #00E5FF, #FFB800, #FF2D78), Bebas Neue/Oswald/Inter fonts, card styles with neon glow, belt headers, hexagon honeycomb system, LIVE badge with pulse, 8 room scenes |
| HOMEPAGE_COMPOSITION_SYSTEM.md | 8 belt definitions with bot ownership, refresh rates, slot IDs |
| MASTER_MONETIZATION_SYSTEM.md | Global slot registry with pricing across all surfaces |
| PARTY_LOBBY_SYSTEM.md | Persistent social space, 15 WebSocket events, avatar transition rules |
| ROOM_SYSTEM_FAMILY_MAP.md | 12 room types with capacity, purpose, and feature set |
| GAME_ENGINE_SYSTEM.md | 5 game types, Prisma models, ad timing system, Stream & Win integration |
| + 5 more files | Missing systems map, route map, component map, Copilot prompt |

### PACK 29 — Implementation Bridge (13 files)
The exact bridge between architecture and Copilot wiring.

| File | What It Contains |
|---|---|
| PACK29_REPO_FILE_PLACEMENT_MAP.md | Every file with NEW/EDIT/LOCKED/APPEND action + locked files list |
| PACK29_PRISMA_DATA_MODEL_MAP.md | 21 new models: Advertiser, AdCampaign, Party, GameSession, Article, StreamWinScore, etc. |
| PACK29_API_CONTRACTS.md | Exact request/response shapes for all new Pack 28+29 endpoints |
| PACK29_STATE_MACHINES.md | 7 state machines with transitions: Campaign, SlotReservation, SalesCRM, Party, GameSession, Proposal, ArticlePublication |
| PACK29_PERMISSIONS_MATRIX.md | RBAC tables for all 6 new systems |
| PACK29_BOT_AUTOMATION_BOUNDARIES.md | 8 bot profiles with can-do/cannot-do lists |
| PACK29_ACCEPTANCE_TEST_MATRIX.md | 78 checkbox proof gates across all systems |
| PACK29_SAFE_WIRING_ORDER.md | 9 slices (0=Prisma through 9=Final proof), proof gates between each |
| + 5 more files | Seed fixtures, env vars, WebSocket registry, error codes, README |

### PACK 30 — Operational Safety (4 files)
The safety net around Blackbox/Copilot repo work.

| File | What It Contains |
|---|---|
| PACK30_REPO_CONFLICT_CHECKLIST.md | 11 checks before touching anything — build green, branch, no duplicates, Prisma clean, env vars, git tag |
| PACK30_IMPORT_COMMANDS.md | Copy-paste PowerShell for every step: docs move, each of 9 slices, final build |
| PACK30_SLICE_BY_SLICE_ROLLBACK.md | Per-slice rollback + what NOT to roll back + nuclear option |
| README.md | Copilot handoff command to paste |

### PACK 31 — Complete Platform Scaffold (109 files)
The full route structure ready for Blackbox to drop in the repo.

**Fix files (6):** Clean replacements for corrupted onboarding/dashboard pages.
Onboarding (admin/artist/fan): TMI dark styling with coaching-oriented copy.
Dashboard (admin/artist/fan): Full sidebar navigation, earnings cards, coaching sticky notes, quick actions.

**Scaffold files (98):** Every platform route as a working React page.
- Profile system: create artist, create fan, edit, artist public page (with station link), fan public page
- Stations: 10 pages (home with sub-nav, schedule, live, archive, sponsors, advertisers, analytics, store)
- Articles: list + detail (article page has station link pre-built)
- Magazine: 5 pages
- Lobby/live: 7 pages
- Contest: 8 pages
- Sponsors/advertisers/ads/stores: 15 pages
- Earnings/coaching: 8 pages
- Clips/media: 7 pages
- Future commerce: 7 pages (feature-flagged OFF)
- Config files: feature-flags.ts, module-registry.ts, coaching-rules.ts

**Prompt files (4):** Blackbox master prompt, Copilot wiring prompt, Gemini audit prompt, AI workflow guide.

### PACK 32 — Magazine Portal + Systems Layer (12 files)
The visual heart of the platform.

| File | What It Contains |
|---|---|
| magazine/homepage/page.tsx | Full TMI homepage (361 lines) — 6 belts, glowing magazine jump star, 8-tile lobby wall, editorial belt, genre hexagons, countdown timer, advertiser belt, mobile nav |
| magazine/magazine/page.tsx | "Welcome to The Musician's Index Magazine" — fade-in entry, featured performer gateway + station link, news billboard, 6 section cards |
| systems/design-tokens.ts | All colors, fonts, spacing, borders, glows, density presets as TypeScript constants |
| systems/scene-registry.ts | 18 scenes: magazine, station, live-stage, neon-club, game-night, space-dome, etc. |
| systems/bot-registry.ts | 35 bots with schedules, triggers, auto-approve limits, Big Ace requirement |
| systems/pipeline-registry.ts | 9 pipelines with step arrays, retry rules, timeouts |
| systems/component-inventory.ts | 60+ components organized by family |
| systems/chain-inventory.md | 8 chains: Magazine Entry, Artist Growth, Fan Discovery, Sponsor Loop, Live→Clip→Share, Contest→Crown, Advertiser Self-Serve, Owner Profit |
| routes/MASTER_ROUTE_MAP.md | 130+ routes: public, auth, dashboard, admin |
| prompts/BLACKBOX_PACK32_PROMPT.md | 6-step Blackbox integration |
| prompts/COPILOT_PACK32_WIRING.md | 5 specific wires with proof commands |

### PACK 33 — Final Systems Layer (10 files)
The control logic that makes the platform intelligent.

| File | What It Contains |
|---|---|
| tiers/tier-engine.ts | 6 tiers (free→diamond) — every feature gate, limit, discovery weight, ranking boost, permanent Diamond hardcoded |
| placements/page-zone-registry.ts | 30+ zones across homepage/article/live/game/contest — dimensions, pricing, frequency caps |
| engines/freshness-engine.ts | Rotation memory + scoring so same content never repeats too quickly |
| engines/earnings-coaching-engine.ts | 10 contextual coaching notes: sponsor tasks, promotion, local sponsor, earnings, profile |
| chains/ARTIST_CREATION_CHAIN.md | 9-step flow: register → onboard → profile → article auto-create → station → ranking → billing-integrity → coaching |
| chains/ARTICLE_PUBLISH_CHAIN.md | 9-step flow: validate → ad slots → station link injection → magazine rotation → notify |
| chains/LIVE_SHOW_CHAIN.md | 10-step flow: go live → sponsor overlays → viewers → tips → replay → clips → archive → earnings |
| chains/SPONSOR_CAMPAIGN_CHAIN.md | 10-step local sponsor loop: scout → qualify → match → proposal → activate → artist tasks → analytics → renewal |
| docs/MASTER_SYSTEM_INVENTORY.md | Complete status: 33 engines, 20 pipelines, 35 bots, 8 chains, 18 scenes, 6 tiers |

### PACK 34 — Working Components + API Stubs + Admin HUD (this pack)
The actual TSX files Copilot wires into.

| File | What It Contains |
|---|---|
| components/tmi-design/TMILogo.tsx | Linked/unlinked wordmark in 3 sizes |
| components/tmi-design/TMILiveBadge.tsx | Pulsing LIVE badge with optional viewer count |
| components/tmi-design/TMIGlowCard.tsx | Dark card with cyan/gold/pink/purple glow |
| components/tmi-design/TMIBeltHeader.tsx | Gold ⚡ belt section header with divider line |
| components/tmi-design/TMICountdownTimer.tsx | Live clock or target-date countdown in Bebas Neue |
| components/tmi-design/TMICrownBadge.tsx | Pulsing gold crown badge with artist name |
| components/monetization/AdRenderer.tsx | Universal slot renderer — always 200, house ad fallback chain |
| components/monetization/EarningsPanel.tsx | Full earnings breakdown with sparkbar, lifetime/week/month/pending/available |
| components/monetization/SponsorCoachingSticky.tsx | Priority-aware coaching note with dismiss |
| api-modules/ads/ads.controller.ts | GET /api/ads/slot/:id — always 200 |
| api-modules/home/home-composition.controller.ts | GET /api/home/composition — belt stack config |
| api-modules/rooms/rooms.controller.ts | GET /api/rooms?sort=viewers_asc — discovery-first |
| api-modules/editorial/editorial.controller.ts | Articles with author.stationSlug for station link |
| api-modules/stream-win/stream-win.controller.ts | Points recording + scoring |
| admin/command-center/page.tsx | 6-panel Admin HUD: platform health, owner finance, campaigns, bots, moderation, discovery |
| pages/beats/page.tsx | Beat Marketplace with genre filter and license CTA |
| pages/hall-of-fame/page.tsx | Crown winner history with current champion hero |
| pages/error/not-found/page.tsx | 404 in TMI dark style |
| pages/error/maintenance/page.tsx | Maintenance screen |

---

## THE PLATFORM LAWS (15 permanent rules — never change)

1. Discovery-first: 0 viewers = position 1 in lobby ALWAYS
2. Permanent Diamond: Marcel Dickens + B.J. M Beat's — forever, verified every 4h
3. Kids only talk to kids (canSendMessage middleware)
4. Max 8 tickets per buyer per event
5. Owner payouts from NET PROFIT only — never gross
6. TMI visual identity: #0D0520, Bebas Neue, cyan/gold/pink — NEVER generic SaaS
7. GET /api/ads/slot/:id ALWAYS returns 200 (never blank)
8. Party persists when members enter/exit rooms
9. Article pages ALWAYS link to artist station
10. "Stations" not "Channels" in all public UI
11. Coaching sticky notes on artist dashboard
12. No system should break another system — isolated modules only
13. If a page exceeds 5 major zones, create child routes
14. Artist articles auto-create on profile completion
15. Freshness engine prevents same content repeating on same surface

---

## THE HANDOFF ORDER

```
1. Blackbox → Pack 31 fix files (corrupted onboarding)
2. Blackbox → Pack 31 scaffold (all pages)
3. Blackbox → Pack 32 (homepage + magazine entry)
4. Blackbox → Pack 34 components + API stubs
5. Copilot → Pack 29 wiring order (9 slices, proof between each)
6. Gemini → Pack 30 checklist after each slice
7. You → visual check + pnpm test:discovery must PASS
```

---

## TOTAL DELIVERY

```
Pack 25:   21 files  ← API contracts, Prisma, WebSocket, Stripe
Pack 26:   18 files  ← Owner finance, Marcel+Jay Paul payouts
Pack 27:    6 files  ← Import order, conflict matrix, smoke tests
Pack 28:   11 files  ← Design system, belts, monetization
Pack 29:   13 files  ← File placement, state machines, wiring order
Pack 30:    4 files  ← Pre-flight, shell commands, rollback
Pack 31:  109 files  ← 6 fixes + 98 scaffold pages + 4 prompts + 3 configs
Pack 32:   12 files  ← Homepage, magazine, tokens, scene/bot/pipeline registries
Pack 33:   10 files  ← Tiers, placement zones, freshness, coaching, 4 chains
Pack 34:   20 files  ← Components, API stubs, admin HUD, beats, hall of fame
─────────────────────
TOTAL:    224 files
```

*BerntoutGlobal LLC — "This is your stage, be original."*
