# Home 4 Marketplace — Audit & Rename Decision
## Analysis Date: 2026-06-23

---

## Current State vs. Canonical Spec

### File Naming Issue
- **Current**: `Home4AdMagazine.tsx`
- **Header Content**: "THE MARKETPLACE" + "WHAT CAN I BUY? · TICKETS · BEATS · PASSES · ADS · MERCH"
- **Problem**: Filename (`AdMagazine`) contradicts actual content (`Marketplace`)

### Sections Actually Rendered
✅ **Sponsor Spotlight** — 3-panel layout (left panel shows placeholder, has "GET FEATURED" CTA)
✅ **Premium Billboard / Brand Takeover** — Center panel with emoji, "BRAND TAKEOVER" label, "BUY THIS SLOT" button
✅ **Sponsored Artist Pre-Roll** — Right panel with artist emoji, "BUY PRE-ROLL AD" button
✅ **Ad Marketplace Buttons** — 5 action buttons:
  - BUY AD PLACEMENT
  - CAMPAIGN BUILDER
  - AUDIENCE TARGETING
  - EVENT SPONSORSHIPS
  - LIVESTREAM SPONSORSHIPS
✅ **Sticker Chaos Wall** — 18 sponsor logos/badges scattered, hover animations, glow effects
✅ **Billboard Hero** — Rotating headline ads (Cypher Fest, TMI Gold Pass, Monday Night Stage, World Dance Party)
✅ **Venue Ticket Rail** — Registry-driven venue cards with occupancy, price, booking links
✅ **Marquee Strip** — Bottom banner with sponsor mentions

### Gaps (Missing from Canonical Spec)
❌ **Inventory & Placements** — 10-type index with checkboxes not visible
  - Current: No inventory management UI
  - Spec requires: Homepage Banners ✓ | Article Ads | Profile Ads | Live Overlays | Pre-Roll ✓ | Mid-Roll | Sponsored Cards | Newsletter Ads | Store Placements

❌ **Analytics Dashboard** — 7 metric tiles not visible
  - Current: No performance/impressions/CTR/ROI display
  - Spec requires: Impressions, Clicks, Engagement, Watch Time, Conversion, Sales, ROI tiles + charts + demographics

❌ **Deals & Contracts Payment Dashboard** — Not visible
  - Current: No revenue/contract tracking UI
  - Spec requires: Brand Deals | Sponsorship Offers | Artist Partnerships | Venue Partnerships | Event Sponsors + Payment Tracking + Revenue Share

❌ **Marketplace Lobby Wall** — 3-video-tile carousel not visible
  - Current: Venue Ticket Rail exists (registry-driven)
  - Spec requires: feedType='marketplace' + Recent Purchases | Top Selling Beats | Most Purchased Tickets

---

## Decision: RENAME

**Recommendation**: Rename `Home4AdMagazine.tsx` → `Home4MarketplacePage.tsx`

**Rationale**:
1. Content is already marketplace-focused (sponsor spotlight, ad marketplace, venue tickets)
2. Filename creates confusion (says "AdMagazine" but renders "Marketplace")
3. Missing sections (Inventory, Analytics, Contracts, Lobby Wall) are additive, not contradictory
4. Current architecture is sound; gaps are **Phase 3** work, not Phase 2

**Phase 2 Action**: Rename file and update route imports
**Phase 3 Action**: Add Inventory, Analytics, Contracts, Lobby Wall sections

---

## Route Audit

Current home/4 route imports: **TBD** (need to find route file)
File rename requires updating import path if any route/layout imports by filename.

---

## Marketplace Convergence Status

| Spec Section | Current | Status | Phase |
|---|---|---|---|
| Sponsor Spotlight | Visible (3-panel) | ✅ PRESENT | 2 ✓ |
| Premium Billboard | Visible (center panel) | ✅ PRESENT | 2 ✓ |
| Ad Marketplace | Buttons visible (5 actions) | ✅ PARTIAL | 2 ✓ |
| Inventory/Placements | Not visible | ❌ MISSING | 3 |
| Analytics Dashboard | Not visible | ❌ MISSING | 3 |
| Deals & Contracts | Not visible | ❌ MISSING | 3 |
| Marketplace Lobby Wall | Venue Rail visible (partial) | ⚠️ PARTIAL | 3 |

**Phase 2 is feasible**: Rename complete the file, update imports, done.
**Phase 3 opens**: Add the 4 missing sections above.

