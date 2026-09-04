# Avatar Preview Parity Law

**Locked:** 2026-09-02 — Marcel Dickens  
**Branch:** `eos/vocal-improv-clean`  
**Sits with:** Universal Player Freedom · Single PROGRAM Audio · Presence Separation · Anti-Fake / Reality · ACGBR Authoritative-Truth Boundary  
**Code:** `apps/web/src/lib/avatars/AvatarPreviewRuntime.ts` · `CanonicalAvatarDraft.ts` · `AvatarLook.ts`  
**Slice:** [`AVATAR_STUDIO_WORLD_PHASE1_SLICE.md`](./AVATAR_STUDIO_WORLD_PHASE1_SLICE.md)

---

## Law

> Every avatar motion, expression, wearable, prop, pose, and saved look shown in Avatar Creation Center or Quick Avatar panel executes through the **same canonical rig and certified motion systems** used in production Fan environments. Preview may reduce fidelity for device performance, but may **NEVER** present a capability the production avatar cannot perform.

```
FULL STUDIO ──┐
              ├──► Canonical Avatar Draft ──► AvatarPreviewRuntime ──► Canonical Rig
QUICK AVATAR ─┘         (ONE draft state)              ├── MotionDirector
                                                       ├── FacialPerformanceDirector
                                                       └── Wardrobe/Props
```

---

## Non-negotiables

| Rule | Meaning |
|------|---------|
| One draft | Studio and Quick Panel share `CanonicalAvatarDraft` — no second wardrobe/emote state |
| Same rig | `AvatarRig/1.0` + `AvatarGlbRegistry` / bobblehead runtime — no substitute skeleton |
| Fail visible | Uncertified smile / dance / prop grip → blocked with diagnostic, not a fake clip |
| LOD ok | Smaller viewport / fewer lights allowed; **action set must stay a subset of production** |
| FAN-only | Ownership UI is Rule 26 FAN (ADMIN/STAFF QA). Performers: real camera identity |
| Lounge | Environment preview may use **lighting only**. Must not enable lounge avatar occupancy |
| Commerce | Locked SKUs are previewable. Equip-to-world / save requires real ownership or free starter |
| ACGBR | Authoritative-truth boundary: Foundry cert is PASS / REGENERATE from manufacturing state — **not** a fake neural verdict. Do not touch Challenge ACGBR lane files |
| Face-scan | Lip-sync / neural Foundry remain OPEN — do not stub as done |
| experienceCert | Never PASS from editor/green/debug |

---

## Studio and quick-panel parity requirements

The full Avatar Creation Center and Quick Avatar panel are two control surfaces over one runtime.

Required behavior:

- Quick panel edits update `CanonicalAvatarDraft` immediately.
- Full studio reflects quick-panel edits with no secondary state reconciliation flow.
- Both surfaces execute motions through the same `AvatarMotionDirector` and facial stack.
- Quick panel is allowed to be visually compact, but cannot expose actions unavailable in production.

---

## Required motion and fitting preview suite

Manual preview actions required for certification:

`IDLE, TURN_LEFT, TURN_RIGHT, WALK, RUN, SIT, STAND, DANCE, WAVE, CLAP, POSE, EMOTE, USE_PROP, GROUP_ACTION, MIC_PERFORMANCE, STAGE_PERFORMANCE`

Stress/fault actions required for clipping detection:

`ARMS_UP, ARMS_CROSSED, DEEP_SIT, STEP_FORWARD, TURN_360, CROUCH, DANCE_RANGE_TEST, PROP_GRIP_TEST`

Save is rejected when any equipped item fails production compatibility for required motions.

---

## Facial, dialogue, and lip-sync preview rules

Avatar preview runtime must support expression and speech previews using canonical envelopes:

`primaryEmotion, intensity, valence, arousal, gestureBias`

Two preview inputs are allowed:

- Sample/system line (fact-safe generated timing)
- User microphone preview (local viseme estimation)

Neither path is allowed to claim production neural quality beyond implemented capability.

---

## Environment and surface preview matrix

Preview targets must include both world and panel compositions:

- World lighting profiles: `STUDIO, FAN_LOBBY, BATTLE_AUDIENCE, MONDAY_NIGHT_STAGE_AUDIENCE, WORLD_CONCERT, WORLD_DANCE_PARTY, OUTDOOR_DAY, OUTDOOR_NIGHT`
- Presentation surfaces: `FULL_BODY, PROFILE_CARD, FAN_CAM, PROGRAM_ISO, JUMBOTRON, QUICK_PANEL`

Lounge rule remains locked: preview may emulate lounge lighting only;
it must not imply lounge avatar occupancy where lounge policy is video-panel presence.

---

## Autonomous generation certification loop (avatar assets)

All AI-generated wearables/props/animations must pass bounded autonomous certification before publish:

`GENERATE -> RIG_BIND -> BODY_ARCHETYPE_TEST -> MOTION_TEST -> SEAT_TEST -> PROP_SOCKET_TEST -> LOD_TEST -> DEVICE_TEST -> PASS | REGENERATE`

Required metadata per generated asset:

`supportedSockets, compatibleMotions, requiredHands, seatCompatible, danceCompatible, groupActionCompatible, performanceCompatible`

Store publication is forbidden without a passing certification snapshot.

---

## Saved look contract

`AvatarLook` carries `schemaVersion`, `rigVersion`, motion personality, and `certificationSnapshot`. Save is rejected when any equipped wearable is not `productionCompatible`.

---

## Presentation panel targets

`FAN_CAM` · `JUMBOTRON` · `SPOTLIGHT` · `PROGRAM_ISO` are **certified template IDs**. They resolve to real Jumbotron / spotlight directors when those directors publish a bind. Until then they are labeled TEMPLATE — not fake friends, not fake occupancy. Editor mannequin is allowed only as labeled `EDITOR` preview.

---

## Relation to ACGBR

Avatar Studio uses the **Authoritative-Truth Boundary** the same way Challenge ACGBR does: preview cannot invent a capability the production engine cannot execute. This slice does **not** modify Challenge ACGBR agents or `acgbr/challenge` paths.

## Certification honesty

| Lane | Status |
|------|--------|
| logicCert | **STRONG** — one draftId, FAN-only, Lounge occupancy, productionCompatible save, PREVIEW→SAVE→FAN WORLD fingerprint, Phase 1 motion suite, ARMS_UP, FAN_LOBBY env, JUMBOTRON-from-draft, reduced-motion fidelity |
| architectureCert | **PARTIAL** — Studio + Quick + Creation Center share `commitCanonicalDraftToFanWorld`; Herser motion/facial/wardrobe still fail-visible when unbound |
| experienceCert | **OPEN** — no physical evidence; do not claim PASS |

### Ownership (2026-09-03)

Canonical owner locked in [`AVATAR_PREVIEW_PARITY_COLLISION_REPORT.md`](./AVATAR_PREVIEW_PARITY_COLLISION_REPORT.md): `lib/avatars/*` only. Reject untracked `lib/avatar/AvatarPreviewRuntime.ts` (singular) as a second state owner.

### Deepen slice (2026-09-03)

- `commitCanonicalDraftToFanWorld()` — single SAVE path from Canonical Draft → `publishFanEquippedLook`
- Full Studio syncs draft on equip; Quick Avatar **Save → Fan World**; Creation Center equip uses same commit
- No fake Herser: invented SKUs / locked-without-ownership refuse save; unbound GLB stays diagnostic
- Phase 1: stable `draftId`, production motion adapter (IDLE/WALK/DANCE/EMOTE), ARMS_UP fit, FAN_LOBBY env, JUMBOTRON uses draft, reduced-motion fidelity path
