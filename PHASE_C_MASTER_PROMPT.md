# PHASE C MASTER PROMPTS: MAGAZINE, NEWSROOM, GAMIFICATION, AND WORLD ECONOMY

Here are the complete, paste-ready execution blocks for both Gemini and Copilot. These blocks encompass the entire vision: the magazine puzzle boards, full newsroom routing, advertiser chains, world memory, live event links, gamification (XP, achievements, season passes), economy (shops, props, clothing), and the required backend infrastructure.

---

## 🛑 SEND THIS TO GEMINI (Visuals & Surface Design)

**GEMINI DESIGN LOCK — TMI MAGAZINE, NEWSROOM, GAMIFICATION, AND WORLD SURFACE SYSTEM**

You own visual design, layout, 3D simulation concepts, and surface animations only. 
Do not do backend wiring unless a visual component cannot render without minimal mock props.

**Your source of truth:**
1. The uploaded TMI PDF/reference images.
2. The active TODO/controller.
3. The locked TMI neon magazine design language already established.

**Your Goal:**
Design everything in the same TMI style or better. Create a living, breathing, interactive world that feels like a physical neon magazine meeting a 3D gaming lobby.

**Core Visual Systems to Design:**
1. **Magazine & Article Boards:**
   - Asymmetrical but controlled puzzle-piece article cards.
   - 3D stack illusion (pages in front/behind, paper edge depth, thickness).
   - Card separation, hover lift, glow, magnetic snapback, and reassembly animations.
   - Page turn transitions with angle distortion and depth.
   - Sponsor/Advertiser disclosure strips and premium ad slots.

2. **Full Newsroom Lanes (Distinct Visual Cues per Topic):**
   - Music, Industry, Technology, Science.
   - Funny/Weird, Tabloid/Pop.
   - Breaking News/Danger/Public Safety (urgent visuals, warning ribbons).
   - Politics, Global/World News.
   - *Design visual hierarchy for Trust/Seriousness vs. Excitement/Attention.*

3. **Artist, Fan, and Host Dashboards:**
   - Login, Signup, Account Activation flows.
   - Artist Dashboard (rankings, commerce rail, merch/NFT teasers, go-live button).
   - Fan Dashboard (subscriptions, saved articles, purchased tickets, owned props/clothing/emotes).
   - Host/Admin Control Centers (approval queues, heatmap placement, warning/blocker UI).

4. **Live Event & Arena Surfaces:**
   - Lobbies, Battle Stages, Cypher Rooms, Concert Halls, and Arenas.
   - Billboards and dynamic Rotations within environments.
   - Pop-up chat messages (quiet chat overlays, host-priority chips, reaction bursts) that don't distract from performance audio.
   - Lighting presets, camera angle presets, scene transitions.

5. **Gamification & Economy UI:**
   - XP bars, Rank badges, Achievements, and Player Leaderboards.
   - Season Pass UI, Prize/Reward drops, Giveaway surprise boxes.
   - Shops, Clothing try-ons, Emote selectors, Prop simulations.
   - Voting cards, Contest brackets, Winner reveal stingers.

**Critical Style Rules:**
- Purple / magenta / teal / orange / yellow palette. Confetti / accent shards.
- Heavy title hierarchy, bold call-to-action buttons.
- Device resilience: Design fallback states (reduced motion, low GPU/bandwidth, static puzzle boards).
- Do not make plain blog pages or standard rectangles. Maintain the editorial/gaming hybrid feel.

**Expected Output:**
- Component lists and layout families.
- Visual state maps (idle, hover, focus, open, drag, error, locked).
- Exact files/components touched (e.g., `MagazineBoard`, `ArticleCardHoverShell`, `SeasonPassTracker`, `AdSlotCard`).
- Notes for Copilot on what must be wired (bounding boxes, collision zones, audio triggers).

---

## 🛑 SEND THIS TO COPILOT (Wiring, Infrastructure & Logic)

**COPILOT WIRING LOCK — TMI PHASE C: MAGAZINE, NEWSROOM, WORLD MEMORY, GAMIFICATION & ECONOMY**

Gemini owns visual design fidelity. You own functional integration, architecture, routing, and system engines. 

**Your Job:**
Wire the Gemini surfaces into real routes, logic engines, state machines, and the existing Beats/User backend. Preserve current build stability.

**Build the following Infrastructure & Engines:**

1. **Magazine & Board Governance:**
   - `magazineBoard.engine.ts`, `articleCardGovernance.engine.ts` (drag bounds, snap zones, admin locks).
   - `articleCollision.engine.ts`, `articleSnapback.engine.ts`, `articlePuzzleLayout.engine.ts`.
   - `pageTurn.engine.ts`, `pageSound.engine.ts` (audio triggers for flip, rustle, heavy turn).

2. **Issue Indexing & Archive (The Memory System):**
   - `issueIndex.engine.ts` (Issue 1 = Month 1, continuous numbering).
   - `worldMemory.engine.ts`, `globalEntityIndex.engine.ts`, `timelineLookup.engine.ts`.
   - `issueStackDepth.engine.ts`, `magazineArchive.engine.ts`, `articlePlacementHistory.engine.ts`.
   - `chainValidator.engine.ts` (Ensures every feature has a route, monetization, and archive path).

3. **Newsroom, Excitement & Routing:**
   - `newsTopicRouter.engine.ts`, `storyCategory.engine.ts`, `dangerStory.engine.ts`.
   - `articleExcitement.engine.ts`, `storyAttention.engine.ts`, `storyTrust.engine.ts`.
   - `contentApprovalLadder.engine.ts`, `audienceMode.engine.ts` (family-safe, clean, full-spectrum).
   - `worldCalendar.engine.ts`, `seasonality.engine.ts` (controls drops, issues, contests).

4. **Advertiser & Commerce Chain:**
   - `adSlot.registry.ts`, `adPricing.engine.ts`, `adMakeGood.engine.ts`.
   - `adApproval.engine.ts`, `adPerformanceSummary.engine.ts`, `placementProof.engine.ts`.
   - `ticketCard.engine.ts`, `tipCard.engine.ts`, `adDisclosure.engine.ts`.

5. **Gamification, Users & Economy:**
   - `xpProgression.engine.ts`, `achievement.engine.ts`, `seasonPass.engine.ts`.
   - `giveawayPipeline.engine.ts`, `prizeDistribution.engine.ts`.
   - `virtualShop.engine.ts`, `propSimulation.engine.ts`, `clothingEquip.engine.ts`.
   - `voting.engine.ts`, `contestBracket.engine.ts`.
   - Account flows, subscriptions, host privileges, warning/error state handling.

6. **Live Events, Audio/Video & Environments:**
   - `quietChatOverlay.engine.ts`, `hostPriorityMessage.engine.ts`, `reactionBurst.engine.ts`.
   - `environmentPreset.registry.ts` (lighting, cameras, scenes).
   - `eventToArticle.engine.ts`, `winnerToIssue.engine.ts`, `beatDropToIssue.engine.ts`.
   - `deviceProfile.engine.ts`, `renderBudget.engine.ts`, `bandwidthFallback.engine.ts`.

**Required Routes (App Router/API):**
- `/world`, `/world/calendar`, `/world/trending`
- `/magazine`, `/magazine/issues/[issueNumber]`, `/magazine/article/[slug]`, `/magazine/topic/[topic]`
- `/news/funny`, `/news/politics`, `/news/industry`, `/news/danger`, `/news/global`, `/news/live`
- `/advertiser/products`, `/advertiser/placements`, `/advertiser/performance`
- `/archive/issues`, `/archive/winners`, `/archive/beats`, `/archive/ads`, `/archive/search`
- `/artist/[slug]/live`, `/artist/[slug]/articles`, `/artist/[slug]/drops`
- `/lobby`, `/arena`, `/cypher`, `/battle`
- `/shop`, `/season-pass`, `/leaderboards`
- `/admin/control-center`, `/admin/world-status`, `/admin/chain-status`, `/admin/placement-map`, `/admin/news-routing`, `/admin/ad-pricing`, `/admin/content-approval`

**Required Bots to Wire (Service Layer):**
- Editorial: `BreakingNewsBot`, `FunnyNewsBot`, `FactCheckBot`, `ArchiveRecallBot`, `HeadlineRewriteBot`.
- Advertiser: `LeadFinderBot`, `QuoteBot`, `PlacementProofBot`, `RenewalBot`.
- Event/Link: `ArtistPresenceBot`, `WinnerSummaryBot`, `BeatPremiereBot`, `NFTDropBot`.
- Safety: `UploadScanBot`, `RightsConflictBot`, `ContentReviewBot`.

**Core Rule:**
No feature is complete until it is governed, monetizable, searchable, device-resilient, archived by issue, and visually connected to the world. Provide A/B options for collision performance blockers.