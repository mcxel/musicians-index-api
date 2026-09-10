# STEP 4 SLICE 1 — Canonical Go Live Path Convergence

**Branch:** `p0/step4-golive-canonical` (from `p0/integration-step3` @ `48f9b90d`)  
**Date:** 2026-09-10  
**NO MAIN PUSH · NO Production deploy**

---

## Canonical path chosen

```
UI affordance (PerformerGoLiveButton / LaunchDock / QuickLive / MediaPlayer /
               HUD GO_LIVE / InstantGoLiveLauncher / GoLiveControlPanel)
  → triggerCanonicalGoLive()
      → [hub/dashboard] presentInstantGoLiveInPlace()
      → [elsewhere] PENDING_GO_LIVE_KEY + /hub/{role}?golive=1
           → CommandCenterShell → presentInstantGoLiveInPlace()
  → executeInstantGoLive()
  → POST /api/live/go
  → GlobalLiveSessionRegistry (server) + DiscoveryBus / Lobby Wall

RUNTIME (not entry): InstantGoLiveStage → GoLiveRuntime | ArenaEventShell
  → UniversalVenueRenderer + TMIInteractiveVenueHud
```

**Session continuity law (code comments in `presentInstantGoLiveInPlace.ts`):**
- Preserve `roomId` / published session across curtain + HUD chrome.
- `isLivePublished` only after real registry POST success (Rule 20).
- Performer = WebRTC; Fan = avatar — do not blur.

---

## Before → After

| Surface | Before | After |
|---------|--------|-------|
| Entry authority | Mostly `triggerCanonicalGoLive`, but HUD + launcher + legacy panel diverged | All call same authority |
| `TMIInteractiveVenueHud` GO_LIVE | Artificial `setTimeout(800)` → fake LIVE | `presentInstantGoLiveInPlace`; resume if already published; fail honestly |
| `TMIInteractiveVenueHud` END_LIVE | Fake `setTimeout(500)` local clear | `endInstantGoLiveSession(roomId)` |
| `InstantGoLiveLauncher` | `executeInstantGoLive` then hub redirect (double-publish risk) | `triggerCanonicalGoLive` only |
| `GoLiveControlPanel` | Direct `POST /api/live/go` | `triggerCanonicalGoLive` |
| `/live/go`, `/go-live` | Already redirect to hub | Unchanged (comments updated) |
| `GoLiveStudio` | Unmounted from production routes | Left in tree as LEGACY file; not remounted |
| `BroadcastControlRuntime.startBroadcast` | Comment claimed GoLiveStudio-only | Comment points to canonical entry |

---

## Files changed

1. `apps/web/src/lib/dock/presentInstantGoLiveInPlace.ts` — canonical entry + continuity law comment block
2. `apps/web/src/components/venue-hud/TMIInteractiveVenueHud.tsx` — real GO_LIVE / END_LIVE
3. `apps/web/src/components/live/InstantGoLiveLauncher.tsx` — use `triggerCanonicalGoLive`
4. `apps/web/src/components/performer/GoLiveControlPanel.tsx` — retire duplicate POST
5. `apps/web/src/lib/broadcast/BroadcastControlRuntime.ts` — comment realignment
6. `apps/web/src/app/live/go/page.tsx` — comment realignment
7. `apps/web/src/tests/runGoLiveCanonicalEntry.test.ts` — source-level contracts
8. `.cursor/artifacts/step4-3d-authority/STEP4_GOLIVE_CONVERGENCE.md` — this artifact

---

## Remaining audit order items (honest)

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Canonical Go Live entry | 🟢 this slice | |
| 2 | Venue mesh / Herser binding | 🟡 | Out of scope — registries not fully bound |
| 3 | Presence converge (4 seat systems) | 🟡 | Rule 21 known gap |
| 4 | Curtain full server authority | 🔴 | Rule 29 Directors not built; local StageLifecycle only |
| 5 | Overlays / Jumbotron director | 🟡 | Partial; not this slice |
| 6 | Avatar Creation Center dual-studio gap | 🟡 | Order #8 later — note only |
| 7 | WebXR / walkable GLB | 🔴 deferred | Explicitly out of scope |
| 8 | hub-immersive merge | 🔴 deferred | Explicitly out of scope |

---

## Tests / typecheck

- `runGoLiveCanonicalEntry.test.ts` — **PASS** (source contracts)
- `runGoLiveLaunchPipeline.test.ts` — **PASS**
- `runGoLiveAdmitGate.test.ts` — **PASS**
- `tsc --noEmit` project has pre-existing unrelated errors; **zero errors** in touched Go Live files (filtered)

## PHYSICAL status

**BLOCKED** — no real camera / authenticated performer session exercised in this agent pass.  
Code paths no longer claim LIVE via timer; physical cert still required on hub with cam + cookie session.

---

## Next recommended slice (Marcel order)

**#2 — Venue mesh / Herser asset binding audit → thin registry glue**  
(or presence converge if mesh audit already green). Do **not** merge hub-immersive. Do **not** start Avatar Creation Center rewrite until Go Live + venue binding are stable.
