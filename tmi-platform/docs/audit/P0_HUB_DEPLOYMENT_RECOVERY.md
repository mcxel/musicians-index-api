# P0 Hub Deployment Recovery

**Date:** 2026-09-03  
**Authority:** Marcel Dickens — P0 = deployment recovery ONLY  
**Agent:** Assembly Director  

## Verdict block

```text
P0 DEPLOYMENT RECOVERY VERDICT
PRODUCTION BRANCH
main
PRODUCTION DEPLOYED COMMIT
e57c520d9ca43c859fdf7d7eea1f29450e1a6fce
CANDIDATE CONVERGED COMMIT
a491df5af05845eb01d6b8ad6df79f2ba75df648
ROUTE OWNER
apps/web/src/app/hub/fan/page.tsx
/hub/fan -> exact component chain
EOS candidate: page.tsx → FanHubMount → FanShell → CommandCenterShell → CommandCenterMediaStack (CAST GROUP + presentInstantGoLiveInPlace)
PRODUCTION main: page.tsx → FanHQShell → CommandCenterShell → CommandCenterMediaStack (legacy PlaylistCastBody only; no CAST GROUP / no presentInstantGoLiveInPlace)
TRACKED MODULE INTEGRITY
CompactAudioMixer.tsx
AvatarQuickChangeDrawer.tsx
ExploreMatrixDiscoveryHost.tsx
FastPlaylistCastPicker.tsx
AvatarCameraDirector.ts
JumbotronImpulseSeenPrompt.tsx
PerformerSponsorCabinetOverlay.tsx
audienceSeatGeometry.ts
PerformerSponsorCabinetEngine.ts
CinematicParticipantArrivalDirector.ts
DisplayTargetDirector.ts
AvatarSpatialCollisionEngine.ts
JumbotronHardwareChassisCatalog.ts
FOR EACH:
CompactAudioMixer.tsx — TRACKED: YES | IMPORTED: YES (CommandCenterMediaStack) | REQUIRED BY CLEAN BUILD: YES
AvatarQuickChangeDrawer.tsx — TRACKED: YES | IMPORTED: YES (CommandCenterMediaStack) | REQUIRED BY CLEAN BUILD: YES
ExploreMatrixDiscoveryHost.tsx — TRACKED: YES | IMPORTED: YES (CommandCenterMediaStack + CompactQuickPanelHost) | REQUIRED BY CLEAN BUILD: YES
FastPlaylistCastPicker.tsx — TRACKED: YES | IMPORTED: YES (CommandCenterMediaStack) | REQUIRED BY CLEAN BUILD: YES
AvatarCameraDirector.ts — TRACKED: YES | IMPORTED: YES (VenueAutomatedJumbotronMount; not Fan Hub chain) | REQUIRED BY CLEAN BUILD: YES
JumbotronImpulseSeenPrompt.tsx — TRACKED: YES | IMPORTED: YES (CinematicChallengeArenaStage; not Fan Hub chain) | REQUIRED BY CLEAN BUILD: YES
PerformerSponsorCabinetOverlay.tsx — TRACKED: YES | IMPORTED: YES (CinematicChallengeArenaStage; not Fan Hub chain) | REQUIRED BY CLEAN BUILD: YES
audienceSeatGeometry.ts — TRACKED: YES | IMPORTED: YES (AudienceScene) | REQUIRED BY CLEAN BUILD: YES
PerformerSponsorCabinetEngine.ts — TRACKED: YES | IMPORTED: YES (PerformerSponsorCabinetOverlay) | REQUIRED BY CLEAN BUILD: YES
CinematicParticipantArrivalDirector.ts — TRACKED: YES | IMPORTED: YES (ChallengeOperationalLifecycle + CinematicChallengeArenaStage) | REQUIRED BY CLEAN BUILD: YES
DisplayTargetDirector.ts — TRACKED: YES | IMPORTED: YES (Jumbotron + VenueAdSurfaceRegistry) | REQUIRED BY CLEAN BUILD: YES
AvatarSpatialCollisionEngine.ts — TRACKED: YES | IMPORTED: YES (AvatarCameraDirector) | REQUIRED BY CLEAN BUILD: YES
JumbotronHardwareChassisCatalog.ts — TRACKED: YES | IMPORTED: YES (ChallengeCinematicProfile) | REQUIRED BY CLEAN BUILD: YES
CLEAN CHECKOUT
worktree: tmi-platform-p0-hub-clean @ a491df5a (detached)
install: PASS (existing node_modules; frozen lockfile compatible)
typecheck: PASS (pnpm --filter web typecheck → exit 0)
production build: PASS (pnpm --filter web build → exit 0; pg-native warning only; SSG logged missing DATABASE_URL but completed)
DEPLOY
production deploy completed: NO
deployed commit: e57c520d9ca43c859fdf7d7eea1f29450e1a6fce (unchanged)
reason: clean build green on EOS, but production Vercel tracks main; no merge/promote this slice; vercel CLI not on PATH in this shell
PRODUCTION PHYSICAL DESKTOP
/hub/fan converged shell: FAIL (still main @ e57c520d)
CAST visible: FAIL
CAST functional: FAIL
GO LIVE visible: FAIL
GO LIVE canonical path: FAIL
PRODUCTION PHYSICAL MOBILE 390×844
converged shell: FAIL
CAST reachable: FAIL
GO LIVE reachable: FAIL
FINAL
P0 DEPLOYMENT RECOVERY: OPEN
```

## Deploy path facts

| Fact | Value |
|------|-------|
| Production host | `https://themusiciansindex.com` |
| Hosting | Vercel project `themusiciansindex-live` (`prj_2zxbiaAEMKlsivU5MxAv6rG86IWj`) |
| Production branch | `main` (`/api/version` → `branch: "main"`) |
| Live SHA | `e57c520d` |
| Candidate branch | `eos/vocal-improv-clean` |
| Candidate tip (pushed) | `a491df5a` |
| Hub convergence ancestor | `7bd3fc6e` (physical convergence) — **not** on `main` |
| Prior module-tracking commit | `4bd5ef3b` |
| Build-closure commits this slice | `c37ef060`, `a491df5a` |
| Divergence | EOS ahead of `origin/main`; production unchanged until merge |
| Vercel CLI this shell | not on PATH (`vercel` command missing) — DEPLOY=NO |
| GitHub push | `eos/vocal-improv-clean` → `origin` @ `a491df5a` PASS |

## What was wrong

1. Production serves **`main`**, not the EOS Hub convergence line.
2. On `main`, `/hub/fan` mounts **`FanHQShell`**, not cookie-first **`FanHubMount` → `FanShell`**.
3. On `main` `CommandCenterMediaStack`, only legacy CAST exists — no `CAST GROUP` / `presentInstantGoLiveInPlace`.
4. Converged MediaStack on EOS imported CAST/mixer modules that were untracked until `4bd5ef3b`.
5. After `4bd5ef3b`, clean typecheck/build still failed on **six further untracked transitive modules** plus minimal type mismatches.

## Recovery actions taken (this slice)

1. Clean worktree `tmi-platform-p0-hub-clean` reset to candidate HEAD; reproduced failures.
2. Tracked remaining modules (BFS closure from Hub/Challenge/Jumbotron importers):
   - `apps/web/src/lib/audience/audienceSeatGeometry.ts`
   - `apps/web/src/lib/sponsor/PerformerSponsorCabinetEngine.ts`
   - `apps/web/src/lib/battle/CinematicParticipantArrivalDirector.ts`
   - `apps/web/src/lib/monitors/DisplayTargetDirector.ts`
   - `apps/web/src/lib/avatar/AvatarSpatialCollisionEngine.ts`
   - `apps/web/src/lib/jumbotron/JumbotronHardwareChassisCatalog.ts`
3. Minimal glue/type fixes (no Hub redesign; Challenge frozen left intact except fabric union needed by already-committed ChallengeOperationalLifecycle):
   - `CommandCenterShell` — null-guard `useSearchParams()` before `onParams`
   - `CanonicalUniversalPlayerFabric` — add `CHALLENGE_*` source/viewpoint unions
   - `JumbotronAdObservatoryControlRoom` — `currentSourceKind` field name
   - `runFourSidedJumbotronAndAdSurfaceCertification.test.ts` — optional chaining
   - `VenueAdSurfaceRegistry` — `InteractiveCommercePayload` alias
4. Clean checkout: **typecheck PASS**, **production build PASS** @ `a491df5a`.
5. Pushed `eos/vocal-improv-clean` to origin.
6. **No production deploy / no merge to main** this slice.

## Honest physical gates

Production still serves `main` @ `e57c520d` without converged CAST GROUP / canonical GO LIVE. Physical CAST/GO LIVE on production remain **FAIL** until merge + deploy + authenticated probe.

## Ready-for-Marcel (to CLOSE P0) — DEPLOY=NO until done

Safe reversible path (project convention: Vercel production tracks **`main`**):

1. Open PR: `main` ← `eos/vocal-improv-clean` @ `a491df5a` (or merge locally if Marcel prefers).
2. Review / CI green; merge to `main`.
3. Wait for Vercel production deploy of `themusiciansindex-live` from `main`.
4. Confirm `https://themusiciansindex.com/api/version` SHA == merged candidate.
5. Authenticated Chromium desktop + 390×844 on `/hub/fan` — prove CAST GROUP + `presentInstantGoLiveInPlace` GO LIVE.
6. Re-run this audit; only then mark **P0 CLOSED**.

Do **not** start Bezel Broadcast Destination Rail until P0 CLOSED.

## Evidence paths

- `.cursor/artifacts/p0-hub-deployment-recovery/prod-version.json`
- `.cursor/artifacts/p0-hub-deployment-recovery/unauth-probe.json`
- `.cursor/artifacts/p0-hub-deployment-recovery/clean-typecheck-a491df5a.log` (or `clean-typecheck-c37ef060.log` / prior)
- `.cursor/artifacts/p0-hub-deployment-recovery/clean-build-a491df5a.log`
- `.cursor/artifacts/p0-hub-deployment-recovery/01-desktop-hub-fan-redirect.png` (prior unauth)
- `.cursor/artifacts/p0-hub-deployment-recovery/05-mobile-hub-fan-redirect-390x844.png` (prior unauth)
