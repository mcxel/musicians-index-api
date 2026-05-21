# WORLD_SIMULATION_BOT_SYSTEM.md
## World Simulation Bot — BerntoutGlobal XXL
**ID:** `world-simulation-bot` | **Owner:** Algorithm | **Schedule:** Every 5 minutes

### Purpose
Manages world-level population signals: trending rooms, active venues, city activity. Powers the live world feel across homepage belts and lobby wall.

### What It Updates
- Active room list with current viewer counts
- Trending room signals (used by homepage belt)
- City activity scores (used by world map)
- Venue occupancy data
- World population meter (total active users)

### Allowed Actions
- Read: active_rooms, viewer_counts, artist_activity, venue_activity
- Write: world_activity_state, trending_signals, city_activity_scores

### Forbidden
- Cannot modify user data, billing, crown_state, rankings

### Fallback
- If world state update fails: preserve last known state (30-min cache)
- Platform continues to function — just with slightly stale activity data

### Logging
- Channel: `bot-logs:world-simulation` | Level: info
