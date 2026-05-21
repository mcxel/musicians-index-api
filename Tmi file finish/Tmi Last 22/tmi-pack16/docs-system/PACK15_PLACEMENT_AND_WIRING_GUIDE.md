# PACK15_PLACEMENT_AND_WIRING_GUIDE.md
## Pack 15 + 16 — Exact Placement, Wiring Jobs, Proof Gates
### BerntoutGlobal XXL / The Musician's Index
**"This is your stage, be original."**

---

## HOW TO USE THIS GUIDE

1. Copy each file from the Pack 15/16 zip to the exact repo path listed
2. Hand the "Copilot wires" column to Copilot
3. Hand the "VS Code proves" column to VS Code after wiring
4. Mark COMPLETE in MASTER_BUILD_MATRIX.md when proof passes

---

## SECTION A — DOCS/SYSTEM FILES

Put these in: `tmi-platform/docs/system/`

| File | Type | Copilot Wires | VS Code Proves |
|---|---|---|---|
| MASTER_BUILD_MATRIX.md | Governance | Update status columns as work completes | Verify no COMPLETE rows have missing files |
| MASTER_ROUTE_INDEX.md | Governance | Update status as routes are created | Verify all routes return 200 in smoke test |
| MASTER_ENGINE_INDEX.md | Governance | Update status as engines are wired | Verify each COMPLETE engine has a proof |
| MASTER_BOT_INDEX.md | Governance | Update status as bots are wired | Verify all DESIGNED bots run on schedule |
| WORLD_SIMULATION_SYSTEM.md | Architecture | Wire WorldSimulationProvider | World activity updates every 5min |
| POPULATION_ROLE_SYSTEM.md | Architecture | Wire role checks on room join | Role-specific UI panels render per role |
| SEAT_AND_POSITION_SYSTEM.md | Architecture | Wire position tracking on join/leave | Positions update in real-time |
| WORLD_TIME_SYSTEM.md | Architecture | Wire all cron jobs in apps/api/src/jobs/ | Each cycle fires on schedule |
| OVERLAY_STACKING_SYSTEM.md | Visual Law | Enforce z-index layers in CSS | No overlay covers performer face |
| ANIMATION_AND_MOTION_SYSTEM.md | Visual Law | Wire transitions per specs | All animations match timing table |
| NUMBER_MOVEMENT_SYSTEM.md | Visual Law | Wire AnimatedCounter to live data | Numbers animate on every update |
| FEATURE_FLAG_SYSTEM.md | Operations | Wire to packages/platform-kernel/src/feature-flags.ts | Flag toggles propagate within 60s |
| ANALYTICS_EVENT_TAXONOMY.md | Operations | Wire analytics service with named events | All events appear in analytics dashboard |
| SLO_AND_ALERTING_SYSTEM.md | Operations | Wire alert thresholds to monitoring | Alerts fire at defined thresholds |
| PLATFORM_PROOF_MATRIX.md | Proof | — | Run all proof commands, document results |
| LAUNCH_DAY_COMMAND_PACK.md | Operations | — | Execute in order on launch day |
| SUBSCRIPTION_SYSTEM.md | Business | Wire Stripe webhooks + entitlement service | Subscription changes reflect within 60s |
| BILLING_AND_ENTITLEMENT_SYSTEM.md | Business | Wire Stripe + Apple/Google IAP | Restore purchases works on all platforms |
| ASSET_PIPELINE_SYSTEM.md | Media | Wire asset.service.ts + storage provider | Upload → CDN completes, DB record created |
| DEVICE_PLATFORM_SYSTEM.md | Distribution | Wire responsive breakpoints + device detection | All render modes work on target devices |
| KNOWLEDGE_BASE_SYSTEM.md | Support | Wire /help, /support, /safety routes | All help pages render |

---

## SECTION B — COMPONENT FILES

Put these in: `tmi-platform/apps/web/src/components/`

### Room Shells (`room/`)
| File | Copilot Wires | VS Code Proves |
|---|---|---|
| ArenaRoomShell.tsx | useRoom(roomId), useSharedPreview(), useTurnQueue() | Room opens, preview mounts, queue visible |
| BattleRoomShell.tsx | useBattleRoom(roomId), useTurnQueue() | Turn lock enforced, only 1 preview at a time |
| CypherRoomShell.tsx | useCypherRoom(roomId), useProducerBeat() | Queue advances, beat preview plays for all |
| MiniCypherRoomShell.tsx | useOpenCypher(roomId), useMatchmaking() | Drop-in/out works freely |
| BackstageRoomShell.tsx | useEventPreLive(eventId) | Only performers access (auth guard works) |
| GreenRoomShell.tsx | useGreenRoom(userId, eventId) | Performer can review set |
| SoundcheckRoomShell.tsx | useSoundcheck(userId, eventId) | All 3 test buttons work |
| ProducerRoomShell.tsx | useProducerBeatLocker(producerId), useBeatCast() | Beat casts to room, all hear it |
| WatchRoomShell.tsx | useSharedMedia(roomId), useWatchPartySync() | All viewers at same timestamp |

### Lobby / Homepage (`lobby/`)
| File | Copilot Wires | VS Code Proves |
|---|---|---|
| LobbyWallPanel.tsx | useRoomList({ sort:'viewers_asc' }) | **CRITICAL: position 1 = 0-viewer artist** |
| CountdownCard.tsx | useCountdown(targetDate, onExpire) | Numbers animate, color shifts <30s |
| RandomJoinGatewayCard.tsx | useMatchmaking() | User lands in open room |
| WorldPremierePanel.tsx | useWorldPremiere() | Countdown ticks, fires at T=0 |
| EventCalendarPanel.tsx | useUpcomingEvents({ limit:10 }) | Events load with correct dates |
| ArtistOpportunityPanel.tsx | useDiscoveryBoost() | Lowest-view artist shows |
| SponsorSpotlightPanel.tsx | useActiveSponsor({ placement:'homepage' }) | Sponsor shows or house ad fallback |
| LiveRoomsRadarPanel.tsx | useRoomRadar({ sortBy:'trending' }) | Rooms show sorted by trending |

### Preview / Stage (`preview/`)
| File | Copilot Wires | VS Code Proves |
|---|---|---|
| SharedPreviewStagePanel.tsx | useSharedPreview(), useTurnQueue() | All participants see same source simultaneously |
| PreviewSourcePicker.tsx | useArtistMediaLocker(artistId) | Only artist's own approved sources appear |
| PreviewFallbackCard.tsx | SharedPreviewProvider onError | Shows when media fails, never empty |
| PreviewDockSlot.tsx | usePreviewDock(roomType, layoutMode) | Dock never covers performer face |
| PreviewTransitionFrame.tsx | useSharedPreview().isOpen | Animates per ANIMATION_AND_MOTION_SYSTEM |
| PreviewModeBadge.tsx | mode prop from SharedPreviewProvider | Correct badge per mode |
| PreviewMetadataCard.tsx | usePreviewMetadata(sourceUrl) | Metadata populates from source |
| CompareModePanel.tsx | useBattleCompare(roomId) | Both media items show |
| PrizeAnnouncementCard.tsx | stage-director-bot trigger | Prize card shows correctly |
| SponsorPreviewCard.tsx | useActiveSponsorCampaign() | Sponsor label visible, banned-moment suppression works |
| EventAnnouncementCard.tsx | stage-director-bot trigger | Event info correct |

### Profile / Artist / Producer (`profile/`, `producer/`)
| File | Copilot Wires | VS Code Proves |
|---|---|---|
| ArtistHeroPanel.tsx | useArtistProfile(slug) | **Diamond shows for Marcel/BJ** |
| DiamondTierBadge.tsx | tier from useArtistProfile or useSubscription | Correct glow per tier |
| ArtistMediaLockerPanel.tsx | useArtistMedia(artistId) | Sources show, can be sent to preview |
| ArtistStatsPanel.tsx | useArtistStats(artistId) | All stats load |
| ArtistBookingPanel.tsx | useBookingWidget(artistId) | Booking form submits |
| DiamondTierBadge.tsx | profile.tier from DB | Diamond for Marcel/BJ verified by billing-integrity-bot |
| ProducerBeatLocker.tsx | useProducerBeats(producerId) | Beats show, cast button works |
| BeatPreviewPanel.tsx | useActiveBeat(roomId) | Waveform shows, controls work |

### Venue / World (`venue/`, `world/`)
| File | Copilot Wires | VS Code Proves |
|---|---|---|
| VenueHeroPanel.tsx | useVenueProfile(slug) | Venue renders with identity |
| PopulationMeter.tsx | useWorldActivity() | Numbers update real-time |
| CityMapPanel.tsx | useWorldMap() | Map renders, cities clickable |

### Operator (`operator/`)
| File | Copilot Wires | VS Code Proves |
|---|---|---|
| GlobalCommandCenterShell.tsx | useOperatorHealth() + all runtime hooks | All 6 panels load |
| KillSwitchPanel.tsx | useFeatureFlags(), toggleFlag() | Flag toggles within 60s |
| WatchdogGridPanel.tsx | useRoomWatchdog(), useSystemHealth() | All watchdog states show |
| IncidentTimelinePanel.tsx | useIncidentLog({ limit:50 }) | Incidents load in order |
| RecoveryActionsPanel.tsx | useRecovery() | Actions trigger correct resets |
| EnvironmentBanner.tsx | process.env.NEXT_PUBLIC_ENVIRONMENT | Shows in staging, hidden in prod |

---

## SECTION C — PAGE SHELLS

Put these in: `tmi-platform/apps/web/src/app/`

**All pages are ready for data wiring. Every page file has:**
- Metadata export
- Auth requirement comment
- Copilot wires comment
- VS Code proves comment
- Placeholder div with data-slot attributes

### Critical Routes (Launch Blockers)
| Route | File | Why Critical |
|---|---|---|
| / | (already exists — crown + cover) | Homepage 1 must work |
| /live | (already exists — lobby world) | Homepage 2 must work |
| /editorial | (already exists — magazine) | Homepage 3 must work |
| /lobby | lobby/page.tsx | Lobby wall loads |
| /artists/[slug] | artists/[slug]/page.tsx | **Diamond badge for Marcel/BJ** |
| /admin/command-center | admin/command-center/page.tsx | Big Ace must control platform |
| /admin/feature-flags | admin/feature-flags/page.tsx | Kill switches must work |
| /status | status/page.tsx | Public health visibility |
| /register | (already exists) | Onboarding must work |
| /login | (already exists) | Auth must work |

### All New Routes (105 page shells created)
See MASTER_ROUTE_INDEX.md for full list with status.

---

## SECTION D — BOT DOCS/SYSTEM FILES

Put these in: `tmi-platform/docs/system/bots/`

| File | Bot ID | Owner | Schedule | Copilot Wires |
|---|---|---|---|---|
| STAGE_DIRECTOR_BOT_SYSTEM.md | stage-director-bot | Framework | Event-driven | apps/api/src/bots/stage-director.bot.ts |
| SCENE_TRANSITION_BOT_SYSTEM.md | scene-transition-bot | Framework | Event-driven | apps/api/src/bots/scene-transition.bot.ts |
| MATCHMAKING_BOT_SYSTEM.md | matchmaking-bot | Algorithm | Event-driven | apps/api/src/bots/matchmaking.bot.ts |
| HIGHLIGHT_CAPTURE_BOT_SYSTEM.md | highlight-capture-bot | Framework | Continuous | apps/api/src/bots/highlight-capture.bot.ts |
| RESULTS_RECAP_BOT_SYSTEM.md | results-recap-bot | Algorithm | Event-driven | apps/api/src/bots/results-recap.bot.ts |
| RANKING_UPDATE_BOT_SYSTEM.md | ranking-update-bot | Algorithm | Post-events + Sun midnight | apps/api/src/bots/ranking-update.bot.ts |
| SAFETY_ESCALATION_BOT_SYSTEM.md | safety-escalation-bot | Big Ace | Continuous | apps/api/src/bots/safety-escalation.bot.ts |
| BILLING_INTEGRITY_BOT_SYSTEM.md | billing-integrity-bot | Big Ace | Every 4 hours | apps/api/src/bots/billing-integrity.bot.ts |
| WORLD_SIMULATION_BOT_SYSTEM.md | world-simulation-bot | Algorithm | Every 5 minutes | apps/api/src/bots/world-simulation.bot.ts |
| LOAD_SPIKE_BOT_SYSTEM.md | load-spike-bot | Framework | Every 1 minute | apps/api/src/bots/load-spike.bot.ts |
| MISSING_BOT_MANIFESTS.json | (all 10 bots) | — | — | Reference for all bot implementations |

---

## SECTION E — WHAT COPILOT MUST DO NEXT

**Do not start until Pack 16 files are copied to repo.**

Priority order (follow ENGINE_DEPENDENCY_ORDER.md):

1. **Fix Cloudflare build** — apply Slice 0 from COPILOT_PROMPT_PACK.md (Pack 13)
2. **Wire artist slug route** — `apps/web/src/app/artists/[slug]/page.tsx` → useArtistProfile(slug), verify Diamond for Marcel/BJ
3. **Wire lobby wall sort** — useRoomList({ sort:'viewers_asc' }) in LobbyWallPanel.tsx — CRITICAL
4. **Wire countdown engine** — useCountdown in CountdownCard.tsx with real event timestamps
5. **Wire room families** — ArenaRoomShell, CypherRoomShell connect to room infra providers
6. **Wire shared preview in rooms** — SharedPreviewStagePanel connects via SharedPreviewProvider
7. **Wire feature flags** — connect KillSwitchPanel to platform-kernel feature-flags.ts
8. **Wire admin/command-center** — GlobalCommandCenterShell connects to all operator hooks
9. **Wire billing/subscriptions** — Stripe webhooks + entitlement service
10. **Wire analytics** — all events from ANALYTICS_EVENT_TAXONOMY.md

---

## SECTION F — WHAT VS CODE MUST PROVE

Run these in order after each Copilot slice:

```bash
# After every slice
pnpm --filter web lint
pnpm --filter web typecheck

# After Slice 0 (build fix)
pnpm -C apps/web run build

# After Slice 3 (lobby wall)
# Manual: verify position 1 = artist with 0 viewers

# After artist profile wire
# Manual: login as Marcel → verify Diamond badge shows

# After admin wire
# Manual: login as Big Ace → /admin/command-center renders all 6 panels

# Final launch smoke
pnpm test:smoke
curl https://themusiciansindex.com/ -I  # HTTP 200
```

---

## THE PERMANENT LAWS (Never Violate)

1. **Discovery-first**: 0 viewers = position 1 in lobby wall always
2. **Permanent Diamond**: Marcel Dickens and B.J. M Beat's — hardcoded, verified by billing-integrity-bot every 4h
3. **Non-interference**: Preview window never covers performer face, stage center, or turn timer
4. **One audio owner**: Only AudioProvider owns playback state globally
5. **One preview owner**: Only SharedPreviewProvider owns preview state globally
6. **One turn owner**: Only TurnQueueProvider owns turn/queue state globally
7. **Brand protection**: Berntout, BerntoutGlobal, Berntout Perductions — never auto-corrected
8. **Marcel control**: Marcel = analytics + suggestions only (no destructive actions)
9. **Big Ace authority**: Big Ace = full platform control including emergency override
10. **Sponsor placement rules**: Sponsor content banned at winner reveal, crown transfer, tier upgrade

---

*PACK15_PLACEMENT_AND_WIRING_GUIDE.md v1.0*
*BerntoutGlobal XXL / The Musician's Index*
*"This is your stage, be original."*
