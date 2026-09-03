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
4bd5ef3b27d9c7d0f8403184f86f76a507e1eff6
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
FOR EACH:
CompactAudioMixer.tsx — TRACKED: YES | IMPORTED: YES (CommandCenterMediaStack) | REQUIRED BY CLEAN BUILD: YES
AvatarQuickChangeDrawer.tsx — TRACKED: YES | IMPORTED: YES (CommandCenterMediaStack) | REQUIRED BY CLEAN BUILD: YES
ExploreMatrixDiscoveryHost.tsx — TRACKED: YES | IMPORTED: YES (CommandCenterMediaStack + CompactQuickPanelHost) | REQUIRED BY CLEAN BUILD: YES
FastPlaylistCastPicker.tsx — TRACKED: YES | IMPORTED: YES (CommandCenterMediaStack) | REQUIRED BY CLEAN BUILD: YES
AvatarCameraDirector.ts — TRACKED: YES | IMPORTED: YES (VenueAutomatedJumbotronMount; not Fan Hub chain) | REQUIRED BY CLEAN BUILD: YES
JumbotronImpulseSeenPrompt.tsx — TRACKED: YES | IMPORTED: YES (CinematicChallengeArenaStage; not Fan Hub chain) | REQUIRED BY CLEAN BUILD: YES
PerformerSponsorCabinetOverlay.tsx — TRACKED: YES | IMPORTED: YES (CinematicChallengeArenaStage; not Fan Hub chain) | REQUIRED BY CLEAN BUILD: YES
CLEAN CHECKOUT
install: PASS
typecheck: FAIL
production build: FAIL
DEPLOY
production deploy completed: NO
deployed commit: e57c520d9ca43c859fdf7d7eea1f29450e1a6fce (unchanged)
PRODUCTION PHYSICAL DESKTOP
/hub/fan converged shell: FAIL
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
| Hub convergence ancestor | `7bd3fc6e` (physical convergence) — **not** on `main` |
| Module-tracking recovery commit | `4bd5ef3b` (local on `eos/vocal-improv-clean`) |
| Divergence | EOS ≈ 141 commits ahead of `origin/main`; `main` ≈ 2 commits not in EOS |
| Vercel CLI auth | `mcxel` present |
| GitHub CLI auth | not logged in |

## What was wrong

1. Production serves **`main`**, not the EOS Hub convergence line.
2. On `main`, `/hub/fan` mounts **`FanHQShell`** (client session fetch), not cookie-first **`FanHubMount` → `FanShell`**.
3. On `main` `CommandCenterMediaStack`, only legacy **CAST · PLAYLIST / CAST TO WORKSPACE MONITOR** exists. There is **no** `CAST GROUP`, **no** `FastPlaylistCastPicker`, **no** `presentInstantGoLiveInPlace` / MediaStack **GO LIVE** utility.
4. Converged MediaStack on EOS already imported CAST/mixer modules, but those files were **untracked** until `4bd5ef3b`.

## Recovery actions taken

1. Identified production via `/api/version` + Vercel headers.
2. Traced `/hub/fan` chains (EOS vs `main`).
3. Committed missing Hub modules + transitive audio/jumbotron/avatar contract files as `4bd5ef3b`.
4. Clean worktree at `4bd5ef3b`: `pnpm -w install --frozen-lockfile` **PASS**.
5. Clean typecheck **FAIL** (pre-existing + still-missing untracked deps, e.g. `PerformerSponsorCabinetEngine`, `AvatarSpatialCollisionEngine`, Prisma/test noise).
6. Clean `pnpm --filter web build` **FAIL** — missing modules including:
   - `@/lib/audience/audienceSeatGeometry`
   - `../../lib/sponsor/PerformerSponsorCabinetEngine`
   - `../battle/CinematicParticipantArrivalDirector`
   - `../monitors/DisplayTargetDirector`
7. **No production deploy** — would ship a non-building candidate or leave `main` unchanged.
8. Unauthenticated physical Chromium: `/hub/fan` → `/auth?next=%2Fhub%2Ffan` (desktop + 390×844). Evidence under `.cursor/artifacts/p0-hub-deployment-recovery/`.
9. Credentialed Hub CAST/GO LIVE probe was **blocked by sandbox auto-review**; not faked as PASS.

## Honest physical gates

Without an authenticated Hub session on production, CAST/GO LIVE cannot be exercised in-browser. Combined with **code identity** (`main` @ `e57c520d` lacks converged MediaStack CAST GROUP + canonical GO LIVE), those gates are **FAIL**.

## Next human action (to CLOSE P0)

1. On `eos/vocal-improv-clean`, track **all** remaining modules required for `next build` (list above + BFS closure from dirty working tree).
2. Re-run clean worktree: install → typecheck → `pnpm --filter web build` until **PASS**.
3. Promote candidate onto **`main`** (merge/PR) — production Vercel tracks `main`, not EOS.
4. Deploy / wait for Vercel production; confirm `/api/version` SHA == candidate.
5. Authenticated Chromium against `https://themusiciansindex.com/hub/fan` (documented cert account `micah@themusiciansindex.com` / `CERT_*` env) — desktop + 390×844 — prove CAST + canonical GO LIVE (`presentInstantGoLiveInPlace`).
6. Re-run this audit; only then mark **P0 CLOSED**.

## Evidence paths

- `.cursor/artifacts/p0-hub-deployment-recovery/prod-version.json`
- `.cursor/artifacts/p0-hub-deployment-recovery/unauth-probe.json`
- `.cursor/artifacts/p0-hub-deployment-recovery/01-desktop-hub-fan-redirect.png`
- `.cursor/artifacts/p0-hub-deployment-recovery/05-mobile-hub-fan-redirect-390x844.png`
