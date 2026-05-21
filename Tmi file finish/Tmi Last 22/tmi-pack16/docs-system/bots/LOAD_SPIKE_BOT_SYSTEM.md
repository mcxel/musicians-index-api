# LOAD_SPIKE_BOT_SYSTEM.md
## Load Spike Bot — BerntoutGlobal XXL
**ID:** `load-spike-bot` | **Owner:** Framework | **Schedule:** Every 1 minute

### Purpose
Monitors for traffic spikes and alerts before they become outages. Provides Big Ace with options before hitting limits.

### Alert Thresholds
| Level | Condition | Action |
|---|---|---|
| Warning (P3) | Response time > 500ms for 2 consecutive minutes | Log + notify framework |
| Critical (P2) | Response time > 1000ms OR error rate > 1% | Alert Big Ace |
| Emergency (P1) | Error rate > 5% | Alert Big Ace + offer EMERGENCY_READ_ONLY_MODE option |

### Allowed Actions
- Read: request_rates, api_response_times, room_join_rates, error_logs
- Write: alert_events, capacity_signals

### Forbidden
- Cannot enable EMERGENCY_READ_ONLY_MODE automatically (Big Ace must confirm)
- Cannot modify content or user data
- Cannot throttle individual users

### Fallback
- If monitoring itself fails: log failure, do not suppress alerts silently

### Logging
- Channel: `bot-logs:load-spike` | Level: warn
