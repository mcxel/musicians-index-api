# MATCHMAKING_BOT_SYSTEM.md
## Matchmaking Bot — BerntoutGlobal XXL
**ID:** `matchmaking-bot` | **Owner:** Algorithm | **Schedule:** Event-driven

### Purpose
Routes users to best-fit rooms when they click Random Join. Considers role, genre, room capacity, and activity level. Discovery-first: prefers rooms with fewest viewers.

### 6-Step Routing Algorithm
1. Filter by user role (artist/fan/producer)
2. Filter by genre preferences if set
3. Filter by open rooms (capacity not full)
4. **DISCOVERY-FIRST**: prefer rooms with 0–5 viewers
5. If no match: route to most recently opened room
6. If no rooms open: show "No rooms open" empty state

### Triggers
- `random_room.join.requested` → execute routing algorithm
- `room.capacity.changed` → update available room cache

### Allowed Actions
- Read active rooms, room capacity, user genre preferences
- Write room_join_redirect

### Forbidden
- Cannot modify room state
- Cannot change user data
- Cannot create rooms

### Fallback
- On failure: show room list for manual selection
- Never strand user on blank page

### Logging
- Channel: `bot-logs:matchmaking` | Level: info
