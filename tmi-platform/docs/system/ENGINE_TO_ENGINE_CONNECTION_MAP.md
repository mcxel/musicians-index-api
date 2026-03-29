# ENGINE_TO_ENGINE_CONNECTION_MAP.md
# Engine-to-Engine Connection Map
# How each platform engine communicates with other engines.
# Read this before wiring cross-engine functionality.

## Connection Types

| Type | Description | Implementation |
|------|-------------|---------------|
| Direct call | Engine A calls Engine B's service directly | NestJS DI injection |
| Event bus | Engine A emits event, Engine B listens | NestJS EventEmitter |
| Shared DB | Engines share a Prisma model | Read/write to schema |
| Socket broadcast | Engine emits to all connected clients | Socket.io |
| Queue job | Engine enqueues a job for async processing | Bull queue (if added) |

---

## Engine Connection Graph

```
StreamWinEngine ──(event: stream.event)──► PointsRewardsEngine
StreamWinEngine ──(reads)──────────────► PlaylistEngine (track catalog)
StreamWinEngine ──(writes LedgerEntry)─► DB

GameEngine ──(event: game.ended)────────► PointsRewardsEngine
GameEngine ──(reads)────────────────────► LeaderboardEngine
GameEngine ──(socket broadcast)─────────► Connected Clients

CypherEngine ──(event: cypher.ended)────► PointsRewardsEngine
CypherEngine ──(reads)──────────────────► LeaderboardEngine
CypherEngine ──(socket broadcast)────────► Connected Clients

LiveRoomEngine ──(presence events)──────► HUD Global State
LiveRoomEngine ──(event: room.started)──► NotificationEngine
LiveRoomEngine ──(socket broadcast)─────► Connected Clients

PointsRewardsEngine ──(writes LedgerEntry)──► DB
PointsRewardsEngine ──(event: points.awarded)──► HUD (points flash)
PointsRewardsEngine ──(reads/writes)────────► AchievementService
PointsRewardsEngine ──(event: achievement.unlocked)──► NotificationEngine

LeaderboardEngine ──(reads LedgerEntry)─► DB
LeaderboardEngine ──(writes snapshot)───► DB (weekly snapshot table)
LeaderboardEngine ──(triggered by)──────► WeeklyResetBot

MagazineEngine ──(reads Issue, Article)─► DB
MagazineEngine ──(event: issue.published)──► NotificationEngine
MagazineEngine ──(reads)────────────────► Artist (tier/Diamond for article theming)

BotOrchestrator ──(triggers)────────────► WeeklyResetBot
BotOrchestrator ──(triggers)────────────► PointsExpiryBot
BotOrchestrator ──(triggers)────────────► LeaderboardSnapshotBot
BotOrchestrator ──(triggers)────────────► OnboardingBot
BotOrchestrator ──(triggers)────────────► StreamEventBot

NotificationEngine ──(socket push)──────► HUD Notification Drawer
NotificationEngine ──(email)────────────► Email Module

SponsorAdEngine ──(reads AdSlot)────────► DB
SponsorAdEngine ──(injects into)────────► BeltEngine (Belt 6 Sponsor Rail)
SponsorAdEngine ──(injects into)────────► MagazineEngine (interstitial pages)
SponsorAdEngine ──(injects into)────────► LiveRoomEngine (room badge)
SponsorAdEngine ──(injects into)────────► GameEngine (session splash)

BookingEngine ──(creates)───────────────► Event (ticketing model)
BookingEngine ──(reads/writes)──────────► Venue model
BookingEngine ──(event: booking.approved)──► NotificationEngine
BookingEngine ──(approved request)──────► TicketingEngine (creates TicketType)

BeltEngine ──(reads config)─────────────► FeatureFlag model (toggle belts)
BeltEngine ──(reads)────────────────────► PlaylistEngine (Charts belt)
BeltEngine ──(reads)────────────────────► LiveRoomEngine (Live Now belt)
BeltEngine ──(reads)────────────────────► MagazineEngine (Magazine belt)
BeltEngine ──(reads)────────────────────► GameEngine (Games belt)
BeltEngine ──(reads)────────────────────► SponsorAdEngine (Sponsor belt)

HUD ──(reads)───────────────────────────► PointsRewardsEngine (balance)
HUD ──(reads)───────────────────────────► NotificationEngine (unread count)
HUD ──(reads)───────────────────────────► AudioSingleton / StreamWinEngine
HUD ──(reads)───────────────────────────► LiveRoomEngine (active room indicator)
```

---

## Critical Cross-Engine Rules

### 1. Points are always awarded via PointsRewardsEngine
No engine writes `LedgerEntry` directly except `PointsRewardsEngine.award()`.
All other engines call `PointsRewardsEngine.award({ userId, amount, reason })`.

### 2. Notifications always go through NotificationEngine
No engine sends emails or socket notifications directly.
All use `NotificationEngine.send({ userId, type, payload })`.

### 3. Stream & Win audio never blocks page navigation
`AudioSingleton` is mounted once in layout. Other engines never mount their own audio players.
Engines that need audio call `AudioSingleton.play(track)` via the shared context.

### 4. Leaderboard is read-only from live engines
Engines do not write leaderboard data directly.
They write `LedgerEntry` → `LeaderboardEngine` reads and aggregates on schedule.

### 5. SponsorAdEngine injection is always passive
Engines do not pull sponsor data themselves.
`SponsorAdEngine` pushes ad slot config into relevant surfaces via shared config/context.

---

## Startup Dependency Order (API)

When the API starts, modules must be initialized in this order:

1. `PrismaModule` (DB connection)
2. `AuthModule` (auth guards depend on DB)
3. `UsersModule`
4. `PointsRewardsModule` (many modules depend on this)
5. `NotificationModule` (many modules depend on this)
6. `StreamWinModule`
7. `MagazineModule` / `EditorialModule`
8. `LiveRoomsModule`
9. `CypherModule`
10. `GameModule`
11. `BookingModule`
12. `SponsorModule`
13. `LeaderboardModule`
14. `BotModule` (last — depends on all above)

---

## Engine Health Checks

Each engine must expose a health check endpoint or implement `HealthIndicator`:

```typescript
// apps/api/src/modules/health/health.controller.ts (existing)
// Add indicators for:
// - DB connectivity (exists)
// - StreamWin: can read a track (new)
// - Cypher: socket gateway up (new)
// - Games: question bank seeded (new)
// - Bots: last run within expected window (new)
```
