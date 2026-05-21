# PHASE18_RESTORE.ps1
# TMI Platform — BerntoutGlobal XXL
# One-command local restore. Run this at the start of any session.
# Usage: Right-click → Run with PowerShell  OR  paste into PowerShell terminal

param(
  [switch]$SkipInstall,
  [switch]$APIOnly,
  [switch]$WebOnly,
  [switch]$Verbose
)

$REPO = "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform"
$STABLE_CHECKPOINT = "21aa9b2"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   TMI Platform — Local Restore (Phase 18.0)      ║" -ForegroundColor Cyan
Write-Host "║   BerntoutGlobal XXL                             ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Verify repo exists ─────────────────────────────────────────────
if (-not (Test-Path $REPO)) {
    Write-Host "✗ REPO NOT FOUND: $REPO" -ForegroundColor Red
    Write-Host "  Check path and run again." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Repo found" -ForegroundColor Green

# ── Step 2: Navigate to repo ───────────────────────────────────────────────
Set-Location $REPO
Write-Host "✓ Working directory: $REPO" -ForegroundColor Green

# ── Step 3: Verify git state ────────────────────────────────────────────────
$gitStatus = git status --porcelain 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Git not available or not a git repo." -ForegroundColor Red
    exit 1
}
$currentHash = git rev-parse --short HEAD 2>$null
Write-Host "✓ Current git commit: $currentHash" -ForegroundColor Green

if ($gitStatus) {
    Write-Host "⚠  Uncommitted changes detected. Consider: git stash" -ForegroundColor Yellow
}

# ── Step 4: Install dependencies (unless skipped) ─────────────────────────
if (-not $SkipInstall) {
    Write-Host ""
    Write-Host "→ Installing dependencies..." -ForegroundColor Cyan
    pnpm install --frozen-lockfile 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠  pnpm install had warnings. Trying without frozen-lockfile..." -ForegroundColor Yellow
        pnpm install 2>&1 | Out-Null
    }
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚡ Skipping install (--SkipInstall)" -ForegroundColor Yellow
}

# ── Step 5: Load and verify DATABASE_URL from apps/api/.env ───────────────
Write-Host ""
Write-Host "→ Loading env from apps/api/.env..." -ForegroundColor Cyan

$envPath = Join-Path $REPO "apps\api\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "✗ apps/api/.env not found at: $envPath" -ForegroundColor Red
    Write-Host "  Create this file with DATABASE_URL and required env vars." -ForegroundColor Red
    exit 1
}

$dbLine = Select-String -Path $envPath -Pattern '^DATABASE_URL=' | Select-Object -First 1
if (-not $dbLine) {
    Write-Host "✗ DATABASE_URL not found in apps/api/.env" -ForegroundColor Red
    exit 1
}
$env:DATABASE_URL = $dbLine.Line.Substring(13).Trim('"')
$env:PORT = "4000"
Write-Host "✓ DATABASE_URL loaded" -ForegroundColor Green

# ── Step 6: Verify contest env vars ────────────────────────────────────────
$contestEnvVars = @("CONTEST_REGISTRATION_DAY", "CONTEST_REGISTRATION_MONTH", "CONTEST_MAX_LOCAL_SPONSORS", "CONTEST_MAX_MAJOR_SPONSORS")
$missingVars = @()
foreach ($varName in $contestEnvVars) {
    $line = Select-String -Path $envPath -Pattern "^$varName=" | Select-Object -First 1
    if (-not $line) { $missingVars += $varName }
}
if ($missingVars.Count -gt 0) {
    Write-Host "⚠  Missing contest env vars: $($missingVars -join ', ')" -ForegroundColor Yellow
    Write-Host "   Add to apps/api/.env before running contest endpoints." -ForegroundColor Yellow
} else {
    Write-Host "✓ Contest env vars present" -ForegroundColor Green
}

# ── Step 7: Print startup commands ────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║   OPEN 2 MORE TERMINALS AND RUN THESE:           ║" -ForegroundColor Yellow
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""
Write-Host "─── TERMINAL 1 (API) ───────────────────────────────" -ForegroundColor Cyan
Write-Host 'Set-Location "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform"' -ForegroundColor White
Write-Host '$dbLine = Select-String -Path apps\api\.env -Pattern "^DATABASE_URL=" | Select-Object -First 1' -ForegroundColor White
Write-Host '$env:DATABASE_URL = $dbLine.Line.Substring(13).Trim('"'"'\"'"'"')' -ForegroundColor White
Write-Host '$env:PORT = "4000"' -ForegroundColor White
Write-Host 'pnpm --filter tmi-platform-api start:dev' -ForegroundColor White
Write-Host ""
Write-Host "─── TERMINAL 2 (WEB) ───────────────────────────────" -ForegroundColor Cyan
Write-Host 'Set-Location "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\web"' -ForegroundColor White
Write-Host 'pnpm dev -- -p 3001' -ForegroundColor White
Write-Host ""
Write-Host "─── HEALTH CHECK (after both servers start) ────────" -ForegroundColor Cyan
Write-Host 'try { (Invoke-WebRequest -UseBasicParsing http://localhost:3001/auth).StatusCode } catch { $_.Exception.Message }' -ForegroundColor White
Write-Host 'try { (Invoke-WebRequest -UseBasicParsing http://localhost:4000/api/healthz).Content } catch { $_.Exception.Message }' -ForegroundColor White
Write-Host 'try { (Invoke-WebRequest -UseBasicParsing http://localhost:4000/api/readyz).Content } catch { $_.Exception.Message }' -ForegroundColor White
Write-Host ""

# ── Step 8: Rollback note ─────────────────────────────────────────────────
Write-Host "─── ROLLBACK (if anything is broken) ──────────────" -ForegroundColor Red
Write-Host "git stash" -ForegroundColor White
Write-Host "git checkout $STABLE_CHECKPOINT" -ForegroundColor White
Write-Host ""
Write-Host "✓ Restore script complete. Start your servers above." -ForegroundColor Green
Write-Host ""
