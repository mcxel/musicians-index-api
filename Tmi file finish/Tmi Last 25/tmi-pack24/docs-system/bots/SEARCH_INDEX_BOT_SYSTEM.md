# SEARCH_INDEX_BOT_SYSTEM.md
## Search Index Bot — Keeps Search Current
### BerntoutGlobal XXL / The Musician's Index
**ID:** `search-index-bot` | **Owner:** Algorithm | **Schedule:** Event-driven + daily rebuild 3am

### Purpose
Keeps the search index current when artists, venues, beats, or articles are created or updated. Runs a full rebuild nightly.

### Triggers (Incremental)
- `artist.profile.updated` → reindex artist document
- `venue.created` / `venue.updated` → reindex venue document
- `beat.published` / `beat.updated` → reindex beat document
- `article.published` → reindex article document
- `room.started` → add to live room boost index
- `room.ended` → remove from live room boost index

### Daily Rebuild (3am UTC)
Full index rebuild from DB to catch any missed incremental updates.

### Live Room Boost
Active rooms get a score multiplier in search results.
Score decays as room ages. Score = viewerCount × 10 / (minutesOld + 1).

### Allowed Actions
- Read: all public entity tables
- Write: search_index table or external search service (PostgreSQL full-text or Algolia)

### Forbidden
- Cannot index private/auth-required content
- Cannot index admin/operator pages

### Fallback
If incremental index fails: schedule for full rebuild. Never leave stale data > 24h.
