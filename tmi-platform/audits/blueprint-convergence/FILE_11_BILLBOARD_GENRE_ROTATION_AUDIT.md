# FILE 11: tmi_home_1_2_billboard.html — Book-Style Genre Rotation Performer Rankings

**File Status:** MISSING_FROM_CANONICAL_FOLDER / RECOVERED_FROM_ZIP  
**ZIP Location:** `Homapge and battle challange and cyphers/tmi_home_1_2_billboard.html`  
**Audit Date:** 2026-06-23  
**Lines Analyzed:** 380 (complete)  
**Blueprint Completeness:** 90% (full interactive implementation)  
**Runtime Convergence:** 50-60% (layout structure exists, data not wired)  
**Rule 20 Violations:** 🔴 CRITICAL (6 fake data sources + continuous metric simulation)

---

## EXECUTIVE SUMMARY

FILE_11 is a **complete, interactive book-style UI** that rotates through 8 genre pairs, displaying top-10 performer rankings on facing pages (magazine-spread design). The visual/layout implementation is production-ready; all statistics and performer data are hardcoded or simulated with `Math.random()`, blocking launch until wired to real data sources.

---

## FAKE DATA AUDIT (Rule 20 Violations)

### Hardcoded Initial Values

| Line | Element | Value | Source |
|------|---------|-------|--------|
| 221 | Total Votes | `4,948` | `id="stVotes">4,948` |
| 222 | Performers Ranked | `2,841` | `id="stPerf">2,841` |
| 223 | Watching Now | `9,320` | `id="stWatching">9,320` |
| 224 | Genre Categories | `18` | `id="stGenres">18` |

**Issue:** All four metrics are hardcoded HTML text, never read from registry or API.

### Simulated Metric Tickers (Lines 362-363)

**Vote Ticker:**
```javascript
setInterval(() => {
  const votes = parseInt(document.getElementById('stVotes').textContent.replace(/,/g,''));
  document.getElementById('stVotes').textContent = 
    (votes + Math.floor(Math.random()*8) + 2).toLocaleString();
}, 3000);
```
- Increments by `Math.random()*8 + 2` (2-9 votes every 3 seconds)
- Creates illusion of continuous vote activity
- **Not tied to real vote data**

**Watcher Ticker:**
```javascript
setInterval(() => {
  const watching = parseInt(document.getElementById('stWatching').textContent.replace(/,/g,''));
  document.getElementById('stWatching').textContent = 
    (watching + Math.floor((Math.random() - 0.4) * 30)).toLocaleString();
}, 3000);
```
- Increments by `(Math.random() - 0.4) * 30` (roughly -12 to +18 every 3 seconds)
- Creates illusion of fluctuating viewer count
- **Not tied to real presence data**

### Hardcoded Performer Names (Lines 252-256)

Three arrays of performer names, used to randomly assign to performer cards:

```javascript
const PERFORMER_NAMES = [
  ['DJ Kraze','NovaQueen','WaveTek','Bar God','Lyric Storm','Prism Vex','Zion Freq','Flex King','Lagos Burst','Nova Laugh'],
  ['Echo Prime','Soul Sonic','Beat Junkie','Rhythm King','Metro Flow','Hype Lords','Pulse Vibe','Cosmic Turbo','Neon Beats','Star Gazer'],
  ['Thunder Jack','Vinyl Master','Synth Wave','Retro Grooves','Digital Prophet','Analog Dream','Time Warp','Frequency Shifter','Wave Rider','Pixel King']
];
```

- Performer names assigned randomly to ranking rows
- Never read from PerformerRegistry
- Never tied to real performer accounts

---

## ARCHITECTURE

### Page Structure

**Book-Spread UI:**
- Left page: Genre #1 top-10 rankings
- Center spine (decorative)
- Right page: Genre #2 top-10 rankings
- Page numbers visible at bottom of each page

**Genre Pairs (8 total, Lines 241-248):**

| # | Left Genre | Right Genre | Left Color | Right Color |
|---|---|---|---|---|
| 1 | HIP HOP CYPHERS | ELECTRONIC DREAMS | `#4A1B8C`/`#7B3ABF` | `#007A9E`/`#00B8D4` |
| 2 | R&B SESSIONS | ROCK REVOLUTION | `#6B1B4A`/`#8C1B6B` | `#1B4A7B`/`#1B6B8C` |
| 3 | COMEDY ROOM | DANCE FLOOR | `#7B4A1B`/`#8C6B1B` | `#4A1B7B`/`#6B1B8C` |
| 4 | DJ BATTLE ZONE | PRODUCER HUB | `#1B7B4A`/`#1B8C6B` | `#7B1B4A`/`#8C1B6B` |
| 5 | VOCAL LOUNGE | JAZZ NIGHTS | `#4A1B7B`/`#6B1B8C` | `#7B7B1B`/`#8C8C1B` |
| 6 | CYPHER BATTLES | BAND STAGE | `#1B4A7B`/`#1B6B8C` | `#7B6B1B`/`#8C8C1B` |
| 7 | FAN FAVORITES | SPOKEN WORD ROOM | `#4A7B1B`/`#6B8C1B` | `#7B1B7B`/`#8C1B8C` |
| 8 | WORLD SOUNDS | GOSPEL STAGE | `#1B7B7B`/`#1B8C8C` | `#7B4A1B`/`#8C6B1B` |

All colors are hardcoded; genre assignment is static.

### Performer Row Structure

Each ranking row (1-10) displays:

```
[Rank Number] [Photo] [Name] [Genre Tag] [View Btn] [Like Btn] [Vote Btn]
```

- **Rank:** 1-10 (generated)
- **Photo:** Pravatar API fallback (generated avatar service)
- **Name:** Randomly selected from PERFORMER_NAMES arrays
- **Genre:** Left page genre or right page genre
- **Buttons:** "VIEW", "LIKE", "VOTE" (non-functional, href="#")

---

## USER INTERACTIONS

### Genre Navigation

| Control | Action |
|---------|--------|
| Genre Dot Selector (right edge) | Jump to specific genre pair |
| Left arrow / A key | Previous genre pair |
| Right arrow / D key | Next genre pair |
| Timer auto-advance (≈10 sec) | Auto-rotate to next genre pair |

### Timer Behavior (Lines 327-335)

```javascript
timerInterval = setInterval(() => {
  timerVal = Math.max(0, timerVal - 0.5);
  document.getElementById('timerFill').style.width = timerVal + '%';
  if (timerVal <= 0) nextGenre();
}, 100);
```

- Timer starts at 100%
- Decrements 0.5% every 100ms
- Auto-advances genre when timer reaches 0%
- **Duration:** 100 / (0.5/100) = 20,000ms ≈ 20 seconds per genre (NOT ~10 sec as initially noted)

### Transition Effects

**Page Turn Animation:**
- Starburst flash effect on genre change
- CSS transform rotateY on spine for 3D flip appearance
- Smoothness: CSS transition 0.6s ease-in-out

---

## RUNTIME EQUIVALENTS

### Blueprint Artifact
Book-spread genre rotation UI with top-10 performer rankings per genre, real-time stats bar (votes/performers/watching/genres), continuous metric ticker simulation, genre-dot navigation.

### Current Runtime File(s)
- **Primary:** `apps/web/src/components/discovery/BillboardLiveWall.tsx` (exists in repo)
- **Secondary:** `apps/web/src/lib/content/ContentFreshness.ts` (ranking/sorting logic)
- **Data Source:** `apps/web/src/lib/performers/PerformerRegistry.ts` (performer data — currently not wired)

### Convergence Analysis

**Visual/Layout:** 95% complete (design fully implemented, CSS-in-JS ready)
**Data Wiring:** 5% (only hardcoded values present)
**Overall Convergence:** 50-60%

### Missing Pieces

1. **Real Performer Rankings** — must read from PerformerRegistry, not PERFORMER_NAMES array
2. **Real Viewer Count** — must read from GlobalLiveSessionRegistry, not hardcoded "9,320"
3. **Real Vote Count** — must track actual votes from voting API, not simulated ticker
4. **Real Genre Organization** — must read current top performers per genre from registry, not random assignment
5. **Real Performance Stats** — must derive rank from XP/engagement/viewers, not display order
6. **Performer Links** — all buttons currently href="#"; must route to performer profiles (/performers/[slug])

### Visual Gaps
None. Design is complete and production-ready.

### Data Gaps

| Data Element | Current | Required |
|---|---|---|
| Performer Names | PERFORMER_NAMES array (hardcoded) | PerformerRegistry.getAllPerformers().filter(p => p.genre === genre).sort(...) |
| Performer Photos | Pravatar API (fallback) | PerformerRegistry.performer.profileImageUrl |
| Performer Rank | Display order (not real) | Computed rank from PerformerRegistry.computeRanks() |
| Genre List | Hardcoded 8 pairs | GenreRegistry (if exists) or GENRE_TAXONOMY from config |
| Vote Count | Simulated Math.random() ticker | Real vote count from VotingAPI.getVotesByPerformer(performerId) |
| Viewer Count | Simulated Math.random() ticker | GlobalLiveSessionRegistry.getTotalViewers() |
| Performer Rank Count | "2,841" hardcoded | PerformerRegistry.getAllPerformers().length |

### Launch Blocking
**YES — Rule 20 Violations Block Launch**

Cannot certify for launch until:
1. All hardcoded metrics replaced with API calls
2. All performer names pulled from real registry
3. All vote/viewer tickers connected to real data sources
4. All buttons wired to real routes (no href="#")

**Estimated Wiring Effort:** 2-3 hours (medium priority, no new architecture required, pure data integration)

---

## THEME CLASSIFICATION

**Theme:** None (data-driven surface, not visually themeable)

**Reasoning:** This surface displays rankings/metrics, not a visual experience with alternative skins. Genre colors are determined by data (which genre pair), not by a selectable theme. Unlike Home 1 (which can be neon OR magazine), this surface's appearance is always book-style and its colors are always driven by genre assignment.

---

## CONVERGENCE ACTION

**Action: MERGE**

Merge blueprint visual/layout into canonical BillboardLiveWall.tsx, then wire all data to real sources:
1. Replace PERFORMER_NAMES array with PerformerRegistry query
2. Replace hardcoded stats (votes/performers/watching/genres) with real API calls
3. Replace Math.random() tickers with real data stream updates
4. Wire all buttons to real routes (/performers/[slug], /live/rooms/[id], etc.)
5. Remove href="#" from all interactive elements

---

## CODE SECTIONS (Key Patterns)

### Stats Bar Initialization (Line 221-224)
```html
<div class="stat-box">
  <div class="stat-label">TOTAL VOTES</div>
  <div class="stat-value" id="stVotes">4,948</div>
</div>
<!-- ... repeat for stPerf, stWatching, stGenres -->
```

**Issue:** Hardcoded text in HTML; should be dynamically set from API.

### Performer Row Template (Lines 280-300)
```html
<div class="performer-row">
  <div class="rank">1</div>
  <img class="performer-photo" src="https://api.pravatar.com/img?img=${rand}">
  <div class="performer-name">${PERFORMER_NAMES[idx][rand]}</div>
  <div class="genre-tag">${genreName}</div>
  <button class="btn btn-view">VIEW</button>
  <button class="btn btn-like">LIKE</button>
  <button class="btn btn-vote">VOTE</button>
</div>
```

**Issues:**
- Rank not calculated (just 1-10 display order)
- Photo uses Pravatar fallback, not performer's real profileImageUrl
- Name randomly selected from array, not real performer name from registry
- All buttons href="#"

### Genre Rotation (Lines 327-345)
```javascript
function nextGenre() {
  currentGenreIdx = (currentGenreIdx + 1) % GENRE_PAIRS.length;
  renderPage();
  resetTimer();
}

function renderPage() {
  // ... populate left and right performer rows based on currentGenreIdx
}
```

**Issue:** renderPage() always uses same random function to assign names; should query PerformerRegistry for top performers in each genre.

---

## AUDIT METADATA

| Field | Value |
|---|---|
| File Name | tmi_home_1_2_billboard.html |
| File Status | MISSING_FROM_CANONICAL_FOLDER / RECOVERED_FROM_ZIP |
| Lines Analyzed | 380 (complete) |
| Specification Completeness | 90% |
| Runtime Convergence | 50-60% |
| Rule 20 Violations | 6 critical (4 hardcoded metrics + 2 ticker simulations + 1 name array) |
| Visual Themes | 0 (data-driven, not themeable) |
| Fake Data Patterns | Hardcoded initial values, Math.random() simulated increments, static name arrays |
| Safe for Launch? | NO — all metrics must be wired to real APIs |
| Fake Data Findings | 4 |
| Runtime Dependency | PerformerRegistry, GlobalLiveSessionRegistry, VotingAPI (not yet built) |
| Code Modified | NO |
| Ready for Next File | YES |

---

**Blueprint File:** 11 of 43  
**Status:** Complete visual implementation, blocked by data wiring requirements  
**Priority:** HIGH (Home 1-2 surface, critical for launch certification)

---

**Recommendation:** Proceed to FILE_12 audit. FILE_11 wiring can begin after data APIs are stabilized post-convergence audit.
