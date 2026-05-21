# ENV_TEMPLATE_AND_KEYS_MAP.md
## Every Environment Variable — What It Does, What Breaks Without It

---

## COPY THIS INTO YOUR .env FILES (Replace placeholder values)

---

## apps/web — .env.local

```env
# ─── AUTH ──────────────────────────────────────────────────────
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=REPLACE_WITH_STRONG_SECRET_32_CHARS_MIN

# GitHub OAuth (for dev/test accounts)
GITHUB_CLIENT_ID=REPLACE_WITH_GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET=REPLACE_WITH_GITHUB_CLIENT_SECRET

# ─── API CONNECTION ────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001

# ─── ANALYTICS ─────────────────────────────────────────────────
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
# (optional in dev, required in prod)

# ─── STRIPE (billing) ─────────────────────────────────────────
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXX
# (optional in dev until billing wired)

# ─── FEATURE FLAGS ─────────────────────────────────────────────
NEXT_PUBLIC_ENABLE_FACE_SCAN=false
NEXT_PUBLIC_ENABLE_AUDIENCE_3D=false
NEXT_PUBLIC_ENABLE_BROADCASTER=false
NEXT_PUBLIC_ENABLE_WORLD_CONCERT=false
NEXT_PUBLIC_ENABLE_DAILY_SPIN=true
NEXT_PUBLIC_ENABLE_STREAM_AND_WIN=true

# ─── HUD ───────────────────────────────────────────────────────
NEXT_PUBLIC_HUD_COORDS_LAT=39.7285
NEXT_PUBLIC_HUD_COORDS_LON=-121.8375
NEXT_PUBLIC_HUD_SHOW_STATUS_FOOTER=true
```

---

## apps/api — .env

```env
# ─── DATABASE ──────────────────────────────────────────────────
DATABASE_URL=postgresql://postgres:password@localhost:5432/tmi_dev
# BREAKS IF MISSING: Nothing works. App fails to start.

# ─── AUTH ──────────────────────────────────────────────────────
NEXTAUTH_SECRET=REPLACE_WITH_SAME_SECRET_AS_WEB
JWT_SECRET=REPLACE_WITH_STRONG_JWT_SECRET
# BREAKS IF MISSING: All protected routes return 401.

# ─── STRIPE ────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXX
# BREAKS IF MISSING: Subscription billing fails.

# ─── STORAGE (media/avatars/clips) ────────────────────────────
STORAGE_PROVIDER=local
# Options: local | cloudflare-r2 | s3
STORAGE_BUCKET=tmi-media
STORAGE_ACCESS_KEY=REPLACE_WITH_KEY
STORAGE_SECRET_KEY=REPLACE_WITH_SECRET
STORAGE_ENDPOINT=https://ACCOUNT.r2.cloudflarestorage.com
# BREAKS IF MISSING: Avatar uploads fail, clip generation fails.

# ─── TTS (broadcaster voices) ─────────────────────────────────
ELEVENLABS_API_KEY=REPLACE_WITH_ELEVENLABS_KEY
ELEVENLABS_VOICE_VEE_JAY_80=VOICE_ID_PLACEHOLDER
ELEVENLABS_VOICE_THE_SPECIALIST=VOICE_ID_PLACEHOLDER
# BREAKS IF MISSING: Broadcaster is silent (non-fatal, degrades gracefully).

# ─── REDIS (session / queue / sync) ───────────────────────────
REDIS_URL=redis://localhost:6379
# BREAKS IF MISSING: Live sync fails. Session handling degrades.

# ─── INTERNAL CONFIG ───────────────────────────────────────────
API_BASE_URL=http://localhost:3001
API_PORT=3001
NODE_ENV=development

# ─── EMAIL (notifications) ────────────────────────────────────
EMAIL_PROVIDER=console
# Options: console (dev) | resend | sendgrid
RESEND_API_KEY=REPLACE_WITH_RESEND_KEY
EMAIL_FROM=noreply@themusiciansindex.com
# BREAKS IF MISSING: Email notifications go to console only (non-fatal in dev).

# ─── PAYOUT ────────────────────────────────────────────────────
PAYOUT_PROVIDER=manual
# Options: manual | stripe-connect
STRIPE_CONNECT_CLIENT_ID=ca_XXXXXXXXXX
# BREAKS IF MISSING: Payouts must be processed manually (non-fatal until billing phase).
```

---

## PRODUCTION ADDITIONS (.env.production / Cloudflare / Vercel)

```env
# Replace all dev URLs:
NEXTAUTH_URL=https://themusiciansindex.com
NEXT_PUBLIC_APP_URL=https://themusiciansindex.com
NEXT_PUBLIC_API_URL=https://api.themusiciansindex.com
DATABASE_URL=postgresql://...production-url...
REDIS_URL=redis://...production-url...
NODE_ENV=production
STORAGE_PROVIDER=cloudflare-r2
EMAIL_PROVIDER=resend
```

---

## WHAT BREAKS IF MISSING — SEVERITY CHART

| Variable | Missing Effect | Severity |
|---|---|---|
| `DATABASE_URL` | App fails to start | 🔴 CRITICAL |
| `NEXTAUTH_SECRET` | Auth broken, all users logged out | 🔴 CRITICAL |
| `NEXTAUTH_URL` | OAuth redirects fail | 🔴 CRITICAL |
| `STRIPE_SECRET_KEY` | Billing broken | 🟠 HIGH |
| `REDIS_URL` | Live sync degrades | 🟠 HIGH |
| `STORAGE_*` | Uploads fail | 🟠 HIGH |
| `GITHUB_CLIENT_ID/SECRET` | OAuth login fails | 🟡 MEDIUM |
| `ELEVENLABS_API_KEY` | Broadcaster silent | 🟢 LOW |
| `EMAIL_PROVIDER/KEY` | Emails to console | 🟢 LOW |
| `NEXT_PUBLIC_GA_ID` | Analytics not collected | 🟢 LOW |
| `PAYOUT_*` | Manual payouts only | 🟢 LOW |

---

## CLOUDFLARE PAGES ENV SETUP

In Cloudflare Pages → Settings → Environment Variables:
1. Add all `NEXT_PUBLIC_*` variables as plain-text
2. Add all secret keys as encrypted variables
3. Add `NODE_ENV=production`
4. Ensure `NEXTAUTH_URL` matches your production domain exactly

**Current active blocker**: Cloudflare build failing for `musicians-index-api` and `musicians-index-web`.
Paste first 30–50 lines of the Cloudflare error log to diagnose.

---

*ENV Template and Keys Map v1.0 — BerntoutGlobal XXL*
