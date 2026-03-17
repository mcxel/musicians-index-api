# FINAL ENV CHECKLIST
# TMI Platform — BerntoutGlobal XXL
# Every environment variable needed across all services.
# Fill ALL values before deploy. Missing vars = runtime failures.

---

## apps/api/.env — LOCAL DEV

```env
# ── Core ──────────────────────────────────────────────────────────────────
NODE_ENV=development
PORT=4000

# ── Database ──────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://postgres:password@localhost:5432/tmi_dev

# ── Auth ──────────────────────────────────────────────────────────────────
JWT_SECRET=<generate: openssl rand -hex 64>
JWT_REFRESH_SECRET=<generate: openssl rand -hex 64>
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
SESSION_SECRET=<generate: openssl rand -hex 32>
CSRF_SECRET=<generate: openssl rand -hex 32>

# ── CORS ──────────────────────────────────────────────────────────────────
CORS_ORIGIN=http://localhost:3001
COOKIE_DOMAIN=localhost

# ── Contest ───────────────────────────────────────────────────────────────
CONTEST_REGISTRATION_DAY=8
CONTEST_REGISTRATION_MONTH=8
CONTEST_MAX_LOCAL_SPONSORS=10
CONTEST_MAX_MAJOR_SPONSORS=10
CONTEST_SEASON_NAME=Grand Platform Contest — Season 1

# ── Email (optional for dev, required for prod) ───────────────────────────
# SMTP_HOST=smtp.ionos.com
# SMTP_PORT=587
# SMTP_USER=noreply@berntoutglobal.com
# SMTP_PASS=<your IONOS email password>
# EMAIL_FROM=noreply@berntoutglobal.com

# ── Storage (optional for dev) ────────────────────────────────────────────
# CLOUDFLARE_R2_BUCKET=tmi-assets
# CLOUDFLARE_R2_ACCESS_KEY=
# CLOUDFLARE_R2_SECRET_KEY=
# CLOUDFLARE_R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
# CLOUDFLARE_R2_PUBLIC_URL=https://assets.berntoutglobal.com

# ── Payments (add when sponsor payments are wired) ────────────────────────
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## RENDER API SERVICE — PRODUCTION ENV VARS

Set these in Render Dashboard → tmi-api → Environment:

```
NODE_ENV=production
PORT=4000
DATABASE_URL=<Render Postgres external URL>
JWT_SECRET=<64-char hex — different from dev>
JWT_REFRESH_SECRET=<64-char hex — different from dev>
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
SESSION_SECRET=<32-char hex>
CSRF_SECRET=<32-char hex>
CORS_ORIGIN=https://yourdomain.com
COOKIE_DOMAIN=yourdomain.com
CONTEST_REGISTRATION_DAY=8
CONTEST_REGISTRATION_MONTH=8
CONTEST_MAX_LOCAL_SPONSORS=10
CONTEST_MAX_MAJOR_SPONSORS=10
CONTEST_SEASON_NAME=Grand Platform Contest — Season 1
SMTP_HOST=smtp.ionos.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=<your email password>
EMAIL_FROM=noreply@yourdomain.com
```

---

## VERCEL/HOSTINGER — PRODUCTION ENV VARS

Set in Vercel Dashboard → Project → Settings → Environment Variables:

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://tmi-api.onrender.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<32-char hex>
NEXT_PUBLIC_CONTEST_OPEN_MONTH=8
NEXT_PUBLIC_CONTEST_OPEN_DAY=8
```

---

## GENERATE SECRETS COMMANDS

Run these in any terminal to generate secure secret values:

```powershell
# PowerShell (Windows)
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64))
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Or use:
- https://generate-secret.vercel.app/64 (for 64-char hex)
- https://generate-secret.vercel.app/32 (for 32-char hex)
- Never reuse dev secrets in production

---

## CRITICAL SECURITY RULES

| Rule | Detail |
|---|---|
| Dev secrets ≠ Prod secrets | Always generate separate secrets |
| Never commit .env to git | Check .gitignore includes `.env` |
| Rotate JWT_SECRET if exposed | All active sessions invalidated on rotation |
| CORS_ORIGIN must match exactly | No trailing slash, exact domain |
| DATABASE_URL in Render is encrypted | Render handles secret storage |

---

## ENV VALIDATION CHECK

```powershell
# Verify contest env vars are present in apps/api/.env
$vars = @("CONTEST_REGISTRATION_DAY","CONTEST_REGISTRATION_MONTH","CONTEST_MAX_LOCAL_SPONSORS","CONTEST_MAX_MAJOR_SPONSORS","CONTEST_SEASON_NAME","DATABASE_URL","JWT_SECRET","JWT_REFRESH_SECRET","CORS_ORIGIN")
foreach ($v in $vars) {
    $line = Select-String -Path "apps\api\.env" -Pattern "^$v=" | Select-Object -First 1
    if ($line) { Write-Host "✓ $v" -ForegroundColor Green }
    else { Write-Host "✗ $v MISSING" -ForegroundColor Red }
}
```

---

*BerntoutGlobal XXL | TMI Platform | Final Env Checklist | Phase 18*
