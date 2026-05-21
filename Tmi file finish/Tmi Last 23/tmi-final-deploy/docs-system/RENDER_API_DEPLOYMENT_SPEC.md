# RENDER_API_DEPLOYMENT_SPEC.md
## NestJS API on Render — Complete Deployment Spec
### BerntoutGlobal XXL / The Musician's Index

---

## RENDER SERVICE CONFIGURATION

| Setting | Value |
|---|---|
| Service Name | tmi-api |
| Runtime | Node |
| Plan | Starter (upgrade to Standard for production) |
| Region | Oregon (us-west-2) or closest to your users |
| Root Directory | `tmi-platform` |
| Build Command | `pnpm install --frozen-lockfile && pnpm -C packages/db run build && pnpm -C apps/api run build` |
| Start Command | `node apps/api/dist/main.js` |
| Auto-Deploy | Yes — branch: main |

---

## HEALTH CHECK CONFIGURATION

```
Health Check Path: /health
Health Check Timeout: 5 seconds
Health Check Grace Period: 30 seconds (wait for NestJS to boot)
```

Required endpoints on the API:
```typescript
// GET /health → { status: 'ok', timestamp: '...' }
// GET /api/readyz → { status: 'ok', db: 'ok', redis: 'ok' }
// GET /api/healthz → { status: 'ok' }
```

---

## DATABASE SETUP ON RENDER

Render Managed PostgreSQL:
- Create a PostgreSQL database service in Render
- Use the **Internal Connection String** for `DATABASE_URL` (faster, no egress cost)
- Use the **External Connection String** for `DATABASE_DIRECT_URL` (for migrations only)

Migrations — run as a pre-deploy hook or one-off command:
```bash
pnpm -C packages/db run db:migrate:prod
# or
npx prisma migrate deploy
```

---

## REDIS SETUP ON RENDER

Render Managed Redis:
- Create a Redis service in Render
- Use the **Internal Redis URL** for `REDIS_URL`
- Required for: room presence, pub/sub, session storage, queue

---

## ROLLBACK ON RENDER

If deploy fails:
1. Go to Render dashboard → service → Deploys
2. Find last successful deploy
3. Click "Rollback to this deploy"
4. Confirm — rolls back in ~30 seconds

---

## PROOF COMMANDS

After every deploy:
```bash
curl https://api.themusiciansindex.com/health
# Expected: {"status":"ok","timestamp":"..."}

curl https://api.themusiciansindex.com/api/readyz
# Expected: {"status":"ok","db":"ok","redis":"ok"}

curl https://api.themusiciansindex.com/api/healthz
# Expected: {"status":"ok"}
```
