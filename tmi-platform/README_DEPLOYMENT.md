# Deployment Guide (Practical, Current-State)

This guide is for deploying the current soft-launch architecture safely.

## 1) Pre-deploy checklist

- Ensure dependencies install cleanly:
  ```bash
  pnpm install
  ```
- Run validation/build gates you actively use:
  ```bash
  pnpm -r --if-present run typecheck
  pnpm -r --if-present run build
  ```
- If DB/schema-backed modules were changed, regenerate clients before build:
  ```bash
  pnpm prisma:generate
  ```

## 2) Environment configuration (Vercel)

Set only what your current deployment needs. Do not assume all integrations are mandatory.

Common vars to verify:

- `DAILY_API_KEY` (if video room creation relies on Daily)
- `STRIPE_SECRET_KEY` (if payment paths are enabled)
- `STRIPE_WEBHOOK_SECRET` (required for trusted webhook verification)
- `STRIPE_PRICE_*` / `NEXT_PUBLIC_STRIPE_PRICE_*` (must be real live IDs and aligned to your product/tier mapping)
- `DATABASE_URL` (only if DB-backed flows are enabled for the target deploy)

If standalone/fallback auth is the intended soft-launch mode, keep docs/operator expectations aligned with that mode.

## 3) Domain/edge settings

If fronted by Cloudflare, use SSL mode compatible with your app/proxy setup (commonly Full/Strict when certs are valid end-to-end).

## 4) Post-deploy smoke test (minimum)

Run these checks on the deployed URL:

1. `/auth` loads and registration/sign-in path works
2. `/hub` or expected role landing is reachable after auth
3. `/home/1` through `/home/5` load and remain navigable
4. live/video surfaces render expected UI
5. admin/overseer route access behaves correctly by role/session

## 5) API smoke test examples (curl)

Adjust host as needed:

### Auth/invite sanity

```bash
curl -X POST https://<your-domain>/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke@test.com","password":"StrongPass123!"}'
```

```bash
curl -X POST https://<your-domain>/api/invites/send \
  -H "Content-Type: application/json" \
  -d '{"to":"user@example.com","name":"Smoke User"}'
```

Validate both success and error behavior (missing fields, auth-required paths, permission failures).

### Stripe webhook route sanity (docs-level check)

Production should treat `/api/stripe/webhook` as the canonical Stripe fulfillment endpoint.
A deprecated alternate route (`/api/webhooks/stripe`) may still exist in code; avoid configuring Stripe Dashboard to the deprecated path.

## 6) Mobile release reality check

- This repository is primarily a Next.js web app.
- Existing `android/` and `ios/` directories may represent wrapper/scaffold work in progress.
- Do not assume a Flutter pipeline unless a verified `pubspec.yaml` project exists.
- Before store packaging, confirm actual mobile project artifacts (for example: `gradlew`, `build.gradle`, `.xcodeproj`/`.xcworkspace`, or other verified wrapper config) in the chosen mobile handoff package.

## 7) Release safety notes

- Keep README/Onboarding aligned with deployed mode (standalone vs external API-dependent).
- Avoid announcing future-state capabilities as live unless verified in production.
- Treat broken auth/navigation/live-entry flows as launch blockers.

## 8) Recommended release sequence

1. Deploy build
2. Run smoke test
3. Fix blockers only
4. Re-test
5. Soft-launch to controlled cohort
6. Expand traffic after stable telemetry window
