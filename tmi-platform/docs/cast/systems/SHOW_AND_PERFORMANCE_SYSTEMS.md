# CAST_WARDROBE_ENGINE.md
## Universal Wardrobe System for All Cast Members

---

## PURPOSE
Every cast member can change outfits. Outfits affect identity, personality accent,
and store/sponsor integration.

---

## OUTFIT SLOTS PER CHARACTER

| Slot | Description |
|---|---|
| default | Primary show signature look |
| premium | Special event / season upgrade |
| event | Battle/cypher/specific event |
| themed | Holiday/seasonal/throwback |
| sponsor | Brand partnership outfit |
| casual | Low-key mode |
| fallback | Lightweight sprite-safe version |

---

## ROTATION RULES

1. Same outfit cannot appear twice in a row for any character
2. Sponsor outfits must be pre-approved
3. Premium outfits reserved for high-tier events or feature moments
4. Mobile fallback is always the lightest version
5. VEX outfit never repeats back-to-back (strictest rule)

---

## STORE INTEGRATION

- All outfits are shoppable (link to TMI Store)
- VEX outfits generate an "outfit drop" notification on appearance
- Sponsor outfits generate co-branded moment
- Seasonal outfits unlock by calendar trigger
- Community-voted outfits can be unlocked through fan polls

---

# WARDROBE_PRODUCTION_PIPELINE.md
## How Outfits Are Built, Approved, and Deployed

---

## PIPELINE STAGES

```
1. CONCEPT ART
   - Initial sketch of outfit
   - Color palette defined
   - Brand-safety check

2. DESIGN BUILD
   - Base mesh clothing item
   - Texture and material
   - Color variants (min 2)
   - Sponsor overlay if applicable

3. CHARACTER FIT
   - Outfit applied to character rig
   - Physics simulation (chains, fabric, accessories)
   - Walk/run/sit/dance test

4. ANIMATION TEST
   - Verify no clipping in all key animations
   - Verify prop-hold positions clear clothing
   - Verify seated positions work (Idol hosts)

5. SPRITE EXPORT
   - 8-direction sprite set generated
   - Lightweight fallback versions

6. STORE LISTING
   - Product image generated from character wearing it
   - Price assigned
   - Category tagged

7. DEPLOY
   - Added to wardrobe rotation pool
   - Activation conditions set (event, season, sponsor)
```

---

# COSTUME_ROTATION_RULES.md
## Rules for When Outfits Change

---

## ROTATION LOGIC

1. Track last 3 outfits worn per character
2. Block any outfit used in last 3 appearances
3. Event type influences category selection (battle → battle-appropriate)
4. Sponsor events pull sponsor outfits to top of queue
5. Seasonal triggers auto-activate themed outfits
6. Random selection from remaining eligible outfits

## SIGNATURE PROTECTION
Even when changing outfits, keep the character recognizable:
- Bobby: always some gold accent
- Meridicus: always slick / premium
- Aiko: always some brightness/color pop
- Zahra: always some elegance/jewelry
- Nova: always stage-energy aesthetic
- VEX: always costume-complete (no partial looks)

---

# SHOW_FORMAT_LIBRARY.md
## Every Show Type — Rules, Hosts, Props, Format

---

## DEAL OR FEUD 1000
- **Primary Host**: Bobby Stanley
- **Mobility**: Free-Roam
- **Core Mechanic**: Deal door reveal vs. Feud answer board
- **VEX**: No
- **Julius**: Assist mode (hint drops)
- **Sponsor Slots**: Pre-show, mid-show, prize sponsor
- **Props**: Deal door, feud board, answer cards, microphone
- **Pacing**: Medium-fast, crowd-reactive

## CIRCLES & SQUARES
- **Primary Host**: Timothy Hadley
- **Mobility**: Free-Roam
- **Core Mechanic**: Puzzle/strategy game
- **VEX**: No
- **Julius**: Hint mode
- **Props**: Strategy board, piece markers, timer
- **Pacing**: Medium, strategic

## MONTHLY IDOL
- **Primary Hosts**: Meridicus James, Aiko Starling, Zahra Voss (all three, panel)
- **Mobility**: Anchored (seated panel)
- **Core Mechanic**: Performance competition, judge scoring
- **VEX**: No
- **Julius**: Background helper
- **Props**: Score paddles, judge monitor, mic stand
- **Pacing**: Slow-medium, emotional

## MARCEL'S MONDAY NIGHT STAGE
- **Primary Host**: Nova Blaze
- **Mobility**: Full Free-Roam
- **Core Mechanic**: Stage performance, elimination
- **VEX**: YES — active stage removal
- **Julius**: Crowd hype mode
- **Props**: Stage mic, crowd hype meter, VEX trigger
- **Pacing**: Fast, electric

## BATTLES (all types)
- **Hosts**: Rotation pool (all eligible)
- **Mobility**: Free-Roam
- **Types**: Singer, Dancer, Drummer, Comedian, Pianist
- **VEX**: Optional
- **Julius**: Hype mode
- **Pacing**: Fast, reactive

## CYPHERS
- **Hosts**: Rotation pool (Meridicus, Nova, Aiko preferred)
- **Mobility**: Free-Roam
- **Core Mechanic**: Open performance circle, freestyle
- **VEX**: No
- **Julius**: Crowd mode
- **Pacing**: Fast, musical

## DIRTY DOZEN
- **Hosts**: Rotation pool (all eligible)
- **Mobility**: Free-Roam
- **Core Mechanic**: 12-round elimination competition
- **VEX**: YES
- **Julius**: Score tracking mode
- **Pacing**: Fast, competitive

---

# STAGE_ZONE_MAP.md
## Physical Stage Geography

---

## ZONE DEFINITIONS

```
╔══════════════════════════════════════════════════════╗
║                  CROWN ZONE (top)                    ║
║                  Scoreboard / Titles                 ║
╠══════════════════════════════════════════════════════╣
║  WING L         STAGE CENTER          WING R         ║
║  VEX Entry  │  HOST WALK ZONE    │  VEX Exit         ║
║             │  CONTESTANT ZONE   │                   ║
╠══════════════════════════════════════════════════════╣
║         JUDGE PANEL / ANCHOR ZONE                    ║
║     (Meridicus / Aiko / Zahra in Idol mode)          ║
╠══════════════════════════════════════════════════════╣
║              AUDIENCE-FACING RAIL                    ║
╚══════════════════════════════════════════════════════╝
  Julius assist zone: everywhere, floating
```

## ZONE RULES

| Zone | Who Can Enter |
|---|---|
| Crown | No characters (display only) |
| Stage Center | Free-Roam hosts, contestants |
| Contestant Zone | Contestants + approaching host |
| Anchor Zone | Monthly Idol hosts (Anchored class) |
| Wing L/R | VEX only |
| Audience Rail | Nova (crowd engagement) |
| Everywhere | Julius (floating) |

---

# CAST_PERFORMANCE_BUDGET.md
## System Performance Limits for Cast

---

## CONCURRENT LIMITS

| Resource | Max |
|---|---|
| Full avatars on screen | 4 |
| Active audio sources | 3 |
| Active FX streams | 2 |
| Active lip-sync rigs | 2 |
| Julius clones | 4 total |

## DOWNGRADE TRIGGERS

| Condition | Action |
|---|---|
| CPU > 80% | Switch to sprite mode |
| Memory > 70% | Disable background FX |
| Network lag > 500ms | Reduce clone count |
| Mobile device | Auto-use lite mode |

## LITE MODE

In lite mode:
- Characters use sprite sheets instead of full avatar
- No clone/split effects
- Simplified emotion (face only)
- Reduced FX
- Lower audio resolution
- No simultaneous multi-host rendering

---

# CAST_FALLBACK_HIERARCHY.md
## Fallback Chain When Resources Are Limited

---

## HIERARCHY

```
Level 1: PREMIUM
- Full 3D/high-detail avatar
- All animations
- All FX
- Full lip sync
- Full audio

Level 2: STANDARD
- Standard avatar
- Core animations
- Basic FX
- Lip sync
- Audio

Level 3: SPRITE-ASSISTED
- Sprite character
- Limited animation set
- Minimal FX
- Basic expression
- Audio

Level 4: SPRITE-ONLY
- Static-with-blink sprite
- Reaction sprites
- No FX
- Text speech bubble
- Audio

Level 5: SILENT FALLBACK
- Static sprite
- No animation
- No audio
- Text-only
```

---

*Show Format, Stage, Performance Budget v1.0 — BerntoutGlobal XXL*
