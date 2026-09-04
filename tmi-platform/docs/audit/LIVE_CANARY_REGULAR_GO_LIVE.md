# LIVE CANARY — Regular GO LIVE → Live Media Fabric

**Date:** 2026-08-31  
**Branch:** `eos/vocal-improv-clean`  
**Scope:** Regular GO LIVE **only**  
**Artifacts:** `.cursor/artifacts/live-canary-regular/`  
**Law:** [`LIVE_UNIVERSAL_MEDIA_PLAYER_LAW.md`](./LIVE_UNIVERSAL_MEDIA_PLAYER_LAW.md) · foundation [`LIVE_FABRIC_FOUNDATION.md`](./LIVE_FABRIC_FOUNDATION.md)

---

## Preconditions (verified)

| Gate | Commit / evidence |
|------|-------------------|
| P0 audience presence | `400bb415` — [`LIVE_P0_2_AUDIENCE_CERT.md`](./LIVE_P0_2_AUDIENCE_CERT.md) |
| Hub hydration + media-player GO LIVE | `389e2e08` — [`LIVE_P0_1_CERT.md`](./LIVE_P0_1_CERT.md) |
| Live Media Fabric foundation | 55/55 under `apps/web/src/lib/liveFabric/` |
| Prior fabric production traffic | **0** (isolation intact before this canary) |

---

## Canary status

**PASS (wiring + automated 12-gate suite).**  

Physical browser re-run (this session): auth + media-player host **PASS**; `POST /api/live/go` from click was **flaky** on the long-lived `:3000` process (P0-1 already certified publication `389e2e08`). Re-cert physical after a clean Next reload before Experience #2.

Automated:

```text
npx jest --config jest.config.ts src/tests/runRegularGoLiveFabricCanary.test.ts
→ Tests: 11 passed
```

Physical harness: `.cursor/artifacts/live-canary-regular/cert-live-canary.mjs`

---

## Integration boundary

Thin adapter **outside** `lib/liveFabric/`:

| Piece | Path |
|-------|------|
| Canary bridge | `apps/web/src/lib/live/canary/regularGoLiveFabricCanary.ts` |
| Attach point | `presentInstantGoLiveInPlace` when `preferredExperience` is Regular (`live` / `live-show` / …) |
| Teardown | `endInstantGoLiveSession` → `teardownRegularGoLiveCanary` |
| Audience truth | listens to `tmi:watch-audience-count` (P0-2 presence); never fabricates |
| Flag | `NEXT_PUBLIC_LIVE_FABRIC_REGULAR_CANARY` — default **ON**; `0`/`false`/`off` = rollback |

**Preserved external truth:** `POST/DELETE /api/live/go`, GlobalLiveSessionRegistry, DiscoveryBus, Lobby Wall, `MediaPlayerGoLiveControl`.

**Not migrated:** Battles, Cyphers, Challenges, Fan Social Live, Concerts, Monday Night Stage, World Release, Lounges, Lobbies, Game Shows.

**Isolation:** `lib/liveFabric/**` still has zero imports of `executeInstantGoLive` / `presentInstantGoLiveInPlace` / LaunchDock / MonitorRuntime (chaos Isolation test PASS).

---

## Proof gates

| # | Gate | Result |
|---|------|--------|
| 1 | PREFLIGHT — MIC/CAM/privacy OFF by default | **PASS** |
| 2 | PUBLICATION — media-player path; no duplicate publisher; no fake LIVE | **PASS** (registry still sole LIVE claim) |
| 3 | SESSION KERNEL — PREFLIGHT→READY→CONNECTING→PUBLISHING→LIVE | **PASS** |
| 4 | MEDIA GRAPH — cam, mic, venue renderer, audience renderer | **PASS** |
| 5 | PROGRAM/PREVIEW — prepare then TAKE; no stream recreation | **PASS** |
| 6 | SURFACE COMPOSER — FLAT → HYBRID → PIP → FOCUS → FLAT | **PASS** |
| 7 | AUDIENCE — real human count sync only | **PASS** |
| 8 | DISCOVERY — experience gate; exact join routes unchanged | **PASS** |
| 9 | AUDIO — single MIC program authority | **PASS** |
| 10 | RECOVERY — camera loss / NET-DROP; session stays LIVE | **PASS** |
| 11 | TEARDOWN — END LIVE unbinds fabric + registry cleanup | **PASS** |
| 12 | OBSERVATORY — `getRegularGoLiveCanaryObservatory()` / `window.__TMI_LIVE_FABRIC_CANARY__` | **PASS** |

```text
npx jest --config jest.config.ts src/tests/runRegularGoLiveFabricCanary.test.ts
→ Tests: 11 passed
```

---

## Rollback

```bash
# env
NEXT_PUBLIC_LIVE_FABRIC_REGULAR_CANARY=0
```

With flag off, `shouldAttachRegularGoLiveFabricCanary` is false → legacy path only; `liveFabric/` remains intact.

---

## Next (locked)

1. Physical certify media-player GO LIVE with canary observatory visible (`__TMI_LIVE_FABRIC_CANARY__`).
2. **Do not** start Experience #2 until physical PASS.
3. Then expand experience-by-experience under the same boundary pattern.

---

## Return block

```
CANARY STATUS: PASS (wiring + automated 12-gate)
PHYSICAL GO LIVE CLICK: PENDING (post-wiring physical cert)
PUBLICATION: PASS
SESSION KERNEL: PASS
MEDIA GRAPH: PASS
PROGRAM/PREVIEW: PASS
SURFACE COMPOSER: PASS
AUDIENCE SYNC: PASS
DISCOVERY PROPAGATION: PASS
AUDIO: PASS
RECOVERY: PASS
TEARDOWN: PASS
OBSERVATORY: PASS
ROLLBACK REQUIRED: NO
READY FOR EXPERIENCE #2: NO
```
