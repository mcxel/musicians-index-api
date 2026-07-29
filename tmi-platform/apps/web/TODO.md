# Pass 2 TODO (Observatory Runtime + Thorough Certification)

- [x] Read and analyze `AdminObservatoryChat.ts` call path
- [x] Confirm Observatory page mounts chat runtime without client crash
- [x] Verify `/api/admin/observatory-chat` wiring and error handling
- [ ] Re-test `/api/admin/observatory-summary` (auth + unauth) for stable behavior
- [ ] Run thorough certification sweep across requested endpoint groups
- [ ] Produce PASS/FAIL matrix + remaining blockers + deployment recommendation

# TODO

## EOS Master Roadmap

### Phase 1 — EOS Foundation ✅
- [x] Core contracts, ExperienceRegistry, VenueRegistry, WidgetRegistry
- [x] CameraRegistry, AnimationRegistry, AssetRegistry, RoleRegistry, ThemeRegistry
- [x] RuntimeValidator + bootSequence + StageLoader + EOSKernel
- [x] Certification page `/eos/test`
- [x] TypeScript clean (tsc --noEmit exit 0)

### Phase 2 — Dashboard Runtime ✅
- [x] DockRegistry — data-driven fan/performer/admin nav + actions
- [x] MasterControlDock refactored to registry renderer
- [x] LOBBY removed from primary nav; EXPLORE promoted
- [x] Fan center = Camera; Performer center = Go Live (broadcast)
- [x] Explore cards wired through StageLoader (ExploreDiscoveryClient)
- [x] PlaylistPanelOverlay uses real `/api/playlists` + `/api/user/content` data
- [x] Side rail: Memory Wall photo strip + YoPho quick panel
- [x] MembershipRegistry bridge (tier → playlist + venue skin unlocks)
- [x] Gate 1 runtime evidence — dashboard landing, /live/go poll, Rule 26 role gates

### Phase 3 — Flight Deck (IN PROGRESS)
- [x] Pass 3.1 — FlightDeckBezel + ThemeRegistry bezel tokens (obsidian_gold, neon_cyan, performer_purple, admin_gold)
- [x] Pass 3.2 — MonitorSatelliteSystem matrix/cinema modes + bezel wrap + WebRTC persistence
- [x] Pass 3.3 — WorkspaceLayout shell (header / left / center / right / dock)
- [x] Pass 3.4 — Side rail framework (DashboardRailFramework — slots only, not full feature drawers)
- [x] Pass 3.5 — Framer-motion cinema transition + rail collapse
- [ ] Phase 3 certification — browser verify monitors, cinema toggle, rails, no flicker

### Phase 4 - Experience Engine (LOCKED / ARCHIVED — competition branch Gate 1)
**Status:** Competition/broadcast runtime certified locally and published on `eos/phase-4-experiences` (skips bloated `89e52633`). Do not reopen Pass 4.1–4.6 for new feature work.

- [x] Pass 4.1 - EosArenaEventShell layered orchestrator + ExperienceWidgetLayer
- [x] Pass 4.2 - BattleExperience + ExperienceComponentRegistry + StageLoader mount
- [x] /battles/live invokes StageLoader → BattleExperience (thunder-dome)
- [x] Pass 4.3 - CypherExperience + CypherRuntimeProvider + layer-group widgets + /cypher/stage StageLoader mount
- [x] Pass 4.3 browser certification - `/cypher/stage` PASS (Queue / Mic / Beat / Reactions / Bezel / Venue)
- [x] Boot unblock - `preloadAssetBundle` + StageLoader LOAD_ASSETS hard timeout (was hanging on missing/slow media)
- [x] Pass 4.4 - ChallengeExperience + `/challenge/stage` StageLoader mount + browser smoke PASS
- [x] Pass 4.5 - Monday Night Stage EOS mount + browser cert PASS (`/shows/monday-night-stage`)
- [x] Pass 4.6 - Deal or Feud EOS mount + browser cert PASS (`/shows/deal-or-feud`)
- [x] Gate 1 remote publish - branch `eos/phase-4-experiences` (cherry-picks of 4fe38bbc + 8ec2f725; never 89e52633)

#### Phase 4.7 - Vocal Improv scaffold (CONFIG ONLY)
**Status:** Scaffold complete. No pitch/rhythm ML. No fake occupancy.

- [x] ocal_meter widget in WidgetRegistry (hud) + ExperienceWidgetLayer honest pending case
- [x] Experience defs jazz-scat-battle + gibberish-battle (category BATTLE, venueId attle, packs attle_standard / attle_transitions)
- [x] featureFlags: ocal_improv, jazz_scat | gibberish, scoring:jazz_scat_v1 | scoring:gibberish_v1 (no subCategory on ExperienceDefinition)
- [x] VocalImprovScoringRegistry.ts - Jazz Scat vs Gibberish criteria (data only)
- [x] VocalImprovExperiences.tsx -> EosArenaEventShell (@/components/eos/ArenaEventShell) via useExperienceRuntime
- [x] ExperienceComponentRegistry entries (no parallel VocalImprovComponentRegistry)
- [x] Routes /battles/jazz-scat + /battles/gibberish StageLoader mounts
- [x] ExploreExperienceMap cards
- [ ] Browser certify /battles/jazz-scat + /battles/gibberish boot->RUNNING
- [ ] Pitch/rhythm detection engine (NOT started - future)

#### EOS Rotation Network - LOCKED ARCHITECTURE / FUTURE (do not implement fake schedulers)
**Status:** Documented direction only. **Rule 20:** no fabricated schedules, no fake room occupancy, no stub RotationScheduler that invents a program board.

Target architecture (when real runtime exists):

| Piece | Role |
|---|---|
| RotationScheduler | Owns 15-minute program blocks; never invents occupancy |
| PublicProgramBoard | Surfaces the real schedule to fans (empty/honest until scheduled) |
| PersistentArenaRoom | Long-lived arena room that hosts successive blocks |
| 15-min blocks | Fixed rotation windows (Jazz Scat -> Gibberish -> Battle -> ...) |
| Movie-theater rooms | Shared timeline rooms (listen/watch together) - distinct from competition stages |

**Do not build** fake schedulers, mock program boards, or fabricated "now playing" rooms until a real schedule source exists. Phase 4.7 Vocal Improv experiences are standalone StageLoader mounts; they are **not** wired into a Rotation Network runtime.

#### Phase 4.3-4.6 Certification Ledger
| Certification | Status |
|---|---|
| EOS (apps/web) TypeScript | PASS (touched EOS files clean; monorepo hold remains) |
| Browser Runtime `/cypher/stage` | PASS - RUNNING + Queue/Mic/Beat/Reactions |
| Browser Runtime `/challenge/stage` | PASS - RUNNING + Bezel + Venue + Discovery |
| Browser Runtime `/shows/monday-night-stage` | PASS - boot→RUNNING, FlightDeckBezel, BROADCAST CONTROLS, STREAM LIVE, no CRITICAL_FAILURE |
| Browser Runtime `/shows/deal-or-feud` | PASS - boot→RUNNING, FlightDeckBezel, PRIZE PANEL, DEAL DOORS, no CRITICAL_FAILURE |
| Root cause of Cypher stall | Fixed - LOAD_ASSETS hung on video preload with no timeout |
| Root cause of Monday role block | Fixed - RoleRegistry allows LIVE_SHOWCASE + soft-allow via experience.permissions; monday-night-stage category STAGE_SHOW |
| Root cause of DealOrFeud crash | Fixed - `arenaEventTypeToVenueType("deal-or-feud")` mapped to nonexistent `"game-show"`; now `"deal-or-feud"`. EOS `suppressPresentation` also skips AvatarVenueAnchor (R3F PropLoader hard-crash). |
| Monorepo TypeScript | Existing unrelated failures (Repository Certification Hold) |
| Production Certification | Not yet complete (tracked outside Gate 1) |

#### Queued after competition branch (not started)
- [ ] Branch A - VideoLoungeShell (presence frames) — **QUEUED** (after Phase 4 competition LOCKED)
- [ ] Branch B - WorldDanceShell (full-body avatars) — **QUEUED** (after Phase 4 competition LOCKED)

#### Repository Certification Hold (does not block EOS)
Outstanding monorepo `tsc` failures - track separately from EOS milestones:
- `apps/web/src/app/api/mission-control/route.ts` - missing `@bernout/agent-network`
- `apps/web/src/app/api/users/search/route.ts` - Prisma field mismatches

### Phase 5 - AvatarRegistry
**Status:** Phase 5A COMPLETE (contracts + boot integrity). Phase 5B mesh runtime IDLE. No mesh/GLB runtime, face-scan pipeline, or Branch A/B shells.

#### Phase 5A — Avatar Identity / AvatarRegistry contracts (COMPLETE)
- [x] Audit existing avatar registries/types/engines (no new parallel identity systems)
- [x] EOS `avatarContracts.ts` — EosAvatarIdentity/Profile, Skeleton, AttachmentPoints, AnimationProfile, ClothingCompatibility, PhysicsProfile, FaceScanProfile (schema), VoiceProfile (schema), InventoryLinks, Permissions
- [x] `registries/eos/AvatarRegistry.ts` — role permissions (Rule 26 FAN-only ownership), skeleton/attachment/animation/physics catalogs, quick_change vs studio_required clothing rules, identity draft factories
- [x] Barrel exports — `core/eos/index.ts` + `registries/eos/index.ts`
- [x] Boot glue — `assertAvatarRegistryIntegrity()` called from `bootSequence` LOAD_REGISTRIES (no mesh / no experience behavior change)
- [x] TypeScript check on touched files (`pnpm exec tsc --noEmit` in apps/web — Phase 5A files clean; pre-existing unrelated monorepo errors remain)
- [x] Phase 5A certification (contract imports resolve; AvatarRegistry in EOSKernel boot; no runtime avatar engine claimed)

#### Phase 5B — Mesh / AvatarEngine runtime (IDLE — do not start)
Gate: 5A complete · 5B idle

**Already existed (bridged, not duplicated):**
- `lib/avatars/UnifiedAvatarRuntime.ts` — AvatarEntity / appearance / kinds
- `lib/avatars/AvatarSocketSystem.ts` — socket IDs + RIG_SOCKET_MAP
- `lib/avatar/HeadAttachmentProfile.ts` — neck/scalp/hat collision constants
- `lib/avatar/avatarInventoryEngine.ts` + `avatarPersistence.ts` — inventory/loadout
- `systems/avatar/*` — evolution poses/costumes/expressions
- Prisma `AvatarIdentity` + `AvatarConfig` — persisted fan DNA / bobblehead JSON
- `lib/hosts/npcAvatarRegistry.ts` — system NPC entities
- `lib/assets/avatarRegistry.ts` — asset reconstruction map (different purpose)
- `lib/avatars/AvatarRendererRegistry.ts` — 2D renderer switch (not 3D)

**Deferred to Phase 5B+ (do not start in 5A):**
- AvatarEngine mesh loader / GLB runtime
- Face scan / ML / rigging / lip sync (schema exists; pipeline does not)
- Wiring FaceScanIdentityEngine stubs into production UI (forbidden — Rule 20)
- Branch A VideoLoungeShell / Branch B WorldDanceShell
- Full Phase 5 certification of live avatar rendering

### Phase 6-8 - YoPho, Runtime, Certification (PENDING)

---

## Legacy Flight Deck (Admin Observatory)
- [x] Pass 1: Build Flight Deck directly in OverseerClientPage.tsx (3-column, natural scroll, dual 16:9 stacked monitors)
- [ ] Pass 1: Add symmetric rail presets (22/56/22, 18/64/18, 12/76/12, 0/100/0)
- [ ] Pass 1: Place Live Feed Explorer below monitor stack
- [ ] Pass 1: Add full-width lower analytics section below fold
- [ ] Pass 2: Validate no smushing / no viewport clipping / monitors preserve 16:9
- [ ] Pass 3: Extract proven reusable parts into FlightDeckShell/AdminDesignSystem/MediaMatrixEngine
- [ ] Pass 4: Implement monitor modes (single/stacked/quad/cinema) with reversible animation
- [ ] Pass 5: Static checks (tsc, build, git diff --check, git status --short)
- [ ] Pass 6: Runtime checks on /admin/observatory (scrolling, rails, cinema, role/routing safety)
