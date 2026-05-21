# BROADCASTER_SYSTEM_COMPLETE.md
## Show Broadcasters — Every Show Gets a Voice

---

## PURPOSE
Every show on The Musician's Index has its own broadcaster/announcer voice.
Not a generic robot. A personality with a character that fits the show type.

---

## BROADCASTER PROFILES

| Broadcaster ID | Personality | Show Type | Voice Style |
|---|---|---|---|
| `VEE_JAY_80` | High-energy, neon-soaked, 80s radio energy | World Concerts, Grand Events | Fast, hype, pop culture refs |
| `THE_SPECIALIST` | Smooth, technical, analytical | Cyphers, Battles | Deep, measured, lyric-aware |
| `INDEX_PRIME` | Cold, digital, authoritative | System announcements | Robotic-premium, declarative |
| `THE_ANCHOR` | Professional, warm, authoritative | News, Interviews, Monthly Idol | TV anchor smooth |
| `HYPER_JAY` | Chaotic good, unpredictable | Game Night, Deal or Feud | Game show energy |
| `SMOOTH_DOC` | Late night vibes, jazz-warm | Listening parties, premieres | Laid-back, sophisticated |

---

## SHOW → BROADCASTER ASSIGNMENT

| Show | Default Broadcaster | Backup |
|---|---|---|
| Deal or Feud 1000 | `HYPER_JAY` | `INDEX_PRIME` |
| Monthly Idol | `THE_ANCHOR` | `SMOOTH_DOC` |
| Circles & Squares | `THE_SPECIALIST` | `SMOOTH_DOC` |
| Weekly Cyphers | `THE_SPECIALIST` | `VEE_JAY_80` |
| Battle Night | `VEE_JAY_80` | `THE_SPECIALIST` |
| Stream & Win | `HYPER_JAY` | `VEE_JAY_80` |
| World Concert | `VEE_JAY_80` | `THE_ANCHOR` |
| Premiere Events | `SMOOTH_DOC` | `THE_ANCHOR` |
| Going Live | None (artist is own host) | `INDEX_PRIME` (if silence) |
| Crown Announcement | `VEE_JAY_80` | `THE_ANCHOR` |
| Grand Opening | `VEE_JAY_80` | All voices intro |

---

## BROADCASTER SCRIPT ENGINE

Real-time commentary generated based on:

```javascript
// Input signals → Script output
{
  hype_level: 87,        // crowd energy
  viewer_count: 342,     // total viewers
  top_tipper: "FanName", // biggest tip this session
  milestone_hit: true,   // crossed a threshold
  crown_transfer: false, // crown changing
  new_viewer: "JoeName"  // someone just joined
}

// Output examples per broadcaster
VEE_JAY_80: "UNBELIEVABLE! 342 faces in the house 
and the meter is REDLINING at 87%! 
Shout out to FanName for that MEGA-TIP!"

THE_SPECIALIST: "The crowd is engaged — 87% hype 
suggests strong lyrical connection with this performance."
```

---

## AUDIO CHAIN

All broadcasters use:
1. TTS Engine (ElevenLabs or equivalent)
2. Radio compression filter (80s FM sound)
3. Slight delay on live events (matches stream offset)
4. Audio Duck: music -20dB when broadcaster speaks
5. Foley bed: light static under broadcaster voice

---

## BROADCASTER HUD (Invisible to Audience)

What the host sees on their private view:
```
┌─────────────────────────────────────┐
│ BROADCASTER: VEE_JAY_80             │
│ Hype: ████████░░ 82%               │
│ Viewers: 342                        │
│ Top Tip: $120 from [Fan]            │
│ Next moment: Winner reveal in 45s   │
│ Bridge line ready: [▶ USE THIS]     │
│ [TRIGGER LOOT DROP]                 │
│ [CALL WAVE]                         │
│ [MUTE BROADCASTER]                  │
└─────────────────────────────────────┘
```

---

## GRAND OPENING SCRIPT (First Platform Launch)

```
[FX: VHS tape click]
[FX: Heavy 80s synth bass drop]

"LIVE... from The Musician's Index...
broadcasting across the satellite link 
and into your terminal...

Welcome to the FIRST ISSUE of 
THE MUSICIAN'S INDEX!

Look at this crowd — face-scanned 
legends in the stands, bobbling to 
the heartbeat of something new.

To the artists: your stage is hot.
To the fans: your Golden Crates are loaded.

We are 100% Functional.
100% Visual.
100% LOUD.

LET THE SIMULATION BEGIN!"

[FX: Crowd eruption + confetti burst]
```

---

# CANVAS_ENGINE_SYSTEM.md
## Movable Cards on Background Canvas

---

## PURPOSE
The platform is built on a card-canvas system.
Cards float on animated backgrounds.
Cards are draggable, resizable, and snap to grid.

---

## CARD TYPES

| Card Type | Used On |
|---|---|
| Artist Card | All pages |
| Video Card | Homepage 2, Live rooms |
| Audio Card | Homepage 3, profiles |
| Leaderboard Card | Homepage 3 |
| Sponsor Card | All pages |
| Countdown Card | Homepage 2 |
| News Ticker Card | Homepage 3 |
| Genre Card | Homepage 3 |
| Room Card | Homepage 2 |
| Stats Card | Dashboards |
| Crown Card | Homepage 1 |
| Comic Insert Card | Homepage 1 |
| Stream & Win Card | Homepage 2/3 |

---

## CARD BEHAVIOR SYSTEM

```javascript
// Card interaction states
IDLE:      float + slight ambient glow
HOVER:     scale(1.05) + rotate(1-2deg) + glow brightens
DRAG:      z-index top + drop shadow + cursor: grab
SNAP:      spring animation back to grid
CLICK:     flash + open section
UPDATE:    number count-up animation
LIVE:      pulse border (red if live)
```

---

## CANVAS BACKGROUNDS

| Page | Background |
|---|---|
| Homepage 1 | 80s geometric: purple + teal + gold shapes |
| Homepage 2 | Dark neon: black + neon accents + grid dots |
| Homepage 3 | Magazine desk: purple + teal + gold shapes |
| Dashboards | Dark control room: dark gray + orange/cyan |
| Rooms | Venue shell (per room tier) |
| Games | Arena: dark + neon split |

---

## CARD PERSISTENCE SYSTEM

When user moves a card:
1. New X,Y coordinates saved to DB
2. Layout saved per user per page
3. Reloads in same position next visit
4. "Reset Layout" button available
5. Each new issue can suggest new layout

---

# MAGAZINE_NAVIGATION_SYSTEM.md
## Magazine-Style Page Flow and Navigation Rules

---

## CORE PHILOSOPHY

The Musician's Index is a magazine, not a website.
Navigation should feel like reading a magazine.
Discovery should require engagement.
Jump shortcuts should exist for activity (games, live, lobby).

---

## PAGE FLIP ENGINE

```
Corner Peel:
  User hovers top-right corner of any homepage
  Page edge lifts, shows shadow/depth
  Click or hold → page peels back
  New page reveals underneath
  Sound: optional paper rustle

Bottom Strip:
  Row of page numbers (1, 2, 3) at bottom
  Click page number → page slides/flips
  Progress indicator shows current page

Swipe (mobile):
  Left swipe → next homepage
  Right swipe → previous homepage
  Over-scroll → spring back

Keyboard:
  → or ] = next page
  ← or [ = previous page
```

---

## READ PROGRESS SYSTEM

```
User opens magazine → position saved
User can "Continue Reading" from last page
Session-based for guests
DB-persistent for logged-in users
"Resume" card shows on homepage for logged-in users

Saved per user:
  - current_homepage: 1/2/3
  - current_article_slug
  - current_genre
  - current_issue_id
  - last_visited_timestamp
```

---

## SECTION JUMP RULES

### ALLOWED JUMPS (From Anywhere)
```
✅ Homepage 1/2/3 (cover/live/editorial)
✅ Live Lobby entrance
✅ Game sections
✅ Cypher Arena
✅ User Profile
✅ Dashboard
✅ Store
✅ Booking Portal
✅ Achievements
✅ Hall of Fame
✅ Stream & Win
```

### MAGAZINE FLOW ONLY (Requires Navigation)
```
🔒 Artist Discovery Pages (go through genre → flip → find)
🔒 Deep article pages (go through editorial → find)
🔒 Interview features (go through magazine → find)
🔒 Recap articles (go through issue → find)
```

---

## ARTICLE-PROFILE-LOBBY CHAIN

When user is reading magazine and finds an artist:
```
Article page
  → "View Artist Profile" button
    → Artist Profile (hub: media + stats + links)
      → "Preview Lobby" button (if artist live or upcoming)
        → Preview Lobby (lightweight room preview)
          → "Enter Room" button
            → Full live venue
```

This chain is the intended discovery path.

---

# SIMULATION_ENGINE_SYSTEM.md
## VHS/CRT + Haptics + Spatial Audio + Foley

---

## VISUAL SIMULATION LAYER (VHS/CRT)

Applied globally as post-processing:

```glsl
// vhs_tracking.frag
// Adds authentic 80s TV feel
uniform float scanlineIntensity = 0.03;  // Subtle, not aggressive
uniform float flickerRate = 0.02;
uniform float chromaticAberration = 0.002;

// Effects applied:
// 1. Scanlines (horizontal bars, very subtle)
// 2. Color bleeding (slight RGB separation)
// 3. Subtle brightness flicker
// 4. Occasional "tracking glitch" on camera cuts
```

**Important**: This is subtle, not full-screen chaos.
Option to disable in Settings (accessibility).

---

## FOLEY SOUND SYSTEM

```
/assets/foley/
  page_flip.wav        - Magazine page turning
  card_snap.wav        - Card snapping to grid
  card_hover.wav       - Subtle hover tone
  vhs_startup.wav      - First site load (optional)
  neon_hum.wav         - Ambient background
  crown_transfer.wav   - Crown handover
  tip_received.wav     - Tip sound
  loot_drop.wav        - Golden crate drop
  upgrade_sting.wav    - Room tier upgrade
  confetti_burst.wav   - Celebration
  crowd_murmur.wav     - Ambient venue sound
```

---

## HAPTIC BRIDGE (MOBILE)

```
Event → Vibration Pattern
Card snap to grid → 10ms light pulse
Tier upgrade → 200ms strong pulse
Tip received → 50ms double pulse
Loot drop → 100ms medium pulse
Bass drop in stream → sync with audio frequency
Crown transfer → 300ms ceremonial pulse
Page flip → 30ms gentle tap
```

---

## GLOBAL HUD STATUS BAR

Bottom of every page (thin strip):
```
COORD: 39.7285° N, 121.8375° W  |  SIGNAL: 100%  |  UPTIME: 04:22:14  |  ● LIVE: 8 streams
```

Optional, toggleable in settings.

---

## CRT WARM-UP (First Load)

When user first opens the site:
1. Screen starts black
2. Single white dot appears in center (like old TV)
3. Dot expands to fill screen
4. Platform fades in over 1.5 seconds
5. Optional: VHS startup sound

**This is skippable.** After first visit, replaced with normal load.

---

## PLATFORM READINESS STATE INDICATOR

On Homepage 2 (Live World):
```
● LIVE    = active streams happening (red pulse)
○ STANDBY = no active streams (dim amber)
⊗ OFFLINE = platform maintenance (gray)
```

When no one is live (Standby mode):
- Homepage 2 shows "Please Stand By" aesthetic
- 80s test pattern graphic behind cards
- Lo-fi synth-wave ambient track
- "Coming Soon" event countdown

---

*Broadcaster + Canvas + Navigation + Simulation v1.0 — BerntoutGlobal XXL*
