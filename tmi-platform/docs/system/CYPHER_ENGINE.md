# CYPHER_ENGINE.md
# Cypher Arena / Cypher Stage System — Engine Architecture
# Visual authority: PDF pages 18–20
# Repo paths: apps/web/src/app/cypher/, apps/api/src/modules/cypher/

## What Is The Cypher System

The Cypher is TMI's live performance arena.
Artists take turns performing (audio/video) in round-robin or battle format.
The audience watches, reacts, and votes.
Judges can score using a structured rubric.
The Cypher Stage is the main competitive surface.
Cypher Rooms are smaller informal cipher circles.

---

## PDF Authority Summary

- **Page 18**: Cypher Stage layout — full-screen stage surface, artist queue on side, audience reaction rail at bottom
- **Page 19**: Cypher rules/round UI — round timer, current performer callout, bracket view
- **Page 20**: Cypher Rooms — lobby-style room list with genre tag, join count, live indicator

---

## Core Concepts

| Concept | Description |
|---------|-------------|
| Cypher Session | A timed performance event with a queue of performers |
| Stage | The main live performance view |
| Performer Queue | Ordered list of artists waiting to perform |
| Round | One performer's timed slot |
| Judge Mode | Optional — judges score each round on criteria |
| Audience Mode | Viewers react, vote, tip |
| Cypher Room | A smaller, informal cipher circle (up to 12 performers) |

---

## Session State Machine

```
LOBBY → STARTING → ROUND_ACTIVE → ROUND_END → [NEXT_ROUND | SESSION_END]
```

| State | Behavior |
|-------|---------|
| LOBBY | Performers join queue, audience enters |
| STARTING | 30-second countdown |
| ROUND_ACTIVE | Current performer on stage, timer running |
| ROUND_END | Scores/reactions tabulated, brief break |
| SESSION_END | Final scores displayed, winners announced |

---

## Engine Architecture

```
CypherEngine
├── SessionManager        — create/join/end sessions
├── PerformerQueue        — ordered queue with turn management
├── RoundTimer            — server-authoritative round countdown
├── ScoringEngine         — judge scoring rubric + tallying
├── AudienceReactions     — real-time reaction stream (Socket.io)
├── VotingEngine          — audience vote on performers
├── CypherRoomLobby       — room discovery and random join
└── CypherStageRenderer   — full-screen stage UI component
```

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/cypher/sessions` | Create new cypher session |
| GET | `/api/cypher/sessions` | List active sessions |
| GET | `/api/cypher/sessions/:id` | Get session state |
| POST | `/api/cypher/sessions/:id/join` | Join as performer |
| POST | `/api/cypher/sessions/:id/watch` | Join as audience |
| POST | `/api/cypher/sessions/:id/start` | Start session (host only) |
| POST | `/api/cypher/sessions/:id/score` | Submit judge score |
| POST | `/api/cypher/sessions/:id/react` | Send audience reaction |
| GET | `/api/cypher/rooms` | List cypher rooms |
| POST | `/api/cypher/rooms` | Create cypher room |

---

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `cypher:state` | Server → Client | Full session state sync |
| `cypher:round-start` | Server → Client | Round begins |
| `cypher:round-end` | Server → Client | Round ends |
| `cypher:reaction` | Client → Server | Audience reaction |
| `cypher:vote` | Client → Server | Audience vote |
| `cypher:score` | Client → Server | Judge score submission |

---

## DB Models Needed

```prisma
model CypherSession {
  id          String   @id @default(cuid())
  title       String
  hostUserId  String
  state       String   @default("LOBBY")  // LOBBY|STARTING|ROUND_ACTIVE|ROUND_END|SESSION_END
  roundDurationSec Int @default(120)
  maxPerformers Int    @default(8)
  isPublic    Boolean  @default(true)
  genre       String?
  rounds      CypherRound[]
  performers  CypherPerformer[]
  createdAt   DateTime @default(now())
  endedAt     DateTime?
}

model CypherPerformer {
  id          String        @id @default(cuid())
  sessionId   String
  session     CypherSession @relation(fields: [sessionId], references: [id])
  userId      String
  queueOrder  Int
  totalScore  Float?
  joinedAt    DateTime @default(now())
}

model CypherRound {
  id            String        @id @default(cuid())
  sessionId     String
  session       CypherSession @relation(fields: [sessionId], references: [id])
  performerId   String
  roundNumber   Int
  startedAt     DateTime?
  endedAt       DateTime?
  scores        CypherScore[]
}

model CypherScore {
  id        String      @id @default(cuid())
  roundId   String
  round     CypherRound @relation(fields: [roundId], references: [id])
  judgeId   String
  value     Float
  notes     String?
  createdAt DateTime    @default(now())
}
```

---

## Frontend Routes

| Route | Description |
|-------|-------------|
| `/cypher` | Cypher rooms lobby |
| `/cypher/[sessionId]` | Full stage view for a session |
| `/cypher/create` | Create new cypher session (Artist/Staff) |

---

## Files To Create

| File | Action |
|------|--------|
| `apps/web/src/app/cypher/page.tsx` | CREATE — room lobby |
| `apps/web/src/app/cypher/[sessionId]/page.tsx` | CREATE — stage view |
| `apps/web/src/components/cypher/CypherStage.tsx` | CREATE |
| `apps/web/src/components/cypher/PerformerQueue.tsx` | CREATE |
| `apps/web/src/components/cypher/RoundTimer.tsx` | CREATE |
| `apps/web/src/components/cypher/AudienceReactions.tsx` | CREATE |
| `apps/web/src/systems/cypher/CypherEngine.ts` | CREATE |
| `apps/api/src/modules/cypher/cypher.module.ts` | CREATE |
| `apps/api/src/modules/cypher/cypher.controller.ts` | CREATE |
| `apps/api/src/modules/cypher/cypher.service.ts` | CREATE |
| `apps/api/src/modules/cypher/cypher.gateway.ts` | CREATE — Socket.io gateway |
| `packages/db/prisma/schema.prisma` | EDIT — add Cypher models |

---

## States Required

- Lobby loading: "Looking for active cyphers..."
- Empty room list: "No cypher sessions right now — start one"
- Round in progress: full-screen stage with timer
- Round ended: score flash, next performer countdown
- Session ended: final leaderboard
- Judge score submitted: confirmation toast
- Error: "Connection lost — reconnecting..."
- Fallback: read-only audience mode if performer slot fails
