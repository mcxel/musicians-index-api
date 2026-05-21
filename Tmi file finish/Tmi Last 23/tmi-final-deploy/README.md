# TMI FINAL DEPLOYMENT LAYER — Repo Move Guide
## Everything from Downloads Into the Repo
### BerntoutGlobal XXL / The Musician's Index
**"This is your stage, be original."**

---

## MOVE GUIDE — DELETE FROM DOWNLOADS AFTER EACH STEP

### Step 1: Move Pack 15 Final Completion
**From:** Downloads/tmi-pack15-final-completion.zip (extract first)
```
tmi-pack15/master-control/    → tmi-platform/docs/system/
tmi-pack15/world-simulation/  → tmi-platform/docs/system/
tmi-pack15/lifecycle/         → tmi-platform/docs/system/
tmi-pack15/device-distribution/ → tmi-platform/docs/system/
tmi-pack15/monitoring-ops/    → tmi-platform/docs/system/
tmi-pack15/asset-pipeline/    → tmi-platform/docs/system/
tmi-pack15/billing-compliance/ → tmi-platform/docs/system/
tmi-pack15/proof-launch/      → tmi-platform/docs/system/
tmi-pack15/component-shells/  → tmi-platform/apps/web/src/components/ (see SECTION B)
tmi-pack15/bot-specs/         → tmi-platform/docs/system/bots/
```

### Step 2: Move Pack 16 Repo-Ready Normalization
**From:** Downloads/tmi-pack16-repo-ready-normalization.zip (extract first)
```
tmi-pack16/docs-system/       → tmi-platform/docs/system/
tmi-pack16/docs-system/bots/  → tmi-platform/docs/system/bots/
tmi-pack16/components/        → tmi-platform/apps/web/src/components/
tmi-pack16/pages/             → tmi-platform/apps/web/src/app/
```

### Step 3: Move This Final Deployment Layer
**From:** Downloads/tmi-final-deploy-layer.zip (extract first)
```
tmi-final-deploy/docs-system/ → tmi-platform/docs/system/
tmi-final-deploy/audit/       → tmi-platform/docs/system/  (keep as reference)
```

---

## ⚠️ DO NOT OVERWRITE THESE WORKING FILES

Before merging pages, check these already exist and work:
```
apps/web/src/app/page.tsx              ← Homepage 1 (Crown)
apps/web/src/app/(auth)/register/      ← Registration  
apps/web/src/app/(auth)/login/         ← Login
apps/web/src/app/onboarding/           ← Onboarding
apps/web/src/app/dashboard/            ← Dashboard router
apps/web/src/app/streamwin/            ← Stream & Win
```

For any route that already exists, compare the shell file before overwriting.

---

## WHAT THIS FINAL PACK ADDS

| File | Purpose |
|---|---|
| FINAL_ENVIRONMENT_MATRIX.md | All env vars by environment with examples |
| DEPLOYMENT_COMPATIBILITY_SYSTEM.md | Render + Next.js + Cloudflare + Hostinger architecture |
| NODE_AND_BUILD_CONTRACT.md | Exact Node 20.x + pnpm 8.x + build order |
| ENV_VARIABLE_CONTRACT.md | Every variable, what it does, failure impact |
| CLOUDFLARE_AND_PROXY_COMPATIBILITY.md | DNS + cache + WebSocket + SSL rules |
| RENDER_API_DEPLOYMENT_SPEC.md | Service config + health paths + migration strategy |
| NEXTJS_PRODUCTION_RUNTIME_SPEC.md | Route types, transpilePackages fix, middleware rules |
| MEDIA_AND_ASSET_DELIVERY_SPEC.md | R2 storage + CDN + folder structure + fallbacks |
| WEBSOCKET_AND_LIVE_TRANSPORT_SPEC.md | WebSocket gateway + Redis pub/sub + SSE fallback |
| CORS_AND_ORIGIN_POLICY.md | CORS config + cookie rules |
| COOKIE_AND_SESSION_DOMAIN_RULES.md | Session architecture + cookie settings |
| DOMAIN_AND_DNS_SYSTEM.md | Complete DNS records table |
| SSL_TLS_SYSTEM.md | Full (Strict) configuration guide |
| HOSTINGER_DEPLOYMENT_COMPATIBILITY.md | Hostinger's role (marketing shell recommended) |
| MONITORING_AND_ALERT_WIRING_SPEC.md | Sentry + Logtail + Render metrics + uptime monitoring |
| ROLLBACK_AND_RESTORE_RUNBOOK.md | 4 rollback options with decision tree |
| STAGING_TO_PRODUCTION_PROMOTION.md | Branch strategy + migration process |
| DEVICE_COMPATIBILITY_MATRIX.md | Browser + device + iOS audio + TV D-pad support |
| APP_STORE_DISTRIBUTION_CHECKLIST.md | Complete Apple + Google checklist |
| ADVERTISING_SYSTEM.md | Ad placement zones, formats, restrictions |
| SPONSORSHIP_SYSTEM.md | Sponsor types, campaign workflow, analytics |
| AD_PLACEMENT_POLICY.md | Exact blocked zones for ads |
| SPONSOR_PLACEMENT_POLICY.md | Exact blocked zones for sponsors |
| PACK16_MICRO_AUDIT.md | Completeness verification — passed |
| COPILOT_HANDOFF_PROMPT.md | Copy-paste this to Copilot to start wiring |

---

## ACTIVE BLOCKER — FIX THIS FIRST

```
Cloudflare Pages build failing for musicians-index-web

Root cause: @tmi/hud-runtime workspace packages don't have dist/ during Cloudflare build

Fix A (Simplest): Add prebuild to apps/web/package.json:
"prebuild": "pnpm -C ../../packages/hud-runtime build"

Fix B (More Complete): Add transpilePackages to next.config.js:
transpilePackages: ['@tmi/hud-runtime','@tmi/hud-theme','@tmi/platform-kernel']

Apply both fixes. Proof: Cloudflare Pages shows SUCCESS.
```

---

## PLATFORM COMPLETION STATUS

All 16 architecture packs complete. Planning is done.

| Layer | Status |
|---|---|
| Runtime Foundation | ✅ 90% |
| Architecture Docs (75+ files) | ✅ 100% |
| Component Shells (76 files) | ✅ 100% |
| Page Shells (100 routes) | ✅ 100% |
| Bot Specs (26+ bots) | ✅ 100% |
| Deployment Layer (23 files) | ✅ 100% NEW |
| Advertising/Sponsorship Separation | ✅ 100% NEW |
| App Store Distribution | ✅ 100% NEW |
| **Remaining Work** | **Copilot wiring + VS Code proof** |

---

*BerntoutGlobal LLC — "This is your stage, be original."*
