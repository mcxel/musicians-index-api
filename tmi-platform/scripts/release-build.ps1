# BerntoutGlobal XXL - Release Build Script
# Save as tmi-platform/scripts/release-build.ps1

param(
    [switch]$SkipGates,
    [switch]$SkipTests,
    [switch]$InnoSetup,
    [string]$Version = "1.0.0"
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logDir = Join-Path $PSScriptRoot "..\_logs"
$releaseDir = Join-Path $PSScriptRoot "..\releases"

# Ensure directories exist
New-Item -ItemType Directory -Force $logDir | Out-Null
New-Item -ItemType Directory -Force $releaseDir | Out-Null

function Write-Step {
    param([string]$Message)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Write-Status {
    param([string]$Message, [string]$Color = "White")
    Write-Host "  $Message" -ForegroundColor $Color
}

function Run-Command {
    param(
        [string]$Name,
        [string]$Command,
        [string]$WorkingDir
    )
    
    $logFile = Join-Path $logDir "$Name-$timestamp.txt"
    Write-Status "Running: $Command" "Yellow"
    Write-Status "Log: $logFile" "Gray"
    
    try {
        $process = Start-Process -FilePath "powershell" -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $Command -WorkingDirectory $WorkingDir -PassThru -Wait -NoNewWindow
        $exitCode = $process.ExitCode
        
        if ($exitCode -eq 0) {
            Write-Status "✅ PASSED" "Green"
            return $true
        } else {
            Write-Status "❌ FAILED (Exit: $exitCode)" "Red"
            return $false
        }
    } catch {
        Write-Status "❌ ERROR: $_" "Red"
        return $false
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  BerntoutGlobal XXL Release Builder" -ForegroundColor Magenta
Write-Host "  Version: $Version" -ForegroundColor Magenta
Write-Host "  Timestamp: $timestamp" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# Step 1: Run Gates
if (-not $SkipGates) {
    Write-Step "Running Build Gates"
    $gatesPassed = Run-Command "gates" "cd ..; .\scripts\gates.ps1" (Join-Path $PSScriptRoot "..")
    
    if (-not $gatesPassed) {
        Write-Host "`n❌ GATES FAILED - Cannot proceed with release!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Status "Skipping gates (--SkipGates)" "Yellow"
}

# Step 2: Build Web App
Write-Step "Building Web Application"
$buildPassed = Run-Command "build-web" "pnpm -C apps/web build" (Join-Path $PSScriptRoot "..")

if (-not $buildPassed) {
    Write-Host "`n❌ BUILD FAILED - Cannot proceed with release!" -ForegroundColor Red
    exit 1
}

# Step 3: Run Tests (optional)
if (-not $SkipTests) {
    Write-Step "Running Tests"
    $testsPassed = Run-Command "tests" "pnpm -C apps/web test --passWithNoTests" (Join-Path $PSScriptRoot "..")
    
    if (-not $testsPassed) {
        Write-Host "`n⚠️  Tests failed, but continuing with release..." -ForegroundColor Yellow
    }
} else {
    Write-Status "Skipping tests (--SkipTests)" "Yellow"
}

# Step 4: Prepare Standalone Output
Write-Step "Preparing Release Artifacts"

$outputDir = Join-Path $releaseDir "berntout-xxl-$Version-$timestamp"
New-Item -ItemType Directory -Force $outputDir | Out-Null

# Copy build output
$buildOutput = Join-Path $PSScriptRoot "..\apps\web\.next\standalone"
if (Test-Path $buildOutput) {
    Copy-Item -Path "$buildOutput\*" -Destination $outputDir -Recurse -Force
    Write-Status "Copied standalone build" "Green"
} else {
    Write-Status "Standalone build not found, using default output" "Yellow"
}

# Copy static files
$staticOutput = Join-Path $PSScriptRoot "..\apps\web\.next\static"
if (Test-Path $staticOutput) {
    $staticDir = Join-Path $outputDir "static"
    New-Item -ItemType Directory -Force $staticDir | Out-Null
    Copy-Item -Path "$staticOutput\*" -Destination $staticDir -Recurse -Force
    Write-Status "Copied static files" "Green"
}

# Copy runtime files
Copy-Item -Path (Join-Path $PSScriptRoot "..\api_server.py") -Destination $outputDir -Force
Copy-Item -Path (Join-Path $PSScriptRoot "..\program") -Destination $outputDir -Recurse -Force
Write-Status "Copied runtime files" "Green"

# Copy env template
Copy-Item -Path (Join-Path $PSScriptRoot "..\apps\web\.env.example") -Destination (Join-Path $outputDir ".env.example") -Force

Write-Status "Release artifacts prepared: $outputDir" "Green"

# Step 5: Build Inno Setup Installer (optional)
if ($InnoSetup) {
    Write-Step "Building Inno Setup Installer"
    
    $issFile = Join-Path $PSScriptRoot "..\installer\setup.iss"
    $isccPath = "C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
    
    if (Test-Path $isccPath) {
        $installerOutput = Join-Path $releaseDir "BerntoutGlobalXXL-Setup-$Version.exe"
        $buildPassed = Run-Command "inno" """$isccPath"" ""$issFile""" (Join-Path $PSScriptRoot "..")
        
        if ($buildPassed) {
            Write-Status "Installer built: $installerOutput" "Green"
        } else {
            Write-Status "Installer build failed, but release is ready" "Yellow"
        }
    } else {
        Write-Status "Inno Setup not found at: $isccPath" "Yellow"
        Write-Status "Install Inno Setup to build the installer" "Yellow"
    }
}

# Step 6: Mandatory canonical pipeline promotion gate (build/readiness/promotion + decision contract)
Write-Step "Promotion Gate (Canonical Pipeline Decision Contract)"
$pipelineGatePassed = Run-Command "pipeline-promotion-gate" "node scripts/pipeline-promotion-gate.js" (Join-Path $PSScriptRoot "..")
if (-not $pipelineGatePassed) {
    Write-Host "`n❌ CANONICAL PIPELINE GATE FAILED - Cannot proceed with release promotion!" -ForegroundColor Red
    exit 1
}

# Summary
Write-Step "Release Complete"
Write-Host ""
Write-Host "  Version:      $Version" -ForegroundColor White
Write-Host "  Timestamp:    $timestamp" -ForegroundColor White
Write-Host "  Output:       $outputDir" -ForegroundColor White
Write-Host ""
Write-Host "  ✅ Release build SUCCESSFUL!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review the release in: $outputDir" -ForegroundColor Gray
Write-Host "  2. Deploy to hosting (Cloudflare/IONOS)" -ForegroundColor Gray
Write-Host "  3. Run: powershell .\scripts\validate-env.ps1" -ForegroundColor Gray
Write-Host ""
