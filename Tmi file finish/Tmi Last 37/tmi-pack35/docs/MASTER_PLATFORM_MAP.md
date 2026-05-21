# MASTER_PLATFORM_MAP.md
## The Complete Platform — Every System, Every Route, Every World
### BerntoutGlobal LLC / The Musician's Index

*"This is your stage, be original."*

---

## THE 4 HOME WORLDS

| World | Name | Vibe | Route |
|---|---|---|---|
| **Home 1** | Magazine Cover / Crown | 80s magazine cover, weekly cyphers, crown winner, voting | `/` |
| **Home 2** | Magazine Dashboard | Editorial belts, discovery, marketplace, genre hexagons | `/editorial` |
| **Home 3** | Live World | Command center, lobby wall, premieres, cypher arena | `/lobby` |
| **Home 4** | Advertisers & Sponsors | Times Square + Ads Manager, placements, analytics, deals | `/advertise` |

Navigation: **[ 1 ] [ 2 ] [ 3 ] [ 4 ]** — persistent in every top nav.

---

## HOME 1 VISUAL SPEC (from magazine images)

**Center:** Crown winner in large portrait card with golden border + pulsing glow. Rank #1 label in gold Bebas Neue.

**Surrounding cards (positions 2-7):** Artist portraits in hexagon/polygon 80s magazine shapes. Each card shows:
- Rank number in gold Bebas Neue (bottom left)
- LIVE badge if currently streaming
- Genre label
- Lightning bolt decorative elements

**Animations (bots-driven):**
- Crown pops onto #1 artist's head every time ranking updates (3s animation, then removes)
- Cards can shuffle when ranking changes (Hype Bot triggers)
- Confetti + stars when new crown winner announced
- "VOTING LIVE | CROWN UPDATING IN REAL-TIME..." ticker

**Bottom strip:** "Weekly Cyphers! Who took the crown this week?" in 80s brush font

**Live tickers:** "HYPE BOT: ARTIST #5 MOVING UP!", "CYPHER ARENA OPEN", "VOTING OPEN: VOTE FOR #4!", "STREAM & WIN"

---

## HOME 2 VISUAL SPEC

**Editorial Belt (Content):**
- Article Feature (large portrait card) — "A Deep Dive into Indie Rock"
- Music News (scrolling ticker — LAST HOUR: headlines 1-4)
- Interviews ("THE INDEX SPEAKS: Interview with...")
- Studio Recaps ("CYPHER HIGHLIGHTS: WEEKLY WRAP-UP")

**Discovery Belt (Curation):**
- Genre Cluster (hexagonal honeycomb) — HIP HOP, POP, ROCK, R&B, JAZZ, ELECTRONIC
- Top 10 Charts (numbered list, Artist + genre + headline)
- Weekly Playlists — "INDEX PICKS" card (gold border)
- A-Z Artist Directory Link

**Platform & Marketplace Belt:**
- THE STORE — Featured merch image
- BOOKING PORTAL — "Venues will listen. Venues and Olta Langos"
- MY ACHIEVEMENTS — "CURRENT SCORE: 850 pts"
- SPONSOR SPOTLIGHT — "with High-end Ad / POWERED BY: [RETRO LOGO]"

---

## HOME 3 VISUAL SPEC

**Live World (Activity Belt):**
- MAIN PREVIEW LOBBY — Large video card with ON AIR / LIVE badge
- LOBBY WALL — 4x2 grid of live room thumbnails with LIVE badges and numbered ranks
- JOIN RANDOM ROOM — Star-shaped CTA button (pink→purple gradient)

**Discovery Belt (Trends & Events):**
- WORLD PREMIERES — "An upcoming exclusive drop" + countdown timer `01:14:32:05`
- EVENT CALENDAR — Color-coded: Concerts (pink), Saturday (cyan), Wednesday (gold)
- UNDISCOVERED BOOST — "New Artist of the Day!" (0 viewers = position 1 rule)
- CYPHER ARENA GATEWAY — "Go to active 1v1 battle rooms"
- STREAM & WIN — "Score: 0:50" display

---

## HOME 4 VISUAL SPEC (Advertisers & Sponsors World)

**Premium Ads Spotlight Belt:**
- Main sponsor billboard with "YOUR BRAND HERE — FEATURED CAMPAIGNS"
- "Luxury C218 ad." car image example
- Sponsored Artist Pre-roll card
- Brand Takeover Banner (full-width premium slot)
- Interactive Ad Card (product card with click)

**Advertising Marketplace Belt:**
- BUY AD PLACEMENT button
- CAMPAIGN BUILDER — "LAUNCH A NEW EFFORT"
- AUDIENCE TARGETING — "SEGMENT YOUR REACH"
- GENRE TARGETING
- Event/Cypher/Livestream/Issue Sponsorships — all with "SIGN IN / CREATE ACCOUNT"
- JOIN US TO PLUG YOUR PRODUCT banner

**Inventory & Placements Belt (Blueprinted):**
- Homepage Banner Slots / Article Page Ads / Artist Profile Ads / Live Room Overlays
- Video Pre-roll / Video Mid-roll / Sponsored Cards / Sponsor Belts
- Newsletter Ads / Push Notification Ads / Email Ads / Store Placement Ads

**Analytics & Performance Belt:**
- Impressions (1.2M+) / Clicks (35K+) / Engagement (12%) / Watch Time (Avg. 1:45)
- Conversions/Sales / ROI (150% Avg.) / Audience Demographics / Heatmaps / Top Performing Ads

**Deals & Contracts Belt:**
- Brand Deals / Sponsorship Offers / Artist Partnerships / Venue Partnerships / Event Sponsors
- Contract Manager / Payment Tracking / Revenue Share

---

## COMPLETE ROUTE MAP (130+ routes)

### Public
```
/ (Home 1 — Magazine Cover)
/editorial (Home 2 — Magazine Dashboard)
/lobby (Home 3 — Live World)
/advertise (Home 4 — Sponsors & Advertisers)
/magazine, /magazine/news, /magazine/interviews, /magazine/reviews
/magazine/trending, /magazine/local, /magazine/events
/articles, /articles/[slug]
/news, /news/[slug]
/artists, /artists/[slug]
/stations, /stations/[slug] + 8 sub-routes
/live, /live/stage, /live/backstage, /live/chat, /live/replay
/lobby/rooms, /lobby/party, /lobby/room/[id]
/contest, /contest/[id] + 6 sub-routes
/games, /games/[type]/[sessionId]
/cypher, /cypher/[battleId]
/beats (Beat Marketplace)
/clips, /clips/[id], /clips/highlights
/archive, /replay/[id]
/shows, /shows/[id]
/hall-of-fame
/search, /discover, /explore, /trending, /recommended
/store, /shop/[creatorSlug], /products/[slug]
/sponsors, /sponsors/local, /sponsors/tasks
/advertisers, /advertisers/[id]
/stores, /stores/[slug]
/advertise/packages, /advertise/homepage, /advertise/articles, /advertise/shows
```

### Auth
```
/login, /register, /register/artist, /register/fan, /register/sponsor
/onboarding/admin, /onboarding/artist, /onboarding/fan
/forgot-password, /verify-email/[token]
```

### Dashboard
```
/dashboard/artist (+ 12 sub-routes: earnings, payouts, station, clips, sponsors, etc.)
/dashboard/fan, /dashboard/admin
/dashboard/advertiser (+ 5 sub-routes)
/wallet, /earnings, /payouts, /credits, /notifications, /settings
```

### Admin (40+ routes)
```
/admin/command-center (6-panel HUD)
/admin/finance/profit (Big Ace approve weekly distribution)
/admin/campaigns, /admin/slots, /admin/approvals
/admin/bots, /admin/pipelines, /admin/feature-flags
/admin/moderation, /admin/health
/admin/emergency
```

---

## EVERY SYSTEM — STATUS TABLE

| System | Pack | Status |
|---|---|---|
| TMI Design Tokens | 32 | ✅ built |
| Homepage (Home 1–3) | 32 | ✅ built |
| Magazine Entry Scene | 32 | ✅ built |
| Home 4 (Advertisers) | **35** | ✅ built |
| WorldSwitcher [1][2][3][4] | **35** | ✅ built |
| Scene Registry (18 scenes) | 32 | ✅ built |
| Bot Registry (35 bots) | 32 | ✅ built |
| Bot Orchestrator | **35** | ✅ built |
| Pipeline Registry (9) | 32 | ✅ built |
| Tier Engine (6 levels) | 33 | ✅ built |
| Page Zone Registry (30+ zones) | 33 | ✅ built |
| Freshness Engine | 33 | ✅ built |
| Earnings Coaching Engine (10 notes) | 33 | ✅ built |
| Artist Creation Chain | 33 | ✅ built |
| Article Publish Chain | 33 | ✅ built |
| Live Show Chain | 33 | ✅ built |
| Sponsor Campaign Chain | 33 | ✅ built |
| TMI Core Components | 34 | ✅ built |
| AdRenderer (always 200) | 34 | ✅ built |
| EarningsPanel | 34 | ✅ built |
| SponsorCoachingSticky | 34 | ✅ built |
| Admin Command Center (6-panel HUD) | 34 | ✅ built |
| Beat Marketplace | 34 | ✅ built |
| Hall of Fame | 34 | ✅ built |
| Deals & Advertiser Chain | **35** | ✅ built |
| Avatar Lab | scaffold | ⚠️ shell only |
| Face Scan / Biometrics | planned | 🔵 future |
| 3D Stadium / Audience | planned | 🔵 future |
| AI Broadcaster | planned | 🔵 future |
| Creator Store / Commerce | flagged OFF | 🔵 future |

---

## THE 35 BOTS — FULL REGISTRY

### Content (6)
cover-generator, editorial-assembly, homepage-rotation, featured-story, article-freshness, headline-ticker

### Monetization (13)
sponsor-matching, sponsor-reminder, local-sponsor-match, ad-placement, ad-rotation, brand-safety, ctr-optimizer, renewal, house-ad-fallback, prospect-scout, outreach, proposal, campaign-expiration

### Discovery (3)
clip-highlight, trending, recommendation

### Competition (3)
contest-ops, leaderboard, ranking

### Platform (9)
notification, timeline, search-index, moderation, fraud-sentinel, analytics, payout, billing-integrity, owner-finance

### Ops (4)
media-qc, scene-preset, station-activity, backup, health-monitor

---

## THE 18 SCENES

magazine, profile, station, live-stage, lobby, contest-arena, sponsor-showcase, admin-command, studio, backstage, neon-club, rooftop-city, underground-cypher, concert-arena, space-dome, beach-festival, virtual-grid, game-night

---

## THE 6 TIERS

| Tier | Price | Discovery Weight | Ranking Boost |
|---|---|---|---|
| Free | $0 | 1.0× | +0 |
| Starter | $4.99/mo | 1.2× | +5 |
| Pro | $12.99/mo | 1.5× | +15 |
| Gold | $24.99/mo | 2.0× | +30 |
| Platinum | $49.99/mo | 2.5× | +50 |
| **Diamond** | **FREE FOREVER** | **3.0×** | **+100** |

**Permanent Diamond:** Marcel Dickens (berntmusic33@gmail.com) + B.J. M Beat's. Hardcoded. Verified every 4 hours by billing-integrity-bot. Never revoked.

---

## THE 15 PLATFORM LAWS

1. **Discovery-first:** 0 viewers = position 1 in lobby ALWAYS
2. **Permanent Diamond:** Marcel Dickens + B.J. M Beat's — forever
3. **Kids only talk to kids** — canSendMessage() on all message flows
4. **Max 8 tickets** per buyer per event
5. **Owner payouts from NET PROFIT only** — never gross
6. **TMI visual identity:** #0D0520, Bebas Neue, cyan/gold/pink — NEVER generic SaaS
7. **GET /api/ads/slot/:id ALWAYS returns 200** — never blank
8. **Party persists** when members enter/exit rooms
9. **Article pages ALWAYS link to artist station**
10. **"Stations" not "Channels"** in all public UI
11. **Coaching sticky notes** on artist dashboard
12. **No system should break another system** — isolated modules only
13. **If a page exceeds 5 major zones, create child routes**
14. **Artist articles auto-create** on profile completion
15. **Freshness engine** prevents same content repeating on same surface

---

## THE LOCAL SPONSOR LOOP (Core Business Model)

```
Local store → sponsors artist → artist promotes store
→ community discovers store → store renews → artist earns more → everyone wins
```

**The win-win in code:**
- `sponsor-matching-bot` pairs local businesses with local artists (same city + genre match)
- Artist receives coaching sticky: "Thank your sponsor this week"
- Artist completes promo tasks → store sees analytics at `/stores/[slug]/analytics`
- `renewal-bot` fires 7 days before campaign ends with 5% loyalty discount offer
- Artist earnings increase → earnings panel updates → platform grows

---

## COMPLETE DELIVERY — ALL 10 PACKS + PACK 35

| Pack | Files | Primary Contribution |
|---|---|---|
| 25 | 21 | API contracts, Prisma 49+ models, WebSocket, Stripe, kid safety |
| 26 | 18 | Owner finance (Marcel+Jay Paul), payouts, go-live signoff |
| 27 | 6 | Import order, conflict matrix, smoke tests |
| 28 | 11 | UI design system (from PDFs), homepage belts, monetization |
| 29 | 13 | File placement, state machines, permissions, 9-slice wiring order |
| 30 | 4 | Pre-flight checklist, shell commands, rollback |
| 31 | 109 | 6 fixed corrupted files + 98-page platform scaffold |
| 32 | 12 | Full homepage (all 6 belts), magazine entry, system registries |
| 33 | 10 | Tier engine, page zones, freshness, coaching, 4 full chains |
| 34 | 21 | Core components, API stubs, Admin HUD, beats, hall of fame |
| **35** | **7** | **Home 4, WorldSwitcher, BotOrchestrator, Master Platform Map** |
| **TOTAL** | **232** | **Complete TMI platform architecture** |

---

## FUTURE SYSTEMS (Scaffolded, Not Yet Active)

These are planned, feature-flagged OFF, or future phases:

- **Avatar Lab + Bobblehead System** — avatar-lab route exists as shell
- **Face Scan / Biometric Engine** — `/packages/biometrics/` (future)
- **3D Stadium Audience Engine** — `/packages/simulation/` (future)
- **AI Broadcaster + Personalities** — `/bots/broadcast/` (future)
- **Creator Store / Digital Sales** — flagged `enableCreatorStore: false`
- **NFT / Blockchain** — not planned for MVP
- **Daily Spin + Loot Drops** — designed, not yet wired
- **Haptic Bridge** — mobile haptics on bass drops (future)
- **CRT/VHS Overlay Toggle** — designed in scene system (future CSS filter)
- **Voice Cloning** — broadcaster voice system (future AI integration)

---

## HANDOFF ORDER (THE CORRECT SEQUENCE)

```
1. Blackbox → pack31/fix/  (corrupted onboarding files)
2. Blackbox → pack31/scaffold/  (all platform pages)
3. Blackbox → pack32/magazine/  (homepage + magazine entry)
4. Blackbox → pack34/components/  (design system + AdRenderer)
5. Blackbox → pack35/pages/home4/  (Advertisers world)
6. Blackbox → pack35/components/WorldSwitcher.tsx
7. Copilot → pack29 wiring order (9 slices, proof between each)
8. Gemini → pack30 audit checklist
9. pnpm test:discovery → MUST PASS
10. You → visual check all 4 home worlds
11. Deploy → onboard → bots activate
```

*BerntoutGlobal LLC — "This is your stage, be original."*
