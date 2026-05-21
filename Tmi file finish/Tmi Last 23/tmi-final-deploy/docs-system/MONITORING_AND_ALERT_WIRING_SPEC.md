# MONITORING_AND_ALERT_WIRING_SPEC.md
## How Monitoring, Alerts, and Error Tracking Are Wired
### BerntoutGlobal XXL / The Musician's Index

---

## MONITORING STACK

| Tool | Purpose | Where |
|---|---|---|
| Render Metrics | CPU, memory, request count | Render dashboard |
| Sentry | Error tracking (frontend + API) | Sentry.io |
| Logtail | Log aggregation | betterstack.com |
| Cloudflare Analytics | Edge traffic, cache hit rate | Cloudflare dashboard |
| Bot-level monitoring | Room health, queue health | PLATFORM_WATCHDOG_MESH.md |
| SLO tracking | Uptime per service | SLO_AND_ALERTING_SYSTEM.md |

---

## SENTRY SETUP

```typescript
// apps/web/src/app/layout.tsx — add Sentry browser init
// apps/api/src/main.ts — add Sentry node init

// Environment: Use separate Sentry DSNs for staging and production
SENTRY_DSN_WEB=https://...@sentry.io/...
SENTRY_DSN_API=https://...@sentry.io/...
```

---

## ALERT CHANNELS

P0 (Platform Down): SMS + Email to Big Ace immediately
P1 (Critical feature down): Slack/Discord + Email
P2 (Degraded performance): Slack/Discord
P3 (Warning): Log only, weekly review

Configure alerts in:
- Render: Add alert rules in service settings
- Cloudflare: Add email alerts for error rate spikes
- Sentry: Configure alert rules per project

---

## LOG LEVELS

```typescript
// Use structured logging everywhere
logger.error('...')  // P0/P1 — requires immediate attention
logger.warn('...')   // P2/P3 — review in next cycle
logger.info('...')   // Normal operational events
logger.debug('...')  // Dev only — never in production
```

---

## UPTIME MONITORING

Set up uptime checks (free tier available on BetterStack/UptimeRobot):
```
https://themusiciansindex.com/               → check every 1 min
https://api.themusiciansindex.com/health     → check every 1 min
https://api.themusiciansindex.com/api/readyz → check every 1 min
```
