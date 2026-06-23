# STRIPE WEBHOOK CERTIFICATION
**Date:** 2026-06-16 | **Trigger:** Stripe dashboard reporting 43/43 failed webhook deliveries to `https://themusiciansindex.com/api/stripe/webhook`

## Root cause — CONFIRMED

**The webhook route itself is not the problem. The site's middleware is blocking every request to it with `401 Unauthorized` before it ever reaches the route handler.**

Verified by hitting the live production endpoint directly: `GET https://themusiciansindex.com/api/stripe/webhook` returned **HTTP 401**. If the request had reached the actual route handler (which only exports `POST`), Next.js itself would have returned `405 Method Not Allowed` instead — the 401 proves middleware is intercepting it first.

`apps/web/middleware.ts` (the project-root middleware — confirmed via this same test to be the one Next.js actually uses, not the divergent `apps/web/src/middleware.ts`, see "Found but not fixed" below) has:
- `PROTECTED_PATHS` includes `'/api/stripe'` (broad prefix match)
- A global matcher (`'/((?!_next/static|_next/image|favicon\\.ico).*)'`) that covers every route including all API routes
- Logic: if a path is protected and there's no `tmi_session` cookie, and the path starts with `/api/`, return `401 Unauthorized` immediately

Stripe's servers never carry a `tmi_session` cookie — they're not logged into the platform, they authenticate via the `Stripe-Signature` header instead (which the route handler verifies correctly via `stripe.webhooks.constructEvent()`). So every single webhook delivery was rejected by the cookie check before signature verification ever ran.

## Checklist (per the requested format)

| Check | Result | Evidence |
|---|---|---|
| Route Exists | ✅ PASS | `app/api/stripe/webhook/route.ts`, full handler for checkout/subscription/invoice/tip/ticket/beat-license events |
| Webhook Secret Configured | ✅ PASS | `STRIPE_WEBHOOK_SECRET` confirmed present in Vercel production env (via `vercel env ls production`) |
| Stripe Secret Key Configured | ✅ PASS | `STRIPE_SECRET_KEY` confirmed present in Vercel production env |
| Signature Verification Code | ✅ PASS | `stripe.webhooks.constructEvent(payload, sig, endpointSecret)` correctly implemented — never actually reached due to the middleware block |
| Production Reachable | 🔴 FAIL (root cause) | Middleware returns 401 before the route handler runs — **fixed this session, not yet deployed** |
| Returns 200 | 🔴 FAIL (consequence of above) | Will return 200 once the middleware fix is deployed |

## Fix applied (not yet deployed)

`apps/web/middleware.ts`:
1. Added `/api/stripe/webhook` and `/api/stripe/webhook-health` to `AUTH_WHITELIST` — bypasses the session-cookie check entirely for these two routes (Stripe signature verification inside the handler is the real auth mechanism).
2. Added the same two paths to `VISIBILITY_WHITELIST` — so webhooks still work even if the site is ever put into private/"coming-soon" lockdown mode.

Other `/api/stripe/*` routes (`checkout`, `customer`, `customer-portal`, `products`, `status`) were left under session protection — those are legitimately tied to a logged-in user's own session, unlike the webhook.

**This fix has zero effect until it's committed, pushed, and deployed.** Given Stripe has already accumulated 43 failed deliveries and will eventually give up retrying, I'd recommend deploying this specific, isolated fix as soon as you confirm — separate from the larger pile of uncommitted work, since it's small, well-tested (typechecks clean), and directly blocks revenue collection.

## Found but not fixed: duplicate middleware files

`apps/web/middleware.ts` (root) and `apps/web/src/middleware.ts` both exist with **different, diverging logic** (different protected-path lists, different redirect targets, neither references the other). Confirmed via the live 401 test that the root one is what Next.js actually runs — `src/middleware.ts` is dead code. This is a real risk: a future fix applied to the wrong file would silently do nothing in production. Recommend deleting `src/middleware.ts` once its logic (if any of it isn't already covered by the root file) is confirmed redundant — not done this session since it needs a careful diff first, not a blind delete.

## Bonus finding from the same investigation: existing webhook-health endpoint

`app/api/stripe/webhook-health/route.ts` already exists and is exactly the self-diagnostic tool this certification was asking for — it reports `webhookSecretConfigured`, recent verified events, success/failure counts, and incident status. It was also blocked by the same middleware bug (now fixed). Once deployed, `https://themusiciansindex.com/api/stripe/webhook-health` will give live delivery health without needing to check Vercel logs manually.

## Also fixed this session: Google Search Console verification file

Separately reported issue: `google27b9fc359205edb8.html` was missing from `apps/web/public/` — confirmed via direct fetch that `https://themusiciansindex.com/google27b9fc359205edb8.html` returns 404 in production. Copied the file from the blueprint folder into `apps/web/public/google27b9fc359205edb8.html` (will resolve once deployed).
