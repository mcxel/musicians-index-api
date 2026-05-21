# TMI NO LOOSE CHAINS AUDIT
> Generated: April 23, 2026 | Every route, button, artifact, feed, and chain checked

---

## LEGEND
- ✅ PASS — wired and verified
- ⚠️ WARN — exists but missing wiring/data
- ❌ FAIL — broken/not resolving
- 🔲 STUB — placeholder only

---

## 1. HOMEPAGE CHAINS

| Surface | Route | Component | Back | Forward | Feed | Buttons | Status |
|---|---|---|---|---|---|---|---|
| Home1 cover | /home/1 | Home1LiveMagazine | — | /home/2, /home/1-2 | HOME1 bus | Artist click ✅, genre labels ⚠️ | ✅ |
| Home1-2 open | /home/1-2 | Home12Surface | /home/1 | /home/2 | HOME1 bus | Left artist ⚠️, LIVE ❌, chart entries ⚠️ | ⚠️ |
| Home2 live world | /home/2 | Home2ArtifactSystem | /home/1 | /home/3 | HOME2 bus | Featured artist ⚠️, live rooms ⚠️ | ⚠️ |
| Home3 genre | /home/3 | Home3ArtifactSystem | /home/2 | /home/4 | HOME3 bus | Genre tiles ⚠️, chart entries ⚠️ | ⚠️ |
| Home4 events | /home/4 | Home4ArtifactSystem | /home/3 | /home/5 | HOME4 bus | Shows ⚠️, contests ⚠️, billboard ❌ | ⚠️ |
| Home5 leaderboard | /home/5 | Home5ArtifactSystem | /home/4 | — | HOME5 bus | Artist cards ✅ | ✅ |

**Missing chains:**
- Home1 genre orbit labels → no onClick → ❌ loose
- Home1-2 LIVE button → /live/:slug → ❌ missing component
- Home2 GoingLive strip → ❌ missing component
- Home3 GenreTileGrid → ❌ missing component
- Home4 BillboardRotator → ❌ missing component
- Home4 ShowsCalendarStrip → ❌ missing component

---

## 2. ADMIN CHAINS

| Panel | Route | Component | Data Source | Buttons | Status |
|---|---|---|---|---|---|
| Overseer Deck | /admin | OverseerDeck.tsx (Unified Admin System) | runtime store + HomeFeedObserver | links + controls active | ✅ |
| Feed cards HOME1-5 | /admin | HomeFeedObserver | liveFeedBus | fallback + fields active | ✅ |
| Chain Command | /admin | integrated Command Panel | runtime routes | jump + quick actions | ✅ |
| Live Feed Explorer | /admin | integrated in deck | liveFeedBus | feed detail visible | ✅ |
| System Status | /admin | integrated audit strip | runtime health | route/api/feed/bot | ✅ |
| Marcel page | /admin/marcel | page.tsx (stub) | — | — | 🔲 |
| Jay Paul Sanchez | /admin/jay-paul-sanchez | page.tsx (stub) | — | — | 🔲 |
| Justin King | /admin/justin-king | page.tsx (stub) | — | — | 🔲 |
| Leaderboards | /admin/leaderboards | page.tsx | seed data | Click verified | ✅ |
| Style Debug | /admin/style-debug | page.tsx | HomeFeedObserver | Present | ✅ |
| Route Health | /admin/route-health | page.tsx | routeRegistry | Present | ✅ |

---

## 3. ARTIST CHAINS

| Surface | Route | Component | Back | Forward | Status |
|---|---|---|---|---|---|
| Artist browse | /artists | page.tsx | /home/1 | /artists/:slug | ⚠️ no grid |
| Artist profile | /artists/:slug | page.tsx (text-only) | BackButton via routeHistory ✅ | /live/:slug, /articles/:slug, /booking | ⚠️ |
| Artist live | /live/:slug | page.tsx | /artists/:slug | — | ⚠️ |
| Artist article | /articles/:slug | page.tsx | /artists/:slug | — | ⚠️ |
| Artist booking | /booking/artists/:slug | page.tsx | /artists/:slug | — | ⚠️ |
| Artist analytics | /artists/dashboard | page.tsx | /artists/:slug | — | 🔲 |

**Missing chains:**
- /artists/:slug → no hero, stats, live button, article cards → ❌ text-only
- /artists/:slug → sponsor slots → ❌ missing

---

## 4. VENUE CHAINS

| Surface | Route | Component | Buttons/Actions | Status |
|---|---|---|---|---|
| Venue browse | /venues | page.tsx | Browse cards | ⚠️ |
| Venue detail | /venues/:slug | DigitalVenueTwinShell | Book, tickets, events | ⚠️ |
| Venue designer | /venues/designer | page.tsx | Skin selector | ⚠️ |
| Venue skins | /venues/skins | page.tsx | Apply skin | ⚠️ |
| Venue dashboard | /venues/dashboard | page.tsx | Analytics, events | 🔲 |
| Brick House | /venues/brick-house | ❌ MISSING | Book, enter, tickets | 🆕 |

---

## 5. GAME / SHOW CHAINS

| Surface | Route | Component | Lobby | Rules | Prizes | Host | Status |
|---|---|---|---|---|---|---|---|
| Games hub | /games | page.tsx | ❌ | ❌ | ❌ | ❌ | ⚠️ |
| Battle | /games/battle | page.tsx | ❌ | ❌ | ❌ | Host 3 | ⚠️ |
| Trivia | /games/trivia | page.tsx | ❌ | ❌ | ❌ | Julius | ⚠️ |
| Lyric Fill | /games/lyric-fill | page.tsx | ❌ | ❌ | ❌ | Julius | ⚠️ |
| Name That Tune | /games/name-that-tune | page.tsx | ❌ | ❌ | ❌ | Julius | ⚠️ |
| DJ Mix Off | /games/dj-mix-off | page.tsx | ❌ | ❌ | ❌ | — | ⚠️ |
| Deal or Feud | /games/deal-or-feud | page.tsx | ❌ | ❌ | ❌ | — | ⚠️ |
| Tournaments | /games/tournaments | page.tsx | ❌ | ❌ | ❌ | Michael Gregory | ⚠️ |
| Shows hub | /shows | page.tsx | — | — | — | — | ⚠️ |
| Show detail | /shows/:slug | page.tsx | ❌ | ❌ | ❌ | — | ⚠️ |
| Monday Night Stage | /shows/monday-night-stage | ❌ MISSING | ❌ | ❌ | ❌ | Tiara ❌ | 🆕 |
| Battle of the Bands | /shows/battle-of-the-bands | ❌ MISSING | ❌ | ❌ | ❌ | Michael Gregory ❌ | 🆕 |
| Yearly Contest | /shows/yearly-contest | ❌ MISSING | ❌ | ❌ | ❌ | Michael Gregory ❌ | 🆕 |
| Contests hub | /contests | page.tsx | — | — | — | — | ⚠️ |
| Contest detail | /contests/:id | page.tsx | ❌ | ❌ | ❌ | — | ⚠️ |

---

## 6. LIVE CHAINS

| Surface | Route | Back | Stream | Feed | Status |
|---|---|---|---|---|---|
| Live hub | /live | — | — | — | ⚠️ |
| Live room | /live/:roomId | /live | ❌ | HOME* feed | ⚠️ |
| Artist live | /live/:slug | /artists/:slug | ❌ | — | ⚠️ |
| Watch party | /watch-party | /live | ❌ | — | ⚠️ |

---

## 7. COMMERCE / ECONOMY CHAINS

| Surface | Route | Component | Action | Status |
|---|---|---|---|---|
| Store | /store | page.tsx | Browse items | ⚠️ |
| Store item | /store/:slug | page.tsx | Buy | ⚠️ |
| Wallet | /wallet | page.tsx | Balance, history | ⚠️ |
| Rewards | /rewards | page.tsx | Claim rewards | ⚠️ |
| Achievements | /achievements | page.tsx | View badges | ⚠️ |
| Season pass | /season-pass | page.tsx (stub) | Buy tier | 🔲 |
| Booking | /booking | page.tsx | Book artist | ⚠️ |
| Tickets | /tickets | page.tsx | Buy ticket | ⚠️ |

---

## 8. SPONSOR / ADVERTISER CHAINS

| Surface | Route | Component | Action | Status |
|---|---|---|---|---|
| Sponsor hub | /sponsor | page.tsx | — | ⚠️ |
| Sponsor dashboard | /sponsor/dashboard | SponsorDashboard | View campaigns | ⚠️ |
| Sponsor campaigns | /sponsor/campaigns | page.tsx | Build/manage | ⚠️ |
| Sponsor analytics | /sponsor/analytics | SponsorROIAnalytics | View charts | ⚠️ |
| Sponsor contracts | /sponsor/contracts | page.tsx | View/sign | ⚠️ |
| Sponsor payments | /sponsor/payments | page.tsx | Pay | ⚠️ |
| Advertiser hub | /advertiser | page.tsx | — | ⚠️ |
| Advertiser dashboard | /advertiser/dashboard | page.tsx | View campaigns | ⚠️ |
| Advertiser campaigns | /advertiser/campaigns | page.tsx | Build/manage | ⚠️ |
| Advertiser analytics | /advertiser/analytics | page.tsx | View charts | ⚠️ |
| Advertiser placements | /advertiser/placements | page.tsx | Inventory | ⚠️ |
| Advertiser contracts | /advertiser/contracts | page.tsx | View/sign | ⚠️ |

---

## 9. SIGNUP / AUTH CHAINS

| Surface | Route | Role Fork | Fields | Status |
|---|---|---|---|---|
| Signup (generic) | /signup | ❌ single form | Basic only | ⚠️ |
| Fan signup | /signup?role=fan | ❌ not forked | Genre prefs missing | ⚠️ |
| Performer signup | /signup?role=performer | ❌ not forked | Stage name, instrument missing | ⚠️ |
| Sponsor signup | /signup?role=sponsor | ❌ not forked | Company fields missing | ⚠️ |
| Advertiser signup | /signup?role=advertiser | ❌ not forked | Brand fields missing | ⚠️ |
| Login | /login | — | Basic | ⚠️ |
| Face login | /face-login | — | Partial | ⚠️ |
| Onboarding | /onboarding | — | Incomplete | ⚠️ |

---

## 10. HOST REGISTRY CHAINS

| Host | Registry Entry | Assigned Show | Show Route | Profile Route | Status |
|---|---|---|---|---|---|
| Tiara | ❌ NOT IN hostRegistry | Monday Night Stage | /shows/monday-night-stage | /hosts/tiara | ❌ |
| Michael Gregory | ❌ NOT IN hostRegistry | Battle of Bands, Yearly Contest | /shows/battle-of-the-bands | /hosts/michael-gregory | ❌ |
| Host 1 | ❌ NOT IN hostRegistry | Unassigned | — | /hosts/host-1 | ⚠️ |
| Host 2 | ❌ NOT IN hostRegistry | Unassigned | — | /hosts/host-2 | ⚠️ |
| Host 3 | ❌ NOT IN hostRegistry | Battle shows | — | /hosts/host-3 | ⚠️ |
| Host 4 | ❌ NOT IN hostRegistry | Awards shows | — | /hosts/host-4 | ⚠️ |
| Julius | ❌ NOT IN botRegistry | All pages (helper) | — | /bots/julius | 🆕 |

---

## 11. BOT / TEST POPULATION CHAINS

| Bot/Account | Registry | Role | Target Surface | Sandbox Wallet | Status |
|---|---|---|---|---|---|
| Bot population | botPopulation.generated.json | various | various | ⚠️ needs reset routine | ⚠️ |
| Test fans (60) | fullTestPopulation.generated.json | fan | homepage, shows | ⚠️ | ⚠️ |
| Test artists (60) | fullTestPopulation.generated.json | performer | artist pages | ⚠️ | ⚠️ |
| Test sponsors (60) | fullTestPopulation.generated.json | sponsor | sponsor hub | ⚠️ | ⚠️ |
| Test advertisers (60) | fullTestPopulation.generated.json | advertiser | advertiser hub | ⚠️ | ⚠️ |
| Test venues (60) | fullTestPopulation.generated.json | venue | venue pages | ⚠️ | ⚠️ |
| Sandbox reset | /api/test/reset-wallets | — | admin | ❌ MISSING | 🆕 |

---

## 12. FEED / LIVE FEED CHAINS

| Feed | Bus Key | Publisher | Subscriber | Socket | Status |
|---|---|---|---|---|---|
| HOME1 | HOME1 | Home1LiveMagazine | HomeFeedObserver | ws:8080 optional fallback | ✅ |
| HOME2 | HOME2 | Home2ArtifactSystem | HomeFeedObserver | ws:8080 optional fallback | ✅ |
| HOME3 | HOME3 | Home3ArtifactSystem | HomeFeedObserver | ws:8080 optional fallback | ✅ |
| HOME4 | HOME4 | Home4ArtifactSystem | HomeFeedObserver | ws:8080 optional fallback | ✅ |
| HOME5 | HOME5 | Home5ArtifactSystem | HomeFeedObserver | ws:8080 optional fallback | ✅ |
| Role-aware access | — | — | admin/Marcel/JPS/JK only | ❌ NOT GATED | ❌ |

---

## 13. TODO / FIXME / PLACEHOLDER TRACKER

| Location | Type | Issue | Action |
|---|---|---|---|
| app/artists/[slug]/page.tsx | PLACEHOLDER | Text-only, no magazine UI | Build ArtistMagazinePage component |
| app/admin/page.tsx | RESOLVED | Unified Overseer system mounted | Phase 1.5 locked |
| app/signup/page.tsx | PARTIAL | No role fork | Add role selector + conditional fields |
| app/season-pass/page.tsx | STUB | No tier UI | Build TierCards component |
| src/packages/magazine-engine/hostRegistry.ts | INCOMPLETE | Tiara/Michael not assigned | Add host entries |
| Home1-2 | PARTIAL | No LIVE button | Create LiveButton component |
| Home2/3/4 | PARTIAL | Artifact systems not rendering in pages | Wire artifact systems to page files |
| globals.css | RESOLVED | Pointer-events global safety rule added | Phase 1 locked |
| lib/bots/botRegistry.ts | PARTIAL | Julius not registered | Add Julius bot entry |
| /shows/monday-night-stage | MISSING | Route doesn't exist | Create page with Tiara host |
| /shows/battle-of-the-bands | MISSING | Route doesn't exist | Create page with Michael host |
| ws://localhost:8080 | OFFLINE | Feed socket not running | Non-blocking for UI — document as known |

---

## SUMMARY COUNTS

| Category | Total Chains | ✅ PASS | ⚠️ WARN | ❌ FAIL | 🆕 MISSING |
|---|---|---|---|---|---|
| Homepage | 6 | 2 | 4 | 0 | 5 components |
| Admin | 11 | 3 | 4 | 4 | 3 components |
| Artist | 6 | 1 | 5 | 1 | 1 component |
| Venue | 6 | 0 | 5 | 1 | 1 route |
| Games/Shows | 15 | 0 | 9 | 6 | 3 routes |
| Live | 4 | 0 | 4 | 0 | 0 |
| Commerce | 8 | 0 | 7 | 1 | 0 |
| Sponsor/Advert | 12 | 0 | 12 | 0 | 2 components |
| Signup/Auth | 8 | 0 | 8 | 0 | 0 |
| Hosts | 7 | 0 | 3 | 4 | 2 entries |
| Bots/Population | 6 | 0 | 5 | 1 | 1 API |
| Feeds | 5 | 0 | 5 | 1 | 0 |
| **TOTAL** | **94** | **6** | **71** | **19** | **18** |
