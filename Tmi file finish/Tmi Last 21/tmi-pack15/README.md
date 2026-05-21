# TMI PACK 15 — FINAL COMPLETION LAYER
## The Last Layer — Governance, World Simulation, Device/Distribution, Proof, Launch
### BerntoutGlobal XXL / The Musician's Index
**"This is your stage, be original."**

---

## WHY THIS PACK EXISTS

After analyzing the complete Copilot/ChatGPT conversation in this session, these were the final categories identified as missing from the architecture:

1. **Master governance indexes** — nothing was tracking what exists vs what needs wiring
2. **World simulation** — members becoming the numbers/audience/performers
3. **Pre-live/post-live lifecycle** — backstage, soundcheck, results, recaps
4. **Overlay/motion rules** — what appears above what, how numbers move
5. **Device/distribution** — every screen, every OS, every app store
6. **Asset pipeline** — how media flows from upload to CDN to room
7. **Billing/compliance** — free download, subscription inside, app store rules
8. **Monitoring/SLOs** — what "healthy" means, who gets paged
9. **Feature flags/kill switches** — disable anything without redeploy
10. **Analytics taxonomy** — shared event naming across all systems
11. **Load testing** — prove scale before launch
12. **Support/knowledge base** — help, moderator playbooks, operator playbooks
13. **Platform proof matrix** — every proof gate documented
14. **Launch day commands** — exact steps for launch day
15. **Component shells** — room families, lobby panels, preview stage, command center
16. **Missing bot manifests** — 10 high-priority bots with full governance rules

---

## FILES IN THIS PACK

---

### `master-control/MASTER_BUILD_MATRIX.md`
**The single governance document for the entire platform.**

A 10-layer matrix covering: Runtime Foundation, Homepage Belts, Room Families, Artist/Producer Profiles, Venue/Event/World, Economy/Social, Discovery/Social, Operator/Admin, Infrastructure, and Device/Distribution. Each row has exact columns for: Claude Creates, Copilot Wires, VS Code Proves, Status, and Launch Blocker. Current overall completion estimate: ~42%. The launch gate checklist at the bottom is the definitive go/no-go before any member is onboarded.

---

### `master-control/MASTER_INDEXES.md`
**Three complete index documents:**

**MASTER_ROUTE_INDEX:** Every route on the platform organized by family — World/Discovery (25+ routes), Artist/Producer (12+ routes), Venues/Events (10+ routes), Rooms (20+ routes), Platform Info, Support/Policy, Protected routes, and Admin routes. Each route shows the page shell and current status.

**MASTER_ENGINE_INDEX:** All 30+ engines organized by layer — Core Runtime (all 8 complete), Homepage/Discovery (6 engines, most missing), Room/Live (8 engines, all missing), World/Simulation (5 engines, all missing), Economy/Business (7 engines, partial), Identity/Trust (4 engines), Archive/Memory (4 engines), and Media/Rights (5 engines). Each engine shows status and priority.

**MASTER_BOT_INDEX:** The complete 26-bot table showing every bot's trigger, owner, what it may auto-fix, what it cannot touch, and status. Plus 20 additional missing bots worth adding with their priorities.

---

### `world-simulation/WORLD_AND_LIFECYCLE_SYSTEMS.md`
**Three system specifications:**

**WORLD_SIMULATION_SYSTEM:** How members become the world. Every member has a primary role and context-specific positions. The position system uses TypeScript interfaces where every live surface tracks slotNumber, userId, role, and status. The World Activity Engine shows how real signals drive world state — room joins/leaves, streams going live, rankings changing, sponsors activating. The World Time System defines 8 cycles from real-time (continuous) to yearly (Jan 1 awards).

**PRELIVE_READINESS_SYSTEM:** The complete 3-stage lifecycle. Stage 1 (Pre-Live): Green Room → Soundcheck → Lineup/Call Time with DB state `event.status = 'pre_live'` and a watchdog that alerts host 5min before. Stage 2 (Live): Stage Director Engine takes control, announcer introduces performers, watchdog monitors for stuck states. Stage 3 (Post-Live): Immediate results posting, within-1-hour highlights, within-24-hour full recap with stats updates and leaderboard changes.

**OVERLAY_STACKING_SYSTEM:** 10-layer visual priority stack from page content (Layer 1) to system alerts (Layer 10). Priority rules for preview window, sponsor overlays, and emergency broadcasts. Complete animation rules table with durations, easings, and behaviors for every interaction. Number Movement System with AnimatedCounter component spec — countdowns color-shift at <30s (warning) and <10s (critical).

---

### `device-distribution/DEVICE_AND_DISTRIBUTION_SYSTEMS.md`
**Three system specifications:**

**DEVICE_PLATFORM_SYSTEM:** Full device coverage map — 12 device types from desktop browser to kiosk/venue screen, each with app type, render mode, and priority. Five render modes defined: Full Mode (desktop/laptop), Compact Mode (phone), Watch Mode (TV), Display Mode (venue screen), Operator Mode (command station). Second Screen System explains phone-as-remote-control for TV, and tablet-as-health-monitor for laptop operator sessions.

**SUBSCRIPTION_SYSTEM:** 7-tier subscription map from Free ($0 watch-only) to Sponsor ($99/mo campaign tools). App store compliance rules for Apple (IAP required, 15-30% commission, no web-cheaper messaging, restore purchases required), Google (Play Billing required), and TV apps (no purchase in app, sign in with existing account). Device sync flow: subscribe on any device → entitlement synced to all devices → graceful downgrade if lapses, never hard-lock.

**APP_STORE_COMPLIANCE_SYSTEM:** Complete checklist for Apple App Store (privacy policy, age rating, screenshots for 6.7" and 12.9", app preview video, 1024×1024 icon, IAP setup, restore purchases, privacy nutrition labels, Sign in with Apple) and Google Play (privacy policy, data safety form, content rating, screenshots, feature graphic, IAP). Current status: all items MISSING — this is a launch blocker.

---

### `monitoring-ops/MONITORING_FLAGS_ANALYTICS_LOAD.md`
**Four system specifications:**

**SLO_AND_ALERTING_SYSTEM:** Service Level Objectives for 9 critical services — homepage (99.9%, <2.5s), API (99.5%, <200ms), live room join (99%, <1s), auth (99.9%, <1s). Escalation chain from P0 (Big Ace, <5min) to P4 (log only).

**FEATURE_FLAG_SYSTEM:** Complete flag registry with 20+ flags organized by Phase 1 (live at launch), Phase 2 (after initial launch), Phase 3 (rooms/live), Phase 4 (shows/games), Safety, and Kill Switches. Big Ace can toggle any flag from /admin/feature-flags with 60-second cache propagation.

**ANALYTICS_EVENT_TAXONOMY:** Complete event naming convention (`[object].[action]`) with full taxonomy — Homepage Events, Crown/Rankings, Live Rooms, Preview Window, Economy, Social, Search/Discovery, Bot Events, and Errors. Every event includes its payload fields.

**LOAD_AND_STRESS_TEST_SYSTEM:** 5 load test scenarios — Homepage Peak (1,000 concurrent), Room Rush (50 concurrent rooms), Event Launch (500 users joining in 60s), Crown Rotation (300 users watching during Sunday rotation), Stream & Win Peak (200 simultaneous streamers). Exact k6 commands for each test.

---

### `asset-pipeline/ASSET_BILLING_KNOWLEDGE.md`
**Three system specifications:**

**ASSET_PIPELINE_SYSTEM:** Complete pipeline from upload to CDN — 9-step flow including validation, virus/content scan, transcode, thumbnail generation (4 sizes from 800×600 to 60×60), CDN storage, DB record creation. Supported media types with max sizes and transcode targets. Approved external sources (YouTube, Spotify, Apple Music, SoundCloud, Instagram) with ownership verification requirement. Fallback assets for every media type that inherit the artist's accent color.

**BILLING_AND_ENTITLEMENT_SYSTEM:** Three purchase flows — Web (Stripe Checkout), iOS (Apple IAP with Face ID confirmation), Android (Google Play Billing). Restore Purchases flow (required by Apple/Google). Entitlement sync on 4 triggers including 24-hour background refresh. Subscription lapse handling that never deletes data and allows resubscription at any time. Refund policy with 48-hour auto-refund window.

**KNOWLEDGE_BASE_SYSTEM:** User-facing help topics organized by Getting Started, Rooms & Events, Economy & Points, and Troubleshooting. Complete Moderator Playbook with when-to-mute, when-to-kick, when-to-escalate-to-Big-Ace, and never-do rules. Complete Operator Playbook with exact step-by-step procedures for: Emergency Room Shutdown, Crown Override, and Emergency Broadcast — each with navigation path and confirmation steps.

---

### `proof-launch/PROOF_MATRIX_AND_LAUNCH.md`
**Three critical operational documents:**

**PLATFORM_PROOF_MATRIX:** Every system organized into proof sections — Slice 0 Build Proof (9 checks with exact commands and expected outputs), Homepage Proof (13 checks including the CRITICAL lobby wall discovery-first sort check), Auth/Onboarding Proof (10 checks including role routing verification for Marcel/Big Ace/Jay Paul), Economy Proof (6 checks), and Room Proof (10 checks including voice channel, dual audio, turn queue, and session recovery).

**ONBOARDING_PROOF_PACK:** Pre-onboarding checklist (infrastructure + content + economy items that must be green). Three onboarding procedures: First Admin (Big Ace), First Artist (Marcel/BJ with Diamond verification), First Fan. Each includes exact steps and what screenshot to save as proof.

**LAUNCH_DAY_COMMAND_PACK:** T-24 hours commands (full build, all tests, load test, DB migration, seed), T-2 hours commands (deploy, smoke test, verify bots), T-0 commands (enable feature flags in order), and Rollback Plan (enable read-only mode → status message → diagnose → fix in staging → re-test → disable read-only).

---

### `component-shells/COMPONENT_SHELLS.tsx`
**12 production-ready component shells in TMI visual language:**

ArenaRoomShell — Stage area + preview dock + performer tiles + audience + controls + chat, all with data-slot attributes for Copilot wiring.

CypherRoomShell — Stage + performer + beat display + queue + audience + controls.

MiniCypherRoomShell — Open drop-in interface with Jump In / Watch / Request Beat actions.

BackstageRoomShell — Pre-live staging with countdown, lineup, soundcheck status, and Mark Ready button.

LobbyWallPanel — 8-grid with CRITICAL comment: sorted by viewers ASCENDING — 0 viewers = position 1.

CountdownCard — Props-driven with 5 variants (premiere/event/battle/cypher/sponsor), data-slot for countdown digits.

ArtistHeroPanel — Full hero with background photo bleed, avatar, rank, name, tier badge, genres, stats, and 4 action buttons.

DiamondTierBadge — 5 tiers (free/bronze/gold/diamond/signature) with correct CSS glow colors. Diamond uses cyan (#00E5FF) with 66% opacity glow. This badge must show for Marcel and BJ.

VenueHeroPanel — Venue identity, type, location, digital twin badge, stats, and 3 action buttons.

SharedPreviewStagePanel — 5 modes (artist/producer/sponsor/prize/venue), mode badge, owner display, media area with embed target data-slot, title, and non-interference comment.

GlobalCommandCenterShell — "GLOBAL ADMIN COMMAND" header matching the PDF (page 3), health grid with 6 panel slots, and 3 emergency action buttons.

ProducerBeatLocker and ProducerRoomShell available as additional shells in the file.

---

### `bot-specs/MISSING_BOT_MANIFESTS.json`
**10 complete bot manifest objects with full governance rules:**

stage-director-bot — Controls room flow, fires announcements, manages round transitions. Includes 7 announcement templates. Triggers on 6 event types.

scene-transition-bot — Manages preview window dock positions and transitions. Defines what it may auto-optimize (dock position, timing, fallback poster) vs. must ask first.

matchmaking-bot — 6-step routing algorithm for Random Join: filter by role → genre → capacity → discovery-first (prefer 0-5 viewers) → most recent → no-room fallback.

highlight-capture-bot — 5 trigger thresholds: reaction spike (50+ in 10s), tip milestone ($100+), vote landslide (80%+), crowd wave (hype >90%), cypher win.

results-recap-bot — Generates 5 outputs per event: results page, highlight reel, article seed (if >50 viewers), winner card data, stat updates to artist profiles.

ranking-update-bot — Updates after events and post-crown-bot on Sunday. Cannot touch crown_state.

safety-escalation-bot — 4-tier severity matrix. P0 (CSAM, doxxing, credible threats) auto-escalates. P1 auto-mutes. P2 flags for review. P3 logs only.

billing-integrity-bot — Runs every 4 hours. 5 checks including: verify Marcel and BJ always have Diamond on every run.

world-simulation-bot — Runs every 5 minutes. Manages trending signals and city activity scores.

load-spike-bot — Runs every 1 minute. Three thresholds: warning (>500ms), critical (>1000ms or >1% errors), emergency (>5% errors — offer Big Ace read-only mode option).

---

## THE COMPLETE 15-PACK SYSTEM

| Pack | Core Contents |
|---|---|
| 1–3 | UI components + magazine navigation |
| 4–5 | Full cast system |
| 6–7 | Live events + 15 rooms |
| 8 | System integrity |
| 9 + 9-W | Product layer + wiring handoff |
| 10 | Deploy + onboarding + completion boards |
| 11 | Three homepages + simulation system |
| 12 | Control + learning + evolution |
| 13 | ENV + configs + types + Copilot prompts |
| 14 | Brand protection + language system |
| **15** | **Master governance + World sim + Device/Distribution + Proof + Launch** |

---

## THE THREE-BACKLOG SPLIT (FINAL)

### Claude Creates (Visual Shells + Docs)
Everything in Pack 15 that is a shell, component, or documentation file.

### Copilot Wires (Runtime + Routes)
- Normalize layout.tsx provider order
- Wire artist slug route to DB
- Wire room families to providers
- Wire countdown/timer engine
- Wire lobby wall discovery-first sort
- Wire preview window into room families
- Wire feature flag system
- Wire billing/subscription
- Wire asset upload pipeline
- Run all proof gates per Pack 12

### VS Code Proves (Build + Deploy)
- Fix Cloudflare build blockers
- Run smoke tests
- Run load tests
- Run onboarding proofs
- Deploy to production
- First member onboarding

---

## FINAL STATUS

**After all 15 packs: The planning side is COMPLETE.**

The platform has full documentation, architecture, component shells, bot manifests, proof gates, and launch procedures for every system from homepage to rooms to venues to economy to device distribution.

**The remaining work is Copilot wiring + VS Code proving — not more planning.**

```
CURRENT ACTIVE BLOCKER:
Cloudflare Pages build failing for musicians-index-api and musicians-index-web

FIX: Apply Slices 0-3 from Pack 13 COPILOT_PROMPT_PACK.md
THEN: Wire systems in order per COPILOT_WIRING_SLICES.md (Pack 12)
THEN: Prove each slice per PLATFORM_PROOF_MATRIX.md (Pack 15)
THEN: Launch per LAUNCH_DAY_COMMAND_PACK.md (Pack 15)
```

---

*Pack 15 — Final Completion Layer v1.0*
*BerntoutGlobal XXL / The Musician's Index*
*"This is your stage, be original."*
