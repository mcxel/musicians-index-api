# GEMINI Profile/Route Defect Ledger (2026-08-16)

Scope: hub/profile/workspace-adjacent routes and auth behavior.

## Matrix

| Route | Expected | Actual | Fixed? | Evidence |
|---|---|---|---|---|
| `/hub/fan` | unauth users redirect to auth with `next` | 307 to `/auth?next=%2Fhub%2Ffan` | Yes | runtime probe + `src/app/hub/fan/page.tsx` auth session check |
| `/hub/performer` | unauth users redirect to auth with `next` | 307 to `/auth?next=%2Fhub%2Fperformer` | Yes | runtime probe + `src/app/hub/performer/page.tsx` gate |
| `/hub/performer?proof=1` | proof route loads for cert runs and supports workspace launch | previously verified WATCH->WORK + YoPho shell | Yes | prior cert evidence; proof branch in `src/app/hub/performer/page.tsx` |
| `/profile/performer` | unauth users should not remain on privileged profile shell | previously lacked explicit redirect; now redirects to `/auth?next=/profile/performer` | Yes (patched) | `src/app/profile/performer/page.tsx` |
| `/profile/artist` | unauth users should not remain on privileged profile shell | previously lacked explicit redirect; now redirects to `/auth?next=/profile/artist` | Yes (patched) | `src/app/profile/artist/page.tsx` |
| `/messages` | session-backed UX with predictable unauth handling | page loads `/api/messages` and `/api/auth/session`; runtime endpoint health unstable during timed probes | Partial | `src/app/messages/page.tsx` |
| `/playlist` | user state persists between sessions refresh | localStorage persistence exists; runtime endpoint health unstable during timed probes | Partial | `src/app/playlist/page.tsx` |
| `/home` | deterministic redirect/public entry behavior | probe timed out in current local runtime | No (runtime health pending) | middleware + `src/app/home/page.tsx` |

## Notes

- Local runtime produced multiple request timeouts outside hub routes during this pass.
- Defect-level code fix in this pass is limited to auth hard-gating for performer/artist profile shells.
