# YoPho Free Layer Creation — Certification Note

**Branch:** `eos/vocal-improv-clean`  
**Date:** 2026-08-31  
**Scope:** Free-tier layered YoPho UX — background-first, instructional messaging, FX, share/QR, 500 XP learning track.

## Status

| Gate | Result |
|------|--------|
| Background-first hard gate | PASS (code) |
| Instructional / first-run guide | PASS (code) |
| Free limits 1 bg + 2 images | PASS (existing capacity + copy) |
| FX / filters (system layers) | PASS (existing FX tab + learning claim) |
| Share / QR path | PASS (wired save + share strip + branding footer QR) |
| Learning track 500 XP | PASS (XpActionRegistry + `/api/yopho/learn-xp`) |
| Rule 20 honest empty/auth | PASS (unauthenticated → granted 0) |
| Browser physical cert | PENDING (run when `/fan/canvas` server available) |

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

## Files touched

- `apps/web/src/lib/yopho/YoPhoImageCapacity.ts` — background-first helpers + gate
- `apps/web/src/lib/yopho/YoPhoLearningTrack.ts` — track progress + claim helper
- `apps/web/src/lib/xp/XpActionRegistry.ts` — YoPho learning actions
- `apps/web/src/app/api/yopho/learn-xp/route.ts` — durable grant
- `apps/web/src/components/yopho/YoPhoFreeOnboardingGuide.tsx` — public how-to
- `apps/web/src/components/yopho/YoPhoTripleStageStudio.tsx` — enforce + wire UX

## Open blockers

- Browser screenshots under `.cursor/artifacts/yopho-free/` require a running web server + session.
- Durable XP requires signed-in cookies (`tmi_session_id` / `tmi_user_email`); local progress still records for UI honesty.
