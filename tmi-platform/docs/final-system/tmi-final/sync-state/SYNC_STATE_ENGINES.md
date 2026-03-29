# GLOBAL_STATE_ENGINE.md
## The Brain — Master State for Every Live Event

---

## PURPOSE
Tracks the true current state of every live session.
Without this, everything desyncs.
Every other system reads from Global State. Nothing acts on assumptions.

---

## WHAT GLOBAL STATE TRACKS

```json
{
  "session_id": "uuid",
  "artist_id": "uuid",
  "event_type": "live_stream | cypher | battle | concert | premiere | going_live",
  "room": {
    "current_id": "ROOM_FREE_01",
    "tier": "free",
    "tier_color": "#00FF88",
    "capacity_used": 8,
    "capacity_max": 12
  },
  "stage": {
    "mode": "screen | avatar | hybrid",
    "artist_visible": true,
    "screen_active": true
  },
  "crowd": {
    "energy_level": 42,
    "viewer_count": 8,
    "peak_count": 12,
    "reaction_active": false
  },
  "audio": {
    "layer_background": "playing",
    "layer_crowd": "playing",
    "layer_performance": "playing",
    "acoustic_profile": "living_room",
    "volume_master": 80
  },
  "camera": {
    "active_view": "STANDARD",
    "auto_cut": false,
    "tracking_subject": "stage"
  },
  "transformation": {
    "in_progress": false,
    "from_tier": null,
    "to_tier": null,
    "sequence_step": null,
    "triggered_at": null
  },
  "tier_progression": {
    "current_points": 1240,
    "progress_to_next": 64,
    "next_tier": "bronze",
    "evolution_bar_pct": 64
  },
  "host": {
    "active": null,
    "mode": "none",
    "julius_mode": "passive"
  },
  "show": {
    "round": 0,
    "score_left": 0,
    "score_right": 0,
    "elimination_pending": false
  },
  "feature_flags": {
    "vex_enabled": true,
    "julius_enabled": true,
    "transformations_enabled": true,
    "world_concert_mode": false
  }
}
```

---

## STATE CHANGE RULES

1. State only changes through official state mutations (not direct writes)
2. Every mutation is logged with timestamp + trigger
3. During transformation: `transformation.in_progress = true` blocks other mutations
4. Camera state updates follow crowd energy changes (algorithm layer)
5. All clients receive state delta, not full state broadcast

---

## STATE PRIORITY ORDER

When multiple systems try to update state simultaneously:
```
1. SAFETY/FAILSAFE (highest)
2. MAINFRAME commands
3. SHOW engine events
4. CROWD energy updates
5. CAMERA auto-direction
6. AUDIO adjustments
7. AMBIENT/idle (lowest)
```

---

## INTEGRATION POINTS

- REALTIME_SYNC_ENGINE reads this state and broadcasts to all clients
- TRANSFORMATION_ENGINE writes to `transformation` object
- CROWD_REACTION_ENGINE writes to `crowd.energy_level`
- CAMERA_DIRECTION_ENGINE reads `crowd.energy_level` and `show.round`
- AUDIO_ENVIRONMENT_ENGINE reads `room.current_id` for acoustic profile
- All clients subscribe to state delta stream

---

# REALTIME_SYNC_ENGINE.md
## Keeping All Viewers in the Same Moment

---

## PURPOSE
Every viewer in every venue sees the same moment.
Transformations, audio, camera cuts — all synchronized.
No one gets a different experience because of their connection.

---

## SYNC PROTOCOL

```
MASTER STATE (server)
    ↓ delta broadcast (WebSocket)
CLIENT SYNC LOOP
    ↓ receives delta
    ↓ applies to local render state
    ↓ confirms receipt
    ↓ reports drift if any
    ↓ server adjusts offset if needed
```

---

## TIMING RULES

| Condition | Rule |
|---|---|
| Normal drift | Max 200ms acceptable |
| Warning drift | 200–500ms: soft resync |
| Critical drift | >500ms: hard resync |
| Late joiner | Snap to current state instantly |
| Transformation | All clients receive trigger simultaneously, no stagger |
| Audio sync | Prioritized — first to resync on drift |
| Camera cut | Broadcast 1 frame ahead of visual |

---

## WHAT IS SYNCED

| Element | Synced? | Frequency |
|---|---|---|
| Room tier state | YES | On change |
| Transformation sequence | YES | Real-time |
| Audio beat position | YES | Every 500ms |
| Camera view | YES | On change |
| Crowd energy meter | YES | Every 1s |
| Artist stream | YES | Continuous |
| Individual reactions | NO | Local only |
| Chat messages | NO | Local per venue |
| Seat positions | YES | On join only |

---

## WORLD CONCERT SYNC

In World Concert mode with multiple venues:
- All venues sync to same master broadcast
- Global viewer count aggregated and rebroadcast every 5s
- City pins update every 30s
- Crowd energy pooled but displayed locally
- Max drift across all venues: 500ms

---

## LATE JOINER HANDLING

When a user joins mid-event:
1. Receive current full state snapshot
2. Room renders in current tier (not from beginning)
3. Seat assigned from available pool
4. Fade-in animation (not jarring)
5. Gets catch-up summary of what they missed
6. Joins live stream at current position

---

# SESSION_RECOVERY_ENGINE.md
## Reconnection and State Restoration

---

## PURPOSE
If anything breaks — stream crash, disconnect, server hiccup — the user reconnects seamlessly to exactly where they were.

---

## WHAT GETS SAVED (Per-Session)

```json
{
  "session_id": "uuid",
  "user_id": "uuid",
  "event_id": "uuid",
  "last_room_id": "ROOM_GOLD_01",
  "last_tier": "gold",
  "last_seat_id": "ROW_2_SLOT_4",
  "last_camera_view": "STAGE_WIDE",
  "last_known_timestamp": 1742598000,
  "reconnect_window_seconds": 120
}
```

---

## RECOVERY FLOW

```
User disconnects
    ↓
Session saved to recovery store (120s window)
    ↓
User reconnects within 120s?
    YES → restore seat, room, tier, camera, rejoin stream at current moment
    NO  → fresh join, assign new seat, current state
```

---

## WHAT RESTORES

| Element | Restored? |
|---|---|
| Seat position | YES |
| Room tier | YES |
| Camera view | YES |
| Stream position | YES (current moment) |
| Chat history | Last 50 messages |
| Reaction state | Cleared (fresh) |
| Tip balance | YES |
| Energy meter | Current state |

---

## DISASTER RECOVERY (MAJOR OUTAGE)

If the event server goes down:
1. All clients receive "reconnecting" overlay
2. Julius enters loading mode (helpful message, no panic)
3. System attempts reconnect 3 times (5s intervals)
4. If successful: full state restore
5. If failed after 3 attempts: graceful event end, analytics saved, artist notified

---

*Global State + Sync + Recovery v1.0 — BerntoutGlobal XXL*
