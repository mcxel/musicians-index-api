# AVATAR VENUE BINDING MAP
## TMI Platform — The Musicians Index

---

## Overview

Every avatar must be bound to a venue zone when inside a room. The zone determines the avatar's position, pose defaults, and behavior rules.

---

## Zone Registry

| Zone ID | Label | Capacity | Default Role |
|---------|-------|----------|-------------|
| audience-seat | Audience Seat | 500 | audience, fan |
| stage-mark | Stage Mark | 5 | artist |
| host-podium | Host Podium | 1 | host |
| dj-booth | DJ Booth | 2 | artist |
| interview-chair | Interview Chair | 2 | cohost, guest |
| vip-balcony | VIP Balcony | 20 | vip |
| cypher-circle | Cypher Circle | 8 | artist, fan |
| backstage-zone | Backstage Zone | 10 | artist, host, cohost |
| venue-walkway | Venue Walkway | unlimited | all |
| sponsor-booth | Sponsor Booth | 4 | vip |
| contest-platform | Contest Platform | 6 | artist |
| green-room | Green Room | 8 | artist, host, cohost, guest |
| front-row | Front Row | 30 | fan, vip |

---

## Role → Default Zone Map

| Role | Default Zone |
|------|-------------|
| host | host-podium |
| cohost | interview-chair |
| guest | interview-chair |
| artist | stage-mark |
| fan | audience-seat |
| vip | vip-balcony |
| audience | audience-seat |
| npc | audience-seat |

---

## Room Type → Available Zones

| Room Type | Available Zones |
|-----------|----------------|
| main-stage | stage-mark, host-podium, audience-seat, front-row, vip-balcony, sponsor-booth |
| cypher | cypher-circle, audience-seat, venue-walkway |
| interview | interview-chair, host-podium, audience-seat |
| dj | dj-booth, audience-seat, front-row, vip-balcony |
| backstage | backstage-zone, green-room |
| contest | contest-platform, audience-seat, front-row |
| vip-lounge | vip-balcony, sponsor-booth, venue-walkway |
| listening-party | audience-seat, front-row, venue-walkway |

---

## Zone Behavior Hooks

Each zone exposes these hooks for avatar behavior:

- `onEnter(avatarId)` — triggered when avatar enters zone
- `onExit(avatarId)` — triggered when avatar leaves zone
- `onSettle(avatarId)` — triggered after seat-settle animation
- `onReact(avatarId, event)` — triggered by room events
- `onAttentionTarget(avatarId, targetZone)` — triggered by attention cue

---

## Copilot Wiring Notes

- Wire `getZoneForRole(role)` to room join flow
- Wire `AvatarVenueAnchor` to zone position system
- Wire `AvatarSeatBehavior` to seat assignment engine
- Wire zone `onReact` hook to room event bus
- Wire zone capacity to audience density engine
