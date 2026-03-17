# PLATFORM COMPLETENESS CHECKLIST
# TMI Platform — BerntoutGlobal XXL
# The master "are we done" document

---

## HOW TO USE

Check boxes as each milestone is confirmed.
A section is NOT done until every checkbox in it is checked.
This is the final gate before calling the platform production-ready.

---

## ✅ PHASE 1 — CORE PLATFORM (LOCKED Phase 17.5)

- [x] Auth / session / RBAC hardening
- [x] Onboarding loop fixed
- [x] CSRF forwarding
- [x] Dependency-aware readiness
- [x] Rollout gate logic
- [x] Alert dedupe
- [x] Contract versioning
- [x] Rollout metrics enforcement
- [x] Auth + CSRF timing fix
- [x] Structured rollout metrics contract
- [x] Env contract sweep
- [x] Deployment pipeline gate binding
- [x] Rollback trigger execution binding
- [x] Onboarding recovery / stale state hardening
- [x] CI proof coverage expansion
- [x] Build / release identity metadata

**Phase 1 status: LOCKED — do not modify**

---

## 🔴 PHASE 2 — CONTEST SYSTEM

### Install
- [ ] All docs placed in docs/contest/
- [ ] All Wave 2 components placed + build passes
- [ ] All Wave 3 config files placed + build passes
- [ ] All Wave 4 pages placed + build passes
- [ ] admin/layout.tsx guard working (redirects to /auth)
- [ ] Wave 4.5 inventory run before Wave 5
- [ ] All Wave 5 API files placed + build passes
- [ ] Wave 6 Prisma reviewed + appended + migrated
- [ ] Wave 7 smoke test passes

### Functionality
- [ ] /contest page loads
- [ ] /contest/rules page loads with 10 rules
- [ ] /contest/qualify shows sponsor progress for logged-in artist
- [ ] /contest/leaderboard loads with graceful empty state
- [ ] /contest/host page loads + Ray Journey renders
- [ ] /contest/admin redirects unauthenticated users
- [ ] Contest banner visible on eligible artist profile
- [ ] Sponsor invite panel opens + closes + sends
- [ ] Sponsor packages all display
- [ ] August 8 date rule enforced in API
- [ ] Season countdown targets August 8
- [ ] Winner reveal: single mode works
- [ ] Winner reveal: small_game mode works (1–5)
- [ ] Winner reveal: big_contest mode works (5–10)
- [ ] Group hold + countdown works
- [ ] Hero zoom renders featured winner
- [ ] Camera director runs within preset pool
- [ ] Adaptive weights save + restore
- [ ] Fallback single-winner mode works

---

## 🔴 PHASE 3 — INTERVIEW / PODCAST / WATCH PARTY

**Prerequisite: Phase 2 minimum complete**

- [ ] InterviewStage component renders
- [ ] PodcastAudienceRoom component renders
- [ ] WatchPartyPanel component renders
- [ ] GuestQueuePanel works
- [ ] AudienceRequestPanel works
- [ ] ClipRecorderPanel works
- [ ] /interviews page loads
- [ ] /interviews/[id] loads live room
- [ ] /podcasts page loads
- [ ] /podcasts/[id] loads podcast room
- [ ] /watch/[roomId] loads watch party room
- [ ] LiveRoom API module builds
- [ ] POST /api/liveroom creates room
- [ ] Room participant join/leave works
- [ ] Guest invite flow works
- [ ] Recording consent tracked
- [ ] Clip request + approval flow works
- [ ] Replay page loads
- [ ] Auto-archive triggers after room ends

---

## 🔴 PHASE 4 — OPERATOR LAYER (before upload)

- [ ] One-command local restore PowerShell script
- [ ] One-command pre-upload proof gate script
- [ ] Deployment runbook written
- [ ] Rollback runbook written
- [ ] Operator sheet (one-page quick reference)
- [ ] Upload smoke pack captured

---

## 🔴 PHASE 5 — VISUAL QUALITY

- [ ] All pages match TMI neon/dark aesthetic
- [ ] No lorem ipsum visible to users
- [ ] No [TODO] visible to users
- [ ] Loading states on all async content
- [ ] Empty states on all empty lists
- [ ] Error states on all failure paths
- [ ] Mobile readable at 375px width
- [ ] Contest banner animates correctly
- [ ] Winner reveal animates correctly
- [ ] Ray Journey avatar renders

---

## 🔴 PHASE 6 — UPLOAD + LIVE ONBOARDING

- [ ] All E2E tests pass
- [ ] CI green on latest commit
- [ ] Rollback verified
- [ ] Health identity visible on /api/healthz
- [ ] No 404 routes on any linked page
- [ ] First artist can onboard and enter contest
- [ ] First fan can vote
- [ ] First sponsor can back an artist
- [ ] First admin can create a season

---

## PRODUCTION READINESS GATES

| Gate | Requirement |
|---|---|
| Build Gate | All builds pass, no TypeScript errors |
| Auth Gate | All auth flows locked and verified |
| Route Gate | No 404 or 500 on any linked route |
| Proof Gate | All E2E tests pass with live services |
| Visual Gate | Design review passes, no placeholders |
| Schema Gate | Prisma migrated without conflict |
| Security Gate | Admin guards working, auth locked |
| Onboarding Gate | First member can complete onboarding |

---

*BerntoutGlobal XXL | TMI Platform | Platform Completeness Checklist | Phase 19*
