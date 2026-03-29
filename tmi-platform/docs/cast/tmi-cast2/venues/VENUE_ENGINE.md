# VENUE_ENGINE.md
## Venue and Room System — Master Engine

---

## PURPOSE
Defines every venue where shows, battles, cyphers, and events take place.
Each venue is a living environment with its own seating, stage, audio, lighting, camera, and evolution rules.

---

## VENUE TYPES

### PERFORMANCE VENUES
| Venue | Capacity | Stage Size | Camera Style |
|---|---|---|---|
| Amphitheater | 500+ | Large, curved | Wide + dramatic |
| Concert Hall | 200–500 | Elevated center | Cinematic close |
| Arena | 1000+ | Full stage | Dynamic multi-cam |
| Festival Stage | Outdoor feel | Very large | Epic wide |

### UNDERGROUND / GRIT VENUES
| Venue | Capacity | Feel | Color Family |
|---|---|---|---|
| Basement | 20–50 | Tight, intense, cracked walls | Charcoal, rust, red-orange |
| Alley Stage | 30–80 | Raw, street | Dark concrete, neon |
| Warehouse | 100–300 | Industrial | Steel gray, orange flicker |
| Garage Studio | 10–30 | Intimate, DIY | Warm amber, concrete |

### SOCIAL VENUES
| Venue | Capacity | Feel | Color Family |
|---|---|---|---|
| Bar | 50–100 | Relaxed, social | Dark wood, warm neon |
| Lounge | 30–80 | Sophisticated | Deep purple, gold |
| Night Club | 200–500 | High energy | Black, magenta, violet |
| VIP Room | 10–30 | Exclusive | White, black, gold |

### COMPETITION VENUES
| Venue | Capacity | Special Feature |
|---|---|---|
| Cypher Arena | 100–300 | Circle stage |
| Battle Stage | 200–400 | Dual-zone |
| Elimination Room | 50–150 | Countdown display |
| Finals Dome | 500+ | Champion center |

### REWARD / PRIZE VENUES
| Venue | Feature |
|---|---|
| Prize Showroom | Pedestal displays, holographic items |
| Vault Room | Dramatic reveal doors |
| Trophy Hall | Glowing trophy cases |
| Reward Chamber | Stage lift platform |

---

## ROOM BLUEPRINT STRUCTURE

Every room must include:

```
ROOM SHELL
├── ENTRY ZONE         (audience enters here)
├── AISLE LANES        (navigation paths)
├── SEATING BOWL       (tiered rows, curved or angled)
├── HOST ZONE          (default host positioning)
├── PERFORMER STAGE    (elevated center focal point)
├── SCREEN WALL        (main performance surface)
├── SIDE SCREENS       (scoreboard, reactions, sponsors)
├── CROWN ZONE         (visual title / show name display)
├── SPONSOR SURFACES   (permitted placement zones)
├── VEX ENTRY LANE     (wing left/right)
├── JULIUS FLOAT ZONE  (everywhere, floating)
└── EXIT FLOW          (audience removal path)
```

---

## SIGHTLINE RULES (NON-NEGOTIABLE)

1. Every seat must see the stage
2. Rows rise slightly per row backward
3. If any avatar blocks sightline: fade to 30–50% opacity, keep outline
4. Screen must be readable from back row
5. Host must be visible from all seats
6. Performer must see full crowd (wide-angle view)
7. Monthly Idol judges must see stage + contestants + each other

---

## SEATING SYSTEM

| Seat Type | Placement | Feature |
|---|---|---|
| Standard | Rows 3+ | Full show view |
| Premium | Rows 1–2 | Closest, brightest view |
| VIP Box | Side elevated | Private angle, exclusive |
| Balcony | Upper rear | Full overview |
| Interactive | Designated zone | Future: reaction inputs |

---

## SCREEN SURFACE SYSTEM

| Screen | Placement | Function |
|---|---|---|
| Main Stage Screen | Center rear | Artist performance surface |
| Side Screens | Left/right of stage | Scoreboards, reactions, sponsor safe |
| Floor Screen | Stage floor | Optional effects |
| Crown Display | Above everything | Show title, round counter |

### Screen Stage Types
- LIVE_STAGE: 3D performer avatar on stage
- SCREEN_STAGE: Video/stream on main screen
- HYBRID: Screen + avatar overlay

---

## COLOR SYSTEM PER VENUE

| Venue | Base Color | Accent | Glow | Evolution Notes |
|---|---|---|---|---|
| Amphitheater | Midnight blue, dark navy | Cyan, gold | Electric white | Lighting evolves, structure stays |
| Concert Hall | Warm black | Amber, burgundy, gold | Warm fill | Materials upgrade over time |
| Night Club | Black, deep purple | Magenta, violet | Pink/blue neon | Fast evolution cycles |
| Basement | Charcoal, gray | Rust, red-orange | Flicker | Crack details evolve, not repaired |
| Prize Showroom | White, black contrast | Cyan, gold | Radiant soft | Display tech upgrades |
| Cypher Arena | Black, street concrete | Neon green, cyan | Hot floor glow | Pack-driven evolution |
| Vault Room | Black, steel | Gold, white | Dramatic spot | Reveal doors upgrade |

---

## VENUE EVOLUTION SYSTEM

Venues evolve through tiers — never redesigned, always enhanced:

| Version | Changes |
|---|---|
| V1 — Base | Basic room, functional lighting, standard screens |
| V2 — Enhanced | Better lighting rigs, improved screen resolution |
| V3 — Animated | Wall animations, interactive crowd effects |
| V4 — Reactive | Environment responds to show events |
| V5 — Premium Living | Fully alive environment, AI-reactive space |

**Evolution Rules:**
- Structure stays stable (same blueprint)
- Signature silhouette stays stable
- Seat layout mostly stays
- Lighting, materials, screen tech, crowd effects, pack overlays CAN evolve

---

## VENUE ANIMATION LAYER

### What Must Animate (always)
- Lights breathe in idle
- Screen displays subtle ambient motion
- Crowd has idle micro-movement
- Curtains move on show transitions

### Event-Triggered Animation
| Trigger | Animation |
|---|---|
| Show start | Curtain opens (slow or dramatic) |
| Win | Spotlight + color burst + crowd arms up |
| Fail | Dim pulse + show-specific fail reaction |
| Elimination | VEX entry lights change, crowd hush |
| Winner reveal | Gold spotlight + celebration FX |
| Show end | Curtain closes, house lights rise |

---

## ROOM PACK SYSTEM

Packs are seasonal/event overlays that sit on top of the base room:

| Pack | Activates On | Changes |
|---|---|---|
| Holiday Pack | Calendar events | Color scheme, decorations, sound |
| Battle Pack | Battle events | Aggressive lighting, battle graphics |
| Festival Pack | Summer/festival season | Outdoor feel, bright neon |
| Luxury Pack | Premium/VIP events | Gold overlay, silk textures |
| Retro Pack | Throwback issues | Vintage materials, old-school feel |
| Neon Pack | Feature shows | Full neon saturation mode |

**Pack Compatibility**: Not every pack fits every room.
Basement cannot accept Luxury Pack.
VIP Room cannot accept Festival Pack.

---

*Venue Engine v1.0 — BerntoutGlobal XXL*
