# TMI PDF TO ARTIFACT MAP
> Generated: April 23, 2026 | PDF source → Component/Route mapping

---

## HOW TO READ THIS MAP
- **PDF Image** = the reference design
- **Lego Piece** = existing component to reuse
- **Route** = the URL that renders it
- **Missing** = what needs to be created or wired
- **Position** = where on the page it lives

---

## HOME1 — /home/1

| PDF Zone | Lego Piece | Route | Status | Position |
|---|---|---|---|---|
| Background canvas (1980s dark) | HomepageCanvas.tsx | — | ⚠️ needs 1980s style | full-screen z-0 |
| Orbit ring + artist frames | Home1LiveMagazine.tsx + GenreOrbitEngine.tsx | — | ✅ | center z-10 |
| Artist portrait cards | ArtistPortalFace.tsx | → /artists/:slug | ✅ click verified | orbit positions |
| Crown artist (center) | CrownDisplay.tsx | → /artists/:slug | ⚠️ needs route | z-20 center |
| Genre orbit labels | GenreOrbitEngine.tsx | → genre filter | ⚠️ needs click action | ring labels |
| Top nav bar | MainNav (layout.tsx) | — | ✅ | top z-50 |
| Genre belt selector | home/belts/ or AdvertiserStrip | — | ⚠️ needs genre binding | bottom z-20 |
| Nav dots | HomeNavigator.tsx | → /home/1–5 | ✅ click-locked | right edge |
| Magazine open trigger | MagazineOpenShell.tsx | → /home/1-2 | ⚠️ not wired | orbit→open transition |
| Pointer-events global rule | globals.css | — | ❌ NOT ADDED | global |

---

## HOME1-2 — /home/1-2 (open magazine state)

| PDF Zone | Lego Piece | Route | Status | Position |
|---|---|---|---|---|
| Open magazine spread | Home12Surface.tsx + MagazineFlipViewport.tsx | — | ⚠️ shell exists | full-screen |
| Left page: artist portrait | ArtistFaceCard.tsx or TopArtistMotionPortrait.tsx | → /artists/:slug | ⚠️ not bound | left page |
| Left page: bio text | ArtistPortalFace (static fields) | — | ⚠️ | left page |
| Left page: LIVE button | LiveButton component (create) | → /live/:slug | 🆕 MISSING | left page |
| Right page: genre chart | Top10Chart.tsx | → /genres/:slug | ⚠️ | right page |
| Right page: trending tracks | TrendingArtists.tsx | → /artists/:slug | ⚠️ | right page |
| Right page: weekly crown | WeeklyCrownBelt.tsx | → /artists/:slug | ⚠️ | right page |
| Navigation arrows | HomeNavigator.tsx prev/next | → /home/1, /home/2 | ✅ click-locked | left/right edges |
| Magazine spine | MagazineOpenShell.tsx | — | ⚠️ | center |

---

## HOME2 — /home/2

| PDF Zone | Lego Piece | Route | Status | Position |
|---|---|---|---|---|
| Section: Live World hub | Home2ArtifactSystem.tsx | — | ⚠️ not rendering in page | parent |
| Featured artist large card | FeaturedArtist.tsx | → /artists/:slug | ⚠️ | center-top |
| Live rooms grid (4–6 cards) | LiveRooms.tsx | → /live/:roomId | ⚠️ no data | 2-col grid |
| "Going Live" countdown strip | 🆕 GoingLiveStrip (create) | → /live/:slug | 🆕 MISSING | top strip |
| Genre filter tabs | 🆕 GenreFilterTabs (create or reuse) | → genre state | 🆕 MISSING | above rooms |
| Trending now rail | TrendingArtists.tsx | → /artists/:slug | ⚠️ | bottom rail |
| Sponsor strip | SponsorStrip.tsx | → /sponsor/:slug | ⚠️ | bottom strip |

---

## HOME3 — /home/3

| PDF Zone | Lego Piece | Route | Status | Position |
|---|---|---|---|---|
| Section: Genre browse | Home3ArtifactSystem.tsx | — | ⚠️ not rendering in page | parent |
| Genre tiles grid (6–8) | 🆕 GenreTileGrid (create or reuse) | → /genres/:slug | 🆕 MISSING | 3-col grid top |
| Top 10 chart strip | Top10Chart.tsx | → /artists/:slug | ⚠️ needs data | horizontal strip |
| New releases row | NewReleases.tsx | → /releases/:slug | ⚠️ needs data | horizontal row |
| News/editorial strip | NewsStrip.tsx | → /articles/:slug | ⚠️ needs data | horizontal strip |
| Trending artists row | TrendingArtists.tsx | → /artists/:slug | ⚠️ needs data | horizontal row |
| Weekly battle results | 🆕 BattleResultsBanner (create) | → /games/battle | 🆕 MISSING | banner slot |

---

## HOME4 — /home/4

| PDF Zone | Lego Piece | Route | Status | Position |
|---|---|---|---|---|
| Section: Shows & Events | Home4ArtifactSystem.tsx | — | ⚠️ not rendering in page | parent |
| Shows calendar strip | 🆕 ShowsCalendarStrip (create) | → /shows/:slug | 🆕 MISSING | top strip |
| Contest cards | ContestBanner.tsx | → /contests/:id | ⚠️ needs data | card grid |
| Billboard / sponsor zone | 🆕 BillboardRotator (create) | → /sponsor/:slug | 🆕 MISSING | large center |
| Store preview row | ChartsStoreScreen.tsx | → /store/:slug | ⚠️ | bottom row |
| Season pass promo | 🆕 SeasonPassBanner (create) | → /season-pass | 🆕 MISSING | banner slot |
| Advertiser spotlight | AdvertiserStrip.tsx | → /advertiser/:slug | ⚠️ | strip |

---

## HOME5 — /home/5

| PDF Zone | Lego Piece | Route | Status | Position |
|---|---|---|---|---|
| Leaderboard artist cards | Home5ArtifactSystem.tsx | → /artists/:slug | ✅ VERIFIED | card grid |
| Rank numbers | Home5ArtifactSystem.tsx | — | ✅ | card overlay |
| Weekly/All-Time toggle | 🆕 RankToggle (create) | → filter state | ⚠️ PARTIAL | top-right |
| Genre filter tabs | 🆕 GenreFilterTabs | → genre state | ⚠️ | top bar |
| Crown/trophy top-3 | 🆕 TrophyIndicator (create) | — | ⚠️ | top-3 cards |

---

## ADMIN HUB — /admin

| PDF Zone | Lego Piece | Route | Status | Position |
|---|---|---|---|---|
| Header "Administrator Hub" | OverseerDeck.tsx header | — | ⚠️ not mounting | top |
| Overseer Deck panel | OverseerDeck.tsx | — | ❌ NOT RENDERING | left panel |
| HOME1–HOME5 feed cards | HomeFeedObserver.tsx | — | ✅ in other pages | inside Overseer |
| Chain Command panel | 🆕 ChainCommandPanel (create) | → route health | 🆕 MISSING | center panel |
| Live Feed Explorer | 🆕 LiveFeedExplorer (create) | → feed detail | 🆕 MISSING | right panel |
| System status bar | 🆕 SystemStatusBar (create) | — | 🆕 MISSING | bottom bar |
| Navigation links | OverseerDeck.tsx links | → admin sub-pages | ⚠️ btns:0 reported | side nav |
| Marcel panel | app/admin/marcel/ | → /admin/marcel | ⚠️ stub | sub-page |
| Jay Paul Sanchez panel | app/admin/jay-paul-sanchez/ | → /admin/jay-paul-sanchez | ⚠️ stub | sub-page |
| Justin King panel | app/admin/justin-king/ | → /admin/justin-king | ⚠️ stub | sub-page |

---

## ADVERTISER / SPONSOR HUB — /advertiser or /sponsor

| PDF Zone | Lego Piece | Route | Status | Position |
|---|---|---|---|---|
| Header | SponsorDashboard.tsx header | — | ⚠️ | top |
| Campaign builder | 🆕 CampaignBuilder (create) | → /campaigns/new | 🆕 MISSING | center |
| Placement inventory | 🆕 PlacementInventory (create) | → /placements | 🆕 MISSING | left panel |
| Analytics charts | SponsorROIAnalytics.tsx + RevenueChart.tsx | → /analytics | ⚠️ no data | right panel |
| Deal/contract section | 🆕 ContractGateway (create) | → /contracts | 🆕 MISSING | center-bottom |
| Payment tracking | 🆕 PaymentTracker (create) | → /payments | 🆕 MISSING | bottom |
| Active campaigns list | SponsorContestPanel.tsx | → /campaigns | ⚠️ | side list |

---

## SIGNUP PAGES

| PDF Page | Route | Lego Piece | Missing | Status |
|---|---|---|---|---|
| Fan Sign up | /signup?role=fan | app/signup/page.tsx | Role fork, genre selector | ⚠️ |
| Performer Sign up | /signup?role=performer | app/signup/page.tsx | Stage name, instrument, tier preview | ⚠️ |
| Sponsor Sign up | /signup?role=sponsor | app/signup/page.tsx | Company fields, budget, campaign interests | ⚠️ |
| Advertiser Sign up | /signup?role=advertiser | app/signup/page.tsx | Brand fields, ad formats, audience targeting | ⚠️ |

---

## SEASON PASS — /season-pass

| PDF Zone | Lego Piece | Route | Status | Position |
|---|---|---|---|---|
| Tier cards (Bronze/Silver/Gold) | 🆕 TierCards (create) | → /billing | 🆕 MISSING | 3-col grid |
| Feature list per tier | 🆕 TierFeatureList (create) | — | 🆕 MISSING | card body |
| Upgrade button | 🆕 UpgradeButton (create) | → Stripe checkout | 🆕 MISSING | card footer |
| Current tier highlight | 🆕 CurrentTierBadge | — | 🆕 MISSING | card header |
| Exclusive access badges | 🆕 AccessBadges | — | 🆕 MISSING | card overlay |

---

## HOST REGISTRY

| PDF Image | Character | Role | Assigned Show | Route | Status |
|---|---|---|---|---|---|
| Host.png | Host 1 (MC) | General host | Unassigned | /hosts/host-1 | ⚠️ |
| Host 2.png | Host 2 (Female DJ) | DJ host | Unassigned | /hosts/host-2 | ⚠️ |
| Host 3.png | Host 3 (Street MC) | Battle host | Battle shows | /hosts/host-3 | ⚠️ |
| Host 4.png | Host 4 (Glamour) | Awards host | Awards shows | /hosts/host-4 | ⚠️ |
| Tiana.jpg | Tiara | Monday Night Stage host | /shows/monday-night-stage | /hosts/tiara | ❌ NOT ASSIGNED |
| Julius.png | Julius | Platform mascot/helper bot | All pages (overlay) | /bots/julius | 🆕 MISSING |
| Record Ralph.jpg | Record Ralph | Avatar builder default | /avatar-builder | /avatar-builder | ⚠️ PARTIAL |

---

## GAME SHOW SKINS REGISTRY

| Image | Skin ID | Type | Route | Status |
|---|---|---|---|---|
| images (27) | skin-podium-single-neon | Single podium quiz | /games/trivia | ⚠️ |
| images (28) | skin-podium-triple-pink | 3-player game show | /games/lyric-fill | ⚠️ |
| images (29) | skin-podium-triple-blue | Formal game show | /games/name-that-tune | ⚠️ |
| images (30) | skin-quiz-colorful | Multi-player quiz | /games/trivia | ⚠️ |
| images (31) | skin-concert-screen | Concert/live show | /live/:slug | ⚠️ |
| images (32) | skin-interview-round | Interview/talk show | /shows/interviews | ⚠️ |
| images (33) | skin-tournament-dot | Tournament/contest | /games/tournaments | ⚠️ |
| images (34) | skin-tv-studio-orange | News/editorial show | /shows/:slug | ⚠️ |
| images (35) | skin-debate-led | Battle/cypher | /games/battle | ⚠️ |
| download (23–37) | skin-outdoor-amp-* | Outdoor amphitheater | /venues/:slug | ⚠️ |

---

## VENUE SKINS REGISTRY

| Image | Skin ID | Type | Route | Status |
|---|---|---|---|---|
| images (2) | skin-galaxy-lounge | Space/galaxy lounge | /venues/galaxy-lounge | ⚠️ |
| images (3) | skin-xs-nightclub | Luxury nightclub | /venues/brick-house | ⚠️ |
| images (4) | skin-festival-indoor | Indoor festival | /venues/:slug | ⚠️ |
| images (5) | skin-conference-blue | Conference/awards | /venues/:slug | ⚠️ |
| images (6–22) | skin-venue-* | Various venue skins | /venues/skins | ⚠️ |
