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

Where these live (recommended repo layout)
- packages/core/scene-engine
- packages/core/script-engine
- packages/core/bot-orchestrator
- packages/core/event-router
- packages/core/realtime-engine
- packages/core/media-engine
- packages/core/asset-engine
- packages/core/animation-engine
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

Data and config
- data/assets/
- data/animations/
- data/sprites/
- data/expressions/
- data/lipsync/
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
- analytics hooks
- moderation hooks
- owner metadata

Core chains (examples)
- Avatar chain: face-scan → avatar-engine → expression-engine → lip-sync-engine → animation-engine → scene-engine
- Live artist chain: artist audio → media-engine → lip-sync-engine → avatar rig → expression-engine → animation-engine → live-stage scene
- Show chain: script-engine → host/cohost lines → lip-sync-engine → expression-engine → animation-engine → scene-engine → audience reactions
- UI chain: asset-engine → image-code registry → ui-system → animation-engine → visual validator

Final build order (recommended)
1. Platform Kernel, State Engine, Event Bus
2. Scene Engine, Script Engine
3. Asset Engine, Animation Engine, Expression Engine, Sprite Engine, Lip Sync Engine
4. Avatar Engine
5. Realtime Engine, Media Engine
6. Bot Orchestrator, Event Router
7. UI system + theme / image-code system
8. Magazine flow & core routes
9. Artist dashboard & live-stage
10. Shows / Games / Battles / Watch Party
11. Store / Season Pass / Sponsors
12. Ranking / Crown / Freshness
13. QA / validation / performance passes

Final lock rules (must enforce)
1. No module without: route plan, scene/script/asset/animation/expression packs, fallback states, analytics & moderation hooks, owner.
2. No visual drift: enforce `packages/ui-system` tokens, image-code registry, and VisualConsistencyBot rules.
3. No broken chains: chain registry must list entry → scene → script → asset → bot chain → exit.
4. No duplicate systems: consult feature registry before adding new modules.
5. No raw experiences: every major page/room must be staged (scene + script + bots + fallbacks).
6. Avatar/lip-sync/expression/animation/sprite/asset engines are CORE — not optional.

Docs to keep updated
- docs/MASTER_BLUEPRINT.md (this file)
- docs/ENGINE_STACK.md
- docs/BOT_CHAINS.md
- docs/PAGE_FLOW.md
- docs/SCENE_SCRIPT_RULES.md
- docs/ASSET_IMAGE_CODE_RULES.md
- docs/AVATAR_LIPSYNC_RULES.md
- docs/BUILD_ORDER.md

Next actions (suggested)
1. Create core engine package skeletons for lip-sync/asset/animation/sprite/expression.
2. Lock `packages/ui-system` and image-code registry.
3. Add VisualConsistencyBot & ChainValidatorBot to `packages/core` test-suite.
4. Run triage in `tmi-platform` and produce `tmi-change-list.txt` before committing snapshots.

Contact / ownership
- Add owner metadata to each module and engine before committing major changes.

---
Generated: concise MASTER_BLUEPRINT for in-repo reference.
