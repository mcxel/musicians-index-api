# BLACKBOX SCAFFOLD COMPLETE — TMI Platform
## The Musicians Index — Copilot Handoff Document
**Date:** 2025  
**Status:** ✅ SCAFFOLD COMPLETE — READY FOR COPILOT WIRING

---

## WHAT BLACKBOX COMPLETED

### Phase 1 — Corruption Fix ✅
Fixed 13 corrupted UTF-8 files that were blocking the web build:
- `apps/web/src/app/reviews/page.tsx`
- `apps/web/src/app/rooms/audience/page.tsx`
- `apps/web/src/app/rooms/backstage/page.tsx`
- `apps/web/src/app/rooms/cypher/page.tsx`
- `apps/web/src/app/rooms/dj/page.tsx`
- `apps/web/src/app/rooms/front-row/page.tsx`
- `apps/web/src/app/rooms/game/page.tsx`
- `apps/web/src/app/rooms/interview/page.tsx`
- `apps/web/src/app/rooms/listening-party/page.tsx`
- `apps/web/src/app/rooms/party-lobby/page.tsx`
- `apps/web/src/app/rooms/studio/page.tsx`
- `apps/web/src/app/rooms/vip/page.tsx`
- `apps/web/src/app/rooms/watch-party/page.tsx`

### Phase 3 — Avatar Engine Systems ✅
Created full avatar engine system at `apps/web/src/systems/avatar/`:
- `types.ts` — All avatar types, interfaces, enums
- `poseRegistry.ts` — 30+ pose states with metadata
- `costumeRegistry.ts` — Costume categories and items
- `propRegistry.ts` — Prop categories and items
- `expressionRegistry.ts` — Expression states and triggers
- `venueBindingConfig.ts` — Venue zone → avatar behavior bindings
- `behaviorPresets.ts` — Room behavior presets per role
- `evolutionPresets.ts` — Avatar upgrade/evolution tiers
- `index.ts` — Barrel export for all avatar systems

### Phase 4 — Avatar Component Family ✅
Created 17 avatar components at `apps/web/src/components/avatar/`:

**Character Components:**
- `AvatarStageCharacter.tsx` — Performer on stage
- `AvatarAudienceCharacter.tsx` — Audience member in seating
- `AvatarHostCharacter.tsx` — Host at podium
- `AvatarCoHostCharacter.tsx` — Co-host at interview chair
- `AvatarGuestCharacter.tsx` — Guest in interview zone

**Layer Components:**
- `AvatarReactionLayer.tsx` — Reaction overlays (emotes, effects)
- `AvatarPoseLayer.tsx` — Pose state rendering
- `AvatarCostumeLayer.tsx` — Costume item rendering
- `AvatarPropLayer.tsx` — Held prop rendering

**Behavior Components (render-free):**
- `AvatarSeatBehavior.tsx` — Seating assignment + settle
- `AvatarAttentionBehavior.tsx` — Gaze/attention targeting
- `AvatarListeningBehavior.tsx` — Head-turn toward active speaker
- `AvatarIdleController.tsx` — Idle loop control

**Structural Components:**
- `AvatarCrowdCluster.tsx` — Cluster of audience avatars
- `AvatarVenueAnchor.tsx` — Zone position anchor
- `AvatarTransitionShell.tsx` — Scene transition wrapper
- `AvatarTalkTurnBehavior.tsx` — Talk-turn indicator

- `index.ts` — Barrel export for all avatar components

### Phase 5 — Avatar Documentation ✅
Created 5 avatar docs at `docs/avatar/`:
- `AVATAR_ENGINE_SYSTEM.md` — Full engine architecture
- `AVATAR_BEHAVIOR_MATRIX.md` — State × role × venue behavior matrix
- `AVATAR_COSTUME_AND_PROP_SYSTEM.md` — Costume + prop system spec
- `AVATAR_VENUE_BINDING_MAP.md` — Venue zone → avatar binding map
- `AVATAR_UPGRADE_AND_EVOLUTION.md` — Evolution tier system

### Phase 6 — Missing API Modules ✅
Created 8 NestJS modules at `apps/api/src/modules/`:
Each module has: `{name}.module.ts`, `{name}.service.ts`, `{name}.controller.ts`

| Module | Purpose |
|--------|---------|
| `avatar/` | Avatar identity, presence, evolution |
| `rooms/` | Room creation, joining, state |
| `sponsors/` | Sponsor campaigns and placements |
| `analytics/` | Platform events and metrics |
| `media/` | Media uploads and processing |
| `bots/` | Bot tasks and automation scheduling |
| `booking/` | Artist booking requests and confirmations |
| `moderation/` | Content moderation and abuse reports |

### Phase 7 — Missing Room Pages ✅
Created 8 new room pages at `apps/web/src/app/rooms/`:
- `green-room/page.tsx`
- `host-control/page.tsx`
- `interview-booth/page.tsx`
- `listening-session/page.tsx`
- `award-ceremony/page.tsx`
- `fan-meetup/page.tsx`
- `vip-lounge/page.tsx`
- `radio-station/page.tsx`

**Total room pages now available (19 rooms):**
audience, backstage, cypher, dj, front-row, game, interview, listening-party, party-lobby, studio, vip, watch-party, green-room, host-control, interview-booth, listening-session, award-ceremony, fan-meetup, vip-lounge, radio-station

### Phase 8 — Missing Core Pages ✅
Created 4 core pages at `apps/web/src/app/`:
- `settings/page.tsx`
- `bookmarks/page.tsx`
- `trending/page.tsx`
- `stations/page.tsx`

### Phase 9 — Missing Bot Configs ✅
Created 8 new bot configs at `data/bots/`:
- `avatar-behavior-bot.json`
- `onboarding-recovery-bot.json`
- `recommendation-bot.json`
- `search-indexing-bot.json`
- `renewal-bot.json`
- `sponsor-outreach-bot.json`
- `moderation-sentinel-bot.json`
- `booking-assistant-bot.json`

**Total bot configs now available (22 bots):**
queue-recovery, system-health, route-integrity, scene-repair, layout-recovery, asset-fallback, widget-recovery, sponsor-safety, performance-recovery, fix-authorization, change-audit, verification, rollback + 8 new bots above

---

## WHAT COPILOT MUST WIRE NEXT

### Priority 1 — Build Proof (Do First)
```bash
cd tmi-platform
pnpm --filter web build
pnpm --filter api build
```
Fix any remaining TypeScript errors before wiring.

### Priority 2 — Register New API Modules in app.module.ts
The 8 new modules must be imported and registered in:
`apps/api/src/app.module.ts`

```typescript
// Add these imports:
import { AvatarModule } from './modules/avatar/avatar.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { SponsorsModule } from './modules/sponsors/sponsors.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { MediaModule } from './modules/media/media.module';
import { BotsModule } from './modules/bots/bots.module';
import { BookingModule } from './modules/booking/booking.module';
import { ModerationModule } from './modules/moderation/moderation.module';

// Add to @Module imports array:
// AvatarModule, RoomsModule, SponsorsModule, AnalyticsModule,
// MediaModule, BotsModule, BookingModule, ModerationModule
```

### Priority 3 — Wire Avatar System to Rooms
Each room page should import and use avatar components:
```typescript
import { AvatarHostCharacter, AvatarAudienceCharacter, AvatarCrowdCluster } from '@/components/avatar';
import { AvatarVenueAnchor } from '@/components/avatar';
```

### Priority 4 — Wire Services to Prisma
Each new service needs Prisma injection:
```typescript
import { PrismaService } from '../prisma/prisma.service';

constructor(private readonly prisma: PrismaService) {}
```

### Priority 5 — Wire Controllers to Services
Each controller needs real endpoints beyond the health check scaffold.

### Priority 6 — Wire Dashboards to APIs
- Artist dashboard → booking, analytics, media, rooms APIs
- Fan dashboard → rooms, wallet, notifications APIs
- Admin dashboard → moderation, analytics, bots APIs

### Priority 7 — Wire Notifications + Bots Scheduler
- Notifications service → email queue
- Bots module → cron scheduler
- Bot configs in `data/bots/` → bot execution engine

---

## CLOUDFLARE SSL 525 FIX GUIDE

### What Error 525 Means
SSL handshake failed between Cloudflare and the origin server.
- Browser: ✅ Working
- Cloudflare: ✅ Working  
- Origin server: ❌ SSL handshake failing

### Fix Path A — Vercel/Render/Cloud Host (Most Likely)
1. Go to your hosting dashboard (Vercel/Render/Railway/etc.)
2. Confirm the custom domain `themusiciansindex.com` is attached
3. Wait for the host to finish issuing its SSL certificate (can take 5-30 min)
4. In Cloudflare DNS: temporarily set the proxy to **gray cloud (DNS only)** for the A/CNAME record
5. Test `https://themusiciansindex.com` directly — it should load
6. Once origin HTTPS works, re-enable Cloudflare proxy (orange cloud)
7. Set Cloudflare SSL/TLS mode to **Full** (not Full Strict) unless origin has a CA-signed cert

### Fix Path B — Cloudflare SSL Mode Mismatch
1. Go to Cloudflare Dashboard → SSL/TLS → Overview
2. If origin has a self-signed cert or host-issued cert: set to **Full**
3. If origin has a valid CA-signed cert matching the domain: set to **Full (Strict)**
4. Never use **Flexible** in production (causes redirect loops)

### Fix Path C — Origin Server (Self-Hosted)
1. Install a valid TLS certificate on the origin (Let's Encrypt recommended)
2. Enable TLS 1.2 and 1.3 on the server
3. Verify the server responds on port 443
4. Verify SNI/hostname config matches `themusiciansindex.com`
5. Verify the cert covers both apex (`themusiciansindex.com`) and `www` if used

### Cloudflare Dashboard Settings to Check
- SSL/TLS → Overview → Mode (should be Full or Full Strict)
- SSL/TLS → Edge Certificates → Always Use HTTPS: ON
- SSL/TLS → Edge Certificates → Minimum TLS Version: TLS 1.2
- DNS → Records → Proxy status for A/CNAME records

### Success Proof
```bash
curl -I https://themusiciansindex.com
# Expected: HTTP/2 200 (or 301 redirect to www)

curl -I https://www.themusiciansindex.com  
# Expected: HTTP/2 200
```

---

## COMPLETE CHAIN STATUS

### Avatar Chain
```
Avatar Identity → Pose State → Costume Set → Prop Set → Venue Binding
→ Role Binding → Behavior Rules → Scene Reactions → Audience/Stage Interaction
→ Upgrade/Evolution → Saved Avatar Profile → Render in Rooms/Profiles/Shows
```
**Status:** ✅ Types + Registries + Components + Docs COMPLETE  
**Copilot:** Wire behavior hooks to room state events

### Member Chain
```
Landing → Signup/Login → Onboarding → Dashboard → Profile → Article
→ Discovery → Notifications → Wallet/Rewards
```
**Status:** ✅ Pages exist  
**Copilot:** Wire auth → profile save/load → article auto-create

### Artist Chain
```
Artist Onboarding → Profile Save → Article Auto-Create → Media Upload
→ Booking → Shows → Rooms → Fans → Tips → Analytics → Sponsors
```
**Status:** ✅ Pages + services exist  
**Copilot:** Wire booking service → analytics service → sponsor placements

### Fan Chain
```
Fan Onboarding → Dashboard → Browse → Room Join → Watch → React
→ Tip → Points → Contests → Rewards
```
**Status:** ✅ Pages + services exist  
**Copilot:** Wire wallet → tips → points → contest entry

### Room Chain
```
Room Creation → Join → Roles → Host Controls → Audience Seating
→ Reactions → Chat → Audio/Video → Sponsor Overlays → Recording
```
**Status:** ✅ 19 room pages + room module exist  
**Copilot:** Wire room service → socket events → avatar presence

### Bot Chain
```
Bot Scheduler → Task Queue → Bot Execution → Results → Notifications
```
**Status:** ✅ 22 bot configs + bots module exist  
**Copilot:** Wire bots module → cron scheduler → task execution

---

## DESIGN SYSTEM REFERENCE

| Token | Value |
|-------|-------|
| Background | `#0a0a0f` |
| Accent | `#ff6b35` |
| Text Primary | `#ffffff` |
| Text Secondary | `#9ca3af` (gray-400) |
| Border | `#1a1a2e` |
| Theme | Dark neon/futuristic |
| Terminology | "Stations" not "Channels" |

---

## FILES CREATED BY BLACKBOX (COMPLETE LIST)

### Avatar System (9 files)
```
apps/web/src/systems/avatar/types.ts
apps/web/src/systems/avatar/poseRegistry.ts
apps/web/src/systems/avatar/costumeRegistry.ts
apps/web/src/systems/avatar/propRegistry.ts
apps/web/src/systems/avatar/expressionRegistry.ts
apps/web/src/systems/avatar/venueBindingConfig.ts
apps/web/src/systems/avatar/behaviorPresets.ts
apps/web/src/systems/avatar/evolutionPresets.ts
apps/web/src/systems/avatar/index.ts
```

### Avatar Components (18 files)
```
apps/web/src/components/avatar/AvatarStageCharacter.tsx
apps/web/src/components/avatar/AvatarAudienceCharacter.tsx
apps/web/src/components/avatar/AvatarHostCharacter.tsx
apps/web/src/components/avatar/AvatarCoHostCharacter.tsx
apps/web/src/components/avatar/AvatarGuestCharacter.tsx
apps/web/src/components/avatar/AvatarReactionLayer.tsx
apps/web/src/components/avatar/AvatarPoseLayer.tsx
apps/web/src/components/avatar/AvatarCostumeLayer.tsx
apps/web/src/components/avatar/AvatarPropLayer.tsx
apps/web/src/components/avatar/AvatarSeatBehavior.tsx
apps/web/src/components/avatar/AvatarAttentionBehavior.tsx
apps/web/src/components/avatar/AvatarListeningBehavior.tsx
apps/web/src/components/avatar/AvatarIdleController.tsx
apps/web/src/components/avatar/AvatarCrowdCluster.tsx
apps/web/src/components/avatar/AvatarVenueAnchor.tsx
apps/web/src/components/avatar/AvatarTransitionShell.tsx
apps/web/src/components/avatar/AvatarTalkTurnBehavior.tsx
apps/web/src/components/avatar/index.ts
```

### Avatar Docs (5 files)
```
docs/avatar/AVATAR_ENGINE_SYSTEM.md
docs/avatar/AVATAR_BEHAVIOR_MATRIX.md
docs/avatar/AVATAR_COSTUME_AND_PROP_SYSTEM.md
docs/avatar/AVATAR_VENUE_BINDING_MAP.md
docs/avatar/AVATAR_UPGRADE_AND_EVOLUTION.md
```

### API Modules (24 files — 8 modules × 3 files each)
```
apps/api/src/modules/avatar/{avatar.module.ts, avatar.service.ts, avatar.controller.ts}
apps/api/src/modules/rooms/{rooms.module.ts, rooms.service.ts, rooms.controller.ts}
apps/api/src/modules/sponsors/{sponsors.module.ts, sponsors.service.ts, sponsors.controller.ts}
apps/api/src/modules/analytics/{analytics.module.ts, analytics.service.ts, analytics.controller.ts}
apps/api/src/modules/media/{media.module.ts, media.service.ts, media.controller.ts}
apps/api/src/modules/bots/{bots.module.ts, bots.service.ts, bots.controller.ts}
apps/api/src/modules/booking/{booking.module.ts, booking.service.ts, booking.controller.ts}
apps/api/src/modules/moderation/{moderation.module.ts, moderation.service.ts, moderation.controller.ts}
```

### Room Pages (8 new files)
```
apps/web/src/app/rooms/green-room/page.tsx
apps/web/src/app/rooms/host-control/page.tsx
apps/web/src/app/rooms/interview-booth/page.tsx
apps/web/src/app/rooms/listening-session/page.tsx
apps/web/src/app/rooms/award-ceremony/page.tsx
apps/web/src/app/rooms/fan-meetup/page.tsx
apps/web/src/app/rooms/vip-lounge/page.tsx
apps/web/src/app/rooms/radio-station/page.tsx
```

### Core Pages (4 new files)
```
apps/web/src/app/settings/page.tsx
apps/web/src/app/bookmarks/page.tsx
apps/web/src/app/trending/page.tsx
apps/web/src/app/stations/page.tsx
```

### Bot Configs (8 new files)
```
data/bots/avatar-behavior-bot.json
data/bots/onboarding-recovery-bot.json
data/bots/recommendation-bot.json
data/bots/search-indexing-bot.json
data/bots/renewal-bot.json
data/bots/sponsor-outreach-bot.json
data/bots/moderation-sentinel-bot.json
data/bots/booking-assistant-bot.json
```

---

## WHAT IS STILL ABSENT (Copilot Must Create)

These surfaces do not exist yet and must be wired or created by Copilot:

### Missing Prisma Schema Models
- `Avatar` model (identity, tier, costume, pose, evolution)
- `Room` model (type, state, host, capacity, seats)
- `Sponsor` model (campaign, placements, budget)
- `Booking` model (artist, fan, date, status)
- `ModerationReport` model (content, reporter, status)
- `BotTask` model (type, status, result, scheduled_at)
- `MediaAsset` model (url, type, owner, processed)
- `AnalyticsEvent` model (type, user, room, timestamp, data)

### Missing API Endpoints (Wire in Services)
- `POST /avatar` — create avatar
- `GET /avatar/:id` — get avatar
- `PATCH /avatar/:id` — update avatar
- `POST /rooms` — create room
- `GET /rooms` — list rooms
- `POST /rooms/:id/join` — join room
- `POST /sponsors/campaign` — create campaign
- `GET /analytics/events` — get events
- `POST /media/upload` — upload media
- `GET /booking` — list bookings
- `POST /booking` — create booking
- `POST /moderation/report` — file report

### Missing Socket Events (Wire in Rooms)
- `room:join` / `room:leave`
- `room:reaction` / `room:applause`
- `avatar:pose-change`
- `avatar:reaction`
- `host:handoff`
- `stage:cue`

### Missing Environment Variables
```env
# Add to .env:
NEXT_PUBLIC_SOCKET_URL=
CLOUDINARY_URL=          # or S3 config for media
BOT_SCHEDULER_SECRET=
MODERATION_WEBHOOK_URL=
ANALYTICS_WRITE_KEY=
```

---

## COPILOT EXECUTION ORDER

```
1. pnpm --filter web build  → fix all TS errors
2. pnpm --filter api build  → fix all TS errors
3. Register 8 new modules in app.module.ts
4. Add Prisma models for Avatar, Room, Sponsor, Booking, ModerationReport, BotTask, MediaAsset, AnalyticsEvent
5. Run: pnpm --filter db db:migrate
6. Wire avatar service → Prisma Avatar model
7. Wire rooms service → Prisma Room model + socket events
8. Wire booking service → Prisma Booking model
9. Wire moderation service → Prisma ModerationReport model
10. Wire analytics service → event tracking
11. Wire media service → upload handler
12. Wire bots service → cron scheduler
13. Wire sponsors service → campaign + placement logic
14. Wire dashboards → APIs
15. Wire avatar components → room pages
16. Fix Cloudflare SSL 525 (see guide above)
17. Deploy → smoke test → activate bots → onboard members
```

---

*Generated by BLACKBOX — TMI Platform Avatar Evolution + Scaffold Complete*
*Hand to Copilot for final wiring phase*
