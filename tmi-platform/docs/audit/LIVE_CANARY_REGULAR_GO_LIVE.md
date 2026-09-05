# LIVE CANARY — Regular GO LIVE → Live Media Fabric

**Date:** 2026-08-31 (physical click closed 2026-09-01)  
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

**PASS (wiring + automated 12-gate suite + physical media-player GO LIVE click).**

Physical browser (clean Next after killing stale `:3000`, wiped `.next`):

- Performer cert login **PASS**
- Hub React hydration **PASS**
- `MediaPlayerGoLiveControl` host **PASS**
- `POST /api/live/go` **200** **PASS**
- Registry LIVE (`count=1`) **PASS**
- Fabric observatory `window.__TMI_LIVE_FABRIC_CANARY__` state=`LIVE`, sources=4, history `PREFLIGHT→READY→CONNECTING→PUBLISHING→LIVE` **PASS**
- Lobby Wall discoverable (`/api/live/lobby-wall` → `cards`) **PASS**
- END LIVE teardown → observatory `ENDED` / `canaryActive=false` / registry `count=0` **PASS**
- Fan `?watch=` presence: **skipped** (optional; no live room left after teardown — expected)

Automated:

```text
npx jest --config jest.config.ts src/tests/runRegularGoLiveFabricCanary.test.ts
→ Tests: 11 passed
```

Physical harness: `.cursor/artifacts/live-canary-regular/cert-live-canary.mjs`  
Latest report: `.cursor/artifacts/live-canary-regular/cert-report.json`

**Harness note (not a product bug):** first physical re-run failed because click hit SSR markup before React fiber hydration (no POST). Aligning with P0-1 hydration + page-session waits closed the PARTIAL. No canary-boundary code change; no commit.

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
| 2 | PUBLICATION — media-player path; no duplicate publisher; no fake LIVE | **PASS** (physical POST 200 + registry) |
| 3 | SESSION KERNEL — PREFLIGHT→READY→CONNECTING→PUBLISHING→LIVE | **PASS** |
| 4 | MEDIA GRAPH — cam, mic, venue renderer, audience renderer | **PASS** |
| 5 | PROGRAM/PREVIEW — prepare then TAKE; no stream recreation | **PASS** |
| 6 | SURFACE COMPOSER — FLAT → HYBRID → PIP → FOCUS → FLAT | **PASS** |
| 7 | AUDIENCE — real human count sync only | **PASS** |
| 8 | DISCOVERY — experience gate; exact join routes unchanged | **PASS** (Lobby Wall physical) |
| 9 | AUDIO — single MIC program authority | **PASS** |
| 10 | RECOVERY — camera loss / NET-DROP; session stays LIVE | **PASS** |
| 11 | TEARDOWN — END LIVE unbinds fabric + registry cleanup | **PASS** (physical) |
| 12 | OBSERVATORY — `getRegularGoLiveCanaryObservatory()` / `window.__TMI_LIVE_FABRIC_CANARY__` | **PASS** (physical LIVE) |

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

1. ~~Physical certify media-player GO LIVE with canary observatory visible (`__TMI_LIVE_FABRIC_CANARY__`).~~ **DONE PASS**
2. **Do not** start Experience #2 until owner explicitly unlocks (physical PASS achieved; Experience #2 still locked by product order).
3. Then expand experience-by-experience under the same boundary pattern.

---

## Return block

```
CANARY STATUS: PASS (wiring + automated 12-gate + physical click)
PHYSICAL GO LIVE CLICK: PASS
POST /api/live/go: 200
Fabric LIVE?: YES (state=LIVE, sources=4, PREFLIGHT→…→LIVE)
Observatory: PASS (window.__TMI_LIVE_FABRIC_CANARY__)
Teardown: PASS (ENDED, canaryActive=false, registry count=0)
PUBLICATION: PASS
SESSION KERNEL: PASS
MEDIA GRAPH: PASS
PROGRAM/PREVIEW: PASS
SURFACE COMPOSER: PASS
AUDIENCE SYNC: PASS
DISCOVERY PROPAGATION: PASS
AUDIO: PASS
RECOVERY: PASS
ROLLBACK REQUIRED: NO
READY FOR EXPERIENCE #2: NO
```
