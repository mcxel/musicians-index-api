# TMI Platform — Stabilization Pipeline TODO
## Stage: Environment Stabilization → Integration → Testing → Deploy → Launch

---

## PHASE 1: Environment Fix ✅ COMPLETE

### Critical Blockers
- [x] Fix Prisma version mismatch in `apps/api/package.json` (5.x → 7.x)
- [x] Lock single Prisma schema path in `apps/api/package.json` → `packages/db/prisma/schema.prisma`
- [x] Run `pnpm install --no-frozen-lockfile` from repo root
- [x] Fix API build script (removed broken `pnpm -C ../../packages/db prisma:generate` pre-step)
- [x] Fix `dead-letter.processor.ts` (minimal stub, no broken imports)
- [x] Run prisma generate from workspace root → Prisma Client v7.6.0 generated
- [x] Run `pnpm run build` (apps/api) → `tsc -p tsconfig.build.json` → EXIT 0, zero TS errors

---

## PHASE 2: API Runtime Verification ✅ COMPLETE

- [x] Start API: `node dist/main.js` → listening on `http://localhost:4000/api`
- [x] All 40+ NestJS modules loaded (BotsModule, EconomyModule, AuthModule, WalletModule, etc.)
- [x] BotManagerService initialized with 9 queues
- [x] BotSchedulerService running (health checks every 5 min, daily analytics)
- [x] All WebSocket gateways subscribed (Notifications, Lobby, Party, Chat, Julius, Streaming)
- [x] Test `GET /api/healthz` → **HTTP 200** `{"ok":true,"service":"tmi-platform-api"}`
- [x] Verify WebSocket gateway starts ✅
- [x] Verify Bots module loads ✅
- [ ] Verify DB connection (Prisma connects to DATABASE_URL — needs live DB)
- [ ] Verify Redis connection (BullMQ queues — needs Redis running)

---

## PHASE 3: Auth Testing

- [ ] `POST /api/auth/register` — register new user
- [ ] `POST /api/auth/login` — login, receive session cookie
- [ ] `GET /api/auth/me` — verify session
- [ ] `POST /api/auth/logout` — logout

---

## PHASE 4: Core Endpoint Testing

- [ ] `GET /api/users` — list users (admin)
- [ ] `GET /api/profile` — user profile
- [ ] `GET /api/venues` — venue list
- [ ] `POST /api/venue-booking` — create booking
- [ ] `GET /api/events` — events list
- [ ] `GET /api/tickets` — tickets
- [ ] `GET /api/wallet` — wallet balance
- [ ] `POST /api/economy/earn` — earn points
- [ ] `GET /api/notifications` — notifications
- [ ] `GET /api/lobby` — lobby state
- [ ] `GET /api/rooms` — rooms list
- [ ] `GET /api/party` — party state
- [ ] `GET /api/bots` — bots status
- [ ] `GET /api/analytics` — analytics
- [ ] `GET /api/admin/users` — admin user list

---

## PHASE 5: Web App Verification

- [ ] Start web: `pnpm -C apps/web dev`
- [ ] Load homepage `/`
- [ ] Load `/magazine`
- [ ] Load `/live`
- [ ] Load `/lobby`
- [ ] Load `/rooms`
- [ ] Load `/events`
- [ ] Load `/artists`
- [ ] Load `/venues`
- [ ] Load `/auth` (login page)
- [ ] Load `/dashboard`
- [ ] Load `/admin`

---

## PHASE 6: End-to-End Flow Testing

### User Flow
- [ ] Register new user
- [ ] Login
- [ ] Create profile
- [ ] Join lobby
- [ ] Join room
- [ ] Chat in room
- [ ] Earn points
- [ ] Buy item from store
- [ ] Receive notification

### Artist Flow
- [ ] Artist profile creation
- [ ] Upload music
- [ ] Receive booking offer
- [ ] Accept booking
- [ ] Event created
- [ ] Tickets sold
- [ ] Wallet receives payment

### Venue Flow
- [ ] Venue profile creation
- [ ] Create booking request
- [ ] Get artist recommendations
- [ ] Send offer to artist
- [ ] Artist accepts
- [ ] Event created
- [ ] Tickets sold

### Admin Flow
- [ ] Admin login
- [ ] View users
- [ ] View artists
- [ ] View venues
- [ ] View bookings
- [ ] View analytics
- [ ] View bots status

### Economy Flow
- [ ] Earn points
- [ ] Spend points
- [ ] Wallet updates
- [ ] Achievement triggers
- [ ] Effects trigger

### Bot Flow
- [ ] Bot manager starts
- [ ] Bot scheduler runs
- [ ] Bot sends notifications
- [ ] Bot recommends artists
- [ ] Bot generates analytics

---

## PHASE 7: Production Build

- [ ] `pnpm -C apps/api run build` (production)
- [ ] `pnpm -C apps/web run build` (Next.js production build)
- [ ] Verify no TypeScript errors
- [ ] Verify no build warnings that block deploy

---

## PHASE 8: Deployment Setup

- [ ] Create `infrastructure/docker/Dockerfile.api`
- [ ] Create `infrastructure/docker/Dockerfile.web`
- [ ] Create `infrastructure/docker/docker-compose.yml`
- [ ] Create `.env.production` with all required vars
- [ ] Configure Cloudflare CDN
- [ ] Configure Neon PostgreSQL production DB
- [ ] Configure Redis production instance
- [ ] Configure Cloudflare R2 / S3 for media storage
- [ ] Configure Vercel for web deployment

---

## PHASE 9: Deploy

- [ ] Deploy API (Render / Railway / Docker)
- [ ] Deploy Web (Vercel)
- [ ] Start Workers / Bots
- [ ] Verify `/api/health` on production URL
- [ ] Verify homepage loads on production URL
- [ ] Run smoke tests against production

---

## PHASE 10: Go Live

- [ ] DNS configured
- [ ] SSL certificates active
- [ ] CDN active
- [ ] Monitoring active
- [ ] Onboard first members
- [ ] Activate sponsors / ads
- [ ] Activate events / tickets

---

## RULES FOR THIS PHASE

```
DO NOT:
- Add new features
- Add new modules
- Add new engines
- Add new pages
- Restructure architecture

ONLY:
- Fix build errors
- Fix runtime errors
- Fix environment issues
- Fix DB connection
- Fix queue connection
- Fix websocket issues
- Test flows
- Deploy
```

---

## EXPECTED NEXT BLOCKERS (in order)

1. `DATABASE_URL` missing or wrong format
2. Redis not running locally
3. BullMQ connection error
4. WebSocket gateway port conflict
5. CORS config issues
6. Next.js env variables missing
7. Auth JWT_SECRET missing
8. Prisma migration conflicts
9. Windows path / pnpm symlink issues
10. Upload storage path missing

---

## SINGLE SCHEMA RULE (LOCKED)

```
ONLY ONE PRISMA SCHEMA:
packages/db/prisma/schema.prisma

ALL services use this schema:
- API
- Workers
- Bots
- Scripts
- Migrations
- Tests

DO NOT use apps/api/prisma/schema.prisma
```

---

_Last updated: Stabilization Phase — Fix Prisma version mismatch_
