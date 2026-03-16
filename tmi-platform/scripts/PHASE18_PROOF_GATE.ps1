# PHASE18_PROOF_GATE.ps1
# TMI Platform — BerntoutGlobal XXL
# Pre-upload proof gate. Runs ALL checks. Exits 0 = PASS, 1 = FAIL.
# Run this before every upload. All checks must pass.
# Usage: .\PHASE18_PROOF_GATE.ps1

$REPO = "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform"
$PASS = 0
$FAIL = 0
$FAILURES = @()

function Check($label, $passed, $detail = "") {
    if ($passed) {
        Write-Host "  ✓ $label" -ForegroundColor Green
        $script:PASS++
    } else {
        Write-Host "  ✗ $label" -ForegroundColor Red
        if ($detail) { Write-Host "    → $detail" -ForegroundColor DarkRed }
        $script:FAIL++
        $script:FAILURES += $label
    }
}

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   TMI PRE-UPLOAD PROOF GATE (Phase 18.1)             ║" -ForegroundColor Cyan
Write-Host "║   BerntoutGlobal XXL — All checks must pass          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Set-Location $REPO

# ── SECTION 1: REPO STATE ─────────────────────────────────────────────────
Write-Host "▶ REPO STATE" -ForegroundColor Yellow
$gitHash = git rev-parse --short HEAD 2>$null
Check "Git repo accessible" ($LASTEXITCODE -eq 0)
if ($gitHash) { Write-Host "    Commit: $gitHash" -ForegroundColor DarkGray }

$envPath = Join-Path $REPO "apps\api\.env"
Check "apps/api/.env exists" (Test-Path $envPath)

if (Test-Path $envPath) {
    $dbLine = Select-String -Path $envPath -Pattern '^DATABASE_URL=' | Select-Object -First 1
    Check "DATABASE_URL in .env" ($null -ne $dbLine)

    foreach ($v in @("CONTEST_REGISTRATION_DAY","CONTEST_REGISTRATION_MONTH","CONTEST_MAX_LOCAL_SPONSORS","CONTEST_MAX_MAJOR_SPONSORS","CONTEST_SEASON_NAME")) {
        $found = Select-String -Path $envPath -Pattern "^$v=" | Select-Object -First 1
        Check "Env var: $v" ($null -ne $found)
    }
}

# ── SECTION 2: LOCKED FILES UNTOUCHED ─────────────────────────────────────
Write-Host ""
Write-Host "▶ LOCKED FILES" -ForegroundColor Yellow
$lockedFiles = @(
    "apps\web\src\middleware.ts",
    "apps\api\src\app.module.ts",
    ".github\workflows\ci.yml"
)
foreach ($f in $lockedFiles) {
    $full = Join-Path $REPO $f
    Check "Locked file exists: $f" (Test-Path $full)
}

# ── SECTION 3: API BUILD ───────────────────────────────────────────────────
Write-Host ""
Write-Host "▶ API BUILD" -ForegroundColor Yellow
Write-Host "  → Building API (this may take 30–60 seconds)..." -ForegroundColor DarkGray
$apiBuild = & pnpm -C apps/api build 2>&1
$apiBuildPass = $LASTEXITCODE -eq 0
Check "API build passes" $apiBuildPass ($apiBuildPass ? "" : "Run: pnpm -C apps/api build")

# ── SECTION 4: WEB BUILD ───────────────────────────────────────────────────
Write-Host ""
Write-Host "▶ WEB BUILD" -ForegroundColor Yellow
Write-Host "  → Building Web (this may take 60–120 seconds)..." -ForegroundColor DarkGray
$webBuild = & pnpm -C apps/web build 2>&1
$webBuildPass = $LASTEXITCODE -eq 0
Check "Web build passes" $webBuildPass ($webBuildPass ? "" : "Run: pnpm -C apps/web build")

# ── SECTION 5: RUNTIME HEALTH (services must be running) ──────────────────
Write-Host ""
Write-Host "▶ RUNTIME HEALTH (requires API on :4000 and Web on :3001)" -ForegroundColor Yellow

try {
    $webRes = Invoke-WebRequest -UseBasicParsing http://localhost:3001/auth -TimeoutSec 5
    Check "Web server :3001 responding" ($webRes.StatusCode -eq 200)
} catch {
    Check "Web server :3001 responding" $false "Start web server: pnpm dev -- -p 3001"
}

try {
    $healthRes = Invoke-WebRequest -UseBasicParsing http://localhost:4000/api/healthz -TimeoutSec 5
    $healthJson = $healthRes.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
    Check "API /healthz = 200" ($healthRes.StatusCode -eq 200)
    Check "API healthz has build hash" ($null -ne $healthJson.build -or $healthJson -match "build")
} catch {
    Check "API /healthz = 200" $false "Start API: pnpm --filter tmi-platform-api start:dev"
    Check "API healthz has build hash" $false "API not running"
}

try {
    $readyRes = Invoke-WebRequest -UseBasicParsing http://localhost:4000/api/readyz -TimeoutSec 5
    Check "API /readyz = 200" ($readyRes.StatusCode -eq 200)
} catch {
    Check "API /readyz = 200" $false "API not running or not ready"
}

# ── SECTION 6: READINESS CONTRACT ─────────────────────────────────────────
Write-Host ""
Write-Host "▶ READINESS CONTRACT" -ForegroundColor Yellow
Write-Host "  → Running readiness contract test..." -ForegroundColor DarkGray
$readiness = & pnpm -C apps/api run test:readiness-contract 2>&1
$readinessPass = $LASTEXITCODE -eq 0
Check "Readiness contract passes" $readinessPass ($readinessPass ? "" : "Fix readiness contract before upload")

# ── SECTION 7: E2E TESTS ──────────────────────────────────────────────────
Write-Host ""
Write-Host "▶ E2E TESTS (requires both servers running)" -ForegroundColor Yellow

$e2eTests = @(
    "tests/e2e/phase13_5.spec.ts",
    "tests/e2e/phase14_onboarding.spec.ts",
    "tests/e2e/phase15_rbac_boundaries.spec.ts",
    "tests/e2e/phase15_4_api_guards.spec.ts",
    "tests/e2e/phase15_5_artist_admin.spec.ts"
)

foreach ($spec in $e2eTests) {
    $specPath = Join-Path $REPO $spec
    if (Test-Path $specPath) {
        $result = & pnpm -s exec playwright test $spec --workers=1 --reporter=dot 2>&1
        $specPass = $LASTEXITCODE -eq 0
        $specName = Split-Path $spec -Leaf
        Check "E2E: $specName" $specPass
    } else {
        Check "E2E spec exists: $spec" $false "Spec file not found"
    }
}

# Contest smoke (if exists)
$contestSmoke = "tests/e2e/contest.smoke.spec.ts"
if (Test-Path (Join-Path $REPO $contestSmoke)) {
    $result = & pnpm -s exec playwright test $contestSmoke --workers=1 --reporter=dot 2>&1
    Check "E2E: contest.smoke.spec.ts" ($LASTEXITCODE -eq 0)
} else {
    Write-Host "  ~ contest.smoke.spec.ts not yet placed (Wave 7)" -ForegroundColor DarkGray
}

# ── SECTION 8: KEY ROUTES ─────────────────────────────────────────────────
Write-Host ""
Write-Host "▶ KEY ROUTES" -ForegroundColor Yellow

$routes = @(
    @{url="http://localhost:3001/auth"; label="Web /auth"},
    @{url="http://localhost:4000/api/healthz"; label="API /healthz"},
    @{url="http://localhost:4000/api/readyz"; label="API /readyz"}
)

foreach ($route in $routes) {
    try {
        $r = Invoke-WebRequest -UseBasicParsing $route.url -TimeoutSec 5
        Check "$($route.label) = 200" ($r.StatusCode -eq 200)
    } catch {
        Check "$($route.label) = 200" $false "Not reachable"
    }
}

# ── SECTION 9: CI STATUS ──────────────────────────────────────────────────
Write-Host ""
Write-Host "▶ CI STATUS" -ForegroundColor Yellow
$ciPath = Join-Path $REPO ".github\workflows\ci.yml"
Check "CI workflow file exists" (Test-Path $ciPath)
Write-Host "  ~ CI green status must be verified manually on GitHub" -ForegroundColor DarkGray

# ── FINAL RESULT ──────────────────────────────────────────────────────────
Write-Host ""
Write-Host "══════════════════════════════════════════════════════" -ForegroundColor Cyan
$total = $PASS + $FAIL
Write-Host "  RESULT: $PASS/$total checks passed" -ForegroundColor ($FAIL -eq 0 ? "Green" : "Red")

if ($FAIL -eq 0) {
    Write-Host ""
    Write-Host "  ✅ ALL CHECKS PASSED — SAFE TO UPLOAD" -ForegroundColor Green
    Write-Host ""
    exit 0
} else {
    Write-Host ""
    Write-Host "  ❌ PROOF GATE FAILED — DO NOT UPLOAD YET" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Failed checks:" -ForegroundColor Red
    foreach ($f in $FAILURES) {
        Write-Host "    • $f" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "  Fix all failures then re-run this script." -ForegroundColor Yellow
    exit 1
}
