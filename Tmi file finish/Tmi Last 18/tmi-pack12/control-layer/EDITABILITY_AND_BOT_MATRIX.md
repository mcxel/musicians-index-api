# MASTER_EDITABILITY_RULES.md
## How Every File Must Be Written So Copilot Can Edit It Safely Forever

---

## PURPOSE
This file is the law for how all platform code is written.
It exists so future edits by Copilot in VS Code never break the system,
and so Big Ace can understand and override anything without digging.

---

## FILE STRUCTURE LAWS

### Law 1 — No Monolith Files
No single file may contain: layout engine + card engine + ranking logic + sponsor logic + animation logic.
Each file has one job. Split into colocated files.

```
✅ HomepageCover.tsx           ← page shell only
✅ HomepageCover.data.ts       ← data/config for this page
✅ HomepageCover.motion.ts     ← motion rules for this page
✅ HomepageCover.test.ts       ← proof tests
✅ CrownCard.tsx               ← crown card component
✅ CrownCard.types.ts          ← TypeScript interfaces

❌ HomepageCoverWithDataAndMotionAndCrownAndSponsors.tsx
```

### Law 2 — No Hardcoded Content in Page Files
All copy, labels, card counts, timing values, and section names must come from config.

```typescript
// ❌ WRONG
<h1>Who took the crown this week?</h1>
const CROWN_INTERVAL_WEEKS = 8;

// ✅ RIGHT
<h1>{homepage1Config.coverTagline}</h1>
const CROWN_INTERVAL_WEEKS = CROWN_CONFIG.rotationWeekLimit;
```

### Law 3 — All Animation Constants Are Centralized
```typescript
// ✅ All animation values in one place
// tmi-platform/packages/hud-theme/src/motion.tokens.ts
export const MOTION = {
  PAGE_FLIP_MS: 400,
  CARD_HOVER_SCALE: 1.05,
  CARD_HOVER_ROTATE: 2,
  CROWN_PORTRAIT_SECONDS: 6,
  RING_PORTRAIT_SECONDS: 3,
  TIER_UPGRADE_MS: 9000,
  CORNER_PEEL_MS: 600,
  VHS_SCANLINE_INTENSITY: 0.03,
} as const;
```

### Law 4 — All Homepage Sections Are Config-Driven

```typescript
// ✅ Homepage belt registry
// config/homepage-belts.config.ts
export const HOME2_BELTS = {
  activity: {
    id: 'live-world-activity',
    title: 'Live World (Activity Belt)',
    sections: ['main-preview-lobby', 'lobby-wall', 'join-random-room']
  },
  discovery: {
    id: 'discovery-belt',
    sections: ['world-premieres', 'event-calendar']
  },
  boost: {
    id: 'boost-belt',
    sections: ['undiscovered-boost', 'cypher-arena', 'stream-and-win']
  }
}
```

### Law 5 — Card Variants Extend One Shared Base
```typescript
// ✅ All cards extend CanvasCard
interface CanvasCardProps {
  id: string;
  variant: CardVariant;
  initialPos?: { x: number; y: number };
  draggable?: boolean;
  data: Record<string, unknown>;
}

// Crown card extends it
interface CrownCardProps extends CanvasCardProps {
  artistId: string;
  weekNumber: number;
  motionClipUrl: string;
}
```

### Law 6 — All Bots Are Config-Driven, Not Scattered Literals
```json
// ✅ /bots/manifests/crown-bot.manifest.json
{
  "id": "crown-bot",
  "schedule": "0 0 * * SUN",
  "owner": "big-ace",
  "permissions": ["read:rankings", "write:crown-state", "write:homepage"],
  "fallback": "hold-current-crown",
  "log_channel": "bot-logs:crown"
}
```

### Law 7 — Big Ace Override Points Are Clearly Exposed
Every page component that Big Ace can override must expose an override prop:
```typescript
interface HomepageCoverProps {
  adminOverride?: {
    forcedCrownArtistId?: string;
    comicInsertContent?: ComicInsert;
    disableCrownAnimation?: boolean;
  }
}
```

### Law 8 — Max File Sizes (Recommended)
| File Type | Max Lines |
|---|---|
| Page component | 200 |
| Card component | 150 |
| Engine/service | 300 |
| Config file | 100 |
| Bot manifest | 50 |
| Type file | 100 |

If a file exceeds this: split it.

---

# MASTER_AUTOMATION_OPERATING_MATRIX.md
## Every Bot — What It Does, Who Owns It, How It Fails

---

## PURPOSE
The platform runs like an elite company.
Every bot knows its job, its limits, and its chain of command.
This file is the bot operating law.

---

## BOT MATRIX

| Bot | Schedule | Reads | Writes | Cannot Touch | Owner | Fallback | Logs To |
|---|---|---|---|---|---|---|---|
| `crown-bot` | Sun midnight | rankings, history | crown_state, homepage | Design, security | Big Ace | hold current | `bot:crown` |
| `archivist-bot` | Sun midnight | all events, content | issues archive | Live data | Big Ace | skip week | `bot:archive` |
| `discovery-bot` | Every 15min | viewer counts, profiles | lobby sort order | Rankings | Algorithm | previous sort | `bot:discovery` |
| `broadcaster-bot` | On show start | hype, viewers, tips | audio stream | System config | Framework | silence | `bot:broadcast` |
| `director-bot` | During events | hype, positions | camera signals | Stream encode | Framework | wide shot | `bot:director` |
| `hype-bot` | During events | energy meter | VFX triggers | User data | Framework | no VFX | `bot:hype` |
| `loot-bot` | During events | hype > 80% | loot_drop_events | Economy ledger | Big Ace | no drop | `bot:loot` |
| `oracle-bot` | Daily 9am | trending topics | polls, trivia | Rankings | Algorithm | reuse last | `bot:oracle` |
| `design-bot` | On avatar create | user genre prefs | style suggestions | Avatar save | Framework | no suggest | `bot:design` |
| `guardian-bot` | Continuous | chat, behavior | mute, ghost, timeout | Crown, rankings | Big Ace | no action | `bot:guardian` |
| `qc-bot` | On avatar save | avatar geometry | block/approve save | User data | Framework | flag for review | `bot:qc` |
| `janitor-bot` | Every 5min | active sessions | ghost cleanup | Live state | Framework | skip cycle | `bot:janitor` |
| `metronome-bot` | 100ms pulse | server time | sync signal | All state | Mainframe | degrade to 500ms | `bot:sync` |
| `accountant-bot` | Real-time | tips, subs, streams | earnings ledger | Payout queue | Big Ace | queue for retry | `bot:economy` |
| `mechanic-bot` | FPS monitor | performance metrics | LOD levels | Core render | Framework | warn only | `bot:perf` |
| `interview-bot` | Weekly | artist data, trends | article drafts | Publishing | Algorithm | skip week | `bot:content` |
| `news-bot` | Hourly | platform events | news article drafts | Publishing | Algorithm | skip cycle | `bot:content` |
| `clip-bot` | During events | hype peaks, tips | clip requests | Stream source | Framework | miss clip | `bot:clips` |
| `spin-bot` | On login | last_spin_timestamp | spin results | Earnings | Framework | show timer | `bot:spin` |
| `foley-bot` | During events | avatar positions | audio pan signals | Stream audio | Framework | mono audio | `bot:foley` |
| `empath-bot` | Opt-in live | webcam blendshapes | avatar expression | Raw video | Framework | idle animation | `bot:avatar` |
| `rewind-bot` | Event end | event data | archive package | Live data | Framework | skip archive | `bot:archive` |
| `location-bot` | On page load | server IP | HUD coordinates | User location | Framework | default coords | `bot:hud` |
| `experiment-bot` | Weekly | analytics, metrics | experiment config | Crown, design | Algorithm | skip week | `bot:experiments` |
| `self-review-bot` | Weekly Sun | all logs, metrics | review report | Any config | Algorithm | log only | `bot:review` |

---

## BOT COMMAND HIERARCHY

```
MAINFRAME (governs all bots)
    ↓
BIG ACE (can start/stop/override any bot)
    ↓
FRAMEWORK (runs most bots)
    ↓
ALGORITHM (runs optimization bots)
    ↓
BOTS (execute)
```

**Marcel**: Can view bot logs and status. Cannot start/stop/configure.
**Jay Paul**: Can view bot status only.

---

*Editability Rules + Bot Operating Matrix v1.0 — BerntoutGlobal XXL*
