# SSL_TLS_SYSTEM.md
## SSL/TLS Configuration — Secure Everything
### BerntoutGlobal XXL / The Musician's Index

---

## CLOUDFLARE SSL SETTINGS

| Setting | Value |
|---|---|
| SSL Mode | Full (Strict) |
| Minimum TLS | TLS 1.2 |
| TLS 1.3 | Enabled |
| HSTS | Enabled (after initial setup confirmed) |
| HSTS Max Age | 1 year |
| Always Use HTTPS | Enabled |
| Automatic HTTPS Rewrites | Enabled |

---

## WHY FULL (STRICT)

- **Flexible**: Only Cloudflare→Browser is encrypted. Cloudflare→Origin is plain HTTP. ❌ INSECURE
- **Full**: Both encrypted, but Cloudflare accepts self-signed certs on origin. Better.
- **Full (Strict)**: Both encrypted, origin must have valid cert. ✅ REQUIRED FOR PRODUCTION

Render and Cloudflare Pages both provide valid SSL certs automatically.

---

## CERTIFICATE COVERAGE

- `*.themusiciansindex.com` — Cloudflare provides wildcard cert automatically
- `themusiciansindex.com` — covered by Cloudflare cert
- API on Render — Render provides cert at `{service}.onrender.com`

---

## HSTS (HTTP Strict Transport Security)

Only enable HSTS after:
- SSL is confirmed working everywhere
- All subdomains are HTTPS
- You're sure the domain will always use HTTPS

If enabled incorrectly, reverting is very difficult (browsers cache HSTS for up to 1 year).
