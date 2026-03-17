# MASTER_BLUEPRINT — BerntoutGlobal XXL / The Musician's Index

Purpose
- Single source of truth for engines, modules, UI, bots, chains, asset/image-code rules, and build order.
- Prevents drift and enforces the locked platform architecture.

Locked core engine stack
- Platform Kernel (auth / permissions / session / module ownership)
- State Engine (global state authority)
- Event Bus (global event routing)
- Scene Engine
- Script Engine
- Bot Orchestrator
- Event Router
- Realtime Engine (WebSocket/presence)
- Media Engine (encoding/clip generation/CDN)
- Asset Engine (image-code registry, asset versioning, CDN mapping)
- Animation Engine (UI & avatar motion presets)
- Avatar Motion, Reaction, Presence, and Live Trends Engine
- Sprite Engine (2D sprites, emotes, overlays)
- Expression Engine (avatar facial expressions, crowd mood)
- Lip Sync Engine (talking/singing/cheer sync)
- Avatar Engine (face-scan → rig → preview → save)
- Discovery Engine
- Recommendation Engine
- Notification Engine
- Revenue & Reward Engines
- Campaign Engine
- Ranking & Crown Engines
- Freshness Engine
- Analytics Engine
- Security / Moderation / Fraud Detection
- Privacy Engine
- Performance Scaling / CDN / Caching
- Backup / Data Warehouse
- Localization / Accessibility
- Improvement Engine

Locked official platform modules
- Magazine & Discovery System
- Poll Results Reporting and Editorial Publishing Engine
- Live Trends Poll and Trivia Engine
- Avatar Motion, Reaction, Presence, and Live Trends Engine
- Live Stage / Room Presence System
- Store / Motion Economy / Rewards System
- Creator Academy & Originality Guidance System

Where these live (recommended repo layout)
- packages/core/scene-engine
- packages/core/script-engine
- packages/core/bot-orchestrator
- packages/core/event-router
- packages/core/realtime-engine
- packages/core/media-engine
- packages/core/asset-engine
- packages/core/animation-engine
- packages/core/avatar-motion-engine
- packages/core/sprite-engine
- packages/core/expression-engine
- packages/core/lip-sync-engine
- packages/core/avatar-engine
- packages/core/ranking-engine
- packages/core/analytics-engine

- packages/ui-system (design tokens, components, image-code registry)
- modules/magazine
- modules/live-stage
- modules/shows
- modules/games
- modules/battles
- modules/watch-party
- modules/store
- modules/season-pass
- modules/sponsors
- modules/artist-dashboard
- modules/avatar-motion-presence
- modules/polls-trivia
- modules/editorial-reporting
- modules/live-trends
- modules/room-orchestration

Data and config
- data/assets/
- data/animations/
- data/sprites/
- data/expressions/
- data/lipsync/
- data/motion/
- data/camera/
- data/polls/
- data/trivia/
- data/editorial/
- data/scenes/
- data/scripts/

Module contract (every module must declare)
- scene pack
- script pack
- asset pack (image codes)
- animation pack
- expression pack
- optional lip-sync pack
- bot chain
- fallback states (loading/empty/error/recovery)
- accessibility settings + reduced-motion path
- performance profile (high / medium / low)
- monetization hooks if inventory/store/rewards are involved
- analytics hooks
- moderation hooks
- owner metadata

Core chains (examples)
- Avatar chain: face-scan → avatar-engine → expression-engine → lip-sync-engine → animation-engine → scene-engine
- Live artist chain: artist audio → media-engine → lip-sync-engine → avatar rig → expression-engine → animation-engine → live-stage scene
- Show chain: script-engine → host/cohost lines → lip-sync-engine → expression-engine → animation-engine → scene-engine → audience reactions
- UI chain: asset-engine → image-code registry → ui-system → animation-engine → visual validator
- Motion presence chain: room-state → avatar-motion-engine → expression-engine → lip-sync-engine → camera-variation → realtime-engine → live-room scene
- Poll editorial chain: poll-run → result snapshot → editorial summary → placement rules → magazine article → archive / recap / discovery recirculation
- Live trends chain: trend scout bot → question library refresh → moderation review → timed poll/trivia release → results analytics → editorial recap

Locked module additions
- Avatar Motion, Reaction, Presence, and Live Trends Engine sits between avatar/profile, live rooms, fan engagement, and store/monetization.
- Poll Results Reporting and Editorial Publishing Engine is mandatory for the magazine layer. Polls are incomplete until major results can become editorial content.
- Live Trends Poll and Trivia Engine must feed current-year topics, rotating question packs, editorial summaries, and archive recaps.

Required subchains for avatar motion layer
- Motion Pack Chain: create → preview → equip → purchase → trigger → cooldown
- Lip Sync Chain: detect active speaker → map amplitude/phoneme family → animate mouth → highlight speaker → decay to idle
- Camera Variation Chain: choose approved motion ending → apply bounded randomness → honor cooldown → avoid back-to-back repeats
- Fun Orchestration Chain: room energy → synchronized reactions → crowd bursts → camera nudges → trivia / prompt insertions
- Motion Moderation Chain: spam detection → density caps → offensive customization filter → fallback intensity mode
- Performance Fallback Chain: high → medium → low based on device/network/room density

Required subchains for poll/editorial layer
- Question Library Chain: evergreen + current-year + event-based + category packs
- Poll Result Snapshot Chain: close/snapshot → rankings → splits → charts → retention
- Editorial Draft Chain: results writer bot → trend recap bot → fact/moderation review → magazine placement bot
- Archive Chain: section archive → category archive → yearly archive → best-of archive
- Freshness Chain: weekly trend pull → monthly refresh → seasonal/event packs → retirement rules
- Sponsor/Revenue Chain: optional sponsor placement → safe labeling → analytics attribution

Final build order (recommended)
1. Platform Kernel, State Engine, Event Bus
2. Scene Engine, Script Engine
3. Asset Engine, Animation Engine, Expression Engine, Sprite Engine, Lip Sync Engine
4. Avatar Engine
5. Avatar Motion, Reaction, Presence, and Live Trends Engine (Phase A-B)
6. Realtime Engine, Media Engine
7. Bot Orchestrator, Event Router
8. UI system + theme / image-code system
9. Magazine flow & core routes
10. Poll Results Reporting and Editorial Publishing Engine + Live Trends Poll and Trivia Engine
11. Artist dashboard & live-stage
12. Shows / Games / Battles / Watch Party
13. Store / Season Pass / Sponsors / Motion Economy
14. Ranking / Crown / Freshness / Archive loops
15. QA / validation / performance / accessibility passes

Practical staged build order for new scope
- Phase A: avatar persistence, sprite display, basic idle motion, speaker highlight, originality guidance in onboarding.
- Phase B: head bob / sway, simple lip sync, emote triggers, purchased motion inventory, active-speaker clarity.
- Phase C: room reactions, camera variation, ending pools, live polls/trivia, poll result article drafting.
- Phase D: adaptive learning, choreography, premium motion economy, trend bots, editorial optimization, archive intelligence.

Final lock rules (must enforce)
1. No module without: route plan, scene/script/asset/animation/expression packs, fallback states, analytics & moderation hooks, owner.
2. No visual drift: enforce `packages/ui-system` tokens, image-code registry, and VisualConsistencyBot rules.
3. No broken chains: chain registry must list entry → scene → script → asset → bot chain → exit.
4. No duplicate systems: consult feature registry before adding new modules.
5. No raw experiences: every major page/room must be staged (scene + script + bots + fallbacks).
6. Avatar/lip-sync/expression/animation/sprite/asset engines are CORE — not optional.
7. Polls/trivia are not complete until they have result snapshots, editorial placement, archive rules, and freshness controls.
8. Any motion-heavy room must define safety caps, reduced-motion fallback, and mobile performance ladder before ship.
9. Camera variation must use bounded randomness and approved ending pools only.

Docs to keep updated
- docs/MASTER_BLUEPRINT.md (this file)
- docs/AVATAR_MOTION_REACTION_PRESENCE_ENGINE.md
- docs/POLL_RESULTS_EDITORIAL_ENGINE.md
- docs/ENGINE_STACK.md
- docs/BOT_CHAINS.md
- docs/PAGE_FLOW.md
- docs/SCENE_SCRIPT_RULES.md
- docs/ASSET_IMAGE_CODE_RULES.md
- docs/AVATAR_LIPSYNC_RULES.md
- docs/BUILD_ORDER.md
- docs/VALIDATION_MATRIX.md
- docs/ENGINE_MAP.md
- docs/BOT_CHAIN_MAP.md
- docs/SCENE_REGISTRY.md
- docs/SCRIPT_REGISTRY.md
- docs/AVATAR_PIPELINE.md
- docs/MODULE_ENGINE_MATRIX.md
- docs/PAGE_FLOW_MAP.md
- docs/FALLBACK_STATE_MATRIX.md
- docs/BOT_PERMISSION_MATRIX.md
- docs/ROUTE_REGISTRY.md
- docs/SCENE_SCRIPT_MODULE_CONTRACTS.md
- docs/REWARD_INVENTORY_CHAIN.md
- docs/SPONSOR_CAMPAIGN_CHAIN.md

Next actions (suggested)
1. Create core engine package skeletons for lip-sync/asset/animation/sprite/expression.
2. Lock `packages/ui-system` and image-code registry.
3. Add VisualConsistencyBot & ChainValidatorBot to `packages/core` test-suite.
4. Run triage in `tmi-platform` and produce `tmi-change-list.txt` before committing snapshots.

Contact / ownership
- Add owner metadata to each module and engine before committing major changes.

---
Generated: concise MASTER_BLUEPRINT for in-repo reference.
