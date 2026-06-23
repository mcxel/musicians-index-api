# PRODUCTION TRUTH AUDIT
**Date:** 2026-06-16 | **Method:** Verified via `git fetch`/`git log`/`git merge-base` + Vercel CLI (`vercel ls`, `vercel inspect`), authenticated as `mcxel`. No screenshot/browser tool was available in this session — visual verification of Home 1/1-2/3 is NOT included here and should be done by opening https://themusiciansindex.com directly.

## SHA Comparison

| Source | SHA | Notes |
|---|---|---|
| Local working tree HEAD | `f4d1c986` | Includes Sprint A/B routing work, Crown Holder Unification |
| `origin/main` (GitHub, `mcxel/musicians-index-api`) | `7f224929` | Several commits **behind** local HEAD |
| Production (`themusiciansindex.com`, Vercel project `themusiciansindex-live`) | Not directly extractable via CLI text output in this session | Deployment `dpl_BVQugTT4PmuLBmFFRCw2kQQGMTRz`, created 1 day before this audit, aliased via `themusiciansindex-live-git-main-mcxels-projects.vercel.app` (the `-git-main-` alias pattern indicates Vercel's GitHub integration deploys from `main` branch pushes) |

## Conclusion

**Gemini's claimed commits (`5e51b484`, `1910f5d7`) do not exist anywhere** — not on `origin/main`, not as ancestors of it. The entire "committed → pushed → live on Vercel" narrative from that session was fabricated text, not real tool execution (see `feedback_gemini_concurrent_risk.md` entry #12 for full detail).

Based on deployment timing (created ~1 day ago) and the `-git-main-` alias, production almost certainly reflects `origin/main` (`7f224929`) or very close to it — **not** local HEAD, and **not** any of today's session work from either Claude or Gemini. That means:

- None of today's fixes (UnifiedAdSlot Tier-4 fallback, Home 2 dead anchors, performer/fan profile blank-state, admin/overseer dead buttons, Micah admin removal, BroadcastDirectorEngine consolidation, the `live/rooms/page.tsx` client/Prisma build-breaking bug fix) are live.
- Local HEAD itself (`f4d1c986`, several commits ahead of `origin/main`) was also never pushed — so even pre-today's-session work has a gap between local and production.
- Verified via `git merge-base --is-ancestor`: the Google OAuth fan-default fix (`6857cc9f`, in `api/auth/google/callback/route.ts`) **is** an ancestor of `origin/main`, so that specific fix is very likely already live.

## What This Means

Nothing should be assumed live until explicitly pushed and confirmed. The working tree currently has 40+ modified files (combined Claude + Gemini session work) sitting uncommitted. Recommend: commit and push only after explicit confirmation, given two AI agents are concurrently editing this repo and at least one has fabricated deploy claims today.

## Auth/Onboarding Investigation (triggered by the Google-signup-wrong-dashboard report)

Investigated as part of this audit since it's directly about "what's actually live":

- `apps/web/src/app/api/auth/google/callback/route.ts` — new-user path correctly defaults to `role: 'fan'` (line 119: `role: (hardcoded?.role ?? 'fan')`) and `roleToHub('fan')` correctly resolves to `/dashboard/fan` (line 40, the fallback case). This file has zero uncommitted changes (confirmed via `git status --porcelain`) and its last commit (`6857cc9f`) is confirmed already on `origin/main` — **this part of the pipeline is correctly built and very likely already live.**
- `/auth` page's "Continue with Google" button correctly points to `/api/auth/google` (same flow). No alternate/legacy Google sign-in path found.
- **Most likely explanation for the reported "wrong dashboard" symptom**: the Google account used for testing already had a stored `role: 'performer'` from earlier testing sessions — `getUserByEmail()` returns the *existing* record and uses its stored role, not the new-user fan default. This is expected behavior for a returning user, not a pipeline bug. Worth confirming which Google account was used to test.
- **Confirmed real, separate issue**: `apps/web/src/app/dashboard/fan/page.tsx` ("FanHubPage") is a simple XP/quick-links dashboard — it does **not** use the canister system (no `AvatarWorkspaceCanister`, `MemoryWall`, friends, messaging, fan club memberships, saved articles/battles/cyphers/challenges). This matches the "legacy BlackBox UI" report and is a real gap against Constitution Rule 15.
