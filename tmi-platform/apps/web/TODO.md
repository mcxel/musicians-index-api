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
- [x] Pass 3.6 — Auto-Director idle-monitor assignment (registry + engine + MonitorSatelliteSystem wire)
- [ ] Phase 3 certification — browser verify monitors, cinema toggle, rails, no flicker
- [ ] Phase 3.6 browser certify — idle slots show Auto-Director cards; locked camera/live untouched; click → real entryRoute

#### Phase 3.6 / 4.8 — Auto-Director (Flight Deck idle monitors)
**Status:** Scaffold complete. Preview cards only — no StageLoader inside tiny monitors.

- [x] `MonitorAssignment` contract (`core/eos/monitorAssignment.ts`) — source USER|AUTO_DIRECTOR, contentType, contentId, priority, locked
- [x] `registries/eos/AutoDirectorRegistry.ts` — lane weights, ExperienceRegistry entryRoutes, cadence hints
- [x] `lib/eos/AutoDirectorEngine.ts` — `findIdleSlots` / `pickNextContent` / `assignSlots` (no fabricated viewer counts — Rule 20)
- [x] `hooks/useAutoDirector.ts` + `components/eos/AutoDirectorPreviewCard.tsx`
- [x] Wired into `MonitorSatelliteSystem` — idle MONITOR_A + PIP_LEFT/RIGHT; MONITOR_B stays Live Lobby Wall (locked system discovery); never steals live broadcast, user media, or camera-on
- [ ] Browser certify dashboard monitor matrix Auto-Director fills
- [ ] Optional: feed real `GlobalLiveSessionRegistry` starting-soon tiles into pool (still no fake occupancy)

#### Layer 5 — ProgramBoard + RotationScheduler (contracts scaffold)
**Status:** COMPLETE (contracts + pure engines + light Auto-Director wire). Phase 5B mesh remains IDLE.

- [x] `core/eos/programBoard.ts` — ProgramSlot, NowPlaying, StartingSoon, ProgramQueueItem, sources EXPERIENCE|LIVE_PREVIEW|SPONSOR|NEWS|FRIEND_ACTIVITY (honest empty allowed)
- [x] `registries/eos/ProgramQueueRegistry.ts` — default sequences/weights from ExperienceRegistry ids (battle, cypher, challenge, monday-night-stage, deal-or-feud, jazz-scat-battle, gibberish-battle, …) — no OverseerDeck hardcode
- [x] `lib/eos/RotationSchedulerEngine.ts` — pure `nextItem` / `advanceOnIdle` / `onExperienceFinished`; 15-min block config; no fabricated live rooms/viewers (Rule 20)
- [x] `lib/eos/ProgramBoardEngine.ts` — pure `buildBoard` + `programBoardToSuggestions` via ExperienceRegistry.entryRoute
- [x] `hooks/useProgramBoard.ts` — thin client snapshot → Auto-Director suggestions
- [x] Auto-Director prefers ProgramBoard now-playing / starting-soon when available; else discovery pool
- [x] Barrel exports — `core/eos` + `registries/eos`
- [ ] Browser certify idle monitors prefer board suggestions with real entryRoutes
- [ ] Wire real `GlobalLiveSessionRegistry` LIVE_PREVIEW / NEWS / SPONSOR / FRIEND_ACTIVITY feeds (still honest-empty until real)

#### Universal Playlist System — FUTURE APPROVED (document only)
**Status:** Approved direction — **do not implement** Spotify/BandLab/SoundCloud OAuth, download, or rip pipelines. Embed/link-only when eventually wired. Not part of Layer 5 scaffold.

#### Matchmaking / Audience Merge — LOCKED FUTURE (do not implement stubs)
**Status:** Documented architecture only. **Rule 20 / Rule 21 (No Empty Platform):** never fake opponents, fake audiences, or “AI practice opponent presented as human.” Generic EOS orchestration (not battle-only): Waiting Experience A/B → Matchmaking → Live Experience Instance → Merge audiences → Recycle empty staging rooms. Same flow for battles, cyphers, Dirty Dozens, joke-offs, dance-offs, vocal improv, future types.

Target architecture (when real engines exist — wire, don’t duplicate):

| Piece | Role |
|---|---|
| Staging pool | Waiting-room participants queue by experience type (battle/cypher/challenge/…) |
| Matchmaking | Pair / bracket from real pool (existing `BattleMatchmakingEngine` / CIS distance — extend, don’t fork) |
| Audience merge | Merge undersized waiting rooms into one live room so audiences aren’t stranded (Rule 21 No Empty Platform) |
| Recycle waiting rooms | Empty or expired waiting rooms recycle into the next opportunity — never fabricate fill |
| AudienceRuntime | Seats/presence stay on canonical `audienceRuntimeEngine` — merge moves real seat claims, never invents viewers |

**Do not build** fake “opponent found,” fabricated crowd meters, or stub merge runtimes until EventOrchestrator + audience seat systems are the wiring target. Auto-Director only surfaces **discovery preview cards** with real `entryRoute`s until then.

#### Visual Spec Archive — concept MP4s (outside git)
**Status:** Design references only — not runtime. Keep ZIP/concept videos (`Battles video base`, `Monday_Night`, `Deal_vs_Feud`, `world ance party`, lounges, etc.) in cloud/LFS outside the repo (concept PDFs archived outside repo). Ambient wired to `public/assets/videos/rooms/` via `VenueAssetRegistry` (concerts/releases fall back to stage/lounge/dance loops). Phase 5B mesh + true walkable VenueRuntime still IDLE (Rule 18 Asset Realization Directive).

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

#### EOS Rotation Network — Layer 5 scaffold COMPLETE / runtime FUTURE
**Status:** ProgramBoard + RotationScheduler **contracts + pure engines COMPLETE** (see Layer 5 above). Public UI board, PersistentArenaRoom hosting, live occupancy feeds, and Universal Playlist remain FUTURE. **Rule 20:** board "now playing" = current 15-min registry destination block — never fabricated viewers/rooms.

| Piece | Status |
|---|---|
| RotationSchedulerEngine | COMPLETE (pure; 15-min config) |
| ProgramQueueRegistry + ProgramBoardEngine | COMPLETE (ExperienceRegistry entryRoutes) |
| Auto-Director light wire | COMPLETE (prefers board suggestions when idle) |
| PublicProgramBoard UI | FUTURE |
| PersistentArenaRoom | FUTURE |
| Universal Playlist (embed/link only) | FUTURE APPROVED — no OAuth/rip |
| Matchmaking / Audience Merge | FUTURE (do not stub) |
| Phase 5B mesh / AvatarEngine | IDLE |
| Layer 6 Relationship Graph | COMPLETE (scaffold) |
| Global Performance / Instrument Registry | FUTURE APPROVED (post soft-launch) |
| Recommendation Engine | FUTURE |
| Phase 7.3 Prisma Collectibles | COMPLETE |
| Phase 7.4 Memory Wall Surface | COMPLETE (motion gallery; spatial/AI/editor deferred) |

Phase 4.7 Vocal Improv experiences remain standalone StageLoader mounts; Layer 5 only sequences their ExperienceRegistry ids into rotation suggestions.

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

### Phase 6 - YoPho (PENDING)

### Layer 6 — Relationship Graph (scaffold COMPLETE)
**Status:** Contracts + RelationshipRegistry + pure RelationshipGraphEngine + PresenceCatalog + optional memorySocialBridge COMPLETE. No social UI. No fake online friend lists. Prisma Follow/Friendship/FanClub remain product sources (not duplicated). Graph starts empty.

- [x] Audit existing — `/api/social/follow` (Prisma Follow), FanClub models/routes, Friendship model, `lib/social/*` (FollowEngine, FanFollowGraphEngine, PresenceEngine, FriendRequestEngine, DM/messaging), `AudiencePresenceProvider` / `AudiencePresenceEngine`, `RoomSessionBridge`, PerformerRegistry genres (unchanged — no duplicate)
- [x] `core/eos/relationshipContracts.ts` — RelationshipKind, RelationshipEdge, EosPresenceState, RelationshipEntityRef
- [x] `registries/eos/RelationshipRegistry.ts` — kind defs + from→to role matrix (Rule 26 aware) + `assertRelationshipRegistryIntegrity`
- [x] `lib/eos/RelationshipGraphEngine.ts` — pure in-memory: addEdge, removeEdge, getFollowers, getFollowing, getBandMembers, isBlocked, getFriends (empty by default)
- [x] `lib/eos/PresenceCatalog.ts` — reads `PresenceEngine` / audience entity / RoomSessionBridge; else OFFLINE; `listOnlineFriends` always `[]` until real feed
- [x] `lib/eos/memorySocialBridge.ts` — WINNER_DECLARED → FRIEND_ACTIVITY suggestions only when viewer has real FRIEND edges; else `[]`
- [x] Barrel exports — `core/eos`, `registries/eos`, `lib/eos`
- [ ] Bridge Prisma Follow/Friendship into RelationshipGraphEngine (future — not this scaffold)
- [ ] Social UI / friends online wall (future — Rule 20 honest empty until real)

#### Global Performance Registry / Instrument Registry — FUTURE APPROVED FEATURE
**Status:** Post soft-launch / catalog expansion. Documented direction only. **Do NOT** dump 100 instruments as fake runtime inventory (Rule 20). Wire a real catalog when product needs it — not part of Layer 6 scaffold.

#### Recommendation Engine — FUTURE
**Status:** Not started. Do not stub fake recommendations or fabricated “people you may know.”

| Piece | Status |
|---|---|
| Layer 6 Relationship Graph scaffold | COMPLETE |
| Prisma social → graph bridge | FUTURE |
| Social network UI | FUTURE (out of scope) |
| Global Performance / Instrument Registry | FUTURE APPROVED (post soft-launch) |
| Recommendation Engine | FUTURE |
| Phase 5B mesh / AvatarEngine | IDLE |
| Phase 7.3 Prisma Collectibles persistence | COMPLETE |
| Phase 7.4 Memory Wall Surface (motion gallery) | COMPLETE — media DB SoT; ledger = event log only; spatial/AI/full editor deferred |
| Collections Engine (media library) | SCAFFOLD COMPLETE — Collection/MediaAsset contracts + Prisma evolve + `/api/memory/collections`; 7.4 still SoT via collectibles |
| Achievement Collectibles Fan/Performer parallel | SCAFFOLD / FUTURE — contracts + Prisma `UserAchievementCollectible`; no fake grants |
| Analytics Fan/Performer parallel | SCAFFOLD / FUTURE — contracts + honest reader; no full dashboard UI |
| Seasonal collectibles | FUTURE |
| Layer 6 Prisma social → graph bridge | DEFERRED / FUTURE |
| Universal Playlist OAuth | FUTURE APPROVED — no OAuth/rip |

### Phase 7 — Memory & Collectibles Engine
**Status:** Pass 7.1–7.2 scaffold COMPLETE (in-memory competition ledger). **7.3 Prisma Collectibles COMPLETE.** **7.4 Memory Wall Surface COMPLETE** (motion-native gallery). Deferred: spatial 3D room, AI search, full non-destructive editor UI.

**Hard separation (Marcel product lock — three-area model):**
- **1. Memory Wall / Collections (MEDIA)** = personal photos, videos, motion pairs, YoPho, collectible tickets, posters, keepsakes, albums/Collections — Prisma `MemoryCollectible` / `MemoryAlbum` (**gallery feed SoT**). Collection terminology via `collectionsContracts` / `CollectionRegistry` / `/api/memory/collections`
- **2. Achievements / Showcase Collectibles (PROGRESSION)** = belts, badges, trophies, Golden/Platinum/Diamond participation tickets, seasonal — `achievementCollectibleContracts` + `UserAchievementCollectible`. Profile Collections hub may **tab/link** here — never stuff wins into photo MotionGrid
- **3. Analytics (STATS)** = Fan vs Performer metrics — `roleAnalyticsContracts` + honest reader (zeros/empty, no Math.random)
- **EOS MemoryLedger** = competition/runtime history (WINNER_DECLARED, MATCH_COMPLETED, etc.) → **Achievement path** (`achievementBridge`) — stays in-memory; never dumps into photo wall
- **Ledger media side-effects only:** after a real collectible save, may emit `MEDIA_CAPTURED` / `MEDIA_SAVED` / `TICKET_COLLECTED` as event log — wall must NEVER subscribe to competition kinds for cards
- **Out of scope for Memory Wall:** playlists/music, tips, rankings/achievements, relationship graph
- **UnlockMethod:** no Prisma model — soft `unlockAccess` FUTURE only (FREE | MEMBERSHIP | SPONSOR_GIFT)
- **EOS AssetRegistry:** venue materials only — does NOT own user photos

#### Pass 7.1 — Ledger + Registry (DONE)
- [x] `core/eos/memoryRegistry.ts` — MemoryEventKind, LedgerEntry, MemoryHighlight, importance kind sets, labels/icons
- [x] `core/eos/memoryLedger.ts` — append-only singleton (`record` / `subscribe` / `getByActor|Room|Experience`) — competition/runtime only
- [x] `core/eos/highlightEngine.ts` — promote + subscribeHighlights + FEATURED/LEGENDARY suggestion helpers
- [x] `core/eos/memoryBridge.ts` — achievement/history adapter only (not photo wall)
- [x] Barrel exports via `core/eos/index.ts`
- [x] Does **not** replace `types/memory.ts`, `components/memory/MemoryWall.tsx`, or `MemoryWallCanister`

#### Pass 7.2 — ArenaEventShell hooks (DONE)
- [x] `components/live/ArenaEventShell.tsx` emits `WINNER_DECLARED` when `winnerParticipantId` is real
- [x] Emits `MATCH_COMPLETED` / `CONCERT_COMPLETED` when `liveState === "ended"` (no fake wins)
- [x] Auto-Director optional: `highlightsToAutoDirectorPreviews()` — FEATURED/LEGENDARY → LIVE_PREVIEW cards with honest copy + real `/live/rooms/{roomId}` only; empty when ledger empty

#### Pass 7.3 — Prisma Collectibles persistence (DONE)
- [x] Prisma `MemoryCollectible` + `MemoryAlbum` models + migration `20260729000000_add_memory_collectibles`
- [x] Contracts: `MemoryCollectibleKind`, `MemoryViewMode`, capture quality/destination, media link + `editOriginalMediaId` fields (`lib/memory/collectiblesContracts.ts`)
- [x] Server persistence: create / list / trash / restore / favorite / albums (`collectiblesPersistence.ts`)
- [x] API `/api/memory/collectibles` — owner-scoped; honest empty when no media
- [x] Capture bridge: existing `/api/memory/capture` + CameraCaptureOverlay → MEMORY_WALL destination; dual-write FeedItem for legacy wall until 7.4
- [x] Collectible ticket mint: `toCollectibleTicketMemory` / `mintCollectibleTicketIfPossible` on `redeemTicket` (real ticket data only)
- [x] `achievementBridge` stub — WINNER_DECLARED → AchievementDraft (no fake UI); ledger stays off photo wall
- [ ] Persist competition LedgerEntry to DB — **not** 7.3 scope (Achievement Engine later); leave in-memory

#### Pass 7.4 — Memory Wall Surface / Motion Gallery (DONE)
- [x] Schema deepen: `mediaVariants`, `motionPair`, `rimStyleId`, `animationPreset`, `burstGroupId` + migration `20260729010000_memory_collectible_motion_fields`
- [x] Contracts: `MotionPair`, `MediaVariantMap`, presentation presets, resolve helpers (`collectiblesContracts.ts`)
- [x] Persistence + API accept motion/presentation fields; optional ledger side-effect on save (event log only)
- [x] `MotionMediaCard` — still default; hover/press/visible plays motion; CSS rims; `prefers-reduced-motion`
- [x] `MemoryWallMotionGrid` — staggered grid from `GET /api/memory/collectibles`; honest empty
- [x] `MemoryCinematicViewer` — layoutId expand, swipe next/prev, CSS zoom, mute, hold-to-play
- [x] `MemoryWallCanister` + `MemoryWallPanelOverlay` bind to collectibles (no fake cards; no ledger feed)
- [x] Do **not** merge competition ledger highlights into photo wall props
- [ ] Spatial 3D gallery room — **deferred**
- [ ] Full AI object search / highlight reels — **deferred**
- [ ] Full non-destructive editor UI (crop/filters/stickers) — **deferred** (pointer field exists)

#### Collections Engine + parallel Achievements / Analytics (SCAFFOLD)
- [x] Evolve Prisma: `isDefault` / `unlockAccess` on albums; `frameSkin` / `mediaEdit` / `unlockAccess` on collectibles; `CollectionItem` join; `UserAchievementCollectible` — migration `20260729020000_collections_engine_and_achievements`
- [x] Contracts: `collectionsContracts.ts`, `CollectionRegistry.ts` — MediaAsset / Collection / CollectionItem / FrameSkin / MediaEdit / variant roles MASTER|MOTION_PREVIEW|THUMBNAIL|EDITED_VERSION
- [x] Persistence: collection-first save → default “All Memories”; dual-write albumId + CollectionItem; `/api/memory/collections` adapter (7.4 `/api/memory/collectibles` still works)
- [x] Achievement Collectibles Fan/Performer parallel definitions + thin persistence (no fake grants); wire comment on `achievementBridge` → Achievement path only
- [x] Analytics Fan/Performer contracts + honest reader (`roleAnalyticsContracts` / `roleAnalyticsReader`)
- [ ] Profile Collections hub tabs (Media | Achievements | Analytics) — **follow-on UI**
- [ ] Full FrameEditor UI — **deferred**
- [ ] Full analytics dashboard UI — **deferred**
- [ ] Seasonal collectibles grant engine — **FUTURE**
- [ ] UnlockMethod hard coupling — **FUTURE** (soft `unlockAccess` only)
- [ ] Achievement grant engine (persist on real WINNER_DECLARED) — **FUTURE**

#### Memory Wall Interactive Gallery extras (post-7.4) — DEFERRED
**Status:** Core motion surface shipped. Remaining experience targets stay FUTURE until real media volume justifies them.
**Do NOT** fake Ken Burns, fake parallax density, or fake AI object search.

Experience targets still deferred:
- **Cinematic extras:** album expand 3D, optional device-tilt parallax
- **HD camera suite:** creative device tools beyond current capture bridge
- **Interactive memorabilia graph:** deep tap → event/venue/ticket/YoPho graph polish
- **Albums polish:** custom covers + animated borders UI
- **Org:** drag-drop between albums
- **Non-destructive editor UI:** crop/rotate/filters/frames — originals retained (`editOriginalMediaId` / `mediaEdit`)
- **Optional AI (user-controlled):** object search, tagged-friend find, highlight reels

### Phase 5B — mesh / AvatarEngine
**Status:** IDLE

### Phase 8 — Floating Workspace + Dual Bases (IN PROGRESS / scaffold COMPLETE)
**Status:** Pass 8.x scaffold COMPLETE on `eos/vocal-improv-clean`. Phase 5B remains IDLE. Does not conflict with Memory Engine 7.4 or Auto-Director.

#### Two locked North Star blueprints (do not confuse)
1. **Live HUD / Fan+Performer** — Thunder Dome floating panels over fixed monitors  
   Asset: `public/assets/blueprints/tmi_fan_performer_hud_north_star.png`  
   Fixed: top nav, left rail, center dual equal monitors, right rail, mid interaction bar, bottom control bar.  
   Floating glass neon panels (Inventory FAN-only / Venue Concierge PERFORMER / Memory Wall) — **no layout reflow**.
2. **Observation / Overseer Deck** — ornate gold-filigree OVERSEER DECK / BerntttGlobal  
   Asset: `public/assets/blueprints/tmi_overseer_deck_north_star.png`  
   Route: `/admin/overseer` (`WorkspaceManager` → `CanonOverseerShell`)  
   Slot ledger: `lib/admin/OverseerDeckBlueprintMap.ts` (KEEP / ALIGN / DEFER)  
   **Do not rebuild Overseer chrome in Pass 8** — align dual equal center monitors + document gaps.

#### Dual equal monitors (hard UI law)
- Live HUD: `MonitorSatelliteSystem` defaults to `SPLIT_VIEW` with `gridTemplateColumns: 1fr 1fr` + matching `aspectRatio: 16/9` on MONITOR A + B (`data-equal-dual-monitors`).
- Overseer: `CanonOverseerShell` is a **scrollable flight deck** (no `100vh` / `overflow: hidden` squash). Center column = two stacked true `aspect-ratio: 16/9` monitors (width-driven). Side rails stretch to the combined monitor stack and scroll independently. Analytics sits in its own full-width section below with taller min-height / padding.

#### Pass 8 delivered
- [x] `FloatingWorkspacePanel` + `floatingWorkspaceStore` + module registry (Fan vs Performer Rule 26)
- [x] `VenueGeoRegistry` + `VenueConcierge` (CSS heatmap — no Leaflet/Mapbox; honest NO_DATA heat)
- [x] `POST /api/venues/booking-request` → `VenueBookingRegistry` + optional `BOOKING_ALERT_EMAIL` (Overseer queue path)
- [x] `useMemoryLibrary` + `MediaCard` alias → MotionMediaCard (7.4 SoT)
- [x] Chevron next to HOME in `MasterControlDock`; BottomWorkspaceDrawer chevron opens floating panel (bar stays 70px)
- [x] Memory / Inventory quick overlays — View All → floating full module
- [x] Blueprint assets copied under `public/assets/blueprints/`
- [x] Overseer layout: remove vh lock; dual stacked 16:9 monitors define page height; analytics below fold
- [ ] Browser certify floating open/close + no monitor reflow
- [ ] UnifiedInbox UI: replace hardcoded demo rows with `/api/admin/inbox` threads (ALIGN — Rule 20)
- [ ] Overseer visual certify gold-filigree vs blueprint (ALIGN — later)
- [ ] Engagement heatmap engine (DEFER — never fake density)

### Phase 8 - Runtime Certification (PENDING) — after Pass 8 browser certify

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
