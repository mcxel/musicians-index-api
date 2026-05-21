# WEEKLY_DIGEST_BOT_SYSTEM.md
## Weekly Digest Bot — Sunday Summary Email to All Artists
### BerntoutGlobal XXL / The Musician's Index
**ID:** `weekly-digest-bot` | **Owner:** Algorithm | **Schedule:** Sunday 8am UTC

### Purpose
Sends each artist a personalized weekly summary: battles, streams, new followers, earnings, ranking position, upcoming events.

### Email Contents (Per Artist)
- Current ranking + change from last week
- Streams this week vs. last week
- Tips received this week
- New followers
- Battle W/L this week
- Upcoming events they're registered for
- Recommended: 1 undiscovered artist in their genre (discovery-first)
- Platform announcements from Big Ace

### Opt-Out
Artists can disable weekly digest in `/settings/notifications`.

### Allowed Actions
- Read: artist_stats, rankings, tips, followers, events, announcements
- Write: email queue (Resend)

### Forbidden
- Cannot include other artists' private data
- Cannot send to opted-out users

### Fallback
If email fails to send: log and skip. Do not retry weekly digest more than once.

### Logging
- Channel: `bot-logs:weekly-digest` | Level: info | Persist: 90 days
