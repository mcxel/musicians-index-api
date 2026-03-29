# BOT_ORCHESTRATION_SYSTEM.md
# Bot Orchestration System — Architecture and Manifest
# Also see: BOT_AUTOMATION_MANIFEST.md for operator override procedures
# Repo paths: apps/api/src/bots/

## What Are TMI Bots

Bots are automated agents that run scheduled or event-triggered tasks on the platform.
They are NOT external chatbots. They are internal worker processes attached to the API.

---

## Current Bot Inventory

| Bot | Path | Status | Trigger |
|-----|------|--------|---------|
| (inspect `apps/api/src/bots/` to enumerate) | — | — | — |

*(Run `ls apps/api/src/bots/` and fill this table with actual bot names)*

---

## Bot Types

### 1. Scheduled Bots (Cron)
Run on a fixed schedule using NestJS `@Cron` decorator.

| Bot | Schedule | Purpose |
|-----|----------|---------|
| WeeklyResetBot | Every Monday 00:00 UTC | Reset weekly crown, leaderboard, game streaks |
| PointsExpiryBot | Daily 00:00 UTC | Expire unused points older than 90 days |
| IssuePublishBot | On demand / scheduled | Flip new magazine issue to live |
| LeaderboardSnapshotBot | Every Sunday 23:55 UTC | Snapshot weekly leaderboard before reset |

### 2. Event-Triggered Bots (Queue Workers)
Run in response to platform events (via NestJS EventEmitter or Bull queue).

| Bot | Trigger Event | Purpose |
|-----|---------------|---------|
| OnboardingBot | `user.onboarding.complete` | Send welcome email, seed starter points |
| StreamEventBot | `stream.event.recorded` | Award points, update streak |
| ArtistProfileBot | `artist.profile.created` | Auto-create profile article stub |
| GameEndBot | `game.session.ended` | Distribute prize points, update leaderboard |
| CypherEndBot | `cypher.session.ended` | Tally scores, award winner points |

---

## Orchestration Architecture

```
BotOrchestrator
├── CronScheduler         — NestJS ScheduleModule, all cron bots registered here
├── EventBus              — NestJS EventEmitter, all event bots registered here
├── BotHealthMonitor      — tracks last-run, success/fail, alerts on missed runs
├── BotRegistry           — list of all bots with metadata + status
└── OperatorOverride      — admin-triggered manual bot runs (from Admin Command Center)
```

---

## Bot Contract

Every bot must implement:

```typescript
interface BotContract {
  name: string;
  description: string;
  trigger: 'cron' | 'event' | 'manual';
  run(): Promise<BotRunResult>;
  onError(error: Error): Promise<void>;
  fallback(): Promise<void>;
}

interface BotRunResult {
  success: boolean;
  itemsProcessed: number;
  errors: string[];
  durationMs: number;
  notes?: string;
}
```

---

## Fail-Safe Rules

1. Bots run in try/catch — one bot failure must NOT crash others
2. Failed bot run is logged to `BotRunLog` with error detail
3. If a cron bot fails 3 consecutive times, admin is alerted (notification or email)
4. Critical bots (WeeklyResetBot, PointsExpiryBot) have manual re-run endpoints in Admin Command Center
5. Bots do NOT make external HTTP calls without retry + timeout enforcement

---

## DB Models Needed

```prisma
model BotRunLog {
  id             String   @id @default(cuid())
  botName        String
  trigger        String   // CRON | EVENT | MANUAL
  success        Boolean
  itemsProcessed Int      @default(0)
  errorDetail    String?  @db.Text
  durationMs     Int?
  ranAt          DateTime @default(now())

  @@index([botName])
  @@index([ranAt])
}
```

---

## API Routes (Admin Only)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/bots` | List all bots and their last-run status |
| GET | `/api/admin/bots/:name/logs` | Get run history for a bot |
| POST | `/api/admin/bots/:name/run` | Manually trigger a bot (Admin only) |

---

## Files To Create / Edit

| File | Action |
|------|--------|
| `apps/api/src/bots/bot.registry.ts` | CREATE — bot registry |
| `apps/api/src/bots/bot-health.monitor.ts` | CREATE |
| `apps/api/src/bots/weekly-reset.bot.ts` | CREATE |
| `apps/api/src/bots/points-expiry.bot.ts` | CREATE |
| `apps/api/src/bots/leaderboard-snapshot.bot.ts` | CREATE |
| `apps/api/src/bots/onboarding.bot.ts` | CREATE |
| `apps/api/src/bots/stream-event.bot.ts` | CREATE |
| `packages/db/prisma/schema.prisma` | EDIT — add BotRunLog |

---

## Operator Override Procedure

See `docs/system/BOT_AUTOMATION_MANIFEST.md` for detailed override steps.

Short form:
1. Navigate to Admin Command Center → Bots tab
2. Select bot by name
3. Click "Manual Run" (requires Admin role)
4. Monitor run log inline
5. If failure: inspect BotRunLog, check error detail, fix root cause, re-run
