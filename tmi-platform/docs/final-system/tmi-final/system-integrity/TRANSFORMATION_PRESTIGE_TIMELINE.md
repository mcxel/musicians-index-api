# TRANSFORMATION_EFFECTS.md
## The "YAY" Moment — Tier Upgrade Celebration System

---

## PURPOSE
This is the signature platform moment.
When a room upgrades, it must feel magical, earned, and memorable.
Not a UI notification. Not a loading screen.
A real moment that the audience experiences together.

---

## THE TRANSFORMATION SEQUENCE (EXACT)

```
STEP 1 — TRIGGER (0s)
  Tier threshold crossed
  Conductor AI confirms moment is right
  Transformation flag locked

STEP 2 — AUDIO DIP (0–0.4s)
  Background music volume drops 30%
  Creates anticipation

STEP 3 — ROOM LIGHTS DIM (0.4–0.8s)
  All room lights dim 50%
  Subtle "something is happening" feeling

STEP 4 — TIER COLOR WAVE (0.8–2.5s)
  New tier color sweeps from stage outward
  Free→Bronze: copper wave
  Bronze→Gold: gold shimmer
  Gold→Diamond: crystal blue-white trail
  Diamond→Signature: prestige warm sweep

STEP 5 — STRUCTURAL MORPH (2.5–6s)
  Walls expand outward
  Ceiling lifts (if applicable)
  Stage extends/grows
  Screen size increases
  New seating/trim appears
  Materials upgrade

STEP 6 — LIGHTING UPGRADE (4–7s)
  New lighting rigs drop or activate
  New tier color locks in
  Full brightness returns — now more powerful

STEP 7 — CROWD REACTION (6–8s)
  Crowd looks around (wave delay as before)
  Crowd erupts
  Arms up
  Cheering audio

STEP 8 — CELEBRATION SOUND (7s)
  Main celebration sting plays
  "YAY" energy — tier-specific sound
  Confetti burst (Gold+)
  Light explosion

STEP 9 — TIER BADGE FLASH (8–9s)
  New tier name + icon appears briefly
  "Welcome to Gold" style moment
  Julius celebrates

STEP 10 — LOCK IN (9–10s)
  New room state confirmed
  Transformation flag cleared
  State writes new tier to global state
  Analytics log: upgrade event + timestamp
```

---

## TIER-SPECIFIC CELEBRATION EFFECTS

### Free → Bronze
- Warm copper light sweep
- Small crowd cheer
- Modest confetti (10 pieces)
- Julius: proud pose
- Sound: warm fanfare + modest "yeah"

### Bronze → Gold
- Gold shimmer wave
- Bigger crowd cheer
- Confetti burst (50 pieces)
- Julius: celebrate + split-pop echo
- Sound: stronger fanfare + crowd swell
- Screen flash: gold pulse

### Gold → Diamond
- Crystal blue-white sparkle trail
- Major crowd explosion
- Confetti + light burst (200 pieces)
- Julius: full celebration + clone pop
- Sound: crystal shimmer + big crowd hit
- Stage glow: crystalline shimmer

### Diamond → Signature
- Prestige warm sweep + chandelier reveal
- Full standing ovation
- Confetti cannon (500 pieces)
- Julius: maximum celebration mode
- Sound: orchestral swell + full crowd
- Room: full reveal animation

---

## TRANSFORMATION GUARDRAILS

Never trigger during:
- Artist mid-performance (unless critical threshold)
- VEX escort sequence
- Winner reveal moment
- Total dead air window
- Another transformation still in progress

---

# PRESTIGE_OVERLAY_SYSTEM.md
## Visual Status and Tier Identity Across All Surfaces

---

## PURPOSE
Higher-tier users and events must feel and look different.
Prestige is visible — in seats, in name tags, in entries, in the room itself.

---

## TIER VISUAL IDENTITY

| Tier | Seat Glow | Name Badge | Entry Animation |
|---|---|---|---|
| Free | Soft green edge | Simple text | Fade in |
| Bronze | Copper arm rest glow | Bronze frame | Door opens |
| Gold | Gold trim, subtle shimmer | Gold frame + glow | Lights rise |
| Diamond | Crystalline edge sparkle | Diamond frame + aura | Velvet reveal |
| Signature | Prestige warm radiance | Prestige badge + glow | Cinematic entry |

---

## VIP BADGE SYSTEM

Visible above each user's avatar:
- Tier badge icon (small, tasteful)
- Username (short)
- Special badges: Top Tipper, MVP Fan, Season Regular
- Artist badges: Indexed Artist, Rising, Trending, Featured

---

## ENTRY EXPERIENCE PER TIER

When user enters a live event:

**Free:**
Fade in → appear in seat → ambient room audio

**Bronze:**
Door opens → walk to seat → small crowd acknowledgment

**Gold:**
Lights rise in seat section → shimmer on arrival → subtle crowd notice

**Diamond:**
Velvet-rope moment → crystal spark on seat → crowd sees VIP arrival

**Signature:**
Cinematic entry → full spotlight moment → crowd reacts → seat glows

---

# EVENT_TIMELINE_ENGINE.md
## Controlling Show Progression and Timing

---

## PURPOSE
Events must progress at the right pace.
The timeline engine controls how shows move from segment to segment.

---

## TIMELINE STRUCTURE

```
PRE_SHOW
  ├── Venue loads
  ├── Seats fill
  ├── Countdown timer
  └── Pre-show ambient

INTRO
  ├── Curtain/opening
  ├── Host entrance
  └── Opening line

BODY
  ├── Segment 1 (round/performance/battle)
  ├── Transition
  ├── Segment 2
  ├── ...
  └── Segment N

CLIMAX
  ├── Final round
  ├── Score reveal
  └── Winner determination

OUTRO
  ├── Winner celebration
  ├── Closing remarks
  ├── Tier analytics update
  └── Audience release
```

---

## SEGMENT TIMING STANDARDS

| Event Type | Segment Duration |
|---|---|
| Deal or Feud | 5–8 min/round |
| Monthly Idol | 3–5 min/performance |
| Battle | 2–3 min/round |
| Going Live | Artist-controlled |
| World Concert | Artist-controlled |
| Cypher | 2 min/rotation |

---

## TIMELINE OVERRIDE RULES

The artist or Big Ace can override:
- Extend segment timer
- Skip to next segment
- Trigger early close
- Force tier upgrade moment
- Insert special segment

Marcel can suggest overrides (routes to Big Ace for execution).

---

# INPUT_OUTPUT_PIPELINE.md
## How User Actions Become System Responses

---

## PURPOSE
Every action a user takes must produce the right response in the right system.
No action should disappear silently.

---

## INPUT → OUTPUT TABLE

| User Action | System Response | Visible Effect |
|---|---|---|
| Clap | +2 crowd energy | Clap animation + sound layer |
| Cheer (hold) | +5 crowd energy | Crowd cheer audio swell |
| Tip ($5) | Artist revenue | Coin pop + thank-you flash |
| Tip ($50+) | Artist revenue + special | Julius celebration + coin shower |
| Vote (poll) | Poll count update | Bar updates in real time |
| React (emoji) | Emoji floats on screen | Emoji animation |
| Stand up | Avatar stands | Others can see |
| Flashlight | Light effect | Visible in venue |
| Chat message | Moderated display | Scrolling feed |
| Share clip | Platform share | Share animation |
| Bookmark | Saved to profile | Bookmark flash |
| Seat upgrade | Payment | Seat teleport + new view |

---

## ARTIST INPUT → OUTPUT TABLE

| Artist Action | System Response |
|---|---|
| "Level up venue" | Conductor AI checks readiness → triggers upgrade |
| "Address [City]" | Venue notification + crowd reaction in that venue |
| Trigger Julius | Julius activates in artist's chosen mode |
| Open poll | Julius deploys poll board |
| End stream | Outro sequence begins |

---

*Transformation FX + Prestige + Timeline + Input/Output v1.0 — BerntoutGlobal XXL*
