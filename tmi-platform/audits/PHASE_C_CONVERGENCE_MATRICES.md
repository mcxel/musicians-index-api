# Phase C Convergence Matrices
**Audit Date:** 2026-06-23
**Auditor:** Claude Code (assembly director mode — research only, no code changes)
**Scope:** `apps/web/src/` — all lib/, components/, and app/ directories

---

## Matrix 1 — Engines

| Engine | Status | Canonical File Path | Notes |
|--------|--------|---------------------|-------|
| GlobalLiveSessionRegistry | CANONICAL | `apps/web/src/lib/broadcast/GlobalLiveSessionRegistry.ts` | Full implementation with `getActiveSessions()`, `onSessionsChanged()`, `AudienceEntryPayload`. Wired into Home 1, 1-2, 3, api/live, api/homepage/live. ALSO a 1-line empty stub at `lib/live/GlobalLiveSessionRegistry.ts` — that stub is LEGACY and should be deleted. |
| audienceRuntimeEngine | CANONICAL | `apps/web/src/lib/live/audienceRuntimeEngine.ts` | Full presence/seat/chat engine. Has `AudienceMember` type with Phase 3A capabilities (avatar-seat binding, groupId, seat reclaim). Most-adopted seat system. |
| BroadcastDirectorEngine | CANONICAL | `apps/web/src/lib/live/BroadcastDirectorEngine.ts` | Rule 16 v2 implemented. Dynamic profiles per room type (Battle/Cypher/Challenge/FanLobby/DanceParty). Imports from AudienceVisibilityEngine and BattleBroadcastStateMachine. |
| EventRotationEngine | CANONICAL | `apps/web/src/lib/competition/EventRotationEngine.ts` | Full lifecycle: Queued→Countdown→Open→Live→Closed→Rewarded→Rotated. Auto-rotation, genre rotation, 6 match formats. Referenced in Home5LiveNowBelt and Home5StartingSoonBelt. |
| PerformerRegistry | CANONICAL | `apps/web/src/lib/performers/PerformerRegistry.ts` | Single source of truth for performer identity. Wired into Home 1, 1-2, 3, DiscoveryRail, live/rooms/[id]. Exports `PERFORMER_REGISTRY`, `getPerformerById`, `getTopPerformers`, `computeRanks`. |
| VenueRegistry | CANONICAL | `apps/web/src/lib/venues/VenueRegistry.ts` | Imports from GlobalLiveSessionRegistry for live enrichment. Has 13 support engines in lib/venues/. |
| SponsorRegistry | CANONICAL | `apps/web/src/lib/commerce/SponsorRegistry.ts` | Exports `ACTIVE_SPONSOR_ZONES`, `getAdSlotForZone()` (Rule 12 fallback chain), `getRailSponsors()`. Wired into Home 1-5, live/rooms/[id], DiscoveryRail. All sponsor zones currently empty (no paying sponsors yet — correct launch state). |
| magazineIssueData | CANONICAL | `apps/web/src/lib/magazine/magazineIssueData.ts` | `MAGAZINE_ISSUE_1` array with full article shape. Wired into DiscoveryRail, Home 2, magazine/article/[slug]. 50+ magazine engines exist in lib/magazine/ — most are supplementary rotation/styling engines, not competing sources. |
| XpActionRegistry | CANONICAL | `apps/web/src/lib/xp/XpActionRegistry.ts` | Full action key map with `getXpValue()`. 27 XP sub-engines in lib/xp/. Not yet wired to a real DB points table — in-memory only. |
| StageLifecycleEngine | CANONICAL | `apps/web/src/lib/live/StageLifecycleEngine.ts` | Full state machine: STAGE_PREP→COUNTDOWN→CURTAIN_PART→LIGHTING_SNAP→CAMERA_LIVE→INTERMISSION→CURTAIN_CLOSE→ENDED. Has config, snapshot, listener types. Wired status: present in lib/live/index.ts, not confirmed wired into GoLiveRuntime or ArenaEventShell. |
| BotCrowdFillEngine | CANONICAL | `apps/web/src/lib/live/BotCrowdFillEngine.ts` | Full bot fill logic: fill timing, bot vacate on real user join, max 92% bot fill, reaction pool. Imports AudienceVisibilityEngine, SharedReactionEngine, RoomEnergyEngine. Wired status: engine exists, call site in live rooms not confirmed. |
| CompetitionMusicEngine | CANONICAL | `apps/web/src/lib/competition/CompetitionMusicEngine.ts` | Three-lane music routing (battle=shared, cypher=rotating/shared/dj, challenge=BYOM). Calls `isBeatExclusivelySold()` from BeatInventoryEngine. Beat ID scheme not yet unified with marketplace. |
| BeatInventoryEngine | CANONICAL | `apps/web/src/lib/beats/BeatInventoryEngine.ts` | Slot-based inventory with exclusive/non-exclusive tracking. `isBeatExclusivelySold()` exported. In-memory only (no DB persistence yet). Also see lib/beats/ for 8 additional beat engines. |
| PlaylistArtifactEngine | CANONICAL | `apps/web/src/lib/artifacts/PlaylistArtifactEngine.ts` | Full artifact state machine (TrackSource, ArtifactTrack, SKIN_REGISTRY with 4-tier economy). No purchase UI yet. Also `engines/PlaylistEngine.ts` exists as a separate (DUPLICATE) engine — needs reconciliation. |
| ContentFreshness | CANONICAL | `apps/web/src/lib/content/ContentFreshness.ts` | `getFreshnessScore()`, `sortByFreshness()`, `sortArticlesByFreshness()`, `sortPerformersByFreshness()`. Wired into Home 1, 2, 3. Rule 11 compliant. |

**Duplicate / Fragmentation Flags:**
- `lib/live/GlobalLiveSessionRegistry.ts` — 1-line empty stub; the real file is `lib/broadcast/GlobalLiveSessionRegistry.ts`. The stub creates import confusion.
- `engines/PlaylistEngine.ts` — second playlist engine separate from `lib/artifacts/PlaylistArtifactEngine.ts`. Third one was found in a prior session. Needs reconciliation audit.
- `lib/live/GenreRotationEngine.ts` AND `lib/engine/GenreRotationEngine.ts` AND `engines/home/CoverGenreRotationAuthority.ts` — three genre rotation engines. Unclear which is canonical.

---

## Matrix 2 — Canisters

| Canister | Status | File Path | Notes |
|----------|--------|-----------|-------|
| PlaylistCanister | CANONICAL | `apps/web/src/components/canisters/PlaylistCanister.tsx` | Wraps `PlaylistArtifact` via dynamic import. Has SSR:false loading state. Exports `PlaylistCanister` (named). |
| MemoryWallCanister | CANONICAL | `apps/web/src/components/canisters/MemoryWallCanister.tsx` | Wraps `components/media/MemoryWall`. Supports performer/fan/venue/sponsor/room/article entity types. |
| BookingCanister | CANONICAL | `apps/web/src/components/canisters/BookingCanister.tsx` | Calls `/api/booking/requests` (GET list / POST submit). Has fan request form + venue/performer request list views. Both entity types supported. |
| MessagingCanister | CANONICAL | `apps/web/src/components/canisters/MessagingCanister.tsx` | Thread list + message view. Has `ThreadSummary` and `ThreadMessage` types. Calls live API. Full implementation present. |
| StoreCanister | CANONICAL | `apps/web/src/components/canisters/StoreCanister.tsx` | Imports from `lib/store/StoreItemEngine`. Creator/Fan/Shared store types. Stripe checkout links. |
| AvatarCreationCenter | PARTIAL | `apps/web/src/components/canisters/AvatarCreationCenter.tsx` | Wraps `components/AvatarCreator`. Header shell present. AvatarCreator is a 2D customizer (skin tones, hair) — not the face-scan bobblehead pipeline (Rule 18 gap, documented as known unbuilt work). |
| AvatarWorkspace | PARTIAL | `apps/web/src/components/canisters/AvatarWorkspaceCanister.tsx` | Has bobblehead config types (skinTone/hairColor/outfitColor/accessory), skin tone + hair color pickers. Manual picker only — no face scan. Same Rule 18 known gap. File name is AvatarWorkspaceCanister.tsx not AvatarWorkspace.tsx. |
| InventoryCanister | CANONICAL | `apps/web/src/components/canisters/InventoryCanister.tsx` | Wraps `components/InventoryPanel`. Props/emotes/loadout display. |
| PublicLobbyCanister | PARTIAL | `apps/web/src/components/canisters/PublicLobbyCanister.tsx` | Has static `LobbyFan` type with status/emoji/location. Fan list rendering. No real API call — uses static demo fan objects. Needs wire to real presence system. |
| PrivateLobbyCanister | PARTIAL | `apps/web/src/components/canisters/PrivateLobbyCanister.tsx` | Routes to `/live/lobby?entity=X&type=private`. Link-only shell — no lobby state shown. Minimal functionality. |
| LiveLobbyWallCanister | CANONICAL | `apps/web/src/components/canisters/LiveLobbyWallCanister.tsx` | Fetches from `/api/homepage/live` (GlobalLiveSessionRegistry). Grid of live room tiles, each routes through LobbyEntryFlow. Rule 20 compliant (no fake LIVE badge). |
| CanisterShell | CANONICAL | `apps/web/src/components/canisters/CanisterShell.tsx` | 6-state wrapper (Closed→Peek→Expanded→Pinned→Detached→Fullscreen). Uses CanisterMotionRegistry for unique animations per canister type. |
| ActivityTimelineCanister | CANONICAL | `apps/web/src/components/canisters/ActivityTimelineCanister.tsx` | Reads from `ActivityTimelineEngine`. Listens for `TMI_TIMELINE_UPDATE` events. Honest empty state when no activity. |
| CanisterMotionRegistry | CANONICAL | `apps/web/src/lib/motion/CanisterMotionRegistry.ts` | 8 animation styles (SlideLeft/Right/LiftUp/DropDown/NeonFade/StageReveal/MagazineFlip/GlassExpand). Framer-motion variants defined as data. Used by CanisterShell. |

**Missing from spec (Rule 15 calls for these):**
- No `AvatarWorkspace` component at the exact name — file is `AvatarWorkspaceCanister.tsx`. Minor naming drift.
- `MediaLockerCanister.tsx` exists at `components/canisters/MediaLockerCanister.tsx` — not in Rule 15's original 11, likely an extension.
- `AvatarLobbyRuntime.tsx` exists at `components/canisters/AvatarLobbyRuntime.tsx` — canister-adjacent, not listed in Rule 15 matrix.
- `CollapsibleCanister.tsx` and `MonitorSatelliteSystem.tsx` exist as utility shells — not part of the 11 canonical canisters.

---

## Matrix 3 — Routes

| Route | Status | Path | Notes |
|-------|--------|------|-------|
| home/1 | CANONICAL | `apps/web/src/app/home/1/page.tsx` | Wired to PerformerRegistry, GlobalLiveSessionRegistry, ContentFreshness, SponsorRegistry. Imports Home1CoverPage. Full real-data wiring. |
| home/1-2 | CANONICAL | `apps/web/src/app/home/1-2/page.tsx` | Imports BillboardCrownSequence, BillboardOpenBookSpread, GlobalLiveSessionRegistry, PerformerRegistry. Has EngagementLearningEngine.ts co-located (non-route file). Full wiring. |
| home/2 | CANONICAL | `apps/web/src/app/home/2/page.tsx` | Imports Home2NewsDeskSurface, ContentFreshness, magazineIssueData, SponsorRegistry. DiscoveryRail present. Full wiring. |
| home/3 | CANONICAL | `apps/web/src/app/home/3/page.tsx` | Imports Home3LiveWorldSurface, GlobalLiveSessionRegistry, PerformerRegistry, ContentFreshness. DiscoveryRail present. Full wiring. |
| home/4 | PARTIAL | `apps/web/src/app/home/4/page.tsx` | Imports Home4MarketplacePage, SponsorRail, EventReel. Does NOT import DiscoveryRail or registry data directly. Recent rename from Home4AdMagazine (per git status). Needs DiscoveryRail per Rule 6. |
| home/5 | CANONICAL | `apps/web/src/app/home/5/page.tsx` | Imports Home5BattleCypherSurface, DiscoveryRail, SponsorRail, EventReel, GlobalLiveSessionRegistry. Full wiring. |
| performers/[slug] | CANONICAL | `apps/web/src/app/performers/[slug]/page.tsx` | Exists. Also has /article, /lobby, /dashboard, /memory sub-routes. |
| articles/performer/[slug] | CANONICAL | `apps/web/src/app/articles/performer/[slug]/page.tsx` | Exists. DiscoveryRail wired per grep results. |
| magazine/article/[slug] | CANONICAL | `apps/web/src/app/magazine/article/[slug]/page.tsx` | Exists. DiscoveryRail wired. |
| live/rooms/[roomId] | CANONICAL | `apps/web/src/app/live/rooms/[id]/page.tsx` | Full wiring: UniversalVenueRenderer, LiveRoomWebRTCLayer, UnifiedAudienceShell, all 11 Rule-15 canisters imported, DiscoveryRail, SponsorRegistry, AudienceEntryBeacon. Most complete route on the platform. |
| live/lobby | CANONICAL | `apps/web/src/app/live/lobby/page.tsx` | Imports BillboardLiveWall (real sessions), LobbyEntryFlow. Real routing through UniversalRoom. |
| hub/fan | CANONICAL | `apps/web/src/app/hub/fan/page.tsx` | Imports FanHQShell with session data. Real user session wired. |
| hub/performer | CANONICAL | `apps/web/src/app/hub/performer/page.tsx` | Imports PerformerHubDashboard, MonitorSatelliteSystem, CollapsibleCanister, MemoryWall, PlaylistArtifact, HeadquartersCommunicationDock, OpportunityDockPanel. Full hub. |
| dashboard/performer/[slug] | MISSING | — | No `/dashboard/performer/[slug]` dynamic route exists. `/dashboard/performer/page.tsx` exists (static) and `/hub/performer/page.tsx` is the real performer hub. The [slug] variant is absent — profile-specific performer dashboards would need this. |
| api/events/create | CANONICAL | `apps/web/src/app/api/events/create/route.ts` | Exists. Imports GlobalLiveSessionRegistry. |
| api/events/[eventId]/owner-action | CANONICAL | `apps/web/src/app/api/events/[eventId]/owner-action/route.ts` | Exists. Imports GlobalLiveSessionRegistry. |
| api/live | CANONICAL | `apps/web/src/app/api/live/route.ts` | GET route returning live feed from GlobalLiveSessionRegistry + Prisma DB fallback. Has a `rand()` function for accent colors only (not viewer counts). Rule 20 compliant. |
| api/auth/login | CANONICAL | `apps/web/src/app/api/auth/login/route.ts` | Exists. Full auth suite: login, logout, register, session, provision, verify-email, forgot-password, reset-password, google, google/callback, me, csrf, set-role, switch-persona, change-password, deactivate, resend-verification. |
| battles | CANONICAL | `apps/web/src/app/battles/page.tsx` | Exists with 10+ sub-routes: /[id], /new, /create, /live, /judge, /rankings, /formats, /categories, /today, /weekly, /lobby-wall, /replay/[id], /challenge/[targetId]. |
| cyphers | PARTIAL | `apps/web/src/app/cyphers/page.tsx` | Only 2 routes: /cyphers and /cyphers/today. Missing /cyphers/[id], /cyphers/create, /cyphers/rankings compared to battles depth. |
| challenges | PARTIAL | `apps/web/src/app/challenges/page.tsx` | 4 routes: index, /[discipline], /create, /lobby-wall. Missing per-challenge runtime route /[id]. |
| arena | CANONICAL | `apps/web/src/app/arena/page.tsx` | 3 routes: index, /[id], /[id]/error, /[id]/loading. ArenaEventShell wired to [id] route. |

**Additional home/ routes found (6-15, loop, ranking, etc.):** These are prototype/overflow routes (home/6 through home/15, home/loop, home/ranking, home/4-5, home/final, home/cover, home/control, home/social, home/world-5, home/magazine, home/live). None are in the Rule 5 canonical set (home/1-5 + home/1-2). Status: LEGACY prototypes — should be audited and either redirected or deleted per Rule 20's route ledger requirement.

---

## Matrix 4 — Components

| Component | Status | File Path | Notes |
|-----------|--------|-----------|-------|
| UniversalViewportEngine | CANONICAL | `apps/web/src/components/viewport/UniversalViewportEngine.tsx` | 9 viewport modes (EMPTY_VENUE/LIVE_VENUE/AVATAR_LOBBY/PLAYLIST/TMI_TV/MAGAZINE_TV/BATTLE_ARENA/CYPHER/GAME_SHOW). Uses MotionPosterPlayer, AvatarLobbyCanvas, BattleSplitScreenPanel. Full implementation. |
| GoLiveRuntime | CANONICAL | `apps/web/src/components/live/GoLiveRuntime.tsx` | 3 view modes (FULL_VENUE/DASHBOARD/BACKSTAGE). Uses UniversalVenueRenderer, CanisterShell, EventOwnerControls. Rule 21 compliant — explicitly one Venue Runtime mode. |
| BattleSplitScreenPanel | CANONICAL | `apps/web/src/components/live/BattleSplitScreenPanel.tsx` | 3-panel layout (Performer A / Host / Performer B). Auto-rotates layout every 90s. 2-panel and 3-panel modes. Winner end effects (crown drop, glow burst, loser fade). Rule 16 compliant. |
| StartEventWizard | CANONICAL | `apps/web/src/components/arena/StartEventWizard.tsx` | 4-step flow (Closed→TypeSelect→HostSelect→Settings→Launching). Calls `/api/events/create`. Gold+ and venue/promoter/admin tier checks. Rule 21 compliant (event record owned by runtime). |
| EventOwnerControls | CANONICAL | `apps/web/src/components/live/EventOwnerControls.tsx` | Pause/Resume/Extend/End + host/performer management. Calls `/api/events/[eventId]/owner-action`. Rule 21 compliant. |
| DiscoveryRail | CANONICAL | `apps/web/src/components/discovery/DiscoveryRail.tsx` | Reads from PerformerRegistry, VenueRegistry, magazineIssueData, SponsorRegistry. 7 rail types (articles/performers/liveRooms/games/sponsors/venues/writers). Wired into Home 1-3, 5, live/rooms/[id], articles/performer/[slug], magazine/article/[slug]. |
| DiscoveryRailCanonical | DUPLICATE | `apps/web/src/components/discovery/DiscoveryRailCanonical.tsx` | Uses UnifiedDiscoveryEngine and GlobalLiveSessionRegistry. Different data source from DiscoveryRail (registry-based). Not imported anywhere found in app/ routes. LEGACY candidate — needs merge or clear separation of purpose. |
| BillboardCrownSequence | CANONICAL | `apps/web/src/components/home/BillboardCrownSequence.tsx` | Wired into home/1-2. Crown sequence animation component. |
| BillboardOpenBookSpread | CANONICAL | `apps/web/src/components/home/BillboardOpenBookSpread.tsx` | Wired into home/1-2. Uses GlobalLiveSessionRegistry directly. Implements the book-spread locked directive. |
| AudienceScene | CANONICAL | `apps/web/src/components/live/AudienceScene.tsx` | Canvas-based 3D audience renderer. 5 venue types (Theater/Arena/Club/Outdoor/Boardroom). BPM sync, phone glow, spotlight beams, crowd reactions. `occupancyRatio` prop. Used by UniversalVenueRenderer. |
| ArenaEventShell | CANONICAL | `apps/web/src/components/live/ArenaEventShell.tsx` | Universal arena host for all event types (concert/battle/cypher/challenge/live-show/monday-stage). Uses UniversalVenueRenderer. Exception: DanceArena3D for World Dance Party. |
| UniversalVenueRenderer | CANONICAL | `apps/web/src/components/live/UniversalVenueRenderer.tsx` | Phase 3B convergence component. Inherits best capabilities from both ArenaImmersivePanel and VenueImmersiveRoom. WebRTC performer video, real moderation, curtain flow, audience recognition, sponsor overlays. ArenaImmersivePanel and VenueImmersiveRoom flagged LEGACY_CANDIDATE pending verification. |
| MotionPosterPlayer | CANONICAL | `apps/web/src/components/media/MotionPosterPlayer.tsx` | Full Rule 2 fallback chain (LIVE VIDEO → motion poster → static image). `isLive`, `liveRoomRoute`, `introVideoUrl`, `motionPosterUrl`, `staticImageUrl` props. `replayOnHover` mode. Used by DiscoveryRail, BillboardLiveWall, UniversalViewportEngine. |
| BillboardLiveWall | CANONICAL | `apps/web/src/components/media/BillboardLiveWall.tsx` | Primary location. Chaotic shape-shifted performer grid. Uses MaskedVideoTile, LobbyEntryFlow, PerformerRegistry. Multiple modes (home/performer-hub/fan-hub/battle/venue/magazine). Also re-exported from `components/home/BillboardLiveWall.tsx` (thin re-export shim). |
| MaskedVideoTile | CANONICAL | `apps/web/src/components/live/MaskedVideoTile.tsx` | 7 tile shapes (octagon/hexagon/pentagon/circle/diamond/torn-edge/glitch-rect). `BroadcastTileStatus` type (live/offline/ended/waiting). Legacy `isLive` prop supported for backward compat. Also duplicated at `components/media/MaskedVideoTile.tsx` — DUPLICATE, needs resolution. |

**Billboard Proliferation Warning:** 35+ Billboard-named components found across 10+ directories. The canonical chain is: `BillboardLiveWall` (media/) → uses `MaskedVideoTile` (live/) → feeds from GlobalLiveSessionRegistry. All other billboard components should be evaluated as LEGACY candidates or specialized surfaces, not competing billboard systems.

---

## Matrix 5 — Missing Systems

| System | Status | Notes |
|--------|--------|-------|
| AudiencePresenceEngine (persistent fan entity) | MISSING (contract only) | `runtime/contracts.ts` has `AudiencePresenceEngineContract` (interface only — `protectedEngine: true, source: 'existing-audience-system'`). No actual engine file. The closest real implementation is `audienceRuntimeEngine.ts` which handles in-session presence. Cross-navigation persistence (fan entity surviving page nav) is not built. |
| StageDirectorEngine (lighting/fog/effects) | MISSING | No file found anywhere in codebase. `lib/live/StageLifecycleEngine.ts` handles stage state transitions (curtain/countdown/live) but has no lighting/fog/effects control. `lib/3d/tmiLightingPresets.ts` has lighting data but no runtime director engine. |
| GoLiveRuntime | CANONICAL — EXISTS | `apps/web/src/components/live/GoLiveRuntime.tsx` — confirmed built and wired. |
| CanisterMotionRegistry | CANONICAL — EXISTS | `apps/web/src/lib/motion/CanisterMotionRegistry.ts` — confirmed built. Used by CanisterShell. |
| CanisterShell | CANONICAL — EXISTS | `apps/web/src/components/canisters/CanisterShell.tsx` — confirmed built. 6-state wrapper with framer-motion. |
| RewardsEngine (Rule 23 — platform-wide) | MISSING | Only `lib/profile/ProfileRewardsEngine.ts` exists — this is a stub (`console.log` only, no DB writes, TODO comment). No PrizeBudgetEngine, no phase-gating logic, no automatic safety governor. Rule 23 is documented intent only, not implemented. |
| PrizeBudgetEngine (Rule 23) | MISSING | No file found. Rule 23 explicitly documents this as not yet implemented. |
| RadioRotationEngine (Rule 25) | MISSING | No file found. `lib/submissions/SubmissionEngine.ts` handles the submission half but radio rotation does not exist. Rule 25 explicitly documents this as not yet implemented. |
| SocialRadioRoomEngine (Rule 25) | MISSING | No file found. `engines/performance/BotDJEngine.ts` has persona roster + dialogue actions for battle/competition contexts — real groundwork noted in Rule 25 for extension into RadioDialogueEngine, but the engine itself is scoped to competition, not radio. |
| RadioDialogueEngine (Rule 25 extension of BotDJEngine) | MISSING | `engines/performance/BotDJEngine.ts` exists (214 lines, confirmed in engines/ directory) but is scoped to battle/competition. The radio extension (genre/song-aware) does not exist yet. |
| DiscoveryMissionsEngine (Rule 24) | MISSING | No file found. Rule 24 explicitly documented as FUTURE APPROVED FEATURE, post soft-launch. |
| SponsorPrizeDistributionEngine (Rule 24) | MISSING | No file found. Rule 24 explicitly documented as FUTURE APPROVED FEATURE, post soft-launch. |
| ParticipationMeter / RadioBoostEngine (Rule 25) | MISSING | No files found. Rule 25 documented as not yet implemented. |
| RadioIntegrityEngine (Rule 25) | MISSING | No file found. Rule 25 documented as not yet implemented. |

---

## Summary: What's Solid vs. What's At Risk

### Solid (ship-ready systems)
- All 5 canonical home routes (1, 1-2, 2, 3, 5) wired to real registries
- PerformerRegistry, VenueRegistry, SponsorRegistry, magazineIssueData, XpActionRegistry — all exist and are wired
- GlobalLiveSessionRegistry (at lib/broadcast/) — the canonical one is full; the lib/live/ stub is a hazard
- All 11 Rule-15 canisters exist; CanisterShell and CanisterMotionRegistry confirmed built
- GoLiveRuntime, BattleSplitScreenPanel, StartEventWizard, EventOwnerControls — all built and wired
- UniversalVenueRenderer, ArenaEventShell, AudienceScene — venue runtime converged
- DiscoveryRail wired into 8+ routes; MotionPosterPlayer canonical Rule 2 implementation
- Full auth API suite (18 routes), api/events/create, api/events/[eventId]/owner-action, api/live

### At Risk / Needs Action
1. **`lib/live/GlobalLiveSessionRegistry.ts` stub** — 1-line empty file shadowing the real one at `lib/broadcast/`. Any import from the wrong path returns nothing. Delete the stub.
2. **home/4 missing DiscoveryRail** — Rule 6 violation; the other 4 canonical homes all have it.
3. **`DiscoveryRailCanonical.tsx`** — not imported anywhere. Effectively dead code competing with DiscoveryRail. Needs merge or clear-purpose statement.
4. **`PublicLobbyCanister` and `PrivateLobbyCanister`** — static demo data, no real presence API calls. Rule 20 would flag these as not certified.
5. **`dashboard/performer/[slug]`** — route called in the audit spec but does not exist. Performers lack a public-facing profile dashboard by slug.
6. **`MaskedVideoTile` duplicate** — exists at both `components/live/MaskedVideoTile.tsx` and `components/media/MaskedVideoTile.tsx`. One must be the canonical; the other is LEGACY.
7. **home/6-15 and prototype home routes** — 15+ non-canonical home routes need route ledger disposition (KEEP/REMOVE/REDIRECT) per Rule 20.
8. **`AudiencePresenceEngine`** — referenced as a contract but never built. Fan entity does not survive navigation. Required for real persistent lobby membership.
9. **Rule 23 / Rule 24 / Rule 25 engines** — all MISSING by design (post-launch scope). Do not build before soft-launch certification is complete.

---

*End of Phase C Convergence Matrices — 2026-06-23*
