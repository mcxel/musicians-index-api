# TMI FULL REPO AUDIT
> Generated: April 23, 2026 | Base: tmi-platform/apps/web/src

---

## LEGEND
- ✅ USABLE — functional, wired, tested
- ⚠️ PARTIAL — exists but missing wiring/data/routes
- ❌ BROKEN — present but non-functional
- 🔲 PLACEHOLDER — stub/skeleton only
- 🆕 MISSING — needs to be created

---

## 1. PAGES / ROUTES (src/app/)

### Homepage Chain
| Route | File | Status | Notes |
|---|---|---|---|
| / | app/page.tsx | ✅ | Redirects to /home/1 via magazine pager |
| /home/1 | app/home/1/page.tsx | ✅ | Home1 orbit + artist frames — VERIFIED |
| /home/1-2 | app/home/1-2/page.tsx | ⚠️ | Shell exists, needs open-magazine second state wired |
| /home/2 | app/home/2/page.tsx | ⚠️ | Home2ArtifactSystem exists but needs full wiring |
| /home/3 | app/home/3/page.tsx | ⚠️ | Home3ArtifactSystem exists but needs full wiring |
| /home/4 | app/home/4/page.tsx | ⚠️ | Home4ArtifactSystem exists but needs full wiring |
| /home/5 | app/home/5/page.tsx | ✅ | Artifact leaderboard system — VERIFIED |
| /home/cover | app/home/cover/page.tsx | ⚠️ | Magazine cover shell — needs animation chain |
| /home/magazine | app/home/magazine/page.tsx | ⚠️ | Magazine open shell — needs Home1-2 wiring |
| /home/loop | app/home/loop/page.tsx | ⚠️ | Loop shell — needs genre transition burst |
| /home/ranking | app/home/ranking/page.tsx | ⚠️ | Ranking page — needs live data |
| /home/live | app/home/live/page.tsx | ⚠️ | Live hub — needs feed connection |
| /home/social | app/home/social/page.tsx | ⚠️ | Social feed — needs data |
| /home/world-5 | app/home/world-5/page.tsx | ⚠️ | World view — needs wiring |
| /home/control | app/home/control/page.tsx | ⚠️ | Control panel — admin only |
| /home/6–15 | app/home/6–15/ | 🔲 | Placeholder slots — future issues |

### Admin Chain
| Route | File | Status | Notes |
|---|---|---|---|
| /admin | app/admin/page.tsx | ⚠️ | OverseerDeck exists but reported empty in tests |
| /admin/leaderboards | app/admin/leaderboards/ | ✅ | VERIFIED working |
| /admin/style-debug | app/admin/style-debug/ | ✅ | Present |
| /admin/simulation | app/admin/simulation/ | ✅ | Present |
| /admin/observatory | app/admin/observatory/ | ✅ | Present |
| /admin/route-health | app/admin/route-health/ | ✅ | Present |
| /admin/marcel | app/admin/marcel/ | ⚠️ | Stub only |
| /admin/jay-paul-sanchez | app/admin/jay-paul-sanchez/ | ⚠️ | Stub only |
| /admin/justin-king | app/admin/justin-king/ | ⚠️ | Stub only |
| /admin/users | app/admin/users/ | ⚠️ | Present — no real data |
| /admin/bots | app/admin/bots/ | ⚠️ | Present — no UI |
| /admin/games | app/admin/games/ | ⚠️ | Present — no UI |
| /admin/sponsors | app/admin/sponsors/ | ⚠️ | Present — no UI |
| /admin/rooms | app/admin/rooms/ | ⚠️ | Present — no UI |
| /admin/audit | app/admin/audit/ | ⚠️ | Present — no UI |
| /admin/economy | app/admin/economy/ | ⚠️ | Present — no UI |
| /admin/editorial | app/admin/editorial/ | ⚠️ | Present — no UI |
| /admin/security | app/admin/security/ | ⚠️ | Present — no UI |
| /admin/system-health | app/admin/system-health/ | ⚠️ | Present — no UI |

### Artist Chain
| Route | File | Status | Notes |
|---|---|---|---|
| /artists | app/artists/page.tsx | ⚠️ | Browse page — needs grid/cards |
| /artists/[slug] | app/artists/[slug]/page.tsx | ⚠️ | Functional but text-only — needs real magazine UI |
| /artists/dashboard | app/artists/dashboard/ | ⚠️ | Present — no UI |

### Auth / Signup
| Route | File | Status | Notes |
|---|---|---|---|
| /signup | app/signup/page.tsx | 🔲 | Generic signup — needs fan/performer/sponsor/advertiser fork |
| /login | app/login/ | ⚠️ | Present — no face-scan integration |
| /onboarding | app/onboarding/ | ⚠️ | Present — incomplete |
| /account-recovery | app/account-recovery/ | 🔲 | Stub |
| /face-login | app/face-login/ | ⚠️ | Present — partial |
| /face-scan | app/face-scan/ | ⚠️ | Present — partial |

### Venue Chain
| Route | File | Status | Notes |
|---|---|---|---|
| /venues | app/venues/page.tsx | ⚠️ | Browse page — needs grid |
| /venues/[slug] | app/venues/[slug]/ | ⚠️ | Present — no real venue UI |
| /venues/dashboard | app/venues/dashboard/ | ⚠️ | Present — no data |
| /venues/designer | app/venues/designer/ | ⚠️ | Present — partial |
| /venues/skins | app/venues/skins/ | ⚠️ | Present — needs skin assets wired |

### Games Chain
| Route | File | Status | Notes |
|---|---|---|---|
| /games | app/games/page.tsx | ⚠️ | Browse — no cards |
| /games/battle | app/games/battle/ | ⚠️ | Present — no lobby |
| /games/trivia | app/games/trivia/ | ⚠️ | Present — no questions |
| /games/lyric-fill | app/games/lyric-fill/ | ⚠️ | Present — no content |
| /games/name-that-tune | app/games/name-that-tune/ | ⚠️ | Present — no audio |
| /games/dj-mix-off | app/games/dj-mix-off/ | ⚠️ | Present — no mixer |
| /games/deal-or-feud | app/games/deal-or-feud/ | ⚠️ | Present — no rules |
| /games/game-night | app/games/game-night/ | ⚠️ | Present — no lobby |
| /games/tournaments | app/games/tournaments/ | ⚠️ | Present — no bracket |
| /games/sponsor-mission | app/games/sponsor-mission/ | ⚠️ | Present — no missions |
| /games/leaderboard | app/games/leaderboard/ | ⚠️ | Present — no data |
| /games/cover-art-zoom | app/games/cover-art-zoom/ | ⚠️ | Present — no images |

### Shows / Contests / Live
| Route | File | Status | Notes |
|---|---|---|---|
| /shows | app/shows/page.tsx | ⚠️ | Browse — needs cards |
| /shows/[slug] | app/shows/[slug]/ | ⚠️ | Present — no show UI |
| /contests | app/contests/page.tsx | ⚠️ | Browse — needs cards |
| /contests/[id] | app/contests/[id]/ | ⚠️ | Present — no rules/lobby |
| /live | app/live/page.tsx | ⚠️ | Hub — needs rooms |
| /live/[roomId] | app/live/[roomId]/ | ⚠️ | Room — no stage UI |
| /live/[slug] | app/live/[slug]/ | ⚠️ | Artist live — no stream |

### Commerce / Economy
| Route | File | Status | Notes |
|---|---|---|---|
| /store | app/store/page.tsx | ⚠️ | Browse — no items |
| /store/[slug] | app/store/[slug]/ | ⚠️ | Item detail — no UI |
| /wallet | app/wallet/page.tsx | ⚠️ | Present — no balance/history |
| /rewards | app/rewards/page.tsx | ⚠️ | Present — no rewards UI |
| /rewards/claims | app/rewards/claims/ | ⚠️ | Present — no claim UI |
| /season-pass | app/season-pass/page.tsx | ⚠️ | Present — no tier UI |
| /booking | app/booking/page.tsx | ⚠️ | Present — no flow |
| /tickets | app/tickets/ | ⚠️ | Present — no inventory |
| /achievements | app/achievements/ | ⚠️ | Present — no data |

### Sponsor / Advertiser
| Route | File | Status | Notes |
|---|---|---|---|
| /sponsor | app/sponsor/page.tsx | ⚠️ | Hub — no UI |
| /sponsor/dashboard | app/sponsor/dashboard/ | ⚠️ | Present — no data |
| /sponsor/campaigns | app/sponsor/campaigns/ | ⚠️ | Present — no builder |
| /sponsor/analytics | app/sponsor/analytics/ | ⚠️ | Present — no charts |
| /sponsor/contracts | app/sponsor/contracts/ | ⚠️ | Present — no UI |
| /sponsor/payments | app/sponsor/payments/ | ⚠️ | Present — no UI |
| /sponsor/rooms | app/sponsor/rooms/ | ⚠️ | Present — no UI |
| /sponsor/shows | app/sponsor/shows/ | ⚠️ | Present — no UI |
| /advertiser | app/advertiser/page.tsx | ⚠️ | Hub — no UI |
| /advertiser/dashboard | app/advertiser/dashboard/ | ⚠️ | Present — no data |
| /advertiser/campaigns | app/advertiser/campaigns/ | ⚠️ | Present — no builder |
| /advertiser/analytics | app/advertiser/analytics/ | ⚠️ | Present — no charts |
| /advertiser/placements | app/advertiser/placements/ | ⚠️ | Present — no inventory |
| /advertiser/contracts | app/advertiser/contracts/ | ⚠️ | Present — no UI |
| /advertiser/payments | app/advertiser/payments/ | ⚠️ | Present — no UI |

---

## 2. COMPONENTS (src/components/)

### Admin
| File | Purpose | Status |
|---|---|---|
| admin/OverseerDeck.tsx | Admin hub main dashboard | ⚠️ exists — not mounting correctly at /admin |
| admin/HomeFeedObserver.tsx | HOME1-5 live feed strip | ✅ wired to style-debug/observatory/simulation |
| admin/UserManagement.tsx | User admin table | ⚠️ present |

### Home
| File | Purpose | Status |
|---|---|---|
| home/HomeNavigator.tsx | Prev/next/dot page navigation | ✅ click-locked |
| home/HomepageCanvas.tsx | 1980s background canvas | ⚠️ present |
| home/Home1Shell.tsx | Home1 wrapper shell | ✅ |
| home/Home12Surface.tsx | Home1-2 magazine open spread | ⚠️ present — animation not fully wired |
| home/HeroBanner.tsx | Hero banner component | ⚠️ |
| home/LiveWorldScreen.tsx | Live world display | ⚠️ |
| home/MagazineCarousel.tsx | Carousel shell | ⚠️ |
| home/MagazineCoverScreen.tsx | Cover screen | ⚠️ |
| home/SponsorStrip.tsx | Sponsor banner strip | ⚠️ |
| home/AdvertiserStrip.tsx | Advertiser banner strip | ⚠️ |
| home/FeaturedArtist.tsx | Featured artist card | ⚠️ |
| home/Top10Chart.tsx | Top 10 chart widget | ⚠️ |
| home/TrendingArtists.tsx | Trending artists row | ⚠️ |
| home/WeeklyCrownBelt.tsx | Weekly crown display | ⚠️ |
| home/ContestBanner.tsx | Contest promo banner | ⚠️ |
| home/LiveShows.tsx | Live shows strip | ⚠️ |
| home/NewReleases.tsx | New releases row | ⚠️ |
| home/NewsStrip.tsx | News feed strip | ⚠️ |
| home/Interviews.tsx | Interviews section | ⚠️ |
| home/ChartsStoreScreen.tsx | Charts + store combo | ⚠️ |
| home/HomepageSectionJumpNav.tsx | Section jump nav | ⚠️ |
| home/PageSwitcher.tsx | Page switching logic | ⚠️ |

### Artist
| File | Purpose | Status |
|---|---|---|
| artists/ArtistPortalFace.tsx | Home1 artist orbit card | ✅ click-locked + routing works |

### Venue
| File | Purpose | Status |
|---|---|---|
| venue/DigitalVenueTwinProvider.tsx | Venue state provider | ⚠️ |
| venue/DigitalVenueTwinShell.tsx | Venue display shell | ⚠️ |

### Host/Hosts
| File | Purpose | Status |
|---|---|---|
| host/HostStageCard.tsx | Host card display | ⚠️ |
| host/HostCuePanel.tsx | Host cue system | ⚠️ |
| host/HostSoundboardPanel.tsx | Soundboard controls | ⚠️ |
| host/CoHostHandoffPanel.tsx | Co-host handoff | ⚠️ |
| host/CrowdPromptPanel.tsx | Crowd prompt system | ⚠️ |
| host/PrizeRevealControlPanel.tsx | Prize reveal | ⚠️ |
| host/RayJourneyHost.tsx | Ray Journey host avatar | ⚠️ |
| hosts/HostConsole.tsx | Host console UI | ⚠️ |

### Sponsor
| File | Purpose | Status |
|---|---|---|
| sponsor/SponsorDashboard.tsx | Sponsor dashboard | ⚠️ |
| sponsor/SponsorContestPanel.tsx | Contest sponsorship | ⚠️ |
| sponsor/SponsorROIAnalytics.tsx | ROI analytics | ⚠️ |
| sponsor/RevenueChart.tsx | Revenue chart | ⚠️ |

### Magazine / Frames
| File | Purpose | Status |
|---|---|---|
| magazine/ | Magazine shell components | ⚠️ |
| MagazineCover.tsx | Cover component | ⚠️ |
| frames/ | Frame shell components | ⚠️ |

### Game
| File | Purpose | Status |
|---|---|---|
| game/AudienceGuessPanel.tsx | Audience guess mechanic | ⚠️ |

### HUD
| File | Purpose | Status |
|---|---|---|
| hud/ | HUD overlay components | ⚠️ |

---

## 3. PACKAGES (src/packages/)

### magazine-engine
| File | Purpose | Status |
|---|---|---|
| Home1LiveMagazine.tsx | Home1 orbit + starburst | ✅ |
| Home2ArtifactSystem.tsx | Home2 artifact system | ⚠️ needs wiring |
| Home3ArtifactSystem.tsx | Home3 artifact system | ⚠️ needs wiring |
| Home4ArtifactSystem.tsx | Home4 artifact system | ⚠️ needs wiring |
| Home5ArtifactSystem.tsx | Home5 leaderboard artifacts | ✅ verified |
| useMagazinePager.tsx | Page navigation + session restore | ✅ fixed this session |
| MagazineOpenShell.tsx | Open magazine shell | ⚠️ |
| MagazineFlipViewport.tsx | Page flip animation | ⚠️ |
| MagazineFrame.tsx | Frame wrapper | ⚠️ |
| MagazineGrid.tsx | Grid layout | ⚠️ |
| MagazineRoot.tsx | Root renderer | ⚠️ |
| MagazinePageCanvas.tsx | Page canvas | ⚠️ |
| liveFeedBus.ts | Feed bus (HOME1-5) | ✅ exists — socket not running |
| hostRegistry.ts | Host registry | ⚠️ exists — no Tiana/Michael entry |
| issueRegistry.ts | Magazine issues | ⚠️ |
| magazinePages.ts | Page definitions | ✅ |
| zoneMaps.ts | Zone maps | ⚠️ |
| home1ArtifactMap.ts | Home1 artifact positions | ✅ |
| contentRegistry.tsx | Content registry | ⚠️ |
| visualRegistry.ts | Visual registry | ⚠️ |
| environmentMap.ts | Environment configs | ⚠️ |
| gameZones.tsx | Game zone definitions | ⚠️ |
| liveZones.tsx | Live zone definitions | ⚠️ |
| marketZones.tsx | Market zone definitions | ⚠️ |
| rankingZones.tsx | Ranking zone definitions | ⚠️ |
| PageZones.ts | Page zone definitions | ⚠️ |
| FrameSlot.tsx | Frame slot component | ⚠️ |
| dataAdapters.ts | Data adapters | ⚠️ |
| assetPlacementManifest.ts | Asset positions | ⚠️ |

### home/experience
| File | Purpose | Status |
|---|---|---|
| HomeExperienceLayer.tsx | Experience layer (pointer-events) | ⚠️ |
| GenreOrbitEngine.tsx | Genre orbit animation | ✅ |
| ArtistFaceCard.tsx | Artist face card | ✅ |
| CrownDisplay.tsx | Crown display | ⚠️ |
| MagazineArtifactCanvas.tsx | Artifact canvas | ⚠️ |
| Top10FaceGrid.tsx | Top 10 face grid | ⚠️ |
| Top10RankList.tsx | Top 10 rank list | ⚠️ |
| Top10Rotator.tsx | Top 10 rotator | ⚠️ |
| TopArtistMotionPortrait.tsx | Artist motion portrait | ⚠️ |
| top10FaceData.ts | Top 10 data | ⚠️ |
| MotionTimingRegistry.ts | Motion timing | ⚠️ |

### artists
| File | Purpose | Status |
|---|---|---|
| ArtistPortalFace.tsx | Artist portal card | ✅ |

### genre-system
| File | Purpose | Status |
|---|---|---|
| (files not yet listed) | Genre switching system | ⚠️ |

### simulation
| File | Purpose | Status |
|---|---|---|
| (files not yet listed) | Simulation engine | ⚠️ |

---

## 4. LIB (src/lib/)

| File/Folder | Purpose | Status |
|---|---|---|
| navigationLock.ts | Navigation locking singleton | ✅ NEW |
| routeHistory.ts | Route history tracking | ✅ NEW |
| routeRegistry.ts | Route registry | ✅ |
| routes.ts | Route definitions | ✅ |
| routingState.ts | Routing state | ⚠️ |
| botRegistry.ts | Bot registry | ⚠️ |
| bots/botPopulation.generated.json | Generated bot population | ⚠️ exists — needs review |
| seeds/fullTestPopulation.generated.json | Test population (fans/artists/sponsors) | ⚠️ exists — needs review |
| hosts/hostEngine.ts | Host engine | ⚠️ exists — Tiana/Michael not assigned |
| hudRegistry.ts | HUD registry | ⚠️ |
| rewardBundle.ts | Reward bundles | ⚠️ |
| rewards/ | Reward logic | ⚠️ |
| magazine/ | Magazine lib | ⚠️ |
| engine/ | Engine lib | ⚠️ |
| artists/ | Artist lib | ⚠️ |
| auth/authOptions.ts | Auth config | ⚠️ |
| prismaClient.ts | DB client | ⚠️ |
| stripe/ | Stripe payments | ⚠️ |
| venue/ | Venue lib | ⚠️ |
| inventory/ | Inventory lib | ⚠️ |
| homepage/ | Homepage lib | ⚠️ |
| homepageAdmin/ | Homepage admin lib | ⚠️ |
| security/ | Security lib | ⚠️ |
| ctaContractMap.ts | CTA contract map | ⚠️ |

---

## 5. TESTS (src/tests/)

| Script | Purpose | Status |
|---|---|---|
| check-route-integrity.mjs | Route integrity audit | ✅ PASSING (0 unresolved) |
| check-home1-artifact-routes.mjs | Home1 artifact route check | ✅ PASSING |
| (Playwright smoke) | Full click chain tests | ⚠️ partial — needs expansion |

---

## 6. KNOWN BROKEN / LOOSE CHAINS

1. `/admin` page — OverseerDeck not mounting (port 3001 issue — must verify at 3000)
2. `/artists/[slug]` — text-only, no magazine UI
3. Home2/3/4 — ArtifactSystem files exist but pages may not use them
4. `hostRegistry.ts` — Tiana and Michael Gregory NOT assigned
5. Back-navigation — `routeHistory.ts` exists but no back button in artist/admin pages
6. `HomeExperienceLayer.tsx` — pointer-events: global rule NOT enforced
7. `liveFeedBus.ts` — socket ws://localhost:8080 not running (non-blocking)
8. Signup page — single generic form, not forked for fan/performer/sponsor/advertiser
9. Avatar builder — route exists but Record Ralph customization not implemented
10. Season pass — tier visual not implemented

---

## 7. TOTAL COUNT

| Category | Total | ✅ Usable | ⚠️ Partial | ❌/🔲 Broken/Placeholder |
|---|---|---|---|---|
| App Routes | ~140 | 8 | ~110 | ~22 |
| Components | ~90 | 5 | ~70 | ~15 |
| Packages/Engines | ~40 | 8 | ~30 | ~2 |
| Lib/Utilities | ~35 | 5 | ~28 | ~2 |
| Test Scripts | 3 | 2 | 1 | 0 |
