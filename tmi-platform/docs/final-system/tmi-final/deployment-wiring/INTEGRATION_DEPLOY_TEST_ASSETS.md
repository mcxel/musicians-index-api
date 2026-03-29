# FULL_SYSTEM_INTEGRATION_MAP.md
## The Wiring Guide — What Connects to What

---

## PURPOSE
This is what Copilot needs.
Every system, what it depends on, what it triggers, and where it lives in the repo.

---

## COMPLETE SYSTEM DEPENDENCY MAP

```
USER ACTION
    ↓
INPUT_OUTPUT_PIPELINE
    ↓
GLOBAL_STATE_ENGINE ←→ REALTIME_SYNC_ENGINE
    ↓                           ↓
VENUE_AI_CONDUCTOR         All Clients Sync
    ↓
┌──────────────────────────────────────┐
│         SHOW_ENGINE                  │
│  (lifecyle: load→run→end)           │
└──────────────────────────────────────┘
    ↓              ↓              ↓
AUDIO_ENGINE   CAMERA_ENGINE   VFX_ENGINE
    ↓              ↓              ↓
AUDIO_        CAMERA_          TRANSFORM-
ENVIRONMENT   DIRECTION        ATION_FX
    ↓              ↓              ↓
Room acoustic  Auto-cuts      Tier upgrade FX
    │              │              │
    └──────────────┴──────────────┘
                   ↓
         CROWD_AI + CROWD_ANIMATION
                   ↓
         Host avatars, Julius, VEX
                   ↓
         UI RENDER (React/Next.js)
```

---

## REPO LOCATION MAP

| System | Repo Path |
|---|---|
| Room specs | `docs/venues/` |
| Live systems | `docs/live/` |
| Cast system | `docs/cast/` |
| State engine | `apps/api/src/services/state/` |
| Sync engine | `apps/api/src/services/sync/` |
| Show engine | `apps/api/src/services/shows/` |
| Audio engine | `apps/api/src/services/audio/` |
| Dashboard API | `apps/api/src/modules/dashboard/` |
| Room UI | `apps/web/src/components/tmi/rooms/` |
| Show UI | `apps/web/src/components/tmi/shows/` |
| Julius UI | `apps/web/src/components/tmi/julius/` |
| VEX UI | `apps/web/src/components/tmi/vex/` |
| Host UI | `apps/web/src/components/tmi/hosts/` |
| Live routes | `apps/web/src/app/rooms/[id]/` |
| Show routes | `apps/web/src/app/shows/[id]/` |

---

## API ROUTE REGISTRY (REQUIRED)

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/rooms/[id]` | GET | Public | Load room config |
| `/api/rooms/[id]/state` | GET | Session | Get live room state |
| `/api/shows/[id]` | GET | Public | Show details |
| `/api/shows/[id]/join` | POST | Auth | Join show as viewer |
| `/api/shows/[id]/react` | POST | Auth | Send reaction |
| `/api/shows/[id]/tip` | POST | Auth | Send tip |
| `/api/live/start` | POST | Artist | Start live stream |
| `/api/live/end` | POST | Artist | End live stream |
| `/api/live/upgrade` | POST | Artist | Request room upgrade |
| `/api/dashboard/overview` | GET | Admin/Marcel | Dashboard data |
| `/api/dashboard/command` | POST | Marcel | Route command |
| `/api/dashboard/suggestion` | POST | All roles | Submit suggestion |
| `/api/venues/[id]` | GET | Public | Venue config |
| `/api/cast/rotation` | POST | System | Assign host |

---

## COMPONENT MAP (UI)

```
/rooms/[id]
  ├── RoomShell          (venue environment)
  ├── SeatGrid           (all seat positions)
  ├── StageSurface       (performance area)
  ├── ScreenWall         (main display)
  ├── CrowdLayer         (animated audience)
  ├── LightingRig        (light system)
  ├── TierProgressBar    (evolution bar)
  ├── TransformationOverlay (morph layer)
  ├── JuliusOverlay      (Julius floating)
  ├── VEXOverlay         (VEX when active)
  ├── HostAvatar         (host positioning)
  ├── ScoreboardOverlay  (shows only)
  ├── ReactionsLayer     (emoji reactions)
  ├── TipFeed            (tip notifications)
  └── EventControls      (artist HUD)
```

---

# DEPLOYMENT_FLOW.md
## Building, Testing, and Deploying the Platform

---

## DEPLOYMENT PIPELINE

```
LOCAL DEV
    ↓ pnpm dev
    ↓ verify: pages load, API responds
    ↓
LOCAL TEST
    ↓ pnpm test
    ↓ verify: unit tests, integration tests
    ↓
COMMIT + PUSH
    ↓ git commit -m "fix: [specific fix]"
    ↓ git push origin main
    ↓
GITHUB ACTIONS (CI)
    ↓ build-test workflow runs
    ↓ TypeScript check
    ↓ API build
    ↓ Web build
    ↓ E2E proof
    ↓ verify: run 23248805537 pattern (GREEN)
    ↓
CLOUDFLARE PAGES
    ↓ musicians-index-api build
    ↓ musicians-index-web build
    ↓ verify: both green ← CURRENT BLOCKER
    ↓
LIVE URL SMOKE TEST
    ↓ homepage loads
    ↓ auth works
    ↓ onboarding works
    ↓ dashboard loads (Marcel view)
    ↓
ONBOARDING PROOF
    ↓ artist can register
    ↓ fan can register
    ↓ profiles save
    ↓ articles auto-create
    ↓
OPEN TO MEMBERS
```

---

## CURRENT BLOCKER STATUS

```
GitHub CI:        ✅ GREEN (commit 3a81795)
musicians-index-api: ❌ Cloudflare build failing
musicians-index-web: ❌ Cloudflare build failing
```

**Next action**: Paste first 30–50 lines of Cloudflare error for each service.

---

## ENV VARS REQUIRED

```env
# API
DATABASE_URL=postgres://...
NEXTAUTH_SECRET=...
ROUTING_STATE_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
API_BASE_URL=...

# Web
NEXT_PUBLIC_APP_URL=...
NEXT_PUBLIC_API_URL=...
NEXTAUTH_URL=...
NEXT_PUBLIC_GA_ID=...
```

---

# SYSTEM_TEST_MATRIX.md
## Full System Test Coverage

---

## LAYER 1: ROOM SYSTEM TESTS

| Test | Expected | Pass |
|---|---|---|
| All 15 rooms load | No errors | |
| Tier upgrade triggers | Sequence runs completely | |
| Seat anchor holds during upgrade | Seat position unchanged | |
| Audio switches on room change | Acoustic profile updates | |
| Camera auto-direction | Follows event trigger | |
| Crowd energy rises on reaction | +2 per clap | |
| Crowd energy decays | 2 pts/sec base | |

## LAYER 2: LIVE EVENT TESTS

| Test | Expected | Pass |
|---|---|---|
| Artist goes live | Venue loads, audience can join | |
| Viewer joins mid-event | Current state restored | |
| World Concert multi-venue | All venues sync within 500ms | |
| VEX proximity audio | Scales with distance | |
| Tier upgrade during event | Seats stay, room morphs | |
| Stream ends gracefully | Outro plays, crowd releases | |

## LAYER 3: FAILURE TESTS

| Test | Expected | Pass |
|---|---|---|
| Animation fails | Snaps to final state | |
| Audio fails | Fallback track | |
| Stream drops | Recovery overlay, Julius helper | |
| User disconnects + reconnects | Same seat, same state | |
| Server high load | Auto-downgrade triggers | |
| Total sync loss | Recovery engine activates | |

## LAYER 4: ROLE TESTS

| Test | Expected | Pass |
|---|---|---|
| Marcel can view dashboard | Full analytics visible | |
| Marcel cannot execute commands | Route blocked | |
| Jay Paul can view | Analytics visible | |
| Jay Paul cannot command | Route blocked | |
| Big Ace full control | All routes accessible | |

## LAYER 5: PERFORMANCE TESTS

| Test | Expected | Pass |
|---|---|---|
| 10 users, full quality | 60fps | |
| 100 users | Optimization triggers | |
| 1,000 users | Wave crowd, 30fps+ | |
| Mobile device | Lite mode auto-activates | |
| CPU > 80% | Downgrade triggers | |

---

# ASSET_REGISTRY_SYSTEM.md
## What Assets Exist, Where They Live, What Uses Them

---

## PURPOSE
Prevents missing assets, duplicate assets, and wrong asset loads.

---

## ASSET CATEGORIES

### Room Assets
| Asset | Rooms | Path |
|---|---|---|
| Living room shell | FREE_01 | `public/tmi/rooms/free/living-room/` |
| Circle room shell | FREE_02 | `public/tmi/rooms/free/circle/` |
| Loft shell | FREE_03 | `public/tmi/rooms/free/loft/` |
| Bar room shell | BRONZE_01 | `public/tmi/rooms/bronze/bar/` |
| Studio shell | BRONZE_02 | `public/tmi/rooms/bronze/studio/` |
| Meeting hall shell | BRONZE_03 | `public/tmi/rooms/bronze/meeting/` |
| Nightclub shell | GOLD_01 | `public/tmi/rooms/gold/nightclub/` |
| Showcase shell | GOLD_02 | `public/tmi/rooms/gold/showcase/` |
| Premium club | DIAMOND_01 | `public/tmi/rooms/diamond/premium-club/` |
| Mini concert hall | DIAMOND_02 | `public/tmi/rooms/diamond/mini-hall/` |
| Concert hall | SIG_01 | `public/tmi/rooms/signature/concert-hall/` |

### Audio Assets
| Asset | Path |
|---|---|
| Show themes (3 base) | `public/tmi/audio/themes/` |
| Transformation sounds | `public/tmi/audio/transformation/` |
| Celebration stings | `public/tmi/audio/celebration/` |
| Host voice packs | `public/tmi/audio/hosts/` |
| Julius sounds | `public/tmi/audio/julius/` |
| VEX proximity audio | `public/tmi/audio/vex/` |
| Crowd audio | `public/tmi/audio/crowd/` |
| Fail sounds (per show) | `public/tmi/audio/shows/` |

### Character Assets
| Asset | Path |
|---|---|
| All host sprites | `public/tmi/cast/hosts/` |
| Julius sprites + avatar | `public/tmi/cast/julius/` |
| VEX sprites + costumes | `public/tmi/cast/vex/` |

---

## ASSET PLACEHOLDER PLAN

Until production assets exist, each placeholder must be:
- Correct dimensions
- Correct naming convention
- Color-coded to tier (green/bronze/gold/diamond)
- Never black or empty

---

*Integration Map + Deployment + Test Matrix + Asset Registry v1.0*
*BerntoutGlobal XXL / The Musician's Index*
