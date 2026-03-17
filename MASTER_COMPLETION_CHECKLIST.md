# BerntoutGlobal XXL - Master Completion Checklist

## 📊 Current Status

| Area | Status | Completion |
|------|--------|------------|
| Build & Infrastructure | ✅ Complete | 95% |
| HUD/Kiosk Display | ✅ Complete | 95% |
| Runtime Status | ✅ Complete | 95% |
| Database Schema | ✅ Complete | 100% |
| Auth/Roles | 🟡 Partial | 70% |
| Payments | 🟡 Partial | 60% |
| Promo System | 🟡 Schema Ready | 80% |
| Hub Registry | 🟡 Schema Ready | 70% |
| Deployment | 🟡 Configured | 75% |
| Onboarding Docs | ✅ Complete | 100% |

---

## ✅ Completed Items

### Infrastructure
- [x] Build passes (`pnpm -C tmi-platform/apps/web build`)
- [x] Path alias fixed (`@program/*` → `../../../program/*`)
- [x] Gates script created (`tmi-platform/scripts/gates.ps1`)
- [x] Environment templates created (`.env.example`)

### HUD/Kiosk System
- [x] Kiosk lock mode
- [x] Wallboard rotation
- [x] Fullscreen mode
- [x] Offline backoff + countdown
- [x] Progressive reload (30s → 60s → 120s)
- [x] Countdown cancels when runtime returns

### Database Schema
- [x] User + Roles (USER, ARTIST, STAFF, ADMIN, JUDGE, SPONSOR)
- [x] Artist profiles
- [x] Music links with audit
- [x] Stripe subscriptions
- [x] Ledger entries
- [x] Promo codes (hashed, single-use, expiring)
- [x] Hub registry
- [x] Audit logging

### Documentation
- [x] ONBOARDING_README.md
- [x] tmi-platform/apps/web/.env.example
- [x] tmi-platform/apps/api/.env.example

---

## 🟡 In Progress / Partial

### Auth & Roles
- [ ] NextAuth fully wired
- [ ] Role middleware enforcement
- [ ] Session management
- [ ] Email verification
- [ ] "Official links" restriction enforced (only Marcel, Micah, J. Paul)

### Payments
- [ ] Stripe checkout integration
- [ ] Webhook handling
- [ ] Subscription sync
- [ ] Refund flow

### Promo System
- [ ] Admin UI for promo management
- [ ] Big Ace suggestion workflow
- [ ] Redemption endpoint security
- [ ] Rate limiting

### Hub Registry
- [ ] Hub registration endpoint
- [ ] Health check aggregation
- [ ] EXE hub console integration

---

## 🔴 Not Started

### Deployment
- [ ] Cloudflare Pages production deploy
- [ ] IONOS VPS runtime setup
- [ ] SSL/TLS configuration
- [ ] Domain DNS setup

### Operations
- [ ] Backup scripts
- [ ] Monitoring/alerting
- [ ] Runbook documentation
- [ ] Incident response plan

### Polish
- [ ] Motion budgets by mode
- [ ] Reduced motion toggle
- [ ] Diagnostics panel (MASTER only)
- [ ] Error boundaries

---

## 📋 AI Assignment Map

### Gemini (Architecture & Planning)
- Auth flow design
- Security threat model
- Deployment strategy
- Performance budgets

### Blackbox (Automation & Templates)
- Deploy templates (docker, nginx)
- Inno Setup scaffolding
- Scripts (backup, smoke tests)
- Admin UI scaffolds

### Copilot (Implementation)
- Auth integration
- RBAC middleware
- Promo redemption logic
- UI polish

---

## 🎯 Next Steps

### Priority 1: Deploy Today
1. Run gates: `powershell -File .\tmi-platform\scripts\gates.ps1`
2. Test runtime: Start servers and verify `/api/internal/runtime/status`
3. Test kiosk: Open `http://localhost:3000/hud?mode=kiosk&module=xxl`

### Priority 2: Auth & Onboarding
1. Wire NextAuth completely
2. Add role middleware
3. Enforce "official links" rule

### Priority 3: Payments
1. Complete Stripe integration
2. Add webhook handlers
3. Test checkout flow

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `tmi-platform/scripts/gates.ps1` | Build verification |
| `tmi-platform/apps/web/.env.example` | Web env template |
| `tmi-platform/apps/api/.env.example` | API env template |
| `tmi-platform/packages/db/prisma/schema.prisma` | Database schema |
| `ONBOARDING_README.md` | Setup guide |

---

*Last Updated: 2024*
