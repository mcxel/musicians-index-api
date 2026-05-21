# ENV_VARIABLE_CONTRACT.md
## Every Environment Variable — What It Does, Required or Optional, Failure Impact
### BerntoutGlobal XXL / The Musician's Index

---

## API REQUIRED VARIABLES

| Variable | What It Does | Required | Failure If Missing |
|---|---|---|---|
| DATABASE_URL | Prisma DB connection | ✅ YES | API crashes at startup |
| DATABASE_DIRECT_URL | Direct DB connection (bypass pooler) | ✅ YES | Migrations fail |
| JWT_SECRET | Signs JWT tokens (min 32 chars) | ✅ YES | All auth fails |
| NEXTAUTH_SECRET | NextAuth session encryption | ✅ YES | Sessions don't persist |
| REDIS_URL | Room presence, pub/sub, queue | ✅ YES | Live rooms, HUD fail |
| ALLOWED_ORIGINS | CORS whitelist | ✅ YES | Web-API calls blocked |
| API_BASE_URL | Self-reference URL | ✅ YES | Webhook handling fails |
| MEDIA_BUCKET_NAME | R2/S3 bucket | ✅ YES | File uploads fail |
| MEDIA_STORAGE_PROVIDER | r2 / s3 / local | ✅ YES | Asset service crashes |

## WEB REQUIRED VARIABLES (NEXT_PUBLIC_ exposed to browser)

| Variable | What It Does | Required | Failure If Missing |
|---|---|---|---|
| NEXT_PUBLIC_API_URL | API base URL for browser calls | ✅ YES | All API calls fail |
| NEXT_PUBLIC_WS_URL | WebSocket URL for live rooms | ✅ YES | Live rooms fail |
| NEXT_PUBLIC_MEDIA_URL | CDN base for media assets | ✅ YES | Images/audio fail |
| NEXT_PUBLIC_ENVIRONMENT | development / preview / production | ✅ YES | Feature flags may misfire |
| NEXTAUTH_URL | Full web app public URL | ✅ YES | Auth redirect fails |

## OPTIONAL BUT IMPORTANT

| Variable | What It Does | Required | Notes |
|---|---|---|---|
| STRIPE_SECRET_KEY | Subscription billing | Recommended | Without: no subscriptions |
| STRIPE_WEBHOOK_SECRET | Validates Stripe events | Recommended | Without: entitlement never updates |
| RESEND_API_KEY | Transactional email | Recommended | Without: no email notifications |
| ELEVENLABS_API_KEY | Stage Director Bot TTS | Optional | Falls back to text announcement |
| SENTRY_DSN | Error tracking | Optional | Without: errors invisible |
| LOGTAIL_SOURCE_TOKEN | Log aggregation | Optional | Without: logs only in console |

## PRODUCTION RULES

- NEXTAUTH_SECRET and JWT_SECRET must be different in every environment
- DATABASE_URL must use connection pooler (pgBouncer) in production
- DATABASE_DIRECT_URL must bypass pooler (for migrations only)
- ALLOWED_ORIGINS must include www. AND non-www versions
- Never commit .env files — use platform secret management
