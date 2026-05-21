# RESULTS_RECAP_BOT_SYSTEM.md
## Results Recap Bot — BerntoutGlobal XXL
**ID:** `results-recap-bot` | **Owner:** Algorithm | **Schedule:** Event-driven

### Purpose
Generates battle/event/cypher results pages and sends recap notifications to all participants. Runs on `room.closed` or `event.ended`.

### 5 Outputs Per Event
1. **Results page** at `/events/[slug]/results` — winner, scores, votes
2. **Highlight reel** at `/events/[slug]/highlights` — clip rail from highlight-capture-bot
3. **Article seed** (if event had > 50 viewers) — creates editorial draft
4. **Winner card data** — WinnerCard component props
5. **Stat updates** — artist profile battle/cypher records updated

### Allowed Actions
- Read: room history, vote records, tip records, performer roster
- Write: event_recap_page, results_record, participant_notifications, article_seed

### Forbidden
- Cannot modify ongoing rooms
- Cannot modify billing, crown_state

### Fallback
- If data incomplete: create basic results page with available data
- Never create a 404 for a results page — always show something

### Logging
- Channel: `bot-logs:results-recap` | Level: info | Persist: 365 days
