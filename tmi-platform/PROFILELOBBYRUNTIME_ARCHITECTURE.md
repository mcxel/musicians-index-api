# PROFILELOBBYRUNTIME_ARCHITECTURE (Draft — Sprint 1B Audit Phase)

Status: Phase 1 foundation in progress (adapter-first, non-destructive)  
Date: 2026-06-02

## Objective
Define the canonical runtime shell for all role profiles without parallel systems.

## Core rule
Performer profile is the master template.  
Fan, Artist, Producer, Venue, Sponsor, Advertiser, Promoter inherit via configuration.

---

## Canonical shell layout (proposed)

### Left Rail
- Profile navigation
- Messages entry
- Memory entry
- Playlist shortcuts
- Subscription / rewards entry
- Quick route actions (challenge/battle/cypher/live)

### Center Surface
- Primary profile content surface
- Live stage context (when active)
- Audience/lobby context (when active)
- Article/story modules (role-dependent)
- Venue/booking context (role-dependent)

### Right Utilities
- TripleViewManager container (future phase)
- Sponsor queue/overlays (future phase)
- Playlist manager controls
- Live diagnostics/telemetry
- Compact CTA utility stack

---

## Engine composition model

| Concern | Canonical Engine |
|---|---|
| Profile shell & role inheritance | ProfileLobbyRuntime |
| Self/Audience/Avatar panel state | TripleViewManager (future impl) |
| Playlist/music state | PlaylistEngine |
| Memory/social timeline | MemoryWallEngine |
| Messaging/inbox/presence | MessagingEngine |
| Live stage interactions | LiveStageRuntime |
| Room media and RTC | VideoSessionEngine |
| Audience and lobby participation | AudiencePresenceEngine |
| Venue identity/seating/tickets | VenueEngine |
| Sponsor visibility/event overlays | SponsorOverlayEngine (future impl) |
| Stats and reporting | AnalyticsEngine |
| Subscription/access gating | SubscriptionEngine |

---

## Role inheritance matrix (proposed)

| Role | Master Runtime | Overrides |
|---|---|---|
| Performer | ProfileLobbyRuntime (master baseline) | stage-first defaults, sponsor queue visibility |
| Fan | ProfileLobbyRuntime (derived) | audience-first defaults, memory/social prominence |
| Artist | ProfileLobbyRuntime (derived) | article/spotlight and release modules |
| Producer | ProfileLobbyRuntime (derived) | beat/instrumental + marketplace panels |
| Venue | ProfileLobbyRuntime (derived) | seating/ticketing/room ops modules |
| Sponsor | ProfileLobbyRuntime (derived) | sponsor placements/campaign modules |
| Advertiser | ProfileLobbyRuntime (derived) | campaign analytics modules |
| Promoter | ProfileLobbyRuntime (derived) | discovery/promotion modules |

---

## Migration constraints
- No direct deletion during consolidation start.
- Route aliases may remain for compatibility while converging behavior.
- Consolidate duplicate profile routes into shared runtime-backed composition.
- Keep/merge/reimagine decisions must follow completed audit classifications.

---

## Entertainment First operational checks
Every profile runtime surface should answer:
1. What is happening now?
2. What can I join now?
3. How can I influence outcomes now?
4. What can I promote/share now?

If a profile sub-surface is passive-only, classify as REIMAGINE in implementation planning.

---

## Risks to manage in implementation phase
- Breaking role-specific route expectations during runtime unification
- Losing persistent media/session/playlist state across role transitions
- UI crowding between utilities and primary interaction controls
- Overlay interactions blocking critical controls (resolved in TripleView spec)

---

## Out of scope in this draft
- No code movement
- No runtime implementation
- No sponsor engine rollout
- No TripleView implementation

## Phase 1 foundation update (adapter-first, completed scope)
Implemented as non-destructive foundation:
- Reused existing runtime shell:
  - `apps/web/src/components/profile/ProfileLobbyRuntime.tsx`
- Added canonical runtime bridge:
  - `apps/web/src/runtime/ProfileLobbyRuntime.tsx`
- Added runtime contracts:
  - `apps/web/src/runtime/contracts.ts`
- Added adapter layer:
  - `apps/web/src/runtime/adapters.ts`

No code deletion performed.
No route removals performed.
No protected systems removed.

## Current Runtime Section → Future Engine mapping
| Current Runtime Section | Future Engine |
|---|---|
| Messages | MessagingEngine |
| Memory Wall | MemoryWallEngine |
| Playlist Area | PlaylistEngine |
| Audience Area | AudiencePresenceEngine |
| Live Stage | LiveStageRuntime |
| Avatar Lobby | AudiencePresenceEngine |
| Triple View Area | TripleViewManager |
| Event Area | EventEngine |
| Mini Event Area | MiniEventEngine |
| World Concert Area | WorldConcertEngine |
| World Dance Party Area | WorldDancePartyEngine |
| Monthly Idol | MonthlyIdolEngine |
| Deal or Feud 1000 | DealOrFeud1000Engine |
| Circles and Squares | CirclesAndSquaresEngine |
| Marcel's Monday Night Stage | MondayNightStageEngine |

## Addendum — Every Hosted Experience Gets a Venue
Rule:
- Every hosted experience must exist inside a venue shell.
- No floating event pages.
- No disconnected event screens.
- No event outside VenueEngine.

Applies to:
- World Concerts
- Mini Concerts
- Mini Cyphers
- Mini Battles
- Mini Challenges
- Mini Dance Parties
- Mini World Dance Parties
- Mini Joke Offs
- Mini Dance Offs
- Monthly Idol
- Deal or Feud 1000
- Circles and Squares
- Marcel’s Monday Night Stage
- Watch Parties
- Game Nights
- World Releases
- Sponsor Events
- Bot-Curated Promotion Events

Future ownership chain:
HostedExperience
→ VenueEngine
→ AudiencePresenceEngine
→ TripleViewManager
→ LiveStageRuntime OR GameEventEngine
→ PlaylistEngine (music-active contexts)
→ SponsorOverlayEngine (sponsor-active contexts)
→ TicketAccessEngine (access-controlled contexts)
→ PricingAccessEngine (paid/discount contexts)

TripleView required views:
- Venue View
- Audience View
- Self/Host View
- AvatarLobby View

Venue evolution rule (future capability):
- VenueEngine should support non-repetitive venue evolution via:
  - VenueTemplate
  - VenueTheme
  - VenueLayout
  - AudienceConfiguration
  - StageConfiguration
  - SponsorConfiguration
  - SeasonalConfiguration
  - EvolutionProfile
  - HostedExperience

This file remains architecture metadata and does not imply full feature implementation.

## Phase 2 Addendum — Engine #1 PlaylistEngine (Contract-First)
Status: In progress (single-surface bridge strategy).

### Music Is Infrastructure Rule
Playlist is treated as core runtime infrastructure, not a UI widget.  
All future venue/event/lobby systems should consume PlaylistEngine contract surfaces.

### PlaylistEngine v1 Contract Scope (placeholders only in this phase)
- QueueManager
- PlaybackManager
- SyncManager (shared audience playback session readiness)
- AnalyticsManager (contract placeholders)
- AdaptationManager (contract placeholders)
- DiscoveryManager (visibility/discovery placeholders)

Supported/future playlist categories (contract readiness):
- personal, fan, artist, performer, venue, sponsor, promoter
- lobby, stage, walkOn, memoryWall, worldDanceParty, miniEvent

### Persistence Rule
Playback state must preserve across runtime panel/view state changes:
- minimized → standard → expanded → fullscreen
And future view transitions:
- Venue View ↔ Audience View ↔ Avatar View ↔ Host/Self View

### Lobby Visibility Rule (recorded)
- Public broadcasts feed main live/audience discovery surfaces.
- Private “chilling” lobbies can remain content-restricted while still surfacing as discovery entries on live wall surfaces (status-labeled).

### Curtain System Requirement (future LiveStageRuntime)
- CLOSED
- OPENING
- OPEN

### Mini-Event / World-Event Compatibility Hooks (future binding)
PlaylistEngine should remain bindable to:
- mini-concerts, mini-cyphers, mini-battles, mini-challenges
- mini-dance parties, mini-joke offs
- World Concerts, World Dance Party, World Releases
- Monthly Idol, Deal or Feud 1000, Circles and Squares, Marcel’s Monday Night Stage

### Migration Safety Rule (active)
- Bridge only one safe playlist surface in Engine #1.
- Keep legacy playlist implementations intact and marked:
  - legacy-compatible
  - pending PlaylistEngine migration
- No deletions, no renames, no broad refactors in this phase.
