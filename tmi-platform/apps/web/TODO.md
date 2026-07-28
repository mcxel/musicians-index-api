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

### Phase 4 — Experience Engine (IN PROGRESS)
- [x] Pass 4.1 — EosArenaEventShell layered orchestrator + ExperienceWidgetLayer
- [x] Pass 4.2 — BattleExperience + ExperienceComponentRegistry + StageLoader mount
- [x] /battles/live invokes StageLoader → BattleExperience (thunder-dome)
- [x] Pass 4.3 — CypherExperience + CypherRuntimeProvider + layer-group widgets + /cypher/stage StageLoader mount
- [x] Pass 4.3 browser certification — `/cypher/stage` PASS (Queue / Mic / Beat / Reactions / Bezel / Venue)
- [x] Boot unblock — `preloadAssetBundle` + StageLoader LOAD_ASSETS hard timeout (was hanging on missing/slow media)
- [x] Pass 4.4 — ChallengeExperience + `/challenge/stage` StageLoader mount + browser smoke PASS
- [x] Pass 4.5 — Monday Night Stage EOS mount + browser cert PASS (`/shows/monday-night-stage`)
- [x] Pass 4.6 — Deal or Feud EOS mount + browser cert PASS (`/shows/deal-or-feud`)

#### Phase 4.3–4.6 Certification Ledger
| Certification | Status |
|---|---|
| EOS (apps/web) TypeScript | ✅ PASS (touched EOS files clean; monorepo hold remains) |
| Browser Runtime `/cypher/stage` | ✅ PASS — RUNNING + Queue/Mic/Beat/Reactions |
| Browser Runtime `/challenge/stage` | ✅ PASS — RUNNING + Bezel + Venue + Discovery |
| Browser Runtime `/shows/monday-night-stage` | ✅ PASS — boot→RUNNING, FlightDeckBezel, BROADCAST CONTROLS, STREAM LIVE, no CRITICAL_FAILURE |
| Browser Runtime `/shows/deal-or-feud` | ✅ PASS — boot→RUNNING, FlightDeckBezel, PRIZE PANEL, DEAL DOORS, no CRITICAL_FAILURE |
| Root cause of Cypher stall | ✅ Fixed — LOAD_ASSETS hung on video preload with no timeout |
| Root cause of Monday role block | ✅ Fixed — RoleRegistry allows LIVE_SHOWCASE + soft-allow via experience.permissions; monday-night-stage category STAGE_SHOW |
| Root cause of DealOrFeud crash | ✅ Fixed — `arenaEventTypeToVenueType("deal-or-feud")` mapped to nonexistent `"game-show"`; now `"deal-or-feud"`. EOS `suppressPresentation` also skips AvatarVenueAnchor (R3F PropLoader hard-crash). |
| Monorepo TypeScript | ⚠️ Existing unrelated failures (Repository Certification Hold) |
| Production Certification | ⏳ Not yet complete |

#### Repository Certification Hold (does not block EOS)
Outstanding monorepo `tsc` failures — track separately from EOS milestones:
- `apps/web/src/app/api/mission-control/route.ts` — missing `@bernout/agent-network`
- `apps/web/src/app/api/users/search/route.ts` — Prisma field mismatches
- [ ] Branch A — VideoLoungeShell (presence frames) — **only after competition branch complete**
- [ ] Branch B — WorldDanceShell (full-body avatars) — **only after competition branch complete**
- [ ] Phase 4 certification — browser verify on /battles/live

### Phase 5–8 — Avatar, YoPho, Runtime, Certification (PENDING)

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
