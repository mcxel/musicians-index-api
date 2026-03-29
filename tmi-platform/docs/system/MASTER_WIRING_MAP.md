# MASTER WIRING MAP
## BerntoutGlobal XXL — The Musician's Index Platform
## Effective: 2026-03-23 | Authority: Big Ace | Status: LOCKED BUILD AUTHORITY

---

## THE PLATFORM IS A WIRING SYSTEM

This document is the canonical signal-flow map for every engine, surface, and runtime on the platform.
It replaces "build a page" thinking with "close a wire" thinking.

```
DISPLAY
   ↓
INTERFACE
   ↓
WIDGET
   ↓
COMPONENT
   ↓
PROVIDER / GLOBAL STATE
   ↓
API
   ↓
DATABASE / ENGINE
   ↓
HUD / A/V / POINTS / LOGS
```

If any link in the chain is missing → the system is **PARTIAL**. Not shippable.

---

## PLATFORM ARCHITECTURE DIAGRAM

```
                    ┌───────────────────────┐
                    │       HUD LAYER        │
                    │  audio · notif · points│
                    │  live · booking · game │
                    └──────────┬────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
 Homepage Engine        Magazine Engine        Profile Engine
        │                      │                      │
 Belts / Lobby          Articles / Issues        Artist Hub
        │                      │                      │
        └──────────────┬────── ┴───────────────┬──────┘
                       │                       │
                  Stream & Win             Discovery
                       │                       │
                       └──────────┬────────────┘
                                  │
                     Points / Economy Engine
                                  │
       ┌──────────────┬───────────┼───────────────┬──────────────┐
       │              │           │               │              │
    Cypher         Booking      Games          Sponsors      Live Rooms
       │              │           │               │              │
       └──────────────┴───────────┴───────────────┴──────────────┘
                                  │
                           Admin Command
                                  │
                              Bot System
                                  │
                               Database
```

---

## WIRING ORDER (BUILD SEQUENCE — DO NOT SKIP)

| Priority | System | Why This Order |
|----------|--------|----------------|
| **W-01** | Audio Provider / Singleton | Everything that plays audio or rewards listening depends on this. Connect once. |
| **W-02** | HUD / Global State | Connects all runtime state. Audio, notifications, points, live status all surface here. |
| **W-03** | Homepage Belts | First visible surface. Uses live modules directly. |
| **W-04** | Artist Profile [slug] route | Unlocks profiles, booking surface, Diamond display, article link, achievements. |
| **W-05** | Magazine Engine | Wire IssueEngine + MagazineBrain into real reader route. |
| **W-06** | Stream & Win → Points | Audio singleton + playback → LedgerEntry credits. |
| **W-07** | Points / Rewards Economy | Achievements, reward redemption, leaderboard inputs. |
| **W-08** | Cypher Engine | Full build — route + API + 4 DB models + provider. |
| **W-09** | Game Engine | Wire DealVsFeud1000 + GameNightHub to real sessions. |
| **W-10** | Booking Engine | Wire ArtistBookingDashboard to real BookingRequest + Venue models. |
| **W-11** | Sponsor / Ad Engine | Wire SponsorBoard + BillboardBoard to real Sponsor + AdSlot models. |
| **W-12** | Live Rooms | Wire LiveRooms.tsx + AudienceRoom.jsx to presence/rooms endpoint. |
| **W-13** | Notifications | In-app notification model + surface. Email module already exists. |
| **W-14** | Admin Command | Wire AdminCommandHUD to FeatureFlag + AuditLog. |
| **W-15** | Bots | BotRunLog + remaining 7 bots. |
| **W-16** | Deploy | CI/CD, staging, production. |
| **W-17** | Onboarding | Real user onboarding with all wired surfaces. |

---

## MASTER WIRING MAP — ALL SYSTEMS × ALL DIMENSIONS

### Symbol Key
- `✅` = wired and real
- `⚠️` = exists but hardcoded / fake / partial
- `❌` = missing — wire does not exist

---

### W-01 · AUDIO PROVIDER / SINGLETON

| Dimension | Wire Name | Status | Note |
|-----------|-----------|--------|------|
| Route | `app/layout.tsx` | ✅ | `AudioProvider` mounted in root layout |
| Shell mount | `<AudioProvider>` wraps children | ✅ | Correct placement confirmed |
| Component | `AudioPlayer.tsx` | ⚠️ | Exists but does NOT call `useAudio()` — standalone UI |
| Provider | `AudioProvider.tsx` → `useAudio()` | ✅ | Context + hook exist and are correct |
| API | `/api/streamwin/playlists/generate` | ❌ | Commented out in streamwin page |
| DB model | `StreamEvent`, `SavedTrack` | ❌ | Not in schema |
| HUD exposure | Audio state → HUD | ❌ | HUD does not read AudioProvider state |
| A/V singleton | One owner across routes | ⚠️ | Provider mounted once ✅ but `streamwin/page.tsx` has duplicate `isPlaying` state ❌ |
| Points hook | Play → LedgerEntry credit | ❌ | |
| Logging | `logger.*` on play/pause/skip | ✅ | `logger` imported in AudioProvider |
| Proof | Self-proves (hook throws if no context) | ✅ | |
| Rollback | Silent mode if no track | ✅ | |

**First broken wire:** `streamwin/page.tsx` owns its own `isPlaying` state in parallel with `AudioProvider` — split brain.

**Minimum safe patch:** In `streamwin/page.tsx`, remove local `isPlaying`/`setIsPlaying` state. Import and call `useAudio()`. Route `handlePlay`, `handlePause`, `handleNext` through the hook.

**Files:** `apps/web/src/app/streamwin/page.tsx` (1 file, edit only)

---

### W-02 · HUD / GLOBAL STATE ENGINE

| Dimension | Wire Name | Status | Note |
|-----------|-----------|--------|------|
| Route | `/hud/page.tsx` | ✅ | Exists |
| Shell mount | `HUDRuntimeProvider` in `layout.tsx` | ❌ | **NOT in layout** |
| Component | `TmiHud.tsx` | ❌ | Literal placeholder stub — "HUD is live. Next: wire runtime + data." |
| Component | `HudShell.tsx` | ⚠️ | Exists, wiring unverified |
| Component | `SystemHealth.tsx` | ⚠️ | Hardcoded "CPU: 12%" — fake data |
| Provider | HUD context / global state store | ❌ | Does not exist |
| API | FeatureFlag endpoint | ❌ | No `/api/admin/flags` endpoint |
| DB model | `Hub`, `FeatureFlag` | ✅ | Both exist in schema |
| Audio link | `useAudio()` state surfaced in HUD | ❌ | |
| Notifications link | Notification state in HUD | ❌ | |
| Points link | Points balance in HUD | ❌ | |
| Live status link | Active room / session in HUD | ❌ | |
| Logging | | ❌ | |
| Proof | | ❌ | |

**First broken wire:** Link 2 — no `HUDRuntimeProvider` in `layout.tsx`. The HUD shell is mounted at a route but has no global context bus.

**Minimum safe patch:** Create a minimal `HudRuntimeProvider` that reads `useAudio()` + wraps children. Mount it in `layout.tsx` above `AudioProvider`. The HUD page then reads from this provider.

**Files:** `apps/web/src/providers/HudRuntimeProvider.tsx` (create), `apps/web/src/app/layout.tsx` (edit), `apps/web/src/components/tmi/hud/TmiHud.tsx` (replace stub)

---

### W-03 · HOMEPAGE BELTS

| Dimension | Wire Name | Status | Note |
|-----------|-----------|--------|------|
| Route | `/` → `app/page.tsx` | ✅ | Exists |
| Shell mount | `layout.tsx` providers | ✅ | All providers mounted |
| Component | `PromotionalHub.jsx` | ❌ | **ORPHANED** — never imported in `page.tsx` |
| Component | `HomepageLiveCover.jsx` | ❌ | Re-exports PromotionalHub — also never imported |
| Component | `HeroSection` | ⚠️ | What actually renders — not the belt system |
| Provider | Live room / belt state | ❌ | No belt provider |
| API | Belt config / live artists | ❌ | No API |
| DB model | None required (config-driven is acceptable) | ⚠️ | `FeatureFlag` rows could configure belts |
| HUD link | | ❌ | |
| A/V link | `AudioPlayer` in page | ⚠️ | Rendered but not calling `useAudio()` — static sponsor tile |
| Loading state | | ❌ | |
| Empty state | | ❌ | |
| Error state | | ❌ | |
| Logging | | ❌ | |
| Proof | `getHomepageSequenceProof()` | ⚠️ | Proves magazine brain, not belts |

**First broken wire:** Link 3 — `PromotionalHub.jsx` is orphaned. `page.tsx` imports `HeroSection` instead.

**Minimum safe patch:** In `page.tsx` replace `<HeroSection />` with `<HomepageLiveCover />` (which wraps PromotionalHub). Add `Suspense` wrapper with loading fallback.

**Files:** `apps/web/src/app/page.tsx` (1 edit)

---

### W-04 · ARTIST PROFILES

| Dimension | Wire Name | Status | Note |
|-----------|-----------|--------|------|
| Route (list) | `/artists/page.tsx` | ⚠️ | Exists but renders hardcoded demo |
| Route (profile) | `/artists/[slug]/page.tsx` | ❌ | **DOES NOT EXIST** |
| Shell mount | `layout.tsx` providers | ✅ | |
| Component | `ArtistProfileHub.jsx` | ⚠️ | Passthrough re-export of `ArtistBookingDashboard` |
| Component | `ArtistBookingDashboard.jsx` | ⚠️ | Full UI — hardcoded GIGS, MAP_PINS — no props passed |
| Provider | Artist data context | ❌ | No ArtistProvider |
| API | `users/` module | ✅ | Controller + service exist |
| API | Artist by slug endpoint | ❌ | Unconfirmed — needs verification |
| DB model | `Artist`, `MusicLink`, `Article` | ✅ | All exist |
| DB field | `Artist.diamondStatus` | ❌ | Field does not exist in schema |
| Diamond mandate | Marcel + B.J.M. = permanent Diamond | ❌ | No field to store this |
| HUD link | | ❌ | |
| A/V link | | ❌ | |
| Loading state | | ❌ | |
| Empty state | | ❌ | |
| Error state | | ❌ | |
| Logging | | ❌ | |
| Proof | | ❌ | |

**First broken wire:** Link 1 — no `/artists/[slug]/page.tsx`. Every artist URL 404s or resolves to same hardcoded demo.

**Minimum safe patch:**
1. Create `app/artists/[slug]/page.tsx` — fetch artist by slug from `users/` API, pass real data as props to `ArtistProfileHub`
2. Add `diamondStatus Boolean @default(false)` + `featuredOrder Int?` to `Artist` model in schema
3. Seed Marcel + B.J.M. as `diamondStatus: true`

**Files:** `app/artists/[slug]/page.tsx` (create), `schema.prisma` (edit)

---

### W-05 · MAGAZINE ENGINE

| Dimension | Wire Name | Status | Note |
|-----------|-----------|--------|------|
| Route | `/articles/[slug]/page.tsx` | ✅ | Exists |
| Shell mount | `layout.tsx` | ✅ | |
| Component | `MagazineLayout.tsx` | ❌ | **ORPHANED** — never called from any route |
| Component | `MagazinePage2.jsx` | ❌ | **ORPHANED** |
| Engine | `IssueEngine.ts` | ❌ | Built — not connected to any route or provider |
| Engine | `MagazineBrain.ts` | ❌ | Built — only referenced in mock proof |
| Adapter | `magazineBrainAdapter.ts` | ⚠️ | Exists, only used for `getHomepageSequenceProof()` |
| Provider | `MagazineBrainProvider` | ❌ | Does not exist |
| API | `editorial/` module | ✅ | Exists |
| DB model | `Article` | ✅ | Exists |
| DB model | `Issue` | ❌ | **MISSING from schema** |
| HUD link | | ❌ | |
| A/V link | | ❌ | |
| Loading state | | ❌ | |
| Empty state | | ❌ | |
| Error state | | ❌ | |
| Logging | | ❌ | |
| Proof | `buildMockIssueInput()` | ⚠️ | Mock only — not wired to real data |

**First broken wire:** Link 3 — `MagazineLayout.tsx` never rendered in any route. The editorial route renders raw content, not a magazine spread.

**Minimum safe patch:**
1. Add `Issue` Prisma model (links articles into numbered issues)
2. In `articles/[slug]/page.tsx`, wrap fetched article in `<MagazineLayout pages={[articleAsPage]} />`
3. Create `MagazineBrainProvider` — calls adapter with real DB data

**Files:** `schema.prisma` (add `Issue` model), `app/articles/[slug]/page.tsx` (edit), `providers/MagazineBrainProvider.tsx` (create)

---

### W-06 · STREAM & WIN ENGINE

| Dimension | Wire Name | Status | Note |
|-----------|-----------|--------|------|
| Route | `/streamwin/page.tsx` | ✅ | Exists, full UI |
| Shell mount | `AudioProvider` in layout | ✅ | Provider is mounted |
| Component | Inline page components | ✅ | Full UI exists in page |
| Provider | `useAudio()` | ❌ | **NOT called** — page has own `isPlaying` state |
| API | `/api/streamwin/playlists/generate` | ❌ | **COMMENTED OUT** |
| DB model | `StreamEvent`, `SavedTrack` | ❌ | Not in schema |
| HUD link | Stream status → HUD | ❌ | |
| A/V | AudioProvider singleton | ❌ | Split-brain — page owns playback state |
| Points hook | Play → earn points | ❌ | |
| Loading state | `isGenerating` spinner | ✅ | Exists |
| Empty state | "Generate playlist" prompt | ✅ | Exists |
| Error state | | ❌ | No error catch in UI |
| Logging | `logger.error`, `logger.log` | ✅ | Called |
| Proof | | ❌ | |

**First broken wire:** Link 4 — shared state split. Page manages `isPlaying` locally instead of routing through `AudioProvider`.

**Minimum safe patch (FIRST SLICE TO DO):**
- Remove: `const [isPlaying, setIsPlaying] = useState(false)`
- Add: `const { isPlaying, play, pause, next, addToPlaylist } = useAudio()`
- Wire `handlePlay` → `play()`, `handlePause` → `pause()`, `handleNext` → `next()`
- Wire playlist generation result → `addToPlaylist()` for each track

**Files:** `apps/web/src/app/streamwin/page.tsx` (edit only)

---

### W-07 · POINTS / REWARDS ECONOMY

| Dimension | Wire Name | Status | Note |
|-----------|-----------|--------|------|
| Route | No dedicated route | ❌ | Points are invisible to users |
| Shell mount | | ❌ | |
| Component | No points widget | ❌ | |
| Provider | No PointsProvider | ❌ | |
| API | No `points/` module | ❌ | |
| DB model | `LedgerEntry` | ✅ | Virtual currency ledger exists |
| DB model | `Achievement`, `UserAchievement` | ❌ | Missing |
| DB model | `RewardItem`, `RewardRedemption` | ❌ | Missing |
| HUD link | Points balance in HUD | ❌ | |
| A/V link | Play → earn points | ❌ | |
| Logging | | ❌ | |
| Proof | | ❌ | |

**First broken wire:** Link 1 — no route. Points exist in the DB as `LedgerEntry` but users cannot see their balance anywhere.

**Minimum safe patch:** Create a `PointsWidget` component that reads balance from `/api/points/balance`. Mount it in the HUD. No full points route needed initially.

**Files:** `api/src/modules/points/` (create), `components/points/PointsWidget.tsx` (create)

---

### W-08 · CYPHER ENGINE

| Dimension | Wire Name | Status | Note |
|-----------|-----------|--------|------|
| Route | `/cypher/` | ❌ | Missing |
| All other links | | ❌ | Nothing exists |

**Status: MISSING** — full build required.

**Build order:** Route → `CypherSessionProvider` → Cypher stage component → `cypher/` NestJS module → `CypherSession`, `CypherPerformer`, `CypherRound`, `CypherScore` DB models.

**Files to create:** 10+ (route, provider, component, module ×3, 4 models in schema)

---

### W-09 · GAME ENGINE

| Dimension | Wire Name | Status | Note |
|-----------|-----------|--------|------|
| Route | `/games/page.tsx` → `GameNightHub` | ✅ | Renders |
| Shell mount | `layout.tsx` | ✅ | |
| Component | `GameNightHub.jsx` | ⚠️ | Renders hardcoded GAMES array |
| Component | `DealVsFeud1000.tsx` | ❌ | **ORPHANED** — full implementation, never rendered |
| Component | `AudienceGuessPanel.tsx` | ❌ | **ORPHANED** |
| Component | `DealOrFeud.jsx` | ❌ | **ORPHANED** |
| Component | `WinnersHall.jsx` | ❌ | **ORPHANED** |
| Provider | `GameSessionProvider` | ❌ | Missing |
| API | `games/` NestJS module | ❌ | Missing |
| DB model | `GameSession`, `GamePlayer`, `GameRound`, `GameAnswer` | ❌ | All missing |
| HUD link | Active game → HUD invite | ❌ | |
| A/V link | Game sounds/SFX | ❌ | |
| Points link | Win → earn points | ❌ | |
| Loading state | | ❌ | |
| Empty state | | ❌ | |
| Error state | | ❌ | |
| Logging | | ❌ | |
| Proof | | ❌ | |

**First broken wire:** Link 5 — no games API. UI is up, tiles are visible, but nothing can be joined or started.

**Minimum safe patch:** Create `apps/api/src/modules/games/` (controller + module + service). Service returns active game sessions. Wire `GameNightHub` to fetch from `/api/games/active` replacing hardcoded GAMES.

---

### W-10 · BOOKING ENGINE

| Dimension | Wire Name | Status | Note |
|-----------|-----------|--------|------|
| Route | No canonical `/booking/` or `/artists/[slug]/book/` | ❌ | Blocked by artist slug missing |
| Component | `ArtistBookingDashboard.jsx` | ⚠️ | Full UI — hardcoded GIGS and MAP_PINS |
| Provider | | ❌ | |
| API | `booking/` NestJS module | ❌ | Missing |
| DB model | `BookingRequest`, `Venue` | ❌ | Missing |
| Map data | Real venue pins from DB | ❌ | |
| HUD link | Booking alert → HUD | ❌ | |
| Logging | | ❌ | |
| Proof | | ❌ | |

**First broken wire:** Link 1 — no route. Booking dashboard first becomes accessible inside `/artists/[slug]/page.tsx` (W-04 patch). Then needs API + DB.

**Dependency:** W-04 (artist slug) must be done first.

---

### W-11 · SPONSOR / AD ENGINE

| Dimension | Wire Name | Status | Note |
|-----------|-----------|--------|------|
| Route | `/sponsors/page.tsx` → `SponsorBoard` | ✅ | Renders |
| Route | `/billboard/page.tsx` → `BillboardBoard` | ✅ | Renders |
| Shell mount | ✅ | | |
| Component | `SponsorBoard.jsx` | ⚠️ | Full UI — DEMO_SPONSORS hardcoded |
| Component | `BillboardBoard.jsx` | ⚠️ | Full UI — DEMO_RANKINGS hardcoded |
| Component | `SponsorDashboard.tsx` | ⚠️ | Exists — wiring unverified |
| Component | `SponsorROIAnalytics.tsx` | ⚠️ | Exists — wiring unverified |
| Component | `SponsorInvitePanel.tsx` | ⚠️ | Exists — wiring unverified |
| Provider | | ❌ | |
| API | `sponsors/` NestJS module | ❌ | Missing (contest has SponsorContribution but not full engine) |
| DB model | Standalone `Sponsor`, `AdSlot` | ❌ | Missing (`SponsorPackage`, `SponsorContribution` exist for contest only) |
| HUD link | Sponsor alert | ❌ | |
| Points link | Sponsor interaction → points | ❌ | |
| Loading state | | ❌ | |
| Empty state | | ❌ | |
| Error state | | ❌ | |
| Logging | | ❌ | |
| Proof | | ❌ | |

**First broken wire:** Link 5 — no sponsors API module.

**Minimum safe patch:** Create `apps/api/src/modules/sponsors/` serving `SponsorPackage` records. Wire `SponsorBoard` to fetch real data instead of DEMO_SPONSORS.

---

### W-12 · LIVE ROOMS ENGINE

| Dimension | Wire Name | Status | Note |
|-----------|-----------|--------|------|
| Route | `/room/bar-stage/` | ✅ | Exists |
| Route | Homepage live section | ✅ | Renders `LiveRooms.tsx` |
| Shell mount | ✅ | | |
| Component | `LiveRooms.tsx` | ⚠️ | Renders DEFAULT_ROOMS hardcoded — accepts `rooms` prop but nothing passes it |
| Component | `AudienceRoom.jsx` | ❌ | **ORPHANED** — full implementation with DEMO_AUDIENCE, never rendered at any route |
| Provider | Video session provider | ❌ | Missing |
| API | `presence/` module | ✅ | Exists (controller + service) |
| API | Rooms list endpoint | ❌ | Unconfirmed in presence module |
| DB model | `LiveRoom` | ❌ | Missing |
| HUD link | Active room → HUD | ❌ | |
| A/V link | Video session singleton | ❌ | |
| Loading state | | ❌ | |
| Empty state | | ❌ | |
| Error state | | ❌ | |
| Logging | | ❌ | |
| Proof | | ❌ | |

**First broken wire:** Link 5 — `LiveRooms.tsx` accepts a `rooms` prop but the calling code never fetches or passes real rooms. The `presence/` module exists and may be extendable.

**Minimum safe patch:** In `LiveRooms.tsx`, add `useEffect` + `fetch('/api/presence/rooms')` → state. Add loading/empty/error states. Verify or add rooms endpoint in `presence.service.ts`.

---

### W-13 · NOTIFICATIONS

| Dimension | Wire Name | Status | Note |
|-----------|-----------|--------|------|
| Route | No notification surface | ❌ | |
| Component | No notification panel | ❌ | |
| Provider | | ❌ | |
| API | `email/` module | ✅ | Outbound email exists |
| DB model | No in-app notification model | ❌ | |
| HUD link | Notification badge → HUD | ❌ | |
| Logging | | ❌ | |

**Status: PARTIAL** — outbound email works. In-app system entirely missing.

**Minimum safe patch:** Add `Notification` Prisma model. Create `notifications/` NestJS module. Create `NotificationPanel` component. Mount in HUD.

---

### W-14 · ADMIN COMMAND ENGINE

| Dimension | Wire Name | Status | Note |
|-----------|-----------|--------|------|
| Route | `/admin/page.tsx` | ⚠️ | Stub + promos/ + refunds/ sub-routes |
| Shell mount | ✅ | | |
| Component | `AdminCommandHUD.jsx` | ❌ | **ORPHANED** — exists, not imported in admin route |
| Component | `AnalyticsMiniPanel.tsx` | ❌ | **ORPHANED** |
| Provider | | ❌ | |
| API | `admin/` NestJS module | ❌ | Missing |
| DB model | `AuditLog`, `FeatureFlag` | ✅ | Both exist |
| HUD link | | ❌ | |
| Logging | `AuditLog` model ready | ✅ | Model exists |
| Proof | | ❌ | |

**First broken wire:** Link 3 — `AdminCommandHUD.jsx` is not imported in the admin route.

**Minimum safe patch:** Import `AdminCommandHUD` in `/admin/page.tsx`. Create `admin/` NestJS module with a `GET /api/admin/flags` endpoint serving `FeatureFlag` records. Wire the HUD to toggle flags.

---

### W-15 · BOT / AUTOMATION ENGINE

| Dimension | Wire Name | Status | Note |
|-----------|-----------|--------|------|
| Bot | `ContestBots.ts` | ✅ | Exists |
| Bot | `WeeklyResetBot` | ❌ | Missing |
| Bot | `LeaderboardSnapshotBot` | ❌ | Missing |
| Bot | `PointsExpiryBot` | ❌ | Missing |
| Bot | `OnboardingBot` | ❌ | Missing |
| Bot | `StreamEventBot` | ❌ | Missing |
| Bot | `ArtistProfileBot` | ❌ | Missing |
| Bot | `GameEndBot` | ❌ | Missing |
| Bot | `CypherEndBot` | ❌ | Missing |
| DB model | `BotRunLog` | ❌ | Missing |
| Admin control | Bot enable/disable via FeatureFlag | ❌ | |
| Logging | Bot run log | ❌ | |
| Proof | | ❌ | |

**Status: PARTIAL** — 1 of 9 bots exists. No run log.

**Minimum safe patch:** Add `BotRunLog` to schema. Create `WeeklyResetBot` + `LeaderboardSnapshotBot` as the most needed automation.

---

## COMPLETE SIGNAL FLOW MAP — WHAT MUST BE TRUE FOR EACH SYSTEM TO BE FULLY LIVE

```
System                  ROUTE          PROVIDER         API                DB              HUD     A/V
──────────────────────────────────────────────────────────────────────────────────────────────────────────
Audio Singleton         layout.tsx     AudioProvider✅  stream-win❌       StreamEvent❌   ❌      ⚠️split
HUD / Global State      /hud✅          HudRuntime❌     admin/flags❌      FeatureFlag✅   self    ❌
Homepage Belts          /✅             layout✅          belts❌            FeatureFlag?    ❌      ❌
Artist Profiles         /artists/[s]❌  none❌           users✅             Artist✅        ❌      ❌
Magazine Engine         /articles/[s]✅ MagazineBrain❌  editorial✅        Article✅Issue❌ ❌      ❌
Stream & Win            /streamwin✅    AudioProvider⚠️  streamwin❌        StreamEvent❌   ❌      ❌split
Points / Rewards        ❌              none❌           points❌            LedgerEntry✅   ❌      —
Cypher                  ❌              none❌           cypher❌            CypherSession❌ ❌      ❌
Games                   /games✅        none❌           games❌             GameSession❌   ❌      ❌
Booking                 /artists/[s]❌  none❌           booking❌           BookingReq❌    ❌      —
Sponsors                /sponsors✅     none❌           sponsors❌          Sponsor❌       ❌      —
Leaderboard             /billboard✅    none❌           leaderboard❌       none❌          ❌      —
Live Rooms              /room/✅         none❌           presence⚠️         LiveRoom❌      ❌      ❌
Notifications           ❌              none❌           notifications❌     Notification❌  ❌      —
Admin                   /admin⚠️         none❌           admin❌             AuditLog✅     ❌      —
Bots                    —               —               —                  BotRunLog❌     ❌      —
```

---

## SCHEMA ADDITIONS QUEUE (ORDERED)

These Prisma model additions must happen in this sequence to unlock the systems above:

| Priority | Model(s) | Unlocks | Migration Name |
|----------|----------|---------|----------------|
| A | `Artist.diamondStatus`, `Artist.featuredOrder`, `Artist.isVerified` | Artist profiles, Diamond display | `add_artist_diamond_fields` |
| B | `Issue` | Magazine engine, Archive | `add_issue_model` |
| C | `StreamEvent`, `SavedTrack` | Stream & Win API | `add_stream_win_models` |
| D | `BookingRequest`, `Venue` | Booking engine | `add_booking_models` |
| E | `GameSession`, `GamePlayer`, `GameRound`, `GameAnswer` | Game engine | `add_game_models` |
| F | `Sponsor`, `AdSlot` | Sponsor/Ad engine | `add_sponsor_ad_models` |
| G | `Achievement`, `UserAchievement`, `RewardItem`, `RewardRedemption` | Points economy | `add_rewards_models` |
| H | `CypherSession`, `CypherPerformer`, `CypherRound`, `CypherScore` | Cypher engine | `add_cypher_models` |
| I | `LiveRoom` | Live rooms engine | `add_live_room_model` |
| J | `Notification` | Notifications | `add_notification_model` |
| K | `BotRunLog` | Bot system | `add_bot_run_log` |

---

## API MODULES CREATION QUEUE (ORDERED)

| Priority | Module Path | Minimum Files | Unlocks |
|----------|-------------|---------------|---------|
| 1 | `apps/api/src/modules/stream-win/` | controller, module, service | Stream & Win API, SavedTrack |
| 2 | `apps/api/src/modules/sponsors/` | controller, module, service | SponsorBoard live data |
| 3 | `apps/api/src/modules/leaderboard/` | controller, module, service | BillboardBoard live data |
| 4 | `apps/api/src/modules/games/` | controller, module, service | GameNightHub live sessions |
| 5 | `apps/api/src/modules/booking/` | controller, dto, module, service | BookingRequest CRUD |
| 6 | `apps/api/src/modules/points/` | controller, module, service | Points balance, earn, redeem |
| 7 | `apps/api/src/modules/notifications/` | controller, module, service | In-app notifications |
| 8 | `apps/api/src/modules/admin/` | controller, module, service | FeatureFlag toggle, AuditLog |
| 9 | `apps/api/src/modules/live-rooms/` | controller, module, service | Room CRUD via presence |
| 10 | `apps/api/src/modules/cypher/` | controller, module, service | CypherSession CRUD |

---

## FRONTEND FILES CREATION QUEUE (ORDERED)

| Priority | File | Type | Unlocks |
|----------|------|------|---------|
| 1 | `apps/web/src/app/artists/[slug]/page.tsx` | Create | All artist-facing systems |
| 2 | `apps/web/src/providers/HudRuntimeProvider.tsx` | Create | HUD global state bus |
| 3 | `apps/web/src/providers/MagazineBrainProvider.tsx` | Create | Magazine engine connection |
| 4 | `apps/web/src/components/points/PointsWidget.tsx` | Create | Points visibility |
| 5 | `apps/web/src/app/cypher/page.tsx` | Create | Cypher engine route |
| 6 | `apps/web/src/app/archive/page.tsx` | Create | Archive route |
| 7 | `apps/web/src/app/notifications/page.tsx` | Create | Notification surface |

---

## DIAMOND MANDATE (PERMANENT — DO NOT REMOVE)

Marcel Dickens and B.J.M. hold **permanent Diamond status** on this platform.
This is not computed by rank score. It is a seed data directive.

| Field | Location | Value |
|-------|----------|-------|
| `Artist.diamondStatus` | `schema.prisma` | `Boolean @default(false)` |
| Marcel Dickens | Seed / Admin set | `diamondStatus: true` |
| B.J.M. | Seed / Admin set | `diamondStatus: true` |

Every system that displays artist tier badges must check `artist.diamondStatus` first before applying any computed rank tier.

---

## STATUS SNAPSHOT — 2026-03-23

| Area | Wiring % | Notes |
|------|----------|-------|
| Backend core | 85% | Auth, contest, editorial, tickets solid |
| Frontend framework | 80% | Routes and layout correct |
| Auth/onboarding | 85% | Locked, do not touch |
| Contest | 90% | Most complete system |
| System docs | 100% | All architecture docs complete |
| **Wiring** | **35%** | **The main remaining work** |
| Homepage | 60% | Components exist, not connected |
| Magazine | 55% | Engine built, not wired |
| Profiles | 45% | No slug route |
| Stream & Win | 40% | Split-brain audio |
| Cypher | 20% | Missing entirely |
| Games | 30% | UI exists, no API |
| Booking | 50% | UI exists, no backend |
| Sponsors | 35% | UI exists, hardcoded |
| Points | 40% | LedgerEntry only |
| Live Rooms | 35% | Presence API partial |
| Admin | 50% | Shell only |
| Deploy | 30% | CI/CD partial |
| Onboarding real users | 25% | Framework ready |
| **Overall platform** | **~62%** | Hardest architecture work done |

---

*This document is LOCKED build authority.  
All system wiring work must reference this map.  
Owner: Big Ace | No modifications without explicit approval.*
