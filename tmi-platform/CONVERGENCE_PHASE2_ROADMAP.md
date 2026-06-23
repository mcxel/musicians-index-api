# Phase 2: Add Critical Missing Elements — Implementation Roadmap
## Convergence Plan Execution — Priority Order
### Status: PHASE 1 COMPLETE (2026-06-23 commit 31306541)

---

## Phase 1 Completion Summary

**Contamination Removal — DONE**

- ✅ **Home 2 (Magazine)**: Removed `Home2LiveLobbyStrip` + `BillboardLiveWall`
  - Reason: Live content belongs on Home 3, not Magazine discovery page
  - Commits: 31306541
  
- ✅ **Home 3 (Live World)**: Removed `Home3GameShowAudienceWall`
  - Reason: Game shows belong on separate `/games` route per Rule 21
  - Component was misplaced in discovery section
  - Commits: 31306541

- ✅ **Home 5 (Arena)**: No game show component found to remove
  - Status: Already clean

---

## Phase 2: Add Critical Missing Elements (This Sprint)

### HOME 2 — MAGAZINE (Priority 1)

**What's Missing:**
- Editorial news ticker: "LAST HOUR:" scrolling headlines (4 scrolling news items)
- Clearer visual separation of three belts (Editorial/Discovery/Marketplace)
- Marketplace belt needs distinct sections (Store/Booking/Achievements/Sponsors visible separately)

**Implementation Steps:**

1. **Editorial News Ticker** (add above Editorial Rail)
   - File: Create or wire `Home2NewsTickerRail.tsx`
   - Spec: 4 scrolling headlines, "LAST HOUR:" label, auto-rotate every 4 seconds
   - Source: Real magazine data (not hardcoded)
   - Expected result: Users see fresh news at top of editorial section

2. **Visual Belt Separation** (update existing grids)
   - File: Modify `Home2EditorialRail.tsx`, `Home2DiscoveryRail.tsx`, `Home2MarketplaceRail.tsx`
   - Add visual dividers: background color changes, clear spacing, section headers
   - Current state: Rails exist, hierarchy is weak
   - Expected result: Clear three-section magazine layout

3. **Marketplace Belt Clarity** (update Home2MarketplaceRail)
   - Current: "Monetization rail (vague)"
   - Target: Four distinct subsections visible:
     - Store: "Featured Merch" + SHOP button
     - Booking Portal: "Venues We Work With" + BOOK TALENT button
     - My Achievements: "Current Score: 850 pts"
     - Sponsor Spotlight: "Powered By: [Logo]" + SPONSOR TMI button
   - File: `Home2MarketplaceRail.tsx` needs restructuring

**Success Criteria:**
- News ticker shows real, rotating headlines
- Three magazine belts have distinct visual hierarchy
- Marketplace belt shows 4 clear subsections
- Mobile responsive at 520px/768px viewports (already wired)

---

### HOME 3 — LIVE WORLD (Priority 2)

**What's Missing:**
- JOIN RANDOM ROOM CTA (animated, prominent, star-shaped button — pink→gold gradient)
- World Dance Party dedicated section with visible "Every Friday" branding
- Camera System interface (7 toggle buttons: Stage/Audience/DJ/Host/Venue/Sponsor/Winner)
- Belt Champions display (current holder + previous + tournament brackets)
- Three Live Stages section (3 labeled video panels A/B/C) — if not already present

**Implementation Steps:**

1. **JOIN RANDOM ROOM CTA** (add after activity belt)
   - File: Create `Home3RandomRoomCTA.tsx`
   - Design: Star-shaped button (can use CSS clip-path), pink→gold gradient, animated float (framer-motion)
   - Behavior: On click, opens LobbyEntryFlow with a random live room
   - Placement: Between Activity Belt and other sections, high prominence
   - Expected result: Prominent call-to-action converts viewers to participants

2. **World Dance Party Section** (add dedicated section)
   - File: Create `Home3DancePartySectionRail.tsx`
   - Display: "Every Friday · All Styles Welcome" with JOIN button
   - Current state: Mentioned in spec but not prominent in current layout
   - Expected result: Dedicated, time-bound event discovery

3. **Camera System Interface** (add after live stages if present)
   - File: Create `Home3CameraSystemTogglePanel.tsx`
   - 7 toggles: Stage | Audience | DJ | Host/MC | Venue | Sponsor | Winner
   - Behavior: Clicking toggles switches broadcast camera between perspectives
   - Expected result: Gives users broadcast director control (immersion element per Rule 16)

4. **Belt Champions Display** (add to a new section)
   - File: Create `Home3BeltChampionsDisplay.tsx`
   - Show: Current champion + previous 3 holders + tournament brackets
   - Source: Real champion data from rankings/competition engines
   - Expected result: Shows competitive prestige, drives viewership

5. **Three Live Stages** (verify if present, add if not)
   - File: Check `Home3LiveStages.tsx` or create if missing
   - Display: 3 labeled panels (LIVE STAGE A/B/C) with video feeds
   - Source: Real broadcasts from active stages (or placeholders if none live)
   - Expected result: Multi-concurrent stream discovery

**Success Criteria:**
- JOIN RANDOM ROOM button is high-contrast, prominent, animated
- World Dance Party section has "Every Friday" branding visible
- Camera System shows 7 toggles and switches broadcast view
- Belt Champions display shows real current/previous holders
- Three Live Stages section renders (with real or placeholder feeds)

---

### HOME 4 — MARKETPLACE (Priority 3 — Name + Structure Crisis)

**Critical Issue:**
- File is named `Home4AdMagazine.tsx` but canonical name is `Home4MarketplacePage.tsx`
- Purpose mismatch: Currently focused on advertising/magazine, should focus on commerce
- This is a **fundamental naming/scope problem** that blocks all downstream work

**Implementation Steps:**

1. **Audit Current Home4AdMagazine** (understand what exists now)
   - File: Read `apps/web/src/components/home/Home4AdMagazine.tsx`
   - Questions to answer:
     - What components/sections are rendered?
     - Does it show products/beats/tickets for sale?
     - Does it show sponsor/ad offerings?
     - Is there any commerce/marketplace UI?
   - Expected: Document current state for decision below

2. **Naming Decision** (get clarity on intent)
   - Option A: Rename current file → `Home4MarketplacePage.tsx` and restructure around commerce
   - Option B: Keep `Home4AdMagazine` as-is, move sponsor/ad depth to Home 5
   - **Recommendation per COMPONENT_CONVERGENCE_MATRIX**: Option A (Marketplace-focused, simpler "one question per page" principle)
   - Decision gate: User/Marcel approval required before proceeding

3. **Marketplace Architecture** (if Option A chosen)
   - Implement canonical Marketplace structure:
     - Sponsor Spotlight (tabbed interface [1][2][3][4])
     - Premium Billboard (large product + brand takeover)
     - Ad Marketplace (Campaign Builder + Audience/Genre Targeting)
     - Inventory & Placements (10-type index with checkboxes)
     - Analytics Dashboard (7 metric tiles)
     - Deals & Contracts Payment Dashboard
     - Marketplace Lobby Wall (3 video tiles: recent/beats/tickets)

**Success Criteria:**
- File is named `Home4MarketplacePage.tsx` and serves that purpose
- Commerce intent is clear (products, beats, tickets for purchase)
- Sponsor/ad offerings are structured, not vague
- All sections map to canonical spec

---

## Phase 2 Priority Sequencing

**Recommend this order:**

1. **Home 2** — Editorial ticker + belt clarity (1-2 components, mostly restructuring)
2. **Home 3** — Random room CTA + Dance Party (high-visibility, drives engagement)
3. **Home 4** — Audit + rename + decision (blocking issue, needs Marcel approval)

---

## Success Metrics for Phase 2

When Phase 2 is complete, every Home page should:

- **Visual Integrity**: Three/four distinct sections, clear hierarchy, mobile responsive
- **Content Freshness**: Real data (not hardcoded samples), live feeds where applicable
- **User Engagement**: Clear CTAs (JOIN RANDOM, SHOP, BOOK, etc.), all functional
- **Rule Compliance**: Rule 11 (Freshness), Rule 14 (No Empty Surface), Rule 20 (Launch Cert)

---

## Next Steps

1. **Await typecheck result** (background task from Phase 1 commit)
2. **Begin Home 2 Editor Ticker** (lowest-risk Phase 2 start)
3. **Request Marcel approval on Home 4 naming decision**
4. **Execute Home 3 CTA + Dance Party additions**

Estimated sprint duration: **2-3 sessions**, assuming component files exist and mostly need wiring.

---

*Phase 2 Roadmap locked 2026-06-23 by Claude Assembly Director*
*Execution authority: Marcel Dickens*
