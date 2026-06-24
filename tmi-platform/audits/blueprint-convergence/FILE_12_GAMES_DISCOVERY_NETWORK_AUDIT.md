# FILE 12: tmi_games_discovery_network_page.html — TMI Live Games Discovery Network

**File Status:** MISSING_FROM_CANONICAL_FOLDER / RECOVERED_FROM_ZIP  
**ZIP Location:** `Homapge and battle challange and cyphers/tmi_games_discovery_network_page.html`  
**Audit Date:** 2026-06-23  
**Lines Analyzed:** 254 (complete)  
**Blueprint Completeness:** 85% (full interactive UI, routing spec complete)  
**Runtime Convergence:** 5-10% (no runtime implementation found)  
**Rule 20 Violations:** 🔴 CRITICAL (8+ fake data sources + simulated ticker)

---

## EXECUTIVE SUMMARY

FILE_12 is a **comprehensive games discovery network UI** showcasing 14 playable games (Name That Tune, Monthly Idol, Dirty Dozens, Dance-Off, World Dance Party, Circle and Squares, Stream & Win Radio, Song Challenge, Beat Battle, Joke-Off, Trivia Night, Open Mic, World Release Party, Marcel's Monday Night Stage). The page structure and visual design are complete; all game data, player counts, audience counts, scores, and routing are fabricated, blocking launch until wired to real Game Engine and Live Session Registry.

---

## FAKE DATA AUDIT (Rule 20 Violations)

### Hardcoded Static Values

| Line | Element | Value | Context |
|---|---|---|---|
| 35 | Active Games Count | `9` | `<span id="activeGames">9</span> games active now` |
| 38 | Rotation Timer | `13` | `<span id="rotGames">13</span>s — Rotating in` |
| 60 | Deal or Feud Title | "DEAL OR FEUD 1000" | Featured game name (hardcoded) |
| 61 | Deal or Feud Round | "Round 3/5" | Featured game status (hardcoded) |
| 69 | Team A Score | `74` | Featured game Team A score (hardcoded) |
| 75 | Team B Score | `13` | Featured game Team B score (hardcoded) |
| 70 | Team A Name | "Live Scorers Team" | Featured game team name (hardcoded) |
| 76 | Team B Name | "Ball Dominoes Group" | Featured game team name (hardcoded) |
| 88 | Audience Count | "2,284" | Featured game audience count (hardcoded) |
| 96 | Audience + Seats | "2,284 in audience · 438 seats open" | Seats calculation (hardcoded) |

### Simulated Metric Ticker (Line 252)

```javascript
// Active games ticker — simulates live changes
const ag = document.getElementById('activeGames');
if (ag) {
  const n = parseInt(ag.textContent);
  ag.textContent = Math.max(5, n + Math.floor((Math.random() - 0.5) * 1));
}
```

- Increments active game count by `Math.random() - 0.5` (roughly -0.5 to +0.5, effectively ±1 randomly)
- Runs every 1000ms (1 second)
- Never reads from real game session data
- Creates illusion of dynamic game activity

### Rotating Ticker Bar (Lines 158-169)

The bottom ticker displays hardcoded game stats on infinite scroll:

```html
<span>⚡ Deal or Feud 1000 — LIVE · 2,284 watching</span>
<span>👑 Monthly Idol Finals — Round 3 of 5</span>
<span>🎵 Name That Tune — 840 players</span>
<span>💃 World Dance Party — 3,200 on the floor</span>
<span>😂 Dirty Dozens — 75% crowd meter</span>
<span>🎤 Marcel's Monday Night Stage — starting in 12 mins</span>
<span>⭐ Name That Lyric — Season 4 begins tonight</span>
<span>🎧 Stream & Win Radio — 9,282 listening</span>
```

**Issues:**
- All metrics hardcoded (2,284 watching, 840 players, 3,200 on floor, 9,282 listening, 75% meter)
- Game statuses hardcoded (Round 3/5, starting in 12 mins)
- Text duplicated to create infinite scroll effect
- Never updated from real game session data

### GAMES Array — Hardcoded Game Statistics (Lines 174-189)

All 14 games defined with fabricated data:

```javascript
const GAMES = [
  {
    id: 'name-that-tune',
    name: 'Name That Tune',
    emoji: '🎵',
    cat: 'music',
    desc: 'Guess the song, artist, or lyrics',
    status: 'LIVE',
    players: 840,           // FAKE
    audience: 1640,         // FAKE
    access: 'FREE',
    score1: {label: 'Solo', v: 74},         // FAKE
    score2: {label: 'Team', v: 26},         // FAKE
    route: '/games/name-that-tune',
    color: 'warning',
    hostNote: ''
  },
  // ... 13 more games with similar fake data
  {
    id: 'monthly-idol',
    name: 'Monthly Idol',
    players: 12,            // FAKE
    audience: 5400,         // FAKE
    score1: {label: 'Top Score', v: 88},   // FAKE
    score2: {label: 'Votes', v: 72},       // FAKE
    hostNote: 'Finals — Round 3/5'         // FAKE
  },
  // ... and 11 more
];
```

**Pattern:** Every game card contains:
- `players`: hardcoded (0-32 range)
- `audience`: hardcoded (0-5400 range)
- `score1.v` and `score2.v`: hardcoded percentages (26-100%)
- Status labels (LIVE, STARTING, UPCOMING): hardcoded enum values
- Host notes: hardcoded static text

**Total Fake Data Entries:** 14 games × 4 metrics per game = 56 hardcoded data points + 1 active count ticker + 1 rotation timer + featured card scores + ticker bar = **~75 fake data instances**

---

## ARCHITECTURE

### Page Structure

**Header Section (Lines 31-41)**
- Page title: "TMI Live Games Discovery Network"
- Subtitle: "Live preview broadcast · Nothing is a dead click"
- Active games counter: displays current active game count (hardcoded "9")
- Rotation timer: countdown to auto-refresh (hardcoded "13"s)
- "Build in repo" button: links to Gemini/Claude with full build spec

**Category Filter (Lines 43-51)**

Six category buttons with onclick filtering:
- 🎮 All games (default)
- 🎵 Music games
- 🤝 Social games
- 🏆 Competition
- 🎉 Party / Dance
- 😂 Comedy

Implementation: `setCat()` function filters GAMES array by `g.cat` property, calls `renderGames()`.

**Featured Game Card (Lines 53-108)**

Large showcase for "Deal or Feud 1000":
- Left side: live scoreboard preview with team scores (Team A: 74 vs Team B: 13), contestant boxes, audience reaction meter, live stats
- Right side: game description, audience count, access type (FREE), venue (Arena), JOIN/CONTESTANT/WATCH buttons

**Games Grid (Lines 110-113)**

Auto-filled grid (220px min, responsive) containing 14 game cards, populated by `renderGames()` JavaScript function.

Each card structure:
```
[Status Badge] [Audience Count] [Large Emoji] [Host Note]
[Score Bar 1] [Score Bar 2]
---
[Game Name]
[Game Description]
[Join Lobby Button] [Watch Eye Button]
[Route: /games/[gameId]/lobby]
```

**Seat Join Flow Diagram (Lines 115-136)**

Step-by-step flow visualization:
1. Click game tile
2. Access gate check
3. Reserve seat
4. Assign avatar position
5. AudienceScene loads
6. Live stream + game video
7. Playlist + chat sync
8. **You're inside!** (success state)

Route spec: `/games/[gameId] → /games/[gameId]/lobby → /live/rooms/[sessionId]`

**Magazine Integration (Lines 138-153)**

Six "game insert cards" simulating random game promotions appearing while flipping magazine pages:
- 👑 MONTHLY IDOL FINALS!
- 🎵 DEAL OR FEUD 1000
- 💃 WORLD DANCE PARTY
- 😂 DIRTY DOZENS
- 🎤 MONDAY NIGHT STAGE
- 📻 STREAM & WIN

Each insert is a card that, when clicked, routes directly to the game lobby → AudienceScene → seated.

**Rotating Ticker Bar (Lines 155-171)**

Infinite-scroll ticker at page bottom displays game activity (CSS animation `scrollL 25s linear infinite`):
- Repeat: hardcoded game status strings
- Updates continuously with fake stats
- Never reads from real session data

### Games Catalog (14 Total)

| # | ID | Name | Category | Status | Players | Audience | Route |
|---|---|---|---|---|---|---|---|
| 1 | name-that-tune | Name That Tune | music | LIVE | 840 | 1,640 | /games/name-that-tune |
| 2 | monthly-idol | Monthly Idol | competition | LIVE | 12 | 5,400 | /games/monthly-idol |
| 3 | monday-night-stage | Marcel's Monday Night Stage | music | STARTING | 8 | 0 | /games/monday-night-stage |
| 4 | dirty-dozens | Dirty Dozens | comedy | LIVE | 2 | 980 | /games/dirty-dozens |
| 5 | joke-off | Joke-Off | comedy | LIVE | 2 | 640 | /games/joke-off |
| 6 | dance-off | Dance-Off | party | LIVE | 4 | 1,200 | /games/dance-off |
| 7 | world-dance-party | World Dance Party | party | LIVE | 1 | 3,200 | /games/world-dance-party |
| 8 | circle-squares | Circle and Squares | social | LIVE | 6 | 720 | /games/circle-squares |
| 9 | stream-win-radio | Stream & Win Radio | music | LIVE | 0 | 9,282 | /games/stream-win |
| 10 | song-challenge | Song Challenge | competition | UPCOMING | 0 | 0 | /games/song-challenge |
| 11 | world-release | World Release Party | music | UPCOMING | 1 | 0 | /games/world-release |
| 12 | trivia | Trivia Night | social | LIVE | 32 | 440 | /games/trivia |
| 13 | open-mic | Open Mic Night | music | LIVE | 8 | 380 | /games/open-mic |
| 14 | beat-battle | Beat Battle | competition | LIVE | 2 | 560 | /games/beat-battle |

---

## USER INTERACTIONS

### Game Selection Flow

**Standard Click Flow:**
```
Click Game Card → joinGame(gameId, 'AUDIENCE')
  → Alert shows join flow
  → (In production) Route to /games/[gameId]/lobby
  → Seat assignment engine
  → AudienceScene loads
  → Live stream + game video + chat connect
  → User is seated
```

**Current Issue:** `joinGame()` function (lines 191-194) only calls `alert()` with join flow text, does not route to real URL. All buttons call `event.stopPropagation()` to prevent default routing.

### Button Actions (Lines 102-104, 233-234)

**Featured Card:**
- "Join audience — get seat": `joinGame('deal-or-feud-1000','AUDIENCE')`
- "Enter as contestant": `joinGame('deal-or-feud-1000','CONTESTANT')`
- "Watch mode": `joinGame('deal-or-feud-1000','WATCH')`

**Grid Cards:**
- "Join lobby": `joinGame(g.id,'AUDIENCE')`
- "Watch" (eye icon): `joinGame(g.id,'WATCH')`

### Category Filtering (Lines 196-202)

```javascript
function setCat(c, btn) {
  curCat = c;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  renderGames();  // Re-render grid with filtered games
}
```

- Clicking category button sets `curCat`, highlights button, re-renders grid
- Filter logic (line 204): `GAMES.filter(g => g.cat === curCat || g.cat.includes(curCat))`
- Works client-side only; does not fetch from registry

### Auto-Rotation (Lines 243-253)

```javascript
let gRot = 13;
setInterval(() => {
  gRot--;
  if (gRot <= 0) {
    gRot = 13;
    renderGames();  // Re-render grid on timer expire
  }
  const el = document.getElementById('rotGames');
  if (el) el.textContent = gRot;
  // ... also updates activeGames count with Math.random()
}, 1000);
```

- Counts down 13-second timer every 1 second
- When timer reaches 0, re-renders games grid (shuffles order)
- Also ticks active games count with random variation
- Creates illusion of dynamic activity

---

## RUNTIME EQUIVALENTS

### Blueprint Artifact
Comprehensive games discovery network showcasing 14 playable games with live stats (player counts, audience counts, game scores, status), category filtering, featured game card, seat join flow diagram, magazine integration, rotating ticker.

### Current Runtime File(s)
- **Potential Primary:** `apps/web/src/app/games/page.tsx` (if exists)
- **Potential Discovery:** `apps/web/src/components/discovery/GamesDiscoveryRail.tsx` (if exists)
- **Data Source (Future):** GameSessionRegistry (does not exist yet)
- **Routing:** `/games/[gameId]`, `/games/[gameId]/lobby`, `/live/rooms/[sessionId]` (not yet implemented)

**Search Result:** No GamesDiscoveryPage found in current repo; this is a reference architecture document.

### Convergence Analysis

**Visual/Layout:** 85% complete (full UI specification, CSS complete, interaction patterns documented)
**Data Wiring:** 0% (all data hardcoded, no APIs consulted)
**Routing:** 5% (joinGame() alerts instead of routing, no real /games/[gameId] pages exist yet)
**Overall Convergence:** 5-10%

### Missing Pieces

1. **Game Session Registry** — Must track active games, player counts, audience counts, game status (LIVE/STARTING/UPCOMING)
2. **Real Routing** — `joinGame()` must navigate to `/games/[gameId]/lobby`, not alert
3. **Seat Assignment Integration** — Lobby must assign seats before dropping into AudienceScene
4. **Live Stats Updates** — Player counts, audience counts, scores must stream from real game engines, not static GAMES array
5. **Magazine Integration UI** — Game inserts must appear randomly in magazine pages with real games
6. **Category Organization** — Category filter must read from GameCategoryRegistry, not hardcoded enum
7. **Game Pages** — All 14 games need individual game-specific lobby pages at `/games/[gameId]/lobby`

### Visual Gaps
None. Design is complete and production-ready.

### Data Gaps

| Data Element | Current | Required |
|---|---|---|
| Game List | GAMES array (hardcoded 14 items) | GameSessionRegistry.getActiveGames() OR GameCatalogRegistry (persisted) |
| Active Games Count | Simulated ticker "9" + random | GameSessionRegistry.getActiveGameCount() or GAMES.filter(g => g.status !== 'UPCOMING').length |
| Game Status | Hardcoded enum (LIVE/STARTING/UPCOMING) | Read from GameSession.status for each game |
| Player Count | Hardcoded per game (0-840) | GameSession.getPlayerCount() |
| Audience Count | Hardcoded per game (0-5400) | GameSession.getAudienceCount() or AudienceScene occupancy |
| Game Scores | Hardcoded percentages (26-100%) | GameSession.getScoreMetrics() or real scoring engine |
| Category Filter | Hardcoded cat property | GameCategoryRegistry.getCategories() or GAME_TAXONOMY |
| Rotation Timer | Hardcoded 13s countdown | Could be configurable or removed in favor of real-time updates |
| Featured Game | Hardcoded "Deal or Feud 1000" | GameSessionRegistry.getFeaturedGame() (top by audience/status) |

### Launch Blocking
**YES — Multiple Critical Blockers**

Cannot certify for launch until:
1. GameSessionRegistry or equivalent engine built (manages active games, player/audience counts, scores, status)
2. Real routing implemented (`joinGame()` navigates, not alerts)
3. All hardcoded game stats replaced with real API calls
4. Game-specific lobby pages created (no more /games/[gameId] that route to alerts)
5. Seat assignment gateway wired (AudienceScene entrance)
6. Magazine integration implemented (game inserts appear while page flipping)
7. All ticker/counter values sourced from real data

**Estimated Wiring Effort:** 12-16 hours (high priority, significant integration work, new GameSessionRegistry likely needed, 14 game-specific pages)

---

## THEME CLASSIFICATION

**Theme:** None (utility/discovery surface, not visually themeable)

**Reasoning:** This page is a discovery/routing surface, not a visual experience with alternative skins. Unlike Home 1 (neon vs. magazine), all games display in a consistent grid layout with status-driven colors. The visual presentation is functional, not themeable.

---

## CONVERGENCE ACTION

**Action: BUILD + INTEGRATE**

This is primarily a reference/vision document. Implementation requires:

1. **Create GameSessionRegistry** (or find existing equivalent):
   - Track all active game sessions
   - Store: gameId, status, playerCount, audienceCount, scores, timeStarted, nextRound, etc.
   - Provide queries: `getActiveGames()`, `getFeaturedGame()`, `getGameCount()`, `getGamesByCategory()`

2. **Build /games page** (canonical):
   - Replace GAMES hardcoded array with real API call to GameSessionRegistry
   - Implement category filtering on real data
   - Wire featured game to real top-priority game (by audience count or status)
   - Replace `joinGame()` alerts with real route navigation

3. **Create Game Lobby Pages** (`/games/[gameId]/lobby`):
   - Access gate (check if user can join: FREE vs. paid vs. contestant)
   - Seat reservation (call seat assignment engine)
   - Avatar position assignment
   - AudienceScene gateway

4. **Implement Seat Join Flow**:
   - `/games/[gameId]` → `/games/[gameId]/lobby` → `/live/rooms/[sessionId]`
   - No dead links, no placeholder pages

5. **Wire Magazine Integration**:
   - Modify magazine page-turn engine to randomly insert game cards
   - Clicking insert routes to `/games/[gameId]/lobby`

6. **Wire Ticker Bar**:
   - Replace hardcoded game strings with real-time stream from GameSessionRegistry
   - Show live stats (player counts, audience counts, scores)
   - Update every 1-2 seconds

---

## CODE SECTIONS (Key Patterns)

### GAMES Array Definition (Lines 174-189)

```javascript
const GAMES = [
  {
    id: 'name-that-tune',
    name: 'Name That Tune',
    emoji: '🎵',
    cat: 'music',
    desc: 'Guess the song, artist, or lyrics',
    status: 'LIVE',
    players: 840,             // HARDCODED
    audience: 1640,           // HARDCODED
    access: 'FREE',
    score1: {label: 'Solo', v: 74},      // HARDCODED
    score2: {label: 'Team', v: 26},      // HARDCODED
    route: '/games/name-that-tune',
    color: 'warning',
    hostNote: ''
  },
  // ... repeat for 13 more games
];
```

**Issues:**
- No way to dynamically add/remove games
- No real-time updates to player/audience counts
- Scores are static percentages, not derived from real game logic
- Status is fixed, never transitions from UPCOMING → STARTING → LIVE

### Category Filter (Line 204)

```javascript
const filtered = curCat === 'all' 
  ? GAMES 
  : GAMES.filter(g => g.cat === curCat || g.cat.includes(curCat));
```

**Issue:** Works on hardcoded array; should query from GameCategoryRegistry and filter real game sessions.

### Game Card Rendering (Lines 206-239)

```javascript
el.innerHTML = filtered.map(g => {
  const statusColor = g.status === 'LIVE' 
    ? 'danger' 
    : g.status === 'STARTING' 
      ? 'warning' 
      : 'secondary';
  return `<div class="game-card" onclick="joinGame('${g.id}','AUDIENCE')">
    <!-- Card HTML -->
  </div>`;
}).join('');
```

**Issues:**
- `onclick="joinGame(...)"` calls alert function, not router
- Color determined by status enum, not by dynamic game state
- No error handling if GameSessionRegistry unavailable

### Join Button Handler (Lines 191-194)

```javascript
function joinGame(gameId, mode) {
  const msgs = {
    AUDIENCE: `Joining ${gameId} as audience member\n\n...(flow text)...`,
    CONTESTANT: `Entering ${gameId} as contestant\n\n...(flow text)...`,
    WATCH: `Watch mode: ${gameId}\n\n...`
  };
  alert(msgs[mode] || `Routing to ${gameId}`);
}
```

**Issues:**
- Only calls `alert()`, does not navigate
- No access control (any user can see all modes)
- No seat availability check
- No payment/access gate verification

### Featured Card (Lines 54-108)

```html
<div class="game-card featured">
  <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:0">
    <!-- Scoreboard: Team A 74 vs Team B 13 -->
    <!-- JOIN/CONTESTANT/WATCH buttons -->
  </div>
</div>
```

**Issues:**
- Featured game is hardcoded to Deal or Feud 1000
- Scores are hardcoded (74 vs 13)
- Should dynamically select featured game from GameSessionRegistry (e.g., highest audience count)

---

## AUDIT METADATA

| Field | Value |
|---|---|
| File Name | tmi_games_discovery_network_page.html |
| File Status | MISSING_FROM_CANONICAL_FOLDER / RECOVERED_FROM_ZIP |
| Lines Analyzed | 254 (complete) |
| Specification Completeness | 85% |
| Runtime Convergence | 5-10% |
| Rule 20 Violations | 8 critical (featured card scores, active count ticker, 14 games × 4 metrics, rotation timer, ticker bar) |
| Visual Themes | 0 (utility surface, not themeable) |
| Fake Data Patterns | Hardcoded GAMES array, simulated tickers, alert-based routing (not real navigation) |
| Safe for Launch? | NO — all data hardcoded, routing non-functional |
| Games Catalogued | 14 (all with fake stats) |
| Category Types | 6 (music, social, competition, party, comedy, all) |
| Runtime Dependency | GameSessionRegistry (does not exist), AudienceScene, Seat Assignment Engine |
| Code Modified | NO |
| Ready for Next File | YES |

---

**Blueprint File:** 12 of 43  
**Status:** Complete visual/routing specification, blocked by GameSessionRegistry build and route implementation  
**Priority:** CRITICAL (Games discovery is Home 5 core surface)

---

**Recommendation:** Flag for BUILD phase post-GameSessionRegistry. Coordinate with FILE_13 (Arena Triangle) — both systems need unified Venue/Audience/Competition infrastructure. Consider whether GameSessionRegistry should be unified with ArenaEventShell or remain separate (recommend separate: games are a broader category than arena events).

**Dependency Chain:** GameSessionRegistry → GameLobbyFlow → AudienceScene → Seat Assignment → TipAPI → ScoreAPI → WinnerAnnouncement

