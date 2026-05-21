# MASTER LAUNCH EXECUTION BOARD

## Mission
Activate TMI from certified backend readiness into controlled live operation, trusted beta, then public growth.

This board converts vision into execution: who does what, in what order, with clear exit gates.

## Source Of Truth Inputs
- Visual and ecosystem backlog: BLACKBOX_MASTER_VISUAL_AND_SYSTEM_TODO.md
- Brand and layout references:
  - Tmi PDF's/The Musician fini.pdf
  - Tmi PDF's/The Musician's Index Magazine images.pdf
  - Tmi PDF's/Tmi Homepage 1.jpg
  - Tmi PDF's/Tmi Homepage 2.png
  - Tmi PDF's/Tmi Homepage 3.png
  - Tmi PDF's/Tmi Homepage 4.png
  - Tmi PDF's/Tmi Homepage 5.png
  - Tmi PDF's/game show and venue skins/
  - Tmi PDF's/Venue Skins Plus Seating/
  - Tmi PDF's/Profiles/
  - Tmi PDF's/Host , Julius , and extra/

## Current Confirmed State
- Backend auth and security gates are green.
- Auth lifecycle is certified end-to-end.
- Security regression matrix is green.
- Current blocking work is frontend activation, especially homepage data wiring and visual transformation.
- Current public homepage state is structurally present but still displaying placeholder/demo copy in key sections.

## Scanned TMI Asset Families

### Homepage And Belt References
- Tmi Homepage 1.jpg: magazine cover / weekly crown / cypher poster composition.
- Tmi Homepage 2.png: editorial belt + discovery belt + marketplace belt.
- Tmi Homepage 3.png: live world belt + random room + event calendar + cypher gateway.
- Tmi Homepage 4.png: sponsor spotlight + advertiser marketplace + premium ads + deals/contracts.
- Tmi Homepage 5.png: advertisers and sponsors world + inventory placements + analytics/deals.

### Signup And Identity References
- Profiles/Fan Sign up.png
- Profiles/Performer Sign up.png
- Profiles/Advertiser Sign up.png
- Profiles/Sponsor Sign up.png
- Profiles/Advertiser and sponser hub.jpg
- Profiles/Adminisratation Hub.jpg
- Profiles/season Pass.jpg

### Host And Character References
- Host , Julius , and extra/Host 1.png ... Host 4.png
- Host , Julius , and extra/Julius.png
- Host , Julius , and extra/Bebo.jpg
- Host , Julius , and extra/Record Ralph.jpg
- Host , Julius , and extra/Tiana monday night stage host.jpg
- game show and venue skins/BobbleHead Avatar extras 1.jpg ... 3.jpg

### Stage, Show, Room, And Game References
- game show and venue skins: podium stages, deal-show sets, host desks, quiz walls, spotlight stages.
- Venue Skins Plus Seating: amphitheaters, arenas, theaters, lounges, pool venues, seating types, cinema views.

### Environmental Direction Extracted From Scan
- Neon-magazine HUD for homepage/admin/sponsor screens.
- Television game-show geometry for contest, cypher, deal-show, host, and podium scenes.
- Mixed venue strategy: outdoor amphitheater, luxury arena, theater house, lounge club, cinema, and premium seating.
- Character system should support hosts, mascots, avatars, bobble-head variants, and stylized presenters.

## Program Structure
- Track A: Platform Reliability
- Track B: User Access And Account Journeys
- Track C: Homepage, Magazine, Visual DNA
- Track D: Social, Rooms, Live Interaction
- Track E: Sponsors, Ads, Marketplace, Revenue
- Track F: Bots, Automation, Moderation
- Track G: Launch Ops, Monitoring, Incident Control

## Team Roles
- Product Commander: Marcel
- Technical Lead: API/web architecture, release decisions
- Frontend Visual Lead: homepage, magazine, rooms skinning, motion
- Backend Systems Lead: API contracts, DB, queue, auth, permissions
- Live Ops Lead: incidents, moderation, support, launch windows
- Data/Analytics Lead: tracking, KPIs, dashboards
- QA Lead: checklist execution, beta bug triage, regression gates

## Route And File Activation Map

### Homepage Route Reality
- /home/1 -> apps/web/src/app/home/1/page.tsx -> MagazineCoverScreen
- /home/2 -> apps/web/src/app/home/2/page.tsx -> HeroBanner + WeeklyCrownBelt + HomepageCanvas
- /home/3 -> apps/web/src/app/home/3/page.tsx -> LiveWorldScreen
- /home/4 -> apps/web/src/app/home/4/page.tsx -> sponsor placements scaffold, still visually generic
- /home/5 -> apps/web/src/app/home/5/page.tsx -> ChartsStoreScreen

### Data Sources Already Present
- apps/web/src/lib/placeholders/featuredArtists.ts
- apps/web/src/lib/placeholders/editorialItems.ts
- apps/web/src/lib/placeholders/sponsorCampaigns.ts
- apps/web/src/lib/placeholders/liveRooms.ts
- apps/web/src/app/api/homepage/featured-artist/route.ts
- apps/web/src/app/api/homepage/top10/route.ts
- apps/web/src/app/api/homepage/latest-articles/route.ts
- apps/web/src/app/api/homepage/new-releases/route.ts
- apps/web/src/app/api/homepage/trending-artists/route.ts
- apps/web/src/app/api/homepage/sponsors/route.ts
- apps/web/src/app/api/homepage/events/route.ts
- apps/web/src/app/api/homepage/contest/route.ts
- apps/web/src/app/api/homepage/belt-feed/route.ts

### Components Already Present
- apps/web/src/components/home/system/HomeBelt.tsx
- apps/web/src/components/home/system/BeltRegistry.ts
- apps/web/src/components/home/belts/SponsorBelt.tsx
- apps/web/src/components/home/belts/MarketplaceBelt.tsx
- apps/web/src/components/home/LiveWorldScreen.tsx
- apps/web/src/components/home/WeeklyCrownBelt.tsx
- apps/web/src/components/home/shared/LivePulseBadge.tsx
- apps/web/src/components/rooms/LiveStageScene.tsx
- apps/web/src/components/billboard/LivePreviewCard.tsx

## Immediate UX Gap Summary
- Placeholder text is still visible on live surfaces.
- Belt layouts exist, but real content binding is incomplete.
- Home 4 sponsor/advertiser world is structurally alive but not visually aligned to the PDF references.
- Current visual output lacks layered neon borders, dramatic backdrop treatment, and strong motion cues from the reference set.
- Some route families appear implemented as isolated components rather than one cohesive visual system.

## Wave Plan

### Wave 0 - Immediate Stabilization (Day 0-2)
Goal: one clean baseline for everyone.

Deliverables:
- Freeze branch naming and release protocol.
- Confirm one active API process and one active web process in each environment.
- Standardize env files by environment (local, staging, production).
- Disable non-critical bot/growth automations in pre-public stages.
- Keep auth-cert-test.ps1 as cert script and add runbook entry.

Exit Gate:
- No duplicate process conflicts.
- Auth cert script green on current branch.
- Deployment runbook approved.

### Wave 1 - Private Live Staging (Day 2-7)
Goal: reachable online environment for trusted testing.

Deliverables:
- Deploy web + API to staging URL with HTTPS.
- Verify cookies, CORS, sessions for staging domain.
- Connect DB, media storage, email, and observability.
- Add status and maintenance page.
- Add smoke command pack for one-click health checks.

Exit Gate:
- Staging URL usable by invite-only users.
- Signup/login/logout/reset flows pass.
- Homepage routes load with no blocking errors.

### Wave 2 - Core Experience Completion (Week 2)
Goal: users can sign up, enter, interact, and return.

Deliverables:
- Role routing complete: fan, performer, sponsor, admin.
- Profile edit/view complete.
- Friend requests + acceptance.
- Direct messaging + unread states + notifications.
- Invite flows (room, event, cypher).
- Homepages 1-5 mapped to PDF visual intent.
- Signup pages redesigned to match scanned fan/performer/advertiser/sponsor reference boards.
- Administration hub and advertiser hub transformed to match scanned HUD references.

Exit Gate:
- 5/5 core user stories pass on mobile and desktop.
- Non-admin access to admin endpoints blocked as expected.
- Error states are user-friendly, not raw API dumps.

### Wave 3 - Rooms, Stages, Shows, Voting (Week 3)
Goal: live world feels active and coherent.

Deliverables:
- Lobby, auditorium, battle, cypher, audience, performer rooms active.
- Host controls for transitions, voting cues, and show flow.
- Voting protection, anti-spam, winner declaration pipeline.
- Scene transitions and HUD overlays.
- Audio/video scene compatibility checks.

Exit Gate:
- Trusted users can join rooms, vote, invite, and chat without major blockers.
- Winner path tested end-to-end including records.

### Wave 4 - Sponsor + Commerce Activation (Week 4)
Goal: revenue and sponsor systems are safe and visible.

Deliverables:
- Advertiser signup and sponsor onboarding pages live.
- Ad placement inventory and campaign controls live.
- Store, season pass, rewards, entitlements tested.
- Billing error handling and retries defined.
- Revenue dashboards for admin.

Exit Gate:
- Payment success and failure paths verified.
- Entitlement updates consistent after purchase.
- Sponsor analytics and placement stats populated.

### Wave 5 - Controlled Beta To Public Rollout (Week 5+)
Goal: scale with control.

Deliverables:
- Invite Jay Paul Sanchez + trusted cohort.
- Run mission-based beta scripts.
- Triage and close red blockers.
- Turn on QA bots fully; content bots gradually; growth bots capped.
- Launch in waves: private beta, limited public, broader public.

Exit Gate:
- Go-live checklist green.
- Incident playbook tested.
- KPIs stable for 72 hours post-open.

## Day-1 Command Directives
- Finalize environment matrix document.
- Run full auth cert script and archive output to release evidence.
- Build a route inventory with owner per route.
- Assign one owner for each homepage (1-5).
- Start staging deployment and smoke test.
- Replace placeholder homepage copy with bound data or explicit polished fallback states.
- Turn Home 4 into the scanned advertiser/sponsor command center, not a white-card admin prototype.
- Create a visual token matrix from the scanned references: neon cyan, electric magenta, gold/orange CTA, dark plum/navy backgrounds.

## Mandatory Route Inventory
- Public:
  - /
  - /auth
  - /signup/fan
  - /signup/performer
  - /signup/sponsor
  - /forgot-password
- Authenticated:
  - /home/1
  - /home/2
  - /home/3
  - /home/4
  - /home/5
  - /profile/[slug]
  - /messages
  - /friends
  - /notifications
  - /rooms/lobby
  - /rooms/cypher
  - /rooms/battle
  - /contest
  - /store
  - /season-pass
- Sponsor/Admin:
  - /sponsor/dashboard
  - /sponsor/campaigns
  - /advertiser/signup
  - /sponsor/signup
  - /performer/signup
  - /fan/signup
  - /admin/command
  - /admin/live-ops
  - /admin/bots
  - /admin/analytics

## Screen-to-Asset Mapping

### /home/1 - Magazine Cover Screen
- Reference priority: Tmi Homepage 1.jpg
- Required content: weekly crown, current issue, cypher winner, featured face stack, voting banner, hype callouts.
- Required mood: poster-like, vertically stacked, electric, celebratory.

### /home/2 - Editorial And Discovery Hub
- Reference priority: Tmi Homepage 2.png
- Required belts: article feature, music news, interviews, studio recaps, genre cluster, top charts, playlist picks, artist directory, store, booking, sponsor spotlight.

### /home/3 - Live World Activity Belt
- Reference priority: Tmi Homepage 3.png
- Required modules: main preview lobby, lobby wall, join random room, event calendar, world premieres countdown, undiscovered boost, cypher arena gateway, stream-and-win card.

### /home/4 - Sponsors And Advertisers World
- Reference priority: Tmi Homepage 4.png and Tmi Homepage 5.png plus Profiles/Advertiser and sponser hub.jpg
- Required modules: premium ad carousel, advertiser marketplace, placement inventory, analytics, heatmaps, deals/contracts, secure deal gateway, live marketplace rates.

### /home/5 - Charts, Store, Season Pass, Economy
- Reference priority: Profiles/season Pass.jpg plus Tmi Homepage 2.png marketplace belt styling.
- Required modules: charts, merch, season pass progression, achievements, unlocked rewards, ticketed access, premium passes.

### Signup Family
- Fan signup -> Profiles/Fan Sign up.png
- Performer signup -> Profiles/Performer Sign up.png
- Advertiser signup -> Profiles/Advertiser Sign up.png
- Sponsor signup -> Profiles/Sponsor Sign up.png

### Admin And Operations
- Admin command / live ops -> Profiles/Adminisratation Hub.jpg
- Bot roster, revenue, alert rails, feed explorer, and security wall should inherit this layout.

### Host And Show Screens
- Deal/game-show surfaces -> game show and venue skins/
- Hosts and character presenters -> Host , Julius , and extra/
- Avatar unlock/customize flows -> scanned avatar/customizer references

### Venue Types
- Outdoor performances -> Venue Skins Plus Seating amphitheater references
- Premium arenas -> arena/stadium images
- Theater/cinema experiences -> theater and seating references
- Lounge/pool/club premium rooms -> lounge and pool venue references

## Components That Must Exist
- Auth shell components: signup/login/reset/role-pick cards
- Homepage belts: editorial, discovery, live world, sponsor, marketplace
- Room UI kit: stage HUD, audience panel, chat, invite tray, vote meter
- Social UI kit: profile header, friend controls, message composer, inbox list
- Commerce UI kit: product cards, cart, checkout states, entitlement badge
- Sponsor UI kit: campaign builder, placement matrix, analytics panels
- Admin UI kit: incident rail, bot command panel, queue monitor, release status
- Game-show UI kit: podium card, answer board, countdown reveal, host spotlight, crowd meter
- Venue UI kit: seating selector, front-row access state, premium lounge card, stage mode switcher
- Avatar UI kit: customization grid, unlock state, prop slots, emote preview, mic/pass progression

## Visual Direction Hard Rules
- Must follow TMI neon-magazine-cinematic look from attached PDF/image references.
- No generic default UI blocks.
- Every page must have intentional background, hierarchy, motion, and states.
- Mobile must feel designed, not squeezed desktop.
- Core palette: cyan glow + magenta/purple fields + orange/gold CTA accents + deep navy/plum foundations.
- Borders should feel layered and lit, not flat 1px boxes.
- Every hero surface needs a story image, stage image, or rich graphic backdrop.
- Placeholder copy is not allowed on any launch-facing page.
- White-card fallback admin patterns are not allowed on TMI-facing public routes.

## Bot Program Plan
- QA Bots:
  - Account creation
  - Login/logout loops
  - Route traversal
  - Messaging/invite checks
  - Voting load simulation
- Content Bots:
  - Magazine seeding
  - Profile seeding
  - Playlist and event feed population
  - Rotating homepage belt content generation
  - Sponsor card rotation seeding
  - Contest and live room atmosphere simulation
- Growth Bots:
  - Delayed activation after moderation + abuse controls are proven
  - Strict rate limits and audit trails

## Immediate Activation Sprint

### Sprint Goal
Convert the currently empty/placeholder homepage experience into a fully wired TMI-styled launch surface.

### Sprint Tasks
- Bind featured artist card content to featuredArtists.ts or /api/homepage/featured-artist.
- Bind latest news/editorial sections to editorialItems.ts or /api/homepage/latest-articles.
- Bind sponsor sections to sponsorCampaigns.ts or /api/homepage/sponsors.
- Bind live/trending sections to liveRooms.ts, /api/homepage/events, /api/homepage/trending-artists, and /api/homepage/top10.
- Replace all strings like Artist Name, Song One, and Your Brand Here.
- Add fallback cards that still look finished when data is empty.
- Convert Home 4 styling from generic cards to neon HUD panels.
- Align signup flows to their scanned role-specific references.
- Define one component owner per belt and one data source owner per belt.

### Sprint Exit Gate
- No placeholder strings on home 1-5.
- Each homepage has live data or polished fallback data.
- Home 4 matches advertiser/admin HUD direction.
- Public screenshots look recognizably like the scanned TMI references.

## Data + Tracking Requirements
- Event tracking for all major actions:
  - signup, login, role select, profile complete
  - room join, invite sent/accepted, message sent
  - vote cast, contest enter, winner seen
  - ad click, campaign launch, purchase, entitlement unlock
- Dashboards:
  - onboarding funnel
  - room engagement
  - social interaction health
  - sponsor ROI
  - revenue trend

## Blocker Severity Protocol
- P0: auth/data-loss/payment integrity/security regression
- P1: core flow broken (signup, login, room join, message, checkout)
- P2: major UX mismatch, visual defects, non-blocking route errors
- P3: cosmetic and polish

Rule:
- No public expansion while any P0/P1 remains open.

## Release Evidence Bundle (Every Wave)
- auth-cert output
- smoke test summary
- blocker board snapshot
- KPI baseline and post-change delta
- rollback notes

## Final Go-Live Gate
All must be true:
- Auth lifecycle green
- Role routing green
- Homepage 1-5 visual and functional checks green
- Social core green (friends/messages/invites)
- Rooms and voting green
- Sponsor and commerce safety green
- Bot controls green
- Incident response ready
- Placeholder scan returns zero launch-facing hits on homepage/signup/admin/sponsor routes.
- Screenshot review against scanned TMI references is approved.

If any are not green, hold rollout and fix before next wave.
