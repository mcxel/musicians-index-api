# OPERATOR_MODE_PACK.md
## Startup, Health, Proof, Rollback — Operator Reference
### BerntoutGlobal XXL / The Musician's Index

---

## CURRENT PLATFORM STATE

```
Slices 13–17: COMPLETE ✅ (Room families, live engine, queue, watchdog, operator controls)
Pack 16:      COMPLETE ✅ (75 docs, 76 components, 100 page shells)
Pack 24:      COMPLETE ✅ (Search, notifications, tips, beats, scenes, error handling)
Pack 25:      COMPLETE ✅ (API contracts, Prisma schema, WebSocket map, Stripe wiring)
Pack 26:      COMPLETE ✅ (Owner finance, final closure, this file)
Active State: Copilot wiring phase
```

---

## STARTUP COMMANDS

```bash
# Local development
cd tmi-platform
pnpm install
pnpm -C packages/db run db:migrate:dev
pnpm -C apps/api run start:dev        # Port 4000
pnpm -C apps/web run dev              # Port 3000

# Production build
pnpm install --frozen-lockfile
pnpm -C packages/db run build
pnpm -C packages/hud-runtime run build
pnpm -C packages/hud-theme run build
pnpm -C packages/platform-kernel run build
pnpm -C apps/api run build
pnpm -C apps/web run build
```

---

## HEALTH CHECKS

```bash
# API health
curl https://api.themusiciansindex.com/health
# Expected: {"status":"ok","timestamp":"..."}

# API readiness (DB + Redis)
curl https://api.themusiciansindex.com/api/readyz
# Expected: {"status":"ok","db":"ok","redis":"ok"}

# Web app
curl -I https://themusiciansindex.com/
# Expected: HTTP/2 200

# CDN
curl -I https://cdn.themusiciansindex.com/
# Expected: HTTP/2 200 (or 403 if bucket requires auth — verify with known asset)
```

---

## PROOF COMMANDS

```bash
# Discovery-first test (CRITICAL — blocks deploy if fails)
pnpm test:discovery

# Full smoke test
pnpm test:smoke

# Build proof
pnpm -C apps/web build

# Type check
pnpm -C apps/web typecheck
pnpm -C apps/api typecheck

# Lint
pnpm -C apps/web lint
pnpm -C apps/api lint

# Billing integrity check (run manually before launch)
# Trigger via: /admin/bots → billing-integrity-bot → Run Now
# Verify: Marcel Dickens = Diamond ✓, B.J. M Beat's = Diamond ✓
```

---

## ROLLBACK COMMANDS

### Option A: Feature Flag Kill Switch (< 60 seconds)
```bash
# Via admin UI: /admin/feature-flags → EMERGENCY_READ_ONLY_MODE: true
# Or via API:
curl -X PUT https://api.themusiciansindex.com/api/admin/flags/EMERGENCY_READ_ONLY_MODE   -H "Authorization: Bearer {ADMIN_JWT}"   -H "Content-Type: application/json"   -d '{"value": true}'
```

### Option B: Render API Rollback (< 2 minutes)
```
Render Dashboard → tmi-api → Deploys → Find last green → Rollback
```

### Option C: Cloudflare Pages Rollback (< 2 minutes)
```
Cloudflare Dashboard → Pages → tmi-web → Deployments → ... → Rollback
```

---

## EMERGENCY CONTACTS AND ESCALATION

```
P0 — Platform Down:     Big Ace has emergency access, operator override
P1 — Feature Broken:    Big Ace + Copilot fix
P2 — Performance:       Monitor Render metrics + Cloudflare analytics
P3 — Log Review:        /admin/logs weekly review

Admin access: /admin/command-center (Big Ace role required)
Emergency broadcast: /admin/emergency → EmergencyBroadcastPanel
```

---

## LAST KNOWN-GOOD CHECKPOINT

```
As of Pack 26 closure:
  Slices 13–17 wired and clean (diagnostics confirmed)
  layout.tsx SHA256 hash matches canonical (verified in Slice 12 completion)
  All Pack 16 shells in place
  Pack 24 components added
  Pack 25 contracts documented
  Pack 26 owner finance documented

Next checkpoint: After Copilot completes P0–P5 wiring steps
Tag: git tag pack26-pre-wiring
```

---

## SUPPORT ESCALATION PATH

```
User issue → /support form → support-triage-bot → resolved or escalated to human
Payment issue → /support?type=billing → billing team review
Kid safety concern → /report?type=child-safety → P0 auto-escalate to Big Ace
DMCA → /report?type=dmca → 72h review window
```
