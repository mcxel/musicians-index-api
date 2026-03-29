# RATE_LIMITING_AND_ABUSE_SYSTEM.md
## Rate Limiting, Spam Prevention, and Abuse Detection
### BerntoutGlobal XXL / The Musician's Index

---

## RATE LIMITS BY ENDPOINT

| Endpoint | Limit | Window | By |
|---|---|---|---|
| GET /api/* | 300 | 1 min | IP |
| POST /api/auth/* | 10 | 5 min | IP |
| POST /api/rooms/*/join | 5 | 1 min | User |
| POST /api/chat | 30 | 1 min | User |
| POST /api/tips | 10 | 1 min | User |
| POST /api/upload | 5 | 1 min | User |
| POST /api/search | 60 | 1 min | IP |
| POST /api/report | 5 | 10 min | User |
| WebSocket connections | 3 | — | User (concurrent) |

---

## RATE LIMIT IMPLEMENTATION (NestJS)

```typescript
// Use @nestjs/throttler
ThrottlerModule.forRoot([{
  name: 'short', ttl: 1000, limit: 10,
  name: 'long',  ttl: 60000, limit: 300,
}])
```

---

## SPAM DETECTION SIGNALS

Spam score increases when:
- Same message posted > 3× in 2 minutes (chat flood)
- Account created < 5 min ago + joining rooms aggressively
- Following > 50 users in 1 hour
- Reporting > 10 items in 1 hour (false report abuse)
- Multiple failed payment attempts

## ABUSE DETECTION

Auto-flag for review:
- 3+ reports received on same content in 1 hour
- User receiving 5+ kick votes in 1 room
- IP associated with known abuse patterns (Cloudflare Turnstile)

## BOT PREVENTION

All auth forms protected by Cloudflare Turnstile (invisible challenge).
Rate limiting at both Cloudflare edge AND NestJS application layer.
