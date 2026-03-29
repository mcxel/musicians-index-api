# VENUE_AI_CONDUCTOR.md
## The Pacing Brain for Every Live Event

---

## PURPOSE
Controls the pacing, energy management, and progression of every event.
Without this, events feel unpaced or stagnate.
The AI conductor keeps things moving and alive.

---

## WHAT THE CONDUCTOR CONTROLS

- When to trigger crowd energy boosts
- When the room is ready for tier upgrade
- When Julius should step in
- When to suggest camera cuts
- When to fill dead air
- Pacing of transformations (not too soon, not too late)
- Show segment timing

---

## PACING LOGIC

```
EVENT START
    ↓ 0–2 min: Build phase (energy rises, crowd settles)
    ↓ 2–8 min: Active phase (event core)
    ↓ 8–12 min: Peak phase (energy peaks, transformation eligible)
    ↓ 12+ min: Sustained phase (maintain energy, plan close)
    ↓ CLOSE: Wind-down + outro sequence
```

---

## TIER UPGRADE TIMING

The conductor decides WHEN to trigger tier upgrade based on:
- Viewer count sustained above threshold for 90 seconds
- Crowd energy above 75 for 60 seconds
- Artist points milestone crossed
- Manual trigger from artist

**Never triggers during:**
- Critical performance moment (artist mid-song)
- VEX escort sequence
- Winner reveal
- Total silence / dead-air window

---

## CONDUCTOR STATE MACHINE

```
IDLE        → waiting, monitoring
BUILDING    → energy is rising
ACTIVE      → event running nominally
PEAK        → high energy, upgrade eligible
UPGRADING   → transformation in progress (locked)
RECOVERING  → post-upgrade, crowd settling
CLOSING     → wrap-up sequence
ENDED       → event complete
```

---

# CROWD_AI.md
## Making the Audience Feel Alive and Real

---

## PURPOSE
The crowd is never a passive backdrop.
The Crowd AI drives audience behavior to feel like real people reacting in real time.

---

## CROWD PERSONALITY TYPES

Different sections of the crowd have different behaviors:

| Section | Personality | Behavior |
|---|---|---|
| Front row | Most engaged | First to react, loudest |
| Mid rows | Balanced | React 1–2 seconds after peaks |
| Back rows | More reserved | Wave reactions, arms up at peaks |
| Balcony | Casual-premium | Measured reactions |
| Standing zone | Most energetic | Earliest to jump/stand |
| VIP Box | Premium restrained | Subtle but visible |

---

## CROWD REACTION CHAIN

When an event trigger fires:

```
EVENT TRIGGER
    ↓
Front row reacts (instant)
    ↓ 0.5s delay
Mid rows react
    ↓ 0.8s delay
Back rows react
    ↓ 1s delay
Balcony reacts
```

This wave effect makes the crowd feel real instead of robotic.

---

## CROWD ENERGY DECAY

Energy does not stay at 100 forever:
- After peak: energy decays 2 points/second
- During quiet moments: decays 5 points/second
- Minimum floor: 20 (never dead)
- Julius can pump +10 on trigger
- Artist hype call: +15
- Host crowd warm-up: +20

---

## CROWD REACTION LIBRARY

| Trigger | Crowd Reaction |
|---|---|
| Artist enters | Standing welcome |
| Strong performance moment | Forward lean + cheer |
| Beat drop | Arms up front section |
| Win | Full eruption |
| Fail | Collective groan/gasp |
| Tier upgrade | Look around → full cheer |
| Tip moment | Ripple of clapping |
| Silence | Settle, focus, quiet |
| Concert mode | Phone lights (flashlight effect) |
| VEX approaching | Crowd parts, some laugh |
| Winner announce | Standing ovation |

---

## BOOING SYSTEM (BATTLES ONLY)

In battle events, booing is a legitimate crowd reaction:
- Triggered by: weak performance, overtime, crowd vote
- Visual: crowd head-shaking, down-pointing
- Audio: soft boo sound (not aggressive)
- Julius reaction: sheepish look, side glance
- Host response: acknowledges and redirects

---

# HOST_ASSIST_AI.md
## AI Support Layer for Every Host

---

## PURPOSE
Assists hosts with real-time cues, pacing guidance, and script suggestions.
Hosts never feel lost. Dead air is caught before it happens.
The assist AI is invisible to the audience.

---

## WHAT THE HOST ASSIST AI DOES

| Function | Description |
|---|---|
| Pacing monitor | Warns if segment is running long |
| Dead air detector | Alerts host after 5s of silence |
| Crowd energy feed | Shows host their crowd energy level |
| Script suggestions | Optional suggested lines based on moment |
| Contestant memory | Reminds host of contestant's prior answers |
| Score tracking | Keeps score visible in host HUD |
| Segment timer | Countdown per round/segment |
| Emergency fills | Suggests a bridge line if host freezes |

---

## HOST HUD (What Host Sees, Not Audience)

```
┌─────────────────────────────────────┐
│ ENERGY: ████████░░  80%             │
│ VIEWERS: 342 across 3 venues        │
│ SEGMENT: Round 2 · 1:24 remaining   │
│ TIPS: $240 received                 │
│ JULIUS: Ready (tap to activate)     │
│ VEX: Standby                        │
│ CROWD: HYPE ▲                       │
│ NEXT: Winner reveal in 30s          │
│ [BRIDGE LINE READY] ▶               │
└─────────────────────────────────────┘
```

---

## ANTI-DEAD-AIR SYSTEM

If silence exceeds 5 seconds during a live event:

```
5s silence:
    → Host HUD flashes: "Bridge or Julius?"
    → Bridge line suggestion appears

8s silence:
    → Julius activates automatically (if host hasn't responded)
    → Julius deploys tip card OR poll board
    → Crowd ambient audio softens

15s silence:
    → Host receives urgent prompt
    → Julius steps up to helper mode
    → Music transitions to ambient filler
    → Conductor AI flags for pacing correction

30s silence:
    → Automatic bridge sequence plays
    → Host receives override to take back control
```

---

# CAMERA_DIRECTION_ENGINE.md
## Auto and Manual Camera System

---

## PURPOSE
Controls every camera angle and cut during live events.
Without this, everything looks flat.
The camera tells the story of what's happening.

---

## CAMERA POSITIONS PER ROOM TYPE

| Room Size | Available Cameras |
|---|---|
| Intimate (Free) | 4 cameras |
| Small (Bronze) | 5 cameras |
| Club (Gold) | 6 cameras |
| Hall (Diamond) | 7 cameras |
| Signature | 8+ cameras |
| World Stage | 12+ cameras |

---

## STANDARD CAMERA SET

| Camera | Angle | Used For |
|---|---|---|
| WIDE_ROOM | Full room from rear | Default idle |
| STAGE_FRONT | Close on stage, audience in back | Performance |
| CROWD_LEVEL | At audience level looking at stage | Hype moments |
| ARTIST_POV | From stage looking at crowd | "I see my fans" moments |
| REACTION | Close on crowd reaction | Win/fail/surprise |
| VIP_BOX | From VIP box angle | Premium feel |
| OVERHEAD | Bird's-eye | Orientation + epic |
| CLOSE_STAGE | Tight on performance | Emotional/key moments |

---

## AUTO-DIRECTION RULES

The camera director AI selects cuts based on:

| Event | Camera Suggestion |
|---|---|
| Idle | WIDE_ROOM |
| Performance building | STAGE_FRONT |
| Energy spike | CROWD_LEVEL |
| Artist solo moment | CLOSE_STAGE |
| Big reaction | REACTION (quick cut) |
| Winner reveal | STAGE_FRONT → ARTIST_POV |
| Tier upgrade | OVERHEAD then CROWD_LEVEL |
| VEX entrance | CROWD_LEVEL then tracks VEX |
| Julius split | Follows main Julius |

---

## CUT TIMING RULES

| Moment | Cut Timing |
|---|---|
| Normal progression | Every 8–15 seconds |
| High energy | Every 3–6 seconds |
| Emotional/quiet | Holds up to 30 seconds |
| Transformation | 2 second hold then OVERHEAD |
| Never cut during | Winner reveal payoff |

---

# AUDIO_ENVIRONMENT_ENGINE.md
## Making Every Room Sound Different

---

## PURPOSE
The same performance sounds different in every venue.
This makes the room evolution feel real — not just visual.

---

## ACOUSTIC PROFILES

| Room | Reverb | Bass | Crowd | Feel |
|---|---|---|---|---|
| Living Room | Short, warm, dry | Minimal | Intimate murmur | Kitchen party |
| Circle Room | Medium, concrete | Light | Surrounding | Underground |
| Loft | Medium-short, brick | Present | Close, energetic | Raw venue |
| Bar Back Room | Warm, medium | Warm | Social chatter | Local bar |
| Creator Studio | Crisp, clean | Flat | Quiet | Recording |
| Meeting Hall | Clean, medium | Neutral | Polite | Presentation |
| Nightclub | Big, bass-heavy | Maximum | Loud, electronic | Club night |
| Showcase Lounge | Warm, lush | Medium | Refined | High-end |
| Premium Club | Massive bass, deep | Maximum | Dense crowd | Premium night |
| Mini Concert Hall | Rich, spacious | Present | Concert crowd | Real show |
| Concert Hall | Full, warm, deep | Rich | 340 people | Landmark show |
| Amphitheater | Wide, outdoor | Open | Massive outdoor | Festival |
| World Stage | Cosmic, infinite | Infinite | Global crowd | History |

---

## AUDIO TRANSITION DURING UPGRADE

When room transforms tier:

```
Current room acoustic → brief crossfade (2s) → new room acoustic
```

This matches the visual transformation timing.

The moment the walls expand and the room changes:
- Bass deepens
- Reverb tail grows
- Crowd volume increases
- Everything sounds bigger

---

## AUDIO LAYER MANAGEMENT

```
Layer 1: Background music (show theme)
Layer 2: Crowd ambient (always on, scales with energy)
Layer 3: Performance audio (artist)
Layer 4: Event SFX (one-shots: win, fail, cheer)
Layer 5: Julius audio (above everything)
Layer 6: Character audio (host speech, VEX proximity)
```

**Priority**: Layer 6 > Layer 5 > Layer 4 > Layer 3 > Layer 2 > Layer 1

---

*AI Conductors + Camera + Audio v1.0 — BerntoutGlobal XXL*
