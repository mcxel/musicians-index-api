# MASTER_COPILOT_WIRING_PROMPT.md
## Copy-Paste This to Copilot — The Complete Final Wiring Instruction
### BerntoutGlobal XXL / The Musician's Index

---

```
COPILOT — FINAL WIRING PHASE
BerntoutGlobal XXL / The Musician's Index

ALL ARCHITECTURE PACKS COMPLETE (Packs 1–26).
Planning is done. You are in pure wiring mode.

STEP 0: FIX CLOUDFLARE BUILD (if not already done)
────────────────────────────────────────────────────
apps/web/next.config.js — add to module.exports:
  transpilePackages: ['@tmi/hud-runtime','@tmi/hud-theme','@tmi/platform-kernel']

apps/web/package.json — add to scripts:
  "prebuild": "pnpm -C ../../packages/hud-runtime build && pnpm -C ../../packages/hud-theme build"

Proof: pnpm -C apps/web build exits 0.

STEP 1: MOVE ALL PACKS INTO REPO
────────────────────────────────────────────────────
Follow COPILOT_REPO_MOVE_AND_WIRING_PLAN.md exactly.
Resolve conflicts per REPO_FIT_CONFLICT_AUDIT.md.
DO NOT overwrite: page.tsx, register/, login/, onboarding/, dashboard/, streamwin/, layout.tsx, middleware.ts

STEP 2: PRISMA MIGRATION
────────────────────────────────────────────────────
Add models from PRISMA_SCHEMA_DELTA_PACK.md to packages/db/prisma/schema.prisma
Run: npx prisma migrate dev --name pack25_26_final
Run: npx prisma generate

New models required:
Notification, NotificationPreference, FeedItem, Wallet, Transaction, Payout, Tip,
FanClub, FanClubTier, FanClubMembership, FanClubPost, Beat, BeatLicense,
Competition, CompetitionRegistration, Battle, Season, RankEntry, SeasonAward,
UserSettings, Report, ModerationAction, FamilyAccount, ChildAccount, ParentApproval,
UserBlock, UserMute, PushSubscription,
OwnerProfitSnapshot, OwnerPayout, OwnerPayoutAuditLog, PlatformReserve, OperatingCost

STEP 3: WIRE API ENDPOINTS (Priority Order)
────────────────────────────────────────────────────
Exact contracts in API_CONTRACT_PACK.md.

P1 — Critical for launch:
  GET/POST /api/notifications           → notifications.controller.ts
  GET /api/feed                          → feed.controller.ts
  GET /api/search                        → search.controller.ts
  POST /api/tips/intent                  → tips.controller.ts
  GET/POST /api/wallet                   → wallet.controller.ts
  POST /api/tickets/purchase-check       → tickets/anti-bot.service.ts

P2 — Important for economy:
  GET/POST /api/credits                  → credits.controller.ts
  GET/POST /api/fan-clubs                → fan-clubs.controller.ts
  GET/POST /api/beats                    → beats.controller.ts
  GET/POST /api/competitions             → competitions.controller.ts
  GET /api/seasons                       → seasons.controller.ts

P3 — Settings and admin:
  GET/PUT /api/settings                  → settings.controller.ts
  GET/POST /api/family                   → family.controller.ts
  GET/POST /api/admin/finance            → owner-finance.controller.ts

STEP 4: WIRE STRIPE WEBHOOKS
────────────────────────────────────────────────────
Exact flows in STRIPE_WIRING_PLAN.md.

apps/api/src/stripe/webhooks/:
  payment_intent.succeeded → handle tips, credits, beats, tickets
  checkout.session.completed → fan club subscription start
  customer.subscription.deleted → cancel fan club membership
  transfer.paid → mark artist payout as paid
  account.updated → mark Connect account as onboarded

STEP 5: WIRE WEBSOCKET EVENTS
────────────────────────────────────────────────────
Exact payloads in REALTIME_EVENT_MAP.md.

apps/api/src/gateways/:
  room.gateway.ts      → room:join, room:leave, room:chat, room:reaction, room:tip_received,
                          room:scene_change, room:queue_update, room:turn_advance,
                          room:turn_warning, room:viewer_count, room:ended
  battle.gateway.ts    → battle:round_start, battle:vote_update, battle:result
  notification.gateway.ts → notification:new, notification:badge
  season.gateway.ts    → season:update, leaderboard:update, crown:transfer
  ticket.gateway.ts    → ticket:queue_position, ticket:your_turn

STEP 6: WIRE FAMILY/KID SAFETY
────────────────────────────────────────────────────
Exact rules in FAMILY_KID_HARD_RULES_PACK.md.

Create: apps/api/src/middleware/message-safety.middleware.ts
Apply to: POST /api/messages, room:chat WebSocket handler, friend request API

canSendMessage() must return false for ANY adult → child (non-parent) attempt.
canSendMessage() must return true for kid → kid.
canSendMessage() must return true for parent → linked child.

Kid performer creation requires verified parent approval at all times.
Default child account permissions: ALL false until parent enables.

STEP 7: WIRE TICKET ANTI-BOT
────────────────────────────────────────────────────
Exact implementation in TICKET_ANTI_BOT_HARD_RULES_PACK.md.

Create: apps/api/src/modules/tickets/anti-bot.service.ts

Rules (CANNOT BE OVERRIDDEN without Big Ace):
  Max 8 tickets per user per event
  Max 8 tickets per payment method per event
  Cloudflare Turnstile required on every purchase attempt
  IP velocity: max 20 attempts per 5 min per event per IP
  New account (<24h): require hard CAPTCHA

STEP 8: WIRE OWNER FINANCE
────────────────────────────────────────────────────
Exact system in finance/OWNER_PROFIT_DISTRIBUTION_SYSTEM.md.

Create: apps/api/src/modules/owner-finance/
  owner-finance.service.ts    → profit calculation, distribution
  owner-payout.service.ts     → PayPal/Stripe payout initiation
  owner-finance.controller.ts → /api/admin/finance/* endpoints

Create Prisma models: OwnerProfitSnapshot, OwnerPayout, OwnerPayoutAuditLog,
                       PlatformReserve, OperatingCost

Wire admin page: apps/web/src/app/admin/finance/ → OwnerProfitPanel

STEP 9: RUN PROOF GATES
────────────────────────────────────────────────────
After each P-step:
  pnpm -C apps/web typecheck
  pnpm -C apps/api typecheck

After all steps:
  pnpm -C apps/web build
  pnpm test:discovery   ← CRITICAL — blocks deploy if lobby sort fails
  pnpm test:smoke

Manual proof (before any deploy):
  1. Search "artist" → LIVE rooms appear first
  2. Lobby wall → 0-viewer artist at position 1
  3. /artists/berntmusic33 → Diamond badge shows
  4. Adult → kid DM → 403 Forbidden
  5. Buy 9 tickets → 429 limit_exceeded
  6. /admin/finance/profit → Big Ace can see distribution calculation

PLATFORM LAWS (PERMANENT — NEVER VIOLATE):
1. Discovery-first: 0 viewers = position 1 in lobby wall ALWAYS
2. Permanent Diamond: Marcel Dickens + B.J. M Beat's — forever
3. Kids only talk to kids. Kid performers require verified parent approval.
4. Max 8 tickets per buyer/payment method per event.
5. ONE AudioProvider. ONE SharedPreviewProvider. ONE TurnQueueProvider.
6. Marcel = analytics + suggestions only. Big Ace = full control.
7. Owner payouts from platform NET PROFIT ONLY — never from gross revenue.
8. Jay Paul Sanchez receives his ownership percentage from every distribution.
9. Nothing exists as only a visual block — every feature has owner, route, proof.

"This is your stage, be original." — BerntoutGlobal LLC
```
