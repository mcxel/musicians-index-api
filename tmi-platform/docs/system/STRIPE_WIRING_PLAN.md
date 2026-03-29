# STRIPE_WIRING_PLAN.md
## Every Stripe Flow — Implementation Plan for Copilot
### BerntoutGlobal XXL / The Musician's Index

---

## STRIPE CONFIGURATION

```
apps/api/src/stripe/stripe.module.ts  → StripeService
apps/api/src/stripe/stripe.service.ts → all Stripe SDK calls
apps/api/src/stripe/webhooks/         → webhook handlers
```

Stripe keys via env:
- `STRIPE_SECRET_KEY` — server only
- `STRIPE_WEBHOOK_SECRET` — webhook validation
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — browser

---

## 1. TIP PAYMENT

```typescript
// POST /api/tips/intent
async createTipIntent(artistId, amount, userId) {
  const intent = await stripe.paymentIntents.create({
    amount,           // in cents
    currency: 'usd',
    metadata: { type: 'tip', artistId, fromUserId: userId },
    automatic_payment_methods: { enabled: true },
  });
  return { clientSecret: intent.client_secret };
}

// Webhook: payment_intent.succeeded
// → tip-processing-bot handles: record, split, notify, TipExplosionEffect
```

## 2. FAN CREDIT PURCHASE

```typescript
// POST /api/credits/purchase
const BUNDLES = { '100': 500, '500': 2000, '1500': 5000 };  // cents
async createCreditPurchase(bundleId, userId) {
  const intent = await stripe.paymentIntents.create({
    amount: BUNDLES[bundleId],
    currency: 'usd',
    metadata: { type: 'credits', bundleId, userId, creditAmount: bundleId },
    automatic_payment_methods: { enabled: true },
  });
  return { clientSecret: intent.client_secret };
}

// Webhook: payment_intent.succeeded
// → add creditAmount to user.wallet.fanCredits
```

## 3. FAN CLUB SUBSCRIPTION

```typescript
// POST /api/fan-clubs/:slug/join
async joinFanClub(artistSlug, tierId, userId) {
  const customer = await getOrCreateStripeCustomer(userId);
  const session = await stripe.checkout.sessions.create({
    customer,
    mode: 'subscription',
    line_items: [{ price: tierStripePriceId, quantity: 1 }],
    success_url: `${WEB_URL}/fan-club/${artistSlug}?joined=true`,
    cancel_url: `${WEB_URL}/fan-club/${artistSlug}`,
    metadata: { type: 'fan_club', artistSlug, tierId, userId },
  });
  return { checkoutUrl: session.url };
}

// Webhooks:
// checkout.session.completed → create FanClubMembership
// customer.subscription.deleted → update FanClubMembership status='cancelled'
// invoice.payment_failed → update FanClubMembership status='past_due'
```

## 4. BEAT LICENSE PURCHASE

```typescript
// POST /api/beats/:id/license
async licenseBeat(beatId, licenseType, userId) {
  const intent = await stripe.paymentIntents.create({
    amount: beat.prices[licenseType],
    currency: 'usd',
    metadata: { type: 'beat_license', beatId, licenseType, buyerId: userId },
    automatic_payment_methods: { enabled: true },
  });
  return { clientSecret: intent.client_secret };
}

// Webhook: payment_intent.succeeded
// → create BeatLicense record
// → upload clean file link to buyer
// → credit producer wallet (80% of price)
```

## 5. PAYOUT ONBOARDING (Stripe Connect Express)

```typescript
// POST /api/wallet/payout-onboard
async createPayoutOnboarding(userId) {
  const account = await stripe.accounts.create({ type: 'express', country: 'US' });
  await db.wallet.update({ where: { userId }, data: { stripeAccountId: account.id } });
  const link = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${WEB_URL}/wallet?onboard=refresh`,
    return_url: `${WEB_URL}/wallet?onboard=complete`,
    type: 'account_onboarding',
  });
  return { onboardingUrl: link.url };
}

// After onboarding complete:
// Stripe sends account.updated webhook
// → check if account.details_submitted = true
// → update wallet.stripeOnboarded = true
```

## 6. PAYOUT REQUEST

```typescript
// POST /api/wallet/payout-request
async requestPayout(userId, amount) {
  const wallet = await getWallet(userId);
  if (!wallet.stripeOnboarded) throw new Error('no_payout_account');
  if (wallet.availableBalance < amount) throw new Error('insufficient_balance');
  if (amount < 2000) throw new Error('below_minimum');  // $20 minimum

  // Transfer from platform Stripe account to artist Connect account
  await stripe.transfers.create({
    amount,
    currency: 'usd',
    destination: wallet.stripeAccountId,
    metadata: { type: 'artist_payout', userId },
  });
  await db.payout.create({ data: { walletId: wallet.id, amount, status: 'processing' } });
  await db.wallet.update({
    where: { id: wallet.id },
    data: { availableBalance: { decrement: amount } }
  });
}

// Webhook: transfer.paid → update Payout status='paid'
// Webhook: transfer.failed → update Payout status='failed', restore balance
```

## 7. OWNER PROFIT DISTRIBUTION

```
Platform receives all Stripe revenue into platform Stripe account.
Revenue split is calculated at transaction time (tip-processing-bot, beat licensing, etc.).
Artist shares go to their pending balance (7-day hold) → available balance → payout on request.
Platform share stays in Stripe platform account.

Owner distribution (Marcel + Jay Paul Sanchez):
- billing-integrity-bot calculates platform net profit weekly (Sunday midnight)
- Net profit = gross revenue - Stripe fees - hosting/infra costs - artist payouts
- Distribution formula defined in OWNER_DISTRIBUTION_CONFIG (env var or admin config)
- Actual PayPal transfer: manual weekly action by Big Ace using financial dashboard
- Route: /admin/finance → OwnerProfitPanel → initiates Stripe → PayPal via Stripe balance transfer
```

## 8. TICKET PURCHASE WITH ANTI-BOT

```typescript
// Full ticket purchase flow with anti-bot enforcement
async purchaseTickets(eventId, quantity, userId, turnstileToken, paymentMethodId) {
  // Step 1: Anti-bot check (POST /api/tickets/purchase-check)
  await verifyTurnstile(turnstileToken);
  const userCount = await getTicketCount(eventId, userId);
  const pmCount = await getTicketCountByPaymentMethod(eventId, paymentMethodId);
  if (userCount + quantity > 8) throw new Error('limit_exceeded');
  if (pmCount + quantity > 8) throw new Error('limit_exceeded');
  await checkDeviceFingerprint(request, eventId);
  await checkIPVelocity(request.ip, eventId);

  // Step 2: Reserve (5-min hold)
  const reservation = await reserveTickets(eventId, userId, quantity);

  // Step 3: Create PaymentIntent
  const intent = await stripe.paymentIntents.create({
    amount: event.ticketPrice * quantity,
    currency: 'usd',
    metadata: { type: 'ticket', eventId, quantity, userId, reservationId: reservation.id },
  });
  return { clientSecret: intent.client_secret, reservationToken: reservation.token };
}
```
