# STRIPE CERTIFICATION
**TMI Platform — Revenue Path End-to-End Audit**  
**Date:** 2026-06-15 | **Priority:** P0 (Money path)

---

## Architecture

```
User action → Checkout flow → Stripe API → Webhook → DB → XP award → Confirmation
```

Marcel's priority: Revenue active FAST. Cash pressure is real.

---

## STRIPE INFRASTRUCTURE

| File | Purpose | Status |
|---|---|---|
| `lib/stripe/client.ts` | Stripe client with placeholder guard | ✅ EXISTS |
| `app/api/stripe/checkout/route.ts` | Checkout session creation | ✅ EXISTS |
| `app/api/stripe/customer/route.ts` | Customer management | ✅ EXISTS |
| `app/api/stripe/products/route.ts` | Product catalog | ✅ EXISTS |
| `app/api/stripe/webhook/route.ts` | Webhook proxy | ✅ EXISTS |
| `app/checkout/page.tsx` | 3-step checkout UI | ✅ EXISTS |
| `lib/stripe/CheckoutPaymentEngine.ts` | Payment engine | ✅ EXISTS |

### Environment Variables Required
| Variable | Purpose | Status |
|---|---|---|
| `STRIPE_SECRET_KEY` | Server-side API calls | ❌ Must be set in Vercel |
| `STRIPE_PUBLISHABLE_KEY` | Client-side Stripe.js | ❌ Must be set in Vercel |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification | ❌ Must be set in Vercel |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Next.js public env | ❌ Must be set |

**The `isPlaceholderKey()` guard in `client.ts` returns `null` if key ends with `_xxx`, contains 'replace_me', 'your_', etc. All payment flows will silently fail without real keys.**

---

## REVENUE STREAMS TO CERTIFY

### 1. Membership / Subscription Purchase
| Flow Step | Route / Component | Status |
|---|---|---|
| User clicks "Upgrade to PRO" | `/pricing` or hub CTA | ✅ Route exists |
| Stripe Checkout session created | `/api/stripe/checkout` | ✅ API exists |
| Stripe payment page | Stripe hosted | 🔲 Requires real key |
| Success redirect | `/checkout?success=true` | 🔲 |
| Webhook fires | `/api/stripe/webhook` | ✅ Route exists |
| DB: `User.tier` updated | Prisma write | 🔲 |
| XP awarded: `SUBSCRIPTION_PURCHASE` | XpActionRegistry | ✅ Action defined |
| Confirmation email | Not implemented | ❌ P2 |

### 2. Tip Purchase (Fan → Performer)
| Flow Step | Route / Component | Status |
|---|---|---|
| Fan clicks `$ Tip` | `MaskedVideoTile` in live room | ✅ Button exists |
| Tip modal opens | `TipJarWidget.tsx` | ✅ Component exists |
| Stripe Connect payment | `/api/stripe/checkout` with `tip` type | 🔲 Not confirmed |
| Payment processes | Stripe → Performer's connected account | ❌ Stripe Connect setup needed |
| Webhook fires | `/api/stripe/webhook` | ✅ |
| DB: `Tip` record created | Prisma write | 🔲 |
| XP: `TIP_SENT` + `TIP_RECEIVED` | XpActionRegistry | ✅ Actions defined |
| Tip explosion animation | `TipExplosionEffect.tsx` | ✅ Component exists |

**Stripe Connect required for performer payouts.** This needs a separate setup step.

### 3. Ticket Purchase (Event → Attendance)
| Flow Step | Route / Component | Status |
|---|---|---|
| Event tile click | EventCalendar or Home | 🔲 |
| Buy Ticket CTA | `/events/[id]` | 🔲 |
| Checkout | `/checkout?ticket=[id]` | 🔲 |
| Stripe payment | — | 🔲 Requires key |
| QR Code generation | Not implemented | ❌ |
| Confirmation page | Not implemented | ❌ |
| XP: `TICKET_PURCHASE` | XpActionRegistry | ✅ |

### 4. Sponsor / Advertiser Purchase
| Flow Step | Route / Component | Status |
|---|---|---|
| Sponsor clicks "Get Started" | `/advertising` page CTAs | ✅ Route exists |
| Package selection | `/advertising` — 4 packages | ✅ |
| Checkout | `/checkout?product=sponsor-[tier]` | 🔲 |
| Stripe | — | 🔲 |
| Campaign activation | SponsorRegistry update | 🔲 |
| Analytics dashboard access | `/hub/sponsor` | ✅ |

### 5. Season Pass / Credits
| Flow Step | Route / Component | Status |
|---|---|---|
| Season Pass page | `/season-pass` | ✅ |
| 3 tier options + Stripe links | Existing page | ✅ |
| Credits bundles | `/credits` | ✅ 4 bundles |
| Checkout | Stripe links from pages | 🔲 Need real price IDs |
| XP: `SEASON_PASS_PURCHASE` | XpActionRegistry | ✅ |

### 6. Fan Club Membership
| Flow Step | Route / Component | Status |
|---|---|---|
| Fan Club page | `/fan-club/[performer-slug]` | 🔲 Route verify |
| Subscribe CTA | — | 🔲 |
| Stripe recurring | `/api/stripe/checkout` subscription mode | 🔲 |
| Performer revenue split | Stripe Connect | ❌ |
| XP: `FAN_CLUB_JOIN` | XpActionRegistry | ✅ |

---

## CHECKOUT PAGE AUDIT

File: `apps/web/src/app/checkout/page.tsx`

| Feature | Status | Issue |
|---|---|---|
| 3-step flow: Review → Payment → Done | ✅ Exists | |
| Review step shows order details | ✅ | Currently hardcoded seed orders |
| Payment step has Stripe form | 🔲 | Needs real Stripe.js integration |
| Success/failure states | ✅ | Exists as `done`/`failed` step |
| Hardcoded seed orders | ⚠️ | Flame Emote $4.99, Wavetek $29.99, Zuri Bloom ticket $9 |
| Real order from URL params | ❌ | Must read `?product=[id]&price=[amount]` from URL |

**P0 Fix:** Connect checkout page to URL params to accept real product/price data from all purchase flows.

---

## STRIPE CONNECT (Performer Payouts)

Stripe Connect enables performer-specific payout accounts so TMI can split revenue.

| Step | Status |
|---|---|
| Performer Stripe Connect onboarding | ❌ Not built |
| `stripeConnectAccountId` on Performer model | 🔲 Check Prisma schema |
| Tip routing → performer account | ❌ |
| Fan club revenue split | ❌ |
| Booking payment routing | ❌ |

**This is P1, not P0.** For soft launch: tips can flow to TMI main account with manual payouts to performers. Automate post-launch.

---

## P0 ACTIONS (in order)

1. **Set Stripe env vars in Vercel** — `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
2. **Wire checkout page to URL params** — accept `?product=[id]&price=[amount]&type=[membership|tip|ticket|sponsor]`
3. **Test membership purchase end-to-end** — PRO upgrade full flow
4. **Verify webhook fires and updates `User.tier`** — Prisma write after payment
5. **Verify tip modal opens from live room** — `MaskedVideoTile` → `TipJarWidget` → checkout
6. **Test season-pass/credits purchase** — Stripe price IDs needed

---

## CERTIFICATION CHECKLIST

| Test | Expected | Status |
|---|---|---|
| Stripe key set in Vercel | Non-placeholder key | ❌ Must be done |
| `client.ts` `isPlaceholderKey()` returns false | Key accepted | ❌ |
| PRO upgrade → Stripe checkout opens | Stripe hosted page | 🔲 |
| Payment success → `User.tier = 'pro'` | DB updated | 🔲 |
| Tip button in live room → payment | Stripe + TipJarWidget | 🔲 |
| Webhook endpoint responds 200 | Stripe dashboard shows ok | 🔲 |
| Season pass purchase | 3 tiers work | 🔲 |
| Credits purchase | 4 bundles work | 🔲 |
| Sponsor package → campaign active | SponsorRegistry updated | 🔲 |

**Overall: Infrastructure is built and guards are smart. All 5 revenue streams need Stripe env vars set before any testing is possible.**
