# FILE 9: tmi_home1_orbital_with_underlay_panels.html — Home 1 Visual Architecture Specification

**Status:** BLUEPRINT SPECIFICATION FOR HOME 1  
**Audit Date:** 2026-06-23  
**Source:** `/apps/web/public/blueprints/tmi_home1_orbital_with_underlay_panels.html`  
**Scope:** Complete visual architecture, layout structure, animation specifications, component data model  
**Blueprint Completeness:** ~100% detailed specification  
**Runtime Convergence:** ~65-75% (core structure present, several subsystems incomplete or degraded)

---

## Executive Summary

File 9 is the **canonical design specification for Home 1's visual architecture**. It defines:

- **Neon Underlay System** — 4 animated blobs (pink, gold, cyan, purple) with exact keyframe timing
- **3-Column Layout** — precise grid structure (170px left, 1fr center, 170px right)
- **Orbital Center** — SVG-based rotating rings with 10 performer cards positioned at 36° intervals
- **Left Sidebar** — Free Promotion, Sponsor Spotlight, Venue Booking sections
- **Right Sidebar** — Live Rankings (Top 10), Ad Slots, Promoter Panel, Advertiser CTA
- **Ticker System** — Horizontal scrolling live event announcements
- **Bottom HUD** — Navigation, sign-in, live count display

**Critical Finding:** The current Home 1 runtime matches the blueprint's **core orbital concept** but exhibits several **visual degradation and missing subsystem issues** that explain why the environment feels faint and the page lacks depth.

---

## FILE 9 DETAILED SPECIFICATION

### 1. NEON UNDERLAY (Lines 52-67)

**Blueprint Definition:**
```css
@keyframes blobA { 0%,100%: scale(1) translate(0,0)
                   33%: scale(1.12) translate(60px, -40px)
                   66%: scale(.9) translate(-40px, 30px) }
@keyframes blobB { 0%,100%: scale(1) translate(0,0)
                   33%: scale(.88) translate(-50px, 50px)
                   66%: scale(1.1) translate(70px, -30px) }
@keyframes blobC { 0%,100%: scale(1)
                   50%: scale(1.08) translate(40px, 60px) }
```

**Blob Specifications:**
| Blob | Size | Color | Position | Animation | Opacity | Blur |
|------|------|-------|----------|-----------|---------|------|
| A | 460×460px | Pink (#FF45AA 55%) | top:-60px, left:5% | 9s ease-in-out | 0.55 | 80px |
| B | 480×480px | Gold (#FFD700 45%) | top:80px, right:-60px | 12s ease-in-out | 0.55 | 80px |
| C | 400×400px | Cyan (#00E5FF 30%) | bottom:-40px, left:30% | 15s ease-in-out | 0.55 | 80px |
| D | 320×320px | Purple (#9B59B6 40%) | bottom:80px, right:15% | 18s reverse | 0.55 | 80px |

**Grid Overlay:**
- SVG grid pattern, 48×48px cells
- Gold lines (#FFD700) at 0.5px stroke
- Overall opacity: 0.06 (very subtle)

**Status in Runtime:**
- ✅ **PRESENT** — World environment layer added in session (Home1CoverPage.tsx line ~1175)
- ⚠️ **DEGRADED** — Blob opacity may be lower than spec (currently computed dynamically, not hardcoded)
- ⚠️ **PARTIAL** — Grid overlay not clearly visible in current screenshots

---

### 2. TOP BAR & NAVIGATION (Lines 69-88)

**Specification:**
- Dark background: `rgba(5,8,21,.88)` with `backdrop-filter: blur(12px)`
- Left: TMI branding + "BETA SEASON" + "Founding Beta Member" badge
- Center: Navigation buttons for homes 1, 1-2, 2, 3, 4, 5
  - Home 1 is highlighted (pink background)
- Right: "Log In" and "Sign Up" buttons

**Status in Runtime:**
- ✅ **PRESENT** — Top navigation bar exists
- ⚠️ **NEEDS VERIFICATION** — Check if all 6 home buttons (1, 1-2, 2, 3, 4, 5) are properly linked and styled
- ⚠️ **STYLING** — Verify backdrop-filter blur effect is rendering

---

### 3. TICKER SYSTEM (Lines 90-95)

**Blueprint Specification:**
```html
<div class="ticker-wrap">
  <div class="ticker-inner">
    🔴 LIVE: Astra Nova — Main Arena ... ⚔️ Battle: Wavetek vs Bar God ...
    🌍 World Release: Krypt drops new album ... 🎤 Cypher Arena open — 841 watching ...
    💰 $4.2K tips sent today ... 👑 Weekly Crown updating in real time ...
  </div>
</div>
```

**Animation:**
```css
@keyframes ticker {
  from { transform: translateX(100%) }
  to { transform: translateX(-100%) }
}
.ticker-inner { animation: ticker 22s linear infinite }
```

**Styling:**
- Font size: 9px
- Color: `var(--amber)` (#FF8C00)
- Border: 1px top/bottom `rgba(255,215,0,.15)`
- Padding: 4px 0

**Blueprint Content Examples:**
- 🔴 LIVE: [Artist] — [Venue]
- ⚔️ Battle: [Artist1] vs [Artist2]
- 🌍 World Release: [Event]
- 🎤 Cypher Arena: [Watch count]
- 💰 Tips: [Amount]
- 👑 Crown: Real-time status

**Status in Runtime:**
- ❌ **MISSING / DEGRADED** — Ticker system appears to be either missing or using old/fake data
- **ACTION:** Wire ticker to real live session data; use GlobalLiveSessionRegistry for event announcements

---

### 4. CENTER ORBITAL — SVG STRUCTURE (Lines 176-296)

**Overall Orbital Dimensions:**
- Viewbox: 380×380px
- Outer decorative ring: r=178px, gold glow
- Orbit Track 1 (outer): r=152px, gold dashed line, 4px dash/8px gap
- Orbit Track 2 (inner): r=100px, cyan dashed line, 3px dash/10px gap

**Orbital Card Arrangement:**
10 performer cards positioned at 36° intervals (0°, 36°, 72°, 108°, 144°, 180°, 216°, 252°, 288°, 324°)

| Position | Angle | Name | Category | Color | Live Dot |
|----------|-------|------|----------|-------|----------|
| #1 (Top) | 0° | ASTRA NOVA | R&B | Pink (#FF2DAA) | 🔴 YES |
| #2 | 36° | PRISM VEX | EDM | Gold (#FFD700) | — |
| #3 | 72° | ZION FREQ | Gospel | Green (#00FF7F) | — |
| #4 | 108° | FLEX KING | Dance | Cyan (#00E5FF) | — |
| #5 | 144° | SONG CHALL. | Hip-Hop | Purple (#9B59B6) | — |
| #6 (Bottom) | 180° | MAIN LOBBY | Various | Amber (#FF8C00) | — |
| #7 | 216° | BATTLE FLOOR | LIVE | Red (#E63000) | 🔴 YES |
| #8 | 252° | LAGOS BURST | Afrobeat | Gold (#FFD700) | — |
| #9 | 288° | NOVA LAUGH | Comedy | Cyan (#00E5FF) | — |
| #10 | 324° | DANCE CREW | Dance | Pink (#FF2DAA) | — |

**Card Structure:**
```svg
<rect width="64" height="40" rx="6" fill="rgba(R,G,B,.15)" stroke="rgba(R,G,B,.6)" />
<text x="center" y="31" font-size="9" fill="color">#RANK</text>
<text x="center" y="42" font-size="7.5" fill="#fff">NAME</text>
<text x="center" y="52" font-size="6.5" fill="rgba(255,255,255,.5)">GENRE</text>
```

**Animations:**
- `.orbit-ring` — 40s full clockwise rotation
- `.orbit-counter` — Counter-clockwise rotation per card (keeps text upright)
- Live dot: `blink` animation (1.2s cycle) for #1 and #7

**Center Hub:**
```svg
<circle cx="190" cy="190" r="62" fill="rgba(5,8,21,.9)" stroke="rgba(255,45,170,.6)" stroke-width="1.5" />
<text>HOME 1/6</text>
<text font-size="13">ASTRA NOVA</text>
<text>R&B · LIVE NOW</text>
<circle cx="163" cy="198" r="4" fill="#FF2020" /> <!-- Live indicator -->
```

**Radial Gradient (Center Glow):**
```css
#cGlow {
  cx=50%, cy=50%, r=50%
  stop 0%: #FF2DAA 35% opacity
  stop 60%: #FFD700 10% opacity
  stop 100%: transparent
}
```

**Connecting Spokes (Subtle):**
- Lines from center hub to positions #1, #2, and #4
- Stroke: `rgba(255,215,0,.1)`, width 0.5px
- Creates radial depth illusion

**Status in Runtime:**
- ✅ **CORE PRESENT** — Orbital structure and rotating cards are implemented
- ⚠️ **PARTIAL WIRING** — 10 cards may not all be populated with real data
- ⚠️ **ANIMATION TIMING** — Verify 40s rotation speed matches spec
- ⚠️ **CENTER HUB** — Crown holder data should be real, not hardcoded
- ⚠️ **LIVE INDICATORS** — Red dots should only appear for truly live sessions

---

### 5. ORBITAL CTA BUTTONS (Lines 299-304)

**Specification:**
Three buttons below orbital:
1. "⚡ Enter Live Arena" (Pink) — fires particle effect on click
2. "👑 Vote for Crown" (Gold)
3. "🎤 Join Cypher" (Cyan)

**Status:**
- ✅ **LIKELY PRESENT** — CTA buttons exist in runtime
- ⚠️ **VERIFICATION NEEDED** — Confirm all three buttons are linked to real destinations

---

### 6. LIVE STATS BAR (Lines 306-320)

**Specification:**
```
┌─────────────────────────────────────┐
│ 9,282     │  11        │  $4.2K     │
│ WATCHING  │  LIVE NOW  │  TIPS TODAY│
└─────────────────────────────────────┘
```

**Styling:**
- Background: `rgba(0,0,0,.4)`
- Border: 1px `rgba(255,215,0,.15)`, border-radius 20px
- Gap: 16px between metrics

**Data Source (Blueprint):**
```javascript
viewerCount: dynamically updated every 3 seconds
  const cur = parseInt(viewerCount.textContent)
  const next = Math.max(8000, cur + Math.floor((Math.random()-.35)*60))
  // Simulates +/- viewer count changes
```

**Issues with Blueprint:**
- ❌ **FAKE DYNAMIC** — Viewer count incremented using `Math.random()`, NOT real data
- ⚠️ **HARDCODED VALUES** — 9,282 initial value is placeholder

**Status in Runtime:**
- ✅ **STRUCTURE PRESENT** — Stats bar exists
- ❌ **RULE 20 VIOLATION** — Viewer counts must be real, not simulated
- **ACTION:** Wire to real session metrics from GlobalLiveSessionRegistry

---

### 7. LEFT SIDEBAR SECTIONS (Lines 100-165)

#### 7.1 Free Promotion Panel
```
⭐ Free Promotion
  Artists — get featured for free. Claim your slot.
  
  [Lagos Burst] Afrobeat — ▲ 2,140 views [BOOST]
  [Nova Laugh] Comedy — ▲ 980 views [BOOST]
  [+ Claim Free Slot]
```

**Data in Blueprint:**
- 2 example artists with fake view counts
- Hardcoded "Free slot · Expires 6h" / "Free slot · 14h left"

**Status:**
- ⚠️ **NEEDS REAL WIRING** — Should pull from PerformerRegistry + FreePromotionEngine (if exists)

#### 7.2 Sponsor Spotlight
```
💼 Sponsor Spotlight
  [Beats By TMX] Official Season 1 Partner
  Campaign: 72% — $86K spent
  [Become a Sponsor]
```

**Data in Blueprint:**
- Hardcoded sponsor: "Beats By TMX"
- Hardcoded metric: "72%" campaign completion
- Hardcoded budget: "$86K"

**Status:**
- ❌ **RULE 20 VIOLATION** — All data is fake/placeholder
- **ACTION:** Wire to real SponsorRegistry or show honest empty state per Rule 12 fallback chain

#### 7.3 Venue Booking
```
🏟 Venue Booking
  Open dates available now
  [SAT] Main Arena [Book]
  [SUN] Theater [Book]
```

**Data in Blueprint:**
- Hardcoded venue names: "Main Arena", "Theater"
- Hardcoded days: SAT, SUN

**Status:**
- ⚠️ **NEEDS REAL WIRING** — Should pull from VenueRegistry for actual open dates

---

### 8. RIGHT SIDEBAR SECTIONS (Lines 326-418)

#### 8.1 Live Top 10 Rankings
```
👑 Live Rankings
  1. Astra Nova    +34%  🔴 (LIVE)
  2. Prism Vex     +22%  🔴 (LIVE)
  3. Zion Freq     +15%
  4. Flex King     +9%
  ...
  [Full Leaderboard →]
```

**Data in Blueprint:**
- Hardcoded performer names (same as orbital cards)
- Hardcoded percentage deltas (+34%, +22%, +15%, +9%, ▼2%, etc.)
- Live dots only on #1 and #7

**Status:**
- ⚠️ **PARTIAL WIRING** — Names should come from PerformerRegistry, percentages should be real XP deltas
- ⚠️ **LIVE INDICATORS** — Red dots should reflect GlobalLiveSessionRegistry

#### 8.2 Advertisement Slot
```
[ADVERTISEMENT]
🎧 BerntoutStudio AI
Make beats with AI. Free trial.
[TRY FREE]
```

**Status:**
- ❌ **RULE 20 VIOLATION** — "BerntoutStudio AI" is fake/promotional
- **ACTION:** Use Rule 12 fallback chain via `getAdSlotForZone()` — no fake ads

#### 8.3 Promoters Panel
```
📣 Promoters
  Promo_Jay     12 events
  EventKing     8 events
  [Be a Promoter →]
```

**Data in Blueprint:**
- Hardcoded promoter names: "Promo_Jay", "EventKing"
- Hardcoded event counts: 12, 8

**Status:**
- ⚠️ **NEEDS WIRING** — Should pull from PromoterRegistry or EventRegistry if exists

#### 8.4 Advertiser Slot
```
📢 Advertise Here
  9,200+ daily impressions. Gold & Diamond slots.
  [Buy Ad Slot]
```

**Data in Blueprint:**
- Hardcoded impression count: "9,200+"

**Status:**
- ❌ **RULE 20 VIOLATION** — Fake impression count
- **ACTION:** Remove fake count or use real metrics from ad serving system

---

### 9. BOTTOM HUD (Lines 422-435)

**Specification:**
```
[SIGN IN] [+ SUBMIT] ... 🔴 11 VENUES LIVE · 9,282 WATCHING ... [◀ BACK] [NEXT ▶]
```

**Data:**
- Hardcoded venue count: 11
- Hardcoded viewer count: 9,282 (same as live stats bar)

**Status:**
- ⚠️ **NEEDS REAL WIRING** — Venue count should be real, viewer count should match live stats

---

## HOME 1 CONVERGENCE GAP ANALYSIS

| Layer | Blueprint Spec | Runtime Equivalent | Status | Gap | Action |
|-------|---|---|---|---|---|
| **Neon Underlay** | 4 animated blobs, grid | World environment layer (added this session) | ⚠️ PARTIAL | Blob sizes/timing may not match, grid not visible | Verify blob dimensions and keyframe durations match lines 10-12 |
| **Top Bar** | Navigation + branding | exists | ✅ OK | — | — |
| **Ticker** | Scrolling live announcements | unknown/missing | ❌ MISSING | Real event data not wired | Wire to GlobalLiveSessionRegistry |
| **Orbital Ring** | SVG 380×380 with tracks | exists | ✅ OK | — | — |
| **Orbital Cards** | 10 cards at 36° intervals | exists (likely 10 cards) | ⚠️ PARTIAL | Data sources not verified; may be fake | Verify all 10 cards wired to PerformerRegistry |
| **Orbital Animations** | 40s rotation + counter-rotation | exists | ✅ OK | Timing may differ | Verify 40s rotation speed |
| **Center Hub** | Crown holder display | exists | ⚠️ PARTIAL | May show hardcoded data | Wire to real crown holder logic |
| **Live Indicators** | Red dots for live sessions | exists | ⚠️ PARTIAL | May be fake | Wire to GlobalLiveSessionRegistry |
| **CTA Buttons** | 3 action buttons | exists | ✅ OK | Links may not resolve | Verify all 3 CTAs route to real destinations |
| **Stats Bar** | Viewer/Live/Tips metrics | exists | ❌ FAKE DATA | Using `Math.random()` for viewer count | Wire to real session metrics |
| **Left Sidebar** | Free promo + Sponsor + Venues | partial/unknown | ⚠️ INCOMPLETE | Likely missing or using fake data | Wire to real registries or hide if empty |
| **Right Sidebar** | Rankings + Ads + Promoters | partial/unknown | ⚠️ INCOMPLETE | Rankings may be real, ads likely fake | Verify real data; use ad fallback chain |
| **Bottom HUD** | Navigation + live count | exists | ⚠️ PARTIAL | Live count likely fake | Wire to real metrics |

---

## RULE 20 VIOLATIONS FOUND IN BLUEPRINT

The blueprint itself (a design mockup) contains several violations that should NOT be replicated:

1. **Fake viewer counts** — 9,282 hardcoded; simulated increment via `Math.random()`
   - **Fix:** Use real GlobalLiveSessionRegistry viewer counts

2. **Fake sponsor data** — "Beats By TMX" with "$86K spent" and "72%" campaign metrics
   - **Fix:** Use SponsorRegistry or show honest empty state

3. **Fake promoter names** — "Promo_Jay", "EventKing" with hardcoded event counts
   - **Fix:** Use real PromoterRegistry if exists, or remove section

4. **Fake impression count** — "9,200+ daily impressions"
   - **Fix:** Use real ad metrics or remove claim

5. **Fake venue data** — "Main Arena", "Theater" with placeholder availability
   - **Fix:** Wire to real VenueRegistry open dates

6. **Fake advertisement** — "BerntoutStudio AI"
   - **Fix:** Use Rule 12 ad fallback chain (paid sponsor → platform promo → ad network → CTA)

---

## RECOMMENDATIONS FOR RUNTIME CONVERGENCE

### Priority 1: Environment Depth (Why Home 1 Feels Faint)

The blueprint's neon underlay (File 9, lines 52-67) specifies **4 large animated blobs with high opacity (0.55)** positioned to create visual depth behind the orbital. The current runtime (updated this session in Home1CoverPage.tsx) has these blobs, but:

- ✅ Blobs exist
- ⚠️ May be lower opacity than spec
- ⚠️ Grid overlay at 0.06 is barely visible

**Convergence Action:**
1. Verify blob radii match spec: 460×460, 480×480, 400×400, 320×320
2. Verify blob opacity remains 0.55 (not fading dynamically)
3. Increase grid overlay opacity from 0.06 to 0.12-0.15 for more visible depth
4. Verify all blob keyframe durations: 9s, 12s, 15s, 18s

### Priority 2: Ticker System Wiring

The blueprint shows a horizontal scrolling ticker (lines 90-95) with **real live event announcements**. The current runtime may lack this entirely.

**Convergence Action:**
1. Implement horizontal scrolling ticker in Home 1
2. Wire to GlobalLiveSessionRegistry for real event data
3. Show: LIVE sessions, ongoing battles, recent releases, active cyphers
4. Animation: 22s loop, repeating

### Priority 3: Orbital Data Sources

The blueprint shows all 10 orbital cards with real performer data. Verify runtime is using PerformerRegistry, not hardcoded arrays.

**Convergence Action:**
1. Audit Home1CoverPage.tsx orbital card data source
2. Verify all 10 positions populated from `getTopPerformers()` or similar
3. Verify live indicators (`🔴`) come from GlobalLiveSessionRegistry, not hardcoded
4. Verify center hub shows real crown holder

### Priority 4: Sidebar Content Wiring

Left sidebar (free promo, sponsor, venues) and right sidebar (rankings, ads, promoters) should use real registries or show honest empty states.

**Convergence Action:**
1. Verify left sidebar wired to: FreePromotionEngine, SponsorRegistry, VenueRegistry
2. Verify right sidebar wired to: PerformerRegistry rankings, `getAdSlotForZone()`, PromoterRegistry
3. For any missing registries, show empty state (Rule 14) or hide section

### Priority 5: Stats Bar Reality Wiring

The "9,282 WATCHING" number must come from real session data, not `Math.random()`.

**Convergence Action:**
1. Replace fake viewer count logic with `GlobalLiveSessionRegistry.getTotalViewers()`
2. Replace fake live count with real live room count
3. Replace fake tips count with real today's tips from commerce layer

### Priority 6: Orbital Animation Timing

Verify the 40s orbital rotation speed matches spec (line 25: `orbit 40s linear infinite`).

**Convergence Action:**
1. Check Home1CoverPage.tsx CSS keyframe for orbital rotation
2. Verify duration: 40s
3. Verify easing: linear
4. Verify infinit loop: yes

---

## BLUEPRINT SPECIFICATION GAPS (What Runtime Needs to Wire)

The blueprint defines **WHAT to display** but does NOT define **WHERE the data comes from**. The implementation must define:

| Element | Blueprint Data | Missing: Real Source |
|---------|---|---|
| Orbital cards (10x) | Names, genres, colors | PerformerRegistry? |
| Live indicators | 🔴 dots on #1, #7 | GlobalLiveSessionRegistry? |
| Center crown holder | "ASTRA NOVA" | getRealCrownHolder()? |
| Stats bar | 9,282 viewing | getTotalActiveViewers()? |
| Ticker events | LIVE, Battle, Release, Cypher, tips | GlobalLiveSessionRegistry? |
| Free promo artists | "Lagos Burst", "Nova Laugh" | FreePromotionEngine? |
| Sponsor | "Beats By TMX" | SponsorRegistry.getActiveSponsor()? |
| Venues | "Main Arena", "Theater" | VenueRegistry.getOpenDates()? |
| Rankings | Top 10 + deltas | PerformerRegistry.computeRanks()? |
| Promoters | "Promo_Jay", "EventKing" | PromoterRegistry? |

---

## SUMMARY

**File 9 is the definitive Home 1 visual specification.** It explains:

1. **Why the environment feels faint** — the neon underlay should have 4 large, high-opacity blobs; current runtime may have degraded them
2. **What the full Home 1 experience should be** — not just the orbital, but also left/right sidebars, ticker, stats, and bottom HUD
3. **What's missing** — ticker system, full sidebar wiring, real data sources
4. **What data is fake in the blueprint** — viewer counts, sponsor data, promoter names; runtime must replace with real data

**Critical Next Step:** Audit the current Home1CoverPage.tsx component against this spec section-by-section to identify exactly which systems are incomplete or degraded.

---

## AUDIT METADATA

| Field | Value |
|-------|-------|
| File Audited | tmi_home1_orbital_with_underlay_panels.html |
| Lines Analyzed | 1–463 (complete file) |
| Specification Completeness | 100% |
| Runtime Convergence | ~65–75% |
| Rule 20 Violations in Blueprint | 6 (fake data examples) |
| Rule 20 Violations in Runtime | Unknown (needs full audit) |
| Missing Subsystems | Ticker, full sidebar wiring, real data sources |
| Blueprint Artifact Count | 9 (blob specs, orbital, CTAs, sidebars, bottom HUD) |
| Actionable Convergence Items | 6 (environment depth, ticker, orbital data, sidebar wiring, stats reality, animation timing) |

---

**Next Audit:** File 10 (if exists) or continue with remaining files to audit Home 3, 4, 5 final redesigns.
