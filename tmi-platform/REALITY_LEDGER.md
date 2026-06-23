# REALITY_LEDGER

Date: 2026-06-21
Mode: Build Director Reality Audit
Scope: Home 1, Home 1-2, Home 2, Home 3, Home 4, Home 5, Fan HQ, Performer HQ, Fan Profile, Performer Profile.

## Page Surface Audit

| System | Route | Component | Data Source | Working | Broken | Placeholder | Mock |
|---|---|---|---|---|---|---|---|
| Home 1 | /home/1 | Home1CoverPage + DiscoveryRail | SponsorRegistry, PerformerRegistry, ContentFreshness | Yes | No | Low | No |
| Home 1-2 | /home/1-2 | Billboard page surface | fetchTrendingArtists + PerformerRegistry + editorial + seed sponsors | Partial | No | Medium | Yes (SEED_SPONSORS) |
| Home 2 | /home/2 | Home2NewsDeskSurface | magazineIssueData + SponsorRegistry + DiscoveryRail | Yes | No | Low | No |
| Home 3 | /home/3 | Home3LiveWorldSurface | PerformerRegistry + DiscoveryRail + SponsorRegistry | Yes | No | Low | No |
| Home 4 | /home/4 | Home4AdMagazine | SponsorRegistry rail | Partial | No | Medium | Unknown in child component |
| Home 5 | /home/5 | Home5BattleCypherSurface | SponsorRegistry rail + DiscoveryRail | Partial | No | Medium | Unknown in child component |
| Fan HQ | /hub/fan | FanHubShell + rails + canisters | Mixed: /api/live/go + FollowEngine + many SEED_* constants | Partial | No | Medium | High |
| Performer HQ | /hub/performer | PerformerHubDashboard + monitor/canisters | Mixed: /api/booking/create, /api/messages + static current-user values | Partial | No | Medium | Medium |
| Fan Profile | /fan/profile | Fan profile shell + MemoryWall + OmniPresence | /api/auth/session, /api/profile/update + static stats | Partial | No | Medium | High |
| Performer Profile | /performer/profile | Performer profile shell + media/canisters | /api/auth/session, /api/profile/update + static stats | Partial | No | Medium | Medium |

## Functional Systems Snapshot

| System | Current Source | Status | Notes |
|---|---|---|---|
| Messaging | /api/messages, MessageThreadEngine, InboxPanel | Partial Real | HQ has real reads; profile uses Omni surface; voice/video overlays still mostly shell states. |
| Voice Calls | communication dock voice mode | Not Certified | UI exists; no active call runtime bound yet. |
| Video Calls | /video/call/new route exists | Partial Real | Launch route exists; always-on in-page call runtime not certified. |
| Lobby Invites | communication dock invite mode | Partial | Link generation present; acceptance flow not fully certified from HQ surfaces. |
| Image Upload | AvatarUploadPipeline + /api/profile/update | Partial Real | Performer profile has upload path; fan profile lacks equivalent visible image wallet assignment flow. |
| Video Upload | PerformerMediaLibrary/MyContentManager | Partial | Need end-to-end certification for storage->db->display->replace->delete. |
| Audio Upload | PerformerMediaLibrary/MyContentManager | Partial | Same as above. |
| Memory Wall | MemoryWall component on fan/performer pages | Partial Real | Wired, but seeded profile/HQ contexts still present in several surfaces. |
| Playlist | PlaylistArtifact + playlist surfaces | Partial | Runtime data mix not fully certified; some static artifact ids. |
| Live Rooms | /live/rooms/[id], /live/lobby, /rooms/* | Real Route Coverage | Needs consistency audit for canonical room path usage and duplicate room route cleanup. |
| Battles/Cyphers/Challenges | /battles/live, /cypher/*, /rooms/cypher-arena | Partial Real | Route coverage exists; several entries still use static counts/content. |
| Ticketing | booking/ticket pages and engines exist | Partial | Requires authority + print + settlement certification pass. |
| Stripe/Payments | existing stripe stack + admin observability | Partial Real | Needs direct user-surface certification matrix by role/tier. |
| Email/Notifications | notification/email folders present | Not Audited in this pass | Requires dedicated reality pass. |
| Profile/Cover/Article image propagation | scattered | Not Certified | Single source assignment chain still incomplete. |

## Priority Reality Failures (P0)
1. Fan HQ hardcoded seed blocks and demo identity values are still active in user-facing route.
2. Fan/Performer profile stat cards are static (mock values) instead of real feeds or honest empty state cards.
3. Home 1-2 still uses seed sponsors while other homes use registry-driven sponsor fallback chain.
4. Communication overlay has polished shell but voice/video/invite operations are not fully runtime-certified.

## Build Director Enforcement
- Freeze new architecture/spec generation.
- Convert mixed mock/seed surfaces to real data or honest state.
- Certify every media pipeline step before visual-only expansion.
