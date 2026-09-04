# AVATAR STUDIO → WORLD — Phase 1 slice

**Date:** 2026-09-02  
**Branch:** `eos/vocal-improv-clean`  
**Scope:** Honest wiring only — Studio equip/save → existing Fan Lobby / local seat consumers. **Not** a second avatar system. **Not** face-scan → lip-sync. **Not** Experience #2 fabric canary.  
**Laws:** Rule 26 (FAN-only ownership) · Rule 28 (Foundry bind or fail visible) · Rule 20 (no fake occupancy) · **Avatar Preview Parity Law**  
**Companions:** [`AVATAR_PREVIEW_PARITY_LAW.md`](./AVATAR_PREVIEW_PARITY_LAW.md) · [`AVATAR_STUDIO_TO_WORLD_PIPELINE.md`](./AVATAR_STUDIO_TO_WORLD_PIPELINE.md) · [`TMI_EXPERIENCE_COMPLETION_MATRIX.md`](./TMI_EXPERIENCE_COMPLETION_MATRIX.md)

---

## Preconditions (do not rebuild)

| Gate | Evidence |
|------|----------|
| Studio | `/avatar/studio` → `AvatarStudioExperience` + `RoleGate allow={['FAN']}` |
| Section gate | `/avatar/*` layout `RoleGate allow={['FAN','ADMIN','STAFF']}` |
| Save path | `POST /api/avatar/save` + `POST /api/avatar/inventory` |
| Foundry slot | `AvatarGlbRegistry` `bobblehead_v0` (`certified: true` in registry; file must exist at `/models/avatars/bobblehead_v0.glb` to mount) |
| Fan Lobby world | `FanLobbyVenue` → `LobbyFreeRoamAvatars` + `useLobbyPresenceSync` |
| Local venue seat | `AudienceScene` local Fan AvatarRig (never performer ownership) |
| Canister | `FanAvatarCanister` already binds `resolveAvatarViewportBinding` |

**Do not invent:** occupancy, peer avatars, face-scan mesh, substitute rigs, LiveAvatarSync to all rooms.  
**Lounges** stay panel DNA (`composeLoungeProgram` rejects avatars). **Performer Lobby** untouched.

---

## Inventory (canonical sources)

| Layer | Path | Role |
|-------|------|------|
| Studio | `AvatarStudioExperience.tsx` | Equip + save |
| Persistence | `avatarPersistence.ts` + `/api/avatar/{save,inventory,equip,load}` | Fan inventory / slots |
| Ownership gate | `requireFanAvatarSession.ts` + `fanAvatarOwnership.ts` | FAN / USER / ADMIN / STAFF only |
| Foundry | `AvatarGlbRegistry.ts` · `CanonicalBobbleheadRecipe` | `bobblehead_v0` |
| Look bridge | `FanEquippedLookBridge.ts` | Studio → world fingerprint |
| Fan Lobby | `useLobbyPresenceSync` `loadoutId` · `LobbyFreeRoamAvatars` | Consume equipped SKUs |
| Venue seat | `AudienceScene` local overlay `extraAccessoryIds` | Local fan only |
| Closet / looks / test | redirect → `/avatar/studio` | Bookmark-safe; QA Lab not faked |

**OPEN gaps (honest):** LiveAvatarSync into remote rooms; full wardrobe/collision Herser bind; face-scan mesh (`certified: false`); QA Lab matrix; physical experienceCert. Preview Parity contracts are wired; Herser motion/facial packages still fail-visible when unbound.

---

## What changed

| Piece | Path | Role |
|-------|------|------|
| Ownership allow/deny | `lib/avatars/fanAvatarOwnership.ts` | Rule 26 allowlist |
| API gate | `requireFanAvatarSession.ts` | PERFORMER/BAND/… → 403 |
| Look bridge | `lib/avatars/FanEquippedLookBridge.ts` | Catalog SKUs + certified GLB URL only |
| Studio publish | `AvatarStudioExperience.tsx` | Save → `publishFanEquippedLook` |
| Studio viewport | `AvatarForgePreview3D.tsx` | Same Foundry slot as Canister when bound |
| Lobby presence | `useLobbyPresenceSync.ts` | Real `loadoutId` (not hardcoded null) |
| Lobby mesh | `LobbyFreeRoamAvatars.tsx` | Listen `tmi:avatar-changed` + inventory |
| Local seat | `AudienceScene.tsx` | Local fan extras from look; no invented crowd |
| Routes | `/avatar/closet` `/looks` `/test` | Redirect to studio |
| Guards | `semanticGuards.test.ts` + hydration + `avatarPreviewParity.test.ts` | FAN-only; one draft; Lounge lighting occupancy false |
| Preview Parity | `AvatarPreviewRuntime` · `CanonicalAvatarDraft` · `AvatarLook` · `commitCanonicalDraftToFanWorld` | Studio + Quick share one draft → same Foundry rig → Fan World publish |

**Hard laws:** no second LiveSession / player / fabric canary; Lounge still rejects avatars; no performer ownership UI; green/debug ≠ experienceCert; Herser unbound slots stay `certified: false`; preview never presents a capability production cannot perform.

---

## Trace

```
FULL STUDIO ──┐
              ├──► Canonical Avatar Draft ──► AvatarPreviewRuntime ──► Canonical Rig
QUICK AVATAR ─┘         (ONE draft state)

FAN /avatar/studio  (RoleGate FAN)
  → save inventory + loadout SKUs
  → publishFanEquippedLook (tmi:avatar-changed + snapshot)
       → Fan Lobby useLobbyPresenceSync.loadoutId
       → LobbyFreeRoamAvatars equipped SKUs → AvatarRig (bobblehead_v0 if certified)
       → AudienceScene local seat extraAccessoryIds

PERFORMER /avatar/* or /api/avatar/*
  → RoleGate fallback or 403 fan_avatar_ownership_required
```

---

## Certification lanes (honesty)

| Lane | Status | Notes |
|------|--------|-------|
| logicCert | PARTIAL | Unit guards for FAN-only + catalog SKUs + Preview Parity; live multiplayer look sync OPEN |
| architectureCert | **PARTIAL** | Studio→Lobby/seat glue + Preview Parity Phase 1 contracts are real (`draftId`, motion adapter, FAN_LOBBY, JUMBOTRON-from-draft, reduced-motion). Full Herser wardrobe / LiveAvatarSync / QA Lab / facial+motion packages not bound. **Do not claim DONE.** |
| experienceCert | **OPEN** | Physical production cert not claimed. Face-scan / lip-sync not stubbed. |

**Board (2026-09-03):** Challenge Lane C = **CLOSED / PHYSICALLY CERTIFIED / FROZEN** (`1087ba88`). Avatar Preview Parity Runtime Phase 1 = **DONE (logicCert)** — see collision report; experienceCert remains OPEN.

---

## Automated proof

```text
npx jest --config jest.config.ts src/lib/avatars/__tests__/avatarPreviewParity.test.ts
```

Asserts: FAN ownership allow; invented SKUs stripped; Lounge lighting occupancy false; **same draftId Full↔Quick**; mutation both ways; production motion adapter; ARMS_UP; FAN_LOBBY env; JUMBOTRON uses draft; reduced-motion fidelity; Saved Look schemaVersion continuity; `productionCompatible` save gate.

---

## Explicitly OPEN / next

| Item | Status |
|------|--------|
| Confirm `public/models/avatars/bobblehead_v0.glb` on the serving host | OPEN if missing on disk — registry says certified; fail-visible if 404 |
| LiveAvatarSync into peer rooms / WDP / concert audience besides local fan | OPEN |
| Full Herser wardrobe / props / collision / certified motion+facial packages | OPEN — Preview Parity **gates** uncertified actions; does not fake them |
| Face-scan → UV mesh / lip-sync neural | OPEN — do not stub |
| QA Lab `/avatar/test` as real cert lab (currently redirects to studio) | OPEN |
| Jumbotron / FAN_CAM presentation binds | OPEN — template IDs only (`TEMPLATE` status) |
| Performer Lobby presentation | OPEN (separate slice — never Fan avatar ownership) |
| experienceCert physical | OPEN |

**Recommended next:** physical experienceCert backlog on Fan Lobby (production, non-debug) **before** Performer Lobby. Stop for human cert if the Foundry GLB 404s in browser — do not substitute a capsule as finished.
