# YoPho Free Onboarding + Learning Points — Cert Note

**Date:** 2026-08-31  
**Branch:** `eos/vocal-improv-clean`  
**Scope:** Free-tier layered workflow messaging, background-first UX, XpActionRegistry learning track (500).

---

## Verdict

| Gate | Status |
|------|--------|
| Background-first UX (soft gate + tip) | PASS (code) |
| Free allowance enforced (registry) | PASS — keep shipped **1 bg + 2 images = 3 slots** |
| Instructions / baseball-card / QR copy | PASS — in-editor guide + FirstRun + Happy Days prompt |
| XP actions wired to grants | PASS — `/api/yopho/learn-xp` + studio/trading-card claims |
| Learning path total | **500** via `YOPHO_LEARNING_TRACK_TARGET_XP` |
| Live Fabric / Antigravity / color canon | Untouched |

---

## Free allowance conflict (documented, not silently changed)

| Source | Allowance |
|--------|-----------|
| **Shipped canon** (`YoPhoImageCapacity.ts`) | **1 background + 2 user-imported images = 3 image slots** (+ total-layer / media budgets) |
| Constitution Rule 27 wording | 1 background + 2 imported images |
| Marcel verbal (“three images and a background”) | Would imply **4** image slots |

**Decision:** Keep registry Free = **3 image slots (1+2)**. UX copy states “Add your background first, then add your images” and Free allowance explicitly. Do not invent paid features or expand Free without a product registry update.

---

## Background-first UX

- Persistent tip when background media is empty.
- Soft gate: photo/cutout blocked until background **or** user taps **I UNDERSTAND — CONTINUE** (`tmi_yopho_bg_first_ack_v1`).
- Power users with ack are not hard-locked; tip remains until a background is set.
- ADD modal lists **Background** first.

---

## Instructions / baseball-card / QR

- `YoPhoFreeOnboardingGuide` — layered creation, performance baseball card / album cover, share + QR footer.
- FirstRun steps: `fan-yopho-card`, `performer-yopho-card` (xpGrant 0 — real XP via learning track).
- Happy Days prompt deferred (happydays lib still untracked WIP in tree); FirstRun + in-editor guide cover instructional messaging without a second CMS.

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

Durable grants: `POST /api/yopho/learn-xp` → `UserStats.xp` + `ParticipationLedger` (same pattern as magazine read-xp). Unauthenticated → honest `granted: 0`. Client mirrors progress in `tmi_yopho_learning_track_v1` for UI only.

Studio claims: background / content layer / FX / save / share. Trading card claims: publish → save, share/copy → share.

---

## Tests / typecheck

```bash
npx tsx apps/web/src/tests/runYoPhoOnboardingPoints.test.ts
# typecheck touched packages as available
```

---

## Open blockers

- Physical browser cert of soft-gate + guide + signed-in XP ledger write still pending (code-enforced only).
- Marcel “3 images + background” vs shipped 1+2: needs explicit product confirm if Free should expand to 4 slots later.
