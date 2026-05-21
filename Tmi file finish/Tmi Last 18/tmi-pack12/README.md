# TMI PACK 12 — CONTROL LAYER + LEARNING EVOLUTION
## The Final Operating Layer — Everything the Platform Needs to Run, Learn, and Stay Perfect

---

## SLOGAN: "This is your stage, be original."

---

## WHY THIS PACK EXISTS

Pack 11 finished the design.
Pack 12 makes the design OPERABLE, EDITABLE, MEASURABLE, and SELF-IMPROVING.

A platform that can't measure itself can't get better.
A platform that can't be safely edited will drift.
A platform with no fallback plan will break in front of users.

Pack 12 locks all of that so the system runs like an elite company — everyone knows their role, everything is logged, mistakes are self-corrected, and the platform gets better every week.

---

## FILES IN THIS PACK

### `control-layer/EDITABILITY_AND_BOT_MATRIX.md`
**Two documents:**

**MASTER_EDITABILITY_RULES:**
- Law 1: No monolith files — one file, one job
- Law 2: No hardcoded content in page files — all copy/labels from config
- Law 3: All animation constants centralized in `motion.tokens.ts`
- Law 4: All homepage sections config-driven (belt registry)
- Law 5: All card variants extend one shared `CanvasCard` base
- Law 6: All bots configured from manifest JSON, not scattered literals
- Law 7: Big Ace override points clearly exposed as props on every page component
- Law 8: Max file sizes (page: 200 lines, card: 150, engine: 300, config: 100, bot: 50)

**MASTER_AUTOMATION_OPERATING_MATRIX:**
Complete 25-bot operating table with: schedule, what it reads, what it writes, what it cannot touch, owner, fallback behavior, and log channel. Bot command hierarchy: Mainframe → Big Ace → Framework → Algorithm → Bots. Marcel sees logs/status, Jay Paul sees status only.

---

### `control-layer/REPO_ROUTES_COMPONENTS.md`
**Three documents:**

**MASTER_REPO_PLACEMENT_MAP:**
Exact repo path for every homepage component, engine service, bot manifest, and config file. Examples:
- Homepage Cover → `apps/web/src/app/(magazine)/page.tsx`
- Crown Card → `apps/web/src/components/tmi/crown/CrownCard.tsx`
- Crown Engine → `apps/api/src/services/crown.service.ts`
- All bot manifests → `tmi-platform/bots/manifests/*.manifest.json`

**MASTER_ROUTE_TREE:**
Every route on the platform with: public/protected status, required role, onboarding requirement, redirect behavior, failure behavior. Public routes (/, /live, /editorial, artists, articles, genres, preview lobbies, hall of fame, store). Protected routes (/dashboard, /rooms, /stream-and-win, /achievements, onboarding). Admin routes (/admin, /admin/crown, /admin/sponsors, /admin/bots, /dashboard/operator).

**MASTER_COMPONENT_REGISTRY:**
Every reusable component with TypeScript props, states, pages used on, motion rules, and mobile rules. Covers: HomepageHeader, HomepagePageStrip, CornerPeel, CanvasCard (base), CrownCard, ArtistRingCard, ComicInsertCard, PreviewLobbyCard, LobbyWall, CountdownCard, UndiscoveredBoostCard, ArticleFeatureCard, GenreClusterCard, SponsorSpotlightCard, StreamAndWinCard, AudienceStadium, BroadcasterHUD, StatusFooter. All card variants extend CanvasCard.

---

### `control-layer/DATA_PROOF_FAILURES_LOGGING_WIRING.md`
**Eight documents:**

**MASTER_DATA_AND_EVENT_MAP:**
What data powers every card on all three homepages, what API endpoint serves it, what trigger updates it, and what fallback renders if missing. Covers all ~20 cards across Homepage 1/2/3.

**HOMEPAGE_PROOF_GATES:**
Homepage 1: Crown loads, motion clips play, ring renders, comic insert correct, corner peel works, page strip works, 8-week rotation fires. Homepage 2: Lobby Wall discovery-first sort (0 viewers = position 1), live stream shows, countdown ticks, undiscovered boost shows lowest-view artist, standby mode activates. Homepage 3: All editorial cards open correct sections, genres navigate correctly, charts update, sponsor fallback works. Shared: card positions persist after refresh, reduced motion mode works, mobile swipe works.

**FAILURE_STATE_AND_FALLBACK_MATRIX:**
20 failure scenarios with exact user experience and system response. The platform NEVER shows a blank page or crashes. Auth expired → clean redirect. No live rooms → standby mode. Article not found → clean 404. Bot failure → fallback mode + logging.

**MASTER_LOGGING_AND_OBSERVABILITY_MAP:**
Every logged event: homepage views, card clicks, card moves, page flips, room joins, stream starts, tips, points, subscriptions, spins, bot runs, bot failures, crown rotations, loot drops, errors, API failures, performance degradation.

**MASTER_CONTENT_OWNERSHIP_AND_APPROVALS:**
Who creates, who approves, who can override every content area. Big Ace approves: comic inserts, crown overrides, sponsor placements, bot configuration, emergency broadcasts, feature flags, ranking overrides. Marcel submits suggestions, Jay Paul views only.

**COPILOT_WIRING_ONLY_LIST:**
Claude complete (do not rewire): all 12 pack docs, contracts, manifests, configs, route definitions, proof gates. Copilot wires now (after Cloudflare green): homepage pages, crown API, lobby sort, editorial cards, sponsor API. Blocked until Cloudflare green: everything. Blocked until later phases: AudienceStadium (Phase 3), FaceScan (Phase 3), Broadcaster (Phase 4).

**SPONSOR_PRESENTATION_ENGINE:**
Placement map (Homepage 1 bottom strip only, Homepage 3 full card, never at crown transfer or winner reveal). Timing rules (60 seconds between appearances, max 2 per hour live, max 8s animation, no autoplay audio). Fallback: house ad or platform branding, never empty boxes.

**FAN_SUPPORTER_SUPERFAN_SYSTEM:**
5 fan tiers (Fan → Supporter → Superfan → VIP → Founding Member) with requirements and perks. What artists see (fan counts per tier, top tippers, retention rate). What sponsors see (verified fan count, tier breakdown, engagement signal, growth rate). Fan profile widget showing clubs, follows, points, achievements.

---

### `learning-evolution/LEARNING_EVOLUTION_COMPLETE.md`
**Eight documents:**

**LEARNING_AND_EVOLUTION_SYSTEM:**
Core principle: the system can optimize performance, discovery, and conversion — but NEVER drift from music-magazine identity, 1980s visual DNA, crown ethics, or discovery-first rules. Always-measured metrics: 10 categories from card CTR to artist earnings growth.

**FEEDBACK_LOOP_ENGINE:**
Three primary loops: Discovery Loop (fan sees undiscovered artist → clicks → watches → conversion signal → algorithm boost), Content Loop (article CTR tracked → low CTR flagged → high CTR type prioritized), Crown Loop (post-announcement engagement informs future featured-artist recommendations).

**EXPERIMENT_AND_OPTIMIZATION_RULES:**
5 experiment types with max user %, duration, approval level, and auto-promote thresholds. 7 immutable laws: always have success metric, always reversible in <5 min, never touch crown/identity/discovery, auto-rollback on net negative, all logged and visible.

**DRIFT_PREVENTION_LAW:**
Frozen rules (never auto-change): discovery-first sorting, 8-week crown rotation, 1980s visual DNA, homepage 1/2/3 role split, music-first editorial, page-flip navigation, no undisclosed pay-for-rank, Big Ace override control, Marcel/Jay Paul analytics-only, Julius cast integrity. What can evolve: card positions, headline copy, article order, algorithm weights, sponsor timing.

**BOT_SELF_IMPROVEMENT_RULES:**
Per-bot table: what each bot may auto-optimize, what requires approval, what it cannot touch. Discovery Bot may adjust sort weights but must ask about position rules. Algorithm Bots may run approved experiments but cannot touch crown/identity.

**PLATFORM_MEMORY_AND_LEARNING_LEDGER:**
8 memory categories with retention periods: best-performing layouts (52 weeks), best-performing issues (forever), artist discovery patterns (52 weeks), experiment results (forever), crown history (forever), sponsor performance (24 months), failed experiments (forever), bot optimization history (52 weeks).

**QUALITY_CORRECTION_ENGINE:**
9 auto-correction triggers: broken card → fallback state, dead route → 404 page, stale issue → previous issue, expired sponsor → house ad, ghost avatar → janitor bot, bot failure → fallback + retry + alert. Crown calculation error → hold current crown + alert Big Ace IMMEDIATELY.

**HUMAN_OVERRIDE_AND_APPROVAL_CHAIN:**
Big Ace only (never automated): crown rule changes, platform lock, sponsor approval, bot control, feature flags, ranking freezes, emergency broadcasts, content removal. Requires Big Ace review (algorithm flags): crown ties, experiment promotion, new bots, major layout changes. Algorithm handles (with logging): card optimization, article order, notification timing.

---

### `wiring-handoff/SUCCESS_SCORECARD_SLICES.md`
**Four documents:**

**SUCCESS_METRICS_MASTER:**
Discovery metrics (30% target → 50% great for first-room conversion). Engagement metrics (4 min average session → 8+ min great). Economy metrics (5% tip conversion → 12%+ great). Platform health (< 2.5s load → < 1.5s great, 99.5% uptime → 99.9% great).

**PLATFORM_HEALTH_AND_EVOLUTION_SCORECARD:**
Full wireframe of what Big Ace sees every Monday: platform health, top wins, areas that dropped, experiments running, bot activity, suggested actions. Marcel gets summary, Jay Paul gets top-line numbers.

**WEEKLY_SELF_REVIEW_BOT_SPEC:**
Runs Sunday 23:00 (before Crown Bot at midnight). Collects all logs, experiment status, bot success rates, metrics. Produces JSON report with top wins, drops, urgent flags. Big Ace sees full report, Marcel sees summary, Jay Paul sees numbers.

**MONTHLY_EVOLUTION_REPORT_SPEC:**
Runs 1st of every month at 06:00. Analyzes 4-week rolling averages, experiment outcomes, platform memory updates, artist success rates. Recommends 1-3 content changes and 1-2 experiment ideas. Big Ace reviews, approves/rejects, algorithm adjusts.

**COPILOT_WIRING_SLICES:**
10 numbered safe slices: Slice 0 (fix build), Slice 1 (shared infrastructure), Slice 2 (Homepage 1), Slice 3 (Homepage 2), Slice 4 (Homepage 3), Slice 5 (auth/onboarding), Slice 6 (economy/points), Slice 7 (social/discovery), Slice 8 (live rooms), Slice 9 (shows/games), Slice 10 (admin/bots), Final Slice (proof + launch). One slice at a time, prove each before moving forward.

---

## THE COMPANY CHAIN (LOCKED)

```
VISION        Marcel Dickens (analytics, suggestions, requests)
CONTROL       Big Ace (full authority, approval, override)
DESIGN        Claude (specs, laws, contracts, architecture)
EXECUTION     Copilot (repo wiring, real code, tests)
AUTOMATION    Bots (crown, discovery, archive, broadcast, safety)
MONITORING    Logging + Scorecards (weekly + monthly)
EVOLUTION     Experiment Bot + Algorithm (within locked boundaries)
```

---

## COMPLETE PACK INVENTORY

| Pack | What It Built |
|---|---|
| 1 | 10 base components |
| 2 | 14 components + architecture |
| 3 | Magazine navigation |
| 4 | Cast system |
| 5 | Cast Pack 2 |
| 6 | Live events |
| 7 | 15 rooms + shared systems |
| 8 | System integrity |
| 9 | Product layer (economy/social) |
| 9-W | Pack 9 wiring handoff |
| 10 | Operations + release control |
| 11 | Homepage system + simulation |
| **12** | **Control + Learning + Wiring Slices** |

---

## THE SINGLE NEXT ACTION

```
PASTE the first 30–50 lines of the Cloudflare error
for musicians-index-api.

That unlocks Slice 0. Slice 0 unlocks Slice 1.
Slice 1 unlocks everything else.

GitHub CI: ✅ GREEN (commit 3a81795)
All 12 packs: ✅ DESIGNED
Copilot: READY TO WIRE
```

---

*Pack 12 — Control Layer + Learning Evolution v1.0*
*BerntoutGlobal XXL / The Musician's Index*
*"This is your stage, be original."*
