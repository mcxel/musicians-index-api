# LAUNCH_DAY_COMMAND_PACK.md
## Exact Commands for Launch Day — In Order
T-24h:
  pnpm run build --all
  pnpm test
  pnpm test:smoke
  k6 run scripts/load/pre-launch.js --vus 50 --duration 120s
  pnpm -C packages/db run db:migrate:prod
  pnpm -C packages/db run db:seed:demo
  [Verify all env vars in Cloudflare, Stripe webhooks active, Resend verified, DNS correct]
T-2h:
  git push origin main
  [Wait for Cloudflare build ✅]
  curl https://themusiciansindex.com/ -I  → HTTP 200
  curl https://api.themusiciansindex.com/health -I  → HTTP 200
  [Verify crown bot scheduled, all bots on schedule]
T-0:
  POST /api/admin/flags {ENABLE_HOMEPAGE_SYSTEM:true}
  POST /api/admin/flags {ENABLE_AUTH:true,ENABLE_ONBOARDING:true}
  POST /api/admin/flags {ENABLE_STREAM_AND_WIN:true}
  [Confirm operator health overlay green]
  [Confirm no P0/P1 alerts]
  [Invite first members]
ROLLBACK: POST /api/admin/flags {EMERGENCY_READ_ONLY_MODE:true} → post status → diagnose → fix staging → redeploy → disable read-only
