# PAGE ENGINE BRIDGE + ANIMATION + GOVERNANCE SYSTEMS
## All Remaining Shared System Files

---

# PAGE_DEPTH_ENGINE.md
## The Visual Page Stack System

### Purpose
Pages in the magazine and game engine must feel like physical layered media.
Users see the stack getting bigger on one side and smaller on the other.

### Core Rules
- Current page = largest, brightest, most interactive
- Pages behind = shifted backward, slightly smaller, slightly blurred
- Pages ahead = visible in opposite direction, waiting
- Stack thickness changes based on page position

### Direction
- Magazine: left-to-right or right-to-left
- Dashboard cards: forward/backward depth
- Game brackets: vertical or horizontal
- All share same foundation, different timing profiles

### Visual Depth Cues
- Scale: pages shrink 8% per position back
- Blur: 1px per position back (subtle)
- Shadow: deepens per position back
- Brightness: 3% dimmer per position back
- Parallax offset: 12px per position back
- Edge reveal: see the stack edge (3-5px visible from side)

### Page Stack Sound
- Page turn: soft paper or glass slide
- Stack change: subtle weight sound
- Reduced motion: no sound by default

### Motion Profiles
| Engine | Feel | Speed |
|---|---|---|
| Magazine | Cinematic, smooth | 400ms ease-in-out |
| Gaming | Snappy, reactive | 200ms ease |
| Dashboard | Card-flip clean | 300ms ease |
| Profile | Slide, editorial | 350ms ease |

---

# ANIMATION_ENGINE.md
## Master Animation Control System

### What Moves (always in active rooms)
- Lights breathe in idle
- Screens have subtle ambient motion
- Crowd has idle micro-movement
- Curtains move on show transitions
- Julius periodic actions
- Stage sparkle/particles (minimal)

### What Triggers Animation
| Trigger | Animation |
|---|---|
| Show start | Curtain open, light sweep |
| Win | Spotlight + color burst |
| Fail | Dim pulse + show fail |
| Elimination | VEX entry light change |
| Winner | Gold spotlight + celebration |
| Tier upgrade | Full room morph |
| Stream end | Lights rise, crowd release |

### Directional Grammar (Universal)
Every animated system understands:
- up / down
- left / right
- left-to-right / right-to-left
- front-to-back / back-to-front
- circular / orbit
- reverse
- pulse / breathe
- sweep
- bounce

### Performance Caps
| Device | Animation Budget |
|---|---|
| Desktop high | Full (all systems) |
| Desktop mid | Reduce FX by 30% |
| Mobile | Lite mode auto |
| Low power | Static + glow only |

---

# CURTAIN_ENGINE.md
## Stage Curtain Behavior System

### Curtain Types
| Type | Used In |
|---|---|
| Velvet curtain | Concert Hall, Showcase Lounge, Premiere |
| Industrial roll | Loft, Meeting Hall |
| Neon split | Nightclub, Club |
| Digital reveal | World Stage, LED venues |
| No curtain | Circle, Living Room, Loft |

### Curtain Animations
- Slow open (intro, cinematic): 4–8 seconds
- Fast open (hype reveal): 1–2 seconds
- Dramatic close (end of show): 6–10 seconds
- Quick blackout close: 0.5 seconds
- Intermission (semi-open hold): stable for 5+ mins
- Peek (slight open, then close): 2 seconds, tease

### Curtain Sounds
- Open: soft sweep + small crowd build
- Close: soft whisper + fade
- Fast open: stinger sound

---

# REVEAL_ENGINE.md
## Prize Doors, Stage Reveals, and Surprise Mechanics

### Reveal Types
| Type | Used For |
|---|---|
| Single door (slide) | Deal or Feud, prize rooms |
| Double door (split) | Dramatic prize reveals |
| Floor platform rise | Winner elevation, prize reveal |
| Holographic reveal | Digital prize, world stage |
| Wall panel reveal | Answer reveals, scoreboard unlocks |
| Light reveal | Spotlight on hidden element |

### Reveal Sequence
1. Audio: tension build
2. Visual: pre-reveal light focus
3. Julius: anticipation pose
4. Crowd: holds energy
5. REVEAL: door/platform/light activates
6. Audio: payoff sting
7. Julius: celebration reaction
8. Crowd: explosion

---

# CROWD_ANIMATION_ENGINE.md
## Crowd Behavior and Motion System

### Crowd States
| State | Behavior |
|---|---|
| Arriving | Fills seats gradually |
| Idle | Head tilts, micro-shifts |
| Engaged | Forward leans, focused |
| Hype | Arms up, movement |
| Peak | Standing, jumping, clapping |
| Sad/fail | Collective groan, sink |
| Winner | Full eruption |
| Tier upgrade | Look around, then cheer |
| Exit | Filter out gradually |

### Crowd Energy → Visual Logic
```
0%  = still, background noise
30% = gentle sway, murmur
60% = active movement, cheer volume rises
80% = full engagement, arms up sections
100% = complete eruption → triggers celebration FX
```

### Crowd Density Performance
- Full 3D: front 3 rows
- Mid: simplified row motion
- Far: crowd density wave
- Fallback: static silhouette with glow outline

---

# UNIVERSAL_ACTION_SYSTEM.md
## Shared Operating Language for All Systems

### Action Verbs (All systems understand these)
search · find · verify · test · start · stop · complete · export · repeat
reset · reveal · move · rotate · scan · compare · confirm · recover

### Directional Grammar (All systems understand these)
up · down · left · right · left-to-right · right-to-left
front-to-back · back-to-front · circular · reverse
spiral · pulse · sweep · orbit · bounce · zig-zag

### Execution States (Every action has these)
queued → started → in-progress → verified → completed → exported → repeated → failed → recovered

### Tool Protocol
Every tool/bot knows:
- What it can search
- What it can verify
- What it can export
- What success looks like
- What failure looks like
- How to retry
- How to reverse

---

# MAINFRAME_CORE.md
## The Governing Layer

### What Mainframe Controls
- Global system truth
- Permission enforcement
- Command routing
- Feature flags
- Logging
- Recovery

### Mainframe Law
```
Algorithm may recommend.
Framework may build.
Mainframe owns final truth.
```

### Feature Flags
```js
ENABLE_ROOM_EVOLUTION: true
ENABLE_JULIUS: true
ENABLE_VEX: true
ENABLE_LIVE_EVENTS: true
ENABLE_TIER_TRANSFORMATION: true
ENABLE_WORLD_CONCERT: false // until deployed
ENABLE_BACKSTAGE_PASS: false // future
```

---

# FRAMEWORK_BRIDGE.md
## How the Framework Implements Everything

### Page Architecture
- Profile pages: vertical operational hubs
- Article pages: horizontal magazine spreads
- Room pages: immersive venue environments
- Dashboard pages: analytics surfaces
- Show pages: live event experiences

### Component Architecture
Every UI surface is a reusable block:
- RoomShell
- SeatRow / SeatUnit
- StageSurface / BackScreen
- HostAvatar / JuliusAvatar / VEXAvatar
- CrowdLayer
- LightingRig
- CurtainPanel
- ScoreboardOverlay
- TierProgressBar
- TransformationOverlay

---

# ALGORITHM_CONTROL_LAYER.md
## The Adaptation Brain

### What Algorithm Decides
- Host rotation per event
- Room evolution timing
- Sound selection
- Page-stack sequencing
- Crowd behavior scaling
- Anti-repetition logic
- Recommendation engine
- Discovery ordering

### Guardrails (Algorithm CANNOT)
- Change character names or roles
- Override mainframe permissions
- Deploy code changes
- Change tier definitions
- Override room identity

---

# ROLE_ACTION_MATRIX.md
## Final Role Permission Table

| Action | Big Ace | Marcel Dickens | Jay Paul Sanchez |
|---|---|---|---|
| View analytics | ✅ | ✅ | ✅ |
| View system health | ✅ | ✅ | ✅ |
| Submit suggestions | ✅ | ✅ | ✅ |
| Request commands | ✅ | ✅ (routes to Big Ace) | ❌ |
| Execute commands | ✅ | ❌ | ❌ |
| Deploy changes | ✅ | ❌ | ❌ |
| Modify systems | ✅ | ❌ | ❌ |
| Override bots | ✅ | ❌ | ❌ |
| View error logs | ✅ Full | Summary only | ❌ |
| Approval queue | ✅ Act | View only | View only |
| System controls | ✅ | ❌ | ❌ |

---

# FINAL_EXECUTION_LOCK_v2.md
## The One-Page Completion Law

### Execution Rules
1. One blocker at a time
2. No guessing — logs or it didn't happen
3. No rewriting working systems
4. Every fix produces proof
5. Every step passes before moving forward

### Feature Completion (6 Required)
- [ ] Canon entry confirmed
- [ ] Route/component binding confirmed
- [ ] Data source confirmed
- [ ] Role access confirmed
- [ ] Proof gate passed
- [ ] Performance budget checked

### Current Active Blocker
Cloudflare Pages — musicians-index-api and musicians-index-web

### Freeze Line
Before Cloudflare green: blocker fixes only
Before onboarding proof green: no expansion waves

### Room Build Status
- [x] Free tier rooms defined
- [x] Bronze tier rooms defined
- [x] Gold tier rooms defined
- [x] Diamond tier rooms defined
- [x] Signature rooms defined
- [ ] Room packs approved
- [ ] Rooms placed in repo
- [ ] Rooms wired to routes

### Platform Slogan
"This is your stage, be original."

---

*All Shared Systems v1.0 — BerntoutGlobal XXL / The Musician's Index*
