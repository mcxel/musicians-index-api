import os

docs_dir = 'tmi-platform/docs/avatar'
os.makedirs(docs_dir, exist_ok=True)

# ── AVATAR_BEHAVIOR_MATRIX.md ─────────────────────────────────────────────────
behavior_matrix = """# AVATAR BEHAVIOR MATRIX
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
"""

# ── AVATAR_COSTUME_AND_PROP_SYSTEM.md ─────────────────────────────────────────
costume_prop = """# AVATAR COSTUME AND PROP SYSTEM
## TMI Platform — The Musicians Index

---

## Overview

Costumes and props are the visual identity layer of the avatar system. They are unlocked by evolution tier and role, and can be equipped by the user in the Avatar Center.

---

## Costume Registry

| ID | Label | Tier Required | Category |
|----|-------|--------------|----------|
| casual-default | Casual Default | starter | casual |
| stage-performer | Stage Performer | rising | performance |
| cypher-street | Cypher Street | rising | street |
| vip-elite | VIP Elite | established | vip |
| formal-gala | Formal Gala | established | formal |
| contest-champion | Contest Champion | featured | contest |
| legendary-icon | Legendary Icon | legendary | legendary |

---

## Prop Registry

| ID | Label | Category | Roles |
|----|-------|----------|-------|
| mic-standard | Standard Mic | microphone | host, cohost, guest, artist |
| mic-wireless | Wireless Mic | microphone | host, cohost, guest, artist |
| mic-golden | Golden Mic | microphone | host, artist |
| glow-stick | Glow Stick | glow | fan, audience, vip |
| glow-wristband | Glow Wristband | glow | fan, audience, vip |
| sign-fan | Fan Sign | sign | fan, audience |
| sign-glowing | Glowing Sign | sign | fan, audience, vip |
| guitar-electric | Electric Guitar | instrument | artist |
| guitar-acoustic | Acoustic Guitar | instrument | artist |
| dj-headphones | DJ Headphones | instrument | artist |
| trophy | Trophy | stage | host, artist |
| confetti-cannon | Confetti Cannon | stage | host |

---

## Costume Layers

Each costume is composed of layers rendered in order:

1. Base body
2. Outfit (jacket, suit, dress, etc.)
3. Accessories (hat, glasses, chains)
4. Animated overlay (glow, aura, particles)

---

## Prop Attachment Points

| Prop Category | Attachment Point |
|--------------|-----------------|
| microphone | right hand |
| instrument | both hands |
| glow | left hand |
| sign | both hands raised |
| stage | floor / podium |

---

## Tier Unlock Summary

| Tier | Costumes | Props |
|------|----------|-------|
| starter | casual-default | mic-standard, glow-stick |
| rising | + stage-performer, cypher-street | + mic-wireless, glow-wristband, sign-fan |
| established | + vip-elite, formal-gala | + sign-glowing, guitar-electric, guitar-acoustic |
| featured | + contest-champion | + mic-golden, dj-headphones, trophy |
| legendary | + legendary-icon | + confetti-cannon |

---

## Copilot Wiring Notes

- Wire `getCostumesByTier(tier)` to Avatar Center unlock display
- Wire `getPropsForRole(role)` to prop selection UI
- Wire equipped costume/props to `AvatarIdentity.equippedCostumeId` and `equippedPropIds`
- Wire `AvatarCostumeLayer` to render equipped costume
- Wire `AvatarPropLayer` to render equipped props
"""

# ── AVATAR_VENUE_BINDING_MAP.md ───────────────────────────────────────────────
venue_binding = """# AVATAR VENUE BINDING MAP
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
"""

# ── AVATAR_UPGRADE_AND_EVOLUTION.md ──────────────────────────────────────────
upgrade_evolution = """# AVATAR UPGRADE AND EVOLUTION
## TMI Platform — The Musicians Index

---

## Overview

The Avatar Evolution System allows avatars to grow over time based on platform activity. As users earn points, their avatar tier increases, unlocking new costumes, props, zones, and visual effects.

---

## Evolution Tiers

| Tier | Label | Points Required | Glow Color |
|------|-------|----------------|-----------|
| starter | Starter | 0 | #888888 |
| rising | Rising | 500 | #ff6b35 |
| established | Established | 2,000 | #ffd700 |
| featured | Featured | 7,500 | #c0c0ff |
| legendary | Legendary | 25,000 | #ff00ff |

---

## Points Sources

| Activity | Points Earned |
|----------|--------------|
| Join a room | 5 |
| Watch a full show | 25 |
| Tip an artist | 10 per tip |
| Win a contest | 500 |
| Enter a contest | 50 |
| Vote in a contest | 10 |
| Complete onboarding | 100 |
| Daily login | 10 |
| Refer a member | 200 |
| Sponsor placement | 1,000 |
| Article published | 150 |
| Reach leaderboard top 10 | 300 |

---

## Tier Unlock Summary

### Starter (0 pts)
- Costume: casual-default
- Props: mic-standard, glow-stick
- Zones: audience-seat, venue-walkway
- Perks: Basic avatar customization, standard reactions

### Rising (500 pts)
- Costume: + stage-performer, cypher-street
- Props: + mic-wireless, glow-wristband, sign-fan
- Zones: + front-row, cypher-circle
- Perks: Animated glow items, front row access

### Established (2,000 pts)
- Costume: + vip-elite, formal-gala
- Props: + sign-glowing, guitar-electric, guitar-acoustic
- Zones: + vip-balcony, backstage-zone
- Perks: VIP balcony, instrument props, priority seating

### Featured (7,500 pts)
- Costume: + contest-champion
- Props: + mic-golden, dj-headphones, trophy
- Zones: + green-room, sponsor-booth
- Perks: Golden mic, trophy prop, featured profile badge

### Legendary (25,000 pts)
- Costume: + legendary-icon (animated)
- Props: + confetti-cannon
- Zones: + stage-mark, contest-platform, interview-chair
- Perks: Animated aura, confetti cannon, legendary profile badge, priority in all rooms

---

## Memory / Personality System

The avatar memory system stores:

- Preferred pose style
- Preferred costume
- Preferred props
- Favorite venue zones
- Reaction history
- Attention patterns
- Crowd behavior preferences

This data is used to:
- Auto-select default pose on room join
- Suggest costume upgrades
- Personalize idle behavior
- Inform NPC crowd behavior patterns

---

## Copilot Wiring Notes

- Wire `getTierForPoints(points)` to user wallet/points balance
- Wire `getNextTier(tier)` to avatar upgrade notification
- Wire `getPointsToNextTier(tier, points)` to progress bar UI
- Wire tier change to costume/prop unlock notification
- Wire `AvatarMemoryProfile` to user profile save/load
- Wire memory profile to idle behavior defaults
"""

docs = [
    ('AVATAR_BEHAVIOR_MATRIX.md', behavior_matrix),
    ('AVATAR_COSTUME_AND_PROP_SYSTEM.md', costume_prop),
    ('AVATAR_VENUE_BINDING_MAP.md', venue_binding),
    ('AVATAR_UPGRADE_AND_EVOLUTION.md', upgrade_evolution),
]

for filename, content in docs:
    path = os.path.join(docs_dir, filename)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'CREATED: {path}')

print('\nAll 4 avatar docs created successfully.')
