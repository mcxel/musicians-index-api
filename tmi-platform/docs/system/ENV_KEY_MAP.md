# ENV_KEY_MAP.md
# Environment Variable Map — Canonical Reference
# Repo: tmi-platform
# All keys must be present in .env.example — never commit actual secrets.

## Verification Rule

Before each deploy, run:
```bash
node -e "
const required = require('./scripts/env-check').required;
const missing = required.filter(k => !process.env[k]);
if (missing.length) { console.error('MISSING ENV:', missing); process.exit(1); }
console.log('ENV OK');
"
```

---

## Key Map

### Database

| Key | Required | Env | Description |
|-----|----------|-----|-------------|
| `DATABASE_URL` | CRITICAL | local + prod | PostgreSQL connection string |
| `DIRECT_URL` | CRITICAL | prod | Direct (non-pooled) DB URL for migrations |

### Authentication (NextAuth)

| Key | Required | Env | Description |
|-----|----------|-----|-------------|
| `NEXTAUTH_SECRET` | CRITICAL | local + prod | Secret for JWT/session signing |
| `NEXTAUTH_URL` | CRITICAL | local + prod | Full URL of the app (e.g., `https://tmi.example.com`) |
| `GOOGLE_CLIENT_ID` | optional | local + prod | OAuth provider (Google) |
| `GOOGLE_CLIENT_SECRET` | optional | local + prod | OAuth provider (Google) |

### Stripe (Payments)

| Key | Required | Env | Description |
|-----|----------|-----|-------------|
| `STRIPE_SECRET_KEY` | CRITICAL | prod | Stripe secret key (`sk_live_...`) |
| `STRIPE_PUBLISHABLE_KEY` | CRITICAL | prod | Stripe publishable key (`pk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | CRITICAL | prod | Stripe webhook endpoint secret |
| `STRIPE_SECRET_KEY` (test) | local | local | Use `sk_test_...` for development |

### Email

| Key | Required | Env | Description |
|-----|----------|-----|-------------|
| `EMAIL_SERVER_HOST` | CRITICAL | prod | SMTP host |
| `EMAIL_SERVER_PORT` | CRITICAL | prod | SMTP port (typically 587 or 465) |
| `EMAIL_SERVER_USER` | CRITICAL | prod | SMTP username |
| `EMAIL_SERVER_PASSWORD` | CRITICAL | prod | SMTP password |
| `EMAIL_FROM` | CRITICAL | prod | Sender address (e.g., noreply@tmi.example.com) |

### API Internal

| Key | Required | Env | Description |
|-----|----------|-----|-------------|
| `API_INTERNAL_SECRET` | CRITICAL | local + prod | Shared secret for web → API internal calls |
| `NEXT_PUBLIC_API_URL` | CRITICAL | local + prod | Public-facing API base URL |
| `API_PORT` | optional | local | NestJS API listen port (default 3001) |

### Socket.io / Real-time

| Key | Required | Env | Description |
|-----|----------|-----|-------------|
| `SOCKET_SERVER_URL` | CRITICAL | local + prod | Socket.io server URL |
| `SOCKET_SECRET` | optional | local + prod | Socket auth secret (if auth is gated) |

### Feature Flags

| Key | Required | Env | Description |
|-----|----------|-----|-------------|
| `FEATURE_CYPHER_ENABLED` | optional | local + prod | Enable/disable Cypher module |
| `FEATURE_GAMES_ENABLED` | optional | local + prod | Enable/disable Games module |
| `FEATURE_SPONSOR_ADS_ENABLED` | optional | local + prod | Enable/disable Sponsor Ad injection |

*(Most feature flags are DB-driven via FeatureFlag model — these are emergency overrides only)*

### Monitoring / Observability

| Key | Required | Env | Description |
|-----|----------|-----|-------------|
| `SENTRY_DSN` | recommended | prod | Sentry error tracking DSN |
| `NEXT_PUBLIC_SENTRY_DSN` | recommended | prod | Client-side Sentry DSN |
| `LOG_LEVEL` | optional | local + prod | Log verbosity: `debug` / `info` / `warn` / `error` |

### CDN / Storage (if used)

| Key | Required | Env | Description |
|-----|----------|-----|-------------|
| `STORAGE_BUCKET` | optional | prod | S3-compatible bucket name (for media uploads) |
| `STORAGE_ENDPOINT` | optional | prod | S3-compatible endpoint URL |
| `STORAGE_ACCESS_KEY` | optional | prod | Storage access key |
| `STORAGE_SECRET_KEY` | optional | prod | Storage secret key |

---

## Environment Files

| File | Purpose | Committed? |
|------|---------|-----------|
| `.env.example` | Template with all keys (no values) | YES |
| `.env` | Local dev values | NO (gitignored) |
| `.env.local` | Next.js local overrides | NO (gitignored) |
| `.env.production` | Production values | NO (gitignored) |

---

## Secret Ownership

| Secret | Owner | Rotation Policy |
|--------|-------|----------------|
| `NEXTAUTH_SECRET` | Platform admin | Rotate every 90 days or on breach |
| `STRIPE_SECRET_KEY` | Platform admin / finance | Rotate on breach only |
| `STRIPE_WEBHOOK_SECRET` | Platform admin | Rotate with webhook endpoint changes |
| `API_INTERNAL_SECRET` | Platform admin | Rotate every 90 days |
| `DATABASE_URL` | DevOps | Rotate on breach only |
| Email credentials | Platform admin / DevOps | Per provider policy |

---

## Fail-Fast Rules

On API startup, if any CRITICAL key is missing → API must refuse to start.
Add to `apps/api/src/main.ts`:
```typescript
const REQUIRED = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'API_INTERNAL_SECRET', 'EMAIL_SERVER_HOST'];
REQUIRED.forEach(key => {
  if (!process.env[key]) throw new Error(`Missing required env var: ${key}`);
});
```
