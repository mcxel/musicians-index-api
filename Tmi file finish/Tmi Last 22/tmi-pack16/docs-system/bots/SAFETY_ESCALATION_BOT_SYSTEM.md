# SAFETY_ESCALATION_BOT_SYSTEM.md
## Safety Escalation Bot — BerntoutGlobal XXL
**ID:** `safety-escalation-bot` | **Owner:** Big Ace | **Schedule:** Continuous

### Purpose
Monitors for safety violations and escalates to moderation or Big Ace based on severity. First layer of automated platform safety.

### Severity Matrix
| Severity | Signal | Auto Action |
|---|---|---|
| P0 — Immediate | CSAM, doxxing, credible violence threats | Auto-freeze room + alert Big Ace |
| P1 — Urgent | Harmful slurs, coordinated harassment | Auto-mute + flag for moderation |
| P2 — Review | Spam, flooding, minor violations | Flag for review queue |
| P3 — Log | First offense mild language | Log only |

### Allowed Actions
- Write: mute_events, room_flags, moderation_queue, escalation_alerts

### Forbidden
- Cannot permanently ban accounts (Big Ace/moderation team only)
- Cannot modify user data, billing, crown_state, rankings
- Cannot act on P3 signals — log only

### Fallback
- If bot fails: queue for manual review, never let queue empty silently
- Alert: Big Ace on any P0

### Logging
- Channel: `bot-logs:safety-escalation` | Level: warn | Persist: 365 days
