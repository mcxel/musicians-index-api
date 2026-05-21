# NEXTJS_PRODUCTION_RUNTIME_SPEC.md
## Next.js App Router — Route Types, SSR/CSR Rules, Middleware
### BerntoutGlobal XXL / The Musician's Index

---

## ROUTE TYPE CLASSIFICATION

| Route Pattern | Type | Why |
|---|---|---|
| `/` | Static + ISR | Crown data revalidates every 60s |
| `/live` | Dynamic SSR | Real-time room list |
| `/editorial` | Static + ISR | Articles revalidate every 300s |
| `/artists/[slug]` | Dynamic SSR | Artist data is user-specific |
| `/venues/[slug]` | Dynamic SSR | Room occupancy is live |
| `/events/[slug]` | Dynamic SSR | Event state changes |
| `/arena`, `/battle`, `/cypher` | CSR only | WebSocket-heavy, no SSR |
| `/admin/*` | Dynamic SSR + auth | Admin data must be fresh |
| `/terms`, `/privacy` | Static | Never changes |
| `/features`, `/how-it-works` | Static | Marketing pages |

---

## MIDDLEWARE BEHAVIOR (middleware.ts)

The middleware runs on EVERY request before rendering.
Must be fast — no DB calls allowed in middleware.

```typescript
// Current middleware checks:
// 1. Session cookie presence (not DB call — just checks existence)
// 2. Role-based routing (from session payload only)
// 3. Redirect /dashboard → role-specific dashboard
// 4. Protect /admin/* routes (check session.role === 'ADMIN')

// DO NOT ADD TO MIDDLEWARE:
// - DB calls (too slow)
// - API calls (latency)
// - Heavy computation
// - Image processing
```

---

## SERVER VS CLIENT ENV VARIABLE RULES

```typescript
// Server only (never exposed to browser) — no NEXT_PUBLIC_ prefix:
DATABASE_URL, JWT_SECRET, NEXTAUTH_SECRET, STRIPE_SECRET_KEY

// Client safe (NEXT_PUBLIC_ prefix required):
NEXT_PUBLIC_API_URL, NEXT_PUBLIC_WS_URL, NEXT_PUBLIC_MEDIA_URL, NEXT_PUBLIC_ENVIRONMENT
```

---

## IMAGE HANDLING

Next.js Image component with Cloudflare R2:
```typescript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.themusiciansindex.com' },
      { protocol: 'https', hostname: '*.r2.dev' },
    ],
  },
};
```

---

## HYDRATION RULES

Room pages (Arena, Cypher, Battle, etc.) are CLIENT-SIDE ONLY:
```typescript
// Room page pattern:
'use client';
export default function ArenaPage() {
  // WebSocket + providers — all client side
  // No server data fetching — use useEffect hooks
}
```

---

## TRANSPILE PACKAGES

Add to `next.config.js` to fix monorepo build issues:
```javascript
transpilePackages: [
  '@tmi/hud-runtime',
  '@tmi/hud-theme',
  '@tmi/platform-kernel',
],
```

This is likely the root cause of the current Cloudflare build blocker.
