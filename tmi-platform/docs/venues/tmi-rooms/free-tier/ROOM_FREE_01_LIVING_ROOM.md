# FREE TIER — LIVING ROOM STREAM
## Room Pack — Complete 14-File Specification

---

# ROOM_IDENTITY.md

## Official Name
**The Living Room**
Tier: Free (Green)
Code: `ROOM_FREE_01`

## Concept
The smallest, most personal starting room.
An artist goes live for the first time and their closest fans join in a cozy, intimate digital living room.
It should feel like a friend's house — warm, slightly messy, real.
Not cheap-looking. Just humble-real.

## Feel
- Warm
- Personal
- Cozy
- "We just started"
- Authentic beginning

## Color Identity
- Base: warm amber, soft cream, dark wood tones
- Accent: subtle green glow (Free tier) on edges and trim
- Light: warm lamp-style light, soft overhead
- Screen: one small TV-scale screen or monitor wall

## Identity Law
This room must ALWAYS feel like a living space, not an empty office.
Even at baseline, it must feel intentional, not abandoned.

---

# ROOM_LAYOUT.md

## Dimensions (design reference)
- Width: small (20 units)
- Depth: medium-short (15 units)
- Ceiling height: low (cozy)

## Layout Map
```
╔══════════════════════╗
║  SCREEN / BACK WALL  ║
║  (TV or small screen)║
╠══════════════════════╣
║  SMALL STAGE ZONE    ║
║  (rug, floor area)   ║
╠══════════════════════╣
║  AUDIENCE ZONE       ║
║  (sofa / chairs)     ║
║  ROW 1: 4 seats      ║
║  ROW 2: 4 seats      ║
╠══════════════════════╣
║  ENTRY ZONE (back)   ║
╚══════════════════════╝
```

## Seat Count: 8–12 max
## Stage area: small floor zone (rug/hardwood)
## Entry: simple door rear or fade-in

---

# ROOM_SEATING_MAP.md

## Seating Philosophy
Seats feel like a real living room — sofas, armchairs, ottomans.
Not theater seats. Real furniture scaled and stylized.

## Seat Layout
```
ROW 1: Sofa seats (4) — closest to screen
ROW 2: Chair seats (4) — second tier (slight elevation)
EXTRAS: Floor cushions / overflow zone (2-4)
```

## Seat Tier
All seats: General (Free tier)
No VIP in this room — intimacy is the feature.

## Seat Appearance
- Comfortable-looking couch/chair aesthetic
- Warm fabric tones (green accent on arm rests = tier badge)
- No rigid theater seats
- Slight stylized premium quality (not ugly)

---

# ROOM_SIGHTLINES.md

## Sightline Rules
- All 12 seats have clear view of screen/performance zone
- No row is more than 10 units from stage
- No avatar blocks another's view
- Screen is at eye level or slightly above

## View From Each Zone
- Row 1 (sofa): Close, warm, see performer's face clearly
- Row 2 (chairs): Slightly elevated, full screen view
- Floor cushions: Ground level, energetic

## Performer View
- Artist sees 2 rows of faces
- Crowd feels close
- No dead space

---

# ROOM_STAGE_AND_SCREEN.md

## Stage Surface
- Type: Floor zone (no raised platform)
- Material: Stylized hardwood / plush rug area
- Size: Small (8×6 units)
- Glow: Subtle green edge glow (Free tier)

## Screen
- Type: TV-style single screen (wall mounted or freestanding)
- Size: Small-medium (proportional to room)
- Used for: Artist stream display when in screen mode
- Evolution: Screen upgrades with tier

## Stage Mode
- SCREEN_STAGE: Performer appears on TV screen
- AVATAR_STAGE: Small avatar stands in rug zone
- HYBRID: Screen + miniature avatar overlay

---

# ROOM_LIGHTING_AND_CURTAINS.md

## Lighting Profile
- Ambient: Warm lamp light (2-3 floor/table lamps)
- Accent: Soft green edge trim (Free tier identity)
- Performance: Small spotlight on stage zone
- Reactive: Lamps dim slightly during performance

## Curtains
- Style: Simple curtain on back window
- Animation: Gently sways in background (ambient only)
- No dramatic curtain reveal — this is a living room
- Tier upgrade will replace with proper stage curtains

## Doors
- Simple door — opens when artist goes live
- Closes when stream ends
- Subtle sound effect

## Lighting Events
```
idle         → warm lamp, ambient glow
stream start → lamps dim, screen brightens
high energy  → slight green pulse on walls
win moment   → warm light burst
stream end   → lights fade up, warm close
```

---

# ROOM_AUDIO_PROFILE.md

## Acoustic Character
- Room type: Small enclosed space
- Reverb: Short, warm, contained
- Feel: Like your friend's living room at night
- No stadium echo. No club bass. Just warm closeness.

## Audio Layers
| Layer | Description |
|---|---|
| Ambient | Soft room tone, slight warmth |
| Crowd | Gentle murmur, intimate |
| Performance | Artist audio centered, slightly intimate |
| Events | Subtle reactions, not loud |

## Sound Events
- Stream start: Small warm chime
- Reaction: Soft "aww" / small laugh / gentle clap
- Tier upgrade trigger: Rising warm tone (leads into transformation)
- Stream end: Gentle close tone

---

# ROOM_HOST_BLOCKING.md

## Host Presence in This Room
- No dedicated host in the Living Room
- Julius may appear in helper/ambient mode
- Artist acts as their own host
- Julius rule: appears small, to the side, never blocking screen

## Julius Position
- Corner of room, near screen wall
- Does not stand on stage zone
- May sit on a "cushion" in the corner
- Keeps very low energy in this room

## VEX
- VEX does NOT appear in Living Room (too small, wrong context)

---

# ROOM_CROWD_BEHAVIOR.md

## Crowd Energy Cap
Living room max energy: 60/100
(It's intimate — energy shows differently)

## Crowd Reactions
```
Arriving     → Fade in to seats, look around
Idle         → Relaxed head tilts, small conversation animations
Performance  → Forward leans, nodding, subtle reactions
High energy  → Small cheer, hand clap, leaning forward
Peak         → Standing (1-2 people), everyone clapping
Tier upgrade → Everyone looks around confused then excited
Stream end   → Gentle wave, fade out
```

## Crowd Density
Max 12 viewers displayed simultaneously.
If more than 12 join: queue system, others see waiting room indicator.

---

# ROOM_CAMERA_MAP.md

## Available Camera Views
| View | Description |
|---|---|
| STANDARD | Eye-level facing screen, sees 2 rows |
| SIDE | Slight angle, sees both audience and screen |
| OVERHEAD | Top-down bird's-eye of whole room |
| PERFORMER | Artist's POV looking at audience |
| CLOSE | Close on screen/performance zone |

## Camera Behavior
- Smooth, slow pans only
- No fast cuts (wrong for this room energy)
- Follows reactions gently
- Default: STANDARD view

---

# ROOM_ANIMATION_RULES.md

## What Animates (always)
- Lamp light flickers slightly
- Curtain sways gently
- Crowd members idle (head tilts, small shifts)
- Screen border breathes softly

## What Triggers Animation
- Stream start: lamps dim, screen glows on
- Reaction peak: soft green pulse on walls
- Tier upgrade: full room transformation begins
- Stream end: warm fade

## What Does NOT Animate (too much for this room)
- No moving spotlights
- No confetti
- No dramatic curtain sequences
- No VEX
- Julius stays subtle and minimal

---

# ROOM_EVOLUTION_PATH.md

## Living Room → Bronze Upgrade

### Trigger
- Viewer count exceeds 12
- Performance score reaches threshold
- Artist unlocks Bronze tier
- Points milestone reached

### Transformation Sequence
```
1. Green glow on walls fades
2. Walls begin to expand outward
3. Bronze warm tone enters from corners
4. Furniture morphs to bar/venue-style seating
5. Ceiling lifts slightly
6. Screen grows to proper venue scale
7. Floor transitions from carpet to polished bar floor
8. Crowd reacts (looks around, cheers)
9. Bronze upgrade celebration plays
10. Room locks into BRONZE_SMALL_BAR_01
```

### What Stays
- Seat positions (anchored)
- Artist position
- Stream continues uninterrupted

### What Changes
- Walls
- Ceiling
- Lighting
- Floor
- Screen size
- Crowd density cap (increases)

---

# ROOM_PERFORMANCE_BUDGET.md

## Living Room Budget
| Resource | Limit |
|---|---|
| Max avatars | 12 |
| Active animations | 3 simultaneous |
| Audio layers | 2 |
| FX streams | 1 |
| Julius instances | 1 (minimal mode) |
| Moving lights | 0 (lamps only) |

## Downgrade Triggers
If performance drops:
- Reduce crowd to 6 simplified avatars
- Disable curtain animation
- Switch to static lamp (no flicker)
- Julius goes silent/static

---

# ROOM_PROOF_CHECKLIST.md

## Living Room is complete when:
- [ ] All 8–12 seats visible from stage zone
- [ ] Screen visible from all seats
- [ ] Performer can see crowd
- [ ] Lamp lighting profile loads correctly
- [ ] Tier green accent visible on walls/trim
- [ ] Crowd idle animation works
- [ ] Tier upgrade sequence triggers correctly
- [ ] Bronze transformation renders correctly
- [ ] Julius appears in corner, non-blocking
- [ ] Audio profile: warm, contained
- [ ] Camera views all function
- [ ] Performance budget passes
- [ ] No blank moments during stream start/end

---

*Free Tier — Living Room Stream Pack v1.0*
*BerntoutGlobal XXL / The Musician's Index*
