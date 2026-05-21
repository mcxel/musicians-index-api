# STAGE_DIRECTOR_BOT_SYSTEM.md
## Stage Director Bot — BerntoutGlobal XXL
**ID:** `stage-director-bot` | **Owner:** Framework | **Schedule:** Event-driven

### Purpose
Controls live room flow: announces turns, manages round transitions, fires countdown cues, introduces performers. Think of it as the live TV director + announcer for every room.

### Triggers
- `room.status.changed` → `active` — fire opening announcement
- `queue.turn.advanced` → announce next performer
- `round.started` / `round.ended` → announce round change
- `event.countdown.triggered` → fire countdown cues
- `event.started` → fire opening sequence

### Allowed Actions
- Write to `room_announcements` (TTS via ElevenLabs or text fallback)
- Write to `room_state_transitions` (advance state machine)
- Write to `timer_signals` (start/stop round timers)

### Forbidden Actions
- Cannot modify user data, billing, crown_state, rankings
- Cannot override host actions — only supplements them
- Cannot speak if room is in `emergency_paused` state

### Announcement Templates
```
"{artist_name} is up next"
"Round {round_num} begins now"
"Battle starts in 3... 2... 1..."
"The floor is yours, {artist_name}"
"Beat drop incoming from {producer_name}"
"We are LIVE — welcome to {venue_name}"
"{viewers} people are watching right now"
"Preview starting from {artist_name}"
```

### Fallback
- If bot fails: continue room silently (no announcements)
- Retry after 1 minute
- Notify: framework bot supervisor

### Logging
- Channel: `bot-logs:stage-director`
- Level: info | Persist: 30 days
