# COPILOT_PACK25_WIRING_PROMPT.md
## Paste This to Copilot — Final Integration Wiring
### BerntoutGlobal XXL / The Musician's Index

---

```
COPILOT — PACK 25 INTEGRATION WIRING

All architecture packs are now complete. You are wiring the final layer.

PRIORITY ORDER:

P0 — Fix Cloudflare build (if not done):
  next.config.js: transpilePackages: ['@tmi/hud-runtime','@tmi/hud-theme','@tmi/platform-kernel']
  package.json: "prebuild": "pnpm -C ../../packages/hud-runtime build"

P1 — Wire these API routes in apps/api/src/:

  search.controller.ts         → GET /api/search (full-text + Redis live boost)
  notifications.controller.ts  → GET/POST /api/notifications + preferences
  feed.controller.ts           → GET /api/feed (personalized, weighted)
  tips.controller.ts           → POST /api/tips/intent, POST webhook handler
  wallet.controller.ts         → GET /api/wallet, POST /api/wallet/payout-request
  credits.controller.ts        → GET balance, POST purchase
  fan-clubs.controller.ts      → full CRUD per API_CONTRACTS.md
  beats.controller.ts          → full CRUD + license per API_CONTRACTS.md
  competitions.controller.ts   → GET list, GET detail, POST register
  seasons.controller.ts        → GET seasons + rankings
  settings.controller.ts       → GET/PUT settings, DELETE account

P2 — Wire WebSocket events per WEBSOCKET_EVENT_MAP.md:

  room:tip → tip-processing-bot → TipExplosionEffect fires via WebSocket
  notification:new → notification-dispatch-bot → client updates bell
  room:scene_change → all participants receive new scene
  battle:result → updates bracket + leaderboard
  season:update → broadcast to all connected clients

P3 — Wire Stripe per STRIPE_WIRING_PLAN.md:

  Create StripeService in apps/api/src/stripe/
  Wire all webhook handlers:
    payment_intent.succeeded → tips, credits, beat licenses, tickets
    checkout.session.completed → fan club subscriptions
    customer.subscription.deleted → cancel fan club membership
    transfer.paid → mark payout as paid
    account.updated → mark payout account as onboarded

P4 — Run Prisma migration:

  Copy PRISMA_SCHEMA_DELTA.md models into packages/db/prisma/schema.prisma
  Run: npx prisma migrate dev --name pack25_final
  Run: npx prisma generate

P5 — Safety enforcement:

  Wire canSendMessage() check per FAMILY_KID_SAFETY_RULES.md
  Wire ticketPurchaseCheck per TICKET_ANTI_BOT_RULES.md
  Wire Cloudflare Turnstile verification on ticket purchase endpoint

PLATFORM LAWS (NEVER VIOLATE):
1. Discovery-first: 0 viewers = position 1 in lobby wall ALWAYS
2. Permanent Diamond: Marcel Dickens and B.J. M Beat's — forever
3. Search returns live rooms first, viewers_asc within live rooms
4. Kids only talk to kids. Kid performers require verified parent approval.
5. Max 8 tickets per buyer/payment method per event.
6. ONE AudioProvider. ONE SharedPreviewProvider. ONE TurnQueueProvider.
7. Marcel = analytics + suggestions only. Big Ace = full control.
8. Owner payouts from platform profit only, not gross revenue.

PROOF AFTER EACH WIRING SLICE:

  After search: curl 'https://api.themusiciansindex.com/api/search?q=test'
  After tips: Stripe test tip → TipExplosionEffect in room UI
  After notifications: new follower → bell badge increments
  After tickets: attempt to buy 9 → 429 limit_exceeded returned
  After family rules: adult → kid message attempt → 403 blocked
  Run: pnpm test:smoke
  Run: pnpm test:discovery  ← CRITICAL — blocks deploy if fails

"This is your stage, be original." — BerntoutGlobal LLC
```
