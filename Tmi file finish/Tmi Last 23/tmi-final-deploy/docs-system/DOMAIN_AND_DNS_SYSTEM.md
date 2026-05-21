# DOMAIN_AND_DNS_SYSTEM.md
## DNS Records and Domain Configuration
### BerntoutGlobal XXL / The Musician's Index

---

## DNS RECORDS TABLE

| Name | Type | Target | Proxy | TTL |
|---|---|---|---|---|
| `@` (root) | A/CNAME | Cloudflare Pages | Proxied | Auto |
| `www` | CNAME | Cloudflare Pages | Proxied | Auto |
| `api` | CNAME | `{render-service}.onrender.com` | Proxied | Auto |
| `cdn` | CNAME | `{bucket}.r2.dev` | Proxied | Auto |
| `media` | CNAME | `{bucket}.r2.dev` | Proxied | Auto |
| `status` | CNAME | StatusPage provider | DNS Only | Auto |

---

## REDIRECT RULES

```
http://themusiciansindex.com → https://themusiciansindex.com (301)
http://www.themusiciansindex.com → https://themusiciansindex.com (301)
https://www.themusiciansindex.com → https://themusiciansindex.com (301)
```

---

## DOMAIN VERIFICATION REQUIREMENTS

For app stores and services:
- Google Play: Add `assetlinks.json` at `/.well-known/assetlinks.json`
- Apple: Add `apple-app-site-association` at `/.well-known/apple-app-site-association`
- Stripe: Add TXT record for webhook endpoint verification

---

## HOSTINGER DOMAIN SETUP

If domain is registered on Hostinger:
1. Update nameservers to Cloudflare nameservers
2. Cloudflare then manages all DNS
3. Hostinger continues to handle billing/renewal
