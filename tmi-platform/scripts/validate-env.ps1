# BerntoutGlobal XXL - Environment Variable Validator
# Save as tmi-platform/scripts/validate-env.ps1

param(
    [string]$ExampleFile = ".env.example",
    [string]$EnvFile = ".env.local",
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Environment Variable Validator" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$examplePath = $ExampleFile
$envPath = $EnvFile

# Check if example file exists
if (-not (Test-Path $examplePath)) {
    Write-Host "ERROR: Example file not found: $examplePath" -ForegroundColor Red
    exit 1
}

# Check if env file exists
$envExists = Test-Path $envPath
if (-not $envExists) {
    Write-Host "WARNING: .env.local not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item $examplePath $envPath
    Write-Host "Created $envPath from template. Please fill in your values." -ForegroundColor Green
    exit 0
}

# Parse example file
$exampleVars = @{}
Get-Content $examplePath | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
        $key = ($line -split "=")[0].Trim()
        $exampleVars[$key] = $true
    }
}

# Parse env file
$envVars = @{}
Get-Content $envPath | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
        $key = ($line -split "=")[0].Trim()
        $value = ($line -split "=", 2)[1].Trim()
        $envVars[$key] = $value
    }
}

Write-Host "Checking environment variables..." -ForegroundColor Cyan
Write-Host ""

$missing = @()
$empty = @()
$warnings = @()

foreach ($key in $exampleVars.Keys) {
    if (-not $envVars.ContainsKey($key)) {
        $missing += $key
    } elseif ([string]::IsNullOrWhiteSpace($envVars[$key])) {
        $empty += $key
    }
}

# Report missing variables
if ($missing.Count -gt 0) {
    Write-Host "MISSING VARIABLES:" -ForegroundColor Red
    foreach ($var in $missing) {
        Write-Host "  - $var" -ForegroundColor Red
    }
    Write-Host ""
}

# Report empty variables
if ($empty.Count -gt 0) {
    Write-Host "EMPTY VARIABLES:" -ForegroundColor Yellow
    foreach ($var in $empty) {
        Write-Host "  - $var" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Suggest common variables to add
$commonVars = @(
    "DATABASE_URL",
    "NEXTAUTH_SECRET",
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
)

foreach ($var in $commonVars) {
    if ($exampleVars.ContainsKey($var) -and -not $envVars.ContainsKey($var)) {
        $warnings += $var
    }
}

if ($warnings.Count -gt 0) {
    Write-Host "RECOMMENDED VARIABLES TO ADD:" -ForegroundColor Cyan
    foreach ($var in $warnings) {
        Write-Host "  + $var" -ForegroundColor Cyan
    }
    Write-Host ""
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total expected: $($exampleVars.Count)" -ForegroundColor White
Write-Host "Total found:    $($envVars.Count)" -ForegroundColor White
Write-Host "Missing:        $($missing.Count)" -ForegroundColor $(if ($missing.Count -eq 0) { "Green" } else { "Red" })
Write-Host "Empty:          $($empty.Count)" -ForegroundColor $(if ($empty.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host ""

if ($missing.Count -eq 0 -and $empty.Count -eq 0) {
    Write-Host "✅ Environment validation PASSED!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Environment validation FAILED!" -ForegroundColor Red
    Write-Host "Please fix the missing/empty variables and try again." -ForegroundColor Yellow
    exit 1
}
