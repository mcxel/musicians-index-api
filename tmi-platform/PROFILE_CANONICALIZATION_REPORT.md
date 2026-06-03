# PROFILE_CANONICALIZATION_REPORT (Sprint 1B Audit — Inventory Only)

Status: Audit-only  
Date: 2026-06-02  
Lens: Canonical runtime inheritance + Entertainment First

## Canonical profile objective
Performer profile becomes the master template.  
Fan, Artist, Producer, Venue, Sponsor, Advertiser, Promoter inherit from canonical ProfileLobbyRuntime.

## Canonical profile engine targets (proposed)
- ProfileLobbyRuntime
- MessagingEngine
- MemoryWallEngine
- PlaylistEngine (profile music awareness)
- SubscriptionEngine
- AnalyticsEngine

---

## Profile System Inventory

| File Path | Purpose | Dependencies | Active Routes | Current System | Proposed Canonical Engine | Class |
|---|---|---|---|---|---|---|
| `apps/web/src/components/profile/ProfileLobbyRuntime.tsx` | Shared profile shell runtime | role state + profile modules | profile and hub surfaces | Core profile shell | ProfileLobbyRuntime | KEEP |
| `apps/web/src/components/profile/page.tsx` | Profile entry view | ProfileLobbyRuntime + widgets | `/profile` | Profile route component | ProfileLobbyRuntime | MERGE |
| `apps/web/src/app/profile/page.tsx` | Main profile page route | profile runtime/components | `/profile` | Top-level profile route | ProfileLobbyRuntime | MERGE |
| `apps/web/src/app/profile/performer/[slug]/page.tsx` | Performer profile route | performer data + profile components | `/profile/performer/[slug]` | Performer profile | ProfileLobbyRuntime (master template) | KEEP |
| `apps/web/src/app/profile/fan/[slug]/page.tsx` | Fan profile route | fan data/profile modules | `/profile/fan/[slug]` | Fan profile | ProfileLobbyRuntime (derived) | MERGE |
| `apps/web/src/app/profile/artist/[slug]/page.tsx` | Artist profile route | artist profile/article modules | `/profile/artist/[slug]` | Artist profile | ProfileLobbyRuntime (derived) | MERGE |
| `apps/web/src/app/profile/venue/[slug]/page.tsx` | Venue profile route | venue profile modules | `/profile/venue/[slug]` | Venue profile | ProfileLobbyRuntime (derived) | MERGE |
| `apps/web/src/app/profile/sponsor/[slug]/page.tsx` | Sponsor profile route | sponsor data/modules | `/profile/sponsor/[slug]` | Sponsor profile | ProfileLobbyRuntime (derived) | MERGE |
| `apps/web/src/app/profile/advertiser/[slug]/page.tsx` | Advertiser profile route | advertiser modules | `/profile/advertiser/[slug]` | Advertiser profile | ProfileLobbyRuntime (derived) | MERGE |
| `apps/web/src/app/profile/promoter/[slug]/page.tsx` | Promoter profile route | promoter modules | `/profile/promoter/[slug]` | Promoter profile | ProfileLobbyRuntime (derived) | MERGE |
| `apps/web/src/components/profile/ProfileAvatarManager.tsx` | Avatar/profile visual management | avatar hooks/services | profile/avatar flows | Avatar manager | ProfileLobbyRuntime + AudiencePresenceEngine | KEEP |
| `apps/web/src/components/avatar/HighFidelityAvatar.tsx` | Avatar rendering component | avatar state + visual layer | profile/lobby/live contexts | Avatar renderer | AudiencePresenceEngine + ProfileLobbyRuntime | KEEP |
| `apps/web/src/app/fan/profile/page.tsx` | Fan dedicated profile dashboard variant | fan-specific modules | `/fan/profile` | Parallel fan profile shell | ProfileLobbyRuntime (derived) | REPLACE |
| `apps/web/src/app/artist/profile/page.tsx` | Artist profile dashboard variant | artist-specific modules | `/artist/profile` | Parallel artist profile shell | ProfileLobbyRuntime (derived) | REPLACE |
| `apps/web/src/app/performer/profile/page.tsx` | Performer profile dashboard variant | performer-specific modules | `/performer/profile` | Parallel performer profile shell | ProfileLobbyRuntime (master) | MERGE |
| `apps/web/src/app/sponsor/profile/page.tsx` | Sponsor profile dashboard variant | sponsor modules | `/sponsor/profile` | Parallel sponsor profile shell | ProfileLobbyRuntime (derived) | REPLACE |
| `apps/web/src/app/advertiser/page.tsx` | Advertiser surface | advertiser widgets + profile fragments | `/advertiser` | role surface | ProfileLobbyRuntime (derived) | REIMAGINE |
| `apps/web/src/app/hub/advertiser/page.tsx` | Advertiser hub/dashboard | hub + metrics modules | `/hub/advertiser` | hub runtime | ProfileLobbyRuntime (derived) + AnalyticsEngine | MERGE |
| `apps/web/src/app/fan/dashboard/page.tsx` | Fan dashboard | fan widgets/media | `/fan/dashboard` | fan dashboard shell | ProfileLobbyRuntime (derived) | MERGE |
| `apps/web/src/app/performer/studio/page.tsx` | Performer studio/dashboard | stage/media/runtime modules | `/performer/studio` | performer studio shell | ProfileLobbyRuntime (master) + LiveStageRuntime | MERGE |
| `apps/web/src/app/dashboard/performer/page.tsx` | Performer dashboard variant | role dashboard modules | `/dashboard/performer` | duplicate performer dashboard | ProfileLobbyRuntime (master) | REPLACE |
| `apps/web/src/app/dashboard/fan/page.tsx` | Fan dashboard variant | role dashboard modules | `/dashboard/fan` | duplicate fan dashboard | ProfileLobbyRuntime (derived) | REPLACE |

---

## Profile inheritance notes
- Multiple parallel role profiles/dashboards exist (route-family duplicates):
  - `/profile/*`
  - `/<role>/profile`
  - `/dashboard/<role>`
  - `/hub/<role>`
- Recommendation: maintain route aliases for compatibility but converge behavior on one runtime shell with role configs.

## Entertainment First notes
- Data-only profile dashboards should be REIMAGINE where they lack participation hooks (live join, playlist social, audience/lobby interaction).
- Performer profile should prioritize:
  - live entry
  - audience/lobby visibility
  - sponsor queue awareness
  - memory/social engagement

## Risk level if touched
- High: performer/fan profile route families (user-facing core identity surfaces)
- Medium: role dashboard aliases and hub mappings
- Medium: avatar manager and profile runtime composition

## Constraint confirmation
- No code deletion/movement/refactor in this phase.
- Audit classification only.
