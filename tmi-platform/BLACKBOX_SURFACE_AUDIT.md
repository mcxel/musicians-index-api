# BLACKBOX SURFACE AUDIT
**Date:** 2026-06-16 | **Scope:** The 8 priority routes from today's discovery (Google signup → wrong dashboard). NOT a full-platform audit — the repo has 180+ admin pages and several duplicate fan/performer hub routes; a complete pass needs to be its own dedicated effort.

**Method note:** "Source: BlackBox vs Claude" is judged by whether the route uses the canonical registries/canisters this session has been building on (PerformerRegistry, AvatarWorkspaceCanister, MemoryWall, etc.) vs hardcoded arrays/fake metrics — not by literal authorship, which isn't always knowable.

## Duplicate-route warning (found during this audit, not yet resolved)

There are **multiple pages competing for the same role**, which is itself a source of the "wrong dashboard" confusion:
- Fan hub: `/dashboard/fan` (canonical — this is what Google OAuth redirects new fans to) **vs** `/fan/dashboard`, `/fan/page.tsx` (unclear if reachable/linked)
- Performer hub: `/dashboard/performer` (canonical — OAuth redirect target) **vs** `/performer/dashboard`, `/performer/page.tsx`
- Fan profile: `/fan/profile` (self-edit) **vs** `/fan/[slug]` (public, already P1-certified via `ProfileLobbyRuntime`)
- Performer profile: `/performer/profile` (self-edit) **vs** `/performers/[slug]` (public, already P1-certified via `ProfileLobbyRuntime`)

This audit only covers the routes actually reachable from real navigation (OAuth redirect targets and the self-edit profile pages linked from them).

## Priority Audit Table

| # | Route | Current Surface | Source | Replace? | Claude Equivalent / Action |
|---|---|---|---|---|---|
| 1 | Google Signup Flow (`api/auth/google/callback`) | Correct — defaults new users to `role: 'fan'`, routes to `/dashboard/fan` | Claude | NO | Already correct, already live (commit ancestor of `origin/main`) |
| 2 | Role Assignment (`UserStore.resolveHardcodedTierRole`/`registerUser`) | Correct — role/tier separated from each other, hardcoded admin/diamond lists work as intended | Claude | NO | Already correct |
| 3 | Fan Dashboard Route (`/dashboard/fan`) | Simple XP list + quick links, **zero** canister integration | BlackBox | **YES** | Wire `AvatarMiniDisplay`, `MemoryWall`, `FriendsList`, messaging/inventory links into the existing page (executing now — see below) |
| 4 | Performer Dashboard Route (`/dashboard/performer`) | Simple stats card + quick actions, **hardcoded fake metrics** ("XP Total: 12,450", "Earnings: $320" — violates Platform Law #7, no real data) | BlackBox | **YES** | Needs same canister wiring pass as Fan Dashboard — not done this turn, flagged as next |
| 5 | Fan Profile (`/fan/profile`) | Partial — already imports `MemoryWall` and `OmniPresenceEngine`, but no Avatar/Friends/Inventory | Mixed | PARTIAL | Extend, don't rebuild — closer to done than #3/#4 |
| 6 | Performer Profile (`/performer/profile`) | Already has `AvatarWorkspaceCanister` + `AvatarMiniDisplay` wired (confirmed via memory from earlier session work), plus `MemoryWall`, `MyContentManager` | Claude | PARTIAL | Most complete of the 8 — verify Friends/Inventory/Messaging are also present in a future pass |
| 7 | Overseer Deck (`/admin/overseer`) | Functional custom admin tool (Chain of Command, Money & Billing, Bot Roster, TV monitors) — fixed 3 dead buttons earlier today. Canister system doesn't apply here (it's ops tooling, not a fan/performer-facing profile) | Mixed | NO (Category B — keep engine, this isn't a "legacy vs canon" question) | No further action needed beyond today's dead-button fixes |
| 8 | Admin Deck (`/admin`) | Functional — real engines wired (`DashboardStatsEngine`, `BotActivationEngine`, `GhostArchetypeEngine`, `UserManagement`, `AgentCommandCenter`) | Claude/Mixed | NO | Same as #7 — ops tooling, not a canister-applicable surface |

## What this means

Items 1, 2, 7, 8 are fine as-is. Items 3 and 4 are the real "legacy dashboard" problem — and they're the ones a brand-new user actually lands on first. Items 5 and 6 are partially done and should be extended, not rebuilt.

## Executed this session
Wiring `/dashboard/fan` now (item 3) — see commit/file changes following this report.

## Not yet done
- `/dashboard/performer` canister wiring (item 4)
- Resolving the duplicate-route situation (4 fan-hub-shaped routes, 3 performer-hub-shaped routes) — needs a decision on which to keep/redirect/delete, not just which to improve
- Full-platform BLACKBOX_SURFACE_AUDIT beyond these 8 routes
