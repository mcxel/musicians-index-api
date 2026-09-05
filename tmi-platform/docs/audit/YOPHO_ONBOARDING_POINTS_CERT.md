# YoPho Free Onboarding + Learning Points — Cert Note

**Date:** 2026-08-31  
**Branch:** `eos/vocal-improv-clean`  
**Scope:** Free-tier layered workflow messaging, background-first UX, XpActionRegistry learning track (500).

---

## Verdict

| Gate | Status |
|------|--------|
| Background-first UX (soft gate + tip) | **PASS** (browser on `/fan/canvas`) |
| Hard gate Photo/Cutout until bg/ack | **PASS** (browser ADD modal) |
| Free allowance enforced (registry) | **PASS** — keep shipped **1 bg + 2 images = 3 slots** |
| Instructions / baseball-card / QR copy | **PASS** — in-editor `YoPhoFreeOnboardingGuide` visible |
| XP actions wired to grants | **PASS** — signed-in `/api/yopho/learn-xp` once-only |
| Learning path total | **500** via `YOPHO_LEARNING_TRACK_TARGET_XP` |
| Live Fabric / Antigravity / color canon | Untouched |
| Browser screenshots | **PASS** → `.cursor/artifacts/yopho-free/` |

---

## Free allowance conflict (documented, not silently changed)

| Source | Allowance |
|--------|-----------|
| **Shipped canon** (`YoPhoImageCapacity.ts`) | **1 background + 2 user-imported images = 3 image slots** (+ total-layer / media budgets) |
| Constitution Rule 27 wording | 1 background + 2 imported images |
| Marcel verbal (“three images and a background”) | Would imply **4** image slots |

**Decision:** Keep registry Free = **3 image slots (1+2)**. Do not expand Free without product confirm.

---

## Background-first UX

- Persistent tip when background media is empty.
- Soft gate: photo/cutout blocked until background **or** user taps **I UNDERSTAND — CONTINUE** (`tmi_yopho_bg_first_ack_v1`).
- Browser observed soft-gate banner + CONTINUE CTA; ADD modal disables Photo/Cutout until bg/ack.
- ADD modal lists **Background** first; Effect/Frame/etc. remain available (system layers).

---

## Instructions / baseball-card / QR

- `YoPhoFreeOnboardingGuide` — layered creation, performance baseball card / album cover, share + QR footer (browser: **FREE YOPHO · LAYERED CREATION**).
- Learning strip **0/500 XP** + **HOW-TO** button visible when signed in.

---

## Points / XP actions (once each)

| Action key | XP |
|------------|-----|
| `yopho_set_background` | 100 |
| `yopho_add_image_layer` | 100 |
| `yopho_add_effect` | 75 |
| `yopho_save_composition` | 100 |
| `yopho_share_card` | 100 |
| `yopho_complete_onboarding` | 25 |
| **Total** | **500** |

Durable grants: `POST /api/yopho/learn-xp` → `UserStats.xp` + `ParticipationLedger`. Unauthenticated → honest `granted: 0`.

### Signed-in once-only proof

| Action | 1st | 2nd |
|--------|-----|-----|
| `yopho_set_background` | granted 100 | granted 0 `already_earned` |
| `yopho_complete_onboarding` | granted 25 | granted 0 `already_earned` |
| `yopho_add_effect` | granted 75 | granted 0 `already_earned` |

---

## Tests / typecheck

```bash
npx tsx apps/web/src/tests/runYoPhoOnboardingPoints.test.ts
npx tsx apps/web/src/tests/runYoPhoFreeLayerGate.test.ts
```

No product code change this browser-cert close (no typecheck delta).

---

## Open blockers

- Marcel “3 images + background” vs shipped 1+2: needs explicit product confirm if Free should expand to 4 slots later.
- Automation friction only: Workspace Switcher / First Steps / Ads overlays intercept clicks; Playwright bundled Chromium missing (used system Chrome).
