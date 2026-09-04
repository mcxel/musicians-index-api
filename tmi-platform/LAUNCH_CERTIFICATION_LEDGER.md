# LAUNCH CERTIFICATION LEDGER
**Last Updated:** 2026-08-23 (TWO-DEVICE PRESENCE GATE freeze) | **Phase 4 → Soft Launch Gate** + World Director + Game Runtime Constitution locked; next cert = manual two-device avatar presence only

---

## TMI GAME RUNTIME CONSTITUTION — STATUS LOCK 2026-08-23

```text
GAME RUNTIME CONSTITUTION   🔒 LOCKED
60 SYSTEMS                  🟢 REGISTERED
13 WIRED                    🟢
37 PARTIAL                  🟡
10 OPEN                     🔴
NEXT CERT:
TWO-DEVICE AVATAR PRESENCE  ⏳ PHYSICAL ONLY
```

**Core law:** TMI is a real-time social entertainment world delivered through the web — not a website with game features.

Canonical module: `apps/web/src/lib/runtime/GameRuntimeConstitution.ts`  
Glue: `DeviceQualityGovernor.ts`, `InteractionCommandBus.ts`  
Coordinate authority: `WorldScenePlan.spatialMap` (engine units; tools display ft/sq ft @ 1:1 until MEASURED_GLB)

**Constitution modules are FROZEN for this cert.** Do not reopen Game Runtime Constitution, DeviceQualityGovernor, InteractionCommandBus, LOD, stadium fill, or new runtime wiring for this gate. Manual physical proof only.

```text
OPERATIONAL CHAIN
INPUT → COMMAND BUS → POLICY/ENTITLEMENT/SAFETY → AUTHORITATIVE STATE
→ ROOM/MEDIA/WORLD EXECUTION → LOCAL PRESENTATION → NETWORK SYNC
→ OBSERVABILITY → AUTO-RECOVERY → PERSISTENCE/EVENT LEDGER → LEARNING/OPTIMIZATION

PRIORITY UNDER PRESSURE
P0 LIVE MEDIA → P1 INPUT/ROOM STATE → P2 GAME STATE → P3 UI → P4 COSMETICS → P5 ANALYTICS/PREFETCH

DEVICE QUALITY
LIGHT | STANDARD | ULTRA  (via DeviceQualityGovernor ← AWR)

DEGRADED LADDER
ULTRA_3D → STANDARD_3D → LIGHTWEIGHT → VIDEO_ONLY → AUDIO_ONLY
```

### Measurable performance budgets (SLOs — not hard guarantees)

| Budget | Target |
| :--- | :--- |
| Frame ms ULTRA / STANDARD / LIGHT | 16.7 / 22 / 33 |
| Stress downgrade threshold | avg frame > 36 ms |
| Live media first frame P50 / P95 | 1200 ms / 3500 ms |
| Reversible input echo P95 | 100 ms |
| Authoritative ack (pay/own/safety) P95 | 2500 ms |
| Room handoff P95 | 4000 ms |

**Never claim:** literal zero lag, guaranteed 60 FPS everywhere, or 100% reliability.

### 60-system inventory (consolidate — do not rebuild)

Statuses from `GAME_RUNTIME_SYSTEM_REGISTRY` — WIRED | PARTIAL | OPEN | DEFERRED.

| # | System | Status | Canonical |
| :--- | :--- | :--- | :--- |
| 1 | Canonical World Coordinate Runtime | WIRED | `lib/world/WorldScenePlan.ts` |
| 2 | Spatial Partition Engine | PARTIAL | spatialMap zones (hash OPEN) |
| 3 | Full-Sphere Render Director | PARTIAL | viewMode + LOD metadata; physical LOD OPEN |
| 4 | Device Quality Governor | WIRED | `lib/runtime/DeviceQualityGovernor.ts` |
| 5 | Performance Budget System | PARTIAL | constitution + AWR PerformanceGovernor |
| 6 | Predictive Room Streaming | OPEN | — |
| 7 | Asset Manifest Runtime | PARTIAL | MediaAssetEngine / MediaRegistry |
| 8 | One Canonical Media Bus | WIRED | `canonicalMediaPlayerRuntime.ts` (+ Go Live bind) |
| 9 | Dynamic Media Frame Director | WIRED | canonicalMediaPlayerRuntime frames |
| 10 | Adaptive WebRTC Runtime | PARTIAL | WebRTCSubscriptionGovernor |
| 11 | Media Continuity Ledger | PARTIAL | roomId + device persistence |
| 12 | Single Active Audio Authority | WIRED | `primaryAudioFrame` |
| 13 | Quick Panel Runtime | WIRED | mobileQuickPanelRuntime / compact store |
| 14 | Interaction Command Bus | WIRED | InteractionCommandBus + HudCommandBus |
| 15 | 1-Action UX Law | PARTIAL | optimistic reversible only |
| 16 | State Machine Everywhere | PARTIAL | key live stores |
| 17 | Offline/Degraded Mode | PARTIAL | OfflineReconnectQueue + degraded ladder |
| 18 | Error Recovery Directory | PARTIAL | RuntimeRecoveryEngine family |
| 19 | Circuit Breakers | PARTIAL | SystemResilienceHQ / KillSwitch |
| 20 | Worker/Off-Main-Thread Runtime | PARTIAL | VisualWorkerHealthEngine |
| 21 | Frame Scheduler | WIRED | FrameBudgetScheduler |
| 22 | Long-Session Memory Discipline | PARTIAL | sample cap |
| 23 | Resource Ownership Registry | PARTIAL | OwnershipRuntime (commerce) |
| 24 | Hot/Cold Asset Cache | OPEN | — |
| 25 | Room Handoff Runtime | PARTIAL | LiveDestinationRouter / in-place GO LIVE |
| 26 | Deterministic Room Registry | WIRED | globalLiveSessionStore + scene plan store |
| 27 | Interaction Zones | PARTIAL | SpatialZoneFt |
| 28 | Seat Runtime | WIRED | audienceRuntimeEngine |
| 29 | Video-Panel Physics Runtime | PARTIAL | SpatialVideoPresenceDirector |
| 30 | Camera Director | PARTIAL | BroadcastDirectorEngine |
| 31 | Input Abstraction Layer | OPEN | — |
| 32 | Gesture Runtime | OPEN | — |
| 33 | Haptic Hooks | OPEN | — |
| 34 | Animation Budget Director | PARTIAL | PerformanceBudgetGovernor / QualityAdaptation |
| 35 | Search Runtime Repair | PARTIAL | SearchConsoleAuthorityEngine |
| 36 | Preload-Next Media | OPEN | — |
| 37 | Media Eligibility Engine | PARTIAL | IdleFallback + entitlements |
| 38 | Anti-Repetition Director | PARTIAL | ContentRotationAuthorityEngine |
| 39 | Fair Discovery Allocation | PARTIAL | ContentFreshness |
| 40 | Replay/Incident Trace | PARTIAL | ReplayEngine / SupportDiagnostics |
| 41 | Observatory Perf Command Center | PARTIAL | RuntimeTelemetry / Flight Deck |
| 42 | Automatic Health Scoring | PARTIAL | SystemResilienceHQ / StreamHealth |
| 43 | Performance Regression Gates CI | OPEN | — |
| 44 | Synthetic Lab Tests | PARTIAL | ChaosRuntimeTester (not fake users) |
| 45 | Soak Testing | OPEN | — |
| 46 | Chaos Testing | PARTIAL | ChaosRuntimeTester |
| 47 | Phone Reality Certification | OPEN | World Director PHYSICAL CERT OPEN |
| 48 | Persistence Checkpoints | PARTIAL | liveDevicePersistence |
| 49 | Versioned Runtime Contracts | PARTIAL | LIVE_LOBBY_WALL / VenuePlatformContract |
| 50 | Feature Flags / Kill Switches | WIRED | feature.flags + KillSwitchPanel |
| 51 | Progressive Rollout | OPEN | — |
| 52 | Canonical Entitlement Resolver | WIRED | SubscriptionEntitlementEngine |
| 53 | Server Authority Valuable State | PARTIAL | live/go + stripe webhooks |
| 54 | Idempotency Valuable Paths | PARTIAL | stripe / tips fulfillment |
| 55 | Event Ledger | PARTIAL | RuntimeEventBus |
| 56 | Backpressure | PARTIAL | WebRTC subscribe demotion |
| 57 | Priority Classes | WIRED | P0–P5 in constitution |
| 58 | Fast First Frame | PARTIAL | T+0 camera; budgets not CI-gated |
| 59 | Placeholder Law | PARTIAL | honest OPEN states (World Director) |
| 60 | Recovery-First UX | PARTIAL | ReconnectButton / OfflineStateBanner |

**What was wired this lock (not architecture-only):** Device Quality → WorldScenePlan `lodPolicy` hint; Go Live → Canonical Media Bus `setRoomId` + Monitor A/B sources; InteractionCommandBus thin dispatcher (Hud bridge).

**Still OPEN for 100%×10:** phone/dual-device physical cert (**next = TWO-DEVICE PRESENCE GATE**), production GLB/navmesh, physical LOD, progressive stadium fill, CI perf gates, predictive streaming, input/gesture/haptic, progressive rollout. Do not claim PASS.

---

## WORLD DIRECTOR (AutonomousWorldDirector) — STATUS LOCK 2026-08-23

Canonical runtime: `apps/web/src/lib/world/` (`AutonomousWorldDirector.ts`, `WorldScenePlan.ts`, `worldScenePlanStore.ts`).  
Constant: `WORLD_DIRECTOR_CERT_STATUS = "OPEN"` — **CODE WIRED / PHYSICAL CERT OPEN** (not CERTIFIED).

```text
WORLD DIRECTOR
🟢 CODE WIRED
🟢 TYPECHECK CLEAN
🟢 MONITOR B PATH CONNECTED
🟡 DEPLOYMENT TO BE VERIFIED
⏳ PHYSICAL CERT OPEN  ← NOT CLOSED (2026-08-23 agent re-run)
⏳ PRODUCTION GEOMETRY OPEN
⏳ NAVMESH/COLLISION OPEN

NEXT CERT (FROZEN):
TWO-DEVICE AVATAR PRESENCE  ⏳ PHYSICAL ONLY
```

### TWO-DEVICE PRESENCE GATE — NEXT CERT (LOCKED 2026-08-23)

**Status: ⏳ PHYSICAL ONLY** — not PASS. Prior agent physical attempt was **BLOCKED** (no credentials / hung `:3000`). Result remains open until Marcel (or operator) completes the manual sequence below on two real devices.

```text
TWO-DEVICE PRESENCE GATE
DEVICE A — FAN
1. Sign in as real fan account.
2. Enter the target Fan Avatar Lobby / venue.
3. Confirm the canonical avatar identity loads.
4. Move the avatar.
5. Sit / stand if seating is available.
6. Trigger one allowed reaction / movement.
7. Stay connected.

DEVICE B — PERFORMER MONITOR B
1. Sign in separately as performer/host.
2. Enter the SAME roomId.
3. Open the canonical dual-monitor/media-player view.
4. Assign the house/audience view to Monitor B.
5. Confirm Device A's avatar is physically visible on Monitor B.
6. Confirm movement updates without refresh.
7. Confirm sit/stand/reaction state is visible.
8. Confirm no duplicate avatar is spawned.
9. Confirm empty seats remain empty.
10. Confirm leaving Device A removes that avatar cleanly.
```

#### Pass criteria

All Device A steps 1–7 and Device B steps 1–10 must be **physically observed** on real signed-in accounts in the same `roomId`, with no invented counts, no bot-fill inflation, and no duplicate avatar entity for Device A’s user.

#### Failure diagnostics (capture on FAIL)

Record every field available; blank = not observed:

| Field | Value |
| :--- | :--- |
| `roomId` | |
| `userId` (Device A fan) | |
| `userId` (Device B performer/host) | |
| `avatar entityId` | |
| coords (x/y/z or plan space) | |
| `seatId` | |
| Monitor B source | |
| transport state | |
| last sync timestamp | |
| error code | |

#### Failure buckets (classify the failing step)

```text
IDENTITY | PRESENCE | ROOM JOIN | SPATIAL SYNC | AVATAR RENDER
MONITOR ASSIGNMENT | NETWORK TRANSPORT | CLEANUP
```

#### Post-pass chain (document only — do NOT implement ahead of this gate)

```text
TWO-DEVICE PRESENCE GATE  ⏳ PHYSICAL ONLY
↓ 1. Production GLB + navmesh
↓ 2. Physical collision proof
↓ 3. Physical LOD / device-quality proof
↓ 4. CI performance regression gates
↓ 5. Long-session soak / recovery certification
```

**LOCK:** Do not start LOD, stadium fill, GLB/navmesh stubs, CI perf gates, soak automation, or mark this gate PASS until the TWO-DEVICE PRESENCE GATE sequence is observed on two real devices. Constitution modules stay frozen.

### WORLD DIRECTOR PHYSICAL GATE — 2026-08-23 agent run (observed only; superseded as NEXT by TWO-DEVICE PRESENCE GATE)

**Verdict: NOT CERTIFIED.** Gate incomplete. No PASS claimed for AvatarRig / Monitor A / Monitor B live path. Prior result remains **BLOCKED → ⏳ PHYSICAL ONLY** (credentials missing; local `:3000` hung).

```text
WORLD DIRECTOR PHYSICAL GATE
Monitor A performer camera          BLOCKED
Monitor B venue                     BLOCKED
Venue empty at zero audience        BLOCKED
Live Lobby Wall publication         BLOCKED
Exact-room routing                  BLOCKED
Real Fan AvatarRig appears          BLOCKED
Valid seat/zone placement           BLOCKED
Avatar visibly alive/moving         BLOCKED
No fake viewer inflation            BLOCKED
Fan leave removes presence          BLOCKED
Same roomId throughout              BLOCKED
```

**Observed evidence (only):**
- Repo HEAD short SHA: `72753240` (local workspace). Commit `e5a60e72` **not present** in this git tree.
- Code constant still `WORLD_DIRECTOR_CERT_STATUS = "OPEN"`; go-live crowd policy still `allowBotFill: false` in `AutonomousWorldDirector.ts` (source inspection — not runtime store proof).
- `http://127.0.0.1:3000` — port LISTENING (node pid from 2026-08-20) but HTTP **timed out** (5–15s). Local GO LIVE path unusable this run.
- `https://themusiciansindex.com` — HTTP 200. `/auth` loads SIGN IN with email + password fields (screenshot `.tmp-wd-auth.png`). `/hub/performer` returns **307** (auth gate).
- No `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` / performer+fan test passwords in process env or `apps/web/.env.local` — **credentials not available; passwords not invented**.
- cursor-ide-browser MCP: tabs create then vanish; navigate returns “No browser tab available” — interactive two-device session not achievable here.
- Headless Patchright reached unauthenticated `/auth` only. No camera permission, no GO LIVE, no Monitor A/B, no roomId, no Fan AvatarRig observed.

**Blockers for full gate:** (1) two real signed-in accounts (Performer + Fan), (2) working local or authenticated production session, (3) second device/browser for Fan join, (4) visual proof of canonical avatar on Monitor B, (5) clean leave/cleanup.

**Owner action:** Marcel (or operator) must execute **TWO-DEVICE PRESENCE GATE** (Device A Fan + Device B Performer/Host) on physical PC/phone. Until then status stays **⏳ PHYSICAL ONLY** — never PASS by inference.

### Prior run-order notes (historical — NEXT CERT is TWO-DEVICE PRESENCE GATE above)

1. **PC `/venue/preview`** — EMPTY→FULL, TEST labels, indoor/outdoor, no bot count leaks
2. **PC GO LIVE** — no route takeover, Monitor A camera, Monitor B venue empty, HUD usable
3. **Phone GO LIVE** — same roomId/scene plan, responsive HUD, stable camera/mic
4. **Second real account** — fan enters, real AvatarRig, valid seat, leave removes presence, count = real only *(folded into TWO-DEVICE PRESENCE GATE)*
5. **World Director state proof** — `useWorldScenePlanStore.getState().plans[roomId]` shows certification OPEN, `allowBotFill` false, correct policies

### Dependency order after TWO-DEVICE PRESENCE GATE (document only — do NOT implement ahead)

```text
TWO-DEVICE PRESENCE GATE  ⏳ PHYSICAL ONLY
↓ 1. Production GLB + navmesh
↓ 2. Physical collision proof
↓ 3. Physical LOD / device-quality proof
↓ 4. CI performance regression gates
↓ 5. Long-session soak / recovery certification
```

**LOCK:** Do not start LOD, stadium fill, fake GLB/navmesh, CI perf gates, soak automation, or mark presence PASS until TWO-DEVICE PRESENCE GATE is observed on two real devices. Constitution modules stay frozen.

---

| Major System | Status | Notes |
| :--- | :--- | :--- |
| **Authentication** | 🟢 **PASS** | NextAuth + Prisma Adapter active and stable. Login/signup/reset working. |
| **Payments / Stripe** | 🟢 **PASS** | Webhook verified. All keys confirmed test-mode aligned: `STRIPE_SECRET_KEY=sk_test_*`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_*`, all 50+ price IDs populated. Subscription page uses env-var-backed price IDs. Swap to live keys in `.env.local` before production deploy (not a code change). |
| **Uploads (Media/Audio/Video)** | 🟢 **PASS** | `/api/upload/media/route.ts` validates type/size, Vercel Blob + local dev fallback, persists to DB. `MediaUploadWidget` + `TrackUploader` integrated in Performer HQ Upload Center (`/hub/performer#upload-section`). `TrackUploader` uses real session `submitterId` — fake hardcoded ID removed. |
| **Profiles** | 🟡 **WARNING** | Basic edits work. Upload center wired. Avatar/Bookings/Beats use static registry data. Fake booking seed `req-1001` removed — `bookingMonetizationEngine` now starts empty (real requests only). Battle win/loss record not yet sourced from DB. |
| **Messaging** | 🟢 **PASS** | `/api/messages` + `/api/messages/[threadId]` rewritten to use Prisma `Conversation`/`Message` models. DB tables confirmed live (Neon/PostgreSQL). Auth via `tmi_user_email` cookie → `prisma.user` lookup. Threads persist across server restarts. |
| **Live Rooms** | 🟢 **PASS** | Connection cap guard added to Go Live POST — rejects at 500 concurrent sessions with HTTP 503 + `CAPACITY_LIMIT` code. Existing: DB cold-start recovery, atomic discovery verification, bot seeding, `BotCrowdFillEngine`. WebRTC infrastructure scale is an ops/network task; platform-side code is guarded. |
| **Ticketing** | 🟢 **PASS (CERTIFIED 2026-07-02)** | Rule 17 fully enforced at engine + API + page level. Evidence: `src/tests/rule17_ticket_authority.test.ts` — **23/23 tests passed** (createTicket: 13/13 · transferTicket: 3/3 · upgradeTicket: 5/5 · redeemTicket: 2/2). Enforcement surfaces: `createTicket()` (role check), `upgradeTicket()` (role check added), `transferTicket()` (ownership check added), `/api/tickets/validate` (auth gated), `/api/tickets/scan` (auth gated), `/api/tickets/print` (session required), `/api/tickets/history` (caller-scoped), `/venues/[slug]/tickets/create` page (server-side redirect for wrong role). **Known production gap**: inventory counters are in-memory Maps — requires Prisma `EventInventory` table + atomic counter before high-volume events. |
| **Sponsor Ads** | 🟢 **PASS** | `getAdSlotForZone()` verified: Paid → Platform Promo (5 rotating real CTAs) → Ad Network → Advertise CTA. Admin UI at `/admin/sponsor-zones` wired + file-persisted. No slot ever renders empty. Ops task: Marcel provisions first paying sponsor via `/admin/sponsor-zones`. |
| **Magazine Engine** | 🟢 **PASS** | `/editorial/write` page built — title, subtitle, body form, PUBLISH NOW + SAVE DRAFT. `POST /api/magazine/articles` creates `Article` in Prisma (`DRAFT`/`PUBLISHED`), auto-slugs, deduplicates slugs. Writer Hub (`/hub/writer`) links to it. Published articles queryable via `GET /api/magazine/articles`. |
| **Live Registry / Homepage** | 🟢 **PASS** | `GlobalLiveSessionRegistry` feeds Home 1/3/5 via `/api/homepage/live`. Home 1 polls every 10s. `DiscoveryRail` uses real registry. No localized mock `isLive` flags remaining (purged in P0-3 session). |
| **Global Media Controller** | 🟢 **PASS** | Wired to `globalMediaStore` (Zustand). Real `<audio>/<video>` refs. Shuffle (Fisher-Yates), repeat (none/one/all), seek on progress bar. |
| **Media Queue** | 🟢 **PASS** | `components/media/MediaQueue.tsx` — drag-and-drop reorder via dnd-kit, wired to store `setQueue`. |
| **Runtime Event Bus** | 🟢 **PASS** | `lib/runtime/RuntimeEventBus.ts` — centralized backbone replacing scattered `window.dispatchEvent` calls. Backward-compatible (mirrors to window). 20 typed channels (`CHANNELS` constants). Observable (`subscribe`/wildcard `*`). Per-channel history (50) + global history (200). Rolling metrics: EPS, latency, channel counts, subscriber counts. `replay()` dev-mode replay. WebSocket bridge hook for future multi-device sync. |
| **Broadcast Overlay Runtime** | 🟢 **PASS** | `lib/broadcast/BroadcastOverlayRuntime.ts` — typed overlay events (album_drop / winner_reveal / announcement / etc.) routed to 10 destinations (performer_monitor, audience_venue, lobby_wall, home3_live, home1, home1_2_billboard, admin_observatory, mobile_companion, simulcast, magazine_banner). Priority queue with high-preempt. |
| **Theme Runtime** | 🟢 **PASS** | `lib/themes/ThemeRuntime.ts` — 6-layer priority stack: Base → Scope → Sponsor → Emergency → Seasonal → Accessibility. Emergency layer (outage/safety/dmca/maintenance) admin-only. Accessibility layer always wins. CSS custom properties applied to DOM. |
| **Character Runtime** | 🟢 **PASS** | `lib/hosts/CharacterRuntime.ts` façade + `lib/hosts/CharacterRegistry.ts` — 9 AI hosts, each with per-context emotionMap (17 SpeechContext values → EmotionBehavior). Voice → avatar pipeline: `speak()` → emotion → `setHostState()` → `HostAvatarPortrait` animation + speech bubble. |
| **Runtime Observatory** | 🟢 **PASS** | `components/admin/RuntimeObservatory.tsx` — live event stream (auto-subscribes to bus), EPS gauge, channel traffic table, pause/resume, replay (dev). Wired into `/admin/observatory` as "RUNTIME BUS" tab. |

---

### Soft Launch Gate Checklist

| Gate | Status | Action Required |
| :--- | :--- | :--- |
| Users can register, log in, reset password | 🟢 Done | — |
| Performers can go live (no artificial blocks) | 🟢 Done | — |
| Revenue paths (subscriptions) server-verified | 🟢 Done | Stripe key mode alignment needed for production |
| Live sessions appear on Home 1/3/5 discovery | 🟢 Done | — |
| Media upload route functional | 🟢 Done | — |
| Performer can upload song visible on profile | 🟢 Done | Upload Center at `#upload-section` in `/hub/performer`. `MediaUploadWidget` + `TrackUploader` both wired with real session userId. |
| Fan can buy a ticket | 🟢 Done | `/tickets` fetches real DB events. Checkout flow complete. Rule 17 compliant. |
| Admin can see real revenue | 🟢 Done | Webhook records events to observatory |

---

### P0 Sequence Status

| Item | Status |
| :--- | :--- |
| P0-2: Revenue Loop (Stripe E2E) | 🟢 Verified in test mode with webhook + checkout flow active. |
| P0-3: Creator Discovery (Go Live → registry → homepage) | 🟢 Certified |
| P0-4: Audience Presence (seating + reactions) | 🟢 Engine running |
| P0-5: Creator Publishing Studios | 🟢 Phase 1 complete (Music Studio, Submission flow, Playlist/Queue separation) |
| P0-6: Revenue Activation Readiness | 🟡 Pending first paid sponsor zone provisioning |

---

### Summary: 18 PASS · 1 WARNING · 0 FAIL · 1 PRODUCTION GAP

**PASS:** Authentication, Payments, Uploads, Profiles (partial), Messaging, Live Rooms, Ticketing *(certified 2026-07-02 — 23/23 engine tests)*, Sponsor Ads, Magazine Engine, Live Registry/Homepage, Global Media Controller, Media Queue, Runtime Event Bus, Broadcast Overlay Runtime, Theme Runtime, Character Runtime, Runtime Observatory

**WARNING (1 remaining):**
1. **Profiles** — Fake booking seed removed. Avatar/Beats use static registry data. Battle win/loss record not yet pulled from DB battles system. Functionally acceptable for soft launch.

---

### Remaining Priority Items (Pre-Production)

1. **First sponsor provisioning** — use `/admin/sponsor-zones` to activate at least one paying sponsor zone; until then all ad slots show platform promos (Rule 12 chain still works, not a hard blocker)
2. **Production key swap window** — when promoting to production, replace test Stripe keys/price IDs with live-mode equivalents in one controlled deploy window
3. **Ticket inventory persistence** — ✅ DONE (2026-07-05): `EventInventory` model added to `packages/db/prisma/schema.prisma`. `/api/tickets/create` now uses Prisma atomic counter (`Serializable` transaction) before calling `ticketEngine`. Falls back to in-memory if DB unavailable. Requires `prisma migrate deploy` on production deploy.

### Pass 2 — Runtime Integration (Wave 1 COMPLETE)

- ✅ **BroadcastControlRuntime** built (`lib/broadcast/BroadcastControlRuntime.ts`) — integration layer between GoLiveStudio and all downstream systems
- ✅ **GoLiveStudio wired** — `handleGoLive()` routes through `startBroadcast()` instead of calling `/api/live/go` directly; `handleEndBroadcast()` routes through `endBroadcast()`; live timer + viewer count forwarded to runtime; unmount cleanup added
- ✅ **StageLifecycleEngine → RuntimeEventBus bridge** active — every stage transition (COUNTDOWN, CURTAIN_PART, CAMERA_LIVE, INTERMISSION, ENDED) now publishes to `CHANNELS.VENUE_*` so Home 1/1-2/3, Observatory, Lobby Wall can subscribe without coupling to GoLiveStudio internals
- ✅ **GlobalLiveSessionRegistry confirmed single source** — `lib/live/GlobalLiveSessionRegistry.ts` is a 3-line re-export barrel; canonical source is `lib/broadcast/GlobalLiveSessionRegistry.ts`
- ✅ **TypeScript clean** — all 4 new/modified files pass `tsc --noEmit`
- ✅ **Fan ticket page caller fixes** — `transferTicket` and `upgradeTicket` call sites updated with required role/actorId args; Rule 17 enforcement now fires correctly at runtime

Wave 2 Complete (2026-07-05):
- ✅ **Persistent ticket inventory** — `EventInventory` model in schema; `/api/tickets/create` uses Prisma atomic upsert/increment with `Serializable` isolation. Requires `prisma migrate deploy` to activate.
- ✅ **Home 1 cross-client liveness** — `Home1CoverPage` now polls `/api/homepage/live?limit=20` every 10s (same as Home 3). `onSessionsChanged` subscription also retained for same-process optimistic updates. Registry `broadcast()` chain verified end-to-end.
- ✅ **Go-live propagation chain verified** — `BroadcastControlRuntime.startBroadcast()` → POST `/api/live/go` (server registry) → `CHANNELS.VENUE_OPEN` + `CHANNELS.WORLD_SESSION_ADDED` → stage countdown → CAMERA_LIVE → `CHANNELS.VENUE_PERFORMER_ENTERS`. Both Home 1 and Home 3 update within 10s via API poll.
- ✅ **SeatClaimRail auth bypass fixed** — was calling `createTicket` directly from client component (bypassed Rule 17). Now calls `POST /api/tickets/create` via fetch. (Note: SeatClaimRail is currently an orphan — no active consumers.)
- ✅ **Admin feeds fake data purged** — `/api/admin/feeds/route.ts` rewrote all 8 sources to use `getActiveSessions()`/`getSessionsByCategory()`. No more `Math.random()` viewer counts or hardcoded fake performer names/ticket IDs.
- ✅ **useGhostForce fake viewers removed** — `viewerCount` state seeded with `12 + Math.random()*48` and drift removed. Returns `viewerCount: 0`. Bot chat/hype/tip messages kept (legitimate platform feature).
- ✅ **Wave 3 Rule 20 violations fixed (2026-07-05):**
  - `go-live/page.tsx` — `viewerCount={Math.min(liveSeconds, 99)}` → `viewerCount={0}` (elapsed seconds ≠ viewers)
  - `live/rooms/page.tsx` — removed 3-second `Math.random()` viewer count drift interval; all room viewer counts set to 0 (rooms are templates, not real live sessions)
  - `submit/confirm/page.tsx` — removed `viewers` state (`142 + Math.random()*340` seed) + 4-second drift; "in the room" display replaced with "Your track is now in the system"
  - `ArenaRadar.tsx` — removed `audience + Math.floor((Math.random()-0.3)*8)` drift from countdown interval; audience count stays static
  - `ConductorDeck.tsx` — removed `viewerCount + Math.floor((Math.random()-0.45)*5)` drift; initial hardcoded `1240` changed to `0`
- ✅ **Wave 3 (extended) Rule 20 violations fixed (2026-07-05):**
  - `GhostUserEngine.tsx` — removed `baseViewers()` function (time-of-day fake seed 12-80) + removed ±1-3 random drift every 8-15s; `viewers` now starts at 0 and only increments via legitimate ghost bot arrivals
  - `cypher/stage/page.tsx` — removed `setViewers` random drift inside bot hype interval; initial hardcoded `342` changed to `0`
  - `live/stage-control/page.tsx` — removed "Viewer simulation" `setInterval` (Math.random drift); hardcoded start `{ count: 14 }` changed to `{ count: 0, peak: 0 }`
- ✅ **Wave 4 — Stream & Win Radio journey (2026-07-06):**
  - `lib/radio/RadioSessionEngine.ts` — NEW: real waiting-room/session registry (launch threshold 5 artists, dedupe by submitter, real counts only per Rule 25 Session Launch Model)
  - `/api/radio/session` — NEW: GET state + POST join (rate-limited)
  - `/api/submissions/queue` — fake SEED_QUEUE (5 fabricated artists) replaced with real `listSubmissions()` data (Rule 20 fix)
  - `/api/submissions` — added `?id=` single-submission lookup for status polling
  - `radio/page.tsx` — full honest rewrite: removed 8 fake stations with fabricated listener counts (1240/2140/3240), sine-wave listener drift, fake track queue, client-side fake XP drip; now shows real session waiting room ("X of 5 artists" from registry), real rotation from live submissions, honest empty/loading/error states
  - `submit/confirm/page.tsx` — status chain now driven by real polled submission status (pending→In Review, approved→Ready, live→In Rotation, rejected honest state); real waiting-room panel; INVITE ANOTHER ARTIST big button (tracked share link); JOIN button posts real waiting-room join then routes
  - `StreamAndWinRadioPlayer.tsx` — fixed permanent "Tuning Frequencies..." fake-loading state; now distinguishes loading/empty/error
  - `NotificationEngine.ts` — added `radio` type + `radioSessionLive()`/`radioWaitingRoom()`; fired on real waiting→live transition detected by poll
  - `RadioJourneyCard.tsx` — NEW dashboard status card in `/hub/performer`: renders only when a real radio submission exists (localStorage `tmi_last_submission`), polls real submission status + session lobby state, shows "Artists Joined X / 5" + "waiting for N more artists" (real counts only), JOIN LOBBY (real join POST) + INVITE FRIENDS buttons
  - Lobby wording pass — "queue" removed from user-visible radio surfaces ("YOU'RE IN THE RADIO LOBBY" hero, "Submission received — it's in review" hub notice); invite copy set to Marcel's exact wording (boost granted "after they become active")
  - ⚠️ Known honest gaps: 3-Day Rotation Boost crediting backend not built (referral link tracking IS real via ShareTrackingEngine); RadioSessionEngine is in-memory (same persistence class as SubmissionEngine — serverless instances don't share state); rotation-credit earning/spending not built
- Authenticated certification test (real session cookie in test runner) — still open

### Blocker Register

| Launch Blocker | Production Status | Root Cause | Impacted Modules | Recommended Owner |
| :--- | :--- | :--- | :--- | :--- |
| Stripe mode mismatch between secret key and configured price IDs | Closed (test mode aligned) | Runtime now fully test-mode aligned; remaining task is future live-key rollout, not a launch code defect | `/account/subscription`, `/api/stripe/checkout`, Stripe webhook revenue path | Marcel (Env/Deploy owner) |
| No funded sponsor campaign currently mapped to live zones | Open | Sponsor zone manager is wired but no paying sponsor activated yet | `/admin/sponsor-zones`, `AdRenderer`, Rule 12 paid-slot chain | Marcel + Sponsor Ops |

### Deferred Post-Launch Items

- Avatar pipeline (face scan → 3D bobblehead) — multi-session specialist work
- Messaging WebSocket persistence
- Magazine writer publishing UI
- Theme Store purchase flow
- Dating Lounge
- Radio Network

---

## MASTER MODULE CERTIFICATION PROOF MATRIX

```text
CERTIFICATION LAW

CODE EXISTS ≠ FEATURE CERTIFIED
AUTOMATED TEST PASSES ≠ PHYSICAL CERTIFICATION
PHYSICAL PASS = exact required behavior observed on real device/runtime without hidden workarounds.

If a physical test FAILS:
record exact failing step first,
then modify ONLY the failing execution path.
Do not redesign frozen architecture.
```

### Module Proof Index

#### 1. QP-10 / QUICK PANELS — FUNCTIONAL (desktop harness)
* **Status**: ⏳ READY FOR HARNESS RE-RUN (post mobile collapse patch)
* **Canonical Components**: `components/hud/CompactFloatingQuickPanel.tsx`, `lib/hud/compactQuickPanelStore.ts`, `components/hud/CompactQuickPanelHost.tsx`, `components/hud/panels/RemoteQuickPanel.tsx`, `lib/shuffle/VideoShuffleModeRuntime.ts`, `lib/discovery/SnipsDiscoveryRuntime.ts`, `components/hud/panels/SnipsSwipeOverlay.tsx`, `components/commandCenter/MobileQuickPanelBar.tsx`, `lib/commandCenter/mobileCommandCenterCapabilities.ts`
* **Proof Steps**:
  1. Tap **LOBBIES** → compact panel opens → shell stays → no route jump → scroll works → tapping room enters via same media experience.
  2. Tap **REMOTE** → PLAYLIST tab shows canonical playlists + search works → PLAYER tab controls same active player → playlist switching does not create a second player.
  3. Tap **VIDEO SHUFFLE** → video starts immediately in canonical player → no landing page → queue continues.
  4. Tap **SNIPS** → eligible public sources appear → tapping source routes to canonical destination.
  5. Open panels while multiple monitor frames are active → one parks visually, other remains live; close returns to same state.
* **Evidence Block**:
  ```text
  QP-10 FUNCTIONAL PROOF EVIDENCE
  PANEL OPENED IN PLACE: YES / NO
  ROUTE JUMP: YES / NO
  SECOND PLAYER CREATED: YES / NO
  MONITOR PARKED WITHOUT RESET: YES / NO
  SCROLL / THUMB ACCESS: PASS / FAIL
  VIDEO SHUFFLE HARNESS STEP: PASS / FAIL / BLOCKED
  ```

#### 1b. QP-10 / QUICK PANELS — MOBILE VISUAL (360 / 390 / 430)
* **Status**: ⏳ OPEN — code collapse landed; physical device screenshots still required
* **Canonical Components**: `components/commandCenter/CommandCenterShell.tsx`, `components/commandCenter/CommandCenterSessionControlStrip.tsx`, `components/commandCenter/PersistentMediaInteractionDock.tsx`, `components/commandCenter/MobileQuickPanelBar.tsx`, `lib/commandCenter/mobileCommandCenterCapabilities.ts`, `components/mobile/PWAInstallPrompt.tsx`
* **Proof Steps**:
  1. `/hub/fan` and `/hub/performer` at 360 / 390 / 430 px: **LOBBIES** on quick-panel bar (not STAGE); no duplicate CAM+CAMERA on primary strip.
  2. Right nav (HOME|DISCOVER|LIVE NOW|…) hidden behind **NAV ▴** drawer — not permanently expanded.
  3. Secondary utilities (SHARE SCREEN|RECORD|SHARE|AUTO) only inside **MORE ▴** tray.
  4. **INSTALL TMI** banner suppressed on hub + during GO LIVE / camera session; NOT NOW persists 7 days.
  5. Mini player region stable — quick panels open below without playback restart.
* **Evidence Block**:
  ```text
  QP-10 MOBILE VISUAL EVIDENCE
  DEVICE WIDTH: 360 / 390 / 430
  STAGE LABEL ABSENT: YES / NO
  LOBBIES ON QUICK BAR: YES / NO
  NAV COLLAPSED: YES / NO
  MORE TRAY WORKS: YES / NO
  PWA SUPPRESSED ON HUB: YES / NO
  MINI PLAYER STABLE: PASS / FAIL
  ```

#### 2. GO LIVE PHYSICAL RETEST
* **Status**: 🔴 PHYSICAL FAIL (2026-08-21 — code path converged; phone proof required)
* **Superseding law**: ONE TAP GO LIVE stays on Command Center — Monitor A = local cam, Monitor B = venue, publish LiveSession for fans, NO broadcaster route change / Welcome / Wave / starfield.
* **Canonical Components**: `components/commandCenter/CommandCenterSessionControlStrip.tsx`, `lib/dock/presentInstantGoLiveInPlace.ts`, `lib/dock/executeInstantGoLive.ts`, `components/commandCenter/CommandCenterMediaStack.tsx`, `components/live/HubMonitorCameraPlayer.tsx`, `components/live/HubMonitorVenuePlayer.tsx`
* **Proof Steps**:
  1. Load performer shell on phone Preview: camera OFF, mic OFF, live false; monitors may idle-rotate.
  2. Tap GO LIVE once: URL stays on `/hub` (or Command Center) — never `/live/lobby` or `/live/rooms/{id}` for broadcaster.
  3. Monitor A = self-camera within ~1s; Monitor B = UniversalVenueRenderer (empty→presence); idle MNS/Kiara rotation STOPPED.
  4. No VENUE READY / Welcome / Wave takeover flicker for broadcaster.
  5. Fan joins via Lobby Wall → `/live/rooms/{sameRoomId}`.
  6. SWAP / FULLSCREEN does not restart camera or remount venue.
* **Evidence Block**:
  ```text
  GO LIVE PROOF EVIDENCE
  BUTTON FIRED: YES / NO
  ROUTE STAYED ON COMMAND CENTER: YES / NO
  MONITOR A SELF-CAM: YES / NO
  MONITOR B VENUE: YES / NO
  IDLE ROTATION STOPPED: YES / NO
  WELCOME/WAVE/VENUE-READY FLICKER: YES / NO
  REGISTRY PUBLISHED (fan discoverable): YES / NO
  SAME ROOM ID FAN JOIN: YES / NO
  ```
* **Cert rule**: stays 🔴 PHYSICAL FAIL until phone screenshots prove Monitor A self-cam + Monitor B venue + no redirect.

#### 3. GATE 3 BROADCAST CONVERGENCE
* **Status**: ⏳ OPEN
* **Canonical Components**: `lib/broadcast/BroadcastControlRuntime.ts`, `lib/live/GlobalLiveSessionRegistry.ts`, `components/live/AudienceField.tsx`
* **Proof Steps**:
  1. Performer enters live room → verify canonical session `roomId`.
  2. Monitor A = performer source; Monitor B = canonical venue view.
  3. Audience enters same `roomId` → verify real fan presence; 0 attendees shows empty seats.
  4. Media continuity: same player runtime survives fullscreen + exit.
  5. End LIVE: publication stops and LIVE indicator clears.
* **Evidence Block**:
  ```text
  GATE 3 PROOF EVIDENCE
  PERFORMER ROOM ID: <id>
  AUDIENCE ROOM ID: <id>
  MONITOR ROOM ID: <id>
  ALL IDENTICAL: YES / NO
  REAL AUDIENCE PRESENCE: YES / NO
  LOBBY WALL PREVIEW: YES / NO
  HOME LIVE SLOT: YES / NO
  EXACT-ROOM ENTRY: YES / NO
  DUPLICATE WEBRTC CAPTURE: YES / NO
  ```

#### 4. GATE 4 AUDIO PERSISTENCE
* **Status**: ⏳ OPEN
* **Canonical Components**: `apps/web/src/app/api/upload/media/route.ts`, `lib/media/blobStorage.ts`, `lib/playlists/PlaylistEngine.ts`
* **Proof Steps**:
  1. Log in → upload beat → ensure blob/store size > 0.
  2. Hit PLAY → confirm audible playback.
  3. Refresh page → PLAY same track.
* **Evidence Block**:
  ```text
  GATE 4 PROOF EVIDENCE
  UPLOAD SUCCEEDED: YES / NO
  STORED URL / ASSET EXISTS: YES / NO
  AUDIBLE BEFORE REFRESH: YES / NO
  AUDIBLE AFTER REFRESH: YES / NO
  SAME TRACK ID: YES / NO
  ```

#### 5. CANONICAL MEDIA PLAYER & MULTI-MONITOR GRID (1, 2, 3, 4, 6, 8)
* **Status**: 🟢 CODE CERTIFIED / ⏳ RUNTIME PROOF OPEN
* **Canonical Components**: `lib/monitors/MonitorLayoutDirector.ts`, `components/monitors/CanonicalDualMonitorStack.tsx`, `components/shell/VideoMonitorGrid.tsx`
* **Evidence Block**:
  ```text
  MEDIA PLAYER PROOF EVIDENCE
  LAYOUT: SINGLE / SPLIT_2 / SPLIT_3 / SPLIT_4 / GRID_6 / GRID_8
  SWAP WITHOUT RECONNECT: PASS / FAIL
  PARK / UNPARK WITHOUT RECONNECT: PASS / FAIL
  PRIMARY AUDIO EXCLUSIVE: PASS / FAIL
  ASPECT RATIO PRESERVED: PASS / FAIL
  6/8 SCREEN DENSITY FIT: PASS / FAIL
  ROOM ID UNCHANGED: PASS / FAIL
  ```

#### 6. LIVE SCENE EFFECTS
* **Status**: 🟢 WIRING COMPLETE / ⏳ PHYSICAL PROOF OPEN
* **Canonical Components**: `lib/effects/TmiFilterEngine.ts`, `lib/effects/BattleMomentumEngine.ts`, `components/effects/LiveFxDrawer.tsx`
* **Proof Steps**:
  1. Apply presentation effect → verify WebRTC stream remains active without reconnecting.
  2. Switch presets → verify zero audio/video drops.

#### 7. MAGAZINE READER & EDITORIAL SYSTEM
* **Status**: 🟢 CONSOLIDATED / ⏳ PHONE VIEWPORT PROOF OPEN
* **Canonical Components**: `/magazine/issue/current`, `components/magazine/TMIMagazineEngine.tsx`, `components/magazine/SafeMagazineImage.tsx`
* **Proof Steps**:
  1. Phone: Edge-to-edge 100dvw/100dvh single-page flip mode.
  2. Media fallback: missing assets render safe editorial placeholder without layout collapse.

#### 8. YOUTH SAFETY & AGE GUARDRAILS
* **Status**: 🟢 CODE & TEST CERTIFIED (72/72 PASS)
* **Canonical Components**: `lib/trustSafety/YouthSocialGuard.ts`, `/api/account/update-age/route.ts`
* **Proof Steps**:
  1. 16-17 minors barred from adult 1:1 contact without verified family link.
  2. Missing age state triggers inline DOB completion, updates Prisma, and unlocks messaging cleanly.

#### 9. AVATAR STUDIO
* **Status**: 🟢 CANONICAL ROUTING ACTIVE
* **Canonical Components**: `/settings/avatar`, `components/avatar/AvatarStudioExperience.tsx`
* **Proof Steps**:
  1. All customize/avatar links (`/avatar/customize`, `/avatar-builder`, `/avatar/shop`) auto-redirect to `/settings/avatar`.
  2. Avatar is centered with 3D orbit controls and side category panels.

#### 10. FREE-ROAM + COLLISION MESH CERTIFICATION
* **Status**: ⏳ OPEN
* **Evidence Block**:
  ```text
  COLLISION PROOF EVIDENCE
  FLOOR DETECTION: PASS / FAIL
  WALL COLLISION: PASS / FAIL
  PROP COLLISION: PASS / FAIL
  AVATAR / PERSONAL SPACE: PASS / FAIL / N/A
  VIDEO PANEL COLLISION: PASS / FAIL
  STAIRS / RAMPS: PASS / FAIL
  SEATING: PASS / FAIL
  MOVEMENT REMAINS FREE-ROAM: PASS / FAIL
  ```

#### 11. STRIPE COMMERCE & ENTITLEMENTS
* **Status**: 🟢 MODULE PATH FIXED / ⏳ END-TO-END PAYMENT PROOF OPEN
* **Canonical Components**: `lib/commerce/CommerceCatalogContract.ts`, `/api/stripe/checkout/route.ts`, `/api/stripe/webhook/route.ts`
* **Evidence Block**:
  ```text
  COMMERCE PROOF EVIDENCE
  CHECKOUT SESSION CREATED: YES / NO
  PAYMENT SUCCEEDED: YES / NO
  SIGNED WEBHOOK RECEIVED: YES / NO
  ORDER SETTLED ONCE: YES / NO
  ENTITLEMENT GRANTED ONCE: YES / NO
  WEBHOOK REPLAY DUPLICATED ENTITLEMENT: YES / NO
  OWNERSHIP VISIBLE IN UI: YES / NO
  ```

