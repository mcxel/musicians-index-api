# MASTER_COMPLETION_MAP.md
# The Musician's Index — Master Completion Map
# Authority: Repo-first, PDF-visual second
# Last updated: 2026-03-23

## Purpose

Single locked reference for platform completion status.
Copilot must check this before every slice to avoid touching locked systems and to correctly prioritize work.

---

## Completion Status

### LOCKED (Do Not Touch Without Proof Gate)
- Auth flow (`apps/web/src/app/auth/**`)
- Onboarding flow (`apps/web/src/app/onboarding/**`)
- RBAC middleware (`apps/web/src/middleware.ts`)
- Prisma schema core models (User, Account, Session, VerificationToken)
- Stripe subscription models (Product, Price, Subscription)
- CI workflow (`.github/workflows/ci.yml`)
- Promo code system (PromoCode, AuditLog models)

### BEFORE DEPLOY — Must Complete
These must be done in slice order:

| Slice | System | Status | Blocker |
|-------|--------|--------|---------|
| 0 | Build green / route smoke | ❌ | Verify first |
| 1 | Shared shell / tokens / config / asset map / spell dict | ❌ | - |
| 2 | Homepage Belt 1 / 2 / 3 | ❌ | Slice 1 |
| 3 | Magazine Engine (horizontal flow) | ❌ | Slice 2 |
| 4 | Stream & Win (audio persist + points hooks) | ❌ | Slice 3 |
| 5 | Artist Profiles (PDF style + Diamond tiers) | ❌ | Slice 4 |
| 6 | Live World / Discovery / Playlists / Calendar / Random Rooms | ❌ | Slice 5 |
| 7 | Cypher / Games / Economy / Sponsor/Ads / Booking/Admin | ❌ | Slice 6 |
| 8 | Proof gates / CI / Deploy smoke / Onboarding proof | ❌ | Slice 7 |

### BEFORE ONBOARDING — Must Complete

- Admin Command Center fully wired
- Onboard Admin: account creation flow, RBAC, first content entry
- Onboard Artist: profile creation, music link submission, Diamond seeding (Marcel, B.J.M.)
- Onboard Fan: registration, discovery, Stream & Win first run
- Empty state coverage (all modules)
- Error state coverage (all modules)

### CONTROLLED LAUNCH SEQUENCE

1. Deploy backend (NestJS API)
2. Deploy frontend (Next.js web)
3. Onboard admin
4. Onboard first artist (Marcel)
5. Onboard second artist (B.J.M.)
6. First Stream & Win test run
7. First Cypher test run
8. First Booking test run
9. First Game Night test run
10. First Issue release

### DEFER UNTIL POST-LAUNCH

- Store / Merch
- Watch Party engine (full build)
- Random Rooms (full matchmaking)
- Advanced analytics dashboard
- Social share engine deep integration
- Native mobile app

---

## Engines Completion Map

| Engine | Location | Status |
|--------|----------|--------|
| BeltEngine | `apps/web/src/systems/belt/` | 🔶 PARTIAL |
| MagazineEngine | `apps/web/src/systems/magazine/` | ❌ MISSING |
| StreamWinEngine | `apps/web/src/systems/stream-win/` | 🔶 PARTIAL |
| LiveRoomEngine | `apps/api/src/modules/live-rooms/` | ❌ MISSING |
| CypherEngine | `apps/api/src/modules/cypher/` | ❌ MISSING |
| GameEngine | `apps/api/src/modules/games/` | ❌ MISSING |
| BookingEngine | `apps/api/src/modules/booking/` | ❌ MISSING |
| PointsRewardsEngine | `apps/api/src/modules/points/` | ❌ MISSING |
| SponsorAdEngine | `apps/api/src/modules/sponsors/` | ❌ MISSING |
| LeaderboardEngine | `apps/api/src/modules/leaderboard/` | ❌ MISSING |
| PlaylistEngine | `apps/api/src/modules/playlist/` | ❌ MISSING |
| BotEngine | `apps/api/src/bots/` | 🔶 PARTIAL |
| NotificationEngine | `apps/api/src/modules/notification/` | ❌ MISSING |
| AdminEngine | `apps/api/src/modules/admin/` | ❌ MISSING |
| WatchPartyEngine | `apps/api/src/modules/watch-party/` | ❌ MISSING |

---

## Overall Completion Estimate

| System Area | % |
|-------------|---|
| Backend safety (auth/RBAC) | 85% |
| Repo structure | 80% |
| Homepage belts | 60% |
| Magazine system | 50% |
| Artist profiles | 35% |
| Stream & Win | 25% |
| Cypher system | 30% |
| Booking | 40% |
| Games | 30% |
| Admin | 50% |
| Sponsor/Ads | 35% |
| Points/Rewards | 30% |
| Deploy readiness | 65% |
| Onboarding | 45% |
| **Overall platform** | **~60%** |
