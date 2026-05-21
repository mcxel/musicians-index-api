# FINAL_ENVIRONMENT_MATRIX.md
## Every Environment — URLs, Secrets, Rules
### BerntoutGlobal XXL / The Musician's Index

---

## ENVIRONMENT MAP

| Variable | Local | Preview/Staging | Production |
|---|---|---|---|
| WEB_URL | http://localhost:3000 | https://preview-*.pages.dev | https://themusiciansindex.com |
| API_URL | http://localhost:4000 | https://api-preview.render.com | https://api.themusiciansindex.com |
| DATABASE_URL | postgresql://localhost:5432/tmi_dev | (Render preview DB) | (Render production DB) |
| REDIS_URL | redis://localhost:6379 | (Render preview Redis) | (Render production Redis) |
| NEXTAUTH_URL | http://localhost:3000 | https://preview-*.pages.dev | https://themusiciansindex.com |
| WEBSOCKET_URL | ws://localhost:4000 | wss://api-preview.render.com | wss://api.themusiciansindex.com |
| MEDIA_BASE_URL | http://localhost:3000/media | https://media-preview.r2.dev | https://media.themusiciansindex.com |
| CDN_URL | (none) | (Cloudflare R2 public) | https://cdn.themusiciansindex.com |
| ENVIRONMENT | development | preview | production |
| DEBUG_MODE | true | false | false |

---

## REQUIRED VARIABLES — ALL ENVIRONMENTS

```env
# ── DATABASE ──────────────────────────────────
DATABASE_URL=              # PostgreSQL connection string
DATABASE_DIRECT_URL=       # Direct connection (bypass pooler for migrations)

# ── AUTH/SESSION ──────────────────────────────
NEXTAUTH_URL=              # Full public web URL
NEXTAUTH_SECRET=           # Min 32 chars random string — NEVER same across environments
JWT_SECRET=                # Min 32 chars random string

# ── CORS / ORIGINS ────────────────────────────
ALLOWED_ORIGINS=           # Comma-separated: https://themusiciansindex.com,https://www.themusiciansindex.com
API_BASE_URL=              # Public API URL as seen from web app

# ── MEDIA / ASSETS ────────────────────────────
MEDIA_STORAGE_PROVIDER=    # r2 | s3 | local
MEDIA_BUCKET_NAME=         # R2/S3 bucket name
MEDIA_PUBLIC_URL=          # Public CDN URL for media

# ── LIVE / ROOMS ──────────────────────────────
WEBSOCKET_URL=             # wss:// for production, ws:// for local
REDIS_URL=                 # Redis connection for room presence and pub/sub
```

---

## OPTIONAL VARIABLES

```env
# ── BILLING ───────────────────────────────────
STRIPE_SECRET_KEY=         # Stripe server key
STRIPE_WEBHOOK_SECRET=     # Webhook signing secret
STRIPE_PUBLISHABLE_KEY=    # Public key (safe to expose on web)
APPLE_IAP_SHARED_SECRET=   # For iOS subscription verification
GOOGLE_PLAY_JSON=          # Service account JSON for Android verification

# ── NOTIFICATIONS ─────────────────────────────
RESEND_API_KEY=            # Transactional email
PUSH_NOTIFICATION_KEY=     # Web push VAPID key

# ── TTS / BOTS ────────────────────────────────
ELEVENLABS_API_KEY=        # Stage Director Bot voice announcements

# ── MONITORING ────────────────────────────────
SENTRY_DSN=                # Error tracking
LOGTAIL_SOURCE_TOKEN=      # Log aggregation
ANALYTICS_API_KEY=         # Analytics service
```

---

## FAIL-FAST VARIABLES (Server won't start without these)

```typescript
// apps/api/src/startup/env-check.ts
const REQUIRED = [
  'DATABASE_URL', 'NEXTAUTH_SECRET', 'JWT_SECRET',
  'REDIS_URL', 'API_BASE_URL', 'ALLOWED_ORIGINS',
];
```

---

## LOCAL DEVELOPMENT .env.local TEMPLATE

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tmi_dev
DATABASE_DIRECT_URL=postgresql://postgres:postgres@localhost:5432/tmi_dev
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-min-32-chars-replace-me-!!
JWT_SECRET=dev-jwt-secret-min-32-chars-replace!!
API_BASE_URL=http://localhost:4000
ALLOWED_ORIGINS=http://localhost:3000
REDIS_URL=redis://localhost:6379
MEDIA_STORAGE_PROVIDER=local
ENVIRONMENT=development
DEBUG_MODE=true
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
NEXT_PUBLIC_MEDIA_URL=http://localhost:3000/media
NEXT_PUBLIC_ENVIRONMENT=development
```
