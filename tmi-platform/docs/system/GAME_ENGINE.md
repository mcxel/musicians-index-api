# GAME_ENGINE.md
# Game Night / Music Games System — Engine Architecture
# Visual authority: PDF pages 10–16
# Repo paths: apps/web/src/app/games/, apps/api/src/modules/games/ (to create)

## What Is The Game Engine

Game Night is TMI's live interactive game system.
Artists, fans, and hosts play real-time music-themed games.
Points and prizes integrate with the Points/Rewards economy.

This is a first-class platform feature — not an optional add-on.

---

## PDF Authority Summary

- **Page 10**: Billboard / Leaderboard — ranked players, weekly scores
- **Pages 11–12**: Charts and playlist-based game elements
- **Pages 13–14**: Stream & Win game overlay surface
- **Pages 15–16**: Game lobby, active game UI, deal-or-feud layout

---

## Game Types (Minimum Build)

| Game | Description | Rounds |
|------|-------------|--------|
| Music Trivia | Multiple choice music questions | Typically 10 |
| Deal or Feud | Family Feud-style with music topics | Typically 5 |
| Name That Track | Play a clip, guess the song | Typically 10 |
| Beat the Streak | Predict the #1 chart track each week | Weekly |

---

## Engine Architecture

```
GameEngine
├── GameSessionManager    — create/join/end game sessions
├── QuestionBank          — curated question sets per game type
├── RoundController       — round timing, answer collection, scoring
├── ScoreAggregator       — tallies scores per round + final
├── HostController        — host controls (pause, skip, reveal)
├── AudienceVoting        — real-time vote submission + tallying
├── PointsBridge          — award points via PointsRewardsEngine on win
└── GameLeaderboard       — weekly game leaderboard
```

---

## Session State Machine

```
LOBBY → COUNTDOWN → ROUND_ACTIVE → ANSWER_REVEAL → [NEXT_ROUND | GAME_END]
```

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/games/sessions` | List active/upcoming sessions |
| POST | `/api/games/sessions` | Create session (Staff/Admin) |
| GET | `/api/games/sessions/:id` | Get session state |
| POST | `/api/games/sessions/:id/join` | Join as player |
| POST | `/api/games/sessions/:id/answer` | Submit answer |
| POST | `/api/games/sessions/:id/host/start` | Host starts game |
| POST | `/api/games/sessions/:id/host/next` | Host advances round |
| GET | `/api/games/leaderboard` | Weekly game leaderboard |
| GET | `/api/games/questions/:gameType` | Question set for game type |

---

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `game:state` | Server → Client | Game state sync |
| `game:question` | Server → Client | New question revealed |
| `game:answer-reveal` | Server → Client | Correct answer shown |
| `game:score-update` | Server → Client | Score update |
| `game:answer` | Client → Server | Player submits answer |
| `game:end` | Server → Client | Game ended, final scores |

---

## DB Models Needed

```prisma
enum GameType {
  MUSIC_TRIVIA
  DEAL_OR_FEUD
  NAME_THAT_TRACK
  BEAT_THE_STREAK
}

model GameSession {
  id          String   @id @default(cuid())
  gameType    GameType
  hostUserId  String
  state       String   @default("LOBBY")
  maxPlayers  Int      @default(50)
  prizePoints Int      @default(100)
  scheduledAt DateTime?
  startedAt   DateTime?
  endedAt     DateTime?
  players     GamePlayer[]
  rounds      GameRound[]
  createdAt   DateTime @default(now())
}

model GamePlayer {
  id          String      @id @default(cuid())
  sessionId   String
  session     GameSession @relation(fields: [sessionId], references: [id])
  userId      String
  score       Int         @default(0)
  joinedAt    DateTime    @default(now())

  @@unique([sessionId, userId])
}

model GameRound {
  id           String      @id @default(cuid())
  sessionId    String
  session      GameSession @relation(fields: [sessionId], references: [id])
  roundNumber  Int
  questionText String
  correctAnswer String
  options      Json?       // for multiple choice
  startedAt    DateTime?
  endedAt      DateTime?
  answers      GameAnswer[]
}

model GameAnswer {
  id        String    @id @default(cuid())
  roundId   String
  round     GameRound @relation(fields: [roundId], references: [id])
  userId    String
  answer    String
  isCorrect Boolean   @default(false)
  pointsAwarded Int  @default(0)
  answeredAt DateTime @default(now())
}
```

---

## Frontend Routes

| Route | Description |
|-------|-------------|
| `/games` | Game lobby — active/upcoming sessions |
| `/games/[sessionId]` | Live game view |
| `/games/[sessionId]/host` | Host control panel (Staff/Admin) |
| `/games/leaderboard` | Weekly game leaderboard |

---

## Files To Create

| File | Action |
|------|--------|
| `apps/web/src/app/games/page.tsx` | EDIT/EXPAND — full lobby |
| `apps/web/src/app/games/[sessionId]/page.tsx` | CREATE |
| `apps/web/src/app/games/[sessionId]/host/page.tsx` | CREATE |
| `apps/web/src/components/games/GameLobby.tsx` | CREATE |
| `apps/web/src/components/games/GamePlayer.tsx` | CREATE |
| `apps/web/src/components/games/HostControls.tsx` | CREATE |
| `apps/web/src/systems/games/GameEngine.ts` | CREATE |
| `apps/api/src/modules/games/games.module.ts` | CREATE |
| `apps/api/src/modules/games/games.controller.ts` | CREATE |
| `apps/api/src/modules/games/games.service.ts` | CREATE |
| `apps/api/src/modules/games/games.gateway.ts` | CREATE |
| `packages/db/prisma/schema.prisma` | EDIT — add Game models |

---

## States Required

- Lobby: "Game starts in [countdown]" / "Waiting for more players"
- Active round: question displayed, timer bar, answer options
- Answer submitted: "Locked in!" — waiting state
- Answer reveal: correct answer highlighted, score delta displayed
- Game end: final leaderboard, prize announcement
- Host view: current state + manual controls
- Error: "Connection lost — rejoin?" with session ID preserved
