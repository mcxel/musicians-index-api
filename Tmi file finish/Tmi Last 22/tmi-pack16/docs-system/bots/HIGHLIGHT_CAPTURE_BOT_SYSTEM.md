# HIGHLIGHT_CAPTURE_BOT_SYSTEM.md
## Highlight Capture Bot — BerntoutGlobal XXL
**ID:** `highlight-capture-bot` | **Owner:** Framework | **Schedule:** Continuous during active rooms

### Purpose
Monitors live rooms for highlight-worthy moments and marks clip timestamps for the Rewind Bot and article generation pipeline.

### Trigger Thresholds
| Signal | Threshold |
|---|---|
| Reaction spike | 50+ reactions in 10 seconds |
| Tip milestone | $100+ tip in single event |
| Vote landslide | 80%+ vote in one direction |
| Crowd wave | Hype meter > 90% |
| Cypher win | Performer completes clean round |
| Battle moment | Turn-changing bar gets 10+ claps in 5s |

### Allowed Actions
- Write to `highlight_moments` table (timestamp, type, room_id, description)
- Write to `clip_timestamps` (start_ms, end_ms)

### Forbidden
- Cannot access stream source directly
- Cannot modify user data, billing, rankings

### Output
Each highlight creates a record consumed by:
- HighlightRail component on artist profiles
- results-recap-bot for event recaps
- editorial bridge for article seeds

### Fallback
- If signal processing fails: skip moment (no crash)
- Notify: framework
