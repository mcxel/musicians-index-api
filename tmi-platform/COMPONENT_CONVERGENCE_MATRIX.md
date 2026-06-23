# COMPONENT ARCHITECTURE CONVERGENCE MATRIX
## Current Runtime ↔ Canonical Blueprint
### Status: ROOT CAUSE ANALYSIS

---

## ARCHITECTURAL MISMATCH (Why Redesigns Don't Appear)

### The Canonical Spec Names These Components:
```
Home2MagazinePage.tsx        ← Spec expects this
Home3LiveWorldPage.tsx       ← Spec expects this
Home4MarketplacePage.tsx     ← Spec expects this
Home5CommandCenterPage.tsx   ← Spec expects this
```

### Current Runtime Uses Different Names:
```
Home2NewsDeskSurface.tsx     ← Currently deployed
Home3LiveWorldSurface.tsx    ← Currently deployed
Home4AdMagazine.tsx          ← Currently deployed
Home5BattleCypherSurface.tsx ← Currently deployed
```

### Result:
The canonical designs were specified but never fully implemented as the named components. The current components are **partial implementations** that evolved independently and now **don't match the blueprint spec**.

---

## COMPONENT CONVERGENCE MATRIX

### HOME 2 — MAGAZINE

| Aspect | Canonical (`Home2MagazinePage.tsx`) | Current (`Home2NewsDeskSurface.tsx`) | Gap | Priority |
|--------|-------|---------|-----|----------|
| **Purpose** | "What should I read?" Magazine destination | News Desk surface | ✗ Incomplete | 1 |
| **Editorial Belt** | Feature + News ticker + Interviews + Recaps | Feature grid only | ✗ Missing | 2 |
| **Discovery Belt** | Genre hexagons + Charts + Playlists + Directory | Single discovery rail | ✗ Weak | 2 |
| **Marketplace Belt** | Store + Booking + Achievements + Sponsors | Monetization rail (vague) | ✗ Missing | 3 |
| **Live Content** | News Lobby Wall only (3 tiles) | Live Lobby Strip + Billboard (wrong) | ✗ REMOVE | 1 |
| **Visual Hierarchy** | 3 distinct belts | Unclear hierarchy | ✗ Rebuild | 2 |

**Convergence Plan:**
1. Keep `Home2NewsDeskSurface.tsx` as the working base (don't break current routes)
2. Remove `Home2LiveLobbyStrip` and broadcast wall (these belong on Home 3)
3. Add missing Editorial belt components (news ticker, recaps clarity)
4. Add Discovery belt hexagon cluster (use clip-path, 6-7 genre hexagons)
5. Clarify Marketplace belt (separate store, booking, achievements, sponsors sections)
6. Verify visual hierarchy with grid/spacing restoration

---

### HOME 3 — LIVE WORLD

| Aspect | Canonical (`Home3LiveWorldPage.tsx`) | Current (`Home3LiveWorldSurface.tsx`) | Gap | Priority |
|--------|-------|---------|-----|----------|
| **Purpose** | "What should I watch?" Live broadcast destination | Live World surface | ✓ Correct | — |
| **Main Preview + Wall** | 1 large + 8-tile (2×4) lobby wall | Present | ✓ OK | — |
| **12-tile Fans+Cypher Wall** | 2 rows of 6, independent timers | Unclear layout/timers | ? Verify | 2 |
| **JOIN RANDOM CTA** | Prominent star-shaped button (animated) | Not obvious | ✗ Missing | 1 |
| **World Premieres** | Countdown (HH:MM:SS:FF) + artwork + progress | Present but format unclear | ? Verify | 2 |
| **World Dance Party** | Dedicated section "Every Friday" + JOIN | Not prominent | ✗ Missing | 2 |
| **Stream & Win Radio** | Full environment (DJ booths, requests, listeners) | Present as "Global Live Belt" (unclear) | ? Verify | 3 |
| **Three Live Stages** | 3 video panels labeled A/B/C | Not obvious | ✗ Missing | 3 |
| **Camera System** | 7 toggle buttons (Stage/Audience/DJ/Host/Venue/Sponsor/Winner) | Not present | ✗ Missing | 3 |
| **Belt Champions** | Current + Previous + Brackets display | Not obvious | ✗ Missing | 3 |
| **Game Shows** | NOT IN SPEC (belongs on Home 5) | `Home3GameShowAudienceWall` present | ✗ REMOVE | 1 |

**Convergence Plan:**
1. Remove `Home3GameShowAudienceWall` (move to Home 5 or /games route)
2. Add prominent JOIN RANDOM ROOM CTA (star-shaped, pink→gold gradient, animated float)
3. Add World Dance Party dedicated section with visible "Every Friday" branding
4. Verify 12-tile walls use independent timers (staggered by 1,800–2,100ms each)
5. Verify Stream & Win Radio is properly labeled and accessible
6. Add Three Live Stages section (3 video panels A/B/C) — currently missing
7. Add Camera System interface (7 toggles: Stage/Audience/DJ/Host/Venue/Sponsor/Winner) — currently missing
8. Add Belt Champions display (current holder + previous + brackets) — currently missing

---

### HOME 4 — MARKETPLACE (CRITICAL MISMATCH)

| Aspect | Canonical (`Home4MarketplacePage.tsx`) | Current (`Home4AdMagazine.tsx`) | Gap | Priority |
|--------|-------|---------|-----|----------|
| **Purpose** | "What can I buy?" Revenue/Commerce | Advertising/Magazine focused | ✗ WRONG | 1 |
| **Component Name** | Marketplace | AdMagazine | ✗ MISNAMED | 1 |
| **Sponsor Spotlight** | Tabbed interface [1][2][3][4] | Unknown (need audit) | ? Unclear | 2 |
| **Premium Billboard** | Large product + Brand Takeover | Unknown | ? Unclear | 2 |
| **Ad Marketplace** | Campaign Builder + Audience/Genre Targeting | Unknown | ? Unclear | 2 |
| **Inventory/Placements** | 10-type index with checkboxes | Unknown | ? Unclear | 2 |
| **Analytics Dashboard** | 7 metric tiles + charts | Unknown | ? Unclear | 2 |
| **Deals & Contracts** | Brand/Sponsorship/Artist/Venue/Event panels | Unknown | ? Unclear | 2 |
| **Marketplace Lobby Wall** | 3 video tiles (recent/beats/tickets) | Unknown | ? Unclear | 2 |

**Convergence Plan:**
1. **RENAME COMPONENT**: `Home4AdMagazine.tsx` → `Home4MarketplacePage.tsx` (or create new canonical version)
2. Audit current `Home4AdMagazine` to understand what components are present
3. Add/rebuild Sponsor Spotlight with tabbed navigation
4. Add/rebuild Premium Billboard section
5. Add/rebuild Ad Marketplace (Campaign Builder + Audience/Genre Targeting)
6. Add/rebuild Inventory & Placements with 10-type index
7. Add/rebuild Analytics Dashboard (7 metric tiles)
8. Add/rebuild Deals & Contracts Payment Dashboard
9. Add/rebuild Marketplace Lobby Wall (3 video tiles)

---

### HOME 5 — ARENA + COMMAND CENTER (SPEC CONFLICT)

| Aspect | Canonical (`Home5CommandCenterPage.tsx`) | Current (`Home5BattleCypherSurface.tsx`) | Gap | Priority |
|--------|-------|---------|-----|----------|
| **Purpose** | "What can I win?" Arena + Rewards + Sponsors Deep | Arena/Battles focused | ✓ Partial | — |
| **Arena/Achievements** | Trophy Room + Belts + Leaderboards | Battles section present | ✓ Partial | — |
| **Sponsor World** | Sponsor Spotlight + Brand Takeover + Pre-Roll | Not obvious | ✗ Missing | 2 |
| **Ad Marketplace** | Campaign Builder + Inventory + Sponsorships | Not obvious | ✗ Missing | 2 |
| **Analytics Dashboard** | 6 metric tiles + charts | Not obvious | ✗ Missing | 2 |
| **Challenges & Rewards** | Active + XP pipeline + Badges | Present but incomplete | ✓ Partial | — |
| **Deals & Contracts** | Brand/Sponsorship/Artist/Venue/Event | Not obvious | ✗ Missing | 2 |
| **Rewards Lobby Wall** | 3 video tiles (Winners/XP/Claims) | Not obvious | ✗ Missing | 2 |
| **Game Shows** | NOT IN SPEC | `Home5GameShowAudienceWall` present | ✗ WRONG LOCATION | 1 |
| **Leaderboards** | Top Fan/Performer/Venue/Writer/Promoter | Not obvious | ✗ Missing | 3 |
| **Belt System Display** | Current + Previous holders visible | Not obvious | ✗ Missing | 3 |

**Convergence Plan:**
1. Remove `Home5GameShowAudienceWall` (game shows should be separate /games route or on Home 3 discovery, NOT Home 5)
2. Keep arena/battles/cyphers/challenges focus (core strength of current component)
3. Add Sponsor World section (Spotlight + Brand Takeover + Pre-Roll)
4. Add Ad Marketplace belt (Campaign Builder + Inventory + Sponsorships)
5. Add Analytics Dashboard (6 metric tiles for sponsor tracking)
6. Add Deals & Contracts Payment Dashboard
7. Add Rewards Lobby Wall (3 video tiles)
8. Add Leaderboards display (Top Fan/Performer/Venue/Writer/Promoter)
9. Add Belt System display (current + previous championship holders)

**Note on Spec Conflict:** Current locked route map says Home 5 = Arena only. Canonical spec says Home 5 = Arena + Sponsor/Ad/Analytics/Contracts deep. **Recommendation**: Keep Home 5 as Arena focus (current choice), move Sponsor/Ad/Analytics/Contracts depth to Home 4 (Marketplace). This aligns with "one clear question per page" principle.

---

## PRIORITY CONVERGENCE ORDER

### Phase 1: Remove Contamination (Today)
- [ ] Home 2: Remove `Home2LiveLobbyStrip` + broadcast wall
- [ ] Home 3: Remove `Home3GameShowAudienceWall` 
- [ ] Home 5: Remove `Home5GameShowAudienceWall`

### Phase 2: Add Missing Critical Elements (This Week)
- [ ] Home 2: Add Editorial news ticker, clarify Marketplace belt
- [ ] Home 3: Add JOIN RANDOM CTA, World Dance Party section
- [ ] Home 4: **RENAME** to `Home4MarketplacePage.tsx`, audit current content

### Phase 3: Restore Design Fidelity (Next Week)
- [ ] Home 2: Add Discovery hexagon cluster
- [ ] Home 3: Add Three Live Stages + Camera System + Belt Champions
- [ ] Home 4: Add Ad Marketplace + Inventory + Analytics + Deals
- [ ] Home 5: Decide on Sponsor/Ad depth (keep on Home 5 or move to Home 4)

### Phase 4: Mobile + Visual Certification (Next Week)
- [ ] All homes: Verify mobile responsiveness (grids already fixed)
- [ ] All homes: Verify images render correctly
- [ ] All homes: Verify visual hierarchy matches blueprint

---

## IMPLEMENTATION RULES (Do Not Break Current Functionality)

1. **MODIFY FIRST**: Keep current component names/routes working. Add/fix sections incrementally.
2. **REPLACE SECOND**: Once new section is verified, swap old version.
3. **REBUILD LAST**: Only after all pieces work do we consider full component rewrites.

### For Each Home:
```
├─ Keep existing route (/home/2, /home/3, /home/4, /home/5)
├─ Keep current component file name (don't rename yet)
├─ Add missing blueprint sections as new sub-components
├─ Test incrementally (each section independently)
├─ Once all sections verified, commit comprehensive update
└─ Only then consider formal component rename (e.g., NewsDeskSurface → MagazinePage)
```

---

## FORK POINT: What Gets Built When

### Current Code Path (Stays Working)
```
/home/2 → Home2NewsDeskSurface.tsx (add blueprint sections into this)
/home/3 → Home3LiveWorldSurface.tsx (add blueprint sections into this)
/home/4 → Home4AdMagazine.tsx (rename OR create new Home4MarketplacePage.tsx)
/home/5 → Home5BattleCypherSurface.tsx (add blueprint sections into this)
```

### Canonical Blueprint (What We're Converging Toward)
```
/home/2 → Home2MagazinePage.tsx (target after full convergence)
/home/3 → Home3LiveWorldPage.tsx (target after full convergence)
/home/4 → Home4MarketplacePage.tsx (target after full convergence)
/home/5 → Home5CommandCenterPage.tsx (target after full convergence)
```

### Safe Transition
1. Add blueprint sections to current components (incremental)
2. Verify all sections work (testing phase)
3. Once stable, create new canonical components from the assembled version
4. Redirect old routes to new canonical components
5. Archive old components (keep in codebase, mark LEGACY)

---

## CRITICAL DECISIONS NEEDED

**Q1: Home 4 Scope — Marketplace Only, or Marketplace + Sponsor Deep?**
- Option A: Home 4 = Pure marketplace (products, tickets, beats) | Home 5 = Arena only
- Option B: Home 4 = Marketplace + Ad inventory | Home 5 = Arena + Sponsor analytics
- **Recommendation**: Option A (simpler, follows "one question per page", aligns with current code)

**Q2: Game Shows Placement — Where Should They Go?**
- Option A: Separate `/games` route (Games discovery network)
- Option B: Home 3 Discovery section (Live World discovery)
- Option C: Home 5 Arena subsection (competitive games)
- **Recommendation**: Option A (separate route, avoids contaminating Home 3/5)

**Q3: Home 5 — Keep "Command Center" Brand or Rename to "Arena"?**
- Current naming: `Home5BattleCypherSurface` (arena-focused)
- Canonical naming: `Home5CommandCenterPage` (arena + admin feel)
- **Recommendation**: Rename to `Home5ArenaBattlesPage` (clearer purpose, matches current focus)

