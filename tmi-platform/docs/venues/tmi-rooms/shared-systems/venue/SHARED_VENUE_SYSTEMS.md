# SHARED VENUE SYSTEMS — COMPLETE PACK
## All Cross-Room Engines and Rules

---

# VENUE_EVOLUTION_ENGINE.md
## How Rooms Transform While People Are Inside

### Core Rule
Seats stay anchored.
The world transforms around the audience.
No hard cuts. No reloads. No lost immersion.

### Evolution Triggers
- Viewer count exceeds room capacity
- Artist crosses points milestone
- Performance score reaches threshold
- Scheduled upgrade event

### Transformation Stages
```
STAGE 1 — Living Room / Circle / Loft (Free/Green)
STAGE 2 — Bar / Studio / Meeting Hall (Bronze)
STAGE 3 — Nightclub / Showcase Lounge (Gold)
STAGE 4 — Premium Club / Mini Concert Hall (Diamond)
STAGE 5 — Concert Hall / Amphitheater (Signature)
STAGE 6 — World Stage (Global)
```

### Transformation Sequence (Per Upgrade)
```
1. Trigger condition met
2. Sound cue begins (soft, building)
3. Room lights dim briefly
4. Tier color wave moves through room
5. Walls begin to expand/morph
6. Ceiling lifts (if applicable)
7. New materials appear
8. Screen/stage grows
9. New lighting rigs drop/activate
10. Crowd reacts (looks around, cheers)
11. Celebration sound plays
12. New room tier locks in
13. Analytics log: upgrade event
```

### Seat Anchor System
- Seat position (row, slot) never changes during transformation
- Camera follows audience seat during morph
- Front row stays front row at every tier
- VIP stays VIP
- Only environment morphs around them

---

# TIER_TRANSFORMATION_ENGINE.md
## The Color + Animation + Sound System for Tier Changes

### Tier Color Ladder
| Tier | Color | Feel |
|---|---|---|
| Free | Green (#00FF88 soft) | Starter warmth |
| Bronze | Copper/Bronze (#CD7F32) | Upgrade glow |
| Silver | Silver/Ice (#C0C0C0) | Premium cool |
| Gold | Gold (#FFD700) | Prestige warm |
| Diamond | Diamond Blue-White (#B9F2FF) | Elite crystalline |

### Transformation Animation Per Tier

**Free → Bronze**
- Green edge fades
- Warm copper wave sweeps from corners inward
- Walls flex outward slightly
- Seating upgrades visually
- Sound: warm rising tone + small crowd cheer

**Bronze → Gold**
- Copper fades
- Gold shimmer wave from stage outward
- Ceiling lifts noticeably
- Lighting rigs appear/upgrade
- Sound: stronger fanfare + crowd swell

**Gold → Diamond**
- Gold warmth shifts to crystalline cool
- Blue-white sparkle trails across room
- Stage expands
- New lighting rigs drop from ceiling
- Sound: crystal shimmer + big crowd explosion

**Diamond → Signature**
- Diamond crystalline fades
- Warm prestige sweep (concert hall gold/red)
- Architecture fully revealed
- Chandelier appears
- Sound: orchestral swell + full crowd celebration

### Sound Design Per Tier
| Transition | Sound Character |
|---|---|
| Free → Bronze | Warm chime + modest crowd |
| Bronze → Gold | Rising fanfare + crowd swell |
| Gold → Diamond | Crystal shimmer + strong celebration |
| Diamond → Signature | Orchestral swell + full celebration |

### Celebration Moment
After transformation locks:
- Julius reacts (celebrates in appropriate mode)
- Tier badge flashes
- Crowd stands briefly
- Host may acknowledge (if present)
- "Welcome to [TIER NAME]" text moment

---

# VENUE_TIER_ENTRY_SYSTEM.md
## Starting Room by Tier

### Rule
Higher-tier users start in better rooms.
Lower-tier users still experience room evolution.
No one starts worse than "cool and intimate."

### Starting Room by Tier
| Tier | Starting Room | Max Capacity | Evolution Ceiling |
|---|---|---|---|
| Free/Green | Living Room, Circle, or Loft | 30 | Bronze rooms |
| Bronze | Bar, Studio, or Meeting Hall | 60 | Gold rooms |
| Gold | Nightclub or Showcase Lounge | 100 | Diamond rooms |
| Diamond | Premium Club or Mini Concert Hall | 200 | Signature rooms |
| Platinum/Signature | Concert Hall or Amphitheater | 1000+ | World Stage |

### Entry Animation
Each tier has a distinct entry feel:
- Free: Simple fade-in, warm glow
- Bronze: Door opens, crowd reveal
- Gold: Lights rise, neon sign activates
- Diamond: Velvet rope reveal, crystal entry
- Signature: Full cinematic entry sequence

---

# POINTS_TO_ROOM_MATRIX.md
## Point Thresholds for Room Access

| Points | Tier | Starting Room |
|---|---|---|
| 0–499 | Free | Living Room / Circle |
| 500–2,499 | Bronze | Small Bar / Studio |
| 2,500–9,999 | Gold | Small Nightclub |
| 10,000–24,999 | Diamond | Premium Club / Mini Hall |
| 25,000+ | Signature/Platinum | Concert Hall / Amphitheater |

### Points Earned From
- Watching events
- Voting/reacting
- Tipping
- Chat participation
- Attending premium events
- Completing challenges
- Bringing guests
- Streaks

---

# SEAT_ANCHOR_SYSTEM.md
## Ensuring Seats Stay Locked During Transformation

### How Seat Anchoring Works
1. Every seat has a fixed ID tied to the user's session
2. Seat ID maps to physical position (row, slot, tier)
3. During transformation: seat ID stays locked
4. Room morphs around the fixed seat coordinate
5. Camera stays on seat coordinate during morph
6. After transformation: seat re-renders in new room context

### What Stays Consistent
- Row position
- Seat class (front/VIP/general)
- Relative distance to stage
- Camera angle from that seat

### What Changes
- Seat appearance (upgrade with room)
- Room around seat
- Ceiling/walls/floor
- Stage size
- Screen size
- Crowd density cap

---

# SEATING_ENGINE.md
## Seat Types, Placement, and Logic

### Seat Classes
| Class | Where | Features |
|---|---|---|
| General | Rows 3+ | Standard view, good sightline |
| Premium | Rows 1–2 | Closest, largest view |
| VIP Box | Side elevated | Private angle, exclusive chat |
| Standing | Rear general | Energetic zone |
| Balcony | Upper rear | Full overview, cinematic |
| Elite Box | Reserved upper side | Top-tier premium |

### Seat Visual Progression
| Tier | Seat Style |
|---|---|
| Free | Sofas, folding chairs, stools |
| Bronze | Padded bar chairs, basic event seats |
| Gold | Lounge chairs, club seating |
| Diamond | Premium theater seats, VIP leather |
| Signature | Concert hall seats, velvet, full ergonomic |

---

# SIGHTLINE_RULES.md
## Non-Negotiable View Rules

1. Every seat has an unobstructed view of the stage and main screen
2. Rows elevate 0.5 units per row going backward
3. If an avatar blocks view: fade it to 30–50% opacity, keep outline
4. Screen visible from all seats at minimum 15% of field-of-view
5. Performer can see all seats from stage
6. Monthly Idol judges can see stage + contestants + each other
7. VIP Box sees both crowd and stage (45° angle)
8. Standing zone has full view over seated rows

---

# ROOM_BLUEPRINT_MASTER.md
## The Universal Room Formula

Every room in the system must have:
```
ENTRY ZONE     → where audience arrives
AISLE LANES    → navigation paths
SEATING BOWL   → tiered or curved seats
HOST ZONE      → default host positioning
STAGE SURFACE  → elevated or floor-level performance area
SCREEN WALL    → main performance screen
SIDE SCREENS   → scoreboard / reactions / sponsors
CROWN ZONE     → show title / round counter display
SPONSOR ZONES  → permitted placement areas
VEX LANE       → wing entry path (if applicable)
JULIUS ZONE    → floating, context-aware
EXIT PATH      → audience release flow
```

---

# ROOM_SIGNATURE_LAW.md
## What Cannot Change in Signature Rooms

1. Core structure stays recognizable
2. Seat bowl stays recognizable
3. Stage position stays recognizable
4. Only lighting, materials, overlays, effects, and screen tech evolve
5. Chandeliers, arches, railings stay as identity anchors
6. Color family stays in same family (gold concert hall stays warm/gold)
7. Name never changes

---

# ROOM_FAMILY_TREE.md
## Which Rooms Inherit From Which Base

```
BASE: INTIMATE SPACE
├── Living Room (Free)
├── Circle Room (Free)
└── Creator Studio (Bronze)

BASE: UNDERGROUND VENUE
├── Brick Loft (Free)
├── Small Bar (Bronze)
└── Meeting Hall (Bronze)

BASE: NIGHTLIFE VENUE
├── Small Nightclub (Gold)
├── Premium Nightclub (Diamond)
└── World Club (Signature variant)

BASE: PERFORMANCE HALL
├── Showcase Lounge (Gold)
├── Mini Concert Hall (Diamond)
├── Signature Concert Hall (Signature)
└── Premiere Theater (Signature)

BASE: OUTDOOR / MASSIVE
├── Amphitheater (Signature)
└── World Stage (Global)

BASE: COMPETITION
└── Battle / Cypher Arena (Signature)
```

---

# ROOM_NAMING_CANON.md
## Official Room Names (Locked)

| Code | Official Name | Tier |
|---|---|---|
| ROOM_FREE_01 | The Living Room | Free |
| ROOM_FREE_02 | The Circle | Free |
| ROOM_FREE_03 | The Loft | Free |
| ROOM_BRONZE_01 | The Back Room | Bronze |
| ROOM_BRONZE_02 | The Creator Studio | Bronze |
| ROOM_BRONZE_03 | The Meeting Hall | Bronze |
| ROOM_GOLD_01 | The Nightclub | Gold |
| ROOM_GOLD_02 | The Showcase Lounge | Gold |
| ROOM_DIAMOND_01 | The Premium Club | Diamond |
| ROOM_DIAMOND_02 | The Mini Concert Hall | Diamond |
| ROOM_SIG_01 | The Concert Hall | Signature |
| ROOM_SIG_02 | The Amphitheater | Signature |
| ROOM_SIG_03 | The Arena | Signature |
| ROOM_SIG_04 | The Premiere Theater | Signature |
| ROOM_SIG_WORLD | The World Stage | Global |

---

# VENUE_EXPANSION_BAR.md
## The Progression UI Element

During live events, a subtle expansion bar is visible:

```
[🟢]──────────────────────────── Progression Bar ────────────────────────────[🌍]
 Free    Bronze    Silver    Gold    Diamond    Signature    World
  ↑
 Current
```

- Fills based on: engagement, viewers, performance score
- Visible to artist and audience
- Tier upgrade triggers when it reaches next threshold
- Animates gently, not distracting
- Glows in current tier color

---

# ROOM_PROOF_CHECKLIST_MASTER.md
## A Room Pack Is Only Approved When ALL Pass:

- [ ] Stage visible from front, middle, and back seats
- [ ] Host can move without blocking audience
- [ ] Performer can see crowd
- [ ] All screens readable
- [ ] Lights animate on event triggers
- [ ] Curtains/doors animate where applicable
- [ ] Audio profile assigned and tested
- [ ] Camera views all functional
- [ ] Tier transformation sequence renders correctly
- [ ] Performance budget passes on target device
- [ ] Identity preserved after evolution
- [ ] No blank states or missing assets

---

*Shared Venue Systems v1.0 — BerntoutGlobal XXL / The Musician's Index*
