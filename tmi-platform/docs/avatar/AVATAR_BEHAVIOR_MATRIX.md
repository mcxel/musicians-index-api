# AVATAR BEHAVIOR MATRIX
## TMI Platform — The Musicians Index

---

## Overview

This matrix defines which behaviors are available to each avatar role, and which room events trigger them.

---

## Role × Behavior Matrix

| Behavior | host | cohost | guest | artist | fan | vip | audience | npc |
|----------|------|--------|-------|--------|-----|-----|----------|-----|
| intro-walk | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| stage-entry | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| host-speaking | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| cohost-speaking | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| mic-hold | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| camera-look | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| listening-left | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| listening-right | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| leaning-in | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| reacting | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| clapping | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| cheering | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| dance-loop | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| crowd-sway | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| seat-settle | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| audience-look-left | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| audience-look-right | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| whispering | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| booing | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| laughing | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| surprised | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| idle | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| watching | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| talking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## Event × Behavior Trigger Map

| Room Event | Triggered Behavior |
|------------|-------------------|
| show-start | intro-walk |
| stage-entry | stage-entry |
| host-speaking | listening-left (for cohost/guest) |
| applause | clapping → cheering (fans) |
| crowd-peak | cheering → dance-loop |
| drop-moment | dance-loop |
| music-playing | crowd-sway |
| big-moment | reacting |
| camera-cue | camera-look |
| audience-cue-left | audience-look-left |
| audience-cue-right | audience-look-right |
| guest-cue | talking |
| performance-start | mic-hold (artist) |
| seat-assigned | seat-settle |
| idle-timeout | idle |

---

## Attention Priority Order

When multiple events fire simultaneously, attention resolves in this order:

1. camera-cue (highest)
2. stage-entry
3. host-speaking
4. big-moment
5. applause
6. crowd-peak
7. music-playing
8. idle (lowest)

---

## Copilot Wiring Notes

- Wire room event bus to `resolveBehavior(role, trigger, ctx)`
- Wire result pose to `AvatarPresenceState.currentPose`
- Wire result expression to `AvatarPresenceState.currentExpression`
- Wire `AvatarAttentionBehavior` to attention priority resolver
- Wire `AvatarListeningBehavior` to active speaker detection
