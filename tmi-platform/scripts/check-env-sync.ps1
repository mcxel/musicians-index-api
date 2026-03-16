param(
    [string]$WorkspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

$ErrorActionPreference = "Stop"

function Get-EnvValue {
    param(
        [Parameter(Mandatory = $true)][string]$FilePath,
        [Parameter(Mandatory = $true)][string]$Key
    )

    if (-not (Test-Path $FilePath)) {
        return $null
    }

    foreach ($line in Get-Content -Path $FilePath) {
        $trimmed = $line.Trim()
        if (-not $trimmed -or $trimmed.StartsWith("#")) {
            continue
        }

        if ($trimmed -match "^$([regex]::Escape($Key))\s*=\s*(.*)$") {
            $value = $matches[1].Trim()
            if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            return $value
        }
    }

    return $null
}

$targets = @(
    @{ Name = "root"; Path = (Join-Path $WorkspaceRoot ".env") },
    @{ Name = "apps/api"; Path = (Join-Path $WorkspaceRoot "apps/api/.env") },
    @{ Name = "packages/db"; Path = (Join-Path $WorkspaceRoot "packages/db/.env") }
)

$values = @{}
$missing = @()

foreach ($target in $targets) {
    $value = Get-EnvValue -FilePath $target.Path -Key "DATABASE_URL"
    if ([string]::IsNullOrWhiteSpace($value)) {
        $missing += $target.Name
        Write-Host "[$($target.Name)] DATABASE_URL=<missing>" -ForegroundColor Red
        continue
    }

    $values[$target.Name] = $value
    Write-Host "[$($target.Name)] DATABASE_URL=$value"
}

if ($missing.Count -gt 0) {
    Write-Host "Missing DATABASE_URL in: $($missing -join ', ')" -ForegroundColor Red
    exit 1
}

$distinct = $values.Values | Sort-Object -Unique
if ($distinct.Count -ne 1) {
    Write-Host "DATABASE_URL mismatch detected across env files." -ForegroundColor Red
    exit 1
}

Write-Host "DATABASE_URL is synced across root/apps/api/packages/db." -ForegroundColor Green
exit 0
