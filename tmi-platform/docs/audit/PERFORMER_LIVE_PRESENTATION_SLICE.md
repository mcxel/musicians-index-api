# PERFORMER LIVE PRESENTATION SLICE — Phase 1

**Date:** 2026-09-02  
**Branch:** `eos/vocal-improv-clean`  
**Scope:** Upward production presentation on frozen Regular GO LIVE canary  
**Artifacts:** `.cursor/artifacts/performer-live-slice/`  
**DNA:** [`EXPERIENCE_PRESENTATION_DNA.md`](./EXPERIENCE_PRESENTATION_DNA.md) · Matrix [`TMI_EXPERIENCE_COMPLETION_MATRIX.md`](./TMI_EXPERIENCE_COMPLETION_MATRIX.md)

---

## Preconditions (frozen — do not rebuild)

| Gate | Evidence |
|------|----------|
| Live Fabric + Regular GO LIVE canary | `c7fe92cc` era · [`LIVE_CANARY_REGULAR_GO_LIVE.md`](./LIVE_CANARY_REGULAR_GO_LIVE.md) |
| Jumbotron P0 | `1b99ceba` |
| Experience matrix + packs | `9cfc222f`, `5de2f2a1` |
| Audience presence P0-2 | certified |

---

## What changed

| Piece | Path | Role |
|-------|------|------|
| PROGRAM composer | `lib/experiencePresentation/composePerformerLiveProgram.ts` | Composes `PROGRAM.PERFORMER_CAMERA` from canary sources; binds Universal Player + optional Jumbotron **without** new session id |
| Production shell | `components/live/PerformerLivePresentationShell.tsx` | Host-first DNA: LiveVideoPanel + IdentityPanel; `data-surface-kind="production"` |
| Monitor A | `components/live/HubMonitorCameraPlayer.tsx` | Wraps camera in production shell (not bare/diagnostic chrome) |
| GO LIVE attach | `lib/dock/presentInstantGoLiveInPlace.ts` | After fabric TAKE → `composePerformerLiveProgram(HOST_CLOSE)` |
| END LIVE | `lib/dock/executeInstantGoLive.ts` | `clearPerformerLiveProgram` |
| Jumbotron optional | `components/jumbotron/VenueAutomatedJumbotronMount.tsx` | REGULAR_LIVE event from same PROGRAM identity |
| Pack cert lanes | `lib/experiencePresentation/packs/index.ts` | architectureCert **DONE**; experienceCert **OPEN** |

**Hard laws respected:** no second LiveSession / WebRTC / player runtime; no fake audience/tips; cam/mic remain privacy-gated; Presence Continuity + Universal Player Freedom; green/debug ≠ experienceCert PASS; Battle Voltron not started.

---

## Trace (Regular GO LIVE → media → presentation)

```
Hub GO LIVE / MediaPlayerGoLiveControl
  → presentInstantGoLiveInPlace
    → executeInstantGoLive (registry publish — unchanged)
    → Regular GO LIVE fabric canary PREFLIGHT→…→LIVE (unchanged)
    → prepareThenTakeRegularGoLiveProgram (PROGRAM bus — unchanged)
    → composePerformerLiveProgram (NEW — production PROGRAM + targets)
  → CommandCenterMediaStack Monitor A
    → HubMonitorCameraPlayer
      → PerformerLivePresentationShell (production identity + live texture)
  → Monitor B HubMonitorVenuePlayer (audience truth — unchanged)
  → Optional Jumbotron REGULAR_LIVE surface (same PROGRAM label)
```

Diagnostic observatory (`window.__TMI_LIVE_FABRIC_CANARY__`) remains for logic cert only.  
Production presentation hook: `window.__TMI_PERFORMER_LIVE_PROGRAM__` (`surfaceKind: "production"`).

---

## Certification lanes (honesty)

| Lane | Status | Notes |
|------|--------|-------|
| logicCert | PARTIAL | Canary + compose unit tests (**9/9 PASS** `semanticGuards.test.ts`) |
| architectureCert | **DONE** | Pack wired; SOURCE≠DECODER≠TARGET; no second runtime |
| experienceCert | **OPEN** | Physical harness ran 2026-09-02 — hub/auth PASS; **publication timed out** under overloaded Next (`signal timed out` on `/api/live/go`); production DOM not observed. Green/debug cannot PASS. Re-run `.cursor/artifacts/performer-live-slice/cert-performer-live.mjs` on a healthy warm server. |

---

## Automated proof

```text
npx jest --config jest.config.ts src/lib/experiencePresentation/__tests__/semanticGuards.test.ts
→ Tests: 9 passed
```

Physical harness: `.cursor/artifacts/performer-live-slice/cert-performer-live.mjs`  
Latest report: `.cursor/artifacts/performer-live-slice/cert-report.json` (FAIL — publication timeout; not a presentation regression)

---

## Return block

```
SLICE STATUS: architecture DONE · experience OPEN (physical blocked by publish timeout)
UNIT TESTS: 9/9 PASS
CANARY PATH: preserved (no fabric rebuild)
NEXT SLICE: Battle world presentation (when ready) — not cinematic Voltron
```

*Locked 2026-09-02 for Marcel Dickens. Assembly-director posture.*
