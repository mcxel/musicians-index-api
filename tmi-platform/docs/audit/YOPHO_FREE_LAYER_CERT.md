# YoPho Free Layer Creation — Certification Note

**Branch:** `eos/vocal-improv-clean`  
**Date:** 2026-08-31  
**Scope:** Free-tier layered YoPho UX — background-first, instructional messaging, FX, share/QR, 500 XP learning track.

## Status

| Gate | Result |
|------|--------|
| Background-first hard gate | **PASS** (code + `runYoPhoFreeLayerGate.test.ts` + browser ADD modal: Photo/Cutout disabled) |
| Soft gate + tip | **PASS** (browser: banner + **I UNDERSTAND — CONTINUE**) |
| Instructional / first-run guide | **PASS** (browser: `FREE YOPHO · LAYERED CREATION` / baseball-card + QR copy) |
| Free limits 1 bg + 2 images | **PASS** (registry + on-screen Free = 1+2 / 3 slots — not expanded to 4) |
| FX / filters (system layers) | **PASS** (Effect available in ADD modal without burning image slots) |
| Share / QR path | **PASS** (SAVE / SHARE strip + branding QR visible) |
| Learning track 500 XP | **PASS** (XpActionRegistry + signed-in `/api/yopho/learn-xp`) |
| Rule 20 honest empty/auth | **PASS** (unauthenticated → `granted: 0`) |
| HTTP `/fan/canvas` | **PASS** (200) |
| Browser screenshots | **PASS** → `.cursor/artifacts/yopho-free/` (system Chrome Playwright; bundled Chromium missing; MCP tabs flaky) |

## Commits

- `035c4ab2` — Free onboarding, background-first gate, 500 XP learning track
- `81b12ccf` — Free layer cert note + gate smoke test
- `fea5563f` — docs update (prior browser-blocked note)

No product code change this cert pass (gate/XP already shipped).

## Routes / surfaces

- `/fan/canvas` · `/performer/canvas` → `YoPhoCanvasMount` → `YoPhoStudio` → `YoPhoTripleStageStudio`
- API: `POST /api/yopho/learn-xp` (once-per-action ParticipationLedger)
- Share: `shareYoPhoCard` + `YoPhoBrandingFooter` QR → `/yopho/card/[cardId]`

## Learning track (sum = 500)

| Action | XP |
|--------|----|
| `yopho_set_background` | 100 |
| `yopho_add_image_layer` | 100 |
| `yopho_add_effect` | 75 |
| `yopho_save_composition` | 100 |
| `yopho_share_card` | 100 |
| `yopho_complete_onboarding` | 25 |

### Signed-in ledger proof (browser cookies / register session)

| Action | 1st POST | 2nd POST |
|--------|----------|----------|
| `yopho_set_background` | `granted: 100` | `granted: 0` `already_earned` |
| `yopho_complete_onboarding` | `granted: 25` | `granted: 0` `already_earned` |
| `yopho_add_effect` | `granted: 75` | `granted: 0` `already_earned` |

## Screenshots

`.cursor/artifacts/yopho-free/`

- `01-fan-canvas-initial.png` / `02-howto-guide.png` / `03-after-ack.png` — guide + soft-gate
- `04-add-path.png` — ADD modal hard-gates Photo/Cutout
- `05-fx-tab.png` — system Effect path + Free slot copy
- `browser-probe.json` — machine-readable summary

## Open blockers

- Marcel “3 images + background” vs shipped **1+2**: still needs explicit product confirm if Free should expand to 4 slots later (not changed).
- Workspace Switcher / First Steps / Ads consent overlays can intercept clicks during automation — not a YoPho gate defect.
- Bundled Playwright Chromium still missing; cert used system Chrome `channel: "chrome"`. MCP `cursor-ide-browser` tabs did not stay attached.
