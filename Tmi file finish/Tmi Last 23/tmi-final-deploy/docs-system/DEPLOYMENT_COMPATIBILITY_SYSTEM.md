# DEPLOYMENT_COMPATIBILITY_SYSTEM.md
## Platform Compatibility — Render + Next.js + Node + Cloudflare + Hostinger
### BerntoutGlobal XXL / The Musician's Index

---

## ARCHITECTURE OVERVIEW

```
Browser / Mobile / TV
       ↓
Cloudflare DNS + CDN
       ↓ (proxy)
Next.js Web App (Cloudflare Pages)
       ↓ (API calls)
Node/NestJS API (Render)
       ↓
PostgreSQL + Redis (Render managed)
       ↓
Cloudflare R2 (media storage)
Hostinger (marketing/static shell — optional)
```

---

## RENDER — API SERVICE

| Setting | Value |
|---|---|
| Service type | Web Service |
| Runtime | Node |
| Root directory | `tmi-platform` |
| Build command | `pnpm install --frozen-lockfile && pnpm -C apps/api run build` |
| Start command | `node apps/api/dist/main.js` |
| Health check path | `/health` |
| Readyz path | `/api/readyz` |
| Node version | 20.x (specify in `.node-version` or `engines` in package.json) |
| Package manager | pnpm only |
| Auto-deploy | On push to `main` |

**Required env vars on Render:** DATABASE_URL, REDIS_URL, NEXTAUTH_SECRET, JWT_SECRET, ALLOWED_ORIGINS, API_BASE_URL, MEDIA_BUCKET_NAME, MEDIA_PUBLIC_URL

**Memory:** Set `NODE_OPTIONS=--max-old-space-size=1024` if heap OOM occurs.

---

## NEXT.JS WEB APP (Cloudflare Pages)

| Setting | Value |
|---|---|
| Framework | Next.js |
| Root directory | `tmi-platform/apps/web` |
| Build command | `pnpm install --frozen-lockfile && pnpm run build` |
| Output directory | `.next` (Cloudflare Pages handles Next.js output automatically) |
| Node version | 20.x |
| Package manager | pnpm |

**Critical:** Cloudflare Pages supports Next.js via `@cloudflare/next-on-pages`.
HUD packages (`@tmi/hud-*`) MUST be built before the web app.

**Pre-build requirement:**
```bash
pnpm install --frozen-lockfile
pnpm -C packages/hud-theme run build
pnpm -C packages/hud-runtime run build
pnpm -C packages/platform-kernel run build
pnpm -C apps/web run build
```

---

## CLOUDFLARE DNS + CDN

| Rule | Setting |
|---|---|
| Web app | CNAME → Cloudflare Pages URL, proxied ON |
| API | CNAME → Render URL, proxied ON |
| Media/CDN | CNAME → Cloudflare R2 public URL |
| Cache level | Standard for most pages |
| API cache bypass | Cache-Control: no-store for /api/* |
| Live/WebSocket bypass | WebSocket routes must bypass Cloudflare cache (config: Disable Performance for /ws/* and /rooms/*) |
| SSL | Full (Strict) |
| Min TLS | TLS 1.2 |
| Browser cache TTL | 4 hours for static assets, bypass for API |

---

## HOSTINGER

Hostinger's role depends on your architecture choice:

**Option A (Recommended): Marketing shell only**
- Hostinger hosts `/features`, `/how-it-works`, `/for-artists`, `/press` as static HTML
- Main app on Cloudflare Pages
- No Node required on Hostinger

**Option B: Full reverse proxy**
- Hostinger reverse proxies to Render API and Cloudflare Pages
- Requires Node.js support on Hostinger plan
- Domain/DNS must point to Hostinger

**Option C: Subdomain split**
- `www.themusiciansindex.com` → Hostinger static
- `app.themusiciansindex.com` → Cloudflare Pages
- `api.themusiciansindex.com` → Render

Recommended: Option A. Keep Hostinger for marketing pages only.
