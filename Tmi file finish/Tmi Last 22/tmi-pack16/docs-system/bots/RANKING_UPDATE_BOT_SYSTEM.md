# RANKING_UPDATE_BOT_SYSTEM.md
## Ranking Update Bot — BerntoutGlobal XXL
**ID:** `ranking-update-bot` | **Owner:** Algorithm | **Schedule:** After events + Sunday midnight (post-crown-bot)

### Purpose
Updates all leaderboards after battles, events, and weekly crown cycles. Maintains the ranking integrity of the platform.

### What It Updates
- Global artist rankings
- Weekly battle rankings
- Cypher participation rankings
- Stream & Win leaderboards
- Fan engagement leaderboards
- Regional/city rankings

### Ranking Inputs (weighted)
- Battle wins/losses
- Cypher participation
- Stream time (via stream_stats)
- Tips received
- Fan votes (per CROWN_SYSTEM rules)
- Follower growth rate

### Forbidden
- Cannot touch crown_state (crown-bot owns that)
- Cannot modify user data or billing

### Fallback
- If ranking calculation fails: preserve last known rankings
- Alert: Big Ace

### Logging
- Channel: `bot-logs:ranking-update` | Level: info | Persist: 365 days
