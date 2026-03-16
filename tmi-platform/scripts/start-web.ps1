param(
    [int]$Port = 3001,
    [string]$WorkspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
    [switch]$SkipKill
)

$ErrorActionPreference = "Stop"

if (-not $SkipKill.IsPresent) {
    & (Join-Path $PSScriptRoot "kill-port.ps1") -Port $Port -Force
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
}

Set-Location $WorkspaceRoot
Write-Host "Starting web on port $Port"
pnpm -C apps/web run dev -- --port $Port
