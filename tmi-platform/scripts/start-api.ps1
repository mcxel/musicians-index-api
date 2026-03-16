param(
    [int]$Port = 4000,
    [string]$WorkspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

$ErrorActionPreference = "Stop"

function Import-EnvFile {
    param([Parameter(Mandatory = $true)][string]$FilePath)

    if (-not (Test-Path $FilePath)) {
        return
    }

    foreach ($line in Get-Content -Path $FilePath) {
        $trimmed = $line.Trim()
        if (-not $trimmed -or $trimmed.StartsWith("#") -or -not $trimmed.Contains("=")) {
            continue
        }

        $parts = $trimmed.Split("=", 2)
        $key = $parts[0].Trim()
        $value = $parts[1].Trim()
        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        Set-Item -Path "env:$key" -Value $value
    }
}

& (Join-Path $PSScriptRoot "check-env-sync.ps1") -WorkspaceRoot $WorkspaceRoot
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Import-EnvFile -FilePath (Join-Path $WorkspaceRoot ".env")
Import-EnvFile -FilePath (Join-Path $WorkspaceRoot "apps/api/.env")

if ([string]::IsNullOrWhiteSpace($env:DATABASE_URL)) {
    Write-Host "DATABASE_URL is missing after env load." -ForegroundColor Red
    exit 1
}

$env:PORT = "$Port"

Set-Location $WorkspaceRoot
Write-Host "Starting API on port $Port"
Write-Host "DATABASE_URL=$($env:DATABASE_URL)"
pnpm -C apps/api run start:dev
