# BACKGROUND_JOB_AND_QUEUE_SYSTEM.md
## Async Jobs, Queues, and Scheduled Tasks
### BerntoutGlobal XXL / The Musician's Index

---

## JOB QUEUE ARCHITECTURE

```
API receives request requiring async work
     ↓
Enqueue job to Bull queue (Redis-backed)
     ↓
Return immediate response to client
     ↓
Bull worker picks up job
     ↓
Process job (transcode, send email, etc.)
     ↓
Update DB with result
     ↓
WebSocket push result to client if needed
```

---

## QUEUE DEFINITIONS

| Queue | Worker | Jobs |
|---|---|---|
| `media-processing` | High priority | Transcode audio, resize images, generate thumbnails |
| `notifications` | High priority | Send push, email, in-app notifications |
| `billing` | High priority | Process payments, update entitlements |
| `search-index` | Medium | Index new/updated artist/venue/beat content |
| `analytics` | Low | Batch analytics event processing |
| `email` | Medium | All transactional emails via Resend |
| `moderation` | Medium | Content moderation processing |

---

## SCHEDULED TASKS (CRON)

| Task | Schedule | System |
|---|---|---|
| billing-integrity-bot | Every 4 hours | BILLING_INTEGRITY_BOT_SYSTEM.md |
| world-simulation-bot | Every 5 minutes | WORLD_SIMULATION_BOT_SYSTEM.md |
| load-spike-bot | Every 1 minute | LOAD_SPIKE_BOT_SYSTEM.md |
| ranking-update-bot | Post-events + Sun midnight | RANKING_UPDATE_BOT_SYSTEM.md |
| weekly-digest-bot | Sunday 8am | Send weekly artist digest emails |
| search-reindex | Daily 3am | Full search index rebuild |
| media-cleanup | Daily 2am | Remove orphaned media files |
| session-cleanup | Every hour | Remove expired sessions from Redis |
| db-vacuum | Weekly | PostgreSQL VACUUM ANALYZE |

---

## FAILURE HANDLING

Failed jobs: retry ×3 with exponential backoff.
After 3 failures: move to dead letter queue, alert Big Ace.
Dead letter queue reviewed weekly.
