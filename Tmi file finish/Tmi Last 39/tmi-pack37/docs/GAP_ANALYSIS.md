# TMI PLATFORM — FULL GAP ANALYSIS (Pack 37)
## Current Repo Truth vs What Must Still Be Built

---

## WHAT EXISTS (Proven Working)
- Local API on localhost:4000 with /api/healthz → ok
- Local web on localhost:3001
- PostgreSQL local connected + Prisma client working
- Homepage (Home 1-3) rendering in Next.js
- Home 4 Sponsors/Advertisers World (Pack 35)
- Auth routes scaffolded
- Artist dashboard scaffolded
- Admin HUD scaffolded (Pack 34)
- 49+ Prisma models from Packs 25-36
- All 4 WorldSwitcher navigation
- Games hub + Dirty Dozens + Deal or Feud pages (Pack 36)
- Venues page (Pack 36)
- Shop page (Pack 36)

## WHAT IS MISSING — PRIORITY ORDER

### CRITICAL PATH (blocks everything else)
1. Full Prisma schema migration (Pack 37 schema adds 55+ models)
2. Backend module wiring for auth, users, rooms, games, ads, wallet
3. Frontend routes connected to real API data
4. Real-time WebSocket connection for live rooms
5. Stripe payment integration for tickets/store
6. Media upload pipeline (S3/Cloudflare R2)
7. CDN configuration for media delivery

### HIGH PRIORITY (needed before launch)
- Live room WebSocket server (rooms, chat, viewer count)
- Ad rotation engine serving real placements
- Sponsor/campaign approval workflow
- Artist earnings dashboard with real data
- Ticket purchase + QR generation + check-in
- Points calculation running on every action
- Item shop purchasing with points
- Notification system (in-app + email)

### MEDIUM PRIORITY (first month after launch)
- Mobile apps (iOS + Android via React Native or Expo)
- TV shells (Apple TV, Android TV, Roku, Amazon)
- Advanced game engines (Dirty Dozens scoring, Deal or Feud board)
- AI broadcaster system
- Face scan / avatar biometrics
- 3D audience stadium
- Voice clone system

### EXPANSION (post-launch)
- Desktop apps (Windows/Mac via Electron or Tauri)
- Kiosk interface
- Scanner/operator mobile interface
- NFT/collectible system
- Cross-platform continuity (continue watching on TV from phone)
- AI content generation (article auto-write, interview bot)

---

## MISSING BACKEND MODULES (need to be created)
```
apps/api/src/modules/
  auth/          — JWT, OAuth, refresh, logout, verify
  users/         — CRUD, role management, tier management
  profiles/      — public profile, slug routing
  artists/       — artist CRUD, slug, station, crown
  venues/        — venue CRUD, sections, staff, rooms
  events/        — event CRUD, lineup, staff
  tickets/       — tier CRUD, purchase, QR, check-in, transfer
  store/         — product CRUD, cart, checkout
  wallet/        — balance, transactions, payout (Big Ace gate)
  points/        — ledger, earn actions, daily caps, fraud
  articles/      — CRUD, publish flow, auto-create on profile
  issues/        — weekly issue assembly, archive
  ads/           — creative upload, placement, rotation, always-200
  campaigns/     — campaign CRUD, budget, approval (Big Ace gate)
  sponsors/      — sponsor CRUD, matching, tasks
  advertisers/   — advertiser CRUD, package selection
  chat/          — conversation, messages, canSendMessage gate
  friends/       — friendship, follow, block
  notifications/ — send, mark read, push, email
  media/         — upload, encode, thumbnail, CDN delivery
  livestream/    — stream key, HLS, record, replay
  rooms/         — create, join, leave, discovery-first sort
  games/         — session CRUD, rounds, scoring, winner
  scoring/       — universal engine, leaderboard, crown
  economy/       — item definitions, shop, inventory, equip
  rewards/       — earn, grant, badge, achievement
  bots/          — run, schedule, log, pause, monitor
  admin/         — audit, moderation, approvals, flags
  moderation/    — reports, actions, queue
  analytics/     — event ingestion, dashboards
  support/       — tickets, triage
  device-pairing/— TV pairing codes, cross-device sessions
  feature-flags/ — read/write flags
```

## MISSING FRONTEND ROUTES
```
apps/web/src/app/
  (public)/
    page.tsx                    — Home 1 ✅
    editorial/page.tsx          — Home 2 ✅
    lobby/page.tsx              — Home 3 ✅
    advertise/page.tsx          — Home 4 ✅
    games/page.tsx              — Games Hub ✅
    dirty-dozens/page.tsx       — Dirty Dozens ✅
    deal-or-feud/page.tsx       — Deal or Feud 1000 ✅
    venues/page.tsx             — Venue World ✅
    shop/page.tsx               — Item Shop ✅
    artists/[slug]/page.tsx     — Artist profile
    articles/[slug]/page.tsx    — Article page
    stations/[slug]/page.tsx    — Artist station
    events/[id]/page.tsx        — Event detail
    tickets/page.tsx            — My tickets
    leaderboards/page.tsx       — Leaderboards
    hall-of-fame/page.tsx       — Hall of Fame
    archive/page.tsx            — Past issues
    search/page.tsx             — Search
    discover/page.tsx           — Discover
    sponsors/page.tsx           — Sponsor info
    stores/[slug]/page.tsx      — Creator store
  (auth)/
    login/page.tsx
    register/page.tsx
    register/artist/page.tsx
    register/fan/page.tsx
    register/sponsor/page.tsx
  (onboarding)/
    onboarding/admin/page.tsx   — ✅ fixed in Pack 31
    onboarding/artist/page.tsx  — ✅ fixed in Pack 31
    onboarding/fan/page.tsx     — ✅ fixed in Pack 31
  (member)/
    dashboard/artist/page.tsx   — Artist dashboard ✅ (Pack 31)
    dashboard/fan/page.tsx
    wallet/page.tsx
    points/page.tsx
    rewards/page.tsx
    inventory/page.tsx
    notifications/page.tsx
    settings/page.tsx
    messages/page.tsx
  (live)/
    live/[roomId]/page.tsx
    cypher/[battleId]/page.tsx
  (admin)/
    admin/command-center/page.tsx — ✅ (Pack 34)
    admin/finance/profit/page.tsx
  (devices)/
    tv/page.tsx
    tv/live/page.tsx
    device/pair/page.tsx
    scanner/checkin/page.tsx
    kiosk/page.tsx
    downloads/page.tsx
  (legal)/
    privacy/page.tsx
    terms/page.tsx
    community-guidelines/page.tsx
```

## MISSING PACKAGES
```
packages/
  db/             ✅ exists
  contracts/      ✅ exists
  hud-core/       ✅ exists
  hud-runtime/    ✅ exists
  hud-theme/      ✅ exists
  hud-tmi/        ✅ exists
  scoring-engine/ — MISSING: universal scoring logic
  item-economy/   — MISSING: shop/inventory logic
  venue-engine/   — MISSING: venue/room/host logic
  broadcast-core/ — MISSING: stream key, HLS, record
  media-pipeline/ — MISSING: upload → encode → CDN
  ui-hud/         — MISSING: scenes, CRT, overlays
  audio-foley/    — MISSING: sound effects library
  cross-device/   — MISSING: device detection, input abstraction
  realtime/       — MISSING: WebSocket client sync
  analytics/      — MISSING: event ingestion client
```
