# DEPLOYMENT RUNBOOK
# TMI Platform — BerntoutGlobal XXL
# Exact deploy steps: Cloudflare + Hostinger + IONOS + Render
# Run PHASE18_PROOF_GATE.ps1 first. All checks must pass before deploying.

---

## PRE-DEPLOY CHECKLIST (run every time before deploying)

```powershell
.\PHASE18_PROOF_GATE.ps1
```
If any check fails → STOP. Fix it first.

---

## PLATFORM ARCHITECTURE

| Layer | Service | What it handles |
|---|---|---|
| Frontend (Next.js) | Hostinger or Vercel | Web app — apps/web |
| API (NestJS) | Render | Backend API — apps/api |
| Database (PostgreSQL) | Render Postgres or IONOS | Prisma DB |
| Edge/CDN | Cloudflare | DNS + caching + Worker + DDoS |
| Domain | IONOS | DNS registrar + any static hosting |
| Static assets | Cloudflare R2 or Hostinger | Images, uploaded files |

---

## DEPLOY STEP 1 — DATABASE (Render Postgres)

### If first deploy
1. Go to render.com → New → PostgreSQL
2. Name: `tmi-platform-db`
3. Region: Oregon (or nearest to your audience)
4. Plan: Starter ($7/mo) or free
5. Copy the **External Connection URL** — save it as `DATABASE_URL`
6. Paste into `apps/api/.env` as `DATABASE_URL=postgres://...`

### Run migrations against production DB
```powershell
# In your local repo — pointing at production DATABASE_URL
$env:DATABASE_URL = "YOUR_RENDER_POSTGRES_URL_HERE"
cd "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform"
npx prisma migrate deploy
npx prisma generate
```
Note: Use `migrate deploy` (not `migrate dev`) for production.

---

## DEPLOY STEP 2 — API (Render Web Service)

### Create the service
1. render.com → New → Web Service
2. Connect GitHub repo: `BerntoutGlobal XXL / tmi-platform`
3. Name: `tmi-api`
4. Root Directory: `apps/api`
5. Build Command: `pnpm install && pnpm build`
6. Start Command: `node dist/main`
7. Node version: 18.x (set in Environment)

### Environment variables to set in Render dashboard

```
NODE_ENV=production
PORT=4000
DATABASE_URL=<your Render Postgres URL>
JWT_SECRET=<generate: openssl rand -hex 64>
JWT_REFRESH_SECRET=<generate: openssl rand -hex 64>
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=https://yourdomain.com
COOKIE_DOMAIN=yourdomain.com
SESSION_SECRET=<generate: openssl rand -hex 32>
CSRF_SECRET=<generate: openssl rand -hex 32>
CONTEST_REGISTRATION_DAY=8
CONTEST_REGISTRATION_MONTH=8
CONTEST_MAX_LOCAL_SPONSORS=10
CONTEST_MAX_MAJOR_SPONSORS=10
CONTEST_SEASON_NAME=Grand Platform Contest — Season 1
```

### Deploy
1. Click "Create Web Service"
2. Render auto-deploys on every push to main
3. Wait for deploy to complete
4. Test: `GET https://your-render-api-url.onrender.com/api/healthz`

### Verify API is live
```
GET https://tmi-api.onrender.com/api/healthz
Expected: {"status":"ok","build":"...","release":"..."}

GET https://tmi-api.onrender.com/api/readyz
Expected: {"status":"ready"}
```

---

## DEPLOY STEP 3 — FRONTEND (Hostinger or Vercel)

### Option A: Hostinger (if using their Node.js hosting)

1. Hostinger Control Panel → Hosting → Manage
2. File Manager or Git Deploy
3. Set Node.js version: 18.x
4. Build command: `pnpm install && pnpm -C apps/web build`
5. Start command: `pnpm -C apps/web start`
6. Or use PM2: `pm2 start "pnpm -C apps/web start" --name tmi-web`

Environment variables in Hostinger:
```
NEXT_PUBLIC_API_URL=https://tmi-api.onrender.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate: openssl rand -hex 32>
```

### Option B: Vercel (recommended for Next.js, easiest)

1. vercel.com → Import Project → GitHub
2. Select: `BerntoutGlobal XXL / tmi-platform`
3. Framework Preset: Next.js
4. Root Directory: `apps/web`
5. Set env vars (same as above)
6. Deploy

Vercel auto-deploys on every push to main.

### Verify frontend is live
```
GET https://yourdomain.com → should render homepage
GET https://yourdomain.com/auth → should render login page
GET https://yourdomain.com/contest → should render contest page
```

---

## DEPLOY STEP 4 — CLOUDFLARE (DNS + CDN + Edge)

### DNS Setup (Cloudflare)
1. cloudflare.com → Add site → enter your domain
2. Change nameservers at IONOS to Cloudflare's nameservers
3. Add DNS records:
   ```
   Type  Name    Value                          Proxy
   A     @       <Hostinger/Vercel IP>          ✓ (proxied)
   CNAME www     yourdomain.com                 ✓ (proxied)
   CNAME api     tmi-api.onrender.com           ✓ (proxied)
   ```

### Cloudflare Worker (bg-api-worker.js)
If you have a Cloudflare Worker for API routing:
1. Cloudflare Dashboard → Workers → Create Worker
2. Paste `worker-core.js` content
3. Set routes: `api.yourdomain.com/*`
4. Add environment variables in Worker settings

### SSL/TLS
- Cloudflare → SSL/TLS → Full (Strict)
- Enable HSTS
- Enable "Always use HTTPS"

### Performance
- Cache rules: cache `/contest/*` pages at edge
- Minify: JS + CSS + HTML
- Enable Brotli compression

---

## DEPLOY STEP 5 — IONOS (domain registration + any static assets)

### Domain pointing (if domain is at IONOS)
1. IONOS → Domains → Manage DNS
2. Change nameservers to Cloudflare's NS values
3. OR: point A record directly to Hostinger IP

### Email (if using IONOS email)
1. IONOS → Email → Add mailbox
2. Add MX records in Cloudflare DNS
3. Platform notifications from: noreply@yourdomain.com

---

## POST-DEPLOY SMOKE TEST

Run immediately after every deploy:

```powershell
# Replace with your live URLs
$API = "https://tmi-api.onrender.com"
$WEB = "https://yourdomain.com"

# API health
try { (Invoke-WebRequest -UseBasicParsing "$API/api/healthz").Content } catch { "API FAIL: $_" }
try { (Invoke-WebRequest -UseBasicParsing "$API/api/readyz").Content } catch { "API READYZ FAIL: $_" }

# Web routes
try { (Invoke-WebRequest -UseBasicParsing "$WEB/auth").StatusCode } catch { "WEB /auth FAIL: $_" }
try { (Invoke-WebRequest -UseBasicParsing "$WEB/contest").StatusCode } catch { "WEB /contest FAIL: $_" }
```

All should return 200. If anything fails → see ROLLBACK_RUNBOOK.md

---

## FIRST DEPLOY TIMING

Estimated time for first clean deploy:
| Step | Time |
|---|---|
| DB provision + migration | ~10 min |
| API deploy on Render | ~8 min |
| Frontend deploy (Vercel) | ~5 min |
| Cloudflare DNS propagation | ~15 min |
| Smoke test pass | ~5 min |
| **Total** | **~45 min** |

---

*BerntoutGlobal XXL | TMI Platform | Deployment Runbook | Phase 18.2*
