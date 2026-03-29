# ENV_VAR_MASTER_LIST.md
## Every Environment Variable — Final Master Reference
### BerntoutGlobal XXL / The Musician's Index

One source of truth. Configure these before any deploy.

---

## API (.env for apps/api)

### REQUIRED — App crashes without these
```env
# Database
DATABASE_URL=postgresql://[user]:[pass]@[host]:[port]/[db]?pgbouncer=true
DATABASE_DIRECT_URL=postgresql://[user]:[pass]@[host]:[port]/[db]  # migrations only

# Auth
JWT_SECRET=[min-32-char-random-string]
NEXTAUTH_SECRET=[min-32-char-random-string]  # same value as web NEXTAUTH_SECRET

# Redis
REDIS_URL=redis://[host]:[port]

# CORS
ALLOWED_ORIGINS=https://themusiciansindex.com,https://www.themusiciansindex.com

# Platform
NODE_ENV=production
PORT=4000
API_BASE_URL=https://api.themusiciansindex.com
WEB_URL=https://themusiciansindex.com
```

### REQUIRED — Commerce crashes without these
```env
# Stripe
STRIPE_SECRET_KEY=sk_live_[...]
STRIPE_WEBHOOK_SECRET=whsec_[...]
STRIPE_PLATFORM_ACCOUNT_ID=[acct_...]  # your main Stripe account for payouts

# PayPal (owner profit distribution)
PAYPAL_CLIENT_ID=[...]
PAYPAL_CLIENT_SECRET=[...]
PAYPAL_MODE=live  # or 'sandbox' for testing
```

### REQUIRED — Media broken without these
```env
# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=[...]
R2_ACCESS_KEY_ID=[...]
R2_SECRET_ACCESS_KEY=[...]
R2_BUCKET_NAME=tmi-media
MEDIA_PUBLIC_URL=https://cdn.themusiciansindex.com
```

### REQUIRED — Notifications broken without these
```env
# Email (Resend)
RESEND_API_KEY=re_[...]
RESEND_FROM_EMAIL=noreply@themusiciansindex.com

# Web Push (VAPID)
VAPID_PUBLIC_KEY=[generate with: npx web-push generate-vapid-keys]
VAPID_PRIVATE_KEY=[from same command]
VAPID_SUBJECT=mailto:hello@themusiciansindex.com
```

### REQUIRED — Anti-bot broken without these
```env
# Cloudflare Turnstile (ticket purchase protection)
CLOUDFLARE_TURNSTILE_SECRET=[...]
```

### OPTIONAL but strongly recommended
```env
# Error tracking
SENTRY_DSN=https://[key]@sentry.io/[project]

# Log aggregation
LOGTAIL_SOURCE_TOKEN=[...]

# Stage Director Bot TTS
ELEVENLABS_API_KEY=[...]

# Platform operation
NODE_OPTIONS=--max-old-space-size=1024  # add if heap OOM on Render
```

---

## WEB (.env.local for apps/web)

### REQUIRED — Web app broken without these
```env
# API connection
NEXT_PUBLIC_API_URL=https://api.themusiciansindex.com
NEXT_PUBLIC_WS_URL=wss://api.themusiciansindex.com
NEXT_PUBLIC_MEDIA_URL=https://cdn.themusiciansindex.com
NEXT_PUBLIC_ENVIRONMENT=production

# Auth
NEXTAUTH_URL=https://themusiciansindex.com
NEXTAUTH_SECRET=[same as API NEXTAUTH_SECRET]

# Stripe (public key only — safe to expose)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_[...]

# Anti-bot (public Turnstile site key — safe to expose)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=[...]

# Web Push (public VAPID key — safe to expose)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=[same as API VAPID_PUBLIC_KEY]
```

### OPTIONAL
```env
# Error tracking (frontend)
NEXT_PUBLIC_SENTRY_DSN=[sentry project DSN]
NEXT_PUBLIC_ENVIRONMENT=production  # used by Sentry environment tagging
```

---

## LOCAL DEVELOPMENT (.env.local for both)

```env
# Use these values for local dev only:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tmi_dev
DATABASE_DIRECT_URL=postgresql://postgres:postgres@localhost:5432/tmi_dev
JWT_SECRET=dev-secret-32-chars-minimum-length!!
NEXTAUTH_SECRET=dev-nextauth-32-chars-minimum!!
REDIS_URL=redis://localhost:6379
ALLOWED_ORIGINS=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
NEXT_PUBLIC_MEDIA_URL=http://localhost:3000/media
MEDIA_STORAGE_PROVIDER=local
NODE_ENV=development
NEXT_PUBLIC_ENVIRONMENT=development

# Use Stripe test keys for local:
STRIPE_SECRET_KEY=sk_test_[...]
STRIPE_WEBHOOK_SECRET=whsec_[use stripe listen --forward-to]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_[...]

# Use Turnstile test key (always passes):
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
CLOUDFLARE_TURNSTILE_SECRET=1x0000000000000000000000000000000AA
```

---

## FAIL-FAST CHECK (verify this runs on API startup)

```typescript
// apps/api/src/startup/env-check.ts
const REQUIRED = [
  'DATABASE_URL','REDIS_URL','JWT_SECRET','NEXTAUTH_SECRET',
  'ALLOWED_ORIGINS','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET',
  'R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY','RESEND_API_KEY',
  'VAPID_PRIVATE_KEY','CLOUDFLARE_TURNSTILE_SECRET',
];
for (const key of REQUIRED) {
  if (!process.env[key]) { console.error(`FATAL: Missing ${key}`); process.exit(1); }
}
```
