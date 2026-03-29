# WEBHOOK_SECRET_AND_PROVIDER_CHECKLIST.md
## Every Third-Party Service — Keys, Webhooks, and Configuration
### BerntoutGlobal XXL / The Musician's Index

Complete this checklist before running pnpm test:smoke.

---

## STRIPE

```
□ Stripe account created and business details submitted
□ Secret key (sk_live_...) added to API env: STRIPE_SECRET_KEY
□ Publishable key (pk_live_...) added to web env: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
□ Webhook endpoint registered in Stripe Dashboard:
    URL: https://api.themusiciansindex.com/api/stripe/webhook
    Events to listen for:
      payment_intent.succeeded
      payment_intent.payment_failed
      checkout.session.completed
      customer.subscription.deleted
      customer.subscription.updated
      invoice.payment_failed
      transfer.paid
      transfer.failed
      account.updated (Connect)
□ Webhook signing secret (whsec_...) added to env: STRIPE_WEBHOOK_SECRET
□ Stripe Connect enabled (for artist payouts)
□ Test: stripe listen --forward-to localhost:4000/api/stripe/webhook
□ Test: stripe trigger payment_intent.succeeded → handler fires
```

## EMAIL (RESEND)

```
□ Resend account created at resend.com
□ Domain themusiciansindex.com verified in Resend DNS settings
□ API key generated and added to env: RESEND_API_KEY
□ FROM address configured: noreply@themusiciansindex.com
□ Test: POST /api/test/send-email → email arrives
□ Transactional email templates created in Resend dashboard:
    - Welcome email
    - Tip received notification
    - Fan club membership confirmation
    - Ticket purchase receipt
    - Payout confirmation
    - Weekly digest
    - Account deletion warning (30-day notice)
```

## WEB PUSH NOTIFICATIONS (VAPID)

```
□ VAPID key pair generated:
    npx web-push generate-vapid-keys
□ Public key added to BOTH envs:
    API: VAPID_PUBLIC_KEY
    Web: NEXT_PUBLIC_VAPID_PUBLIC_KEY
□ Private key added to API env only: VAPID_PRIVATE_KEY
□ VAPID subject set: VAPID_SUBJECT=mailto:hello@themusiciansindex.com
□ Test: subscribe browser → send push → notification appears
□ iOS: PWA must be installed to home screen before push works
□ Android: Chrome supports push from browser
```

## CLOUDFLARE

```
□ Turnstile widget created at dash.cloudflare.com/turnstile
    Mode: Invisible (recommended) or Managed
□ Site key added to web env: NEXT_PUBLIC_TURNSTILE_SITE_KEY
□ Secret key added to API env: CLOUDFLARE_TURNSTILE_SECRET
□ DNS configured (see DOMAIN_AND_DNS_SYSTEM.md):
    themusiciansindex.com → Cloudflare Pages
    api.themusiciansindex.com → Render API
    cdn.themusiciansindex.com → R2 public URL
□ SSL Mode: Full (Strict) — NOT Flexible
□ R2 bucket created: tmi-media
□ R2 public domain configured: cdn.themusiciansindex.com
□ R2 access keys generated and added to API env
□ Test: upload test image → accessible at cdn.themusiciansindex.com/test.jpg
```

## PAYPAL (OWNER DISTRIBUTIONS)

```
□ PayPal Business account for BerntoutGlobal LLC
□ PayPal REST API credentials:
    Client ID → PAYPAL_CLIENT_ID
    Secret → PAYPAL_CLIENT_SECRET
□ PayPal Payouts feature enabled (requires business account approval)
□ Verified payout destinations:
    Marcel Dickens: berntmusic33@gmail.com (verified PayPal)
    J. Paul Sanchez: [configured by Jay Paul]
□ Test: PayPal sandbox payout → both recipients receive test amount
□ Note: First real payout requires Big Ace manual review at /admin/finance/profit
```

## MONITORING (OPTIONAL BUT RECOMMENDED)

```
□ Sentry project created (separate for API and Web)
□ API DSN added to env: SENTRY_DSN
□ Web DSN added to env: NEXT_PUBLIC_SENTRY_DSN
□ Error alert emails configured in Sentry
□ Uptime monitoring configured (BetterStack/UptimeRobot):
    https://themusiciansindex.com/
    https://api.themusiciansindex.com/health
    https://api.themusiciansindex.com/api/readyz
□ Alert threshold: page down > 2 minutes → SMS/email to Big Ace
```

## ELEVENLABS (OPTIONAL — Stage Director Bot TTS)

```
□ ElevenLabs API key → ELEVENLABS_API_KEY
□ Voice ID selected for Big Ace announcements
□ Test: stage-director-bot trigger → TTS announcement plays in room
□ Fallback: if ElevenLabs fails → text-only announcement (graceful degradation)
```

## FINAL CHECKLIST BEFORE DEPLOY

```
□ All REQUIRED env vars set (see ENV_VAR_MASTER_LIST.md)
□ Stripe webhook registered and tested
□ Email delivery confirmed
□ R2 CDN accessible
□ Cloudflare Turnstile tested (ticket purchase blocked without token)
□ SSL Full (Strict) confirmed
□ Database migration ran successfully
□ pnpm test:discovery PASSES
□ pnpm test:smoke PASSES
```
