# FILE 14: tmi_billboard_live_lobby_wall_system.html — Billboard Live Lobby Wall System

**File Status:** MISSING_FROM_CANONICAL_FOLDER / RECOVERED_FROM_ZIP  
**ZIP Location:** `Homapge and battle challange and cyphers/tmi_billboard_live_lobby_wall_system.html`  
**Audit Date:** 2026-06-23  
**Lines Analyzed:** 311 (complete)  
**Blueprint Completeness:** 90% (full interactive UI, routing spec complete)  
**Runtime Convergence:** 10-15% (BillboardLiveWall exists, but data not wired)  
**Rule 20 Violations:** 🔴 CRITICAL (8+ fake data sources + continuous metric tickers)

---

## EXECUTIVE SUMMARY

FILE_14 is a **comprehensive live broadcast discovery network UI** showcasing 8 wall types (Global, Genre, Performer, Fan, Battle, Venue, Magazine, Sponsor) with 12 playable live session examples. The visual design, tile shapes, wall layouts, routing flow, and season/mode selection are production-ready; all viewer counts, hype scores, tip amounts, live session counts, and routing are hardcoded, blocking launch until wired to GlobalLiveSessionRegistry and real routing endpoints.

---

## FAKE DATA AUDIT (Rule 20 Violations)

### Hardcoded Static Values

| Line | Element | Value | Context |
|---|---|---|---|
| 52 | Live Count | `21` | `<span id="liveCount">21 rooms live now</span>` |
| 73 | Rotation Timer | `13` | `<span id="rotTimer">13</span>s` |

### Hardcoded Sessions Array (Lines 153-166)

All 12 session objects contain fabricated data:

```javascript
const SESSIONS = [
  {id:'s1', name:'Wavetek', genre:'Hip-Hop', type:'performer', event:'Public Live', access:'FREE', vc:2841, hype:94, tip:340, sponsored:false, shape:'oct', color:'info'},
  {id:'s2', name:'Astra Nova', genre:'R&B', type:'performer', event:'Public Live', access:'FREE', vc:1204, hype:87, tip:89, sponsored:true, shape:'oct', color:'warning'},
  // ... 10 more sessions
];
```

**Hardcoded Data Per Session:**
- `vc` (viewer count): 2,841, 1,204, 3,200, 1,840, 940, 124, 88, 8,200, 5,400, 340, 1,200, 670
- `hype` (engagement score): 94, 87, 98, 96, 88, 65, 71, 99, 97, 90, 82, 85
- `tip` (tips amount): 340, 89, 562, 0, 0, 0, 0, 0, 0, 280, 0, 43

**Issue:** All metrics are hardcoded in JavaScript object literals. No connection to real LiveSession data.

### Simulated Metric Tickers (Lines 301-307)

**Viewer Count Ticker:**
```javascript
document.querySelectorAll('.vc').forEach(el => {
  const v = parseInt(el.textContent.replace(/[^0-9]/g, '')) || 500;
  el.innerHTML = '👁 ' + (Math.max(10, v + Math.floor((Math.random() - .4) * 80))).toLocaleString();
});
```

- Updates every 1 second
- Increments by `(Math.random() - 0.4) * 80` (roughly -32 to +48 per tick)
- Never reads from real audience data

**Live Count Ticker:**
```javascript
const lc = document.getElementById('liveCount');
if (lc) {
  const n = parseInt(lc.textContent) + Math.floor((Math.random() - .4) * 1);
  lc.textContent = Math.max(10, n) + ' rooms live now';
}
```

- Updates every 1 second
- Increments by `Math.floor((Math.random() - 0.4) * 1)` (roughly -0.5 to +0.5, effectively ±1)
- Never reads from real active session count

**Total Fake Data:** 12 sessions × 3 metrics (vc, hype, tip) = 36 hardcoded values + 2 tickers + 1 rotation timer + 1 live count = **~45 fake data instances**

---

## ARCHITECTURE

### Page Structure

**Header (Lines 49-62)**
- Page title: "Billboard Live Lobby Wall System"
- Subtitle: "The live broadcast network of TMI"
- Live count display: "21 rooms live now" (hardcoded, ticker-updated)
- Season selector: Spring (default)/Summer/Fall/Winter
  - Each season has a color: pink/orange/dark red/cyan
  - Function `setSeason(s)` toggles button highlight

**Broadcast Mode Section (Lines 64-76)**

Five mode buttons:
- 🌐 Global live (default) — all public live sessions
- 🎤 Hip-Hop takeover — hip-hop focus
- 🎮 Games network — games only
- 🎪 Concert mode — venues/concerts
- 👑 Monthly Idol — Monthly Idol rounds

Each mode has a description (stored in `descs` object, line 270). Rotation countdown timer (13s).

**Wall Type Tabs (Lines 78-88)**

Eight wall tabs:
- 🌐 Global live
- 🎵 Genre walls
- 🎤 Performer live
- 💃 Fan live
- ⚔️ Battle wall
- 🏟️ Venue wall
- 📰 Magazine wall
- 💼 Sponsor wall

**Main Layout (Lines 91-121)**

Two-column grid:
- **Left Sidebar (160px, Lines 94-114):** "Live routing flow" diagram showing:
  1. User goes live
  2. Public room created
  3. Venue scene loads
  4. AudienceScene + bots
  5. Live tile appears
  6. Homes 1/1-2/3 update
  7. Profile shows LIVE
  8. Admin observatory
  
  With closing note: "One LiveSessionRegistry feeds all surfaces — no duplicate systems"

- **Right Main Display (1fr, Lines 118-120):** Wall display rendered by `renderWall(wallKey)` JavaScript function

**Genre Filter (Lines 124-136)**

Appears when genre wall is selected (display:none by default). 10 genre chips:
- 🎤 Hip-Hop (default)
- 🎵 R&B
- ✝️ Gospel
- 😂 Comedy
- 💃 Dance
- 🎧 DJ
- 🎺 Jazz
- 🎸 Rock
- ✍️ Poetry
- 🎹 Producer

**Magazine Integration Strip (Lines 139-143)**

Horizontal scroll of 8 content type cards:
1. Live Performer (ti-microphone)
2. Fan Lobby (ti-users)
3. Battle (ti-swords)
4. Cypher (ti-microphone-2)
5. Game Room (ti-device-gamepad)
6. Venue Live (ti-building)
7. Playlist (ti-playlist)
8. Memory Wall (ti-photo-album)

Each card is a clickable link to that content type in magazine context.

### Wall Configurations

**WALLS Object (Lines 196-205):**

```javascript
const WALLS = {
  global: {label: 'Global Live', desc: 'All public live sessions', sessions: SESSIONS, layout: 'mixed'},
  genre: {label: 'Genre Walls', desc: 'Hip-Hop live — click genre to switch', sessions: SESSIONS.filter(...), layout: 'grid'},
  performer: {label: 'Performer Live', desc: 'Active performer livestreams', sessions: SESSIONS.filter(...), layout: 'grid'},
  fan: {label: 'Fan Live', desc: 'Fan public lobbies', sessions: SESSIONS.filter(...), layout: 'circles'},
  battle: {label: 'Battle Wall', desc: 'Active battles, cyphers, challenges', sessions: SESSIONS.filter(...), layout: 'hex'},
  venue: {label: 'Venue Wall', desc: 'Live venues, concerts, ticketed events', sessions: SESSIONS.filter(...), layout: 'cinema'},
  magazine: {label: 'Magazine Live', desc: 'Live interviews, features, release parties', sessions: SESSIONS.filter(...), layout: 'torn'},
  sponsor: {label: 'Sponsor Wall', desc: 'Sponsored rooms and brand takeovers', sessions: SESSIONS.filter(...), layout: 'grid'},
};
```

Each wall filters from the static SESSIONS array based on session type.

### Tile System

**Tile Shapes (CSS clip-path, Lines 13-21):**

| Shape | Use Case | CSS Clip-Path |
|---|---|---|
| Octagon | Normal live sessions | `polygon(25% 0%, 75% 0%, 100% 25%, ...)` |
| Hexagon | Battle/cypher | `polygon(50% 0%, 100% 25%, 100% 75%, ...)` |
| Circle | Fan lobbies | `border-radius: 50%` |
| Ticket | Paid venue events | Torn-ticket shape |
| Diamond | VIP Diamond rooms | Diamond `polygon(50% 0%, 100% 50%, ...)` |
| Cinema | Wide concerts | `aspect-ratio: 21/9` |
| Torn | Magazine inserts | Torn-paper bottom edge |
| Ribbon | Sponsor events | Ribbon with left border |

**Tile Structure (makeTile function, Lines 171-194):**

```html
<div class="live-tile [shapeClass]" onclick="joinRoom(route, access)">
  <div class="live-badge">LIVE</div>
  <div class="vc">👁 [viewerCount]</div>
  [ACCESS_BADGE if not FREE]
  [VS or CYPHER badge for battles/cyphers]
  [Large emoji background at opacity .4]
  <div class="tname">[roomName]</div>
  <div class="tgenre">[genre] · [eventType]</div>
  [Sponsor dot if sponsored]
  <div class="tile-btns" style="display:none on normal, flex on hover">
    <button>JOIN</button>
    <button>PROFILE</button>
    <button>MSG</button>
  </div>
</div>
```

**Tile Animations:**
- `broadcastIn`: scale 0.92→1 over 0.3s (appears)
- `livePulse`: glow box-shadow 2.5s infinite (live indicator)
- `blink`: live badge opacity 1.4s infinite (blink effect)
- `scanBar`: top: 0%→100% 3s infinite (scan line across tile)
- Hover: scale 1.04, z-index 10

**Wall Layouts (renderWall function, Lines 208-251):**

- **battle**: 3-column grid of hexagons, heights 110px (line 217)
- **fan**: flex wrap, 100px circles, gaps 14px (line 228)
- **venue**: flex column, cinema 21/9 aspect, heights 70px (line 234)
- **magazine**: 2-column grid, torn-edge tiles, heights 90px (line 240)
- **default**: 3-column grid, heights 90px (line 247)

### Sessions Catalog (12 Total)

| ID | Name | Genre | Type | Event | Access | Viewers | Hype | Tip | Sponsored |
|---|---|---|---|---|---|---|---|---|---|
| s1 | Wavetek | Hip-Hop | performer | Public Live | FREE | 2,841 | 94 | 340 | No |
| s2 | Astra Nova | R&B | performer | Public Live | FREE | 1,204 | 87 | 89 | Yes |
| s3 | DJ Kraze | DJ | performer | World Dance Party | FREE | 3,200 | 98 | 562 | Yes |
| s4 | Bar God vs Nova | Hip-Hop | battle | Battle | FREE | 1,840 | 96 | 0 | No |
| s5 | Lagos Burst vs Verse XL | Afrobeat | cypher | Cypher | FREE | 940 | 88 | 0 | No |
| s6 | Fan Lobby — Party Night | R&B | fan | Fan Live | FREE | 124 | 65 | 0 | No |
| s7 | Avatar Heavy | Dance | fan | Fan Live | FREE | 88 | 71 | 0 | No |
| s8 | Arena Prime — Concerts | Pop | venue | Concert | PAID | 8,200 | 99 | 0 | Yes |
| s9 | MONTHLY IDOL Finals! | All | magazine | Monthly Idol | FREE | 5,400 | 97 | 0 | Yes |
| s10 | VIP Diamond Lounge | Exclusive | vip | Diamond Surf | DIAMOND | 340 | 90 | 280 | Yes |
| s11 | Beats By TMX — Promo | Sponsor | sponsor | Sponsor Event | SPONSORED_FREE | 1,200 | 82 | 0 | Yes |
| s12 | Flex King Dance Showcase | Dance | performer | Dance-Off | FREE | 670 | 85 | 43 | No |

---

## USER INTERACTIONS

### Wall Selection (Lines 254-259)

```javascript
function setWall(w, btn) {
  curWall = w;
  document.querySelectorAll('.wall-tab').forEach(t => t.classList.remove('on'));
  btn.classList.add('on');
  document.getElementById('genreStrip').style.display = w === 'genre' ? 'flex' : 'none';
  renderWall(w);
}
```

Clicking a wall tab:
1. Sets `curWall` variable
2. Toggles "on" class on button
3. Shows/hides genre filter strip
4. Re-renders wall display with filtered sessions

### Genre Filter (Lines 261-265)

```javascript
function setGenre(g, btn) {
  curGenre = g;
  document.querySelectorAll('.genre-chip').forEach(c => c.classList.remove('on'));
  btn.classList.add('on');
  renderWall('genre');
}
```

Clicking genre chip filters the genre wall to show only that genre's sessions.

### Broadcast Mode Selection (Lines 267-272)

```javascript
function setMode(m, label) {
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('on'));
  event.target.classList.add('on');
  const descs = {...};
  document.getElementById('modeDesc').textContent = descs[m] || 'Live broadcast network';
  rotSeconds = 13;
}
```

Clicking mode button updates description text and resets rotation timer. Does not filter sessions (modes are UI-only currently).

### Join Room (Lines 278-280)

```javascript
function joinRoom(route, access) {
  const msg = access === 'PAID' ? '🎟 Paid entry...' : access === 'DIAMOND' ? '💎 Diamond surf...' : '✅ Free...';
  alert(`Joining room:\n${route}\n\nAccess: ${msg}\n\nFlow: Access gate → Reserve seat → AudienceScene → Venue loads → You're in!`);
}
```

**Current Issue:** Only calls `alert()`, does not navigate. All JOIN buttons non-functional.

### Season Selection (Lines 274-276)

```javascript
function setSeason(s) {
  document.querySelectorAll('.season-btn').forEach(b => b.classList.remove('on'));
  document.getElementById('s-' + s).classList.add('on');
}
```

Toggles season button highlight. Does not change tile appearance (season theme would need to modify CSS variables or re-render).

### Magazine Strip (Lines 283-292)

Builds 8 content-type cards with hover effects. Currently decorative (click handlers not wired).

### Rotation Countdown (Lines 295-310)

```javascript
setInterval(() => {
  rotSeconds--;
  if (rotSeconds <= 0) { rotSeconds = 13; }
  const el = document.getElementById('rotTimer');
  if (el) el.textContent = rotSeconds;
  // Tick viewer counts
  document.querySelectorAll('.vc').forEach(...);  // Update each tile's viewer count
  // Tick live count
  const lc = document.getElementById('liveCount');
  if (lc) { const n = parseInt(...) + Math.floor(...); lc.textContent = Math.max(10, n) + ' rooms live now'; }
}, 1000);
```

Every 1 second:
1. Decrements rotation timer (13s countdown)
2. Updates every tile's viewer count with random variation
3. Updates total live count with random variation

All changes are simulated, not real data.

---

## RUNTIME EQUIVALENTS

### Blueprint Artifact
Comprehensive live broadcast discovery network with 8 wall types (Global, Genre, Performer, Fan, Battle, Venue, Magazine, Sponsor), shape-shifting tiles (octagons, hexagons, circles, cinematic), viewer/hype/tip metrics, real-time tickers, season themes, broadcast modes, magazine integration.

### Current Runtime File(s)
- **Primary:** `apps/web/src/components/discovery/BillboardLiveWall.tsx` (exists in repo)
- **Secondary:** `apps/web/src/components/discovery/MaskedVideoTile.tsx` (tile rendering)
- **Data Source:** `apps/web/src/lib/live/GlobalLiveSessionRegistry.ts` (does not wire data to tiles)
- **Avatar/Audience:** `apps/web/src/components/audience/AudienceScene.jsx`

### Convergence Analysis

**Visual/Layout:** 90% complete (all CSS shapes, animations, grid layouts working)
**Data Wiring:** 5% (only hardcoded SESSIONS array present, no API integration)
**Routing:** 0% (joinRoom() alerts instead of navigating)
**Overall Convergence:** 10-15%

### Missing Pieces

1. **Real Session Data** — Must read from GlobalLiveSessionRegistry, not SESSIONS array
2. **Real Routing** — `joinRoom()` must navigate to actual routes (ROUTES object defined but not used)
3. **Live Count Updates** — Must track actual active sessions from registry, not simulated ticker
4. **Viewer Count Real-time** — Must stream from AudienceScene occupancy or GlobalLiveSessionRegistry
5. **Tile Video Previews** — Currently tiles show emoji + title; should show live video or motion poster
6. **Access Gate Integration** — Paid/Diamond/Invite-only gates must check real user permissions
7. **Season Theme Application** — Season selector exists but doesn't change tile colors/borders/motion
8. **Broadcast Mode Filtering** — Modes change description but don't filter sessions

### Visual Gaps
None. Design is complete and production-ready.

### Data Gaps

| Data Element | Current | Required |
|---|---|---|
| Session List | SESSIONS array (hardcoded 12) | GlobalLiveSessionRegistry.getActiveSessions() |
| Session Status | Fixed enum (LIVE/STARTING) | Real-time status from session stream |
| Viewer Count | Hardcoded per session | AudienceScene.occupancyCount or stream |
| Hype Score | Hardcoded percentage | Computed from engagement (votes/tips/reactions) |
| Tip Amount | Hardcoded | Real tip total from TipAPI |
| Session Type | Hardcoded (performer/fan/battle/etc.) | Derived from session object |
| Sponsored Status | Hardcoded boolean | Lookup in SponsorRegistry |
| Access Level | Hardcoded (FREE/PAID/DIAMOND/etc.) | Check user tier + event requirements |
| Live Count | Simulated ticker "21" | GlobalLiveSessionRegistry.getActiveSessions().length |
| Season Theme | Hardcoded colors in CSS | Read from config or date-based logic |
| Broadcast Mode | Buttons exist, filtering not wired | Apply mode filter to session list |

### Launch Blocking
**YES — Multiple Critical Blockers**

Cannot certify for launch until:
1. All hardcoded SESSIONS replaced with real API queries
2. All viewer count, hype score, tip amount fields sourced from real data
3. Real routing implemented (`joinRoom()` navigates to ROUTES)
4. Live video/motion poster previews added to tiles
5. Access gate wiring (paid/diamond/invite checks)
6. Season theme actually changes tile appearance
7. Broadcast mode filtering functional
8. Rotation timer behavior (currently just visual countdown)

**Estimated Wiring Effort:** 14-18 hours (high priority, moderate complexity, mostly data integration + routing, no new architecture required)

---

## THEME CLASSIFICATION

**Theme:** 4 Season Themes (Spring/Summer/Fall/Winter)

**Theme Details:**

| Season | Primary Color | Secondary Color | Emoji | Tile Energy | Typography | Motion |
|---|---|---|---|---|---|---|
| Spring | #FF69B4 (hot pink) | #FFB6C1 (light pink) | 🌸 | Soft, flourishing | Rounded, delicate | Gentle float |
| Summer | #FF8C00 (dark orange) | #FFD700 (gold) | ☀️ | Bright, energetic | Bold, warm | Quick bounce |
| Fall | #8B0000 (dark red) | #CD5C5C (indian red) | 🍂 | Warm, fading | Textured, aged | Slow drift |
| Winter | #00BFFF (cyan) | #00CED1 (dark turquoise) | ❄️ | Cool, crystalline | Clean, precise | Sharp snap |

**Status:** Season selector exists (lines 55-61) but doesn't change tile appearance. Implementation would require:
- CSS variable injection per season (--season-primary, --season-secondary)
- Animation adjustments per season
- Typography weight/style changes
- Tile border styling per season

**Classification:** SEASONAL_THEME (4 rotations per year, decorative, non-blocking for launch)

---

## CONVERGENCE ACTION

**Action: WIRE + INTEGRATE**

BillboardLiveWall.tsx exists in repo; this file is primarily a data/routing specification. Implementation:

1. **Replace SESSIONS Array** with query:
   ```javascript
   const sessions = await GlobalLiveSessionRegistry.getActiveSessions()
     .then(ss => ss.filter(s => filterByWallType(s, curWall, curGenre)))
   ```

2. **Wire Viewer Count Ticker:**
   ```javascript
   // Instead of Math.random() increment:
   const actualCount = await AudienceScene.getOccupancyCount(sessionId)
   el.innerHTML = '👁 ' + actualCount.toLocaleString()
   ```

3. **Implement Real Routing:**
   ```javascript
   function joinRoom(route, access) {
     checkAccessGate(access)
       .then(() => navigate(route))
       .catch(err => showAccessDeniedModal(err))
   }
   ```

4. **Add Video Tile Previews:**
   - For LIVE sessions: embed live stream via iframe or HLS
   - For non-live: motion poster from performer's profile

5. **Wire Broadcast Mode Filtering:**
   ```javascript
   function setMode(m) {
     const filtered = sessions.filter(s => applyModeFilter(s, m))
     renderWall(curWall, filtered)
   }
   ```

6. **Implement Season Theme:**
   ```javascript
   function setSeason(s) {
     const seasonColors = {spring: {...}, summer: {...}, ...}
     document.documentElement.style.setProperty('--season-primary', seasonColors[s].primary)
     // ... and update animations
   }
   ```

7. **Wire Magazine Integration Strip:**
   - Items should route to `/magazine` with content-type filters

---

## CODE SECTIONS (Key Patterns)

### SESSIONS Array (Lines 153-166)

All 12 session objects hardcoded with metrics:

```javascript
const SESSIONS = [
  {
    id: 's1',
    name: 'Wavetek',
    genre: 'Hip-Hop',
    type: 'performer',
    event: 'Public Live',
    access: 'FREE',
    vc: 2841,            // HARDCODED viewer count
    hype: 94,            // HARDCODED engagement score
    tip: 340,            // HARDCODED tip total
    sponsored: false,
    shape: 'oct',
    color: 'info'
  },
  // ... 11 more
];
```

**Issue:** No way to add/remove sessions or update metrics without code change.

### makeTile Function (Lines 171-194)

Generates HTML for a single session tile. Key issues:
- `onclick="joinRoom(route, access)"` calls alert, not navigate
- Status badge hardcoded to "LIVE" (line 179)
- All data bound to session object, no refresh/update mechanism

### renderWall Function (Lines 208-251)

Renders wall based on selected type. Issues:
- Uses hardcoded SESSIONS or filtered subset
- Different layout logic per wall type makes updates complex
- No error handling if sessions unavailable

### Ticker Updates (Lines 301-307)

```javascript
document.querySelectorAll('.vc').forEach(el => {
  const v = parseInt(el.textContent.replace(/[^0-9]/g, '')) || 500;
  el.innerHTML = '👁 ' + (Math.max(10, v + Math.floor((Math.random() - .4) * 80))).toLocaleString();
});
```

**Issues:**
- Parses viewer count from DOM text (fragile)
- Increments by random value, not actual data
- Updates all tiles every 1 second (performance impact)

---

## AUDIT METADATA

| Field | Value |
|---|---|
| File Name | tmi_billboard_live_lobby_wall_system.html |
| File Status | MISSING_FROM_CANONICAL_FOLDER / RECOVERED_FROM_ZIP |
| Lines Analyzed | 311 (complete) |
| Specification Completeness | 90% |
| Runtime Convergence | 10-15% |
| Rule 20 Violations | 8 critical (12 sessions + 3 tickers + 1 rotation timer + 1 live count) |
| Visual Themes | 4 seasonal (Spring/Summer/Fall/Winter) |
| Fake Data Patterns | Hardcoded SESSIONS array, simulated tickers, alert-based routing |
| Safe for Launch? | NO — all data hardcoded, routing non-functional, season themes not applied |
| Wall Types | 8 (Global, Genre, Performer, Fan, Battle, Venue, Magazine, Sponsor) |
| Tile Shapes | 8 (octagon, hexagon, circle, ticket, diamond, cinema, torn, ribbon) |
| Genres Supported | 10 (Hip-Hop, R&B, Gospel, Comedy, Dance, DJ, Jazz, Rock, Poetry, Producer) |
| Runtime Dependency | GlobalLiveSessionRegistry, AudienceScene, BillboardLiveWall.tsx |
| Code Modified | NO |
| Ready for Next File | YES |

---

**Blueprint File:** 14 of 43  
**Status:** Complete visual/layout specification, blocked by data wiring and routing implementation  
**Priority:** CRITICAL (Home 1-3 core discovery surface)

---

**Recommendation:** Wire in conjunction with GlobalLiveSessionRegistry stabilization. This file is the authoritative reference for "what a live discovery wall should look like" — integrate into BillboardLiveWall.tsx production code rather than building new. Coordinate season theme implementation with design system.

**Dependency Chain:** GlobalLiveSessionRegistry → Session filtering → Real-time occupancy from AudienceScene → Video tile preview system → Routing to /live/rooms/[sessionId] → Access gate validation → Seat assignment → AudienceScene load

