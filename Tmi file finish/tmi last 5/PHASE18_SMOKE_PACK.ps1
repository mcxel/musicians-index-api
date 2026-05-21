# PHASE18_SMOKE_PACK.ps1
# TMI Platform — BerntoutGlobal XXL
# Captures upload evidence — run after proof gate passes.
# Creates timestamped evidence folder with all health/route outputs.
# Usage: .\PHASE18_SMOKE_PACK.ps1

$TIMESTAMP = Get-Date -Format "yyyy-MM-dd_HH-mm"
$EVIDENCE_DIR = "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\docs\upload-evidence\$TIMESTAMP"
$API = "http://localhost:4000"
$WEB = "http://localhost:3001"

New-Item -ItemType Directory -Path $EVIDENCE_DIR -Force | Out-Null

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   TMI Upload Smoke Pack Capture (Phase 18.6)     ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "  Evidence folder: $EVIDENCE_DIR" -ForegroundColor DarkGray
Write-Host ""

$REPORT = @()
$REPORT += "TMI PLATFORM — UPLOAD SMOKE PACK"
$REPORT += "BerntoutGlobal XXL"
$REPORT += "Captured: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$REPORT += "Git commit: $(git rev-parse HEAD 2>$null)"
$REPORT += ""
$REPORT += "═══════════════════════════════════════"

# ── Health checks ─────────────────────────────────────────────────────────
Write-Host "→ Capturing health endpoints..." -ForegroundColor Cyan

foreach ($endpoint in @(
    @{url="$API/api/healthz"; name="healthz"},
    @{url="$API/api/readyz"; name="readyz"}
)) {
    try {
        $r = Invoke-WebRequest -UseBasicParsing $endpoint.url -TimeoutSec 10
        $REPORT += ""
        $REPORT += "[$($endpoint.name)] STATUS: $($r.StatusCode)"
        $REPORT += $r.Content
        Write-Host "  ✓ $($endpoint.name): $($r.StatusCode)" -ForegroundColor Green
    } catch {
        $REPORT += "[$($endpoint.name)] FAIL: $_"
        Write-Host "  ✗ $($endpoint.name): FAILED" -ForegroundColor Red
    }
}

# ── Web routes ────────────────────────────────────────────────────────────
Write-Host "→ Capturing web routes..." -ForegroundColor Cyan
$REPORT += ""
$REPORT += "WEB ROUTES"

foreach ($route in @("/auth", "/contest", "/contest/rules", "/contest/leaderboard", "/contest/qualify", "/contest/sponsors")) {
    try {
        $r = Invoke-WebRequest -UseBasicParsing "$WEB$route" -TimeoutSec 10
        $REPORT += "  $route: $($r.StatusCode)"
        Write-Host "  ✓ $route: $($r.StatusCode)" -ForegroundColor Green
    } catch {
        $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { "ERR" }
        $REPORT += "  $route: $status"
        $color = if ($status -eq 302 -or $status -eq 307) { "Yellow" } else { "Red" }
        Write-Host "  $route: $status" -ForegroundColor $color
    }
}

# ── Admin redirect test ───────────────────────────────────────────────────
Write-Host "→ Verifying admin guard..." -ForegroundColor Cyan
try {
    $r = Invoke-WebRequest -UseBasicParsing "$WEB/contest/admin" -TimeoutSec 10 -MaximumRedirection 0 -ErrorAction SilentlyContinue
    $adminStatus = $r.StatusCode
} catch {
    $adminStatus = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { "ERR" }
}
$adminGuardPass = ($adminStatus -eq 302 -or $adminStatus -eq 307 -or $adminStatus -eq 401)
$REPORT += ""
$REPORT += "ADMIN GUARD: /contest/admin returned $adminStatus (expected 30x or 401)"
Write-Host "  Admin guard: $adminStatus $(if($adminGuardPass){'✓'}else{'✗ — admin may be unguarded'})" -ForegroundColor ($adminGuardPass ? "Green" : "Red")

# ── Build info ────────────────────────────────────────────────────────────
$REPORT += ""
$REPORT += "BUILD INFO"
$REPORT += "Git commit: $(git rev-parse HEAD 2>$null)"
$REPORT += "Git branch: $(git rev-parse --abbrev-ref HEAD 2>$null)"
$REPORT += "Node: $(node --version 2>$null)"
$REPORT += "pnpm: $(pnpm --version 2>$null)"
$REPORT += "Captured at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# ── Write report ──────────────────────────────────────────────────────────
$reportPath = "$EVIDENCE_DIR\smoke-pack-report.txt"
$REPORT | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host ""
Write-Host "✓ Smoke pack saved to: $reportPath" -ForegroundColor Green
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  NEXT: Take screenshots of the following in your browser:" -ForegroundColor Yellow
Write-Host "  → http://localhost:4000/api/healthz" -ForegroundColor White
Write-Host "  → http://localhost:3001/auth" -ForegroundColor White
Write-Host "  → http://localhost:3001/contest" -ForegroundColor White
Write-Host "  → http://localhost:3001/contest/rules" -ForegroundColor White
Write-Host "  → Terminal showing all E2E tests passing" -ForegroundColor White
Write-Host "  Save screenshots to: $EVIDENCE_DIR" -ForegroundColor DarkGray
Write-Host ""
