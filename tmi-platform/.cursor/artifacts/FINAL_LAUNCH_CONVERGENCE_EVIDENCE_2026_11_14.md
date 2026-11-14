# TMI — Final Launch Convergence Evidence (2026-11-14)

OWNER_COMMIT_AND_PUSH_AUTHORIZATION = GRANTED  
PRODUCTION_DEPLOYMENT_AUTHORIZATION = NOT GRANTED

## Package / branch

- Worktree: `tmi-release-69cc844e`
- Branch: `release/revenue-69cc844e`
- Base tip: `69cc844e cert(revenue): ship ad_purchase durability + Fan Sponsorship §27 ledger paths`

## Focused test evidence (actual)

```
npx jest --config=jest.config.js \
  --testPathPatterns="gpsReleaseActivation|lobbyWallMediaRouter|venueEntryModeLaw|previewFinancialIsolation" \
  --no-coverage --forceExit

Test Suites: 4 passed, 4 total
Tests:       23 passed, 23 total
```

INSTANT_PAYOUT_SHA256=`DACCBC1B2C6721B0942C394BE332B50728F5CEDA820C7E25B333DBC46C3A5E34`  
(`apps/web/src/lib/commerce/InstantPayoutEngine.ts`)

## Gate board (honest)

| Gate | Result | Evidence |
|------|--------|----------|
| S32_FINANCIAL | PASS (code) | `previewFinancialIsolation.ts` + 23 suite include; InstantPayoutEngine frozen path present. Migration `20261114120000_*` not found in this worktree tree search — treat DB migrate as owner/ops follow-up if not already applied. |
| TYPECHECK | PENDING/OOM risk | Full `tsc` started; historically OOM at 6GB. Do not mark GREEN until exit 0 captured. |
| PRODUCTION_BUILD | NOT RUN this pass | Required before SAFE_TO_PUSH absolute claim. |
| FOCUSED_TESTS | PASS | 23/23 |
| GPS | PASS (code) | VENUES → `/rooms`; GPS/OC launchers wired; allowlist LIVE inventory. Physical browser not re-run this pass. |
| OC | PASS (code) | `openRailMode("oc")` + heldRelease gates. Physical N/A this pass. |
| LOBBY_WALL | PASS (code) | Label exact `LOBBY WALL`; one-tap mosaic; instant Player routing. |
| SIMULTANEOUS_LIVE_PREVIEWS | PASS (policy+budget) | Living Lobby Wall law locked; IdleFallbackGovernor raises concurrent URL movers; visible+live never quality `off`. Real multi-feed device capture still required for PHYSICAL_GREEN. |
| ROOMS_AND_VENUES | PASS (code) | GPS VENUES href `/rooms`. |
| MEDIA_PLAYER_ROUTING | PASS (unit) | `lobbyWallMediaRouter` tests: Player1 free/replace; protect SELF_CAMERA → next free; all-protected → choice. |
| AUDIENCE_ENTRY | PASS (unit) | `joinIntent: WATCH` → SPECTATOR/FAN_SEAT for performers. |
| BACKSTAGE_ENTRY | PASS (unit) | `HOST_APPROVAL` → REQUESTED; publish gate private-by-default. |
| STAGE_ADMISSION | PASS (unit) | `backstagePublishGate` + duplicate admission lock + HostRoomControlBridge bring_on_stage gate. |
| VENUE_HUD | PASS (wired) | Existing `TMIInteractiveVenueHud` mounts in ArenaEventShell / InstantGoLive / GoLiveStudio. Physical control clicks not re-certified this pass. |
| AUTOMATED_EVENTS | NOT_ENABLED | Policy defaults on LiveRoomEngine (cypher/contest TMI_AUTOMATED). Do not expose as operational without physical cert. |
| HUMAN_EVENTS | NOT_ENABLED | Defaults HOST_APPROVAL / HUMAN_HOSTED on venue/event. |
| HYBRID_EVENTS | NOT_ENABLED | Battle default HYBRID in config; not product-exposed as certified mode. |
| COMING_SOON_ACTIVATION | PASS (partial) | Allowlist flipped verified LIVE destinations; friends/avatar-live/videos remain COMING_SOON. |
| MOBILE | NOT PHYSICALLY RE-RUN | Code paths sized for overlay GPS; mark RED for physical until Hub re-shot. |
| DESKTOP | NOT PHYSICALLY RE-RUN | Same. |
| REVENUE_ENTRY_POINTS | PRESERVED | No payout unfreeze; Stripe Preview fail-closed preserved. Live payouts still blocked. |
| PREVIEW_ISOLATION | BLOCKED (Dashboard) | Code fail-closed present. Owner must confirm Vercel Preview uses test Stripe + non-prod DB (no secret values in report). |
| INSTANT_PAYOUT_HASH | MATCH (recorded) | SHA256 above — verify against prior receipt on Copilot push. |
| RELEASE_MANIFEST | VERIFIED for this slice | See changed-file list below. |

## Launch-critical vs deferred

**Activate / ship in this slice**

- GPS VENUES → `/rooms`
- LOBBY WALL label + instant drawer/mosaic routing
- Living Lobby Wall continuous-motion policy (no intentional freeze of visible live tiles)
- Watch vs Join Stage intent
- Venue entry modes on LiveRoomConfig + participation resolution
- Backstage publish gate + duplicate admission protection
- Event resilience heartbeat / human takeover helpers
- Preview financial isolation tests

**Keep disabled / NOT_ENABLED until physical cert**

- Automated / Human / Hybrid as marketed operational modes
- Live payouts
- Friends / Avatar Live / Videos Coming Soon items

## Changed files (this convergence slice)

```
tmi-platform/apps/web/src/lib/commandCenter/gpsReleaseAllowlist.ts
tmi-platform/apps/web/src/lib/commandCenter/gpsReleaseActivation.test.ts
tmi-platform/apps/web/src/components/commandCenter/HubMobileGpsNavDrawer.tsx
tmi-platform/apps/web/src/components/commandCenter/CommandCenterMediaStack.tsx
tmi-platform/apps/web/src/components/commandCenter/CommandCenterShell.tsx
tmi-platform/apps/web/src/lib/workspace/universal/UniversalWorkspaceRegistry.ts
tmi-platform/apps/web/src/lib/lobby/livingLobbyWallLaw.ts
tmi-platform/apps/web/src/lib/lobby/lobbyWallMediaRouter.ts
tmi-platform/apps/web/src/lib/lobby/lobbyWallMediaRouter.test.ts
tmi-platform/apps/web/src/lib/lobby/LobbyPreviewRuntime.ts
tmi-platform/apps/web/src/lib/live/venueEntryModeLaw.ts
tmi-platform/apps/web/src/lib/live/venueEntryModeLaw.test.ts
tmi-platform/apps/web/src/lib/live/backstagePublishGate.ts
tmi-platform/apps/web/src/lib/live/eventResilienceLaw.ts
tmi-platform/apps/web/src/lib/live/LiveRoomEngine.ts
tmi-platform/apps/web/src/lib/live/ParticipationStateMachine.ts
tmi-platform/apps/web/src/lib/live/HostRoomControlBridge.ts
tmi-platform/apps/web/src/lib/adaptiveWorldRuntime/IdleFallbackGovernor.ts
tmi-platform/apps/web/src/lib/adaptiveWorldRuntime/WebRTCSubscriptionGovernor.ts
tmi-platform/apps/web/src/lib/adaptiveWorldRuntime/qualityContracts/LIVE_LOBBY_WALL.ts
tmi-platform/apps/web/src/lib/security/previewFinancialIsolation.ts
tmi-platform/apps/web/src/lib/security/previewFinancialIsolation.test.ts
```

## Copilot push instructions

1. Stage ONLY the launch-convergence file list above (do not `git add -A`).
2. Re-run the 23 focused Jest tests.
3. Capture TYPECHECK exit 0 or document OOM blocker.
4. Commit on `release/revenue-69cc844e`.
5. Push with existing remote tracking.
6. If Vercel Production deploy fires without PRODUCTION_DEPLOYMENT_AUTHORIZATION, STOP and report.
7. Confirm Preview Stripe remains test-mode + fail-closed code path.

## Remaining defects (honest)

1. Full TYPECHECK / production build not exit-0 certified in this Cursor pass.
2. Physical mobile/desktop Hub + Lobby Wall multi-feed not re-shot.
3. Vercel Preview credential split still owner Dashboard action if not already done.
4. Financial Prisma migration filename from earlier session not present in this worktree search — verify applied on target DB before live sales.
5. Event operator modes are config-wired, not product-certified as AUTOMATED/HUMAN/HYBRID LIVE.
