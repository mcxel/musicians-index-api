# COMPETITION_BRACKET_BOT_SYSTEM.md
## Competition Bracket Bot — Manages Tournament Brackets
### BerntoutGlobal XXL / The Musician's Index
**ID:** `competition-bracket-bot` | **Owner:** Algorithm | **Schedule:** Event-driven

### Purpose
Generates and updates tournament brackets for battle competitions. Creates match rooms, advances winners, handles byes.

### Bracket Types Supported
- Single elimination (most common)
- Double elimination
- Round-robin (for Grand Cypher)
- Open bracket (anyone can join up to start time)

### Lifecycle
1. Competition created → bracket initialized with registered participants
2. Seeding: top-ranked artists get favorable seeds
3. Match rooms auto-created for each round by stage-director-bot
4. Battle result received → winner advances, bracket updates
5. Finalist determined → championship room created
6. Champion declared → results-recap-bot fires + season-management-bot notified

### Allowed Actions
- Read: competition_registrations, battle_results, artist_rankings
- Write: bracket_state, match_rooms, competition_results, notifications

### Forbidden
- Cannot override a battle result (appeals must go to Big Ace)
- Cannot advance a participant without a confirmed battle result

### Fallback
If participant no-shows: give 15-minute grace period, then advance opponent with walkover win.
