# Avatar Preview Parity — Ownership Collision Report

**Date:** 2026-09-03  
**Branch:** `eos/vocal-improv-clean`  
**Trigger:** Avatar Preview Parity Runtime Phase 1  
**Prior commits:** `f4054d3a` (Preview Parity Law + shared draft) · `97876e19` (SAVE path Studio↔Quick↔Fan World)

---

## Verdict

| Question | Answer |
|----------|--------|
| Is ownership clear? | **YES** |
| Canonical owner | `apps/web/src/lib/avatars/` (**plural**) |
| Create a second runtime? | **NO** |
| Phase 1 proceed? | **YES** — deepen existing owner only |

---

## Canonical owners (DO NOT DUPLICATE)

| Concern | Canonical path | Notes |
|---------|----------------|-------|
| Preview orchestrator | `lib/avatars/AvatarPreviewRuntime.ts` | Bridge only — Foundry GLB + bobblehead rig |
| Shared draft | `lib/avatars/CanonicalAvatarDraft.ts` | ONE draft Full Studio ↔ Quick Avatar |
| Preview actions / fit enums | `lib/avatars/AvatarPreviewActions.ts` | Production-gated action set |
| Saved Look schema | `lib/avatars/AvatarLook.ts` | `schemaVersion` + migration |
| Fan world publish | `lib/avatars/FanEquippedLookBridge.ts` | Studio/Quick → Fan Lobby |
| Rig family | `lib/avatars/AvatarRigSpec.ts` + `BobbleheadRuntimeCharacter.ts` + `AvatarGlbRegistry` | `AvatarRig/1.0` |
| Unit proof | `lib/avatars/__tests__/avatarPreviewParity.test.ts` | Logic cert |

**Consumers already wired:** `AvatarCreationCenter.tsx`, `CanonicalQuickPanelContent.tsx`, `AvatarStudioExperience.tsx`.

---

## Collision candidates (DO NOT ADOPT AS OWNER)

| Path | Status | Decision |
|------|--------|----------|
| `lib/avatar/AvatarPreviewRuntime.ts` (singular) | **Untracked** class-based alternate runtime + fake fit/emotion/viseme loops | **REJECT** — second state owner. Leave unwired. Do not import from Studio/Quick. |
| `tests/runAvatarPreviewParityCertification.test.ts` | Untracked; imports singular `lib/avatar/AvatarPreviewRuntime` | **REJECT** as authoritative cert — points at collision candidate |
| `lib/avatar/AvatarPoseEngine.ts` | Learning/pose bias side-channel | **NOT** preview draft owner |
| `lib/avatar/AvatarEmoteEngine.ts` | Emote cooldown/learning | **NOT** preview draft owner |
| `lib/avatars/AvatarBehavioralDirector.ts` | Crowd vibe snapshot | **NOT** motion/preview owner |
| `lib/avatar/AvatarCameraDirector.ts` / `AvatarFaceIdentityDirector.ts` | Camera / face-identity contracts | Out of Phase 1 preview-draft scope |

No `AvatarMotionDirector` or `FacialPerformanceDirector` exists as a production preview owner. Phase 1 adds a **thin production motion adapter** inside the canonical `AvatarPreviewRuntime` (same module family) — not a second director/runtime.

---

## Laws applied

- Rule 8 — Registry / owner first; pages consume
- Rule 20 — no fake preview-only capability
- Rule 26 — Fan-only ownership UI
- Rule 28 — Foundry bind or fail visible
- Avatar Preview Parity Law — one draft, one runtime, production action subset

---

## Phase 1 delivery bound to this report

A–L deliver against **`lib/avatars/*` only**.  
Performer Lobbies / Lounges remain **NO-AVATAR** (lounge = lighting preview only).  
Frozen lanes untouched: Challenge, Battle, Universal Player, Jumbotron chassis, Sponsor Cabinet, Hardware Catalog, Live Fabric.
