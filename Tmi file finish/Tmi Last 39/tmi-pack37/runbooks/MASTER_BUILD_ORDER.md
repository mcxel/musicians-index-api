# TMI MASTER BUILD ORDER (Pack 37)
## Exact Brick-by-Brick Sequence From Current State to Full Platform

---

## CURRENT STATE
- Web: running ✅
- API: running ✅  
- DB: connected ✅
- Packs 25-36: 249 files delivered ✅

## THE CORRECT ORDER (Do NOT change)

---

### WAVE 1 — SCHEMA + DATABASE (Do This First)
**Blocks everything. No shortcuts.**

```bash
# Step 1: Backup current schema
cd packages/db
cp prisma/schema.prisma prisma/schema.backup.prisma

# Step 2: Append Pack 37 models to existing schema
# (never replace — append-only)
# Add all new models from schema/schema-full.prisma

# Step 3: Run migration
pnpm prisma migrate dev --name pack37_full_schema

# Step 4: Regenerate client
pnpm prisma generate

# Step 5: Confirm all tables created
pnpm prisma studio  # visual check
```

**Success proof:** `pnpm prisma db pull` shows all 55+ new tables

---

### WAVE 2 — BACKEND MODULES (API)
**Run after Wave 1. Add one module at a time.**

Order within Wave 2:
1. `feature-flags` — feature flags module (no dependencies)
2. `auth` — JWT, OAuth, sessions (depends on: User, Session, Account)
3. `users` — CRUD (depends on: auth)
4. `profiles` — public profiles (depends on: users)
5. `artists` — artist CRUD (depends on: profiles)
6. `wallet` — balance, transactions (depends on: users)
7. `points` — ledger, earn, caps (depends on: users)
8. `notifications` — send, mark read (depends on: users)
9. `media` — upload, CDN (depends on: users)
10. `articles` — CRUD, publish (depends on: artists)
11. `ads` — always-200 endpoint (Platform Law #7)
12. `rooms` — create, join, discovery-first (depends on: users)
13. `livestream` — stream key, HLS (depends on: rooms)
14. `chat` — conversations, canSendMessage (depends on: rooms, users)
15. `events` — CRUD, lineup (depends on: venues, artists)
16. `tickets` — tier, purchase, QR (depends on: events, wallet)
17. `store` — products, cart, checkout (depends on: artists, wallet)
18. `games` — sessions, rounds, scoring (depends on: rooms)
19. `economy` — items, shop, inventory (depends on: points)
20. `bots` — run, log, monitor (depends on: all above)
21. `admin` — audit, approvals (depends on: all above)
22. `analytics` — event ingestion (depends on: all above)

For each module create:
```
apps/api/src/modules/[name]/
  [name].controller.ts
  [name].service.ts
  [name].module.ts
  dto/[name].dto.ts
  [name].repository.ts
  [name].guard.ts       (if auth needed)
  [name].spec.ts
```

Register each in `app.module.ts` — ONE IMPORT LINE ONLY.

---

### WAVE 3 — FRONTEND ROUTES (Web)
**Run after Wave 2.**

Order within Wave 3:
1. Fix placeholder homepage → real Home 1 with API data
2. Wire Home 2 editorial belt → GET /api/home/composition
3. Wire Home 3 lobby wall → GET /api/rooms?sort=viewers_asc
4. Wire Home 4 → GET /api/campaigns, GET /api/placements
5. Artist profile → GET /api/artists/[slug]
6. Article page → GET /api/articles/[slug]
7. Station page → GET /api/stations/[slug]
8. Live room → WebSocket /ws/rooms/[roomId]
9. Game session → WebSocket /ws/games/[sessionId]
10. Shop → GET /api/economy/shop
11. Inventory → GET /api/economy/inventory/mine
12. Wallet → GET /api/wallet/mine
13. Event detail → GET /api/events/[id]
14. Ticket purchase → POST /api/tickets/purchase
15. Auth flows → POST /api/auth/login, /register

---

### WAVE 4 — REAL-TIME (WebSocket)
**After Wave 3 has stable routes.**

1. Set up Socket.io or similar on API
2. Room namespaces: `/ws/rooms`
3. Game namespaces: `/ws/games`
4. Chat namespaces: `/ws/chat`
5. Notification namespace: `/ws/notifications`
6. Wire viewer count to room model
7. Wire discovery-first sort to live lobby (viewers_asc)
8. Wire hype meter events

---

### WAVE 5 — BOTS (Activate After Wave 4)
**Never activate bots before API is stable.**

1. Start house-ad-fallback.bot (most critical — Platform Law #7)
2. Start billing-integrity.bot (Diamond verification)
3. Start health-monitor.bot
4. Start homepage-rotation.bot
5. Start editorial-assembly.bot
6. Start notification.bot
7. Start trending.bot
8. Start points-cap-enforcer.bot
9. Start economy bots (item-generator, daily-drop)
10. Start all remaining bots

---

### WAVE 6 — PAYMENTS (Stripe)
**After Wave 5. Careful — real money.**

1. Stripe keys in env (already in env template from Pack 25)
2. Wire ticket checkout → Stripe PaymentIntent
3. Wire store checkout → Stripe PaymentIntent
4. Wire subscription → Stripe Subscription
5. Wire artist payout → Stripe Connect (Big Ace must approve)
6. Wire owner profit distribution (Big Ace must approve)
7. Webhook handling for failed payments, refunds, chargebacks

---

### WAVE 7 — MEDIA PIPELINE
**After Wave 6.**

1. S3/R2 bucket configuration
2. Pre-signed upload URL endpoint
3. FFmpeg transcoding worker (video → HLS, audio → waveform)
4. Image resize + thumbnail generation
5. CDN configuration (Cloudflare/CloudFront)
6. Upload validation + moderation scan
7. Wire to artist profile photos, articles, products, events

---

### WAVE 8 — DEPLOY
**After Wave 7 passes all smoke tests.**

```bash
# Render (API)
render deploy

# Vercel (Web)
vercel --prod

# Confirm:
curl https://api.themusiciansindex.com/api/healthz
curl https://api.themusiciansindex.com/api/readyz
# Both must return ok:true
```

---

### WAVE 9 — ONBOARDING + BOTS LIVE
1. Admin onboards at /onboarding/admin
2. First artist onboards at /onboarding/artist
3. First fan onboards at /onboarding/fan
4. Verify article auto-creates on profile completion (Platform Law #14)
5. Verify station link appears on article (Platform Law #9)
6. Verify discovery-first lobby sort (Platform Law #1)
7. Verify Marcel + BJ M Beat's Diamond status (Platform Law #2)
8. All bots confirm ACTIVE in /admin/bots
9. First sponsor acquired by prospect-scout.bot
10. First ad campaign running with house-ad-fallback

---

### WAVE 10 — CROSS-DEVICE (After Stable Launch)
1. PWA manifest + service worker
2. Mobile web optimization (Touch targets, bottom nav)
3. TV shell (Next.js with DPAD focus, large text, no hover)
4. Device pairing codes for TV login
5. QR handoff: continue watching from TV → phone
6. React Native / Expo for iOS + Android apps
7. Kiosk interface for venue ticket scanning
8. Scanner interface for event check-in

---

### WAVE 11 — STORE DISTRIBUTION (After Mobile)
1. iOS build + TestFlight + App Store submission
2. Android build + Google Play internal testing + submission
3. PWA badge on homepage ("Install App")
4. Apple TV, Android TV, Roku, Amazon Fire TV
5. Windows/Mac desktop (Electron or Tauri)
6. Microsoft Store, Mac App Store

---

## CRITICAL NEVER-DO LIST
- ❌ Never modify middleware.ts, auth/*, ci.yml, health/* (locked files)
- ❌ Never remove existing Prisma models (append-only)
- ❌ Never add more than one import line to app.module.ts per wave
- ❌ Never auto-approve payouts (always Big Ace)
- ❌ Never disable Platform Law #1 (discovery-first)
- ❌ Never remove permanent Diamond for Marcel + BJ M Beat's
- ❌ Never activate bots before API is stable
- ❌ Never skip `pnpm test:discovery` after Slice 3

---

## PROOF GATES (Before Each Wave)
```
Wave 1 proof: pnpm prisma migrate status → all applied
Wave 2 proof: curl /api/healthz + /api/readyz → ok:true
Wave 3 proof: Homepage renders, articles load, artist profile loads
Wave 4 proof: Room view count updates in real-time
Wave 5 proof: pnpm test:discovery → PASS
Wave 6 proof: Test ticket purchase in Stripe test mode
Wave 7 proof: Upload image → appears via CDN URL
Wave 8 proof: themusiciansindex.com loads
Wave 9 proof: Discovery-first sort verified in lobby
Wave 10 proof: Mobile browser renders correctly
Wave 11 proof: App Store review approved
```
