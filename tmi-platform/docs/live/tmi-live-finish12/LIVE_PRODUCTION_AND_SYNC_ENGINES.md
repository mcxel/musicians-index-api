# LIVE_PRODUCTION_ENGINE.md
## The Engine That Runs All Live Events

---

## PURPOSE
Controls all live events from artist going live to global world concerts.
The production engine is what makes the live experience feel like a real show.

---

## LIVE PRODUCTION LAYERS

```
LAYER 1: ARTIST SIGNAL
- Artist initiates live event
- Signal type: stream / avatar / hybrid

LAYER 2: VENUE ASSIGNMENT
- Platform assigns venues based on tier
- Audience directed to venue(s)
- Overflow venues activated if needed

LAYER 3: ENVIRONMENT LOAD
- Venue shell loads
- Seating fills
- Audience avatars appear
- Ambient audio begins

LAYER 4: PRE-SHOW
- Countdown timer
- Pre-show music
- Julius in welcome mode
- Sponsor surfaces activate

LAYER 5: LIVE START
- Artist signal arrives
- Stage or screen activates
- Intro FX fires
- Host enters (if applicable)

LAYER 6: LIVE LOOP
- Artist performs
- Audience reacts
- Crowd energy updates
- Julius assists
- Tips/votes process
- Lights respond to energy

LAYER 7: EVENT END
- Artist ends stream
- Outro sequence
- Crowd release
- Analytics log
- Rank/momentum update
```

---

## LIVE EVENT TYPES AND PRODUCTION MODE

| Event | Production Mode | Complexity |
|---|---|---|
| Simple Going Live | Minimal | Venue + screen + crowd |
| Cypher | Medium | Circle stage + host + crowd vote |
| Battle | Medium | Dual zone + host + scoreboard |
| Live Stream | Standard | Venue + screen + full crowd |
| Concert | Full | Multi-venue + avatar/screen + FX |
| World Concert | Maximum | Global multi-venue + sync |
| Premiere | Cinematic | Theater + MC + release sequence |

---

## REAL-TIME PRODUCTION SIGNALS

During a live event, the production engine sends signals to all systems:

| Signal | Receiving System | Effect |
|---|---|---|
| `CROWD_PEAK` | Lighting Engine | Color burst |
| `TIP_RECEIVED` | FX Engine | Coin pop + thank-you |
| `VOTE_COMPLETE` | Julius | Deploy result board |
| `ARTIST_HYPE` | Crowd System | Energy meter pump |
| `ELIMINATION` | VEX System | VEX warning begins |
| `WINNER` | All systems | Full celebration sequence |
| `STREAM_END` | Venue Engine | Release sequence |
| `CHAT_FLOOD` | Moderation Bot | Filter + display |

---

# MULTI_VENUE_SYNC_ENGINE.md
## Keeping All Venues in Sync During World Concerts

---

## PURPOSE
When the same performance plays in multiple venues simultaneously,
every venue must feel identical in timing, energy, and experience.

---

## SYNC PROTOCOL

```
WORLD STAGE (source)
    ↓ broadcast signal
SYNC ENGINE
    ↓ distributes to all venues
Venue 1 + Venue 2 + Venue 3 + ... Venue N
    ↓ all receive at same timestamp
All venues DISPLAY simultaneously
```

---

## WHAT IS SYNCED ACROSS VENUES

| Element | Synced? | Notes |
|---|---|---|
| Artist audio | YES | Same stream to all |
| Artist video/avatar | YES | Same timestamp |
| Lighting moments | YES | Light cues sync globally |
| FX triggers | YES | Confetti/fireworks fire everywhere |
| Global crowd meter | YES | Aggregated across all venues |
| Reaction explosions | YES | When 10K react, all venues feel it |
| Individual audience reactions | NO | Local per venue |
| Chat | NO | Local per venue |

---

## LATENCY RULES

Max acceptable sync drift: 500ms
If a venue drifts beyond that:
- Auto-resync
- Brief freeze frame
- Catch up and rejoin

---

## GLOBAL VIEWER DISPLAY

During World Concerts, every venue shows:
- Total live viewers globally (all venues combined)
- A rolling "cities live" display
- Each city that has a venue active gets a pin
- The pin grows as more people join from that city

---

# VENUE_CROWD_ANIMATION_ENGINE.md
## How Crowds Move, React, and Feel Alive in Every Venue

---

## PURPOSE
The crowd is not a static backdrop.
In every venue, every live event, the crowd must feel like real people reacting in real time.

---

## CROWD BEHAVIOR STATES

| State | What The Crowd Does |
|---|---|
| Arriving | Crowd fills seats gradually |
| Waiting | Subtle idle, head turns, chat animations |
| Pre-show hyped | More movement, excited chatter, crowd noise builds |
| Performance | Watching, nodding, slight movement |
| Hype peak | Arms up, cheering, jumping in front rows |
| Reaction moment | Collective gasp, cheer, or groan |
| Winner reveal | Full crowd explosion |
| Sad/fail moment | Collective sympathetic reaction |
| Quiet moment | Crowd stills, focused |
| Outro | Crowd rises, applauds, filters out |

---

## CROWD DENSITY TIERS

| Density | Appearance | Performance Cost |
|---|---|---|
| Empty (0–10%) | Scattered individuals | Minimal |
| Light (10–30%) | Sparse rows | Low |
| Medium (30–60%) | Half-full venue | Medium |
| Full (60–90%) | Most seats filled | High |
| Packed (90–100%) | Standing room, every seat | Maximum → optimize |

---

## CROWD ENERGY METER

Energy meter is always live during events:

```
[░░░░░░░░░░] 0% — Dead silence
[███░░░░░░░] 30% — Light engagement
[██████░░░░] 60% — Active crowd
[█████████░] 90% — Electric
[██████████] 100% — PEAK → triggers explosion FX
```

Energy increases from:
- Reactions (emoji, cheers, claps)
- Tips received
- Julius hype actions
- Artist call-and-response
- Host crowd warm-up
- Strong performance moment

Energy decreases from:
- Long silence
- Slow content
- Failed moment

---

## CROWD AUDIO LAYERS

| Audio Layer | Description |
|---|---|
| Crowd murmur | Background ambient crowd noise |
| Crowd cheer | Erupts on positive events |
| Crowd groan | Erupts on fail/sad events |
| Crowd gasp | Surprise moments |
| Crowd sing-along | If artist triggers it |
| Crowd clap rhythm | During high-energy moments |
| Crowd silence | Dramatic quiet moments |

Each venue has its OWN acoustic profile:
- Basement: tight, echo, claustrophobic reverb
- Club: bass-heavy crowd noise
- Concert Hall: rich, full, warm crowd sound
- Arena: massive, stadium-scale crowd roar
- Basement: intimate, every sound close

---

## CROWD PERFORMANCE RULES

To keep performance safe:
- Full 3D crowd animation: front 3 rows only
- Mid-range: simplified row motion
- Far seats: crowd density wave (not individual avatars)
- Downgrade at performance threshold: waves only

---

# LIVE_EVENT_VENUE_PACK_RULES.md
## How Venue Packs Change During Live Events

---

## EVENT-SPECIFIC PACK ACTIVATIONS

| Event Type | Auto-Pack | Changes |
|---|---|---|
| Cypher | Cypher Pack | Circle lighting, street grit overlay |
| Battle | Battle Pack | Aggressive lighting, dual-color split |
| World Concert | Concert Pack | Full production lighting, confetti canons active |
| Premiere | Premiere Pack | Red carpet glow, theatrical lighting |
| Going Live | Stream Pack | Subtle glow, viewer-count display |
| Holiday Event | Holiday Pack | Seasonal decoration overlay |
| Award Show | Prestige Pack | Gold trim, spotlight network |

---

## PACK LAYERING RULES

Base venue never changes during event.
Pack overlays sit on top of base:

```
BASE VENUE (permanent)
    +
EVENT PACK OVERLAY (active during event)
    +
SPONSOR SURFACE (active if sponsored)
    +
SEASONAL ACCENT (active if season)
    =
FULL ENVIRONMENT
```

---

# LIVE_ANALYTICS_ENGINE.md
## Measuring Live Events in Real Time

---

## PURPOSE
Every live event generates analytics that feed back into the platform.
Artists know how their performance is doing. The platform learns what works.

---

## REAL-TIME METRICS DURING EVENT

| Metric | Displayed To | Notes |
|---|---|---|
| Viewer count | Artist, Admin | Total across all venues |
| Peak viewer count | Artist, Admin | Highest concurrent |
| Crowd energy score | Artist | Live meter |
| Tips received | Artist | Running total |
| Reactions sent | Artist, Admin | Emoji count |
| Vote results | Artist, Host | Real-time |
| Chat messages | Artist, Moderation Bot | Volume count |
| Seat fill rate | Admin | % of venue capacity used |

---

## POST-EVENT METRICS

After event ends:
- Total unique viewers
- Average watch time
- Tip revenue
- Reaction type breakdown
- Crowd energy peak moments (timestamps)
- Rank/momentum impact
- Venue fill rates
- Geographic distribution of viewers

---

## ARTIST DASHBOARD POST-EVENT

After going live or performing, artist sees:
- "How Your Event Did" summary card
- Best moment highlight (highest reaction spike)
- Top fans from event
- Revenue earned
- Momentum change
- Suggestion: "Your peak was at 4:32. Clip this?"

---

*Live Production Engine + Multi-Venue Sync + Crowd Animation + Pack Rules + Analytics v1.0*
*BerntoutGlobal XXL — The Musician's Index*
