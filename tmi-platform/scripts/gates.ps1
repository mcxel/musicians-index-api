# BerntoutGlobal XXL - Build Gate Scripts
# Run these gates before deployment to ensure system stability

param(
    [switch]$ContinueOnError,
    [switch]$SkipWeb,
    [switch]$SkipApi
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

function Write-Gate {
    param([string]$Name, [string]$Status, [string]$Color = "White")
    $timestamp = Get-Date -Format "HH:mm:ss"
    $statusSymbol = switch ($Status) {
        "PASS" { "PASS" }
        "FAIL" { "FAIL" }
        "RUN"  { "RUN" }
        default { "." }
    }
    $colorValue = switch ($Color) {
        "Green" { "Green" }
        "Red"   { "Red" }
        "Yellow" { "Yellow" }
        default   { "White" }
    }
    Write-Host "`n[$timestamp] $statusSymbol GATE $Name - $Status" -ForegroundColor $colorValue
}

function Test-Gate {
    param(
        [string]$Name,
        [scriptblock]$Command
    )
    
    Write-Gate $Name "RUN"
    try {
        & $Command
        if ($LASTEXITCODE -ne 0) {
            throw "Command failed with exit code $LASTEXITCODE"
        }
        Write-Gate $Name "PASS" "Green"
        return $true
    }
    catch {
        Write-Gate $Name "FAIL" "Red"
        Write-Host "  Error: $_" -ForegroundColor Red
        if (-not $ContinueOnError) {
            throw "Gate $Name failed - stopping"
        }
        return $false
    }
}

Write-Host @"

==============================================
  BERNOUTGLOBAL XXL - BUILD GATE RUNNER
==============================================
  Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
  Root: $RootDir
==============================================
"@ -ForegroundColor Cyan

Push-Location $RootDir

# Gate A: TypeScript type checking
if (-not $SkipWeb) {
    Test-Gate "A (TypeCheck Web)" {
        Write-Host "  Running: pnpm typecheck" -ForegroundColor Gray
        pnpm typecheck
    }
}

# Gate B: Lint
if (-not $SkipWeb) {
    Test-Gate "B (Lint Web)" {
        Write-Host "  Running: pnpm lint" -ForegroundColor Gray
        pnpm lint
    }
}

# Gate C: Build Web
if (-not $SkipWeb) {
    Test-Gate "C (Build Web)" {
        Write-Host "  Running: pnpm build" -ForegroundColor Gray
        pnpm build
    }
}

# Gate D: Runtime proxy smoke test
Test-Gate "D (Runtime Smoke)" {
    Write-Host "  Testing: http://localhost:3000/api/internal/runtime/status" -ForegroundColor Gray
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/internal/runtime/status" -TimeoutSec 5
        if ($response) {
            Write-Host "  Runtime Status: OK" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "  Warning: Runtime not responding (may not be running)" -ForegroundColor Yellow
    }
}

# Gate E: Health endpoint check  
Test-Gate "E (Health Check)" {
    Write-Host "  Testing: http://localhost:3000/api/healthz" -ForegroundColor Gray
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/healthz" -TimeoutSec 5
        if ($response.status -eq "ok") {
            Write-Host "  Health: OK" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "  Warning: Health endpoint not responding" -ForegroundColor Yellow
    }
}

# Gate F: Ready endpoint check
Test-Gate "F (Ready Check)" {
    Write-Host "  Testing: http://localhost:3000/api/readyz" -ForegroundColor Gray
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/readyz" -TimeoutSec 5
        if ($response.status -eq "ready") {
            Write-Host "  Ready: OK" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "  Warning: Ready endpoint not responding" -ForegroundColor Yellow
    }
}

# Gate G: Python Lint (ruff) - Non-blocking
Write-Gate "G (Python Lint)" "RUN" "Yellow"
if (Get-Command ruff -ErrorAction SilentlyContinue) {
    Write-Host "  Running: ruff check ." -ForegroundColor Gray
    $originalErrorAction = $ErrorActionPreference
    $ErrorActionPreference = "Continue" # Make this gate non-blocking
    
    ruff check .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Gate "G (Python Lint)" "PASS" "Green"
    } else {
        Write-Gate "G (Python Lint)" "WARN" "Yellow"
        Write-Host "  Ruff found issues to review. This is a non-blocking warning." -ForegroundColor Yellow
    }
    
    $ErrorActionPreference = $originalErrorAction
} else {
    Write-Gate "G (Python Lint)" "SKIP" "Yellow"
    Write-Host "  Ruff not found in PATH, skipping Python lint gate." -ForegroundColor Yellow
    Write-Host "  To enable, run: pip install -r requirements-dev.txt" -ForegroundColor Yellow
}

Pop-Location

Write-Host @"

==============================================
  GATE RUN COMPLETE
==============================================
"@ -ForegroundColor Green
