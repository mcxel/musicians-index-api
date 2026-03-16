# Build script with logging
$ErrorActionPreference = "Continue"
$projectRoot = "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\web"

# Create logs directory
$logDir = "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\_logs"
if (!(Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# Run build
$logFile = Join-Path $logDir "web-build-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"

Write-Host "Starting build..."
Write-Host "Log file: $logFile"

Push-Location "C:\Users\Admin\Documents\BerntoutGlobal XXL"
try {
    pnpm -C "tmi-platform\apps\web" build 2>&1 | Tee-Object -FilePath $logFile
}
finally {
    Pop-Location
}

Write-Host ""
Write-Host "===== BUILD OUTPUT (last 120 lines) ====="
Get-Content $logFile -Tail 120
