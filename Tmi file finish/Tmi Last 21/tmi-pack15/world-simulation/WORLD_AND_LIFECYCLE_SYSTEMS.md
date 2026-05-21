# WORLD_SIMULATION_SYSTEM.md
## How Members Become the World — Population, Roles, Positions, Occupancy

---

## THE CORE CONCEPT

Members do not just "use" the platform.
They ARE the platform.

When a fan joins a room → they become part of the audience count.
When an artist goes live → they take a performer position.
When a venue is active → its occupancy rises.
When a cypher has 8 artists → 8 position slots are filled.
When the lobby wall shows 3 viewers → that's real human presence.

This is the World Simulation System.

---

## POPULATION ROLE MAP

Every member has one primary role and may hold context-specific positions:

| Role | In Room | In World | In Lobby | In Arena |
|---|---|---|---|---|
| Fan | Audience | Viewer count | Lobby wall slot | Audience seat |
| Artist | Performer / Queue | Trending artist | Featured card | Stage slot |
| Producer | Beat provider | Active producer | Producer card | Producer stage |
| Host | Room host | Show runner | N/A | Stage center |
| Venue Operator | Room admin | Venue owner | N/A | N/A |
| Sponsor Rep | Sponsor slot | Campaign active | Sponsor card | Sponsor board |
| Moderator | Room mod | N/A | N/A | N/A |
| Admin/Big Ace | Operator | Platform controller | N/A | N/A |

---

## POSITION SYSTEM

Everything is position-based:

```typescript
// Every live surface tracks positions
interface WorldPosition {
  surfaceId: string;       // room ID, belt ID, venue ID, lobby slot
  surfaceType: 'room' | 'belt' | 'lobby' | 'arena' | 'queue' | 'stage';
  slotNumber: number;      // position 1, 2, 3... (1 = discovery-first for lobby)
  userId: string;
  role: PopulationRole;
  joinedAt: Date;
  status: 'active' | 'idle' | 'performing' | 'queued' | 'watching';
}
```

---

## WORLD ACTIVITY ENGINE

The world should feel alive because things are always happening.

Activity signals that drive the world:
- room joins/leaves → real-time occupancy
- new streams → lobby wall updates
- events starting → countdown triggers
- rankings changing → leaderboard movements
- artists going live → featured card rotation
- sponsors activating → sponsor board updates
- battles ending → result cards appear

---

## WORLD TIME SYSTEM

The platform runs on cycles:

| Cycle | Period | What Happens |
|---|---|---|
| Real-time | Continuous | Room joins, reactions, tips, chat |
| 15-minute | Every 15min | Lobby wall sort update, discovery boost |
| Hourly | Every hour | News bot, trending update |
| Daily | Every day | Daily spin reset, quest reset, artist spotlight |
| Weekly | Sunday midnight | Crown rotation, archive, issue publish |
| Monthly | 1st of month | Evolution report, rankings reset |
| Seasonal | Quarterly | Seasonal theme, tournament season |
| Yearly | Jan 1 | Yearly awards, Hall of Fame update |

---

---

# PRELIVE_READINESS_SYSTEM.md
## The Full Event Lifecycle — Before, During, After

---

## STAGE 1: PRE-LIVE

### Green Room / Backstage
Before any live event, performers need a staging area.

```
Artist/Producer enters Green Room
  → Confirms gear/audio
  → Reviews show notes
  → Sees audience count growing
  → Gets notified: "Lineup starts in 10 min"
  → Marks ready
  → Moves to backstage queue
```

**DB State:** `event.status = 'pre_live'`
**Route:** `/backstage` (performer-only)
**Watchdog:** alerts host if performer not ready 5min before

### Soundcheck
Quick pre-live verification:
- mic active
- preview window test
- beat preview test
- room visible to performer

### Lineup / Call Time
- ordered performer list
- time slots assigned
- host approvals
- standby positions

---

## STAGE 2: LIVE

Room enters `active` state:
- Stage Director Engine takes control
- Announcer introduces each performer
- Turn/Queue Engine manages order
- Preview Window opens when triggered
- Audience Visibility Engine ensures all see shared media
- Watchdog monitors for stuck states
- Live Control Panel available to host/operator

---

## STAGE 3: POST-LIVE

### Immediate (On Room Close)
- Rewind Bot archives session
- Room Recap Bot generates summary
- Results posted to event page
- Winner cards shown if applicable
- Participants notified of recap

### Within 1 Hour
- Clip Bot marks highlight moments
- Highlight Rail populated
- Article seed generated if editorial worthy
- Points posted to all participants

### Within 24 Hours
- Full recap article available
- Stats updated on artist profiles
- Leaderboard updated
- Season rankings updated

**Routes:**
- `/results` — live results page
- `/highlights` — clip/highlight rail
- `/events/[slug]/recap` — full event recap

---

---

# OVERLAY_STACKING_SYSTEM.md
## What Appears Above What — Visual Priority Rules

---

## THE STACKING ORDER (Bottom to Top)

```
Layer 1: Page/Belt content (homepage, magazine, artist profile)
Layer 2: Room surface (stage, queue, roster, chat)
Layer 3: Shared Preview Window (docked to side)
Layer 4: Timer/Countdown overlays (battle round, event start)
Layer 5: Announcement cards (winner, next up, prize)
Layer 6: Sponsor/Ad overlays (brief, labeled, non-obstructing)
Layer 7: HUD strip (bottom bar — audio, points, notifications)
Layer 8: Notification popups (brief, dismissible)
Layer 9: Emergency broadcasts (Big Ace only, full-width)
Layer 10: System alerts (moderation, safety)
```

---

## PRIORITY RULES

### Preview Window
- Default position: right side, mid-height
- Never covers: artist face, stage center, turn timer
- Can be moved by host in edit mode
- Auto-docks away from faces using position detection

### Sponsor Overlays
- Max 10 seconds animated, then static
- Appear at Layer 6, below HUD
- Banned at: winner reveal, crown transfer, tier upgrade
- Labeled clearly: "Sponsored by [Brand]"

### Emergency Broadcasts
- Layer 9 — highest visible
- Only Big Ace can trigger
- Full-width banner
- All other overlays pause

---

## MOTION / ANIMATION RULES

| Interaction | Animation | Duration | Easing |
|---|---|---|---|
| Preview window open | Slide in from right | 300ms | ease-out |
| Preview window close | Slide out to right | 250ms | ease-in |
| Winner reveal | Scale + glow | 600ms | spring |
| Countdown tick | Number flip | 100ms | ease-in-out |
| Belt card hover | Lift + scale 1.02 | 150ms | ease-out |
| Page transition | Cross-fade | 250ms | ease |
| Tier upgrade | Color wave + expand | 9000ms | staged |
| Notification | Slide up from bottom | 200ms | ease-out |
| Notification dismiss | Fade out | 150ms | ease-in |

---

## NUMBER MOVEMENT SYSTEM

All live numbers should animate:
- Countdown: smooth decrement, color shift at < 30s (warning), < 10s (critical)
- Viewer count: smooth increment, pulse on new join
- Points: count-up animation on award
- Leaderboard: position swap animation
- Tip amount: brief highlight flash

Implementation:
```typescript
// Animated number component
<AnimatedCounter
  value={viewerCount}
  duration={300}
  easingFn="ease-out"
  onThreshold={[{value: 100, className: 'milestone'}, {value: 1000, className: 'fire'}]}
/>
```

---

*World Simulation + Pre/Post Live + Overlay/Motion Systems v1.0*
*BerntoutGlobal XXL / The Musician's Index*
