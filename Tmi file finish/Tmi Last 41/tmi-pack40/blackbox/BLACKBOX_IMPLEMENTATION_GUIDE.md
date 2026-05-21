# BLACKBOX IMPLEMENTATION GUIDE
## Exact Steps to Wire Pack 37-40 Into the Repo

---

## GOLDEN RULES FOR BLACKBOX

1. **Never invent architecture** — Claude designed it, Blackbox implements it
2. **One module at a time** — build → test → commit → next module
3. **One import line only** per wave in app.module.ts
4. **Never touch locked files:** middleware.ts, auth/*, ci.yml, health/*
5. **Append-only Prisma schema** — never remove existing models
6. **Test discovery sort after Slice 3** — `pnpm test:discovery` must pass
7. **Big Ace gate on every money operation** — never auto-approve

---

## WAVE 1 — DATABASE (Do First)

```bash
cd packages/db

# Backup existing
cp prisma/schema.prisma prisma/schema.backup.$(date +%Y%m%d).prisma

# Append Pack 37 models to existing schema
# (copy from tmi-pack37/schema/schema-full.prisma — APPEND ONLY)

# Migrate
pnpm prisma migrate dev --name pack37_full_schema
pnpm prisma generate

# Seed minimum data
pnpm prisma db seed

# Verify
pnpm prisma studio  # check all tables exist
```

**Seed data required:**
```typescript
// packages/db/prisma/seed.ts
// 1. Marcel Dickens user (berntmusic33@gmail.com, isPermanentDiamond: true, tier: DIAMOND)
// 2. B.J. M Beat's user (tier: DIAMOND, isPermanentDiamond: true)
// 3. One test artist with stationSlug
// 4. One test venue
// 5. Feature flags (all false by default)
// 6. 5 house ad creatives for fallback chain
// 7. One test game definition
```

---

## WAVE 2 — BACKEND MODULES (In Dependency Order)

**Module template (copy for each):**
```bash
cd apps/api/src/modules
mkdir [name]
# Create: [name].controller.ts, [name].service.ts, [name].module.ts, [name].repository.ts
# Add one import to app.module.ts
```

**Order (each must work before next):**

1. `feature-flags` — no dependencies
2. `auth` — needs User, Session, Account models
3. `users` — needs auth
4. `profiles` — needs users
5. `artists` — needs profiles
6. `wallet` — needs users (BIG ACE GATE on all payouts)
7. `points` — needs users (enforce daily caps)
8. `notifications` — needs users
9. `media` — needs users (upload-url endpoint)
10. `articles` — needs artists (auto-create on profile completion)
11. `ads` — **CRITICAL: ads/slot/:zoneId must ALWAYS return 200**
12. `rooms` — **CRITICAL: ORDER BY viewer_count ASC NULLS FIRST**
13. `livestream` — needs rooms, artists
14. `chat` — needs rooms (canSendMessage check)
15. `events` — needs venues, artists
16. `tickets` — needs events, wallet (max 8 per buyer)
17. `store` — needs artists, wallet
18. `economy` — needs wallet, points (shop, inventory, equip)
19. `games` — needs rooms, scoring
20. `scoring` — needs games, points, rewards
21. `venues` — needs events, tickets
22. `bots` — needs all above
23. `admin` — needs all above
24. `analytics` — needs all above
25. `device-pairing` — needs users, sessions

---

## WAVE 3 — REALTIME (WebSocket)

**Install:**
```bash
cd apps/api
pnpm add @nestjs/websockets @nestjs/platform-socket.io socket.io
```

**Create gateways:**
```
apps/api/src/gateways/
  rooms.gateway.ts     — /rooms namespace
  games.gateway.ts     — /games namespace
  chat.gateway.ts      — /chat namespace (canSendMessage check)
  notifications.gateway.ts — /notifications namespace
  crown.gateway.ts     — /crown namespace
  hype.gateway.ts      — /hype namespace
  ads.gateway.ts       — /ads namespace
```

**Critical integration:**
- rooms.gateway: on viewer_joined/viewer_left → broadcast LobbyUpdateEvent with sortedBy: "viewer_count_asc"
- chat.gateway: BEFORE emit → call chat.service.canSendMessage() → block if kid+adult mismatch
- crown.gateway: on crown_awarded → emit animationDurationMs: 3000 (Platform Law)

---

## WAVE 4 — ENGINES INTO REPO

**Copy engine files:**
```bash
cp tmi-pack38/realtime/realtime.server.ts packages/realtime/src/
cp tmi-pack38/broadcast/broadcast.engine.ts packages/broadcast-engine/src/
cp tmi-pack38/scoring/scoring.service.ts packages/scoring-engine/src/
cp tmi-pack38/economy/economy.service.ts packages/economy-engine/src/
cp tmi-pack38/venue/venue.service.ts packages/venue-engine/src/
cp tmi-pack38/media-pipeline/media.pipeline.ts packages/media-pipeline/src/
cp tmi-pack38/ui-hud/ui-hud.engine.ts packages/ui-hud/src/
cp tmi-pack38/audio/audio.engine.ts packages/audio-engine/src/
```

**Create package.json for each:**
```json
{
  "name": "@tmi/[engine-name]",
  "version": "1.0.0",
  "main": "src/index.ts"
}
```

**Add to pnpm workspace packages array in pnpm-workspace.yaml**

---

## WAVE 5 — FRONTEND ROUTES

**Each page must:**
1. Import SceneBackdrop with correct sceneId
2. Import WorldSwitcher with active world number
3. Connect to real API (replace mock data)
4. Handle loading/error/empty states

**Priority order:**
1. Home 1 (/) — wire crown data, editorial, lobby preview
2. Home 2 (/editorial) — wire editorial belt, discovery, charts
3. Home 3 (/lobby) — wire room list (discovery-first sort CRITICAL)
4. Home 4 (/advertise) — wire campaigns, placements
5. /artists/[slug] — artist profile + station link (Platform Law #9)
6. /articles/[slug] — article + station link (Platform Law #9)
7. /live/[roomId] — HLS player, WebSocket connection
8. /games/* — game sessions, scoring
9. /shop — item rotation, purchase
10. /tickets — my tickets with QR

---

## WAVE 6 — VR ENGINE

**Install Three.js:**
```bash
cd apps/web
pnpm add three @types/three
# Future: pnpm add @react-three/fiber @react-three/drei
```

**Copy VR files:**
```bash
cp tmi-pack39/vr-engine/* packages/vr-engine/src/
cp tmi-pack39/components/VREntryPoint.tsx apps/web/src/components/vr/
cp tmi-pack39/components/StadiumPage.tsx apps/web/src/app/stadium/page.tsx
```

**Create routes:**
```
apps/web/src/app/
  stadium/page.tsx     ✅ (copied)
  vr/[sceneId]/page.tsx
```

**VR integration order:**
1. VREntryPoint component (device detection only)
2. WebXRManager (XR session lifecycle)
3. SceneManager (load vr-lobby first)
4. AvatarController (user's avatar in scene)
5. Connect rooms WebSocket to VR scene
6. StadiumController (last — most complex)
7. SpatialAudio (with stadium spatial layout)

---

## WAVE 7 — MEDIA PIPELINE

**Storage setup:**
```bash
# Option A: AWS S3
# Option B: Cloudflare R2 (recommended — cheaper, no egress fees)
# Configure in .env: STORAGE_BUCKET, STORAGE_REGION, STORAGE_KEY, STORAGE_SECRET

# FFmpeg for video transcoding:
# Install on API server
apt install ffmpeg
```

**Create worker:**
```
apps/api/src/workers/
  media-transcoder.worker.ts   — video → HLS pipeline
  image-resizer.worker.ts      — image → multiple sizes
  audio-encoder.worker.ts      — audio → AAC + waveform
  thumbnail.worker.ts          — video frame → thumbnail
```

---

## PROOF GATES (Run After Each Wave)

```bash
# Wave 1: Database
pnpm prisma migrate status   # all applied
pnpm prisma studio           # all tables visible

# Wave 2: API Modules
curl /api/healthz             # ok:true
curl /api/readyz              # ok:true
curl /api/ads/slot/HOME1_HERO # HTTP 200 always

# Wave 3: Realtime
wscat -c ws://localhost:4000/rooms  # connects

# Wave 5: Frontend
# Homepage loads
# Lobby sorted viewers_asc
# pnpm test:discovery → PASS (CRITICAL)

# Wave 6: VR
# /stadium loads without error
# VREntryPoint shows correct button for device
```

---

## NEVER DO LIST (Blackbox Must Honor)

- ❌ Auto-release any payout (always Big Ace)
- ❌ Return anything other than 200 from /api/ads/slot/*
- ❌ Sort lobby by viewers DESC (must be ASC — 0 viewers = position 1)
- ❌ Remove permanent Diamond for Marcel or BJ M Beat's
- ❌ Modify locked files: middleware.ts, auth/*, ci.yml, health/*
- ❌ Add more than one import per wave to app.module.ts
- ❌ Skip canSendMessage() check before any chat send
- ❌ Allow more than 8 tickets per buyer per event
