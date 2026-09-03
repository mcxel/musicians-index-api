# Avatar Preview Parity Phase 2 — Physical Certification

**STATUS:** 🟢 **PASS** — Phase 2 **CLOSED / PHYSICALLY CERTIFIED / FROZEN**  
**Branch:** `eos/vocal-improv-clean`  
**Phase 1 frozen:** `e6057909` (shared draft/runtime architecture not reopened)  
**Challenge frozen:** `1087ba88`  
**Date:** 2026-09-03 (PT)  
**Route:** `/avatar/studio` (Full Studio + embedded Quick Avatar parity strip)  
**Server:** `http://localhost:3003` · `TMI_BUILD_VERIFY_DISTDIR=.next-avatar-p2-cert`  
**Runner:** `scripts/cert-physical-avatar-preview-parity-phase2.mjs`  
**Artifacts:** `.cursor/artifacts/avatar-preview-parity-phase2/`  
**Report timestamp:** `2026-09-03T06:56:24.603Z`

---

## Scope (adapters only)

| Surface | Binding |
|---------|---------|
| Full Studio | `AvatarStudioExperience` → `CanonicalAvatarDraft` + `resolveAvatarPreview` (`lib/avatars/`) |
| Quick Avatar | `CanonicalQuickPanelContent` inventory workspace → same draft/runtime |
| Env selectors | `FAN_LOBBY` · `WORLD_CONCERT` · `LOW_LIGHT_LOUNGE_STYLE` |
| Presentation | `JUMBOTRON` · `FAN_CAM` · `GROUP_CAM` |

**Laws observed:** Lounge = lighting/material only (occupancy=false). GROUP_CAM = editor mannequins only. No second runtime/draft. Singular `lib/avatar/` untouched.

---

## Physical gates (this run)

| Gate | Result | Notes |
|------|--------|-------|
| G1 | 🟢 PASS | Full Studio mounts canonical runtime |
| G2 | 🟢 PASS | Quick mounts same runtime |
| G3 | 🟢 PASS | Shared draft ID equality |
| G4 | 🟢 PASS | Quick→Full WALK continuity |
| G5 | 🟢 PASS | Full→Quick DANCE continuity |
| G6 | 🟢 PASS | IDLE/WALK/DANCE/EMOTE all true |
| G7 | 🟢 PASS | ARMS_UP production-compatible |
| G8 | 🟢 PASS | FAN_LOBBY |
| G9 | 🟢 PASS | WORLD_CONCERT |
| G10 | 🟢 PASS | LOW_LIGHT_LOUNGE_STYLE lighting-only · occupancy=false |
| G11 | 🟢 PASS | JUMBOTRON |
| G12 | 🟢 PASS | FAN_CAM |
| G13 | 🟢 PASS | GROUP_CAM editor-only |
| G14 | 🟢 PASS | Locked gold_chain preview · save blocked |
| G15 | 🟢 PASS | Owned street_fit equip |
| G16 | 🟢 PASS | Saved Look continuity |
| G17 | 🟢 PASS | certificationSnapshot wearableCert=REGENERATE |
| G18 | 🟢 PASS | fidelity=reduced |
| G19 | 🟢 PASS | Reload retained Saved Look + snapshot |
| G20 | 🟢 PASS | Mobile 390×844 parity |

**FINAL PHYSICAL VERDICT:** 🟢 **PASS**  
**EXPERIENCE CERT:** **PASS** (Phase 2 G1–G20)  
**DUPLICATE RUNTIME CREATED:** NO  
**FROZEN SYSTEMS TOUCHED:** NO  

---

## How to re-run

```powershell
cd apps/web
$env:TMI_BUILD_VERIFY_DISTDIR=".next-avatar-p2-cert"
pnpm exec next dev -p 3003
```

```powershell
cd <repo-root>
$env:E2E_BASE_URL="http://localhost:3003"
node scripts/cert-physical-avatar-preview-parity-phase2.mjs
```
