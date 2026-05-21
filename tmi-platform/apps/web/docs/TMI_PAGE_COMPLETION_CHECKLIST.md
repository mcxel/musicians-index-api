# TMI PAGE COMPLETION CHECKLIST
> Generated: April 23, 2026 | Check off each page as PDF-matched, wired, and verified

---

## HOW TO USE
- [ ] = not started
- [~] = in progress / partial
- [x] = PASS — PDF-matched, wired, verified

---

## HOMEPAGE CHAIN

### Home1 — /home/1 (Cover + Orbit)
- [x] Artist orbit frames render
- [x] Artist portrait click → /artists/:slug (VERIFIED April 23)
- [x] Navigation dots wired (HomeNavigator)
- [ ] Genre orbit labels clickable → genre filter
- [x] Global pointer-events rule added (globals.css)
- [ ] Burst animation fires AFTER genre transition (not before)
- [ ] 1980s background canvas styled correctly
- [ ] Back navigation available

### Home1-2 — /home/1-2 (Magazine Open Spread)
- [ ] Magazine-open transition triggers from Home1
- [ ] Left page: artist portrait rendered with real data
- [ ] Left page: LIVE button → /live/:slug
- [ ] Right page: genre chart entries clickable
- [ ] Right page: trending tracks clickable
- [ ] Right page: weekly crown clickable → /artists/:slug
- [ ] Navigation arrows wired (prev/next)
- [ ] Back → /home/1

### Home2 — /home/2 (Live World)
- [ ] Home2ArtifactSystem rendering in page
- [ ] Featured artist card → /artists/:slug
- [ ] Live rooms grid (4–6 cards) → /live/:roomId
- [ ] GoingLive countdown strip created and wired
- [ ] Genre filter tabs functional
- [ ] Trending now rail → /artists/:slug
- [ ] Sponsor strip → /sponsor/:slug
- [ ] Back → /home/1, Forward → /home/3

### Home3 — /home/3 (Genre Browse + Charts)
- [ ] Home3ArtifactSystem rendering in page
- [ ] Genre tiles grid (6–8 tiles) → /genres/:slug
- [ ] Top 10 chart strip entries → /artists/:slug
- [ ] New releases row → /releases/:slug
- [ ] News/editorial strip → /articles/:slug
- [ ] Trending artists row → /artists/:slug
- [ ] Battle results banner → /games/battle
- [ ] Back → /home/2, Forward → /home/4

### Home4 — /home/4 (Shows + Events + Billboard)
- [ ] Home4ArtifactSystem rendering in page
- [ ] Shows calendar strip → /shows/:slug
- [ ] Contest cards → /contests/:id
- [ ] Billboard rotator created and wired → /sponsor/:slug
- [ ] Store preview row → /store/:slug
- [ ] Season pass promo banner → /season-pass
- [ ] Advertiser spotlight → /advertiser/:slug
- [ ] Back → /home/3, Forward → /home/5

### Home5 — /home/5 (Leaderboard)
- [x] Artist cards render
- [x] Artist card click → /artists/:slug (VERIFIED April 23)
- [ ] Weekly/All-Time toggle functional
- [ ] Genre filter tabs functional
- [ ] Top 3 trophy/crown indicators
- [ ] Back → /home/4

---

## ADMIN CHAIN

### Admin Hub — /admin
- [x] OverseerDeck mounts and renders
- [x] HOME1–HOME5 feed cards visible
- [x] Chain Command panel visible
- [x] Live Feed Explorer visible
- [x] System Status bar at bottom
- [x] Navigation links to all sub-pages functional (btns > 0)
- [ ] Marcel link → /admin/marcel
- [ ] Jay Paul Sanchez link → /admin/jay-paul-sanchez
- [ ] Justin King link → /admin/justin-king

### Admin Leaderboards — /admin/leaderboards
- [x] Route resolves (VERIFIED April 23)
- [x] Link clickable

### Admin sub-pages
- [ ] /admin/marcel — role-aware feed + controls
- [ ] /admin/jay-paul-sanchez — admin feed access
- [ ] /admin/justin-king — admin feed access
- [x] /admin/route-health — present ✅
- [x] /admin/style-debug — present ✅
- [x] /admin/simulation — present ✅
- [x] /admin/observatory — present ✅

---

## ARTIST CHAIN

### Artist Profile — /artists/:slug
- [ ] Hero section (animated portrait, name, genre, verified)
- [ ] Stats bar (followers, plays, rank, XP)
- [ ] LIVE button → /live/:slug
- [ ] Article preview cards → /articles/:slug
- [ ] Booking module → /booking/artists/:slug
- [ ] Sponsor slots visible
- [x] Back button → getPreviousRoute() (Home1 or previous)
- [ ] No text-only placeholder

---

## SIGNUP CHAIN

### Signup — /signup
- [ ] Role selector: Fan / Performer / Sponsor / Advertiser
- [ ] Fan form: name, email, password, DOB, genre prefs
- [ ] Performer form: stage name, instrument, tier preview
- [ ] Sponsor form: company, budget, campaign interests
- [ ] Advertiser form: brand, ad formats, audience targeting
- [ ] All forms → POST /api/auth/signup
- [ ] Sign in link → /login

---

## SEASON PASS — /season-pass
- [ ] Bronze / Silver / Gold tier cards
- [ ] Feature list per tier
- [ ] Upgrade button → /billing → Stripe
- [ ] Current tier highlighted
- [ ] Exclusive access badges

---

## HOST REGISTRY
- [ ] Tiara in hostRegistry.ts → Monday Night Stage
- [ ] Michael Gregory in hostRegistry.ts → Battle of Bands, Yearly Contest
- [ ] Host 1–4 in hostRegistry.ts (pool)
- [ ] Julius in botRegistry.ts (helper bot)
- [ ] /shows/monday-night-stage page created
- [ ] /shows/battle-of-the-bands page created
- [ ] /shows/yearly-contest page created

---

## AVATAR BUILDER — /avatar-builder (Record Ralph)
- [ ] Skin tone selector (5 options)
- [ ] Accessory grid with locked/unlocked states
- [ ] Unlocked items equippable
- [ ] Locked items show unlock requirement
- [ ] SAVE button → POST /api/avatar/save
- [ ] Avatar preview renders with selections

---

## VENUE SKINS — /venues/skins
- [ ] Skin library populated (galaxy-lounge, xs-nightclub, festival, conference, outdoor-amp)
- [ ] Skin selector in venue designer
- [ ] Applied skin renders in DigitalVenueTwinShell
- [ ] Route /venues/brick-house created

---

## GAME SHOW SKINS
- [ ] Game show skin registry created (gameShowSkins.ts)
- [ ] Skins wired to game room render
- [ ] At least one skin per game type

---

## SPONSOR / ADVERTISER HUB
- [ ] Campaign builder UI
- [ ] Placement inventory grid
- [ ] Analytics charts (bar, pie, line)
- [ ] Contract section
- [ ] Payment tracking

---

## LIVE FEED (GLOBAL)
- [ ] liveFeedBus.ts publishing from all 5 home surfaces
- [ ] Role-aware access: owner/admin/observer
- [x] Admin feed visible at /admin
- [ ] Marcel/JPS/Justin feed access wired
- [ ] WebSocket fallback documented

---

## BOT / TEST POPULATION
- [ ] 60 test fans in fullTestPopulation
- [ ] 60 test artists in fullTestPopulation
- [ ] 60 test sponsors in fullTestPopulation
- [ ] 60 test advertisers in fullTestPopulation
- [ ] 60 test venues in fullTestPopulation
- [ ] All sandbox wallets start at zero
- [ ] /api/test/reset-wallets endpoint created
- [ ] No real transactions from test accounts

---

## PROOF GATE (FINAL)
- [x] `pnpm build` passes
- [x] `check-route-integrity.mjs` passes (0 unresolved)
- [ ] `check-home1-artifact-routes.mjs` passes
- [x] Playwright: /home/1 → artist click → /artists/:slug ✅
- [x] Playwright: /home/5 → leaderboard click → /artists/:slug ✅
- [ ] Playwright: /home/2 → live room click → /live/:roomId
- [ ] Playwright: /home/3 → genre tile click → /genres/:slug
- [ ] Playwright: /home/4 → contest click → /contests/:id
- [x] Playwright: /admin → OverseerDeck + feed cards visible
- [x] Playwright: /admin/leaderboards → clickable ✅
- [ ] Playwright: /artists/kai-drift → real UI (not text-only)
- [ ] Playwright: /signup → role selector present
- [ ] Playwright: back from /artists/:slug → returns to /home/1
- [x] No pointer-event interception anywhere
- [ ] No forced route overrides
- [ ] Zero placeholder pages without fallback label

---

## LAST UPDATED
	- April 23, 2026
	- Phase 1.5 COMPLETE — verified April 23
	- [x] /admin loads at port 3000 ← LOCKED
	- [x] OverseerDeck renders (OVERSEER DECK text present) ← LOCKED
	- [x] CHAIN COMMAND section renders ← LOCKED
	- [x] HOME 1–5 live feed text renders (HomeFeedObserver in OverseerDeck) ← LOCKED
	- [x] BackButton created + wired to artist page ← LOCKED
	- [x] BackButton moved into OverseerDeck header (always visible) ← LOCKED
	- [x] BackButton wired to admin/leaderboards page ← LOCKED
	- [x] Route Health link in admin nav bar ← LOCKED
	- [x] pointer-events safety rule added to globals.css ← LOCKED
	- [x] Route integrity audit: 0 unresolved ← LOCKED
	- [x] TypeScript errors in Phase 1 files: 0 ← LOCKED
	- Pre-existing TS errors: 11 (all outside Phase 1 files, not caused by our changes)
	- [x] Unified Admin Overseer System merged (top/left/center/right/bottom layers) ← LOCKED
	- [x] Live system cards (6) clickable + updating every 3s ← LOCKED
	- [x] Feed fields visible: phase, genre, featuredId, timestamp + disconnected fallback ← LOCKED
	- Open items: remaining checkboxes pending Phase 2+
