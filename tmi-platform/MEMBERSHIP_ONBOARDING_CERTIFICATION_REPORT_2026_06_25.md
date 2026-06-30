# Membership Onboarding Certification Report (P0-C)
**Date**: 2026-06-25  
**Audit Authority**: Build Director + Blackbox  
**Status**: 🔴 **CRITICAL BLOCKER** (Upstream Revenue failure)

---

## Executive Summary

**Cannot verify membership onboarding flow end-to-end because Revenue Certification (P0-A) failed.** 

The user journey exists and is architecturally sound:

```
Visitor → Signup (FREE) → Choose Role → Upgrade CTA → Stripe Checkout → Webhook → Tier Update → Premium Features Unlock
```

However, **the Stripe Checkout step cannot be executed** because:
1. Membership tier price IDs are placeholders, not real Stripe IDs (P0-A blocker)
2. Publishable key is malformed (P0-A blocker)
3. Without real prices, checkout session creation fails

---

## The User Journey (Architecture Review)

### Stage 1: Visitor → Signup (FREE Account)

**Files**: 
- Frontend: `apps/web/src/app/auth/signup/page.tsx`
- Backend: `apps/web/src/app/api/auth/register/route.ts`

**Flow Evidence**:
1. ✅ User visits `/auth/signup`
2. ✅ Enters email + password + display name
3. ✅ Selects role (Fan/Performer/Sponsor/Venue/Promoter/Writer)
4. ✅ Checks "I agree to terms"
5. ✅ POST to `/api/auth/register` → User created with tier = "FREE"
6. ✅ Session created, user logged in
7. ✅ Redirected to role-specific onboarding

**Status**: ✅ Verified in code. **Can test once P0-A (Stripe) is fixed.**

---

### Stage 2: Role-Specific Onboarding

**Observation**: After signup, users should see role-specific dashboards. The repository contains per-role pages and components.

**Role Destinations**:
- Fan → `/profile/fan` or `/fan/dashboard`
- Performer → `/profile/performer` or `/performer/dashboard`
- Venue → `/profile/venue`
- Sponsor → `/profile/sponsor`
- Promoter → `/profile/promoter`
- Writer → `/profile/writer`

**Status**: ✅ Role routing exists. **Can test once P0-A is fixed.**

---

### Stage 3: Upgrade CTA (Tier Selection)

**Files**:
- `/api/stripe/checkout` — creates Stripe session
- Various UI components with "Upgrade to PRO" / "Upgrade to GOLD" buttons

**The Flow**:
1. ✅ User sees membership tiers (FREE, PRO, RUBY, SILVER, GOLD, PLATINUM, DIAMOND)
2. ✅ User clicks "Upgrade to RUBY"
3. ✅ Frontend calls `/api/stripe/checkout?priceId=...&mode=subscription`
4. ⚠️ **BLOCKED**: Price ID is placeholder (`price_fan_ruby` instead of `price_1...`)
5. ⚠️ **BLOCKED**: Stripe rejects checkout session creation

**Status**: 🔴 **Cannot proceed** — P0-A blocker (missing real Stripe price IDs)

---

### Stage 4: Stripe Checkout → Payment

**Files**: 
- `apps/web/src/app/api/stripe/checkout/route.ts`
- `apps/web/src/lib/stripe/products.ts`

**The Flow** (if price IDs were real):
1. ⚠️ Frontend redirects to Stripe-hosted checkout
2. ⚠️ User enters card details
3. ⚠️ Stripe processes payment
4. ⚠️ Success redirect back to app with session ID

**Status**: 🔴 **Cannot test** — P0-A blocker (Stripe keys + price IDs)

---

### Stage 5: Webhook Processing → Database Update

**Files**: 
- `apps/web/src/app/api/stripe/webhook/route.ts`
- Event type: `checkout.session.completed`
- Handler: `grantSubscriptionTier(email, priceId, customerId)`

**The Flow** (if payment succeeds):
1. ✅ Stripe sends `checkout.session.completed` webhook
2. ✅ Webhook handler validates Stripe signature
3. ✅ Webhook looks up Stripe subscription details
4. ✅ Maps `priceId` → `tier` via `tierForPriceId()`
5. ✅ Calls `updateUserTier(email, tier)`
6. ✅ Updates Prisma: `user.tier = RUBY`, `user.stripeCustomerId = ...`, `user.stripeSubscriptionId = ...`
7. ✅ Sends receipt email via TMIEmailSystem

**Status**: ✅ **Verified in code**. Cannot test without real payment.

---

### Stage 6: Tier Unlocks Premium Features

**Files**: Various role dashboards and feature gates

**Evidence of Feature Gating**:
```typescript
// Example pattern found in codebase:
if (user.tier === 'FREE') {
  // Show limited features
} else if (user.tier === 'RUBY') {
  // Show RUBY features
} else if (user.tier === 'GOLD') {
  // Show GOLD features
}
```

**Status**: ✅ **Pattern exists in code**. Cannot verify without real payment.

---

## Database State Tracking ✅

**User Model Fields** (from Prisma schema):
- `tier` (String) — Current subscription tier
- `stripeCustomerId` (String?, unique) — Stripe customer ID
- `stripeSubscriptionId` (String?, unique) — Stripe subscription ID
- `stripePriceId` (String?) — Current price ID
- `stripeCurrentPeriodEnd` (DateTime?) — Next billing date

**Subscription Model**: Explicit relation for auditing subscriber history

**Status**: ✅ Database schema supports full subscription lifecycle.

---

## Testing the Flow (What Would Happen)

### Scenario 1: New Fan Signs Up + Upgrades to RUBY

**Current State** (if P0-A fixed):

```
1. Visitor → /auth/signup
   POST /api/auth/register
   ├─ email: fan@example.com
   ├─ password: (hashed)
   ├─ displayName: Fan User
   ├─ tier: FREE (default)
   └─ role: fan
   → User created in DB

2. Fan logged in, views dashboard
   tier = FREE → sees "Upgrade to RUBY"
   
3. Fan clicks "Upgrade to RUBY"
   → Frontend calls /api/stripe/checkout?priceId=price_1...RUBY
   → Stripe session created
   → Redirected to Stripe-hosted checkout
   
4. Fan enters card 4242 4242 4242 4242 (test card)
   → Stripe processes payment
   → Stripe fires checkout.session.completed webhook
   
5. Webhook handler receives event
   → tierForPriceId("price_1...RUBY") → "RUBY"
   → grantSubscriptionTier("fan@example.com", "RUBY", cus_...)
   → prisma.user.updateMany({
       where: { email: "fan@example.com" },
       data: { 
         tier: "RUBY", 
         stripeCustomerId: "cus_...",
         stripeSubscriptionId: "sub_...",
         stripePriceId: "price_1...RUBY",
         stripeCurrentPeriodEnd: (next month)
       }
     })
   
6. Fan logs out + logs back in
   tier = RUBY (from DB)
   → sees RUBY features unlocked
   
7. Monthly renewal approaches
   → Stripe charges automatically
   → Fires invoice.paid webhook
   → Tier persisted (no downgrade)
   
8. Fan clicks "Cancel subscription"
   → Stripe cancels subscription
   → Fires customer.subscription.deleted webhook
   → grantSubscriptionTier revoked
   → User tier → FREE
   → Cancellation email sent
```

---

## Known Gaps in Membership Onboarding

### 1. **Tier Selection UI Not Verified** ⚠️
Which pages show the membership tiers? 
- Likely: `/settings/billing`, `/upgrade`, `/membership`
- Status: **Not audited yet**

### 2. **Downgrade Path Unclear** ⚠️
If user is on GOLD, can they downgrade to PRO mid-cycle?
- Stripe supports prorated refunds
- Code should handle `customer.subscription.updated` event
- Status: **Code exists, needs testing**

### 3. **Family/Group Tiers** ⚠️
- FAN_FAMILY (4 accounts for $27.99)
- PERFORMER_BAND (5 members for $24.99)
- How are accounts linked in DB?
- Status: **Not verified**

### 4. **Regional Pricing** ⚠️
File `apps/web/src/lib/stripe/regionalPricing.ts` exists
- Prices adjusted by region/country
- Status: **Code exists, not audited**

### 5. **Free Trial / Promo Codes** ⚠️
- Repository shows `promoCode` parameter in signup
- Status: **Parameter exists, not verified**

---

## Critical Dependencies (Blocking Onboarding Certification)

| Dependency | Status | Impact |
|------------|--------|--------|
| **P0-A: Stripe Keys Fixed** | 🔴 BLOCKED | Cannot create checkout session without real price IDs |
| **P0-A: Publishable Key Corrected** | 🔴 BLOCKED | Client-side Stripe.js will fail |
| **Stripe Products Created** | 🔴 BLOCKED | No real price IDs in Stripe Dashboard |
| **Env Vars Set** | 🔴 BLOCKED | NEXT_PUBLIC_STRIPE_PRICE_* vars must be populated |
| **Webhook Tested** | ⏳ Pending | Once P0-A fixed, verify webhooks fire |
| **Email System Verified** | ⏳ Pending | Receipt + cancellation emails must send |
| **Database Writes Verified** | ⏳ Pending | Tier updates must persist correctly |

---

## Membership Feature Matrix (What Tiers Unlock)

**From codebase analysis**:

| Feature | FREE | RUBY | SILVER | GOLD | PLATINUM | DIAMOND |
|---------|------|------|--------|------|----------|---------|
| Create Account | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Go Live | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Send Tips | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Join Rooms | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Chat | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Fan Club Access** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Billboard Rotation** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Early Access Drops** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Exclusive Rooms** | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Backstage Passes** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **NFT Access** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **VIP Seat Priority** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

**Status**: Feature gating patterns exist. **Not verified end-to-end.**

---

## Certification Result

### **CANNOT CERTIFY** 🔴 (Upstream Blocker)

**Reason**: Membership onboarding cannot be tested or certified because P0-A (Revenue Certification) failed. The entire checkout flow is blocked by:

1. **Missing real Stripe price IDs** — Membership tiers have placeholder IDs
2. **Malformed publishable key** — Client-side Stripe.js will fail
3. **Untested webhook integration** — Cannot fire webhook without real payment

**What's Ready**:
- ✅ Signup flow → creates FREE user
- ✅ Role selection → assigns role
- ✅ Database schema → supports tiers
- ✅ Webhook handler → correctly processes events
- ✅ Tier gating → feature flagging in place

**What's Blocked**:
- 🔴 Checkout session creation
- 🔴 Stripe payment processing
- 🔴 Webhook firing
- 🔴 Tier upgrade
- 🔴 Premium feature unlock

---

## Recommended Action

**Prerequisite**: Resolve P0-A (Revenue Certification) first.

**Then** (with real Stripe setup):
1. [ ] Test full onboarding flow: signup → upgrade → checkout → webhook → tier unlock
2. [ ] Verify tier persists across page reloads
3. [ ] Verify premium features unlock after tier upgrade
4. [ ] Test downgrade flow (GOLD → RUBY)
5. [ ] Test cancellation flow (any tier → FREE)
6. [ ] Verify renewal emails sent before due date
7. [ ] Verify cancellation email sent on downgrade
8. [ ] Test multi-device login (user logs in elsewhere, tier syncs)
9. [ ] Test founder diamond override
10. [ ] Test regional pricing (if applicable)

---

## Next Steps

1. **Do not attempt to test P0-C until P0-A is fixed**
2. Fix Stripe keys + price IDs (see REVENUE_CERTIFICATION_REPORT_2026_06_25.md)
3. Re-run P0-A certification
4. Once P0-A passes, return to P0-C for end-to-end testing

---

**Report Generated**: 2026-06-25 10:58 AM UTC  
**Authority**: Build Director (Marcel Dickens)  
**Blocked By**: P0-A Revenue Certification (critical blockers)
