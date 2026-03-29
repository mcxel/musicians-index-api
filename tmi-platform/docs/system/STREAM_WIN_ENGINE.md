# STREAM_WIN_ENGINE.md
# Stream & Win System — Engine Architecture
# Visual authority: PDF pages 12–13
# Repo paths: apps/web/src/app/streamwin/, apps/api/src/modules/stream-win/

## What Is Stream & Win

Stream & Win is the TMI loyalty and audio engagement system.
Users stream music (from artist links or curated playlists), earn points, and can win prizes/rewards.
Audio must persist across all page navigations (homepage, magazine reader, artist profiles).

This is a first-class platform feature — not a widget.

---

## Core Rules (Non-Negotiable)

1. Audio player is a singleton — it never re-mounts between page navigations
2. Queue is preserved across navigation
3. Save-to-profile action is available on every track
4. Points are awarded per stream event (backend-validated, not client-side)
5. Points hook into the central LedgerEntry system (already in DB)
6. User must be logged in to earn points (guest can listen, not earn)

---

## Engine Architecture

```
StreamWinEngine
├── AudioSingleton        — global persistent audio player (mounted once in layout)
├── QueueManager          — track queue, history, shuffle, repeat
├── StreamValidator       — backend validates stream duration before awarding points
├── PointsHook            — emits point events to PointsRewardsEngine
├── SaveToProfile         — saves track to user's saved tracks list
├── StreamWinHUD          — floating mini-player + points counter overlay
└── StreamWinPage         — full /streamwin route (leaderboard, queue, prizes)
```

---

## Audio Singleton Architecture

The audio player is mounted ONCE in the root layout (`apps/web/src/app/layout.tsx`).
It uses a global React context (or Zustand store) so any component can:
- Play/pause
- Enqueue a track
- See current track info
- Earn points passively

### AudioSingleton State Shape
```typescript
interface AudioState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  position: number; // seconds
  sessionStreamSeconds: number; // for point validation
  pointsEarnedThisSession: number;
}
```

---

## Points Logic

| Event | Points |
|-------|--------|
| Complete 30s of a track | +5 pts |
| Complete full track | +15 pts |
| Save track to profile | +2 pts |
| First stream of the day | +10 pts (bonus) |
| Stream during live event | +25 pts (bonus) |

Points are validated server-side via `/api/stream-win/event` — client sends timestamp + track ID, server validates duration.

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/stream-win/event` | Record stream event, award points |
| POST | `/api/stream-win/save` | Save track to profile |
| GET | `/api/stream-win/leaderboard` | Top earners this week |
| GET | `/api/stream-win/prizes` | Active prize pool |
| GET | `/api/stream-win/my-stats` | Auth user stats |

---

## DB Models Needed

```prisma
model StreamEvent {
  id          String   @id @default(cuid())
  userId      String
  trackId     String   // external ID or TMI catalog ID
  trackTitle  String
  artistName  String
  durationMs  Int      // validated by server
  pointsAwarded Int   @default(0)
  createdAt   DateTime @default(now())

  @@index([userId])
}

model SavedTrack {
  id         String   @id @default(cuid())
  userId     String
  trackId    String
  trackTitle String
  artistName String
  savedAt    DateTime @default(now())

  @@unique([userId, trackId])
}
```

---

## Frontend Files

| File | Action |
|------|--------|
| `apps/web/src/app/layout.tsx` | EDIT — mount AudioSingleton once |
| `apps/web/src/systems/stream-win/AudioSingleton.tsx` | CREATE |
| `apps/web/src/systems/stream-win/QueueManager.ts` | CREATE |
| `apps/web/src/systems/stream-win/StreamValidator.ts` | CREATE |
| `apps/web/src/systems/stream-win/StreamWinContext.tsx` | CREATE |
| `apps/web/src/components/stream-win/MiniPlayer.tsx` | CREATE |
| `apps/web/src/components/stream-win/PointsCounter.tsx` | CREATE |
| `apps/web/src/app/streamwin/page.tsx` | EDIT/EXPAND |

---

## API Files

| File | Action |
|------|--------|
| `apps/api/src/modules/stream-win/stream-win.module.ts` | CREATE |
| `apps/api/src/modules/stream-win/stream-win.controller.ts` | CREATE |
| `apps/api/src/modules/stream-win/stream-win.service.ts` | CREATE |
| `packages/db/prisma/schema.prisma` | EDIT — add StreamEvent, SavedTrack |

---

## States Required

- Loading state: skeleton mini-player bar
- Empty queue state: "Add a track to start streaming"
- No points earned yet: "Stream 30 seconds to earn your first points"
- Error state: "Could not connect — your stream is paused" (retry button)
- Fallback: audio plays without points if API is down (degrade gracefully)
