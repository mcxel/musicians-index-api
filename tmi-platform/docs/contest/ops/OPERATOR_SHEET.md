═══════════════════════════════════════════════════════════════════════════
 TMI PLATFORM — OPERATOR SHEET              BerntoutGlobal XXL
 One-page quick reference. Print this. Keep it nearby.
═══════════════════════════════════════════════════════════════════════════

REPO:       C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform
CHECKPOINT: 21aa9b2  (last stable — Phase 17.5)
API PORT:   4000     │  WEB PORT: 3001
API URL:    http://localhost:4000   │  WEB URL: http://localhost:3001

───────────────────────────────────────────────────────────────────────────
 START SERVERS
───────────────────────────────────────────────────────────────────────────
 TERMINAL 1 (API):
   Set-Location "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform"
   $dbLine = Select-String -Path apps\api\.env -Pattern '^DATABASE_URL='
   $env:DATABASE_URL = $dbLine.Line.Substring(13).Trim('"')
   $env:PORT = '4000'
   pnpm --filter tmi-platform-api start:dev

 TERMINAL 2 (WEB):
   Set-Location "...\tmi-platform\apps\web"
   pnpm dev -- -p 3001

───────────────────────────────────────────────────────────────────────────
 HEALTH CHECKS
───────────────────────────────────────────────────────────────────────────
 try{(Invoke-WebRequest -UseBasicParsing http://localhost:3001/auth).StatusCode}
 catch{$_.Exception.Message}

 try{(Invoke-WebRequest -UseBasicParsing http://localhost:4000/api/healthz).Content}
 catch{$_.Exception.Message}

 try{(Invoke-WebRequest -UseBasicParsing http://localhost:4000/api/readyz).Content}
 catch{$_.Exception.Message}

───────────────────────────────────────────────────────────────────────────
 KEY PROOF COMMANDS (run one at a time)
───────────────────────────────────────────────────────────────────────────
 pnpm -C apps/api build
 pnpm -C apps/web build
 pnpm -C apps/api run test:readiness-contract
 pnpm -s exec playwright test tests/e2e/phase13_5.spec.ts --workers=1
 pnpm -s exec playwright test tests/e2e/phase14_onboarding.spec.ts --workers=1
 pnpm -s exec playwright test tests/e2e/phase15_rbac_boundaries.spec.ts --workers=1
 pnpm -s exec playwright test tests/e2e/phase15_4_api_guards.spec.ts --workers=1
 pnpm -s exec playwright test tests/e2e/phase15_5_artist_admin.spec.ts --workers=1
 pnpm -s exec playwright test tests/e2e/contest.smoke.spec.ts --workers=1

───────────────────────────────────────────────────────────────────────────
 PRISMA COMMANDS
───────────────────────────────────────────────────────────────────────────
 npx prisma generate          (after schema change)
 npx prisma migrate dev --name <name>   (local dev migration)
 npx prisma migrate deploy    (production migration — NOT dev)
 npx prisma studio            (visual DB browser at localhost:5555)

───────────────────────────────────────────────────────────────────────────
 ROLLBACK
───────────────────────────────────────────────────────────────────────────
 SOFT:   fix the broken file → rebuild
 WAVE:   git stash → confirm clean build → git stash pop → fix file only
 HARD:   git stash → git checkout 21aa9b2 → pnpm install → rebuild

───────────────────────────────────────────────────────────────────────────
 DO NOT TOUCH — EVER
───────────────────────────────────────────────────────────────────────────
 ✗ apps/web/src/middleware.ts
 ✗ apps/api/src/auth/*
 ✗ apps/web/src/app/onboarding/*
 ✗ .github/workflows/ci.yml
 ✗ apps/api/src/modules/health/*
 ✗ packages/db/prisma/schema.prisma  (APPEND ONLY)
 ✗ apps/api/src/app.module.ts        (ADD 1 LINE ONLY)

───────────────────────────────────────────────────────────────────────────
 TERMINAL RULES
───────────────────────────────────────────────────────────────────────────
 ✓ ONE command block per paste
 ✓ Raw commands only — NO chat text, labels, or prose
 ✗ "Enter : not recognized" = chat text was pasted — start over

───────────────────────────────────────────────────────────────────────────
 UPLOAD GATE
───────────────────────────────────────────────────────────────────────────
 .\PHASE18_PROOF_GATE.ps1    → must exit 0 before any deploy
 All E2E tests pass          → CI green on GitHub
 Smoke pack captured         → screenshots saved

───────────────────────────────────────────────────────────────────────────
 CONTEST DATES
───────────────────────────────────────────────────────────────────────────
 Registration opens: AUGUST 8 every year (Marcel's birthday — non-negotiable)
 Local sponsors needed:  10
 Major sponsors needed:  10
 Total to qualify:       20

───────────────────────────────────────────────────────────────────────────
 LIVE URLS (fill in after deploy)
───────────────────────────────────────────────────────────────────────────
 Production web:  https://___________________________
 Production API:  https://___________________________
 API healthz:     https://___________________________/api/healthz
 Admin panel:     https://___________________________/contest/admin

 BerntoutGlobal XXL │ TMI Platform │ Phase 18.4 │ Keep printed and nearby
═══════════════════════════════════════════════════════════════════════════
