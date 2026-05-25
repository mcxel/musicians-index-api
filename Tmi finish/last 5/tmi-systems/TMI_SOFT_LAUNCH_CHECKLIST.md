# TMI SOFT LAUNCH CHECKLIST
## BerntoutGlobal LLC — The Musician's Index
### Every item must pass before soft launch

---

## TIER 1 — CRITICAL (must be done before any users see the site)

### Environment
- [ ] `DAILY_API_KEY` added to Vercel env (`ba0b6df653be1d75a4cf361bb1ac514f8ba5b7e10a5341d9090fe5d958da73d7`)
- [ ] `DAILY_DOMAIN=themusiciansindex` added to Vercel env
- [ ] `NEXTAUTH_SECRET` set to 32-character random string
- [ ] `NEXTAUTH_URL=https://themusiciansindex.com` set
- [ ] `DATABASE_URL` pointing to production PostgreSQL (not local)
- [ ] `STRIPE_SECRET_KEY` (live key, not test)
- [ ] `STRIPE_WEBHOOK_SECRET` added after webhook registered in Stripe dashboard
- [ ] `RESEND_API_KEY` set and domain verified in Resend dashboard
- [ ] `EMAIL_FROM=support@themusiciansindex.com` set
- [ ] `TICKET_SECRET` set to 32-character random string
- [ ] `ADMIN_EMAILS=berntmusic33@gmail.com,bigace@berntoutglobal.com`
- [ ] `DIAMOND_EMAILS=facethebully916@gmail.com,bjmbeat@berntoutglobal.com`

### DNS (Cloudflare)
- [ ] SPF record added: `v=spf1 include:resend.com ~all`
- [ ] DKIM CNAME from Resend dashboard added
- [ ] DMARC record: `v=DMARC1; p=quarantine; rua=mailto:security@berntoutglobal.com`
- [ ] SSL/TLS set to Full (Strict) in Cloudflare
- [ ] themusiciansindex.com → Vercel (confirmed no redirect loops)
- [ ] www.themusiciansindex.com → redirect to non-www

### Database
- [ ] `pnpm prisma db push` run against production DB
- [ ] Marcel's account (berntmusic33@gmail.com) confirmed Diamond tier in DB
- [ ] B.J. M Beat account (bjmbeat@berntoutglobal.com) confirmed Diamond tier
- [ ] Admin accounts created and confirmed
- [ ] At least 10 bot performer accounts seeded in DB

### Security
- [ ] Security headers added to `next.config.js` (from `TMISecurityEngine.ts`)
- [ ] Rate limiting middleware confirmed active on `/api/auth/*` routes
- [ ] Disposable email blocking confirmed at signup
- [ ] CSRF protection confirmed on all POST routes
- [ ] Admin routes return 403 for non-admin users (test manually)

### Payments
- [ ] Stripe webhook endpoint registered: `https://themusiciansindex.com/api/stripe/webhook`
- [ ] Stripe webhook tested with CLI: `stripe trigger payment_intent.succeeded`
- [ ] Test purchase of $1 beat confirmed end-to-end
- [ ] Ticket purchase flow confirmed end-to-end
- [ ] Payout queue confirmed requiring Big Ace approval (Platform Law #5)

---

## TIER 2 — HIGH PRIORITY (must be done within 48h of soft launch)

### Install
- [ ] `pnpm add @daily-co/daily-js --filter web` (if not already done)
- [ ] `pnpm add framer-motion --filter web` (if not already done)
- [ ] `pnpm run build` passes with zero TypeScript errors
- [ ] `pnpm test:discovery` passes (Platform Law #1 enforced)

### Features
- [ ] Login/signup flow works on mobile (test on real iPhone + Android)
- [ ] Email verification email received within 2 minutes of signup
- [ ] Password reset email received and link works
- [ ] Welcome email sends on account creation
- [ ] Daily.co room creates successfully (test POST /api/video/rooms)
- [ ] At least one live room can be entered with camera active
- [ ] Audio mixer confirmed (no clashing when 2+ performers join)
- [ ] Billboard wall loads and updates every 4s
- [ ] Magazine page loads all articles
- [ ] Beat store plays audio correctly
- [ ] XP awards after: login, join room, read article (confirm in DB)
- [ ] Avatar creator loads for fan accounts
- [ ] Performer profile page loads with correct info

### Bot Fleet
- [ ] Bot orchestrator starts on app boot (confirm in logs)
- [ ] 100+ bot performer accounts visible in billboard wall
- [ ] Bot accounts have realistic genres, names, and bios
- [ ] Bot room activity populates live billboard without crashing
- [ ] Sentinel bots confirm payout queue enforcement
- [ ] Bot error rate < 5% (check Admin Overseer)

### Homepages
- [ ] Home/1 loads with TMIHome1Compositor wrapper
- [ ] Home/2 loads with neon80s underlay + live widget grid
- [ ] Home/3 loads with visual treatment
- [ ] Home/4 loads with dark_editorial underlay
- [ ] Home/5 loads with TMIBillboardLiveWall in discovery section
- [ ] All static images replaced with TMILiveMediaWidget (or confirmed fallback working)
- [ ] Overlay FX (particles) running on homepages without frame drop

---

## TIER 3 — SOFT LAUNCH READINESS

### Legal / Compliance
- [ ] Terms of Service page at /terms (basic draft acceptable for soft launch)
- [ ] Privacy Policy page at /privacy (include data retention, cookie policy)
- [ ] Cookie consent banner active (privacy-first: decline by default)
- [ ] Age verification: confirm 16+ notice on signup
- [ ] DMCA takedown contact email published on site

### Performance
- [ ] Lighthouse score > 75 on mobile (homepage)
- [ ] First Contentful Paint < 3 seconds on mobile 4G
- [ ] IntersectionObserver confirmed: off-screen video tiles do NOT load streams
- [ ] Node.js heap memory: confirm `NODE_OPTIONS=--max-old-space-size=1536` set
- [ ] Redis configured for rate limiting (or fallback confirmed)

### Support
- [ ] Support email (support@themusiciansindex.com) working
- [ ] Admin Overseer loads with real data (not all zeros)
- [ ] Error pages (404, 500) styled and branded (not default Next.js)
- [ ] `console.error` output clean (no red errors in browser console on homepage)

---

## TIER 4 — MONTH 1 POST-LAUNCH (not required for day-1)

### Features to build post-soft-launch
- [ ] Season pass system
- [ ] Full social feed (posts, reposts, following feed)
- [ ] TMI Shop (emotes, skins, clothing, props)
- [ ] Venue booking department full flow
- [ ] Booking calendar and artist availability
- [ ] Monthly magazine issue scheduler (bot auto-publishes on 1st of month)
- [ ] Fan messaging (paid DMs from fans to performers)
- [ ] Advertiser self-serve portal (sponsors buy slots themselves)
- [ ] Full NFT on-chain integration (Alchemy)
- [ ] Contest automation (bot creates, announces, closes, pays out)
- [ ] Evolution Bot (learns from user behavior — Phase 2)
- [ ] Voice Director AI (Phase 2)
- [ ] Advanced leaderboard (season-based, genre-specific)

---

## SOFT LAUNCH SEQUENCE

### Day -3 (3 days before)
1. Merge all TMI systems files into monorepo
2. Run `pnpm run build` — fix any TypeScript errors
3. Set all Tier 1 env vars in Vercel
4. Deploy to production, verify at themusiciansindex.com

### Day -2
5. Test full signup → role select → verify → onboarding flow
6. Test live room entry (Daily.co WebRTC)
7. Test purchase (beat) → receipt email received
8. Confirm bot fleet is running and billboard is populated
9. Test Admin Overseer with real data

### Day -1
10. Invite 5 beta testers (performers + fans)
11. Watch for errors in Vercel logs
12. Fix any critical issues
13. Send "going live tomorrow" email to beta list

### Day 0 (Soft Launch)
14. Confirm all Tier 2 items checked
15. Send welcome emails to first 100 users (manually curated list)
16. Open signups
17. Monitor Admin Overseer in real-time
18. Marcel + Big Ace available for first 6 hours
19. Run first LIVE battle as demo event

---

## PLATFORM LAWS — NEVER BREAK THESE

| Law | Description |
|-----|-------------|
| #1 | Discovery-first room sorting always active |
| #2 | Marcel (berntmusic33@gmail.com) = Diamond forever |
| #2 | B.J. M Beat (bjmbeat@berntoutglobal.com) = Diamond forever |
| #5 | NO cash payout executes without Big Ace approval |
| — | Performers ALWAYS use webcam — never avatar |
| — | August 8 = Marcel's birthday — hardcoded in contest system |
| — | Prisma schema = append only. Never modify existing models |
| — | 100% functional — no stubs, no placeholders in production |

---

*BerntoutGlobal LLC · TMI Soft Launch Checklist*
*Every checkbox = one less fire on launch day.*
