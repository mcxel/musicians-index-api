# AVATAR ENGINE SYSTEM
## TMI Platform — The Musicians Index

---

## Overview

The Avatar Engine is the live-presence character system for The Musicians Index. It transforms static profile icons into fully animated, venue-aware, role-driven characters that exist inside rooms, stages, and audience environments.

Avatars are not decorations. They are driven by room state, role assignments, behavior rules, and evolution tiers.

---

## Engine Families

| Engine | Purpose |
|--------|---------|
| Avatar Presence Engine | Manages avatar existence in a room/venue |
| Avatar Pose Engine | Controls body pose state |
| Avatar Expression Engine | Controls facial/emotional expression |
| Avatar Costume Engine | Manages outfit and clothing layers |
| Avatar Prop Engine | Manages held items and accessories |
| Avatar Seating Engine | Assigns and manages seat positions |
| Avatar Attention Engine | Controls gaze/head direction |
| Avatar Reaction Engine | Handles event-triggered reactions |
| Avatar Crowd Behavior Engine | Manages NPC/audience crowd behavior |
| Avatar Host/CoHost Engine | Manages host and co-host stage behavior |
| Avatar Venue Binding Engine | Binds avatars to venue zones |
| Avatar Upgrade/Evolution Engine | Manages tier progression and unlocks |
| Avatar Memory/Personality Engine | Stores avatar preferences and history |
| Avatar Scene Transition Engine | Handles avatar movement between scenes |

---

## System Files

### Engine (systems/avatar/)
- `types.ts` — Core type definitions
- `poseRegistry.ts` — All pose states and transitions
- `costumeRegistry.ts` — Costume definitions and tier unlocks
- `propRegistry.ts` — Prop definitions and role assignments
- `expressionRegistry.ts` — Expression states and triggers
- `venueBindingConfig.ts` — Zone definitions and role-zone mappings
- `behaviorPresets.ts` — Role-based behavior rule sets
- `evolutionPresets.ts` — Tier definitions and point thresholds
- `index.ts` — Unified export

### Components (components/avatar/)
- Character: `AvatarStageCharacter`, `AvatarAudienceCharacter`, `AvatarHostCharacter`, `AvatarCoHostCharacter`, `AvatarGuestCharacter`
- Layers: `AvatarReactionLayer`, `AvatarPoseLayer`, `AvatarCostumeLayer`, `AvatarPropLayer`
- Behaviors: `AvatarSeatBehavior`, `AvatarAttentionBehavior`, `AvatarListeningBehavior`, `AvatarIdleController`
- Structural: `AvatarCrowdCluster`, `AvatarVenueAnchor`, `AvatarTransitionShell`, `AvatarTalkTurnBehavior`

---

## Avatar Identity Chain

```
Avatar Identity
  → Avatar Role (host | cohost | guest | artist | fan | vip | audience | npc)
  → Evolution Tier (starter | rising | established | featured | legendary)
  → Pose State (24 states)
  → Expression State (11 states)
  → Costume Set (unlocked by tier)
  → Prop Set (unlocked by tier + role)
  → Venue Zone Binding (role-based)
  → Behavior Rules (role-based presets)
  → Scene Reactions (event-driven)
  → Memory Profile (saved preferences)
  → Render in Rooms / Profiles / Shows
```

---

## Pose States (24)

`idle`, `watching`, `listening-left`, `listening-right`, `leaning-in`, `reacting`, `clapping`, `laughing`, `surprised`, `talking`, `whispering`, `cheering`, `booing`, `host-speaking`, `cohost-speaking`, `intro-walk`, `stage-entry`, `seat-settle`, `dance-loop`, `crowd-sway`, `mic-hold`, `camera-look`, `audience-look-left`, `audience-look-right`

---

## Expression States (11)

`neutral`, `happy`, `excited`, `focused`, `surprised`, `laughing`, `proud`, `hyped`, `sad`, `angry`, `nodding`

---

## Venue Zones (13)

`audience-seat`, `stage-mark`, `host-podium`, `dj-booth`, `interview-chair`, `vip-balcony`, `cypher-circle`, `backstage-zone`, `venue-walkway`, `sponsor-booth`, `contest-platform`, `green-room`, `front-row`

---

## Copilot Wiring Notes

- Wire `AvatarPresenceState` to room socket events
- Wire `resolveBehavior()` to room event bus triggers
- Wire `getTierForPoints()` to user wallet/points system
- Wire costume/prop unlocks to evolution tier changes
- Wire venue zone binding to room seat assignment engine
- Wire `AvatarCrowdCluster` to audience density engine
