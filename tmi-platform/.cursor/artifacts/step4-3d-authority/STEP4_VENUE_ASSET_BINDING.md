# STEP 4 SLICE 2 — Certified Venue Mesh / Herser Asset Binding

**Branch:** `p0/step4-golive-canonical`  
**Base:** `p0/integration-step3` @ `48f9b90d`  
**Slice 1 HEAD preserved:** `c25564a9`  
**Date:** 2026-09-10  
**NO MAIN PUSH · NO Production deploy**

Operating law: AUDIT → MATCH → BIND → VERIFY → CERTIFY

---

## 1. Venue asset inventory

| Asset / pack | Path | Type | Size (approx) | Runtime importable? | Classification |
|---|---|---|---|---|---|
| Room ambient loops (8) | `apps/web/public/assets/videos/rooms/*.mp4` | MP4 | ~2.6–3.0 MB each | YES (video) | **GREEN** (degraded visual) |
| Avatar bobblehead_v0 | `apps/web/public/models/avatars/bobblehead_v0.glb` | GLB | ~2.0 MB | YES (avatar only) | **GREEN** for avatar — **NOT a venue mesh** |
| Foundry avatar proof | `packages/assets/generated/manufacturing/.../avatar-BH-A-base.glb` | GLB | ~2.0 MB | manufacturing | Avatar only |
| Venue Skins Plus Seating | `tmi-platform/Venue Skins Plus Seating/` (+ zip) | JPG/HTM | zip ~551 KB | NO | **PLACEHOLDER** concept art |
| game show and venue skins | `tmi-platform/game show and venue skins/` (+ zip) | JPG/PNG hosts | zip ~5.1 MB | NO | **PLACEHOLDER** / host portraits |
| Dasboard and venues | `tmi-platform/Dasboard and venues/` (+ zip) | HTML/JSX mocks | zip ~61 KB | NO | **LEGACY** mock / blueprint |
| Lobbies folder | `tmi-platform/Lobbies/` | (empty / no mesh) | — | NO | **UNKNOWN**/empty |
| `/models/venue-stage.glb` | referenced by `VenueRuntimeShell` | MISSING | — | NO | **RED** missing path |
| monday-night-stage contract GLBs | `VenueAssetContract` DEV_FIXTURE | placeholder avatar GLB | — | DO NOT CERTIFY | **E_LEGACY** / PLACEHOLDER |

**Textures / materials / stage / audience / seating / collision / navmesh / jumbotron / lighting / scale (meshes):**  
No production venue GLB exposes these. Registry `VenueGeometry` is authored metadata only (displayCapacity, ledWalls labels, lightingRig enums) — not measured mesh data.

**Herser conclusion:** Reference packs were searched on disk (including ignored dirs). **Zero `.glb/.gltf/.fbx/.obj` venue worlds** found. Do not rebuild; bind what exists (video + AudienceScene CSS/canvas).

---

## 2. Registry mapping

Canonical visual registry: `apps/web/src/lib/venues/VenueAssetRegistry.ts`  
Bind layer (not a second registry): `apps/web/src/lib/venues/CertifiedVenuePackage.ts`

Chain:

```
selectedVenueId
  → resolveCertifiedVenuePackage / resolveGoLiveCertifiedVenuePackage
  → VenueAssetRegistry entry
  → CertifiedVenuePackage
  → RoomEnvironmentLayer + UniversalVenueRenderer
  → InstantGoLiveStage / GoLiveRuntime / ArenaEventShell
```

| Class | Meaning | Slice 2 result |
|---|---|---|
| A | real mesh | **0** venues |
| B | video-only | Regular Go Live venues with verified ambient MP4 |
| C | missing asset | unknown ids; `slow-jams` ambient path unverified (`lounge-variant.mp4` absent) |
| D | duplicate | `lib/assets/venueAssetRegistry.ts` = ticket tile images — **not** live authority (left alone) |
| E | legacy | monday-night-stage DEV_FIXTURE contract GLBs rejected |

Fake occupancy/tickets from old VenueRegistry were **not** migrated into live package authority.

---

## 3. Canonical venue package contract

Reuses: `VenueType`, `VenueAsset`, `GlbAssetRef`, `VENUE_CONTRACT_REGISTRY`, `SCENE_FACTORY_AUDIT`.

`CertifiedVenuePackage` fields: venueId, displayName, geometryAsset, ambient video, logical stageMount, seatingLayoutId (null), jumbotronMount (ledWalls declaration), collision/navmesh (null), capabilities, evidence[].

Capability flags (evidence-only):

| Flag | Bound value | Evidence |
|---|---|---|
| HAS_REAL_GEOMETRY | false | productionVenueGlbCount = 0 |
| HAS_SEATING | false | seatAnchors empty; no seating mesh |
| HAS_FREE_ROAM | false | no navmesh |
| HAS_COLLISION | false | no collision GLB |
| HAS_JUMBOTRON | true iff `geometry.ledWalls.length > 0` | registry-declared virtual LED only |
| HAS_STAGE_ANCHOR | false | no measured Vec3; logical media surface only |
| VR_READY | false | no walkable world |
| MOBILE_SAFE | true when ambient verified / no heavy GLB | MP4 + CSS path |

---

## 4. Geometry availability matrix

| VenueType (Regular Go Live set) | Render mode | Ambient verified | Real GLB |
|---|---|---|---|
| concert, battle, cypher, challenge, world-dance-party, lounge, monday-night-stage, deal-or-feud, fan-lobby, world-concert, mini-concert, release-party, world-release, mini-release, listening-party | DEGRADED_VIDEO | YES (shared verified MP4s per registry entry) | NO |
| slow-jams | DEGRADED_VIDEO | NO (`lounge-variant.mp4` missing) | NO |
| unknown id | UNAVAILABLE | — | — |

Never silent-substitutes another venueId.

---

## 5. Seating data availability

**Audit only — not implemented.**

- `seatingLayoutId`: null on all packages  
- `VenueAssetContract.seatAnchors`: empty  
- Seat systems remain the known Rule 21 multiplicity (out of scope)  
- `displayCapacity` / `seatTiers` = display metadata only — **not** live presence  

Next slice dependency: presence → seat assignment → bobblehead_v0 transforms inside bound venues.

---

## 6. Jumbotron mount availability

- Preserved: `VenueAutomatedJumbotronMount`  
- Now gated in `ArenaEventShell` by `certifiedPackage.capabilities.HAS_JUMBOTRON` + `jumbotronMount`  
- Mount id form: `jt-{venueType}-led` declared from `VenueAssetRegistry.geometry.ledWalls`  
- No fabricated floating screen when ledWalls empty  

---

## 7. Free-roam / collision availability

| Capability | Status |
|---|---|
| Walkable navmesh | MISSING |
| Collision mesh | MISSING |
| FREE_ROAM (real) | **not claimed** (UVR may still use framing viewMode labels; package flag stays false) |
| Spawn zones (measured) | MISSING — semantic anchors position=null |

---

## 8. Mobile / LOD findings

- Venue visuals today: ambient MP4 (~3 MB) + CSS/Framer layers + AudienceScene canvas — **MOBILE_SAFE** relative to a full GLB venue  
- No venue LOD chain exists (nothing to downscale)  
- Avatar GLB ~2 MB is separate from venue package  
- Do not globally strip quality for one phone — capability flag only  

---

## 9. Legacy / placeholder findings

- `VenueRuntimeShell` → `/models/venue-stage.glb` missing — LEGACY / RED  
- `SpatialVenueRuntime` PlaneGeometry — LEGACY_UNVERIFIED units  
- Herser/zip JPG packs — PLACEHOLDER concept art  
- `GoLiveStudio` remains LEGACY unmounted (Slice 1)  
- `lib/assets/venueAssetRegistry.ts` — ticket/marketing tiles; not Go Live bind authority  

---

## 10. Exact files changed

1. `apps/web/src/lib/venues/CertifiedVenuePackage.ts` *(new)*  
2. `apps/web/src/components/live/RoomEnvironmentLayer.tsx`  
3. `apps/web/src/components/live/UniversalVenueRenderer.tsx`  
4. `apps/web/src/components/live/GoLiveRuntime.tsx`  
5. `apps/web/src/components/live/ArenaEventShell.tsx`  
6. `apps/web/src/components/live/InstantGoLiveStage.tsx`  
7. `apps/web/src/tests/runVenueAssetBinding.test.ts` *(new)*  
8. `.cursor/artifacts/step4-3d-authority/STEP4_VENUE_ASSET_BINDING.md` *(this file)*  

Slice 1 already committed at `c25564a9` (HUD fake-800ms fix preserved).

---

## 11. Tests / results

| Gate | Result |
|---|---|
| A deterministic resolve | PASS |
| B no false PRODUCTION geometry | PASS |
| C no silent wrong venue | PASS |
| D no fake presence as live | PASS |
| E logical stage mount | PASS |
| F jumbotron only when declared | PASS |
| G flags match evidence | PASS |
| H renderer receives package | PASS |
| I bind layer no session/camera/webrtc side effects | PASS |
| J git diff --check (touched) | PASS |
| K package API + Slice1 no 800ms | PASS |
| herser_ref_dirs_no_runtime_glb | PASS |
| `runGoLiveCanonicalEntry` (Slice 1) | PASS |
| Touched-file tsc | PASS after null-asset guard |

Physical visual A/B venue switch: **not exercised in browser this pass** (agent environment). Code-path bind is certified; do **not** mark VENUE VISUAL CERTIFIED without device observation.

---

## 12. Remaining blockers

1. **LIVE PHYSICAL CONTINUITY STILL BLOCKED** — real camera + authenticated performer session (Slice 1 ledger)  
2. **No production venue GLB** — Herser packs are concept art; Phase 5B mesh / walkable remains IDLE  
3. **Seating implementation** deferred (next dependency after this bind)  
4. **HUD auto-hide / Keep On** = Step 5C only  
5. Curtain / chroma / overlays / WebXR / Avatar Creation Center / hub-immersive — explicitly out of scope  

### UniversalVenueRenderer audit (summary)

Renders: AudienceScene (canvas crowd), WebRTC performer path (existing), curtains/HUD children, optional Jumbotron child — **not** venue GLB/R3F world geometry. Ambient video + CSS live in `RoomEnvironmentLayer` parent. One renderer authority preserved; Jumbotron remains a child mount.

### Stage-mount result

Logical `LOGICAL_MEDIA_SURFACE` id on package → UVR `data-stage-surface-id`. No second camera/WebRTC from bind layer. No chroma.

### STOP

Do not begin seating population, Avatar Creation Center, HUD wiring/auto-hide, curtain convergence, chroma, overlay packs, or WebXR.
