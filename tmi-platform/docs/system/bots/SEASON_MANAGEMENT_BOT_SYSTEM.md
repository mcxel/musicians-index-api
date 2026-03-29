# SEASON_MANAGEMENT_BOT_SYSTEM.md
## Season Management Bot — Runs the Seasonal Competition Cycle
### BerntoutGlobal XXL / The Musician's Index
**ID:** `season-management-bot` | **Owner:** Algorithm | **Schedule:** Cron + event-driven

### Purpose
Manages the full lifecycle of a competition season: opens seasons, triggers finals week, closes seasons, issues awards, opens the next season.

### Season Lifecycle Schedule
```
Day 1 of quarter:     Open new season, post announcement
Day 77 of quarter:    Trigger "Finals Week" announcement
Day 84 of quarter:    Lock regular rankings, only finals count
Day 91 of quarter:    Close season
Day 91 (midnight):    ranking-update-bot runs final calculation
Day 92:               Issue season awards to top performers
Day 93:               Open next season with 10% carry-over points
```

### Awards Issued at Season Close
- Season Champion: top-ranked artist (Crown + Season title badge)
- Season Runner-Up: #2 ranked artist
- Best Producer: most beats licensed in season
- Most Discovered: artist with highest viewer growth (discovery-first honorific)
- Top Venue: venue with most active rooms

### Allowed Actions
- Read: rankings, room history, venue activity
- Write: season_record, season_awards, artist_badges, announcements

### Forbidden
- Cannot override crown_state (crown-bot owns that separately)
- Cannot modify billing, user data

### Logging
- Channel: `bot-logs:season-management` | Level: info | Persist: 365 days
