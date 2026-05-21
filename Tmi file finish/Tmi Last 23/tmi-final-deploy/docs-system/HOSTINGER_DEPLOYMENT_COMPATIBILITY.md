# HOSTINGER_DEPLOYMENT_COMPATIBILITY.md
## Hostinger — Role in the Platform Architecture
### BerntoutGlobal XXL / The Musician's Index

---

## RECOMMENDED ROLE: MARKETING SHELL ONLY

Hostinger is best used for the public marketing pages:
- `/features`
- `/how-it-works`
- `/for-artists`
- `/for-producers`
- `/for-venues`
- `/for-sponsors`
- `/press`
- `/partners`

These are static HTML pages. No Node.js required. Hostinger handles them perfectly.

---

## HOSTINGER STATIC DEPLOYMENT

1. Build static pages from Next.js:
```bash
pnpm -C apps/web run export  # If using static export for marketing pages
# OR: use Next.js static generation for those specific routes
```

2. Upload to Hostinger File Manager or via FTP
3. Set up domain redirect to Cloudflare for everything else

---

## IF USING HOSTINGER AS FULL APP HOST (Not Recommended)

Requirements:
- Hostinger Business Cloud or VPS plan (requires Node.js support)
- Use Hostinger's Node.js app deployment
- Configure reverse proxy for `/api/*` → Render
- Still use Cloudflare in front for CDN/SSL

This configuration is more complex. Recommend Option A (marketing only).

---

## DOMAIN/SSL ON HOSTINGER

- Register domain on Hostinger
- Update nameservers to Cloudflare
- Cloudflare handles SSL and CDN
- Hostinger handles only billing/renewal

---

## NODE VERSION ON HOSTINGER (If Using Node)

Check Hostinger's supported Node versions.
Minimum required: Node 20.x
If Hostinger doesn't support Node 20: use Render for all Node workloads, Hostinger for static only.
