# CLOUDFLARE_AND_PROXY_COMPATIBILITY.md
## Cloudflare DNS, CDN, Proxy, and WebSocket Rules
### BerntoutGlobal XXL / The Musician's Index

---

## DNS SETUP

```
themusiciansindex.com          A/CNAME → Cloudflare Pages    Proxied: ON
www.themusiciansindex.com      CNAME   → Cloudflare Pages    Proxied: ON
api.themusiciansindex.com      CNAME   → Render API URL      Proxied: ON
cdn.themusiciansindex.com      CNAME   → R2 Public URL       Proxied: ON
media.themusiciansindex.com    CNAME   → R2 Public URL       Proxied: ON
```

---

## CACHE RULES (Critical)

These routes must NEVER be cached by Cloudflare:

```
/api/*          Cache-Control: no-store, no-cache
/auth/*         Cache-Control: no-store
/live/*         WebSocket — bypass cache completely
/rooms/*        WebSocket — bypass cache completely
/ws/*           WebSocket — bypass cache completely
```

Static assets that SHOULD be cached:
```
/_next/static/* Cache-Control: max-age=31536000, immutable
/media/*        Cache-Control: max-age=86400
/cdn/*          Cache-Control: max-age=86400
```

---

## WEBSOCKET COMPATIBILITY

Cloudflare proxies WebSocket connections when:
- The plan supports it (Free plan supports WebSockets)
- `cf-connecting-ip` and `x-forwarded-for` headers are forwarded
- SSL is Full (Strict)

Cloudflare Page Rules needed:
```
Pattern: api.themusiciansindex.com/ws/*
Setting: Disable Performance, Disable Security (cache bypass)
```

---

## HEADER FORWARDING

Ensure these headers pass through to Render:
```
X-Forwarded-For       Forwarded by Cloudflare automatically
X-Forwarded-Proto     Forwarded by Cloudflare automatically
CF-Connecting-IP      Cloudflare client IP
CF-Ray                Cloudflare request ID (useful for debugging)
```

In NestJS, enable trust proxy:
```typescript
// apps/api/src/main.ts
app.set('trust proxy', 1); // Trust first proxy (Cloudflare)
```

---

## SSL / TLS

- SSL Mode: **Full (Strict)** — both Cloudflare-to-origin AND browser-to-Cloudflare are TLS
- Minimum TLS: 1.2
- HSTS: Enable after initial deployment is confirmed working
- Certificate: Cloudflare provides for *.themusiciansindex.com

---

## COMMON MISTAKES TO AVOID

❌ Setting SSL to "Flexible" — causes redirect loops
❌ Caching API routes — breaks live data
❌ Not forwarding WebSocket headers — live rooms fail silently
❌ Blocking CF-* headers — breaks IP detection for moderation
❌ Setting Cloudflare Rocket Loader on Next.js — breaks hydration
