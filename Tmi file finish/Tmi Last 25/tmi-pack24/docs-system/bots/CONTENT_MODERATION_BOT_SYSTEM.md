# CONTENT_MODERATION_BOT_SYSTEM.md
## Content Moderation Bot — Automated Safety Layer
### BerntoutGlobal XXL / The Musician's Index
**ID:** `content-moderation-bot` | **Owner:** Big Ace | **Schedule:** Continuous + on-demand

### Purpose
Automatic first-pass content scanning on: chat messages, usernames, bios, beat titles, uploaded image metadata.

### What It Scans
1. Chat messages: profanity filter, threat detection, link spam
2. Usernames/bios: impersonation check, explicit content
3. Beat titles: copyright keyword flagging (e.g., "Drake Type Beat" → flag for review)
4. Upload metadata: checks for suspicious filenames, mime-type mismatch
5. Report queue: auto-triage incoming reports by severity

### Severity Matrix
| Signal | Action |
|---|---|
| CSAM detected | Auto-remove + freeze account + escalate P0 to Big Ace |
| Credible threat | Auto-mute + escalate P0 |
| Coordinated spam | Auto-mute + P1 review |
| Profanity in username | Flag for manual review P2 |
| Copyright keyword in beat title | Flag for producer review P3 |
| First-time minor offense | Log only P3 |

### Forbidden
- Cannot permanently ban accounts (Big Ace only)
- Cannot remove verified artist content without P0 trigger
- Cannot access private messages (end-to-end if implemented)

### Logging
- Channel: `bot-logs:content-moderation` | Level: warn | Persist: 365 days
