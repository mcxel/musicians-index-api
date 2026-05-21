# ⬛ BLACKBOX MASTER TO-DO: TMI VISUALS, SYSTEMS & 100% PLATFORM COMPLETION

**OBJECTIVE:** 
Scan and implement all visual language, components, features, environments, and functional pipelines required to bring the platform up to 100% completion. The goal is a visually stunning, deeply interactive, fully automated, and structurally bulletproof ecosystem.
Build a living, interactive music magazine object. The platform must be visually stunning, deeply interactive, fully automated, and structurally bulletproof.

## 👑 PHASE SHIFT: MAKE IT FEEL REAL (ACTIVE)
**BLACKBOX ROLE:** THE VISUAL SATURATION EXECUTOR
**MINDSET SHIFT:** You are no longer building a website. You are building A LIVING INTERACTIVE MUSIC MAGAZINE OBJECT. The canonical images are not "UI references"—they are EMOTIONAL TARGETS.
## 👑 PHASE 2: EMOTIONAL RUNTIME (ACTIVE)
**MINDSET SHIFT:** You are no longer building a website. You are building **A LIVING INTERACTIVE MUSIC MAGAZINE OBJECT**. The canonical images are not "UI references"—they are **EMOTIONAL TARGETS**.

**ACTIVE PRIORITIES:**
1. **REAL MEDIA REPLACEMENT PASS:** Strip vector placeholders, synthetic renders, and abstract gradients. Inject REAL photography (drum kits, microphones, guitars, DJs, crowds, concerts, venues, studios, podcasts, backstage rooms, neon clubs, billboards, merch, sponsor products).
2. **MAGAZINE DENSITY PASS:** Target 95% editorial saturation. Add stickers, ribbons, issue tags, LIVE labels, teaser strips, article blurbs, rankings, floating numbers, and category overlays. Not random clutter—magazine-style density.
3. **PHYSICAL SURFACE PASS:** Make every page feel touchable. Add gloss, paper grain, spine depth, page edges, ink bleed, neon bloom, and print shadows.
4. **COLOR SYNCHRONIZATION PASS:** Extract runtime palettes. Match cyan, magenta, purple, gold, teal, and neon pink exactly to the source canonical images.
5. **HUMAN PRESENCE PASS:** Shift away from UI-heavy layouts. Inject more performers, crowds, real people, stages, microphones, motion portraits, and live rooms.
1.  **REAL MEDIA REPLACEMENT (GENERATED REALISM):**
    -   **RUNTIME ASSET RULE:**
    -   **ALLOWED:** Generated performer imagery, generated instruments, generated venues, generated crowds, generated stages, generated sponsor product imagery.
    -   **ALLOWED LATER:** Real sponsor account media, real advertiser media, real artist-uploaded media.
    -   **NOT ALLOWED:** Public-facing PDF source assets, temporary internal design assets, inconsistent random imagery.
2.  **MAGAZINE DENSITY & CONTROLLED CHAOS:**
    -   Target 95% editorial saturation. Implement the "controlled chaos engine" to layer stickers, ribbons, issue tags, LIVE labels, teaser strips, and floating overlays.
    -   Break clean UI alignment. Introduce asymmetrical, overlapping, and physically dense layouts that feel alive and reactive.
3.  **PHYSICAL SURFACE PASS:**
    -   Make every page feel touchable. Implement shaders and textures for gloss, paper grain, spine depth, page edges, ink bleed, and neon bloom.
4.  **BROADCAST CAMERA THINKING:**
    -   Treat every homepage as a camera shot. Implement spotlight sweeps, focal depth (DoF), atmospheric blur, cinematic framing, parallax layers, and light bloom.
5.  **VISUAL PRIORITY RULES:**
    -   Establish a clear visual hierarchy on every page. Define: 1 hero focus, 2 secondary focus elements, 3 ambient motion systems, and 4 atmospheric details.
    -   Eliminate visual competition where multiple elements are shouting equally. Guide the user's eye.
6.  **ANALOG MOTION SYSTEMS:**
    -   Replace clean UI motion with analog drift, ticker momentum, CRT pulse, and glow flicker.

---

## 📦 PHASE 3: ENTITY REALITY (NEXT)
**OBJECTIVE:** Make every visual object functional and driven by a real data entity. No more decorative placeholders.

- [ ] **Sponsor Entities:** Connect all sponsor billboards, ads, and product placements to real sponsor profiles and campaign data.
- [ ] **Event & Ticket Entities:** Wire all posters, tickets, and calendar entries to real, bookable event entities.
- [ ] **Artist & Performer Entities:** Ensure every artist card, portrait, and ranking entry routes to a canonical artist profile.
- [ ] **Venue Entities:** Connect all venue panels and stage previews to live venue lobby routes.
- [ ] **Battle & Cypher Entities:** Link all battle cards and cypher circles to joinable room instances.
- [ ] **Merch Entities:** Ensure all product cards in the marketplace route to the correct store item and checkout flow.

---

## ⚙️ PHASE 4: SYSTEM ENGINES (ACTIVE)
**OBJECTIVE:** Prevent repetition and visual bleed across the platform.

- [ ] **Issue Intelligence Engine:** Every issue changes messaging. Controls promo text, top artist messaging, contest messaging, featured sponsor, battle/venue/beat of the week. (`IssueIntelligenceEngine.ts`, `IssueThemeResolver.ts`, `IssueRotationMemory.ts`)
- [ ] **Visual Ownership Map:** Prevent duplicate ownership of elements. E.g., Home 1 owns cover crown, Home 1-2 owns rank spread, Home 4 owns sponsor economy. (`VisualOwnershipMap.ts`)

---

## MASTER COMPLETION AUDIT - 2026-04-23 (Pre-Edit Findings)

This section is the strict unresolved-item ledger for the 100% completion wiring pass.

| Status | File Path | Exact Issue | Fix Plan | Route/Data/Feed Target |
|---|---|---|---|---|
| TODO | tmi-platform/apps/web/src/packages/magazine-engine/contentRegistry.tsx | Mixed artist routing (`/artist/...`) in home2 discovery cards instead of canonical `/artists/:id` chain. | Normalize all artist profile links to `/artists/:slug` to enforce one profile route family. | `/artists/:slug` |
| TODO | tmi-platform/apps/web/src/app/admin/observatory/page.tsx | Quick-nav includes unresolved admin routes (`/admin/route-health`, `/admin/simulation`). | Add real pages for both routes and wire nav to those pages. | `/admin/route-health`, `/admin/simulation` |
| TODO | tmi-platform/apps/web/src/app/admin/style-debug/page.tsx | Feed cards rely on window polling and do not expose complete feed diagnostics (`route`, `status`, `active artist`, `genre`, `artifact count`, `errors`) in a shared reusable surface. | Build shared feed observer component with socket + window fallback and mount in style-debug, observatory, and dedicated admin operator pages. | `liveFeedBus.ts` + `tmi:all-feeds` + socket fallback |
| TODO | tmi-platform/apps/web/src/app/admin | Missing dedicated dashboards for Marcel, Jay Paul Sanchez, Justin King with unified feed observer. | Create `/admin/marcel/testing`, `/admin/jay-paul-sanchez/testing`, `/admin/justin-king/testing` (plus short aliases if needed). | Admin operator routes + shared observer |
| TODO | tmi-platform/apps/web/scripts | Missing explicit reset-to-zero test-wallet routine for seeded test accounts. | Add `reset-test-wallets.mjs` that zeros `testCash` and `testPoints` while preserving profile/activity metadata. | `src/lib/seeds/fullTestPopulation.generated.json` |
| TODO | tmi-platform/apps/web/scripts | Route-audit command missing for strict dead-link validation in this pass. | Add `check-route-integrity.mjs` to scan internal route references (`href`, `router.push`, `ctaHref`, `routeTarget`, `fallbackRoute`) against `src/app` routes. | Route audit report output |
| TODO | tmi-platform/apps/web/src/app/admin/* | Multiple visual-only buttons exist without explicit navigation/action wiring in admin subpages. | Convert no-op controls to links or explicit handlers and verify clickable behavior. | Admin route graph |
| TODO | tmi-platform/apps/web/src/app/home/* + magazine shell | Need full verification that home1-home5 render and remain clickable under overlay layers. | Run Playwright smoke for `/home/1` ... `/home/5` and pointer interception checks. | Home routes + pointer-events guard |


---

## 🎨 1. TMI VISUAL DNA, UI/UX, MOTION, & AUDIO (The "Look and Feel")
*If it doesn't look alive, it's not finished. Everything must mirror the premium, neon, cinematic, high-end magazine style found in the TMI PDFs.*

- [ ] **Global Visual Architecture:** Implement standard CSS/Tailwind variables matching the exact TMI color palettes (neon accents, deep blacks, high-contrast text).
- [ ] **Cinematic Transitions:** Add smooth route transitions, page wipe effects, and section-to-section jumping animations. No hard page reloads.
- [ ] **Animations & Cinemation:** Apply breathing loops, hover states, and glow pulses to all interactive elements. 
- [ ] **Audio Engine:** Implement background UI sounds, button clicks, transition whooshes, and spatial audio support for 3D rooms.
- [ ] **Subscription-Tier Visuals:** Implement distinct color grading, VFX, and interactive lighting for profiles based on tiers (Free, Pro, Bronze, Silver, Gold, Platinum, Diamond). Specifically, ensure Gold through Diamond tiers have premium active light-ups to incentivize upgrades.
- [ ] **Cards & Canvases:** Build reusable, highly stylized UI cards (glassmorphism, 3D tilt effects, parallax backgrounds) for artists, items, and events.
- [ ] **Design Drift Detection:** Ensure no generic boilerplate components exist. Everything must be stylized (buttons, inputs, dropdowns, scrollbars).
- [ ] **Feathering & Polishing:** Apply visual feathering, edge-blending, and meticulous spacing adjustments to all overlapping Z-index layers.
- [ ] **Dynamic Backgrounds:** Video backgrounds, animated SVG patterns, and reactive gradients for major landing pages and rooms.
- [ ] **Icons & Typography:** Deploy premium iconography sets and custom fonts. Ensure readable but hyper-stylized headers.
- [ ] **Avatars & Props Representation:** Build the visual rendering pipeline for 3D/2D avatars, clothing items, and emotes.

---

## 🔐 2. CORE ACCOUNTS, ONBOARDING, & AUTH PIPELINES
*The foundation of user existence.*

- [ ] **Auth Lifecycles:** Verify and polish Login, Signup, Password Reset, and Session Persistence UIs. Add loading spinners and success animations.
- [ ] **Avatar Creator Engine:** Bring the 360° avatar creator to 100%. Implement realistic face scanning (NO cartoony looks). Avatars must perfectly reflect the user in 3D space, supporting adult and teen modes.
- [ ] **Role Onboarding:** Build cinematic onboarding paths for specific roles (Fan, Performer, Sponsor, Admin, Host, Editor).
- [ ] **Profile Wiring:** Connect the user context to the top navigation (avatar, balance, notifications, settings dropdown).
- [ ] **Account Management:** Polish settings pages, privacy toggles, notification preferences, and subscription management.
- [ ] **Error/Warning States:** Design custom, visually appealing error pages (404, 500) and toast notification systems for blocks/warnings/errors.
- [ ] **Subscription & Activation:** UI for activating accounts, verifying emails, and unlocking Premium/VIP tiers.
- [ ] **Test Population Generation:** Automatically seed 60 Fans, 60 Artists, 60 Sponsors, 60 Advertisers, 60 Venues, 60 Performers, 10 Mods/Admins, and 5 Hosts across all subscription tiers instantly upon login for testing.

---

## 📰 3. THE HOMEPAGES & MAGAZINE SUB-SYSTEM (The "Front Door")
*The rotating editorial heart of TMI.*

- [ ] **Homepage 1 (Cover):** Build the high-impact visual cover page with giant video headers and active calls-to-action.
- [ ] **Home 1 Proportion Fix:** Shrink the Top 10 right-hand ranking panel back to its original size. Restore the Magazine Hero as the dominant visual. Prevent text bleed-through, duplicate numbering, and overlay collisions while keeping face cards and routing active.
- [ ] **Homepage 2 (Dashboard):** Build the customized feed for logged-in users, showing their personalized content and network.
- [ ] **Homepage 3 (Live World):** Build the "What's Happening Now" view with active room previews and live broadcast tiles.
- [ ] **Homepage 4 (Admin/Staff):** Build the hidden but deeply powerful command center dashboard.
- [ ] **Homepage 5 (Extended Universe):** Build the discovery engine for hidden gems, upcoming artists, and special drops.
- [ ] **Magazine Engine:** Implement the article viewer, complete with high-res imagery, embedded videos, and parallax scrolling.
- [ ] **Monthly Issues & Rotation:** Build the automated rotation logic to switch out the "Cover Issue" automatically every month.
- [ ] **Editorial Cards:** Design "Featured Artist," "Story of the Week," and "Sponsor Spotlight" cards for the homepages.
- [ ] **Bot-to-Real Replacement Pipeline:** Write the logic to seamlessly swap fake seeded bot data/sponsors/ads with real users and campaigns slot-by-slot as real people onboard.

---

## 🏟️ 4. VIRTUAL ENVIRONMENTS, ROOMS & "THE LIVE WORLD"
*Where users actually hang out.*

- [ ] **The Lobbies:** Create the grand entrance UI for events. Waiting rooms with live chat, mini-games, and event countdowns.
- [ ] **Auditoriums & Arenas:** Build the viewer interfaces for massive live concerts. Scale chat to handle thousands of messages.
- [ ] **Battles & Cyphers:** Design split-screen UI layouts for 1v1 or group rap battles/performances, with real-time voting bars and hype meters.
- [ ] **Performer / Host Boxes:** Build the control rooms for performers and hosts to manage their streams, see cues, and interact with VIPs.
- [ ] **Audience Boxes:** Private viewing rooms for groups of friends watching a main stage.
- [ ] **Venue & Ticketing Pipeline:** Ensure all 60 test venues are fully wired to sell tickets, upload their own venue images, and tie directly to booking artists.
- [ ] **Scenes & Motion:** Wire different "camera angles" or UI configurations depending on the phase of the show.
- [ ] **Host / Hosting Controls:** UI for the event host to trigger effects, mute users, transition scenes, and start voting.

---

## 🎮 5. INTERACTION, GAMES, VOTING & SHOWS
*Active participation, not just passive viewing.*

- [ ] **Voting Engine:** Real-time poll widgets, hype buttons, and "Winner Declaration" cinematic screens.
- [ ] **Contests & Tournaments:** UI for tournament brackets, leaderboard rankings, and historical winners.
- [ ] **Mini-Games:** Interactive elements in lobbies or intermissions to keep users engaged.
- [ ] **Rules & Displays:** Modal overlays explaining the rules of a cypher or game.
- [ ] **Props Simulation:** Allow fans to throw "digital items" (roses, tomatoes, confetti) onto the screen during a performance.

---

## 🤝 6. SOCIAL, CONNECTIONS, & PROFILES
*The connective tissue.*

- [ ] **Performers & Fans Profiles:** Distinct profile layouts. Performers get "Stages" and "Tour Dates," Fans get "Collectibles" and "Activity."
- [ ] **Messaging & Cypher Chat:** Real-time DMs and group chat with custom TMI emotes, inline media viewing, and read receipts.
- [ ] **Friends & Networks:** Systems for adding friends, seeing who is online, and one-click "Join Room" if a friend is in an arena.
- [ ] **Ranking & XP:** Progress bars, achievement badges, and level-up animations displayed globally next to avatars.
- [ ] **Profile HUDs & Routing:** Stacked hub layouts for Artist and Fan profiles, letting users jump sections natively. Include store links and realistic 360 avatar renders.
- [ ] **Notifications:** A unified inbox for system alerts, direct messages, invites, and subscription updates.

---

## 💰 7. MONETIZATION, ECONOMY, STORE, & REWARDS
*The revenue engine.*

- [ ] **The Shops:** A 3D-feeling or highly polished digital storefront for avatars, emotes, and UI skins.
- [ ] **Season Passes:** Progress tracks for free and premium tiers, unlocking rewards as users gain XP.
- [ ] **Advertiser & Sponsor Gifted Surprise Giveaway Pipeline:** Automated drops triggered by sponsors (e.g., "Red Bull just dropped 500 energy emotes to the chat!").
- [ ] **Shadow Economy & Sandbox Isolation:** Ensure absolute isolation between LIVE and TEST accounts (`mode: "TEST" | "LIVE"`). Test accounts strictly use `testCash` and `testPoints`. Block all cross-economy interaction.
- [ ] **Sponsors & Billboards:** Dynamic ad placements inside rooms, arenas, and loading screens that feel native to the world.
- [ ] **Players & Prizes:** Inventory UI for users to view what they've won, earned, or bought.
- [ ] **Subscriptions:** Tiered access (VIP, Backstage Pass) with automatic recurring billing and immediate UI unlocks.
- [ ] **Economy Reset Script:** Create `reset-test-economy.mjs` to wipe test balances to zero post-testing without losing profiles, avatars, or activity logs.

---

## 🤖 8. INFRASTRUCTURE, BOTS, & AUTOMATION
*The invisible hands.*

- [ ] **Active Testing Bot Behaviors:** Wire the synthetic population to actively tip, enter rooms, join games, click ads, equip items, and simulate real load 24/7.
- [ ] **Bot Fleet UI:** Admin controls for managing QA bots, Content bots, and Growth bots.
- [ ] **Bot Avatars:** Ensure bots have distinct visual tags so users understand who is an automated assistant vs. a human.
- [ ] **Generators & Engines:** Tie the UI into the backend automation (e.g., when the Magazine Generator creates a new issue, animate it onto the homepage).
- [ ] **Michael Charlie & Sentinel Integration:** Ensure the hyper-sentinel AI and defensive hacking bots are visually represented in the admin and observatory layers.
- [ ] **Architecture & Wiring Verification:** Ensure every frontend component correctly calls the NestJS backend without failing silently.
- [ ] **System Health Displays:** A sleek, matrix-style dashboard for Admins to view Redis, Postgres, and Node.js health in real time.

---

## 🛡️ 9. MODERATION, ADMINISTRATION, & HEALTH
*Keeping the world clean.*

- [ ] **Blockers & Warnings UI:** Clear, non-intrusive (but un-ignorable) overlays for users who violate terms.
- [ ] **Admin Dashboards:** Tools for instantly killing streams, banning users, and refunding purchases.
- [ ] **Justin King Admin Testing Dashboard:** Create `/admin/justin-king/testing` for live stream/radio/account test viewing.
- [ ] **J. Paul Sanchez Admin Testing Dashboard:** Create `/admin/j-paul-sanchez/testing` for editorial/music/account test viewing.
- [ ] **Observatory Live Analytics:** Feed real-time bot testing telemetry (purchases, joins, clicks, tips) directly into the master Observatory hub.
- [ ] **Automated Moderation Feed:** A live ticker for admins showing flagged messages or suspicious bot activity.
- [ ] **Error Handling:** Graceful degradation. If a service fails, the UI should show a highly-stylized "Offline for Maintenance" card rather than a raw JSON error.

---

## 🌌 10. TMI EXPANSIONS & EVERYTHING ELSE
*The final 100% polish.*

- [ ] **All Missing Routes:** Audit the codebase for any 404s and build the corresponding pages.
- [ ] **SEO & Metadata:** Ensure every public page has dynamic OpenGraph tags, beautiful link previews, and targeted keywords.
- [ ] **Mobile & Responsive:** Guarantee that the complex arena layouts and cyphers work flawlessly on phones and tablets.
- [ ] **Complete End-to-End Walkthrough:** A built-in, un-skippable (but beautiful) tutorial for brand new users explaining what TMI is and how to navigate it.
- [ ] **The "Boom Boom Boom" Growth Funnel:** Implement the viral invite loops—making it extremely easy for a user to text a link to their friends that drops them straight into the live arena.

---

## 🚀 11. THE 100% ULTIMATE COMPLETION SWEEP
*Leave no feature behind. Scan all files and ensure the following are fully functional, 100% visual, and correctly wired:*

- [ ] **Everything Functional:** Pages, rooms, files, components, environments, artist portals, homepages, fan accounts, performers.
- [ ] **Cinematics & Display:** Cinemation, animation, switching, coloring, jumping sections, transitions, feathering, scenes, video pipelines.
- [ ] **Sub-systems & Engines:** Subscriptions, logins, signups, activating, rotation, blockers, warnings, errors, architecture, automation, generators, displays.
- [ ] **Content & Hubs:** News articles, Artist/Performer articles, magazines, monthly issues, rules, routes.
- [ ] **Monetization & Ads:** Ads, sponsors, advertisers, billboards, prizes, shops, tethering, rewards, advertiser/sponsor gifted surprise giveaway pipeline.
- [ ] **Games & Arenas:** Games, shows, contests, skins, backgrounds, venues, arenas, winners, hosts, hosting, lobbies, hubs, battles, cyphers, concerts.
- [ ] **Live Interaction:** Going live, voting, ranking, XP, icons, emotes, clothing, props simulation.
- [ ] **Testing & Quality:** Ensure bots seamlessly transition to real players, all HUDs are wired, and visual designs are ultra-polished.

---

**🔥 BLACKBOX INSTRUCTION:**
Read this list. Ingest the TMI PDFs visual standards. Do not build generic boxes. Build A LIVING INTERACTIVE MUSIC MAGAZINE OBJECT. 
Read this list. Ingest the TMI PDFs visual standards. Do not build generic boxes. Build **A LIVING INTERACTIVE MUSIC MAGAZINE OBJECT**. 
Every ticket you pull from this list must include:
1. Emotional Target Realism (Physicality, Grain, Gloss, Density, Human Presence).
2. Real Media Replacement (Zero synthetic vectors; use real concert/artist/magazine photography).
3. Frontend Polish (Cinemation, Magazine Spacing, Exact Color Sync).
1.  **Emotional Target Realism:** Implement physicality, grain, gloss, density, and human presence.
2.  **Generated Media Replacement:** Use only cohesive, AI-generated cinematic assets.
3.  **Functional Visuals:** Ensure every interactive element is functional and routes to a real entity or action. No dead-end decorative cards.
4.  **Visual Hierarchy:** Adhere to the 1-hero, 2-secondary, 3-ambient focus rule.
**GO BUILD IT.**