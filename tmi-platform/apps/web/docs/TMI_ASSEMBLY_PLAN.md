# TMI ASSEMBLY PLAN
> Generated: April 23, 2026 | Ordered build plan — existing pieces first, create last

---

## RULE: LEGO FIRST
1. Find existing file → wire it
2. No match found → create it
3. Never duplicate what already exists

---

## PHASE 1 — CRITICAL BLOCKERS (DO FIRST)

### 1.1 Fix /admin mounting
- **Existing files:** OverseerDeck.tsx, HomeFeedObserver.tsx, app/admin/page.tsx
- **What to do:** Read app/admin/page.tsx — confirm OverseerDeck is imported and rendered. Fix any import error or missing `"use client"` directive.
- **Proof:** Navigate http://localhost:3000/admin — OverseerDeck visible
- **Route:** /admin
- **Feed:** HOME1–HOME5 via HomeFeedObserver

### 1.2 Global pointer-events rule
- **Existing file:** src/app/globals.css
- **What to add:**
```css
.home-experience-layer,
.home-experience-layer__content {
  pointer-events: none;
}
a, button, [data-clickable="true"] {
  pointer-events: auto;
}
```
- **Proof:** Home1 artist click still works after adding rule

### 1.3 Back-navigation wiring
- **Existing files:** src/lib/routeHistory.ts, src/lib/navigationLock.ts
- **What to do:** Add a `<BackButton>` component that calls `getPreviousRoute()` and `router.push(prev)`. Wire into artist page, admin page, and HomeNavigator.
- **Files to create:** src/components/navigation/BackButton.tsx

---

## PHASE 2 — ADMIN DASHBOARD

### 2.1 Overseer Deck (fix/expand)
- **Existing:** OverseerDeck.tsx, HomeFeedObserver.tsx
- **What to add:** Ensure all feed cards (HOME1–HOME5) render, add links to all admin sub-pages, add user count badge, error badge
- **Position in PDF:** Left panel of admin hub

### 2.2 Chain Command Panel
- **Existing:** route-health page already exists at /admin/route-health
- **What to create:** src/components/admin/ChainCommandPanel.tsx — route map table with live/dead status badges, reads from routeRegistry
- **Route:** rendered inside /admin page

### 2.3 Live Feed Explorer
- **Existing:** HomeFeedObserver.tsx (partial), liveFeedBus.ts
- **What to create:** src/components/admin/LiveFeedExplorer.tsx — full-panel feed viewer with HOME1–HOME5 cards, role-aware (owner/admin/observer), reads window.__TMI_ALL_FEEDS__
- **Route:** rendered inside /admin page

### 2.4 System Status Bar
- **What to create:** src/components/admin/SystemStatusBar.tsx — shows build status, active sessions, error count, socket status
- **Route:** rendered at bottom of /admin

### 2.5 Marcel / Jay Paul / Justin admin pages
- **Existing:** app/admin/marcel/, app/admin/jay-paul-sanchez/, app/admin/justin-king/
- **What to do:** Each page imports LiveFeedExplorer with role='admin' and HomeFeedObserver. Add role-specific controls.
- **Marcel:** owner role — full access
- **Jay Paul Sanchez / Justin King:** admin role — feed + moderation access

---

## PHASE 3 — HOMEPAGE CHAIN

### 3.1 Home1 — pointer-events + burst
- **Existing:** Home1LiveMagazine.tsx, GenreOrbitEngine.tsx, HomeExperienceLayer.tsx
- **What to do:** Add genre-switch → burst animation sequence. After genre transition completes, fire burst effect. Wire HomeExperienceLayer pointer-events globally.
- **Burst file:** Check src/packages/foundation-effects/ for existing burst/particle effects

### 3.2 Home1-2 — magazine open animation
- **Existing:** Home12Surface.tsx, MagazineOpenShell.tsx, MagazineFlipViewport.tsx
- **What to do:** Wire Home1 magazine-open trigger to navigate /home/1-2. Bind artist data to left page. Bind genre chart to right page. Add LIVE button.
- **Files to create:** src/components/home/LiveButton.tsx (if not already exists)

### 3.3 Home2 — Live World
- **Existing:** Home2ArtifactSystem.tsx, LiveWorldScreen.tsx, LiveRooms.tsx, FeaturedArtist.tsx, SponsorStrip.tsx
- **What to do:** Ensure app/home/2/page.tsx imports and renders Home2ArtifactSystem. Wire FeaturedArtist with seed data. Wire LiveRooms with mock rooms. Add GoingLiveStrip.
- **Files to create:** src/components/home/GoingLiveStrip.tsx

### 3.4 Home3 — Genre Browse + Charts
- **Existing:** Home3ArtifactSystem.tsx, Top10Chart.tsx, TrendingArtists.tsx, NewReleases.tsx, NewsStrip.tsx
- **What to do:** Ensure page imports artifact system. Create GenreTileGrid. Wire Top10 with seed data.
- **Files to create:** src/components/home/GenreTileGrid.tsx

### 3.5 Home4 — Shows + Events + Billboard
- **Existing:** Home4ArtifactSystem.tsx, ContestBanner.tsx, SponsorStrip.tsx, AdvertiserStrip.tsx, ChartsStoreScreen.tsx
- **What to do:** Create ShowsCalendarStrip, BillboardRotator, SeasonPassBanner. Wire contest data.
- **Files to create:** src/components/home/ShowsCalendarStrip.tsx, BillboardRotator.tsx, SeasonPassBanner.tsx

### 3.6 Home5 — Expand leaderboard
- **Existing:** Home5ArtifactSystem.tsx — VERIFIED
- **What to add:** RankToggle (weekly/all-time), GenreFilterTabs, TrophyIndicator on top 3

---

## PHASE 4 — ARTIST PROFILE

### 4.1 Real artist magazine page
- **Existing:** app/artists/[slug]/page.tsx (text-only), ArtistPortalFace.tsx, FrameSlot.tsx
- **What to create:** src/components/artists/ArtistMagazinePage.tsx with:
  - Hero section: animated portrait, name, genre badge, verified check
  - Stats bar: followers, plays, rank, XP
  - Live button → /live/:slug
  - Article preview cards → /articles/:slug
  - Booking module → /booking/artists/:slug
  - Sponsor slots (billboard frames)
  - Back button → getPreviousRoute()
- **Existing components to reuse:** HeroSection.tsx, FrameSlot.tsx, TipButtons.tsx, SpotlightRail.tsx

### 4.2 Artist article page
- **Existing:** app/articles/ route
- **What to do:** Wire /articles/:slug to editorial content, seed with test articles per artist

### 4.3 Artist booking
- **Existing:** app/booking/artists/ route
- **What to do:** Wire booking form with artist seed data, add calendar picker

---

## PHASE 5 — SIGNUP FLOW

### 5.1 Role-forked signup
- **Existing:** app/signup/page.tsx
- **What to do:** Add role selector (Fan / Performer / Sponsor / Advertiser). Each role shows different form fields per PDF designs.
- **Route forks:** /signup?role=fan | performer | sponsor | advertiser

---

## PHASE 6 — SEASON PASS

- **Existing:** app/season-pass/page.tsx (stub)
- **What to create:** src/components/TierCards.tsx with Bronze/Silver/Gold tier display per PDF design
- **Wire:** Upgrade button → /billing → Stripe checkout

---

## PHASE 7 — HOST REGISTRY

- **Existing:** src/lib/hosts/hostEngine.ts, src/packages/magazine-engine/hostRegistry.ts
- **What to add:**
  - Tiara → Monday Night Stage (/shows/monday-night-stage)
  - Michael Gregory → /shows/yearly-contest and /shows/battle-of-the-bands
  - Host 1–4 → general assignment pool
- **Files to create:** app/shows/monday-night-stage/page.tsx, app/shows/yearly-contest/page.tsx, app/shows/battle-of-the-bands/page.tsx

---

## PHASE 8 — JULIUS BOT / HELPER

- **What to create:**
  - src/lib/bots/julius.ts — bot config entry
  - src/components/bots/JuliusHelper.tsx — floating assistant overlay
  - Wire into layout.tsx as global overlay

---

## PHASE 9 — AVATAR BUILDER (Record Ralph)

- **Existing:** app/avatar-builder/, app/avatar-center/, AvatarCreator.tsx
- **What to add:** Skin tone selector, accessory grid with locked/unlocked states, SAVE button wired to /api/avatar/save
- **Reference:** Record Ralph.jpg design

---

## PHASE 10 — VENUE + GAME SKINS

- **Existing:** app/venues/skins/, app/venues/designer/, DigitalVenueTwinShell.tsx
- **What to do:**
  - Create venue skin registry: src/data/venueSkins.ts — list all skin IDs and image paths
  - Wire skin selector in venue designer
  - Create game show skin registry: src/data/gameShowSkins.ts
  - Wire skin to game room render

---

## PHASE 11 — SPONSOR / ADVERTISER HUB

- **Existing:** SponsorDashboard.tsx, SponsorROIAnalytics.tsx, RevenueChart.tsx, SponsorContestPanel.tsx
- **What to create:** CampaignBuilder.tsx, PlacementInventory.tsx, ContractGateway.tsx, PaymentTracker.tsx
- **Wire:** Campaign builder → /sponsor/campaigns/new → POST /api/sponsor/campaign
- **Wire:** Analytics → real or mock chart data

---

## PHASE 12 — LIVE FEED + BOTS

- **Existing:** liveFeedBus.ts, botRegistry.ts, bots/botPopulation.generated.json, seeds/fullTestPopulation.generated.json
- **What to do:**
  - Verify test population has 60 each: fans, artists, sponsors, advertisers, venues
  - Add role-aware access: owner=Marcel, admin=Jay Paul/Justin King, observer=read-only
  - Wire sandbox wallet reset routine: /api/test/reset-wallets
  - Ensure bots have role/target/page assigned in botRegistry

---

## PHASE 13 — ANALYTICS DASHBOARDS

- **Existing:** RevenueChart.tsx, SponsorROIAnalytics.tsx
- **What to create/wire:**
  - Bar chart, pie chart, line chart, heatmap components using existing chart lib (check package.json for recharts/chart.js)
  - Wire to artist/sponsor/advertiser analytics routes
  - Admin analytics at /admin/economy

---

## PHASE 14 — PROOF GATES

After each phase, run:
```
pnpm build
node scripts/check-route-integrity.mjs
node scripts/check-home1-artifact-routes.mjs
```

Playwright smoke checks:
- /home/1 → click artist → /artists/:slug ✅ (already verified)
- /home/5 → click leaderboard → /artists/:slug ✅ (already verified)
- /home/2 → click live room → /live/:roomId
- /home/3 → click genre tile → /genres/:slug
- /home/4 → click contest → /contests/:id
- /admin → OverseerDeck visible, feed cards HOME1-5 visible
- /admin/leaderboards → clickable ✅ (already verified)
- /artists/kai-drift → real UI, hero + stats + live button
- /signup → role selector forks correctly
- /season-pass → tier cards visible
- Back navigation from artist → returns to Home1
