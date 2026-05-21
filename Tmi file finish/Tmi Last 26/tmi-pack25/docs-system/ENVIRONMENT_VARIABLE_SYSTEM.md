# ENVIRONMENT_VARIABLE_SYSTEM.md
## Every Environment Variable — Complete Reference
### BerntoutGlobal XXL / The Musician's Index

---

## API (.env for apps/api)

```env
# Database
DATABASE_URL=postgresql://...
DATABASE_DIRECT_URL=postgresql://...  # bypass pooler for migrations

# Auth
JWT_SECRET=                           # min 32 chars
NEXTAUTH_SECRET=                      # min 32 chars

# Redis
REDIS_URL=redis://...

# CORS
ALLOWED_ORIGINS=https://themusiciansindex.com,https://www.themusiciansindex.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Media / R2
CLOUDFLARE_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=tmi-media
MEDIA_PUBLIC_URL=https://cdn.themusiciansindex.com

# Email (Resend)
RESEND_API_KEY=re_...

# Bot APIs
ELEVENLABS_API_KEY=                   # Stage Director Bot TTS

# Monitoring
SENTRY_DSN=
LOGTAIL_SOURCE_TOKEN=

# Anti-bot
CLOUDFLARE_TURNSTILE_SECRET=

# Web Push (VAPID)
VAPID_PRIVATE_KEY=
VAPID_PUBLIC_KEY=

# Platform
NODE_ENV=production
PORT=4000
API_BASE_URL=https://api.themusiciansindex.com
WEB_URL=https://themusiciansindex.com
```

## WEB (.env.local for apps/web)

```env
# API connection
NEXT_PUBLIC_API_URL=https://api.themusiciansindex.com
NEXT_PUBLIC_WS_URL=wss://api.themusiciansindex.com
NEXT_PUBLIC_MEDIA_URL=https://cdn.themusiciansindex.com
NEXT_PUBLIC_ENVIRONMENT=production

# Auth
NEXTAUTH_URL=https://themusiciansindex.com
NEXTAUTH_SECRET=                      # same as API JWT_SECRET

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Anti-bot (public Turnstile site key)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=

# Web Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=
```

## FAIL-FAST CHECK (API startup)

```typescript
// apps/api/src/startup/env-check.ts
const REQUIRED_AT_STARTUP = [
  'DATABASE_URL', 'REDIS_URL', 'JWT_SECRET', 'NEXTAUTH_SECRET',
  'ALLOWED_ORIGINS', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET',
];
for (const key of REQUIRED_AT_STARTUP) {
  if (!process.env[key]) {
    console.error(`FATAL: Missing required env var: ${key}`);
    process.exit(1);
  }
}
```
