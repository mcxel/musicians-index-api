# TMI Platform — Route Wiring Report
Generated: 2026-06-14

Route status: whether the route file exists, what it renders, and whether it's properly wired to its engine.

---

## Revenue Routes (P0)

| Route | File Exists | Engine Wired | Data Source | Status |
|---|---|---|---|---|
| `/api/stripe/checkout` | YES | YES — Stripe `createCheckoutSession` | Real Stripe keys required | ✅ WIRED |
| `/api/stripe/webhook` | YES | YES — handles subscription events | Real Stripe webhook secret required | ✅ WIRED |
| `/api/stripe/customer` | YES | YES | Requires STRIPE_SECRET_KEY | ✅ WIRED |
| `/api/auth/login` | YES | YES | Prisma + bcrypt | ✅ WIRED |
| `/api/auth/register` | YES | YES | Prisma | ✅ WIRED |
| `/api/auth/session` | YES | YES | Cookie-based | ✅ WIRED |
| `/api/auth/logout` | YES | YES | Clears cookie | ✅ WIRED |
| `/api/auth/provision` | YES | YES | Creates user + assigns role | ✅ WIRED |

---

## Home Routes

| Route | File Exists | Engine Wired | Data Source | Status |
|---|---|---|---|---|
| `/home/1` | YES | YES — Home1CoverPage | PLACEHOLDER performer data | ⚠️ PARTIAL |
| `/home/1-2` | YES | YES — BillboardLiveWall | Real API + mock fallback | ⚠️ PARTIAL |
| `/home/2` | YES | Surface component | Static content | ⚠️ PARTIAL |
| `/home/3` | YES | Surface component | Static content | ⚠️ PARTIAL |
| `/home/4` | YES | Surface component | Static content | ⚠️ PARTIAL |
| `/home/5` | YES | Surface component | Static content | ⚠️ PARTIAL |

---

## Profile Routes

| Route | File Exists | Engine Wired | Data Source | Status |
|---|---|---|---|---|
| `/fan/[slug]` | YES | ProfileLobbyRuntime role="fan" | Slug → display name only | ✅ FIXED THIS SESSION |
| `/performers/[slug]` | YES | ProfileLobbyRuntime role="performer" | Slug → display name only | ✅ FIXED THIS SESSION |
| `/fan/theater` | YES | AudienceScene view="fan" + Playlist UI | PLACEHOLDER tracks, no real audio | ⚠️ PARTIAL |
| `/fan/[slug]/memory` | YES | MemoryWallEngine | Not persisted to DB | ⚠️ PARTIAL |
| `/fan/memories` | UNKNOWN | — | — | ❓ VERIFY EXISTS |
| `/fan/trivia` | UNKNOWN | — | — | ❓ VERIFY EXISTS |

---

## Live / Arena Routes

| Route | File Exists | Engine Wired | Data Source | Status |
|---|---|---|---|---|
| `/live/go` | YES | GoLiveStudio + Daily.co | Real camera + env vars | ✅ WIRED |
| `/live/audience` | YES | AudienceScene view="fan" | Canvas crowd | ✅ WIRED |
| `/live/arena/[id]` | YES | AudienceScene + participant list | Real room if joined | ⚠️ PARTIAL |
| `/battles/live` | YES | BattleMatchLifecycleEngine | DEMO_BATTLES hardcoded | ⚠️ PARTIAL |
| `/cypher/stage` | YES | AudienceScene + CYPHER_PARTICIPANTS | 4 hardcoded participants | ⚠️ PARTIAL |
| `/compete` | YES | Challenge timer + vote logic | Hardcoded QUEUE | ⚠️ PARTIAL |
| `/arena` | YES | Arena landing page | Hardcoded battle listings | ⚠️ PARTIAL |
| `/live/rooms/monthly-idol` | UNKNOWN | — | — | ❓ VERIFY EXISTS |

---

## API Routes

| Route | File Exists | Engine | Status |
|---|---|---|---|
| `/api/upload` | YES | Vercel Blob / base64 | ✅ WIRED |
| `/api/avatar/save` | YES | avatarPersistence | ✅ WIRED |
| `/api/memory/capture` | YES | MemoryCaptureEngine | ✅ WIRED |
| `/api/messages` | YES | messageThreadEngine | ✅ WIRED |
| `/api/messages/[threadId]` | YES | messageThreadEngine | ✅ WIRED |
| `/api/live/go` | YES | GlobalLiveSessionRegistry + Prisma | ✅ WIRED |
| `/api/rtc/signal` | YES | In-memory signal store | ✅ WIRED |
| `/api/rooms/[id]/join` | YES | proxyToApi → requires API_BASE_URL | ⚠️ 501 without env var |
| `/api/validate` | YES | Returns `{ok:true, valid:true}` | ✅ WIRED |
| `/api/homepage/trending-artists` | YES | Returns trending artist data | ⚠️ Returns null → falls back to mock |

---

## Messaging Routes

| Route | File Exists | Engine | Status |
|---|---|---|---|
| `/messages` | YES | MessengerShell + messageThreadEngine | ✅ WIRED |
| `/messages/[threadId]` | YES | messageThreadEngine | ✅ WIRED |

---

## Commerce Routes

| Route | File Exists | Engine | Status |
|---|---|---|---|
| `/marketplace` | YES | Stripe checkout wired | PLACEHOLDER product catalog | ⚠️ PARTIAL |
| `/upgrade` | UNKNOWN | — | — | ❓ VERIFY EXISTS — linked from 6+ places |
| `/playlist` | YES | MediaPlayer + STATIC_TRACKS | No real audio src | ⚠️ PARTIAL |

---

## Admin Routes

| Route | File Exists | Engine | Status |
|---|---|---|---|
| `/admin/visual-queue` | YES | — | Check if admin gate active |
| `/admin` | YES (implied) | OmniDashboards | PLACEHOLDER telemetry | ⚠️ PARTIAL |

---

## Routes Needing Immediate Existence Verification

These are linked from production UI and must not 404:

1. `/upgrade` — linked from fan/theater cosmetics, PunPoints, StreamWinRoom, marketplace
2. `/fan/memories` — linked from fan/theater Memory Wall
3. `/fan/trivia` — linked from fan/theater header
4. `/live/rooms/monthly-idol` — linked from fan/theater ENTER LIVE ROOM
5. `/sponsors/advertise` — expected destination for Home 1 Sponsor CTA

Run: `pnpm typecheck` after any route fixes to catch import errors.
